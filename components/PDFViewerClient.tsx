"use client";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Note: CSS files are copied to public directory and will be loaded globally
// The warnings are harmless and the PDF viewer will work correctly

// Use local worker file
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface PDFViewerClientProps {
  file: string;
}

const PDFViewerClient = ({ file }: PDFViewerClientProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () =>
    setPageNumber(pageNumber - 1 <= 1 ? 1 : pageNumber - 1);

  const goToNextPage = () =>
    setPageNumber(
      pageNumber + 1 >= (numPages || 1) ? numPages || 1 : pageNumber + 1
    );

  return (
    <div className="flex flex-col h-full">
      <nav className="flex items-center justify-between mb-4 p-2 bg-gray-100 rounded-lg">
        <Button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>

        <span className="text-sm font-medium text-gray-700">
          Page {pageNumber} of {numPages || "..."}
        </span>

        <Button
          onClick={goToNextPage}
          disabled={pageNumber >= numPages!}
          variant="outline"
          size="sm"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </nav>

      <div className="flex-1 border border-gray-300 rounded-lg overflow-auto bg-white">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-32 p-8 text-center">
              <div className="text-gray-500">Loading PDF...</div>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-32 p-8 text-center">
              <div className="text-red-500">
                Failed to load PDF. Please make sure the file exists.
              </div>
            </div>
          }
        >
          <Page pageNumber={pageNumber} width={600} className="mx-auto" />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewerClient;
