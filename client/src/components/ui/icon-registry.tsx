import React from 'react';
import {
  FileText, Search, Lightbulb, RefreshCw, BarChart3, BarChart, Loader2, Play, Save, Calendar,
  Mic, Volume2, VolumeX, Download, CheckCircle, Clock, AlertCircle, AlertTriangle, Sparkles, Zap,
  Target,
  Headphones, ArrowRight, ArrowLeft, TrendingUp, RotateCcw, Edit3, Users, Bot, Palette,
  Moon, Sun, Contrast, HeadphonesIcon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Circle, X, Pause, Headphones as HeadphonesDup, Keyboard, List, ExternalLink, FileAudio,
  Plus, Check, Home, PanelLeft, MoreHorizontal, Quote, Eye, Heart, Coffee, Shield, BookOpen,
  Settings, SkipBack, SkipForward, Repeat, Timer, Activity, Share2, Music
} from 'lucide-react';

// Phase 8: Curated icon registry consolidating all used icons in one place
// Ensures consistent stroke style and simplifies future theming or swapping.
// Usage: import { Icons } from '@/components/ui/icon-registry'; <Icons.search className="w-4 h-4" />

export const Icons = {
  file: FileText,
  search: Search,
  idea: Lightbulb,
  refresh: RefreshCw,
  stats: BarChart3,
  loading: Loader2,
  play: Play,
  save: Save,
  calendar: Calendar,
  mic: Mic,
  volume: Volume2,
  download: Download,
  success: CheckCircle,
  pending: Clock,
  clock: Clock, // alias
  warning: AlertCircle,
  alert: AlertTriangle,
  spark: Sparkles,
  energy: Zap,
  target: Target,
  headphones: Headphones,
  headphones2: HeadphonesDup,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  trending: TrendingUp,
  rotate: RotateCcw,
  edit: Edit3,
  users: Users,
  bot: Bot,
  palette: Palette,
  moon: Moon,
  sun: Sun,
  contrast: Contrast,
  headphonesAlt: HeadphonesIcon,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  chevronDown: ChevronDown,
  circle: Circle,
  close: X,
  pause: Pause,
  keyboard: Keyboard,
  list: List,
  external: ExternalLink,
  fileAudio: FileAudio,
  plus: Plus,
  check: Check,
  home: Home,
  panel: PanelLeft,
  more: MoreHorizontal,
  quote: Quote,
  eye: Eye,
  heart: Heart,
  coffee: Coffee,
  shield: Shield,
  book: BookOpen,
  settings: Settings,
  skipBack: SkipBack,
  skipForward: SkipForward,
  repeat: Repeat,
  timer: Timer,
  activity: Activity,
  share: Share2,
  music: Music,
  chart: BarChart,
  volumeMute: VolumeX,
};

export type IconKey = keyof typeof Icons;

export function AppIcon({ name, className }: { name: IconKey; className?: string }) {
  const Cmp = Icons[name];
  return <Cmp className={className} aria-hidden />;
}
