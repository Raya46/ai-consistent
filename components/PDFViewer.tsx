"use client";
import dynamic from "next/dynamic";

// Dynamically import the PDF viewer client component.
const PDFViewerClient = dynamic(() => import("./PDFViewerClient"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-32 p-8">
      <div className="text-gray-500 text-lg">Loading PDF Viewer...</div>
    </div>
  ),
});

interface PDFViewerProps {
  file: string;
}

const PDFViewer = ({ file }: PDFViewerProps) => {
  return <PDFViewerClient file={file} />;
};

export default PDFViewer;
