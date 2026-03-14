import { useRoute } from "wouter";
import { useStory, useAddVoiceRecording } from "@/hooks/use-stories";
import { ArrowLeft, Edit, Headphones, PlayCircle, Image as ImageIcon } from "lucide-react";
import { Link } from "wouter";
import { AudioRecorder } from "@/components/AudioRecorder";
import { Slideshow } from "@/components/Slideshow";
import { motion } from "framer-motion";
import { useState } from "react";

export default function StoryDetail() {
  const [, params] = useRoute("/story/:id");
  const id = params?.id || "";
  const { data: story, isLoading, error } = useStory(id);
  const addVoiceRecording = useAddVoiceRecording();
  
  const [activeTab, setActiveTab] = useState<'read' | 'listen' | 'watch'>('read');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-6xl">🌟</div>
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

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/library" className="inline-flex items-center gap-2 text-muted-foreground font-bold hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" /> Артқа
          </Link>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <motion.div 
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl shadow-xl border-4 border-white flex items-center justify-center text-7xl flex-shrink-0"
            >
              {story.coverEmoji}
            </motion.div>
            
            <div className="text-center md:text-left flex-1">
              <div className="inline-block px-3 py-1 bg-white text-secondary font-extrabold text-sm rounded-full mb-3 shadow-sm border-2 border-border">
                {story.category === 'fairy-tale' ? 'Ертегі' : 
                 story.category === 'comic' ? 'Комикс' : 
                 story.category === 'cartoon' ? 'Мультфильм' : 'Басқа'}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4 leading-tight">
                {story.title}
              </h1>
              <p className="text-lg text-muted-foreground font-medium mb-6">
                {story.description}
              </p>
              
              <Link href={`/edit/${story.id}`} className="inline-flex items-center gap-2 px-5 py-2 bg-white text-foreground font-bold rounded-xl shadow-sm border-2 border-border hover:bg-muted transition-colors">
                <Edit className="w-4 h-4" /> Өңдеу (Edit)
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-4">
        {/* Interactive Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('read')}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'read' 
                ? 'bg-primary text-white shadow-[0_4px_0_hsl(var(--primary-border))] translate-y-[-2px]' 
                : 'bg-white border-2 border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            <BookOpen className="w-5 h-5" /> Оқу (Read)
          </button>
          
          {(story.audioFile || story.voiceRecordings?.length) && (
            <button 
              onClick={() => setActiveTab('listen')}
              className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
                activeTab === 'listen' 
                  ? 'bg-secondary text-white shadow-[0_4px_0_hsl(190,90%,40%)] translate-y-[-2px]' 
                  : 'bg-white border-2 border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <Headphones className="w-5 h-5" /> Тыңдау (Listen)
            </button>
          )}
          
          {(story.videoUrl || (story.images && story.images.length > 0)) && (
            <button 
              onClick={() => setActiveTab('watch')}
              className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
                activeTab === 'watch' 
                  ? 'bg-accent text-accent-foreground shadow-[0_4px_0_hsl(45,100%,40%)] translate-y-[-2px]' 
                  : 'bg-white border-2 border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <PlayCircle className="w-5 h-5" /> Көру (Watch)
            </button>
          )}
        </div>

        {/* Tab Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-lg border-4 border-border p-6 md:p-10"
        >
          {activeTab === 'read' && (
            <div className="prose prose-lg md:prose-xl max-w-none font-sans text-foreground leading-relaxed">
              {story.content.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-6">{paragraph}</p>
              ))}
              
              {/* Record Voice Section at bottom of reading */}
              <div className="mt-16 pt-10 border-t-4 border-dashed border-border">
                <AudioRecorder 
                  onSave={handleSaveRecording} 
                  isSaving={addVoiceRecording.isPending} 
                />
              </div>
            </div>
          )}

          {activeTab === 'listen' && (
            <div className="space-y-8">
              {story.audioFile && (
                <div className="bg-muted p-6 rounded-2xl border-2 border-border">
                  <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <Headphones className="text-secondary" /> Түпнұсқа аудио (Original)
                  </h3>
                  <audio src={story.audioFile} controls className="w-full" />
                </div>
              )}
              
              {story.voiceRecordings && story.voiceRecordings.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <MicIcon className="text-primary" /> Сенің жазбаларың (Your recordings)
                  </h3>
                  {story.voiceRecordings.map((rec, i) => (
                    <div key={i} className="bg-primary/5 p-4 rounded-xl border-2 border-primary/20 flex flex-col sm:flex-row items-center gap-4">
                      <div className="font-bold text-primary w-24">Жазба #{i + 1}</div>
                      <audio src={rec} controls className="w-full flex-1 h-10" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'watch' && (
            <div className="space-y-12">
              {story.videoUrl && (
                <div>
                  <h3 className="font-display text-xl font-bold mb-4">Видео</h3>
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
              )}

              {story.images && story.images.length > 0 && (
                <div>
                  <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <ImageIcon className="text-accent-foreground" /> Слайд-шоу
                  </h3>
                  <Slideshow images={story.images} />
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function MicIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  )
}
