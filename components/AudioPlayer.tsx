"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
} from "lucide-react";

interface AudioPlayerProps {
  file: string;
  fileName: string;
}

export default function AudioPlayer({ file, fileName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sliderMax, setSliderMax] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !file) return;

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
  }, [file]);

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

    // Use sliderMax which is updated when duration is available
    const audioDuration = duration && isFinite(duration) ? duration : sliderMax;
    if (!isFinite(audioDuration)) return;

    const newTime = Math.min(Math.max(0, value[0]), audioDuration);
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

    // Use sliderMax which is updated when duration is available
    const audioDuration = duration && isFinite(duration) ? duration : sliderMax;
    const newTime = Math.min(audioDuration, audio.currentTime + 10);
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

    const rates = [1, 1.5, 2];
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
    <div className="space-y-4">
      {/* File Name Card */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Music className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-gray-900 truncate"
              title={fileName}
            >
              {fileName}
            </h3>
            <p className="text-sm text-gray-500">
              {duration > 0 ? formatTime(duration) : "Loading..."} • Audio File
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {hasError && (
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <VolumeX className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-lg font-semibold text-red-900">
              Error loading audio file
            </p>
            <p className="text-sm text-red-700">Please try uploading again</p>
          </div>
        </div>
      )}

      {/* Audio Controls */}
      {!hasError && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
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
          <div className="flex items-center justify-center">
            {/* Playback Speed */}
            <Button
              variant="outline"
              size="sm"
              onClick={cyclePlaybackRate}
              className="text-xs"
            >
              {playbackRate}x
            </Button>

            <div className="flex items-center gap-3">
              {/* Skip Backward */}
              <Button
                variant="ghost"
                size="sm"
                onClick={skipBackward}
                className="text-gray-700 hover:bg-gray-200"
                disabled={!file || isLoading}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlay}
                className="bg-gradient-to-b from-blue-600 to-indigo-400 text-white hover:from-blue-700 hover:to-indigo-500 rounded-full w-12 h-12 p-0"
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
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
                disabled={!file || isLoading}
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              {/* Mute/Unmute */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-gray-700 hover:bg-gray-200"
                disabled={!file}
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
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={file} className="hidden" />
    </div>
  );
}
