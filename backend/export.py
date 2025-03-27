# export.py
import io
import csv
import datetime
from fastapi import HTTPException
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

# Check if ReportLab is installed; if not, throw an error.
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
except ImportError:
    raise HTTPException(status_code=500, detail="reportlab library is required for PDF export.")

def generate_csv(rows):
    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=["id", "user_email", "login_time", "logout_time", "ip_address", "user_agent"]
    )
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return output.getvalue()

def generate_pdf(rows):
    pdf_buffer = io.BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=A4)
    width, height = A4
    margin = 50
    y_position = height - margin

    # Header (Title)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, y_position, "HDD Diagnostics - User Activities Report")
    y_position -= 40

    # Draw table header
    c.setFont("Helvetica-Bold", 10)
    headers = ["ID", "User Email", "Login Time", "Logout Time", "IP Address", "User Agent"]
    x_positions = [margin, margin + 30, margin + 200, margin + 350, margin + 500, margin + 600]
    for i, header in enumerate(headers):
        c.drawString(x_positions[i], y_position, header)
    y_position -= 20

    # Set font for table rows
    c.setFont("Helvetica", 8)
    for row in rows:
        # If there isn’t enough space, add a footer then start a new page.
        if y_position < margin + 40:
            # Footer with page number
            c.setFont("Helvetica", 8)
            c.drawRightString(width - margin, margin / 2, f"Page {c.getPageNumber()}")
            c.showPage()
            y_position = height - margin

            # Redraw header on new page
            c.setFont("Helvetica-Bold", 16)
            c.drawCentredString(width / 2, y_position, "HDD Diagnostics - User Activities Report")
            y_position -= 40
            c.setFont("Helvetica-Bold", 10)
            for i, header in enumerate(headers):
                c.drawString(x_positions[i], y_position, header)
            y_position -= 20
            c.setFont("Helvetica", 8)
        c.drawString(x_positions[0], y_position, str(row["id"]))
        c.drawString(x_positions[1], y_position, row["user_email"])
        c.drawString(x_positions[2], y_position, row["login_time"])
        c.drawString(x_positions[3], y_position, row["logout_time"])
        c.drawString(x_positions[4], y_position, row["ip_address"])
        c.drawString(x_positions[5], y_position, row["user_agent"])
        y_position -= 15

    # Final footer with page number
    c.setFont("Helvetica", 8)
    c.drawRightString(width - margin, margin / 2, f"Page {c.getPageNumber()}")
    c.showPage()
    c.save()
    pdf_buffer.seek(0)
    return pdf_buffer

def get_export_filename(format: str):
    timestamp = int(datetime.datetime.utcnow().timestamp())
    if format == "pdf":
        return f"activities_{timestamp}.pdf"
    else:
        return f"activities_{timestamp}.csv"
