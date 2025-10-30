"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChevronLeft, FileText, Mic } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import PDFViewer from "@/components/PDFViewer";
import { useState, useEffect, useRef } from "react";

export default function DocumentAnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fileUrl, setFileUrl] = useState("");
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const fileName = searchParams.get("fileName") || "Document.pdf";
  const audioFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const loadFile = async () => {
      try {
        // Get document file metadata from sessionStorage
        const storedMeta = sessionStorage.getItem("documentFileMeta");
        if (!storedMeta) {
          console.error("No document file metadata found in sessionStorage");
          return;
        }

        // Get document file from IndexedDB
        const dbName = "FileStorageDB";
        const storeName = "files";

        const request = indexedDB.open(dbName, 1);

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction([storeName], "readonly");
          const store = transaction.objectStore(storeName);

          const getRequest = store.get("uploadedDocument");

          getRequest.onsuccess = () => {
            const file = getRequest.result;
            if (file) {
              const url = URL.createObjectURL(file);

              // Use setTimeout to avoid synchronous setState in effect
              setTimeout(() => setFileUrl(url), 0);

              // Store cleanup function
              cleanup = () => {
                URL.revokeObjectURL(url);
              };
            } else {
              console.error("No document file found in IndexedDB");
            }
          };

          getRequest.onerror = () => {
            console.error("Error retrieving document file from IndexedDB");
          };
        };

        request.onerror = () => {
          console.error("Error opening IndexedDB");
        };

        // Check if audio file exists
        const audioMeta = sessionStorage.getItem("audioFileMeta");
        setHasAudio(!!audioMeta);
      } catch (error) {
        console.error("Error loading file:", error);
      }
    };

    loadFile();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const handleAudioUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Store audio file in IndexedDB
        const dbName = "FileStorageDB";
        const storeName = "files";

        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction([storeName], "readwrite");
          const store = transaction.objectStore(storeName);

          store.put(file, "uploadedAudio");

          transaction.oncomplete = () => {
            // Store audio file metadata in sessionStorage
            const fileData = {
              type: file.type,
              name: file.name,
              size: file.size,
              lastModified: file.lastModified,
              fileType: "audio",
            };
            sessionStorage.setItem("audioFileMeta", JSON.stringify(fileData));
            setHasAudio(true);
            setShowAudioModal(false);

            // Navigate to auto-transcribe page
            router.push(
              `/home/auto-transcribe?fileName=${encodeURIComponent(file.name)}`
            );
          };

          transaction.onerror = () => {
            console.error("Error storing audio file in IndexedDB");
          };
        };

        request.onerror = () => {
          console.error("Error opening IndexedDB");
        };
      } catch (error) {
        console.error("Error processing audio file:", error);
      }
    }
  };

  const handleAudioDropAreaClick = () => {
    audioFileRef.current?.click();
  };

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
      if (audioFileRef.current) {
        audioFileRef.current.value = "";
      }
    }
  };

  return (
    <>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Audio File</DialogTitle>
            <DialogDescription>
              Please upload an audio file for transcription and analysis.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="audio-upload">Choose Audio File</Label>
              <Input
                id="audio-upload"
                type="file"
                ref={audioFileRef}
                accept="audio/*"
                onChange={handleAudioUpload}
                className="cursor-pointer"
              />
            </div>

            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
              onClick={handleAudioDropAreaClick}
            >
              <Mic className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Click to upload or drag and drop
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                Audio files only (MP3, WAV, M4A, etc.)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAudioModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
