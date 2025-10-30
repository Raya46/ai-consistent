"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarChart3, FileText, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function HomePage() {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const features = [
    {
      icon: FileText,
      title: "Document Analysis",
      description:
        "Extract key data and instantly generate required clarification questions",
      onClick: () => setShowUploadModal("document-analysis"),
    },
    {
      icon: Mic,
      title: "Auto Transcribe",
      description:
        "Convert audio and video interviews into searchable text with speaker detection",
      onClick: () => setShowUploadModal("auto-transcribe"),
    },
    {
      icon: BarChart3,
      title: "Risk Dashboard",
      description:
        "Visualize and track key risk indicators across your verification process",
      onClick: () => {
        // Handle risk dashboard navigation
      },
    },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && showUploadModal) {
      // Create object URL for the uploaded file
      const fileUrl = URL.createObjectURL(file);

      // Navigate to the respective page with file URL
      if (showUploadModal === "document-analysis") {
        router.push(
          `/home/document-analysis?file=${encodeURIComponent(
            fileUrl
          )}&fileName=${encodeURIComponent(file.name)}`
        );
      } else if (showUploadModal === "auto-transcribe") {
        router.push(
          `/home/auto-transcribe?file=${encodeURIComponent(
            fileUrl
          )}&fileName=${encodeURIComponent(file.name)}`
        );
      }
      setShowUploadModal(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setShowUploadModal(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-white to-blue-200 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-3xl mb-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          AI-Powered Consistency Check
        </h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          Detect inconsistencies between interview responses and documents
          automatically using advanced AI analysis
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl px-4">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            onClick={feature.onClick}
          >
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-linear-to-b from-blue-600 to-indigo-400 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Upload Dialog */}
      <Dialog open={!!showUploadModal} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Upload File for{" "}
              {showUploadModal === "document-analysis"
                ? "Document Analysis"
                : "Auto Transcribe"}
            </DialogTitle>
            <DialogDescription>
              {showUploadModal === "document-analysis"
                ? "Please upload a PDF document for analysis."
                : "Please upload an audio or video file for transcription."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file-upload">Choose File</Label>
              <Input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                accept={
                  showUploadModal === "document-analysis"
                    ? ".pdf"
                    : "audio/*,video/*"
                }
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              {showUploadModal === "document-analysis" ? (
                <FileText className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
              ) : (
                <Mic className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
              )}
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Click to upload or drag and drop
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                {showUploadModal === "document-analysis"
                  ? "PDF files only"
                  : "Audio and video files"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
