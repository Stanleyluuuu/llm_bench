# LLM-Benchmark

## Description

LLM Benchmark Platform for comparing LLM, VLM, Flowise, and CustomAPI model variants on per-project benchmarks (text and vision).

## Installation

### Clone

```bash
git clone https://github.com/garmin-tw-mfg-eng/LLM-Benchmark
cd LLM-Benchmark
```

## Image

```bash
docker build -t linxpa-peprdharbor00.garmin.com/ai/llm_benchmark:${TAG:?} .
```

## Run container

- Production

    ```bash
    docker-compose -p LLM-Benchmark-prod -f deploy/docker-compose.prod.yaml --project-directory . up -d
    ```

- Development

    ```bash
    docker-compose -p LLM-Benchmark-devel -f deploy/docker-compose.devel.yaml --project-directory . up -d
    ```

## Stop container

- Production

    ```bash
    docker-compose -p LLM-Benchmark-prod -f deploy/docker-compose.prod.yaml --project-directory . down
    ```

- Development

    ```bash
    docker-compose -p LLM-Benchmark-devel -f deploy/docker-compose.devel.yaml --project-directory . down
    ```

## Harbor

```bash
docker login https://linxpa-peprdharbor00.garmin.com/
docker push linxpa-peprdharbor00.garmin.com/ai/llm_benchmark:${TAG:?}
```

## Support

- <a href="https://github.com/lustanleykw_grmn">lustanleykw</a>
- <a href="https://github.com/changalexcc_grmn">changalexcc</a>
