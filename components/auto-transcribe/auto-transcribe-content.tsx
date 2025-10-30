"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  HelpCircle,
  CheckCheck,
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

  // Mock inconsistency data
  const inconsistencyData = {
    inconsistent: [
      {
        id: 1,
        title: "Annual Revenue",
        document: "Reported annual revenue = 100,000,000 IDR",
        interview: "Reported annual revenue = 200,000,000 IDR",
        severity: "high",
      },
      {
        id: 2,
        title: "Work Experience",
        document: "Previous company duration = 2 years",
        interview: "Previous company duration = 3 years",
        severity: "medium",
      },
    ],
    needClarification: [
      {
        id: 3,
        title: "Project Timeline",
        document: "Project completed in Q4 2023",
        interview: "Project finished around end of year",
        severity: "low",
      },
      {
        id: 4,
        title: "Team Size",
        document: "Managed team of 5-7 people",
        interview: "Led a small team",
        severity: "low",
      },
    ],
    aligned: [
      {
        id: 5,
        title: "Education",
        document: "Bachelor's degree in Computer Science",
        interview: "CS graduate from university",
        severity: "none",
      },
      {
        id: 6,
        title: "Technical Skills",
        document: "Proficient in React, Node.js, Python",
        interview: "Experience with React, Node.js, Python",
        severity: "none",
      },
    ],
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

        {/* Right Column - Inconsistency Analysis (Main View) */}
        <div className="space-y-6">
          {/* Inconsistency Analysis Header */}
          <div className="bg-gray-50 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              Inconsistency Analysis
            </h2>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {inconsistencyData.inconsistent.length}
                </div>
                <div className="text-sm text-gray-600">Inconsistent</div>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <HelpCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">
                  {inconsistencyData.needClarification.length}
                </div>
                <div className="text-sm text-gray-600">Need Clarification</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {inconsistencyData.aligned.length}
                </div>
                <div className="text-sm text-gray-600">Aligned</div>
              </div>
            </div>

            {/* Inconsistent Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Inconsistent
              </h3>
              <div className="space-y-3">
                {inconsistencyData.inconsistent.map((item) => (
                  <Card key={item.id} className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {item.title}
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                              <span className="font-medium">Document:</span>{" "}
                              {item.document}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Interview:</span>{" "}
                              {item.interview}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Need Clarification Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-yellow-500" />
                Need Clarification
              </h3>
              <div className="space-y-3">
                {inconsistencyData.needClarification.map((item) => (
                  <Card
                    key={item.id}
                    className="border-yellow-200 bg-yellow-50"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {item.title}
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                              <span className="font-medium">Document:</span>{" "}
                              {item.document}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Interview:</span>{" "}
                              {item.interview}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Aligned Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCheck className="h-5 w-5 text-green-500" />
                Aligned
              </h3>
              <div className="space-y-3">
                {inconsistencyData.aligned.map((item) => (
                  <Card key={item.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {item.title}
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                              <span className="font-medium">Document:</span>{" "}
                              {item.document}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Interview:</span>{" "}
                              {item.interview}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      {fileUrl && <audio ref={audioRef} src={fileUrl} className="hidden" />}
    </>
  );
}
