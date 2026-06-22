"""ROI / bounding-box metric helpers (formerly llm_benchmark.service.roi_service)."""

from devtools.geometry import BoundingBox, iou
from PIL import Image


def polygon_to_bbox(points: list[list[int]]) -> list[int]:
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    x1, y1 = min(xs), min(ys)
    x2, y2 = max(xs), max(ys)

    return [x1, y1, x2, y2]


def resize_vlm_response(vlm_response: dict, resize: tuple[int, int], image_path: str) -> dict:
    """Transform VLM response coordinates back to original image space.

    Formula: actual_coord = vlm_coord / resize_dim * original_image_dim
    """
    image = Image.open(image_path)
    img_w, img_h = image.size
    resize_x, resize_y = resize
    transformed: dict = {}
    for key, coords in vlm_response.items():
        if coords is None:
            transformed[key] = None
            continue

        x1 = round(coords[0] / resize_x * img_w)
        y1 = round(coords[1] / resize_y * img_h)
        x2 = round(coords[2] / resize_x * img_w)
        y2 = round(coords[3] / resize_y * img_h)
        transformed[key] = [x1, y1, x2, y2]

    return transformed


def normalize_box(box: list, img_w: int, img_h: int, model_space: str) -> list[int]:
    """Convert box coords to absolute pixel [x1,y1,x2,y2]."""
    if model_space == "normalized":
        if img_w == 0 or img_h == 0:
            raise ValueError(f"Cannot normalize box: image dimensions are zero ({img_w}x{img_h})")
        return [round(box[0] * img_w), round(box[1] * img_h), round(box[2] * img_w), round(box[3] * img_h)]
    if model_space == "resized":
        # already handled by resize_vlm_response; this is a no-op fallback
        return [round(c) for c in box]
    return [round(c) for c in box]  # absolute


def calculate_roi_accuracy(
    vlm_response: dict, ground_truth: dict, iou_threshold: float
) -> tuple[float, dict[str, dict]]:
    """Return (accuracy, per_key_detail) where per_key_detail maps each key to
    {"iou": float, "pred_bbox": list[int], "gt_bbox": list[int], "matched": bool}."""
    correct_count = 0
    total_count = len(vlm_response)
    per_key_detail: dict[str, dict] = {}

    for key in vlm_response:
        gt_bbox = polygon_to_bbox(ground_truth[key])
        pred_bbox = vlm_response[key]

        if pred_bbox is None:
            per_key_detail[key] = {
                "iou": 0.0,
                "pred_bbox": None,
                "gt_bbox": gt_bbox,
                "matched": False,
            }
            continue

        gt_box = BoundingBox.from_xyxy(*gt_bbox)
        pred_box = BoundingBox.from_xyxy(*pred_bbox)
        iou_score = float(iou(gt_box, pred_box))
        per_key_detail[key] = {
            "iou": iou_score,
            "pred_bbox": pred_bbox,
            "gt_bbox": gt_bbox,
            "matched": iou_score >= iou_threshold,
        }

        if iou_score >= iou_threshold:
            correct_count += 1

    return correct_count / total_count if total_count > 0 else 0.0, per_key_detail
