import io
import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch

def add_page_number(canvas, doc):
    page_num = canvas.getPageNumber()
    canvas.setFont("Helvetica", 9)
    canvas.drawRightString(A4[0] - 40, 20, f"Page {page_num}")

def create_pdf(activities):
    """
    Generate a PDF using ReportLab Platypus.
    The PDF will be A4, portrait with a header and footer.
    """
    buffer = io.BytesIO()
    # Create a document template with A4 size and proper margins.
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=60,
        bottomMargin=40
    )
    styles = getSampleStyleSheet()
    Story = []
    
    # Add a header title
    title = Paragraph("HDD Diagnostics - User Activities Report", styles["Title"])
    Story.append(title)
    Story.append(Spacer(1, 0.3 * inch))
    
    # Build table data with header row
    table_data = [
        ["ID", "User Email", "Login Time", "Logout Time", "IP Address", "User Agent"]
    ]
    for act in activities:
        table_data.append([
            str(act["id"]),
            act["user_email"],
            act["login_time"],
            act["logout_time"] if act["logout_time"] else "N/A",
            act["ip_address"] if act["ip_address"] else "N/A",
            act["user_agent"] if act["user_agent"] else "N/A"
        ])
    
    # Create a table with styling
    table = Table(table_data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    Story.append(table)
    
    # Build the document with page numbering
    doc.build(Story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
