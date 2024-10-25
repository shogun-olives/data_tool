from flask import render_template, session
import config


def render(category: str, page: str, **kwargs):
    return render_template(
        config.RENDER_TARGETS[category][page]['template'],
        stylesheet = config.RENDER_TARGETS[category][page]['stylesheet'],
        script = config.RENDER_TARGETS[category][page]['script'],
        calculator_status = config.CALCULATOR_STATUS[session.get("calculator_enabled", False)],
        calculator_data = session.get("calculator_data", []) + [""],
        **kwargs,
    )