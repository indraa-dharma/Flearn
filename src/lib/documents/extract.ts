import pdf from "pdf-parse";

export async function extractTextFromFile(file: File): Promise<{ text: string; status: "done" | "failed"; message?: string }> {
  const name = file.name.toLowerCase();
  const type = file.type;
  
  if (type.startsWith("text/") || name.endsWith(".md") || name.endsWith(".txt")) {
    return { text: await file.text(), status: "done" };
  }
  
  if (name.endsWith(".pdf")) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdf(buffer);
      
      if (!data.text || data.text.trim().length === 0) {
         return { text: `PDF uploaded: ${file.name}. Could not extract any readable text from this PDF. It might be scanned images.`, status: "failed", message: "Empty PDF or scanned image without OCR" };
      }
      
      return { text: data.text, status: "done" };
    } catch (e: any) {
      console.error("PDF Extraction Error:", e);
      return { text: `PDF uploaded: ${file.name}. Failed to extract text: ${e.message}`, status: "failed", message: `PDF extraction failed: ${e.message}` };
    }
  }
  
  return { text: `File uploaded: ${file.name}. Automatic extraction is not supported for this file type yet.`, status: "failed", message: "Unsupported file type for text extraction" };
}

export function chunkText(text: string, size = 2500) {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks.length ? chunks : [""];
}
