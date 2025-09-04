import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AppIcon } from "@/components/ui/icon-registry";

interface WaveformVisualizerProps {
  audioUrl: string;
  className?: string;
}

export default function WaveformVisualizer({ audioUrl, className = "" }: WaveformVisualizerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [waveformBars] = useState(() => 
    // Generate random waveform visualization data
    Array.from({ length: 60 }, () => Math.random() * 80 + 10)
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

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        console.log('Attempting to play audio from URL:', audioUrl);
        console.log('Audio element ready state:', audio.readyState);
        console.log('Audio element src:', audio.src);
        
        // Wait for the audio to be ready to play
        if (audio.readyState < 3) {
          console.log('Audio not ready, loading...');
          await new Promise((resolve) => {
            const onCanPlay = () => {
              audio.removeEventListener('canplay', onCanPlay);
              resolve(true);
            };
            audio.addEventListener('canplay', onCanPlay);
            audio.load();
          });
        }
        
        await audio.play();
        setIsPlaying(true);
        console.log('Audio playing successfully');
      } catch (error) {
        console.error('Failed to play audio:', error);
        console.error('Audio URL:', audioUrl);
        console.error('Audio src:', audio.src);
        console.error('Audio error:', audio.error);
        // Reset playing state if play fails
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || isDragging) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * duration;
    
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleSliderChange = (value: number[]) => {
    const newTime = value[0];
    setDragTime(newTime);
    
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleSliderCommit = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setIsDragging(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const displayTime = isDragging ? dragTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Enhanced Waveform Display with Visual Scrubbing */}
      <div 
        className="bg-muted rounded-lg p-4 cursor-pointer hover:bg-muted/80 transition-colors"
        onClick={handleSeek}
        data-testid="waveform-container"
      >
        <div className="flex items-end justify-center space-x-1 h-20 relative">
          {waveformBars.map((height, index) => {
            const barProgress = (index / waveformBars.length) * 100;
            const isActive = barProgress <= progress;
            const isHover = isDragging && Math.abs(barProgress - progress) < 2;
            
            return (
              <div
                key={index}
                className={`bg-primary transition-all duration-150 rounded-sm ${
                  isActive ? 'opacity-100' : 'opacity-30'
                } ${isHover ? 'scale-110 bg-primary/80' : ''}`}
                style={{ 
                  height: `${height}%`,
                  width: '3px',
                  minHeight: '4px'
                }}
              />
            );
          })}
          
          {/* Playhead indicator */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg pointer-events-none"
            style={{ 
              left: `${progress}%`,
              transform: 'translateX(-50%)'
            }}
          />
        </div>
        
        {isDragging && (
          <div className="text-center text-xs text-primary font-medium mt-2">
            {formatTime(dragTime)}
          </div>
        )}
      </div>

      {/* Scrubbing Slider */}
      <div className="space-y-2">
        <Slider
          value={[displayTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          className="w-full"
          data-testid="audio-scrub-slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span data-testid="text-current-time">{formatTime(displayTime)}</span>
          <span data-testid="text-total-duration">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={togglePlayPause}
          size="sm"
          className="w-12 h-12 rounded-full p-0 flex-shrink-0"
          data-testid="button-play-pause"
        >
          {isPlaying ? (
            <AppIcon name="pause" className="w-4 h-4" />
          ) : (
            <AppIcon name="play" className="w-4 h-4 ml-0.5" />
          )}
        </Button>
        
        {/* Compact Progress Info */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">
            {isPlaying ? "Playing" : "Paused"}
          </span>
          {isDragging && (
            <span className="text-primary font-medium">
              Seeking...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
