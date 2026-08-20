export async function extractTextFromFile(file: File): Promise<{ text: string; status: "done" | "failed"; message?: string }> {
  const name = file.name.toLowerCase();
  const type = file.type;
  
  if (type.startsWith("text/") || name.endsWith(".md") || name.endsWith(".txt")) {
    return { text: await file.text(), status: "done" };
  }
  
  if (name.endsWith(".pdf")) {
    let parser: import("pdf-parse").PDFParse | undefined;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // pdf.js needs these canvas polyfills in serverless Node runtimes (Vercel).
      // Import the worker entrypoint first so DOMMatrix, Path2D, and ImageData exist.
      const { CanvasFactory } = await import("pdf-parse/worker");
      const { PDFParse } = await import("pdf-parse");
      parser = new PDFParse({ data: buffer, CanvasFactory });
      const data = await parser.getText();
      
      if (!data.text || data.text.trim().length === 0) {
         return { text: `PDF uploaded: ${file.name}. Could not extract any readable text from this PDF. It might be scanned images.`, status: "failed", message: "Empty PDF or scanned image without OCR" };
      }
      
      return { text: data.text, status: "done" };
    } catch (e: any) {
      console.error("PDF Extraction Error:", e);
      return { text: `PDF uploaded: ${file.name}. Failed to extract text: ${e.message}`, status: "failed", message: `PDF extraction failed: ${e.message}` };
    } finally {
      await parser?.destroy().catch(() => undefined);
    }
  }
  
  return { text: `File uploaded: ${file.name}. Automatic extraction is not supported for this file type yet.`, status: "failed", message: "Unsupported file type for text extraction" };
}

export function chunkText(text: string, size = 2500) {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks.length ? chunks : [""];
}
