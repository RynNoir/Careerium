// Baca teks PDF di browser dengan pdf.js. Dimuat dinamis agar tidak membebani halaman lain.
export async function pdfToText(file: File, maxPages = 5): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

  const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
  const doc = await task.promise;
  const pages: string[] = [];
  for (let p = 1; p <= Math.min(doc.numPages, maxPages); p++) {
    const content = await (await doc.getPage(p)).getTextContent();
    let line = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      line += item.str;
      line += item.hasEOL ? "\n" : " ";
    }
    pages.push(line.replace(/[ \t]+\n/g, "\n").replace(/ {2,}/g, " "));
  }
  await task.destroy();
  return pages.join("\n").trim();
}
