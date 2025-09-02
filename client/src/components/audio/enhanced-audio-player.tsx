import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Download, 
  Volume2, 
  VolumeX,
  Repeat,
  Timer,
  Activity,
  Share2,
  Music
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  color: string;
}

interface EnhancedAudioPlayerProps {
  audioUrl: string;
  title?: string;
  chapters?: AudioChapter[];
  transcript?: string;
  className?: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export default function EnhancedAudioPlayer({ 
  audioUrl, 
  title = "Podcast Episode",
  chapters = [],
  transcript = "",
  className = "",
  onTimeUpdate
}: EnhancedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [showWaveform, setShowWaveform] = useState(true);
  const [currentChapter, setCurrentChapter] = useState<AudioChapter | null>(null);
  const { toast } = useToast();

  // Generate enhanced waveform data
  useEffect(() => {
    const generateWaveform = () => {
      const bars = 200; // More detailed waveform
      const data = Array.from({ length: bars }, (_, i) => {
        // Create more realistic waveform pattern
        const position = i / bars;
        const baseHeight = Math.sin(position * Math.PI * 4) * 0.3 + 0.7;
        const noise = (Math.random() - 0.5) * 0.4;
        const fadeIn = Math.min(position * 4, 1);
        const fadeOut = Math.min((1 - position) * 4, 1);
        return Math.max(0.1, Math.min(1, (baseHeight + noise) * fadeIn * fadeOut));
      });
      setWaveformData(data);
    };

    generateWaveform();
  }, [audioUrl]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
      
      // Update current chapter
      const chapter = chapters.find(ch => time >= ch.startTime && time < ch.endTime);
      setCurrentChapter(chapter || null);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (!isLooping) {
        setCurrentTime(0);
        audio.currentTime = 0;
      }
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      toast({
        title: "Audio Error",
        description: "Failed to load audio file. Please try again.",
        variant: "destructive",
      });
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl, chapters, isLooping, onTimeUpdate, toast]);

  // Playback controls
  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast({
        title: "Playback Error",
        description: "Unable to play audio. Please check your connection.",
        variant: "destructive",
      });
    }
  }, [isPlaying, toast]);

  const skipBackward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = Math.max(0, audio.currentTime - 15);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const skipForward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = Math.min(duration, audio.currentTime + 30);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const handlePlaybackRateChange = useCallback((rate: string) => {
    const newRate = parseFloat(rate);
    setPlaybackRate(newRate);
    
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = newRate;
    }
  }, []);

  const toggleLoop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const newLoop = !isLooping;
    setIsLooping(newLoop);
    audio.loop = newLoop;
  }, [isLooping]);

  const handleSeek = useCallback((value: number[]) => {
    const newTime = value[0];
    setDragTime(newTime);
    setIsDragging(true);
  }, []);

  const handleSeekCommit = useCallback((value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setIsDragging(false);
  }, []);

  const downloadAudio = useCallback(() => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your podcast audio is being downloaded.",
    });
  }, [audioUrl, title, toast]);

  const shareAudio = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this podcast: ${title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Podcast link copied to clipboard.",
      });
    }
  }, [title, toast]);

  const formatTime = useCallback((time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const displayTime = isDragging ? dragTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6 space-y-6">
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          loop={isLooping}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            {currentChapter && (
              <Badge variant="secondary" className="mt-1">
                {currentChapter.title}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWaveform(!showWaveform)}
            >
              <Activity className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={shareAudio}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadAudio}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced Waveform */}
        {showWaveform && (
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-end justify-center space-x-0.5 h-20 relative cursor-pointer">
              {waveformData.map((height, index) => {
                const barProgress = (index / waveformData.length) * 100;
                const isActive = barProgress <= progress;
                const isNearCursor = isDragging && Math.abs(barProgress - progress) < 1;
                
                return (
                  <div
                    key={index}
                    className={`transition-all duration-100 rounded-sm ${
                      isActive 
                        ? 'bg-primary opacity-100' 
                        : 'bg-primary/30 opacity-60'
                    } ${isNearCursor ? 'bg-primary/80 transform scale-y-110' : ''}`}
                    style={{ 
                      height: `${height * 100}%`,
                      width: '2px',
                      minHeight: '3px'
                    }}
                  />
                );
              })}
              
              {/* Chapter markers */}
              {chapters.map((chapter) => {
                const chapterProgress = (chapter.startTime / duration) * 100;
                return (
                  <div
                    key={chapter.id}
                    className="absolute top-0 bottom-0 w-0.5 opacity-70 z-10"
                    style={{ 
                      left: `${chapterProgress}%`,
                      backgroundColor: chapter.color
                    }}
                    title={chapter.title}
                  />
                );
              })}
              
              {/* Playhead */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-foreground shadow-lg z-20"
                style={{ 
                  left: `${progress}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
          </div>
        )}

        {/* Seek Slider */}
        <div className="space-y-2">
          <Slider
            value={[displayTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            onValueCommit={handleSeekCommit}
            disabled={isLoading}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button variant="ghost" size="sm" onClick={skipBackward}>
            <SkipBack className="w-4 h-4" />
            <span className="ml-1 text-xs">15s</span>
          </Button>
          
          <Button
            onClick={togglePlayPause}
            size="lg"
            className="w-14 h-14 rounded-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>

          <Button variant="ghost" size="sm" onClick={skipForward}>
            <span className="mr-1 text-xs">30s</span>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Advanced Controls */}
        <div className="flex items-center justify-between">
          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleMute}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>

          {/* Playback Speed */}
          <div className="flex items-center space-x-2">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="1.75">1.75x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loop Control */}
          <Button
            variant={isLooping ? "default" : "ghost"}
            size="sm"
            onClick={toggleLoop}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Info */}
        {(isLoading || isDragging || currentChapter) && (
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            {isLoading && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                <span>Loading audio...</span>
              </div>
            )}
            {isDragging && (
              <Badge variant="secondary">
                Seeking to {formatTime(dragTime)}
              </Badge>
            )}
            {currentChapter && !isDragging && (
              <Badge variant="outline" style={{ borderColor: currentChapter.color }}>
                <Music className="w-3 h-3 mr-1" />
                {currentChapter.title}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
