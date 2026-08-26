from __future__ import annotations

import re
import shutil
import tempfile
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET


PRESENTATION_PATH = Path(
    "/Users/deepakreddy/Downloads/Unlocking-Sparks-Performance-The-Power-of-the-DAG-Scheduler (1).pptx"
)
OUTPUT_PATH = Path(
    "/Users/deepakreddy/Downloads/Support Ticket System/Unlocking-Sparks-Performance-The-Power-of-the-DAG-Scheduler-simple.pptx"
)

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
}

for prefix, uri in NS.items():
    ET.register_namespace(prefix, uri)


REPLACEMENTS = {
    1: {
        4: ["Spark DAG Scheduler: Simple View"],
        5: ["How Spark plans work, splits stages, and runs tasks faster"],
    },
    2: {
        4: ["What the DAG Scheduler Does"],
        6: ["Plans the Job"],
        7: ["It turns Spark transformations into an execution plan."],
        9: ["Real-Life Example"],
        10: [
            "Think of a food delivery app: order first, restaurant next, driver last. Many orders move at the same time, but each order follows the right sequence."
        ],
    },
    3: {
        2: ["How Spark Builds the DAG"],
        3: ["01"],
        5: ["Read the Code"],
        6: ["Spark reads transformations such as map, filter, and join."],
        7: ["02"],
        9: ["Create the DAG"],
        10: ["It builds a graph of operations in the correct order, with no loops."],
        11: ["03"],
        13: ["Split Into Stages"],
        14: ["Operations that need a data shuffle start a new stage."],
    },
    4: {
        2: ["Stages, Tasks, and Execution"],
        5: ["Stage"],
        6: ["A group of operations that can run together."],
        9: ["Task"],
        10: ["One unit of work that runs on a single data partition."],
        13: ["Scheduler"],
        14: ["The DAG Scheduler orders stages, then the Task Scheduler runs the tasks on executors."],
    },
    5: {
        2: ["Why the DAG Matters"],
        4: ["Speed"],
        5: ["Spark pipelines work inside a stage and reduce extra data movement."],
        7: ["Recovery"],
        8: ["If a node fails, Spark rebuilds only the lost partitions by using lineage."],
        10: ["Debugging"],
        11: ["The Spark UI shows the DAG, so bottlenecks are easier to find."],
    },
}


def set_shape_text(shape: ET.Element, lines: list[str]) -> None:
    paragraphs = shape.findall(".//a:p", NS)
    if not paragraphs:
        return

    first_para = paragraphs[0]
    run_props = first_para.find("./a:r/a:rPr", NS)
    end_para_props = first_para.find("./a:endParaRPr", NS)

    for paragraph in paragraphs:
        body = list(paragraph)
        for child in body:
            paragraph.remove(child)

    for index, text in enumerate(lines):
        paragraph = paragraphs[index] if index < len(paragraphs) else ET.SubElement(
            shape.find("./p:txBody", NS), f"{{{NS['a']}}}p"
        )
        run = ET.SubElement(paragraph, f"{{{NS['a']}}}r")
        if run_props is not None:
            run.append(ET.fromstring(ET.tostring(run_props)))
        text_node = ET.SubElement(run, f"{{{NS['a']}}}t")
        text_node.text = text
        if end_para_props is not None:
            paragraph.append(ET.fromstring(ET.tostring(end_para_props)))

    for paragraph in paragraphs[len(lines):]:
        # Leave extra paragraphs empty but valid.
        if end_para_props is not None and paragraph.find("./a:endParaRPr", NS) is None:
            paragraph.append(ET.fromstring(ET.tostring(end_para_props)))


def update_slide(slide_path: Path, replacements: dict[int, list[str]]) -> None:
    tree = ET.parse(slide_path)
    root = tree.getroot()
    for shape in root.findall(".//p:sp", NS):
        c_nv_pr = shape.find("./p:nvSpPr/p:cNvPr", NS)
        if c_nv_pr is None:
            continue
        shape_id = int(c_nv_pr.get("id", "0"))
        if shape_id in replacements:
            set_shape_text(shape, replacements[shape_id])
    tree.write(slide_path, encoding="utf-8", xml_declaration=True)


def repack_pptx(source: Path, output: Path) -> None:
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        with zipfile.ZipFile(source) as archive:
            archive.extractall(temp_path)

        slides_dir = temp_path / "ppt" / "slides"
        for slide_number, replacements in REPLACEMENTS.items():
            update_slide(slides_dir / f"slide{slide_number}.xml", replacements)

        if output.exists():
            output.unlink()

        with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for file_path in sorted(temp_path.rglob("*")):
                if file_path.is_file():
                    archive.write(file_path, file_path.relative_to(temp_path))


if __name__ == "__main__":
    shutil.copy2(PRESENTATION_PATH, OUTPUT_PATH)
    repack_pptx(OUTPUT_PATH, OUTPUT_PATH)
    print(OUTPUT_PATH)
