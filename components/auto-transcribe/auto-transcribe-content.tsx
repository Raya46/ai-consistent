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
import { Skeleton } from "@/components/ui/skeleton";
import Loader from "@/components/ui/loader";

interface AudioFileData {
  name: string;
  size: number;
  type: string;
  key: string;
}

interface AnalysisResult {
  assessment: {
    overallScore: number;
    consistencyScore: number;
    clarityScore: number;
    completenessScore: number;
    summary: string;
    recommendation: string;
  };
  analysis: {
    inconsistent: any[];
    needClarification: any[];
    aligned: any[];
  };
}

export default function AutoTranscribeContent() {
  const router = useRouter();

  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("Interview.mp3");
  const [audioFiles, setAudioFiles] = useState<AudioFileData[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const { getFileFromIndexedDB } = useFileStorage();

  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  useEffect(() => {
    const runAnalysis = async (fileKey: string) => {
      setIsLoading(true);
      setAnalysisResult(null);

      try {
        setLoadingStatus("Retrieving context...");
        const summary = JSON.parse(
          sessionStorage.getItem("documentSummary") || '""'
        );
        const questions = JSON.parse(
          sessionStorage.getItem("verificationQuestions") || "[]"
        );

        setLoadingStatus("Loading audio file...");
        const audioFile = await getFileFromIndexedDB(fileKey);
        if (!audioFile) {
          console.error(`Audio file with key ${fileKey} not found.`);
          setIsLoading(false);
          return;
        }

        const url = URL.createObjectURL(audioFile);
        setFileUrl(url);
        setFileName(audioFile.name);

        setLoadingStatus("Transcribing audio...");
        const formData = new FormData();
        formData.append("audio", audioFile);
        const transcribeResponse = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });
        if (!transcribeResponse.ok) throw new Error("Transcription failed.");
        const { transcript } = await transcribeResponse.json();

        setLoadingStatus("Analyzing interview...");
        const analysisResponse = await fetch("/api/analyze-interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary, questions, transcript }),
        });
        if (!analysisResponse.ok) throw new Error("Analysis failed.");
        const analysisData = await analysisResponse.json();
        setAnalysisResult(analysisData);
      } catch (error) {
        console.error("An error occurred during the analysis process:", error);
        setLoadingStatus("An error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    const loadInitialData = async () => {
      const storedMeta = sessionStorage.getItem("audioFileMeta");
      if (storedMeta) {
        const fileData = JSON.parse(storedMeta);
        if (fileData.allFiles && fileData.allFiles.length > 0) {
          setAudioFiles(fileData.allFiles);
          runAnalysis(fileData.allFiles[0].key);
        }
      }
    };

    loadInitialData();
  }, [getFileFromIndexedDB]);

  const handleAudioFileSelect = async (indexStr: string) => {
    const fileIndex = parseInt(indexStr, 10);
    const selectedFile = audioFiles[fileIndex];
    if (selectedFile) {
      setCurrentAudioIndex(fileIndex);
      const runAnalysis = async (fileKey: string) => {
        setIsLoading(true);
        setAnalysisResult(null);

        try {
          setLoadingStatus("Retrieving context...");
          const summary = JSON.parse(
            sessionStorage.getItem("documentSummary") || '""'
          );
          const questions = JSON.parse(
            sessionStorage.getItem("verificationQuestions") || "[]"
          );

          setLoadingStatus("Loading audio file...");
          const audioFile = await getFileFromIndexedDB(fileKey);
          if (!audioFile) {
            console.error(`Audio file with key ${fileKey} not found.`);
            setIsLoading(false);
            return;
          }

          if (fileUrl) URL.revokeObjectURL(fileUrl);
          const url = URL.createObjectURL(audioFile);
          setFileUrl(url);
          setFileName(audioFile.name);

          setLoadingStatus("Transcribing audio...");
          const formData = new FormData();
          formData.append("audio", audioFile);
          const transcribeResponse = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });
          if (!transcribeResponse.ok) throw new Error("Transcription failed.");
          const { transcript } = await transcribeResponse.json();

          setLoadingStatus("Analyzing interview...");
          const analysisResponse = await fetch("/api/analyze-interview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ summary, questions, transcript }),
          });
          if (!analysisResponse.ok) throw new Error("Analysis failed.");
          const analysisData = await analysisResponse.json();
          setAnalysisResult(analysisData);
        } catch (error) {
          console.error(
            "An error occurred during the analysis process:",
            error
          );
          setLoadingStatus("An error occurred.");
        } finally {
          setIsLoading(false);
        }
      };
      runAnalysis(selectedFile.key);
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
        {isLoading ? (
          <>
            <div className="space-y-6">
              <Loader status={loadingStatus} />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full" />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-6">
              {analysisResult && (
                <AssessmentSummary data={analysisResult.assessment} />
              )}
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
              </div>
            </div>
            <div className="space-y-6">
              {analysisResult && (
                <InconsistencyAnalysis data={analysisResult.analysis} />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
