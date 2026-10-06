import os

def build_pdf(filename, title, num_pages=1, extra_info=""):
    # Standard PDF 1.4 objects
    objs = []
    
    # 1: Catalog
    # 2: Pages
    # 3: Font
    # For each page:
    #   Page obj
    #   Content stream obj
    
    catalog_obj = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    font_obj = "3 0 obj\n<< /Type /Font /Subtype /Type1 /Name /F1 /BaseFont /Helvetica >>\nendobj\n"
    
    page_obj_ids = []
    content_objs = []
    current_id = 4
    
    for p in range(num_pages):
        page_id = current_id
        content_id = current_id + 1
        page_obj_ids.append(page_id)
        current_id += 2
        
        stream_text = f"""BT
/F1 20 Tf
50 780 Td
({title}) Tj
/F1 14 Tf
0 -40 Td
(Page {p+1} of {num_pages}) Tj
/F1 11 Tf
0 -30 Td
({extra_info}) Tj
0 -25 Td
(Official Tender Document Submission - AI DevFest 2026) Tj
ET"""
        stream_bytes = stream_text.encode("latin1")
        c_obj = f"{content_id} 0 obj\n<< /Length {len(stream_bytes)} >>\nstream\n{stream_text}\nendstream\nendobj\n"
        content_objs.append((content_id, c_obj))
        
    kids_str = " ".join([f"{pid} 0 R" for pid in page_obj_ids])
    pages_obj = f"2 0 obj\n<< /Type /Pages /Kids [{kids_str}] /Count {num_pages} >>\nendobj\n"
    
    page_objs = []
    for idx, pid in enumerate(page_obj_ids):
        cid = content_objs[idx][0]
        p_obj = f"{pid} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents {cid} 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj\n"
        page_objs.append(p_obj)
        
    all_objs = [
        (1, catalog_obj),
        (2, pages_obj),
        (3, font_obj)
    ]
    for idx, pid in enumerate(page_obj_ids):
        all_objs.append((pid, page_objs[idx]))
        all_objs.append((content_objs[idx][0], content_objs[idx][1]))
        
    all_objs.sort(key=lambda x: x[0])
    
    header = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    body_parts = []
    offsets = {}
    current_pos = len(header.encode("latin1"))
    
    for oid, o_str in all_objs:
        offsets[oid] = current_pos
        o_bytes = o_str.encode("latin1")
        body_parts.append(o_bytes)
        current_pos += len(o_bytes)
        
    xref_pos = current_pos
    total_objs = len(all_objs) + 1
    
    xref_lines = [f"xref\n0 {total_objs}\n0000000000 65535 f \n"]
    for i in range(1, total_objs):
        xref_lines.append(f"{offsets[i]:010d} 00000 n \n")
        
    xref_str = "".join(xref_lines)
    trailer_str = f"trailer\n<< /Size {total_objs} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n"
    
    full_data = header.encode("latin1") + b"".join(body_parts) + xref_str.encode("latin1") + trailer_str.encode("latin1")
    
    with open(filename, "wb") as f:
        f.write(full_data)

os.makedirs("sample_data/sample_pdfs", exist_ok=True)

# 1. trade_license_2025.pdf (1 page, expired)
build_pdf("sample_data/sample_pdfs/trade_license_2025.pdf", "TRADE LICENSE - 2024-2025", 1, "Expiry Date: 2025-06-30 (Expired for 2026 tender)")

# 2. trade_license_2026.pdf (1 page, valid)
build_pdf("sample_data/sample_pdfs/trade_license_2026.pdf", "TRADE LICENSE - 2026-2027", 1, "Expiry Date: 2027-06-30 (Valid: Expiry >= Deadline)")

# 3. tin_certificate.pdf (1 page)
build_pdf("sample_data/sample_pdfs/tin_certificate.pdf", "TIN CERTIFICATE (NBR)", 1, "e-TIN: 849204918234 / Apex Tech Solutions")

# 4. vat_certificate.pdf (1 page)
build_pdf("sample_data/sample_pdfs/vat_certificate.pdf", "BIN / VAT REGISTRATION CERTIFICATE", 1, "BIN: 002948192-0101 / Form Mushak-2.3")

# 5. bank_solvency.pdf (1 page)
build_pdf("sample_data/sample_pdfs/bank_solvency.pdf", "BANK SOLVENCY CERTIFICATE", 1, "Sonali Bank PLC - High Credit Limit Available")

# 6. experience_cert.pdf (2 pages)
build_pdf("sample_data/sample_pdfs/experience_cert.pdf", "EXPERIENCE CERTIFICATE", 2, "Successful Completion of IT Modernization (BDT 50M)")

# 7. experience_cert (1).pdf (Identical copy)
with open("sample_data/sample_pdfs/experience_cert.pdf", "rb") as src, open("sample_data/sample_pdfs/experience_cert (1).pdf", "wb") as dst:
    dst.write(src.read())

# 8. technical_proposal.pdf (6 pages)
build_pdf("sample_data/sample_pdfs/technical_proposal.pdf", "TECHNICAL PROPOSAL - DIGITAL LAND IT", 6, "Architecture, Hardware Specs, SLA, and Deployment Timeline")

# 9. financial_proposal.pdf (2 pages)
build_pdf("sample_data/sample_pdfs/financial_proposal.pdf", "FINANCIAL PROPOSAL & BOQ", 2, "Detailed Bill of Quantities, Unit Rates, Total BDT")

# 10. signed_declaration.pdf (1 page)
build_pdf("sample_data/sample_pdfs/signed_declaration.pdf", "SIGNED DECLARATION & INTEGRITY PACT", 1, "Signed by Managing Director, Apex Tech Solutions Ltd.")

print("Generated 10 sample PDFs successfully!")
for f in sorted(os.listdir("sample_data/sample_pdfs")):
    p = os.path.join("sample_data/sample_pdfs", f)
    print(f" - {f:30s}: {os.path.getsize(p)} bytes")
