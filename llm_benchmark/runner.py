from collections.abc import Callable

from .history import build_run_file, cleanup_outdated_runs, save_run
from .logging import logger
from .metrics import compute_time_for_results
from .persistence import save_project_results
from .samples import Sample, load_samples
from .schema import (
    MetricOverrides,
    ModelKind,
    ModelRun,
    ModelSpec,
    RunStatus,
    TaskConfig,
    filter_by_project_type,
)
from .scoring import dispatch_scoring
from .settings import PROJECTS_DIR
from .sources import run_source


class Runner:
    """Backbone for the evaluation pipeline.

    On construction eagerly loads every ``Project-jsonl/*/config.yaml`` +
    dataset into a validated :class:`TaskConfig` and DataFrame (failures are
    logged + skipped).

    Public API: ``evaluate(projects, models) -> {model_id: {project: ModelRun}}``.
    """

    def __init__(self):
        self._task_configs: dict[str, TaskConfig] = {}
        self._project_samples: dict[str, list[Sample]] = {}
        self._load_all_projects()

        logger.info("Runner initialised — task_configs=%d", len(self._task_configs))

    def _load_all_projects(self) -> None:
        task_configs: dict[str, TaskConfig] = {}
        project_samples: dict[str, list[Sample]] = {}
        project_dirs = sorted(p for p in PROJECTS_DIR.iterdir() if p.is_dir() and (p / "config.yaml").exists())

        for project_dir in project_dirs:
            name = project_dir.name
            cfg = TaskConfig.from_yaml(project_dir / "config.yaml")
            if cfg is None:
                logger.error(f"{name} project got some issue, please check.")
                continue

            task_configs[name] = cfg
            try:
                project_samples[name] = load_samples(name, cfg, project_dir / "dataset" / "dataset.jsonl")
            except Exception as exc:
                logger.error("Dataset load failed project=%s: %s", name, exc, exc_info=True)

        self._task_configs = task_configs
        self._project_samples = project_samples

    def reload_project_configs(self) -> dict[str, TaskConfig]:
        """
        Rescan ``PROJECTS_DIR`` and rebuild the TaskConfig and dataset cache.
        """
        self._load_all_projects()
        logger.info("Runner.reload_project_configs — count=%d", len(self._task_configs))

        return dict(self._task_configs)

    def task_configs(self) -> dict[str, TaskConfig]:
        """
        Return a read-only copy of the eagerly-loaded TaskConfig cache.
        """
        return dict(self._task_configs)

    def evaluate(
        self,
        projects: list[str],
        models: list[ModelSpec],
        progress_callback: Callable[[str, int, int], None] | None = None,
        *,
        metric_overrides: MetricOverrides | None = None,
    ) -> dict[str, dict[str, ModelRun]]:
        """
        Run the evaluation pipeline.

        Returns a model-major dict: ``{model_id: {project: ModelRun}}``.
        """
        total = len(projects)

        if progress_callback:
            progress_callback("starting", 0, total)

        specs_by_id = {m.id: m for m in models}
        custom_specs = [m for m in models if m.kind == ModelKind.CUSTOM]
        logger.info(
            "Runner.evaluate — projects=%s models=%d (builtins=%d, custom=%d)",
            projects,
            len(models),
            len(models) - len(custom_specs),
            len(custom_specs),
        )
        per_project: dict[str, dict[str, ModelRun]] = {}
        for i, project in enumerate(projects):
            per_project[project] = self._evaluate_project(
                project,
                specs_by_id,
                progress_callback=progress_callback,
                project_index=i,
                total=total,
                use_ragas=bool(metric_overrides and metric_overrides.use_ragas),
                engine=(metric_overrides.engine if metric_overrides else "custom"),
            )
            if progress_callback:
                progress_callback("project_done", i + 1, total)

        results: dict[str, dict[str, ModelRun]] = {m.id: {} for m in models}
        for project, runs in per_project.items():
            for model_id, run in runs.items():
                results.setdefault(model_id, {})[project] = run

        return results

    def _evaluate_project(
        self,
        project: str,
        specs_by_id: dict[str, ModelSpec],
        progress_callback: Callable[[str, int, int], None] | None = None,
        project_index: int = 0,
        total: int = 1,
        use_ragas: bool = False,
        engine: str = "custom",
    ) -> dict[str, ModelRun]:
        try:
            config = self._task_configs[project]
            samples = self._project_samples[project]
        except KeyError:
            logger.error("Project not pre-loaded project=%s", project)
            return {id: ModelRun(status=RunStatus.ERROR, error=f"project_not_loaded: {project}") for id in specs_by_id}

        # 7-day lazy cleanup before producing a fresh run.
        task_dir = PROJECTS_DIR / project / "output"
        try:
            cleanup_outdated_runs(task_dir)
        except Exception as exc:
            logger.warning("History cleanup failed project=%s: %s", project, exc)

        runs: dict[str, ModelRun] = {}
        compatible, incompatible = filter_by_project_type(specs_by_id, config.type, config.source)

        for spec in incompatible:
            runs[spec.id] = ModelRun(
                status=RunStatus.SKIPPED,
                reason=f"model_type {spec.model_type.value} mismatch with project type {config.type}",
            )

        try:
            if progress_callback:
                progress_callback("inference", project_index, total)

            results_by_model = run_source(config, samples, compatible)

        except Exception as exc:
            logger.error("Inference failed project=%s: %s", project, exc, exc_info=True)
            for spec in compatible:
                runs[spec.id] = ModelRun(status=RunStatus.ERROR, error=f"inference_failed: {exc}")

            save_project_results(project, runs, specs_by_id)

            return runs

        perf_by_model = compute_time_for_results(results_by_model)

        if progress_callback:
            progress_callback("scoring", project_index, total)
        try:
            scores_by_model = dispatch_scoring(
                results_by_model,
                config,
                project,
                specs_by_id,
                use_ragas=use_ragas,
                engine=engine,
            )
        except Exception as exc:
            logger.error("Scoring failed project=%s: %s", project, exc, exc_info=True)
            scores_by_model = {mid: {} for mid in results_by_model}

        for spec in compatible:
            mid = spec.id
            score = dict(scores_by_model.get(mid, {}))
            iou_detail = score.pop("per_sample_iou_detail", None)
            result = dict(results_by_model.get(mid, {}))
            if iou_detail is not None:
                result["per_sample_iou_detail"] = iou_detail
            runs[mid] = ModelRun(
                status=RunStatus.OK,
                score=score,
                perf=perf_by_model.get(mid, {}),
                result=result,
            )

        save_project_results(project, runs, specs_by_id)

        # Persist run-based history snapshot (best-effort; never block evaluate).
        try:
            run_file = build_run_file(
                project=project,
                config=config,
                samples=samples,
                runs_by_model=runs,
                specs_by_id=specs_by_id,
            )
            if run_file is not None:
                save_run(task_dir, run_file)
        except Exception as exc:
            logger.error("History run persist failed project=%s: %s", project, exc, exc_info=True)

        return runs
