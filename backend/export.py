# backend/export.py

import io
import csv
import datetime
import time
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

def export_activities_csv(rows: list) -> StreamingResponse:
    """
    Generate a CSV export from rows data.
    """
    output = io.StringIO()
    fieldnames = ["ID", "User Email", "Login Time", "Logout Time", "IP Address", "User Agent"]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow({
            "ID": row["id"],
            "User Email": row["user_email"],
            "Login Time": row["login_time"],
            "Logout Time": row["logout_time"],
            "IP Address": row["ip_address"],
            "User Agent": row["user_agent"],
        })
    output.seek(0)
    # Create a unique filename using timestamp
    filename = f"activities_{int(time.time())}.csv"
    response = StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    return response

def export_activities_pdf(rows: list) -> StreamingResponse:
    """
    Generate a PDF export from rows data using ReportLab.
    """
    if not rows:
        raise HTTPException(status_code=404, detail="No activities to export.")

    # Create an in-memory PDF buffer
    pdf_buffer = io.BytesIO()

    # Create a SimpleDocTemplate with A4 portrait layout.
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=30 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()
    elements = []

    # Header (Title)
    report_title = "User Activities Report"
    application_title = "HDD Diagnostics"
    header_paragraph = Paragraph(f"<b>{application_title} - {report_title}</b>", styles["Title"])
    elements.append(header_paragraph)
    elements.append(Spacer(1, 12))

    # Table header and data rows
    table_data = [
        ["ID", "User Email", "Login Time", "Logout Time", "IP Address", "User Agent"]
    ]

    for row in rows:
        table_data.append([
            row["id"],
            row["user_email"],
            row["login_time"],
            row["logout_time"] if row["logout_time"] else "N/A",
            row["ip_address"] or "N/A",
            row["user_agent"] or "N/A"
        ])

    # Create a table with the data
    table = Table(table_data, repeatRows=1)
    # Apply a table style
    style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563eb")),  # Header background (blue)
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
        ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ])
    table.setStyle(style)
    elements.append(table)

    # Footer callback: add page number at bottom-right
    def add_page_number(canvas, doc):
        page_num = canvas.getPageNumber()
        text = f"Page {page_num}"
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(A4[0] - 20 * mm, 15 * mm, text)

    doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    pdf_buffer.seek(0)

    # Create a unique filename using timestamp
    filename = f"activities_{int(time.time())}.pdf"
    response = StreamingResponse(
        pdf_buffer,
        media_type="application/pdf"
    )
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    return response
