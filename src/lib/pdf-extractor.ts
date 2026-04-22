"use client";

import { getDocument } from "pdfjs-dist/webpack.mjs";

type ExtractedPdfTextData = {
  text: string;
  pageCount: number;
};

function cleanExtractedText(text: string) {
  return text
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractPdfTextData(file: File): Promise<ExtractedPdfTextData> {
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
  });

  const pdfDocument = await loadingTask.promise;

  try {
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .filter(Boolean)
        .join(" ");

      if (pageText.trim()) {
        pages.push(pageText);
      }
    }

    return {
      text: cleanExtractedText(pages.join("\n\n")),
      pageCount: pdfDocument.numPages,
    };
  } finally {
    await pdfDocument.destroy();
    await loadingTask.destroy();
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const { text } = await extractPdfTextData(file);
  return text;
}
