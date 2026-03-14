import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useStory, useAddVoiceRecording, useDeleteVoiceRecording, useToggleFavorite, useIncrementReadCount } from "@/hooks/use-stories";
import { ArrowLeft, Edit, Headphones, PlayCircle, Image as ImageIcon, BookOpen, Heart, Share2, Trash2, Check } from "lucide-react";
import { Link } from "wouter";
import { AudioRecorder } from "@/components/AudioRecorder";
import { Slideshow } from "@/components/Slideshow";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    if (id) {
      incrementReadCount.mutate(id);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
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
        <Link href="/library" className="text-primary font-bold hover:underline">
          Кітапханаға қайту
        </Link>
      </div>
    );
  }

  const handleSaveRecording = (base64: string) => {
    addVoiceRecording.mutate({ id, audioStr: base64 });
  };

  const handleDeleteRecording = (index: number) => {
    if (!confirm('Бұл жазбаны өшіруге сенімдісіз бе?')) return;
    setDeletingIndex(index);
    deleteVoiceRecording.mutate({ id, index }, {
      onSettled: () => setDeletingIndex(null),
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      alert(`Сілтемені көшіріңіз: ${url}`);
    });
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1];
    }
    return url;
  };

  const hasMedia = !!(story.videoUrl || (story.images && story.images.length > 0));
  const hasAudio = !!(story.audioFile || (story.voiceRecordings && story.voiceRecordings.length > 0));

  const tabs = [
    { id: 'read' as const, label: 'Оқу', icon: BookOpen, always: true },
    { id: 'listen' as const, label: 'Тыңдау', icon: Headphones, always: hasAudio },
    { id: 'watch' as const, label: 'Көру', icon: PlayCircle, always: hasMedia },
    { id: 'record' as const, label: 'Жазу 🎙', icon: null, always: true },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/library" className="inline-flex items-center gap-2 text-muted-foreground font-bold hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" /> Артқа
            </Link>

            <div className="flex items-center gap-2">
              {/* Share button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-white border-2 border-border px-4 py-2 rounded-xl font-bold text-sm hover:border-secondary transition-all shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Көшірілді!' : 'Бөлісу'}
              </button>

              {/* Favorite button */}
              <button
                onClick={() => toggleFavorite.mutate(story.id)}
                className={`p-2 rounded-xl border-2 transition-all shadow-sm ${
                  story.isFavorite
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'bg-white border-border text-muted-foreground hover:text-rose-500 hover:border-rose-300'
                }`}
                title={story.isFavorite ? 'Таңдаулылардан алу' : 'Таңдаулыларға қосу'}
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
              {story.images && story.images.length > 0 ? (
                <img src={story.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                story.coverEmoji
              )}
            </motion.div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                <span className="inline-block px-3 py-1 bg-white text-secondary font-extrabold text-sm rounded-full shadow-sm border-2 border-border">
                  {story.category === 'fairy-tale' ? '📖 Ертегі' :
                   story.category === 'comic' ? '💥 Комикс' :
                   story.category === 'cartoon' ? '🎬 Мультфильм' : '✨ Басқа'}
                </span>
                {story.readCount ? (
                  <span className="inline-block px-3 py-1 bg-white text-muted-foreground font-bold text-sm rounded-full shadow-sm border-2 border-border">
                    👁 {story.readCount} рет оқылды
                  </span>
                ) : null}
                {story.voiceRecordings && story.voiceRecordings.length > 0 && (
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold text-sm rounded-full border-2 border-primary/20">
                    🎙 {story.voiceRecordings.length} жазба
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4 leading-tight">
                {story.title}
              </h1>
              <p className="text-lg text-muted-foreground font-medium mb-6">
                {story.description}
              </p>

              <Link
                href={`/edit/${story.id}`}
                className="inline-flex items-center gap-2 px-5 py-2 bg-white text-foreground font-bold rounded-xl shadow-sm border-2 border-border hover:bg-muted transition-colors"
              >
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
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all text-sm md:text-base ${
                activeTab === tab.id
                  ? tab.id === 'record'
                    ? 'bg-rose-500 text-white shadow-[0_4px_0_hsl(350,80%,40%)] -translate-y-0.5'
                    : 'bg-primary text-white shadow-[0_4px_0_hsl(var(--primary-border))] -translate-y-0.5'
                  : 'bg-white border-2 border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.icon && <tab.icon className="w-5 h-5" />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl shadow-lg border-4 border-border p-6 md:p-10"
          >
            {/* READ tab */}
            {activeTab === 'read' && (
              <div>
                <div className="prose prose-lg md:prose-xl max-w-none font-sans text-foreground leading-relaxed">
                  {story.content.split('\n').map((paragraph, i) => (
                    paragraph.trim() ? <p key={i} className="mb-5">{paragraph}</p> : <br key={i} />
                  ))}
                </div>
              </div>
            )}

            {/* LISTEN tab */}
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
                      <motion.div
                        key={i}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: deletingIndex === i ? 0.4 : 1 }}
                        className="bg-primary/5 p-4 rounded-xl border-2 border-primary/20 flex items-center gap-4"
                      >
                        <div className="font-bold text-primary w-10 text-center">#{i + 1}</div>
                        <audio src={rec} controls className="flex-1 h-10 min-w-0" />
                        <button
                          onClick={() => handleDeleteRecording(i)}
                          disabled={deletingIndex !== null}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all flex-shrink-0 disabled:opacity-50"
                          title="Жазбаны өшіру"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {!story.audioFile && (!story.voiceRecordings || story.voiceRecordings.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-5xl mb-4">🎧</div>
                    <p className="font-bold text-lg">Аудио жоқ</p>
                    <p className="text-sm mt-2">«Жазу» бетіне өтіп, өз даусыңызды жазыңыз!</p>
                    <button
                      onClick={() => setActiveTab('record')}
                      className="mt-4 px-5 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                      🎙 Жазуды бастау
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* WATCH tab */}
            {activeTab === 'watch' && (
              <div className="space-y-10">
                {story.videoUrl ? (
                  <div>
                    <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                      🎬 Мультфильм / Видео
                    </h3>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border-4 border-border shadow-md">
                      {story.videoUrl.includes('youtube.com') || story.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={getEmbedUrl(story.videoUrl)}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : (
                        <video src={story.videoUrl} controls className="w-full h-full bg-black" />
                      )}
                    </div>
                  </div>
                ) : null}

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
                    <p className="text-sm mt-2">Өңдеу арқылы YouTube сілтемесін немесе суреттерді қосыңыз</p>
                    <Link
                      href={`/edit/${story.id}`}
                      className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Медиа қосу
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* RECORD tab */}
            {activeTab === 'record' && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <h3 className="font-display text-2xl font-extrabold mb-2">🎙 Өз даусыңды жаз!</h3>
                  <p className="text-muted-foreground font-medium">
                    Ертегіні оқып, микрофонға жазып алыңыз. Жазба сақталады!
                  </p>
                </div>

                <AudioRecorder
                  onSave={handleSaveRecording}
                  isSaving={addVoiceRecording.isPending}
                />

                {addVoiceRecording.isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-4 bg-green-50 border-2 border-green-200 rounded-2xl"
                  >
                    <p className="font-bold text-green-700">🎉 Жазба сәтті сақталды!</p>
                    <button
                      onClick={() => setActiveTab('listen')}
                      className="mt-2 text-sm font-bold text-primary underline"
                    >
                      Тыңдауға өту →
                    </button>
                  </motion.div>
                )}

                {story.voiceRecordings && story.voiceRecordings.length > 0 && (
                  <div className="bg-muted/30 rounded-2xl p-4 border-2 border-dashed border-border">
                    <p className="font-bold text-center text-muted-foreground">
                      🎙 Сақталған жазбалар: <span className="text-primary">{story.voiceRecordings.length}</span>
                    </p>
                    <button
                      onClick={() => setActiveTab('listen')}
                      className="w-full mt-2 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors"
                    >
                      Тыңдауға өту →
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
