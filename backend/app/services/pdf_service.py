# backend/app/services/pdf_service.py
import fitz  # PyMuPDF

def extract_text_from_pdf(file_bytes: bytes, keywords=["match", "contribution", "eligibility"]) -> str:
    """
    Opens a PDF from in-memory bytes and filters pages containing 
    Workplace Investing core keyword anchors.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    extracted_text = ""
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        
        # Only extract pages containing our target keywords to save API costs
        if any(keyword in text.lower() for keyword in keywords):
            extracted_text += f"\n--- PAGE {page_num + 1} ---\n" + text
            
    return extracted_text