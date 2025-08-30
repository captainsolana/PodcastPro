import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface WaveformVisualizerProps {
  audioUrl: string;
  className?: string;
}

export default function WaveformVisualizer({ audioUrl, className = "" }: WaveformVisualizerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveformBars] = useState(() => 
    // Generate random waveform visualization data
    Array.from({ length: 50 }, () => Math.random() * 80 + 10)
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * duration;
    
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Waveform Display */}
      <div 
        className="bg-muted rounded-lg p-4 cursor-pointer"
        onClick={handleSeek}
        data-testid="waveform-container"
      >
        <div className="flex items-end justify-center space-x-1 h-16 relative">
          {waveformBars.map((height, index) => (
            <div
              key={index}
              className="waveform-bar transition-all duration-200"
              style={{ 
                height: `${height}%`,
                opacity: (index / waveformBars.length) * 100 <= progress ? 1 : 0.3
              }}
            />
          ))}
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={togglePlayPause}
          size="sm"
          className="w-12 h-12 rounded-full p-0"
          data-testid="button-play-pause"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        
        <div className="flex-1">
          <div className="bg-muted rounded-full h-2 relative overflow-hidden">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span data-testid="text-current-time">{formatTime(currentTime)}</span>
            <span data-testid="text-total-duration">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
