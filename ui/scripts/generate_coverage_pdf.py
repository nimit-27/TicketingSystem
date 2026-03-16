#!/usr/bin/env python3
"""Generate a PDF coverage report from Istanbul coverage-final.json."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


def pct(covered: int, total: int) -> float:
    return (covered / total * 100.0) if total else 100.0


def get_counts(items: dict) -> tuple[int, int]:
    total = 0
    covered = 0
    for hit in items.values():
        if isinstance(hit, list):
            total += len(hit)
            covered += sum(1 for value in hit if value > 0)
        else:
            total += 1
            covered += 1 if hit > 0 else 0
    return covered, total


def relabel_path(path: str) -> str:
    marker = "TicketingSystem\\ui\\"
    if marker in path:
        return path.split(marker, 1)[1].replace("\\", "/")
    return path.replace("\\", "/")


def summarize(coverage_data: dict) -> tuple[list[dict], dict]:
    rows: list[dict] = []
    totals = {
        "statements": [0, 0],
        "branches": [0, 0],
        "functions": [0, 0],
        "lines": [0, 0],
    }

    for path, payload in sorted(coverage_data.items()):
        s_cov, s_total = get_counts(payload.get("s", {}))
        b_cov, b_total = get_counts(payload.get("b", {}))
        f_cov, f_total = get_counts(payload.get("f", {}))
        l_cov, l_total = get_counts(payload.get("l", {}))

        totals["statements"][0] += s_cov
        totals["statements"][1] += s_total
        totals["branches"][0] += b_cov
        totals["branches"][1] += b_total
        totals["functions"][0] += f_cov
        totals["functions"][1] += f_total
        totals["lines"][0] += l_cov
        totals["lines"][1] += l_total

        rows.append(
            {
                "file": relabel_path(path),
                "statements": f"{s_cov}/{s_total} ({pct(s_cov, s_total):.1f}%)",
                "branches": f"{b_cov}/{b_total} ({pct(b_cov, b_total):.1f}%)",
                "functions": f"{f_cov}/{f_total} ({pct(f_cov, f_total):.1f}%)",
                "lines": f"{l_cov}/{l_total} ({pct(l_cov, l_total):.1f}%)",
            }
        )

    overall = {
        name: f"{cov}/{total} ({pct(cov, total):.1f}%)"
        for name, (cov, total) in totals.items()
    }
    return rows, overall


def draw_table(pdf: canvas.Canvas, rows: list[dict], overall: dict, input_file: Path):
    width, height = landscape(A4)
    left = 10 * mm
    right = width - 10 * mm
    y = height - 12 * mm
    line_height = 6 * mm

    columns = [
        ("File", 118 * mm),
        ("Statements", 39 * mm),
        ("Branches", 39 * mm),
        ("Functions", 39 * mm),
        ("Lines", 39 * mm),
    ]

    def header():
        nonlocal y
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(left, y, "UI Coverage Report (coverage-final.json)")
        y -= 7 * mm

        pdf.setFont("Helvetica", 9)
        pdf.drawString(left, y, f"Source: {input_file}")
        y -= 6 * mm

        pdf.setFont("Helvetica-Bold", 9)
        x = left
        for title, col_width in columns:
            pdf.drawString(x, y, title)
            x += col_width
        y -= 2 * mm
        pdf.line(left, y, right, y)
        y -= 4 * mm

    header()

    pdf.setFont("Helvetica", 8)
    for row in rows:
        if y < 14 * mm:
            pdf.showPage()
            y = height - 12 * mm
            header()
            pdf.setFont("Helvetica", 8)

        x = left
        pdf.drawString(x, y, row["file"][:93])
        x += columns[0][1]
        pdf.drawString(x, y, row["statements"])
        x += columns[1][1]
        pdf.drawString(x, y, row["branches"])
        x += columns[2][1]
        pdf.drawString(x, y, row["functions"])
        x += columns[3][1]
        pdf.drawString(x, y, row["lines"])
        y -= line_height

    if y < 30 * mm:
        pdf.showPage()
        y = height - 12 * mm

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(left, y, "Overall Totals")
    y -= 7 * mm
    pdf.setFont("Helvetica", 10)
    pdf.drawString(left, y, f"Statements: {overall['statements']}")
    y -= 6 * mm
    pdf.drawString(left, y, f"Branches: {overall['branches']}")
    y -= 6 * mm
    pdf.drawString(left, y, f"Functions: {overall['functions']}")
    y -= 6 * mm
    pdf.drawString(left, y, f"Lines: {overall['lines']}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate PDF from Istanbul coverage-final.json")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("ui/coverage/coverage-final.json"),
        help="Path to coverage-final.json",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("ui/coverage/test-coverage-report.pdf"),
        help="Output PDF path",
    )
    args = parser.parse_args()

    with args.input.open("r", encoding="utf-8") as f:
        coverage_data = json.load(f)

    rows, overall = summarize(coverage_data)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(args.output), pagesize=landscape(A4))
    draw_table(pdf, rows, overall, args.input)
    pdf.save()

    print(f"Generated PDF: {args.output} ({len(rows)} files)")


if __name__ == "__main__":
    main()
