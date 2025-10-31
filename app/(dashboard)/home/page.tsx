"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarChart3, FileText, Mic, AlertCircle, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFileUpload, formatBytes } from "@/hooks/use-file-upload";
import { useFileStorage } from "@/hooks/use-file-storage";

export default function HomePage() {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    document?: boolean;
    audio?: boolean;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeMB = 10;
  const maxSize = maxSizeMB * 1024 * 1024;
  const maxFiles = 10;

  const fileUploadState = useFileUpload({
    accept: ".pdf",
    maxSize,
    multiple: true,
    maxFiles,
  });

  const { files, isDragging, errors } = fileUploadState;
  const {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    removeFile,
    clearFiles,
    getInputProps,
  } = fileUploadState;

  const { clearAllData, storeFilesInIndexedDB } = useFileStorage();

  const features = [
    {
      icon: FileText,
      title: "Document Analysis",
    },
    {
      icon: Mic,
      title: "Auto Transcribe",
    },
    {
      icon: BarChart3,
      title: "Risk Dashboard",
    },
  ];

  // Clear all data when component mounts
  useEffect(() => {
    clearAllData().catch(console.error);
  }, []); // Empty dependency array - run only once on mount

  // Store files in IndexedDB when files are added
  useEffect(() => {
    if (files.length > 0) {
      storeFilesInIndexedDB(files)
        .then(() => {
          setUploadedFiles((prev) => ({
            ...prev,
            document: true,
          }));
        })
        .catch(console.error);
    }
  }, [files]); // Only depend on files, not storeFilesInIndexedDB

  const handleDocumentDropZoneClick = () => {
    setShowUploadModal(true);
  };

  const handleContinue = () => {
    const documentMeta = sessionStorage.getItem("documentFileMeta");
    if (documentMeta) {
      const documentData = JSON.parse(documentMeta);
      router.push(
        `/home/document-analysis?fileName=${encodeURIComponent(
          documentData.name
        )}`
      );
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setShowUploadModal(false);
      clearFiles();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-white to-blue-200 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-3xl mb-8">
        <Badge className="py-2 mb-6 px-4 bg-gradient-to-r from-blue-700 via-blue-300 to-blue-700 text-white border-0">
          Powered by AI Verification Engine
        </Badge>
        <h1 className="text-5xl md:text-6xl font-semibold mb-6 bg-linear-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          The Smart Way to Verify
        </h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          Instantly compare documents and interviews to detect inconsistencies,
          clarify data, and build trust
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl px-4 mb-8">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="hover:shadow-lg rounded-2xl transition-all duration-300 h-20 border-0 flex flex-row items-center justify-between p-4 "
          >
            <div className="h-12 w-12 rounded-lg bg-gradient-to-b from-blue-600 to-indigo-400 flex items-center justify-center">
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl mr-14">{feature.title}</CardTitle>
          </Card>
        ))}
      </div>

      {/* Document Dropzone */}
      <Card className="w-full max-w-7xl mt-6">
        <div className="flex flex-col items-center">
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
            Upload Document
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Start by uploading your financial or client document
          </p>
        </div>
        <div className="w-full px-4">
          <div
            className="border-2 w-full border-dashed bg-blue-100/20 border-blue-600 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-700 hover:bg-blue-100/30 transition-colors"
            onClick={handleDocumentDropZoneClick}
          >
            <FileText className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              Upload Documents for Analysis
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click to upload or drag and drop multiple PDF files
            </p>
          </div>
        </div>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadModal} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Files for Analysis</DialogTitle>
            <DialogDescription>
              Please upload your documents for analysis. Multiple PDF files are
              supported.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Drop area */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              data-dragging={isDragging || undefined}
              data-files={files.length > 0 || undefined}
              className="relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
            >
              <input
                {...getInputProps()}
                ref={fileInputRef}
                aria-label="Upload PDF file"
              />
              <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                <div
                  className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                  aria-hidden="true"
                >
                  <FileText className="size-4 opacity-60" />
                </div>
                <p className="mb-1.5 text-sm font-medium">
                  Drop your PDF documents here
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF files only (max. {maxSizeMB}MB, up to {maxFiles} files)
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="-ms-1 opacity-60" aria-hidden="true" />
                  Select documents
                </Button>
              </div>
            </div>

            {errors.length > 0 && (
              <div
                className="flex items-center gap-1 text-xs text-destructive"
                role="alert"
              >
                <AlertCircle className="size-3 shrink-0" />
                <span>{errors[0]}</span>
              </div>
            )}

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3 max-w-full"
                  >
                    <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                      <div className="aspect-square shrink-0 rounded bg-accent flex items-center justify-center">
                        <FileText className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p
                          className="truncate text-[13px] font-medium max-w-[200px]"
                          title={file.file.name}
                        >
                          {file.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(file.file.size)}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground shrink-0"
                      onClick={() => removeFile(file.id)}
                      aria-label="Remove file"
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                ))}

                {/* Remove all files button */}
                {files.length > 1 && (
                  <div>
                    <Button size="sm" variant="outline" onClick={clearFiles}>
                      Remove all files
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            {files.length > 0 && (
              <Button onClick={handleContinue}>Continue to Analysis</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
