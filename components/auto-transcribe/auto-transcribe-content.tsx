"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function AutoTranscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fileUrl, setFileUrl] = useState("");
  const fileName = searchParams.get("fileName") || "Interview.mp3";
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sliderMax, setSliderMax] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const speakers = [
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
  ];

  // Mock scoring data
  const scoringData = {
    overallScore: 85,
    consistencyScore: 78,
    clarityScore: 92,
    completenessScore: 88,
    speakerCount: 3,
    duration: "45:32",
    wordCount: 5432,
    keyTopics: ["Experience", "Education", "Skills", "Projects"],
  };

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

        // Get audio file from IndexedDB
        const dbName = "FileStorageDB";
        const storeName = "files";

        const request = indexedDB.open(dbName, 1);

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction([storeName], "readonly");
          const store = transaction.objectStore(storeName);

          const getRequest = store.get("uploadedAudio");

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
              console.error("No audio file found in IndexedDB");
            }
          };

          getRequest.onerror = () => {
            console.error("Error retrieving audio file from IndexedDB");
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !fileUrl) return;

    setTimeout(() => {
      setIsLoading(true);
      setHasError(false);
    }, 0);

    const updateTime = () => {
      if (audio && !isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };

    const updateDuration = () => {
      if (audio && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setSliderMax(audio.duration);
      }
    };

    const handleLoadedData = () => {
      if (audio && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setSliderMax(audio.duration);
        setTimeout(() => setIsLoading(false), 0);
      }
    };

    const handleCanPlay = () => {
      setTimeout(() => setIsLoading(false), 0);
    };

    const handleError = () => {
      setTimeout(() => {
        setHasError(true);
        setIsLoading(false);
      }, 0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("durationchange", handleLoadedData);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("durationchange", handleLoadedData);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [fileUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const videoDuration = duration && isFinite(duration) ? duration : sliderMax;
    if (!isFinite(videoDuration)) return;

    const newTime = Math.min(Math.max(0, value[0]), videoDuration);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, audio.currentTime - 10);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const videoDuration = duration && isFinite(duration) ? duration : sliderMax;
    const newTime = Math.min(videoDuration, audio.currentTime + 10);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cyclePlaybackRate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const rates = [1, 2, 0.5];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const nextRate = rates[nextIndex];

    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
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
        {/* Left Column - Audio Controller and Assessment */}
        <div className="space-y-6">
          {/* Assessment Summary */}
          <div className="bg-gray-50 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Assessment Summary
            </h2>

            {/* Overall Score */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Overall Score
                  <Badge variant="secondary" className="text-2xl px-4 py-2">
                    {scoringData.overallScore}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={scoringData.overallScore} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">
                  Based on consistency, clarity, and completeness metrics
                </p>
              </CardContent>
            </Card>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Consistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {scoringData.consistencyScore}%
                  </div>
                  <Progress
                    value={scoringData.consistencyScore}
                    className="h-2 mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Clarity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {scoringData.clarityScore}%
                  </div>
                  <Progress
                    value={scoringData.clarityScore}
                    className="h-2 mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Completeness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {scoringData.completenessScore}%
                  </div>
                  <Progress
                    value={scoringData.completenessScore}
                    className="h-2 mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-white rounded-lg border">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-semibold">
                  {scoringData.speakerCount}
                </div>
                <div className="text-sm text-gray-600">Speakers</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-semibold">
                  {scoringData.duration}
                </div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-semibold">
                  {scoringData.wordCount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Words</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border">
                <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-semibold">
                  {scoringData.keyTopics.length}
                </div>
                <div className="text-sm text-gray-600">Topics</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg shadow-lg p-4">
            <div className="text-center mb-4">
              <p className="text-gray-900 font-medium truncate">{fileName}</p>
            </div>

            {/* Controls */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {/* Progress Bar */}
              <div>
                <Slider
                  value={[currentTime]}
                  max={duration && isFinite(duration) ? duration : sliderMax}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>
                    {formatTime(duration && isFinite(duration) ? duration : 0)}
                  </span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cyclePlaybackRate}
                    className="text-xs"
                  >
                    {playbackRate}x
                  </Button>
                  {/* Skip Backward */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipBackward}
                    className="text-gray-700 hover:bg-gray-200"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  {/* Play/Pause */}
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={togglePlay}
                    className="bg-gradient-to-b from-blue-600 to-indigo-400 text-white hover:from-blue-700 hover:to-indigo-500 rounded-full w-12 h-12 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>

                  {/* Skip Forward */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipForward}
                    className="text-gray-700 hover:bg-gray-200"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  {/* Mute/Unmute */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-gray-700 hover:bg-gray-200"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-4">Speakers Detected</h3>
            <div className="space-y-3">
              {speakers.map((speaker) => (
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

        {/* Right Column - Inconsistency and Speakers */}
        <div className="space-y-6">
          {/* Inconsistency Alert */}
          <Card className="bg-red-50 mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-red-700">
                  Inconsistency Detected
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm">
                  Document: Reported annual revenue = 100,000,000 IDR
                </p>
                <p className="text-sm">
                  Interview: Reported annual revenue = 200,000,000 IDR
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden Audio Element */}
      {fileUrl && <audio ref={audioRef} src={fileUrl} className="hidden" />}
    </>
  );
}
