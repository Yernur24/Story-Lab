import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSaveStory, useStory } from "@/hooks/use-stories";
import { fileToBase64, StoryCategory } from "@/lib/storage";
import { saveVideoBlob, hasVideoBlob } from "@/lib/videoDb";
import { ArrowLeft, Save, Image as ImageIcon, Music, Video, Sparkles, Link2, Upload } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const formSchema = z.object({
  title: z.string().min(2, "Атауы өте қысқа"),
  category: z.enum(['fairy-tale', 'comic', 'cartoon', 'custom']),
  description: z.string().min(5, "Сипаттама жазыңыз"),
  content: z.string().min(10, "Ертегі мәтінін жазыңыз"),
  coverEmoji: z.string().min(1, "Эмоджи таңдаңыз"),
  videoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type VideoMode = 'url' | 'file';

const EMOJIS = [
  '👑','🐉','🏰','🧚‍♀️','🦄','🦁','🦊','🐻','🦉','🦋',
  '🚀','⭐','🌈','🍎','🍄','🐠','🌳','🦸‍♂️','🐷','🐓',
  '🎭','🎪','🎨','🎬','🎵','🌺','🦅','🐺','🌙','🏔️',
];

export default function StoryForm() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/edit/:id");
  const isEdit = !!params?.id;
  const { toast } = useToast();

  const { data: existingStory, isLoading: isLoadingStory } = useStory(params?.id || "");
  const saveStory = useSaveStory();

  const [audioBase64, setAudioBase64] = useState<string | undefined>();
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [videoMode, setVideoMode] = useState<VideoMode>('url');
  const [videoFileKey, setVideoFileKey] = useState<string | undefined>();
  const [videoFileName, setVideoFileName] = useState<string | undefined>();
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | undefined>();
  const [existingHasVideoFile, setExistingHasVideoFile] = useState(false);
  const [quizEnabled, setQuizEnabled] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "fairy-tale",
      description: "",
      content: "",
      coverEmoji: "👑",
      videoUrl: "",
    },
  });

  useEffect(() => {
    if (existingStory && isEdit) {
      form.reset({
        title: existingStory.title,
        category: existingStory.category,
        description: existingStory.description,
        content: existingStory.content,
        coverEmoji: existingStory.coverEmoji,
        videoUrl: existingStory.videoUrl || "",
      });
      setAudioBase64(existingStory.audioFile);
      setImagesBase64(existingStory.images || []);

      if (existingStory.videoFile) {
        setVideoFileKey(existingStory.videoFile);
        setVideoMode('file');
        hasVideoBlob(existingStory.videoFile).then(exists => {
          setExistingHasVideoFile(exists);
        });
      }
      setQuizEnabled(existingStory.quizEnabled !== false);
    }
  }, [existingStory, isEdit, form]);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setAudioBase64(base64);
      toast({ title: "✓ Аудио жүктелді", description: file.name });
    } catch {
      toast({ title: "Қате", description: "Аудио жүктелмеді", variant: "destructive" });
    }
    setIsUploading(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 200 * 1024 * 1024; // 200 MB
    if (file.size > maxSize) {
      toast({ title: "Ескерту", description: "Видео файл тым үлкен (макс. 200 МБ). YouTube URL пайдаланыңыз.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const key = `video_${Date.now()}`;
      await saveVideoBlob(key, file);
      setVideoFileKey(key);
      setVideoFileName(file.name);

      // Create a temporary preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(previewUrl);

      toast({ title: "✓ Видео жүктелді!", description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} МБ)` });
    } catch {
      toast({ title: "Қате", description: "Видео жүктелмеді", variant: "destructive" });
    }
    setIsUploading(false);
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (files.length > 8) {
      toast({ title: "Ескерту", description: "Ең көбі 8 сурет қосуға болады." });
    }
    setIsUploading(true);
    try {
      const results = await Promise.all(files.slice(0, 8).map(fileToBase64));
      setImagesBase64(prev => [...prev, ...results]);
      toast({ title: "✓ Суреттер қосылды", description: `${results.length} сурет` });
    } catch {
      toast({ title: "Қате", description: "Суреттер жүктелмеді", variant: "destructive" });
    }
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setImagesBase64(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormValues) => {
    const videoFile = videoMode === 'file' ? videoFileKey : undefined;
    const videoUrl = videoMode === 'url' ? (data.videoUrl || undefined) : undefined;

    saveStory.mutate({
      id: isEdit ? params.id : undefined,
      ...data,
      videoUrl,
      videoFile,
      audioFile: audioBase64,
      images: imagesBase64,
    }, {
      onSuccess: (saved) => {
        toast({ title: "🎉 Тамаша!", description: "Ертегі сәтті сақталды!" });
        setLocation(`/story/${saved.id}`);
      },
    });
  };

  if (isEdit && isLoadingStory) {
    return <div className="min-h-screen flex items-center justify-center text-2xl">⏳ Жүктелуде...</div>;
  }

  return (
    <div className="min-h-screen py-8 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/library" className="inline-flex items-center gap-2 text-muted-foreground font-bold hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" /> Кітапханаға қайту
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border-4 border-border p-6 md:p-10">
          <div className="flex items-center gap-4 mb-8 border-b-2 border-dashed border-border pb-6">
            <div className="p-3 bg-primary text-white rounded-2xl rotate-3 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display font-extrabold text-foreground">
              {isEdit ? '✏️ Өңдеу' : '✨ Жаңа ертегі'}
            </h1>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Title & Cover */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <label className="font-bold text-foreground block">📝 Атауы</label>
                <input
                  {...form.register("title")}
                  className="w-full bg-muted/50 border-4 border-border rounded-2xl py-3 px-4 font-bold text-xl focus:outline-none focus:border-primary focus:bg-white transition-all"
                  placeholder="Сиқырлы орман..."
                />
                {form.formState.errors.title && (
                  <p className="text-destructive font-bold text-sm">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="w-full md:w-auto space-y-2">
                <label className="font-bold text-foreground block">🎨 Мұқаба</label>
                <div className="flex flex-wrap gap-2 max-w-[220px]">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => form.setValue('coverEmoji', e)}
                      className={`text-2xl w-10 h-10 rounded-xl transition-all flex items-center justify-center ${
                        form.watch('coverEmoji') === e
                          ? 'bg-primary/20 ring-2 ring-primary scale-110'
                          : 'bg-muted hover:bg-primary/10'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category & Description */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="font-bold text-foreground block">📂 Категория</label>
                <select
                  {...form.register("category")}
                  className="w-full bg-muted/50 border-4 border-border rounded-2xl py-3 px-4 font-bold focus:outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="fairy-tale">📖 Ертегі</option>
                  <option value="comic">💥 Комикс</option>
                  <option value="cartoon">🎬 Мультфильм</option>
                  <option value="custom">✨ Басқа</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="font-bold text-foreground block">📄 Қысқаша сипаттама</label>
                <input
                  {...form.register("description")}
                  className="w-full bg-muted/50 border-4 border-border rounded-2xl py-3 px-4 font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
                  placeholder="Бұл ертегі не туралы?"
                />
                {form.formState.errors.description && (
                  <p className="text-destructive font-bold text-sm">{form.formState.errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="font-bold text-foreground block">📖 Ертегі мәтіні</label>
              <textarea
                {...form.register("content")}
                rows={10}
                className="w-full bg-muted/50 border-4 border-border rounded-3xl py-4 px-6 font-medium text-lg focus:outline-none focus:border-primary focus:bg-white transition-all resize-none leading-relaxed"
                placeholder="Ерте, ерте, ертеде...&#10;&#10;Жаңа параграф үшін Enter басыңыз."
              />
              {form.formState.errors.content && (
                <p className="text-destructive font-bold text-sm">{form.formState.errors.content.message}</p>
              )}
              {form.watch('content') && (
                <p className="text-xs text-muted-foreground font-bold text-right">
                  {form.watch('content').length} символ
                </p>
              )}
            </div>

            {/* Media Section */}
            <div className="p-6 bg-muted/30 border-4 border-dashed border-border rounded-3xl space-y-8">
              <h3 className="font-display font-bold text-xl flex items-center gap-2">
                <Sparkles className="text-accent w-5 h-5" /> Қосымша медиа
              </h3>

              {/* VIDEO — with URL / File toggle */}
              <div className="space-y-3">
                <label className="font-bold text-foreground flex items-center gap-2">
                  <Video className="w-5 h-5 text-secondary" /> Видео
                </label>

                {/* Mode toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoMode('url')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                      videoMode === 'url'
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-white border-border text-muted-foreground hover:border-secondary/50'
                    }`}
                  >
                    <Link2 className="w-4 h-4" /> YouTube URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoMode('file')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                      videoMode === 'file'
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-white border-border text-muted-foreground hover:border-secondary/50'
                    }`}
                  >
                    <Upload className="w-4 h-4" /> Файл жүктеу
                  </button>
                </div>

                {videoMode === 'url' && (
                  <input
                    {...form.register("videoUrl")}
                    className="w-full bg-white border-2 border-border rounded-xl py-2 px-4 focus:outline-none focus:border-secondary transition-all"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                )}

                {videoMode === 'file' && (
                  <div className="space-y-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-white border-2 border-border hover:border-secondary px-5 py-3 rounded-xl font-bold transition-all shadow-sm">
                      <Upload className="w-4 h-4 text-secondary" />
                      {isUploading ? 'Жүктелуде...' : 'Видео файл таңдау (MP4, WebM)'}
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/*"
                        className="hidden"
                        onChange={handleVideoUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground font-medium">
                      Максималды өлшем: 200 МБ. Браузер жапқанда видео қайта жүктеу қажет болуы мүмкін.
                    </p>

                    {videoPreviewUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl overflow-hidden border-4 border-secondary/30 shadow-md"
                      >
                        <video src={videoPreviewUrl} controls className="w-full max-h-60 bg-black" />
                        <div className="bg-secondary/5 px-4 py-2 flex items-center gap-2">
                          <span className="text-green-600 font-bold text-sm">✓</span>
                          <span className="text-sm font-medium text-muted-foreground">{videoFileName}</span>
                        </div>
                      </motion.div>
                    )}

                    {!videoPreviewUrl && existingHasVideoFile && (
                      <div className="bg-secondary/5 px-4 py-3 rounded-xl border-2 border-secondary/20 text-sm font-bold text-secondary">
                        ✓ Видео бұрын жүктелген. Жаңа файл таңдамасаңыз сол қалады.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Audio Upload */}
              <div className="space-y-2">
                <label className="font-bold text-foreground flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary" /> Аудио жүктеу
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-white border-2 border-border hover:border-primary px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm">
                    <Music className="w-4 h-4 text-primary" />
                    {isUploading ? 'Жүктелуде...' : 'Аудио таңдау'}
                    <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} disabled={isUploading} />
                  </label>
                  {audioBase64 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-600">✓ Аудио жүктелді</span>
                      <button type="button" onClick={() => setAudioBase64(undefined)} className="text-xs text-destructive font-bold hover:underline">
                        Өшіру
                      </button>
                    </div>
                  )}
                </div>
                {audioBase64 && (
                  <audio src={audioBase64} controls className="w-full h-10 mt-2" />
                )}
              </div>

              {/* Image Upload for Slideshow */}
              <div className="space-y-3">
                <label className="font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-accent-foreground" /> Слайд-шоу суреттері
                </label>
                <label className="cursor-pointer inline-flex items-center gap-2 bg-white border-2 border-border hover:border-accent-foreground px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm">
                  <ImageIcon className="w-4 h-4" />
                  + Сурет қосу (макс. 8)
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesUpload} disabled={isUploading} />
                </label>

                {imagesBase64.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {imagesBase64.map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-border group"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg font-bold"
                        >
                          ✕
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5 font-bold">
                          {i + 1}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saveStory.isPending || isUploading}
                className="w-full sm:w-auto px-10 py-4 bg-primary text-white text-xl font-bold rounded-2xl shadow-[0_8px_0_hsl(var(--primary-border))] hover:-translate-y-1 hover:shadow-[0_12px_0_hsl(var(--primary-border))] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-6 h-6" />
                {saveStory.isPending ? '⏳ Сақталуда...' : '💾 Сақтау'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
