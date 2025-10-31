"use client";

import AudioPlayer from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFileStorage } from "@/hooks/use-file-storage";
import { formatBytes } from "@/hooks/use-file-upload";
import { ChevronDown, ChevronRight, FileAudio2, Mic } from "lucide-react";
import { useEffect, useState } from "react";
import AssessmentSummary from "./assessment-summary";
import InconsistencyAnalysis from "./inconsistency-analysis";
import SpeakersList from "./speakers-list";
import { useRouter } from "next/navigation";

interface AudioFileData {
  name: string;
  size: number;
  type: string;
  key: string;
}

export default function AutoTranscribeContent() {
  const router = useRouter();

  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("Interview.mp3");
  const [audioFiles, setAudioFiles] = useState<AudioFileData[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const { getFileFromIndexedDB } = useFileStorage();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const loadFile = async () => {
      try {
        // Get audio file metadata from sessionStorage
        const storedMeta = sessionStorage.getItem("audioFileMeta");
        if (!storedMeta) {
          console.error("No audio file metadata found in sessionStorage");
          return;
        }

        const fileData = JSON.parse(storedMeta);
        setFileName(fileData.name || "Interview.mp3");

        // Handle multiple audio files
        if (fileData.allFiles && fileData.allFiles.length > 0) {
          setAudioFiles(fileData.allFiles);
        }

        // Get audio file from IndexedDB using the hook
        const file = await getFileFromIndexedDB("uploadedAudio");
        if (file) {
          const url = URL.createObjectURL(file);
          setFileUrl(url);
          cleanup = () => {
            URL.revokeObjectURL(url);
          };
        } else {
          console.error("No audio file found in IndexedDB");
        }
      } catch (error) {
        console.error("Error loading file:", error);
      }
    };

    loadFile();

    return () => {
      if (cleanup) cleanup();
    };
  }, [getFileFromIndexedDB]);

  const handleAudioFileSelect = async (index: string) => {
    const fileIndex = parseInt(index);
    try {
      const audioFile = audioFiles[fileIndex];
      if (audioFile) {
        const file = await getFileFromIndexedDB(audioFile.key);
        if (file) {
          // Clean up previous URL
          if (fileUrl) {
            URL.revokeObjectURL(fileUrl);
          }

          const url = URL.createObjectURL(file);
          setFileUrl(url);
          setFileName(file.name);
          setCurrentAudioIndex(fileIndex);
        }
      }
    } catch (error) {
      console.error("Error loading audio file:", error);
    }
  };

  return (
    <>
      <div className="mb-6 bg-white flex items-center justify-between p-4">
        <div className="flex items-center gap-4 w-full">
          <FileAudio2 className="h-5 w-5 text-red-600" />
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-black truncate">
              {fileName}
            </h2>
            {/* Audio Files Dropdown - Only show if there are multiple files */}
            {audioFiles.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <DropdownMenuLabel>
                    Audio Files ({audioFiles.length})
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={currentAudioIndex.toString()}
                    onValueChange={handleAudioFileSelect}
                  >
                    {audioFiles.map((audioFile, index) => (
                      <DropdownMenuRadioItem
                        key={audioFile.key}
                        value={index.toString()}
                        className="flex flex-col items-start py-3"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Mic className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {audioFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatBytes(audioFile.size)}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between w-1/2">
          <h2 className="text-center font-bold">AI Analysis Results</h2>
          <Button
            onClick={() => router.replace("/home")}
            className="bg-blue-600 flex justify-end items-center"
          >
            <p>Done</p>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AssessmentSummary />
          <div className="bg-white rounded-lg shadow-lg p-6">
            {fileUrl ? (
              <AudioPlayer file={fileUrl} fileName={fileName} />
            ) : (
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <FileAudio2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Loading audio file...</p>
                </div>
              </div>
            )}
            <SpeakersList />
          </div>
        </div>

        <div className="space-y-6">
          {/* Inconsistency Analysis */}
          <InconsistencyAnalysis />
        </div>
      </div>
    </>
  );
}
