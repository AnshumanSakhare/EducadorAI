import sys
import requests
from langchain_community.document_loaders import PyPDFLoader
import os
import tempfile

def extract_text_from_pdf(url):
    try:
        # Download the PDF file
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        # Create a temporary file to save the PDF. This is safer for serverless envs.
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_f:
            temp_f.write(response.content)
            temp_pdf_path = temp_f.name
        
        try:
            # Load the PDF and extract text
            loader = PyPDFLoader(temp_pdf_path)
            documents = loader.load()
            text = "".join(doc.page_content for doc in documents)
        finally:
            # Clean up the temporary file
            os.remove(temp_pdf_path)
        
        return text
    except Exception as e:
        # Print error to stderr and exit, so Node.js can catch it.
        print(f"Error in Python script: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        pdf_url = sys.argv[1]
        extracted_text = extract_text_from_pdf(pdf_url)
        # Print extracted text to stdout for Node.js to capture
        print(extracted_text)
    else:
        print("Error: No PDF URL provided to Python script.", file=sys.stderr)
        sys.exit(1)