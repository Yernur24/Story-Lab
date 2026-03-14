import { useEffect, useState, useCallback } from "react";
import { useRoute } from "wouter";
import { useStory, useAddVoiceRecording, useDeleteVoiceRecording, useToggleFavorite, useIncrementReadCount } from "@/hooks/use-stories";
import { ArrowLeft, Edit, Headphones, PlayCircle, Image as ImageIcon, BookOpen, Heart, Share2, Trash2, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { AudioRecorder } from "@/components/AudioRecorder";
import { Slideshow } from "@/components/Slideshow";
import { motion, AnimatePresence } from "framer-motion";
import { loadVideoUrl } from "@/lib/videoDb";

// ─── Pagination helper ────────────────────────────────────────────────────────
function paginateContent(content: string, charsPerPage = 900): string[] {
  const lines = content.split('\n');
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
// ─────────────────────────────────────────────────────────────────────────────

export default function StoryDetail() {
  const [, params] = useRoute("/story/:id");
  const id = params?.id || "";
  const { data: story, isLoading, error } = useStory(id);
  const addVoiceRecording = useAddVoiceRecording();
  const deleteVoiceRecording = useDeleteVoiceRecording();
  const toggleFavorite = useToggleFavorite();
  const incrementReadCount = useIncrementReadCount();

  const [activeTab, setActiveTab] = useState<'read' | 'listen' | 'watch' | 'record'>('read');
  const [copied, setCopied] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);

  // Uploaded video blob URL
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) incrementReadCount.mutate(id);
  }, [id]);

  // Load video from IndexedDB when story loads
  useEffect(() => {
    if (story?.videoFile) {
      loadVideoUrl(story.videoFile).then(url => {
        if (url) setUploadedVideoUrl(url);
      });
    }
  }, [story?.videoFile]);

  // Reset page when story changes
  useEffect(() => {
    setCurrentPage(0);
  }, [id]);

  const pages = story ? paginateContent(story.content) : [];
  const totalPages = pages.length;
  const showPagination = totalPages > 1;

  const goNext = useCallback(() => setCurrentPage(p => Math.min(p + 1, totalPages - 1)), [totalPages]);
  const goPrev = useCallback(() => setCurrentPage(p => Math.max(p - 1, 0)), []);

  // Keyboard navigation
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
  const hasAudio = !!(story.audioFile || (story.voiceRecordings && story.voiceRecordings.length > 0));
  const hasVideo = !!(story.videoUrl || uploadedVideoUrl);

  const tabs = [
    { id: 'read' as const, label: '📖 Оқу', always: true },
    { id: 'listen' as const, label: '🎧 Тыңдау', always: hasAudio },
    { id: 'watch' as const, label: '🎬 Көру', always: hasMedia },
    { id: 'record' as const, label: '🎙 Жазу', always: true },
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
                {story.voiceRecordings?.length ? <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-sm rounded-full border-2 border-primary/20">🎙 {story.voiceRecordings.length} жазба</span> : null}
                {showPagination ? <span className="px-3 py-1 bg-secondary/10 text-secondary font-bold text-sm rounded-full border-2 border-secondary/20">📄 {totalPages} бет</span> : null}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4 leading-tight">{story.title}</h1>
              <p className="text-lg text-muted-foreground font-medium mb-6">{story.description}</p>
              <Link href={`/edit/${story.id}`} className="inline-flex items-center gap-2 px-5 py-2 bg-white text-foreground font-bold rounded-xl shadow-sm border-2 border-border hover:bg-muted transition-colors">
                <Edit className="w-4 h-4" /> Өңдеу
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-4">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
          {tabs.filter(t => t.always).map((tab) => (
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
                {/* Pagination indicator */}
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

                {/* Page content */}
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

                {/* Pagination controls */}
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
                {story.audioFile && (
                  <div className="bg-muted p-6 rounded-2xl border-2 border-border">
                    <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                      <Headphones className="text-secondary" /> Түпнұсқа аудио
                    </h3>
                    <audio src={story.audioFile} controls className="w-full" />
                  </div>
                )}
                {story.voiceRecordings && story.voiceRecordings.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-display text-xl font-bold flex items-center gap-2">
                      🎙 Менің жазбаларым ({story.voiceRecordings.length})
                    </h3>
                    {story.voiceRecordings.map((rec, i) => (
                      <motion.div key={i} animate={{ opacity: deletingIndex === i ? 0.4 : 1 }} className="bg-primary/5 p-4 rounded-xl border-2 border-primary/20 flex items-center gap-4">
                        <div className="font-bold text-primary w-10 text-center">#{i + 1}</div>
                        <audio src={rec} controls className="flex-1 h-10 min-w-0" />
                        <button onClick={() => handleDeleteRecording(i)} disabled={deletingIndex !== null} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all flex-shrink-0 disabled:opacity-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
                {!hasAudio && (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-5xl mb-4">🎧</div>
                    <p className="font-bold text-lg">Аудио жоқ</p>
                    <button onClick={() => setActiveTab('record')} className="mt-4 px-5 py-2 bg-primary text-white font-bold rounded-xl">🎙 Жазуды бастау</button>
                  </div>
                )}
              </div>
            )}

            {/* ── WATCH ── */}
            {activeTab === 'watch' && (
              <div className="space-y-10">
                {/* Uploaded video file */}
                {uploadedVideoUrl && (
                  <div>
                    <h3 className="font-display text-xl font-bold mb-4">🎬 Жүктелген видео</h3>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border-4 border-border shadow-md bg-black">
                      <video src={uploadedVideoUrl} controls className="w-full h-full" />
                    </div>
                  </div>
                )}

                {/* YouTube / URL video */}
                {story.videoUrl && !uploadedVideoUrl && (
                  <div>
                    <h3 className="font-display text-xl font-bold mb-4">🎬 Мультфильм / Видео</h3>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border-4 border-border shadow-md">
                      {story.videoUrl.includes('youtube.com') || story.videoUrl.includes('youtu.be') ? (
                        <iframe src={getEmbedUrl(story.videoUrl)} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                      ) : (
                        <video src={story.videoUrl} controls className="w-full h-full bg-black" />
                      )}
                    </div>
                  </div>
                )}

                {/* Slideshow */}
                {story.images && story.images.length > 0 && (
                  <div>
                    <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                      <ImageIcon className="text-secondary" /> Слайд-шоу ({story.images.length} сурет)
                    </h3>
                    <Slideshow images={story.images} />
                  </div>
                )}

                {!hasMedia && (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-5xl mb-4">🎬</div>
                    <p className="font-bold text-lg">Видео немесе слайд-шоу жоқ</p>
                    <Link href={`/edit/${story.id}`} className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-secondary text-white font-bold rounded-xl">
                      <Edit className="w-4 h-4" /> Медиа қосу
                    </Link>
                  </div>
                )}

                {/* Reload hint for file video */}
                {story.videoFile && !uploadedVideoUrl && !isLoading && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-amber-800 text-sm font-medium">
                    ⚠️ Видео файл браузерде ғана сақталады. Беттіңізді жаңартсаңыз, видеоны қайта жүктеу қажет болуы мүмкін. Тұрақты сақтау үшін YouTube URL пайдаланыңыз.
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
