"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, FileText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import PDFViewer from "@/components/PDFViewer";

export default function DocumentAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get("file") || "";
  const fileName = searchParams.get("fileName") || "Document.pdf";

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* PDF Viewer */}
        <div className="bg-gray-50 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded bg-red-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-black">{fileName}</h2>
              <p className="text-sm text-gray-500">3.5 MB • PDF Document</p>
            </div>
          </div>
          <div className="aspect-4/5 bg-gray-100 rounded-lg border border-gray-200">
            <PDFViewer file={fileUrl} />
          </div>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">AI Analysis Results</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>{/* Add summary content */}</CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                AI Suggested Clarifications
              </h3>
              <div className="space-y-4">{/* Add suggestion cards */}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
