import { PDFParse } from "pdf-parse";

// Configure the worker for client-side usage
// This should be called once, ideally in your app's entry point (e.g., _app.tsx or layout.tsx)
// but for simplicity in this utility, we'll ensure it's set before parsing.
if (typeof window !== "undefined") {
	PDFParse.setWorker(
		"https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf.worker.min.mjs",
	);
}

/**
 * Extracts text content from a PDF File object using the pdf-parse library.
 * This function is designed to run in a browser environment.
 *
 * @param {File} file - The PDF file to extract text from.
 * @returns {Promise<string>} A promise that resolves with the extracted text.
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
	if (typeof window === "undefined") {
		throw new Error(
			"extractTextFromFile can only be called in a browser environment.",
		);
	}

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = async (event) => {
			const arrayBuffer = event.target?.result as ArrayBuffer;
			if (!arrayBuffer) {
				reject(new Error("Failed to read file into ArrayBuffer."));
				return;
			}
			const parser = new PDFParse({ data: arrayBuffer });

			try {
				const result = await parser.getText();
				resolve(result.text);
			} catch (error) {
				console.error("Error extracting text from PDF:", error);
				reject(error);
			} finally {
				// Always call destroy() to free up memory
				await parser.destroy();
			}
		};
		reader.onerror = (err) => reject(err);
		reader.readAsArrayBuffer(file);
	});
};
