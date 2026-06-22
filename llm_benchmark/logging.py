import datetime

import pytz
import structlog
from dslog.adapter.structlog import DSLogProcessor
from dslog.endpoint.kafka import KafkaEndpoint

from .settings import env


def rgb_to_ansi(r: int, g: int, b: int) -> str:
    """Transform RGB color to an ANSI escape sequence."""
    return f"\x1b[38;2;{r};{g};{b}m"


def hex_to_ansi(hex_color: str) -> str:
    """Transform HEX color to an ANSI escape sequence."""
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)

    return rgb_to_ansi(r, g, b)


def get_color(color: str | tuple[int, int, int]) -> str:
    if isinstance(color, str) and color.startswith("#"):
        return hex_to_ansi(color)
    elif isinstance(color, tuple) and len(color) == 3:
        return rgb_to_ansi(*color)

    return color


def add_color_and_style(_, __, event_dict):
    """Custom formatter to add color based on log level. Supports RGB and HEX."""
    colors = {
        "debug": "#8BC34A",
        "info": "#42A5F5",
        "warning": "#FBC02D",
        "error": "#D32F2F",
        "critical": "#FF9E80",
    }
    level = event_dict.get("level", "").lower()
    if "level" in event_dict:
        level_color = get_color(colors.get(level, "#FFFFFF"))
        event_dict["level"] = f"{level_color}{event_dict['level']}\x1b[0m"
    message_color = get_color(colors.get(level, "#FFFFFF"))
    event_dict["event"] = f"{message_color}{event_dict.get('event', '')}\x1b[0m"

    return event_dict


def taipei_timestamper(_, __, event_dict):
    """Generate timestamp using Taipei time zone."""
    taipei_time = datetime.datetime.now(pytz.timezone("Asia/Taipei"))
    event_dict["timestamp"] = taipei_time.strftime("%Y-%m-%d %H:%M:%S")

    return event_dict


def _get_logger() -> structlog.stdlib.BoundLogger:
    kafka_cfg = env["logging"]["endpoints"]["kafka"]
    structlog.configure(
        processors=[
            DSLogProcessor(
                endpoints=[
                    KafkaEndpoint.from_config(
                        producer_cfg={
                            "bootstrap.servers": ",".join(kafka_cfg["broker"]["urls"]),
                            "security.protocol": "sasl_ssl",
                            "sasl.mechanisms": "SCRAM-SHA-256",
                            "sasl.username": kafka_cfg["broker"]["user"],
                            "sasl.password": kafka_cfg["broker"]["password"],
                        },
                        schema_registry_cfg={"url": kafka_cfg["schema_registry"]["url"]},
                        topic=kafka_cfg["broker"]["topic"],
                        log_level=kafka_cfg["level"],
                    )
                ],
                project="LLM-Benchmark",
            ),
            structlog.processors.add_log_level,
            taipei_timestamper,
            add_color_and_style,
            structlog.dev.ConsoleRenderer(colors=False, sort_keys=False),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(env["logging"]["endpoints"]["console"]["level"]),
    )

    return structlog.get_logger()


logger = _get_logger()
