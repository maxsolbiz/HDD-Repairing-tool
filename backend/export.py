# export.py
import io
import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

def get_export_filename(format):
    timestamp = int(datetime.datetime.now().timestamp() * 1000)
    return f"activities_{timestamp}.{format}"

def generate_pdf(activities):
    # Create an in-memory bytes buffer
    pdf_buffer = io.BytesIO()
    
    # Setup document with A4, portrait, and margins
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )
    
    styles = getSampleStyleSheet()
    elements = []

    # Header
    title = Paragraph("HDD Diagnostics - User Activities Report", styles["Title"])
    elements.append(title)
    elements.append(Spacer(1, 12))

    # Prepare table data
    data = [["ID", "User Email", "Login Time", "Logout Time", "IP Address", "User Agent"]]
    for act in activities:
        row = [
            str(act["id"]),
            act["user_email"],
            act["login_time"],
            act["logout_time"] if act["logout_time"] else "N/A",
            act["ip_address"] if act["ip_address"] else "N/A",
            act["user_agent"] if act["user_agent"] else "N/A",
        ]
        data.append(row)

    # Create table with header row repeated on every page
    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 12),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,1), (-1,-1), colors.beige),
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
    ]))
    elements.append(table)

    # Footer: For page numbers, we need to use a canvas callback.
    def add_page_number(canvas, doc):
        page_num = canvas.getPageNumber()
        text = f"Page {page_num}"
        canvas.setFont("Helvetica", 10)
        canvas.drawRightString(A4[0] - 20 * mm, 15 * mm, text)

    doc.build(elements, onLaterPages=add_page_number, onFirstPage=add_page_number)

    pdf_buffer.seek(0)
    return pdf_buffer

def generate_csv(activities):
    import csv
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "user_email", "login_time", "logout_time", "ip_address", "user_agent"])
    writer.writeheader()
    for act in activities:
        writer.writerow({
            "id": act["id"],
            "user_email": act["user_email"],
            "login_time": act["login_time"],
            "logout_time": act["logout_time"] if act["logout_time"] else "",
            "ip_address": act["ip_address"] if act["ip_address"] else "",
            "user_agent": act["user_agent"] if act["user_agent"] else "",
        })
    return output.getvalue()
