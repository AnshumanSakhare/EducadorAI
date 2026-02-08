import sys
import requests
from langchain_community.document_loaders import PyPDFLoader
import os

def extract_text_from_pdf(url):
    try:
        # Download the PDF file
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        # Create a temporary file to save the PDF
        temp_pdf_path = "temp.pdf"
        with open(temp_pdf_path, "wb") as f:
            f.write(response.content)
        
        # Load the PDF and extract text
        loader = PyPDFLoader(temp_pdf_path)
        documents = loader.load()
        text = ""
        for doc in documents:
            text += doc.page_content
        
        # Clean up the temporary file
        os.remove(temp_pdf_path)
        
        return text
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        pdf_url = sys.argv[1]
        extracted_text = extract_text_from_pdf(pdf_url)
        # Save extracted text to a file in UTF-8
        with open("extracted_text.txt", "w", encoding="utf-8") as out_f:
            out_f.write(extracted_text)
    else:
        print("Please provide a URL to a PDF file.")