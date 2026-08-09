export async function extractTextFromFile(file: File): Promise<{ text: string; status: "done" | "failed"; message?: string }> {
  const name = file.name.toLowerCase();
  const type = file.type;
  if (type.startsWith("text/") || name.endsWith(".md") || name.endsWith(".txt")) return { text: await file.text(), status: "done" };
  if (name.endsWith(".pdf")) return { text: `PDF uploaded: ${file.name}. PDF text extraction dependency is not enabled yet; add notes text or use txt/md for best AI output in MVP.`, status: "failed", message: "PDF extraction pending dependency setup" };
  return { text: `File uploaded: ${file.name}. Automatic extraction is not supported for this file type yet.`, status: "failed", message: "Unsupported file type for text extraction" };
}

export function chunkText(text: string, size = 2500) {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks.length ? chunks : [""];
}
