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
} from "lucide-react";

interface VideoPlayerProps {
  file: string;
  fileName: string;
}

export default function VideoPlayer({ file, fileName }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(duration, video.currentTime + 10);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cyclePlaybackRate = () => {
    const video = videoRef.current;
    if (!video) return;

    const rates = [1, 2, 0.5];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const nextRate = rates[nextIndex];

    video.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getFileType = () => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (["mp4", "webm", "ogg"].includes(extension || "")) {
      return "video";
    }
    return "audio";
  };

  const isVideo = getFileType() === "video";

  return (
    <div className="space-y-4">
      {/* File Name */}
      <div className="text-center">
        <p className="text-gray-900 font-medium truncate">{fileName}</p>
      </div>

      {/* Video Player */}
      <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative">
        {isVideo ? (
          <video
            ref={videoRef}
            src={file}
            className="w-full h-full rounded-lg"
            controls={false}
          />
        ) : (
          <audio ref={videoRef} src={file} className="hidden" />
        )}

        {/* Audio Only Display */}
        {!isVideo && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Volume2 className="h-8 w-8" />
              </div>
              <p className="text-lg font-semibold">{fileName}</p>
              <p className="text-sm opacity-75">Audio File</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Outside Video */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        {/* Progress Bar */}
        <div>
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
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
    </div>
  );
}
