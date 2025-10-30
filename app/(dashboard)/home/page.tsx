"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, FileText, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    document?: boolean;
    audio?: boolean;
  }>({});
  const documentFileRef = useRef<HTMLInputElement>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);

  const features = [
    {
      icon: FileText,
      title: "Document Analysis",
      description:
        "Extract key data and instantly generate required clarification questions",
    },
    {
      icon: Mic,
      title: "Auto Transcribe",
      description:
        "Convert audio interviews into searchable text with speaker detection",
    },
    {
      icon: BarChart3,
      title: "Risk Dashboard",
      description:
        "Visualize and track key risk indicators across your verification process",
    },
  ];

  // Clear sessionStorage and IndexedDB when component mounts
  useEffect(() => {
    const clearFileData = async () => {
      try {
        // Clear sessionStorage
        sessionStorage.removeItem("documentFileMeta");
        sessionStorage.removeItem("audioFileMeta");

        // Clear IndexedDB
        const dbName = "FileStorageDB";
        const storeName = "files";

        const request = indexedDB.open(dbName, 1);

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (db.objectStoreNames.contains(storeName)) {
            const transaction = db.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);

            // Clear all files from the store
            store.clear();

            transaction.oncomplete = () => {
              console.log("IndexedDB cleared successfully");
            };

            transaction.onerror = () => {
              console.error("Error clearing IndexedDB");
            };
          }
        };

        request.onerror = () => {
          console.error("Error opening IndexedDB for clearing");
        };
      } catch (error) {
        console.error("Error clearing file data:", error);
      }
    };

    clearFileData();
  }, []);

  const handleFileUpload = async (
    fileType: "document" | "audio",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Store file in IndexedDB for larger capacity
        const dbName = "FileStorageDB";
        const storeName = "files";

        // Open IndexedDB
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

          // Store the file with appropriate key
          const storeKey =
            fileType === "document" ? "uploadedDocument" : "uploadedAudio";
          store.put(file, storeKey);

          transaction.oncomplete = () => {
            // Store file metadata in sessionStorage
            const fileData = {
              type: file.type,
              name: file.name,
              size: file.size,
              lastModified: file.lastModified,
              fileType: fileType,
            };
            sessionStorage.setItem(
              `${fileType}FileMeta`,
              JSON.stringify(fileData)
            );

            // Update uploaded files state and check if both files are uploaded
            setUploadedFiles((prev) => {
              const updatedState = { ...prev, [fileType]: true };

              // Only auto-navigate if both files are uploaded in this session
              if (updatedState.document && updatedState.audio) {
                const documentMeta = sessionStorage.getItem("documentFileMeta");
                if (documentMeta) {
                  const documentData = JSON.parse(documentMeta);
                  router.push(
                    `/home/document-analysis?fileName=${encodeURIComponent(
                      documentData.name
                    )}`
                  );
                }
              }

              return updatedState;
            });
          };

          transaction.onerror = () => {
            console.error("Error storing file in IndexedDB");
          };
        };

        request.onerror = () => {
          console.error("Error opening IndexedDB");
        };
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }
  };

  const handleDropAreaClick = (fileType: "document" | "audio") => {
    const inputRef = fileType === "document" ? documentFileRef : audioFileRef;
    inputRef.current?.click();
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
      setUploadedFiles({});
      // Reset file inputs
      if (documentFileRef.current) {
        documentFileRef.current.value = "";
      }
      if (audioFileRef.current) {
        audioFileRef.current.value = "";
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
            onClick={() => setShowUploadModal(true)}
          >
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-b from-blue-600 to-indigo-400 flex items-center justify-center mb-4">
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
      <Dialog open={showUploadModal} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Files for Analysis</DialogTitle>
            <DialogDescription>
              Please upload your document and audio files for consistency
              checking.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Document Upload */}
            <div className="grid gap-2">
              <Label htmlFor="document-upload" className="font-medium">
                <FileText className="h-4 w-4 inline mr-2" />
                Document (PDF)
              </Label>
              <Input
                id="document-upload"
                type="file"
                ref={documentFileRef}
                accept=".pdf"
                onChange={(e) => handleFileUpload("document", e)}
                className="cursor-pointer"
              />
            </div>

            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
              onClick={() => handleDropAreaClick("document")}
            >
              <FileText className="h-8 w-8 text-gray-400 mb-2 mx-auto" />
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Upload PDF document for analysis
              </p>
            </div>

            {/* Audio Upload */}
            <div className="grid gap-2">
              <Label htmlFor="audio-upload" className="font-medium">
                <Mic className="h-4 w-4 inline mr-2" />
                Audio File
              </Label>
              <Input
                id="audio-upload"
                type="file"
                ref={audioFileRef}
                accept="audio/*"
                onChange={(e) => handleFileUpload("audio", e)}
                className="cursor-pointer"
              />
            </div>

            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
              onClick={() => handleDropAreaClick("audio")}
            >
              <Mic className="h-8 w-8 text-gray-400 mb-2 mx-auto" />
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Upload audio file for transcriptions
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            {uploadedFiles.document && !uploadedFiles.audio && (
              <Button onClick={handleContinue}>Continue</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
