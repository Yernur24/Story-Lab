import { useEffect, useState, useCallback, useRef } from "react";
import { useRoute } from "wouter";
import { useStory, useAddVoiceRecording, useDeleteVoiceRecording, useToggleFavorite, useIncrementReadCount, useSaveStory, useRateStory } from "@/hooks/use-stories";
import { ArrowLeft, Edit, Headphones, PlayCircle, Image as ImageIcon, BookOpen, Heart, Share2, Trash2, Check, ChevronLeft, ChevronRight, Gamepad2, Mic, Play, Pause, Star } from "lucide-react";
import { trackRead } from "@/lib/stats";
import { Link } from "wouter";
import { AudioRecorder } from "@/components/AudioRecorder";
import { Slideshow } from "@/components/Slideshow";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";

// ─── Pagination helper ────────────────────────────────────────────────────────
function splitLongLine(line: string, charsPerPage: number): string[] {
  if (line.length <= charsPerPage) return [line];
  const chunks: string[] = [];
  const words = line.split(' ');
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > charsPerPage && current.length > 0) {
      chunks.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [line];
}

function paginateContent(content: string, charsPerPage = 900): string[] {
  const rawLines = content.split('\n');
  const lines: string[] = [];
  for (const line of rawLines) {
    if (line.length > charsPerPage) {
      lines.push(...splitLongLine(line, charsPerPage));
    } else {
      lines.push(line);
    }
  }

  const pages: string[] = [];
  let current = '';

  for (const line of lines) {
    const candidate = current ? `${current}\n${line}` : line;
    if (candidate.length > charsPerPage && current.length > 0) {
      pages.push(current.trim());
      current = line;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) pages.push(current.trim());
  return pages.length > 0 ? pages : [content];
}

// ─── Nice audio player ────────────────────────────────────────────────────────
function AudioPlayer({ src, label, color = 'primary' }: { src: string; label: string; color?: 'primary' | 'secondary' | 'green' }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const colorMap = {
    primary: { bg: 'bg-primary', light: 'bg-primary/10', ring: 'border-primary/20', text: 'text-primary', track: '#6366f1' },
    secondary: { bg: 'bg-secondary', light: 'bg-secondary/10', ring: 'border-secondary/20', text: 'text-secondary', track: '#f59e0b' },
    green: { bg: 'bg-green-500', light: 'bg-green-50', ring: 'border-green-200', text: 'text-green-700', track: '#22c55e' },
  };
  const c = colorMap[color];

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = (val / 100) * duration;
    setProgress(val);
  };

  return (
    <div className={`${c.light} border-2 ${c.ring} rounded-2xl p-4`}>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0); setCurrentTime(0); }}
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          setCurrentTime(audioRef.current.currentTime);
          setProgress(duration > 0 ? (audioRef.current.currentTime / duration) * 100 : 0);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className={`${c.bg} text-white w-11 h-11 rounded-full flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all flex-shrink-0`}
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${c.text} truncate mb-1`}>{label}</p>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: c.track }}
          />
          <div className="flex justify-between text-xs text-muted-foreground font-medium mt-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function StoryDetail() {
  const [, params] = useRoute("/story/:id");
  const id = params?.id || "";
  const { data: story, isLoading, error } = useStory(id);
  const addVoiceRecording = useAddVoiceRecording();
  const deleteVoiceRecording = useDeleteVoiceRecording();
  const toggleFavorite = useToggleFavorite();
  const incrementReadCount = useIncrementReadCount();
  const saveStory = useSaveStory();
  const rateStory = useRateStory();

  const [activeTab, setActiveTab] = useState<'read' | 'listen' | 'watch' | 'record'>('read');
  const [copied, setCopied] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingDone, setRatingDone] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [videoLoadState, setVideoLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    if (id) {
      incrementReadCount.mutate(id);
    }
  }, [id]);

  useEffect(() => {
    if (story) {
      trackRead({ id: story.id, title: story.title, coverEmoji: story.coverEmoji });
      const savedRating = localStorage.getItem(`ertegi_rating_${story.id}`);
      if (savedRating) {
        setUserRating(parseInt(savedRating, 10));
        setRatingDone(true);
      }
    }
  }, [story?.id]);

  useEffect(() => {
    setUploadedVideoUrl(null);
    setVideoLoadState('idle');

    if (story?.videoFile) {
      // Use streaming endpoint directly — no need to download the whole file as base64
      setUploadedVideoUrl(`/api/videos/${story.videoFile}/stream`);
      setVideoLoadState('ready');
    }
  }, [story?.videoFile]);

  useEffect(() => {
    setCurrentPage(0);
  }, [id]);

  const pages = story ? paginateContent(story.content) : [];
  const totalPages = pages.length;
  const showPagination = totalPages > 1;

  const goNext = useCallback(() => setCurrentPage(p => Math.min(p + 1, totalPages - 1)), [totalPages]);
  const goPrev = useCallback(() => setCurrentPage(p => Math.max(p - 1, 0)), []);

  useEffect(() => {
    if (activeTab !== 'read') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab, goNext, goPrev]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="text-6xl">
          🌟
        </motion.div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-3xl font-display font-bold mb-4">Ертегі табылмады</h2>
        <Link href="/library" className="text-primary font-bold hover:underline">← Кітапханаға қайту</Link>
      </div>
    );
  }

  const handleSaveRecording = (base64: string) => {
    addVoiceRecording.mutate({ id, audioStr: base64 });
  };

  const handleDeleteRecording = (index: number) => {
    if (!confirm('Бұл жазбаны өшіруге сенімдісіз бе?')) return;
    setDeletingIndex(index);
    deleteVoiceRecording.mutate({ id, index }, { onSettled: () => setDeletingIndex(null) });
  };

  const handleRate = (rating: number) => {
    if (ratingDone || !story) return;
    setUserRating(rating);
    setRatingDone(true);
    localStorage.setItem(`ertegi_rating_${story.id}`, String(rating));
    rateStory.mutate({ id: story.id, rating });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => alert(`Сілтемені көшіріңіз: ${window.location.href}`));
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1];
    return url;
  };

  const hasMedia = !!(story.videoUrl || story.videoFile || (story.images && story.images.length > 0));
  const hasDubbing = !!story.audioFile;
  const hasVoiceRecordings = !!(story.voiceRecordings && story.voiceRecordings.length > 0);
  const isYouTube = !!(story.videoUrl && (story.videoUrl.includes('youtube.com') || story.videoUrl.includes('youtu.be')));

  const tabs = [
    { id: 'read' as const, label: '📖 Оқу' },
    { id: 'listen' as const, label: '🎧 Тыңдау' },
    { id: 'watch' as const, label: '🎬 Көру' },
    { id: 'record' as const, label: '🎙 Жазу' },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/library" className="inline-flex items-center gap-2 text-muted-foreground font-bold hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" /> Артқа
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-white border-2 border-border px-4 py-2 rounded-xl font-bold text-sm hover:border-secondary transition-all shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Көшірілді!' : 'Бөлісу'}
              </button>
              <button
                onClick={() => toggleFavorite.mutate(story.id)}
                className={`p-2 rounded-xl border-2 transition-all shadow-sm ${story.isFavorite ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-border text-muted-foreground hover:text-rose-500'}`}
              >
                <Heart className={`w-5 h-5 ${story.isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <motion.div
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl shadow-xl border-4 border-white flex items-center justify-center text-7xl flex-shrink-0 overflow-hidden"
            >
              {story.images && story.images.length > 0
                ? <img src={story.images[0]} alt="" className="w-full h-full object-cover" />
                : story.coverEmoji}
            </motion.div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                <span className="px-3 py-1 bg-white text-secondary font-extrabold text-sm rounded-full shadow-sm border-2 border-border">
                  {story.category === 'fairy-tale' ? '📖 Ертегі' : story.category === 'comic' ? '💥 Комикс' : story.category === 'cartoon' ? '🎬 Мультфильм' : '✨ Басқа'}
                </span>
                {story.readCount ? <span className="px-3 py-1 bg-white text-muted-foreground font-bold text-sm rounded-full shadow-sm border-2 border-border">👁 {story.readCount} рет</span> : null}
                {hasDubbing && <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-sm rounded-full border-2 border-primary/20">🎙 Дубляж бар</span>}
                {hasVoiceRecordings && <span className="px-3 py-1 bg-secondary/10 text-secondary font-bold text-sm rounded-full border-2 border-secondary/20">🎤 {story.voiceRecordings.length} жазба</span>}
                {showPagination ? <span className="px-3 py-1 bg-muted text-muted-foreground font-bold text-sm rounded-full border-2 border-border">📄 {totalPages} бет</span> : null}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4 leading-tight">{story.title}</h1>
              <p className="text-lg text-muted-foreground font-medium mb-4">{story.description}</p>

              {/* Star Rating */}
              <div className="flex items-center gap-3 justify-center md:justify-start mb-5">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      type="button"
                      disabled={ratingDone}
                      onClick={() => handleRate(star)}
                      onMouseEnter={() => !ratingDone && setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110 active:scale-95 disabled:cursor-default p-0.5"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoverRating || userRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-muted-foreground/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {story.ratingCount > 0 && (
                  <span className="text-sm font-bold text-muted-foreground">
                    {story.rating.toFixed(1)} ({story.ratingCount})
                  </span>
                )}
                {ratingDone && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200"
                  >
                    ✓ Бағалады
                  </motion.span>
                )}
                {!ratingDone && (
                  <span className="text-xs text-muted-foreground font-medium">Бағала ⬆</span>
                )}
              </div>

              {/* Quick listen button if dubbing exists */}
              {hasDubbing && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => setActiveTab('listen')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-[0_4px_0_hsl(var(--primary-border))] hover:-translate-y-0.5 hover:shadow-[0_6px_0_hsl(var(--primary-border))] active:translate-y-0.5 active:shadow-none transition-all mb-4"
                >
                  <Headphones className="w-5 h-5" /> 🎧 Дубляжды тыңда!
                </motion.button>
              )}

              <div className="flex flex-wrap gap-3">
                <Link href={`/edit/${story.id}`} className="inline-flex items-center gap-2 px-5 py-2 bg-white text-foreground font-bold rounded-xl shadow-sm border-2 border-border hover:bg-muted transition-colors">
                  <Edit className="w-4 h-4" /> Өңдеу
                </Link>
                {story.quizEnabled ? (
                  <Link
                    href={`/quiz/${story.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
                  >
                    <Gamepad2 className="w-4 h-4" /> 🎮 Ойын
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 px-5 py-2 bg-muted text-muted-foreground font-bold rounded-xl border-2 border-dashed border-border cursor-not-allowed">
                    <Gamepad2 className="w-4 h-4" /> 🎮 Ойын өшірулі
                  </span>
                )}
                <button
                  onClick={() => saveStory.mutate({ id: story.id, quizEnabled: !story.quizEnabled })}
                  disabled={saveStory.isPending}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl border-2 transition-all ${story.quizEnabled ? 'border-primary/30 text-primary bg-primary/5 hover:bg-primary/10' : 'border-border text-muted-foreground bg-muted/40 hover:bg-muted'}`}
                  title={story.quizEnabled ? 'Ойынды өшіру' : 'Ойынды қосу'}
                >
                  <span className={`w-5 h-3 rounded-full relative inline-block transition-colors ${story.quizEnabled ? 'bg-primary' : 'bg-muted-foreground/40'}`}>
                    <span className={`absolute top-0.5 w-2 h-2 rounded-full bg-white shadow transition-transform ${story.quizEnabled ? 'translate-x-2.5' : 'translate-x-0.5'}`} />
                  </span>
                  {story.quizEnabled ? 'Өшіру' : 'Қосу'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-4">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id === 'read') setCurrentPage(0); }}
              className={`px-5 py-3 rounded-2xl font-bold transition-all text-sm md:text-base ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-[0_4px_0_hsl(var(--primary-border))] -translate-y-0.5'
                  : 'bg-white border-2 border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
              {tab.id === 'listen' && (hasDubbing || hasVoiceRecordings) && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full font-black">
                  {(hasDubbing ? 1 : 0) + (story.voiceRecordings?.length || 0)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl shadow-lg border-4 border-border p-6 md:p-10"
          >
            {/* ── READ ── */}
            {activeTab === 'read' && (
              <div>
                {showPagination && (
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-dashed border-border">
                    <span className="text-sm font-bold text-muted-foreground">
                      📄 {currentPage + 1} / {totalPages} бет
                    </span>
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentPage ? 'bg-primary scale-125' : 'bg-border hover:bg-primary/40'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="prose prose-lg md:prose-xl max-w-none font-sans text-foreground leading-relaxed min-h-[200px]"
                  >
                    {pages[currentPage]?.split('\n').map((line, i) =>
                      line.trim()
                        ? <p key={i} className="mb-5">{line}</p>
                        : <br key={i} />
                    )}
                  </motion.div>
                </AnimatePresence>

                {showPagination && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-dashed border-border">
                    <button
                      onClick={goPrev}
                      disabled={currentPage === 0}
                      className="flex items-center gap-2 px-6 py-3 bg-muted rounded-2xl font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" /> Алдыңғы
                    </button>

                    <span className="font-bold text-muted-foreground text-sm">
                      {currentPage + 1} / {totalPages}
                    </span>

                    {currentPage < totalPages - 1 ? (
                      <button
                        onClick={goNext}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-[0_4px_0_hsl(var(--primary-border))] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                      >
                        Келесі <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('record')}
                        className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold shadow-[0_4px_0_hsl(350,80%,40%)] hover:-translate-y-0.5 transition-all"
                      >
                        🎙 Дауысыңды жаз!
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── LISTEN ── */}
            {activeTab === 'listen' && (
              <div className="space-y-8">

                {/* Dubbing / Main audio */}
                {hasDubbing ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-primary text-white rounded-2xl">
                        <Headphones className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold">🎙 Дубляж</h3>
                        <p className="text-sm text-muted-foreground font-medium">Ертегінің дауыстық оқылуы</p>
                      </div>
                    </div>
                    <AudioPlayer src={story.audioFile!} label={story.title} color="primary" />

                    {/* Story text alongside audio - collapsible */}
                    <details className="mt-4 group">
                      <summary className="cursor-pointer text-sm font-bold text-muted-foreground hover:text-foreground flex items-center gap-2 select-none list-none">
                        <span className="group-open:hidden">📖 Мәтінді қоса оқу</span>
                        <span className="hidden group-open:inline">📖 Мәтінді жасыру</span>
                      </summary>
                      <div className="mt-4 bg-muted/30 rounded-2xl p-5 border-2 border-dashed border-border">
                        <div className="prose prose-base max-w-none text-foreground leading-relaxed">
                          {story.content.split('\n').map((line, i) =>
                            line.trim() ? <p key={i} className="mb-4">{line}</p> : <br key={i} />
                          )}
                        </div>
                      </div>
                    </details>
                  </div>
                ) : (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex gap-4 items-center">
                    <div className="text-3xl">🎙</div>
                    <div>
                      <p className="font-bold text-amber-800">Дубляж қосылмаған</p>
                      <p className="text-sm text-amber-700 mt-0.5">Ертегіге дубляж қосу үшін өңдеу батырмасын басыңыз</p>
                      <Link href={`/edit/${story.id}`} className="inline-flex items-center gap-1.5 mt-2 text-sm font-bold text-amber-800 underline hover:no-underline">
                        <Edit className="w-3.5 h-3.5" /> Дубляж қосу
                      </Link>
                    </div>
                  </div>
                )}

                {/* Voice recordings by users */}
                {hasVoiceRecordings && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-secondary/10 text-secondary rounded-2xl border-2 border-secondary/20">
                        <Mic className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold">🎤 Менің жазбаларым</h3>
                        <p className="text-sm text-muted-foreground font-medium">{story.voiceRecordings.length} дыбыс жазба</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {story.voiceRecordings.map((rec, i) => (
                        <motion.div key={i} animate={{ opacity: deletingIndex === i ? 0.4 : 1 }} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <AudioPlayer src={rec} label={`Жазба #${i + 1}`} color="green" />
                          </div>
                          <button
                            onClick={() => handleDeleteRecording(i)}
                            disabled={deletingIndex !== null}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all flex-shrink-0 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!hasDubbing && !hasVoiceRecordings && (
                  <div className="text-center py-8">
                    <button onClick={() => setActiveTab('record')} className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-[0_4px_0_hsl(var(--primary-border))] hover:-translate-y-0.5 transition-all">
                      🎙 Өз дауысыңды жаз
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── WATCH ── */}
            {activeTab === 'watch' && (
              <div className="space-y-10">

                {/* ─── Uploaded video file from DB ─── */}
                {story.videoFile && (
                  <div>
                    <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                      🎬 Жүктелген видео
                    </h3>

                    {videoLoadState === 'loading' && (
                      <div className="aspect-video w-full rounded-2xl border-4 border-border bg-muted flex flex-col items-center justify-center gap-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent"
                        />
                        <p className="font-bold text-muted-foreground">Видео жүктелуде...</p>
                        <p className="text-xs text-muted-foreground">Үлкен файлдар үшін бірнеше секунд кетуі мүмкін</p>
                      </div>
                    )}

                    {videoLoadState === 'ready' && uploadedVideoUrl && (
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border-4 border-border shadow-md bg-black">
                        <video
                          src={uploadedVideoUrl}
                          controls
                          controlsList="nodownload"
                          className="w-full h-full"
                          playsInline
                          onError={() => setVideoLoadState('error')}
                        />
                      </div>
                    )}

                    {videoLoadState === 'error' && (
                      <div className="aspect-video w-full rounded-2xl border-4 border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3">
                        <div className="text-4xl">⚠️</div>
                        <p className="font-bold text-destructive">Видео жүктелмеді</p>
                        <p className="text-sm text-muted-foreground text-center max-w-xs">
                          Файл тым үлкен немесе сервер қатесі болды. Видеоны қайтадан жүктеп көріңіз.
                        </p>
                        <Link href={`/edit/${story.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white font-bold rounded-xl text-sm">
                          <Edit className="w-4 h-4" /> Өңдеу
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── URL video (YouTube or direct link) ─── */}
                {story.videoUrl && (
                  <div>
                    <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                      {isYouTube ? '▶️ YouTube видео' : '🔗 Видео сілтеме'}
                    </h3>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border-4 border-border shadow-md">
                      {isYouTube ? (
                        <iframe
                          src={getEmbedUrl(story.videoUrl)}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          title={story.title}
                        />
                      ) : (
                        <video
                          src={story.videoUrl}
                          controls
                          controlsList="nodownload"
                          className="w-full h-full bg-black"
                          playsInline
                          onError={(e) => {
                            const el = e.currentTarget;
                            el.style.display = 'none';
                            el.parentElement!.innerHTML = `
                              <div class="w-full h-full flex flex-col items-center justify-center gap-3 bg-muted">
                                <div class="text-4xl">🔗</div>
                                <p class="font-bold text-muted-foreground">Видео браузерде ашылмады</p>
                                <a href="${story.videoUrl}" target="_blank" rel="noopener noreferrer"
                                  class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm">
                                  Сыртқы сілтемеде ашу ↗
                                </a>
                              </div>`;
                          }}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 break-all font-medium">
                      🔗 {story.videoUrl}
                    </p>
                  </div>
                )}

                {/* ─── Slideshow ─── */}
                {story.images && story.images.length > 0 && (
                  <div>
                    <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                      <ImageIcon className="text-secondary" /> Слайд-шоу ({story.images.length} сурет)
                    </h3>
                    <Slideshow images={story.images} />
                  </div>
                )}

                {/* ─── Empty state ─── */}
                {!hasMedia && (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="font-bold text-xl mb-1">Видео немесе медиа жоқ</p>
                    <p className="text-sm mb-6">YouTube сілтемесін немесе MP4 файлын қосыңыз</p>
                    <Link href={`/edit/${story.id}`} className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white font-bold rounded-2xl shadow-md hover:-translate-y-0.5 transition-all">
                      <Edit className="w-4 h-4" /> Видео қосу
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── RECORD ── */}
            {activeTab === 'record' && (
              <div className="space-y-8">
                <div className="text-center mb-4">
                  <h3 className="font-display text-2xl font-extrabold mb-2">🎙 Өз даусыңды жаз!</h3>
                  <p className="text-muted-foreground font-medium">Ертегіні оқып, микрофонға жазып алыңыз.</p>
                </div>

                {/* Story text for reading while recording */}
                <div className="bg-muted/30 rounded-2xl p-5 border-2 border-dashed border-border max-h-64 overflow-y-auto">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">📖 Оқу үшін мәтін</p>
                  <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                    {story.content.split('\n').map((line, i) =>
                      line.trim() ? <p key={i} className="mb-3">{line}</p> : <br key={i} />
                    )}
                  </div>
                </div>

                <AudioRecorder onSave={handleSaveRecording} isSaving={addVoiceRecording.isPending} />

                {addVoiceRecording.isSuccess && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
                    <p className="font-bold text-green-700">🎉 Жазба сәтті сақталды!</p>
                    <button onClick={() => setActiveTab('listen')} className="mt-2 text-sm font-bold text-primary underline">Тыңдауға өту →</button>
                  </motion.div>
                )}

                {story.voiceRecordings?.length ? (
                  <div className="bg-muted/30 rounded-2xl p-4 border-2 border-dashed border-border text-center">
                    <p className="font-bold text-muted-foreground">Сақталған жазбалар: <span className="text-primary">{story.voiceRecordings.length}</span></p>
                    <button onClick={() => setActiveTab('listen')} className="mt-2 text-sm font-bold text-primary hover:underline">Тыңдауға өту →</button>
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
