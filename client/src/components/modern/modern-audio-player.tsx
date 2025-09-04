import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/ui/icon-registry';

interface ModernAudioPlayerProps {
  audioUrl?: string;
  title?: string;
  duration?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  className?: string;
}

export const ModernAudioPlayer: React.FC<ModernAudioPlayerProps> = ({
  audioUrl,
  title = "Podcast Audio",
  duration = 0,
  onPlay,
  onPause,
  onStop,
  className
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Generate mock waveform data
  const waveformData = Array.from({ length: 60 }, () => Math.random() * 0.8 + 0.2);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadstart', () => setIsLoading(true));
    audio.addEventListener('canplay', () => setIsLoading(false));
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadstart', () => setIsLoading(true));
      audio.removeEventListener('canplay', () => setIsLoading(false));
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      audio.play();
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    onStop?.();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progress = progressRef.current;
    if (!audio || !progress || !duration) return;

    const rect = progress.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const playProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn(
      "glass-surface card-modern p-6 space-y-4",
      className
    )}>
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-heading-sm text-text-primary">{title}</h3>
          <p className="text-body-sm text-muted">Studio Quality Audio</p>
        </div>
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-muted">
            <AppIcon name="loading" className="w-4 h-4 animate-spin" />
            <span className="text-body-sm">Loading...</span>
          </div>
        )}
      </div>

      {/* Waveform visualization */}
      <div className="relative h-20 bg-elevated rounded-lg overflow-hidden cursor-pointer group"
           onClick={handleSeek}
           ref={progressRef}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-accent-soft opacity-50" />
        
        {/* Waveform bars */}
        <div className="flex items-center justify-center h-full px-2">
          {waveformData.map((amplitude, index) => (
            <div
              key={index}
              className={cn(
                "w-1 mx-px rounded-full transition-all duration-150",
                isPlaying && index < (playProgress / 100) * waveformData.length
                  ? "bg-accent-primary shadow-glow-primary/50"
                  : "bg-muted/40"
              )}
              style={{
                height: `${Math.max(4, amplitude * 70)}%`,
                animationDelay: `${index * 50}ms`
              }}
            />
          ))}
        </div>
        
        {/* Play progress overlay */}
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-primary/30 to-transparent pointer-events-none transition-all duration-300"
          style={{ width: `${playProgress}%` }}
        />

        {/* Hover indicator */}
        <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {/* Transport controls */}
        <div className="flex items-center space-x-2">
          <button
            className="control-button"
            onClick={handleStop}
            disabled={!audioUrl}
            aria-label="Stop"
          >
            <AppIcon name="circle" className="w-4 h-4" />
          </button>
          
          <button
            className={cn(
              "control-button w-12 h-12 text-white",
              isPlaying ? "bg-accent-primary shadow-glow-primary" : "bg-gradient-primary"
            )}
            onClick={handlePlayPause}
            disabled={!audioUrl || isLoading}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isLoading ? (
              <AppIcon name="loading" className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <AppIcon name="pause" className="w-5 h-5" />
            ) : (
              <AppIcon name="play" className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </div>
        
        {/* Time display */}
        <div className="flex-1 px-4">
          <div className="text-body-sm font-mono text-secondary">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          {/* Progress bar for mobile */}
          <div className="mt-1 progress-bar h-1">
            <div 
              className="progress-fill"
              style={{ width: `${playProgress}%` }}
            />
          </div>
        </div>
        
        {/* Volume control */}
        <div className="flex items-center space-x-2">
          <AppIcon name={volume > 0 ? "volume" : "volumeMute"} className="w-4 h-4 text-muted" />
          <div className="w-20 h-2 bg-elevated rounded-full cursor-pointer group">
            <div 
              className="h-full bg-gradient-primary rounded-full transition-all duration-200 group-hover:shadow-glow-primary/50"
              style={{ width: `${volume}%` }}
            />
          </div>
        </div>

        {/* Download button */}
        {audioUrl && (
          <a
            href={audioUrl}
            download
            className="control-button hover-glow"
            aria-label="Download audio"
          >
            <AppIcon name="download" className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Status indicators */}
      <div className="flex items-center justify-between text-body-xs">
        <div className="flex items-center space-x-4">
          {isPlaying && (
            <div className="flex items-center space-x-1 text-success">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Playing</span>
            </div>
          )}
          
          {audioUrl && !isLoading && (
            <div className="flex items-center space-x-1 text-accent-primary">
              <AppIcon name="success" className="w-3 h-3" />
              <span>Ready</span>
            </div>
          )}
        </div>
        
        <div className="text-muted">
          Quality: Studio (48kHz)
        </div>
      </div>
    </div>
  );
};

export default ModernAudioPlayer;
