"use client";

import PDFViewer from "@/components/PDFViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFileStorage } from "@/hooks/use-file-storage";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import {
  AlertCircle,
  FileAudio2,
  FileText,
  Mic,
  Upload,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentAnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fileUrl, setFileUrl] = useState("");
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [allFiles, setAllFiles] = useState<
    Array<{
      name: string;
      size: number;
      type: string;
      key: string;
      textContent?: string;
    }>
  >([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [textContent, setTextContent] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [clarifications, setClarifications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileName = searchParams.get("fileName") || "Document.pdf";
  const audioFileRef = useRef<HTMLInputElement>(null);
  const { getFileFromIndexedDB, storeAudioFile, storeAudioFiles } =
    useFileStorage();

  const maxSizeMB = 25;
  const maxSize = maxSizeMB * 1024 * 1024;
  const maxFiles = 10;

  const audioUploadState = useFileUpload({
    accept: ".mp3,.wav,.m4a,.ogg,.flac",
    maxSize,
    multiple: true,
    maxFiles,
  });

  const { files, isDragging, errors } = audioUploadState;
  const {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    removeFile,
    clearFiles,
    getInputProps,
  } = audioUploadState;

  const loadFile = async (index: number) => {
    let cleanup: (() => void) | undefined;

    try {
      // Get document file metadata from sessionStorage
      const storedMeta = sessionStorage.getItem("documentFileMeta");
      if (!storedMeta) {
        console.error("No document file metadata found in sessionStorage");
        return;
      }

      const fileData = JSON.parse(storedMeta);

      // Set all files from metadata if not already set
      if (fileData.allFiles && allFiles.length === 0) {
        setAllFiles(fileData.allFiles);
      }

      // Get document file from IndexedDB using hook
      const fileKey = `uploadedDocument_${index}`;
      try {
        let file = await getFileFromIndexedDB(fileKey);

        // Fallback to original key if specific key doesn't exist
        if (!file) {
          file = await getFileFromIndexedDB("uploadedDocument");
        }

        if (file) {
          // Clean up previous URL
          if (fileUrl) {
            URL.revokeObjectURL(fileUrl);
          }
          const url = URL.createObjectURL(file);
          setFileUrl(url);
          cleanup = () => URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Error retrieving document file from IndexedDB:", error);
      }

      // Check if audio file exists
      const audioMeta = sessionStorage.getItem("audioFileMeta");
      setHasAudio(!!audioMeta);
    } catch (error) {
      console.error("Error loading files:", error);
    }

    return cleanup;
  };

  useEffect(() => {
    const storedMeta = sessionStorage.getItem("documentFileMeta");
    if (storedMeta) {
      const fileData = JSON.parse(storedMeta);
      if (fileData.allFiles) {
        const currentIndex = fileData.allFiles.findIndex(
          (file: { name: string }) => file.name === fileName
        );
        const initialIndex = currentIndex >= 0 ? currentIndex : 0;
        // Use setTimeout to defer state updates
        setTimeout(() => {
          setAllFiles(fileData.allFiles);
          setCurrentFileIndex(initialIndex);
          // Load file after state updates
          setTimeout(() => loadFile(initialIndex), 0);
        }, 0);
      }
    }
  }, [fileName]);

  useEffect(() => {
    if (allFiles.length > 0) {
      // Load file after state updates
      setTimeout(() => loadFile(currentFileIndex), 0);
      // Update text content for the current file
      const currentFileData = allFiles[currentFileIndex];
      if (currentFileData?.textContent) {
        setTextContent(currentFileData.textContent);
      } else {
        setTextContent("");
      }
    }
  }, [currentFileIndex, allFiles]);

  // Store files in IndexedDB when files are added
  useEffect(() => {
    if (files.length > 0) {
      storeAudioFiles(files)
        .then(() => {
          setHasAudio(true);
        })
        .catch(console.error);
    }
  }, [files, storeAudioFiles]);

  const generateAnalysis = async (text: string) => {
    if (!text) return;
    setIsLoading(true);
    setSummary("");
    setClarifications([]);

    try {
      // Fetch summary and clarifications in parallel
      const [summaryResponse, clarificationsResponse] = await Promise.all([
        fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentText: text }),
        }),
        fetch("/api/clarifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentText: text }),
        }),
      ]);

      if (!summaryResponse.ok || !clarificationsResponse.ok) {
        throw new Error("Failed to generate AI analysis.");
      }

      const { summary: newSummary } = await summaryResponse.json();
      const { clarifications: newClarifications } =
        await clarificationsResponse.json();

      setSummary(newSummary);
      setClarifications(newClarifications);
    } catch (error) {
      console.error(error);
      // Handle errors for the user, e.g., set an error state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (textContent) {
      generateAnalysis(textContent);
    }
  }, [textContent]);

  const handleNextClick = () => {
    if (hasAudio) {
      // Navigate to auto-transcribe page if audio already exists
      const audioMeta = sessionStorage.getItem("audioFileMeta");
      if (audioMeta) {
        const audioData = JSON.parse(audioMeta);
        router.push(
          `/home/auto-transcribe?fileName=${encodeURIComponent(audioData.name)}`
        );
      }
    } else {
      // Show audio upload modal if no audio file
      setShowAudioModal(true);
    }
  };

  const handleAudioModalClose = (open: boolean) => {
    if (!open) {
      setShowAudioModal(false);
      clearFiles();
      if (audioFileRef.current) {
        audioFileRef.current.value = "";
      }
    }
  };

  const handleUploadAndContinue = () => {
    if (files.length > 0) {
      setShowAudioModal(false);
      // Navigate to auto-transcribe with the first audio file name
      const firstFile = files[0].file;
      router.push(
        `/home/auto-transcribe?fileName=${encodeURIComponent(firstFile.name)}`
      );
    }
  };

  return (
    <>
      <div className="mb-6 bg-white flex items-center justify-between p-4">
        <div className="flex items-center gap-4 w-full">
          <FileText className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-black truncate">
            {allFiles[currentFileIndex]?.name || fileName}
          </h2>
        </div>
        <div className="flex items-center justify-center w-full">
          <h2 className="text-center font-bold">AI Analysis Results</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 p-6">
        {/* PDF Viewer */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* File Navigation */}
          {allFiles.length > 1 && (
            <div className="flex items-center justify-between mb-4 p-2 bg-gray-100 rounded-lg">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentFileIndex(Math.max(0, currentFileIndex - 1))
                }
                disabled={currentFileIndex === 0}
              >
                ← Previous
              </Button>
              <span className="text-sm font-medium text-gray-700">
                Document {currentFileIndex + 1} of {allFiles.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentFileIndex(
                    Math.min(allFiles.length - 1, currentFileIndex + 1)
                  )
                }
                disabled={currentFileIndex === allFiles.length - 1}
              >
                Next →
              </Button>
            </div>
          )}

          <div className="aspect-4/5 bg-gray-100 rounded-lg border border-gray-200">
            {fileUrl ? (
              <PDFViewer key={fileUrl} file={fileUrl} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p>Loading document...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : summary ? (
                  <p className="whitespace-pre-wrap">{summary}</p>
                ) : (
                  <p className="text-gray-500">No summary available.</p>
                )}
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                AI Suggested Clarifications
              </h3>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : clarifications.length > 0 ? (
                  clarifications.map((q, i) => (
                    <Card key={i} className="border-0 bg-gray-50 shadow-none">
                      <CardContent className="pt-4">{q}</CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500">
                    No suggestions available.
                  </p>
                )}
              </div>
            </div>

            {/* Next Button */}
            <div className="mt-6">
              <Button
                onClick={handleNextClick}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-400 hover:from-blue-700 hover:to-indigo-500 text-white font-semibold"
              >
                Next to Audio Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Upload Modal */}
      <Dialog open={showAudioModal} onOpenChange={handleAudioModalClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Audio Files</DialogTitle>
            <DialogDescription>
              Please upload your audio files for transcription and analysis.
              Multiple audio files are supported.
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
                ref={audioFileRef}
                aria-label="Upload audio file"
              />
              <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                <div
                  className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                  aria-hidden="true"
                >
                  <Mic className="size-4 opacity-60" />
                </div>
                <p className="mb-1.5 text-sm font-medium">
                  Drop your audio files here
                </p>
                <p className="text-xs text-muted-foreground">
                  Audio files only (MP3, WAV, M4A, OGG, FLAC - max. {maxSizeMB}
                  MB, up to {maxFiles} files)
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => audioFileRef.current?.click()}
                >
                  <Upload className="-ms-1 opacity-60" aria-hidden="true" />
                  Select audio files
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
                        <FileAudio2 className="size-4 text-muted-foreground" />
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
            <Button variant="outline" onClick={() => setShowAudioModal(false)}>
              Cancel
            </Button>
            {files.length > 0 && (
              <Button onClick={handleUploadAndContinue}>
                Upload & Continue to Analysis
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
S