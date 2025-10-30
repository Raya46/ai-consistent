"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import VideoPlayer from "@/components/VideoPlayer";
import { useState, useEffect } from "react";

export default function AutoTranscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fileUrl, setFileUrl] = useState("");
  const fileName = searchParams.get("fileName") || "Interview.mp4";

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const loadFile = async () => {
      try {
        // Get file metadata from sessionStorage
        const storedMeta = sessionStorage.getItem("uploadedFileMeta");
        if (!storedMeta) {
          console.error("No file metadata found in sessionStorage");
          return;
        }

        // Get file from IndexedDB
        const dbName = "FileStorageDB";
        const storeName = "files";

        const request = indexedDB.open(dbName, 1);

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction([storeName], "readonly");
          const store = transaction.objectStore(storeName);

          const getRequest = store.get("uploadedFile");

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
              console.error("No file found in IndexedDB");
            }
          };

          getRequest.onerror = () => {
            console.error("Error retrieving file from IndexedDB");
          };
        };

        request.onerror = () => {
          console.error("Error opening IndexedDB");
        };
      } catch (error) {
        console.error("Error loading file:", error);
      }
    };

    loadFile();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

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
        {/* Video Player Section */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg shadow-lg p-6">
            <VideoPlayer file={fileUrl} fileName={fileName} />
          </div>

          {/* Speakers List Section */}
          <div className="bg-gray-50 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Speakers Detected</h3>
            <div className="space-y-3">
              {[
                { id: 1, name: "Kenny", color: "bg-blue-500" },
                {
                  id: 2,
                  name: "Interviewer",
                  color: "bg-green-500",
                },
                {
                  id: 3,
                  name: "Sarah",
                  color: "bg-purple-500",
                },
              ].map((speaker) => (
                <div
                  key={speaker.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className={`${speaker.color} text-white font-semibold`}
                      >
                        {speaker.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {speaker.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transcript Section */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">AI Transcript</h2>

            <Card className="border-2 border-red-200 bg-gray-50 mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <CardTitle className="text-red-700">
                    Inconsistency Detected
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-red-600">
                Several responses during the interview contradict information
                provided in submitted documents.
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="flex items-start space-x-4 p-4">
                    <span className="text-sm text-gray-500">00:03</span>
                    <div>
                      <span className="font-semibold">Kenny</span>
                      <p>Hi, kamu sedang interview</p>
                    </div>
                  </div>
                  {/* Add more transcript entries */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
