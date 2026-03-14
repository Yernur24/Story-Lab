import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSaveStory, useStory } from "@/hooks/use-stories";
import { fileToBase64, StoryCategory } from "@/lib/storage";
import { ArrowLeft, Save, Image as ImageIcon, Music, Video, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(2, "Атауы өте қысқа (Title too short)"),
  category: z.enum(['fairy-tale', 'comic', 'cartoon', 'custom']),
  description: z.string().min(5, "Сипаттама жазыңыз (Add description)"),
  content: z.string().min(10, "Ертегі мәтінін жазыңыз (Add story content)"),
  coverEmoji: z.string().min(1, "Эмоджи таңдаңыз (Pick emoji)"),
  videoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EMOJIS = ['👑', '🐉', '🏰', '🧚‍♀️', '🦄', '🦁', '🦊', '🐻', '🦉', '🦋', '🚀', '⭐', '🌈', '🍎', '🍄'];

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
    }
  }, [existingStory, isEdit, form]);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setAudioBase64(base64);
    } catch (err) {
      toast({ title: "Қате (Error)", description: "Аудио жүктелмеді", variant: "destructive" });
    }
    setIsUploading(false);
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Very basic warning for size limits
    if (files.length > 5) {
      toast({ title: "Ескерту (Warning)", description: "Көп сурет сақтауға сыймауы мүмкін. (Max 5 recommended)" });
    }

    setIsUploading(true);
    try {
      const base64Promises = files.map(fileToBase64);
      const results = await Promise.all(base64Promises);
      setImagesBase64(prev => [...prev, ...results]);
    } catch (err) {
      toast({ title: "Қате (Error)", description: "Суреттер жүктелмеді", variant: "destructive" });
    }
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setImagesBase64(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormValues) => {
    saveStory.mutate({
      id: isEdit ? params.id : undefined,
      ...data,
      audioFile: audioBase64,
      images: imagesBase64,
    }, {
      onSuccess: (saved) => {
        toast({
          title: "Тамаша! 🎉",
          description: "Ертегі сәтті сақталды (Story saved successfully)",
        });
        setLocation(`/story/${saved.id}`);
      }
    });
  };

  if (isEdit && isLoadingStory) {
    return <div className="min-h-screen flex items-center justify-center">Жүктелуде...</div>;
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
              {isEdit ? 'Ертегіні өңдеу (Edit Story)' : 'Жаңа ертегі жасау (Create Story)'}
            </h1>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Title & Cover */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <label className="font-bold text-foreground block">Атауы (Title)</label>
                <input
                  {...form.register("title")}
                  className="w-full bg-muted/50 border-4 border-border rounded-2xl py-3 px-4 font-bold text-xl text-foreground focus:outline-none focus:border-primary focus:bg-white transition-all"
                  placeholder="Сиқырлы орман..."
                />
                {form.formState.errors.title && (
                  <p className="text-destructive font-bold text-sm">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div className="w-full md:w-32 space-y-2">
                <label className="font-bold text-foreground block">Мұқаба (Cover)</label>
                <div className="relative">
                  <div className="text-5xl bg-muted/50 border-4 border-border rounded-2xl w-full aspect-square flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    {form.watch("coverEmoji")}
                    <select
                      {...form.register("coverEmoji")}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    >
                      {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Category & Description */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="font-bold text-foreground block">Категория</label>
                <select
                  {...form.register("category")}
                  className="w-full bg-muted/50 border-4 border-border rounded-2xl py-3 px-4 font-bold text-foreground focus:outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="fairy-tale">Ертегі (Fairy Tale)</option>
                  <option value="comic">Комикс (Comic)</option>
                  <option value="cartoon">Мультфильм (Cartoon)</option>
                  <option value="custom">Басқа (Custom)</option>
                </select>
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="font-bold text-foreground block">Қысқаша сипаттама (Description)</label>
                <input
                  {...form.register("description")}
                  className="w-full bg-muted/50 border-4 border-border rounded-2xl py-3 px-4 font-bold text-foreground focus:outline-none focus:border-primary focus:bg-white transition-all"
                  placeholder="Бұл ертегі не туралы?"
                />
                {form.formState.errors.description && (
                  <p className="text-destructive font-bold text-sm">{form.formState.errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="font-bold text-foreground block">Ертегі мәтіні (Story Content)</label>
              <textarea
                {...form.register("content")}
                rows={8}
                className="w-full bg-muted/50 border-4 border-border rounded-3xl py-4 px-6 font-medium text-lg text-foreground focus:outline-none focus:border-primary focus:bg-white transition-all resize-none leading-relaxed"
                placeholder="Ерте, ерте, ертеде..."
              />
              {form.formState.errors.content && (
                <p className="text-destructive font-bold text-sm">{form.formState.errors.content.message}</p>
              )}
            </div>

            {/* Media Uploads */}
            <div className="p-6 bg-muted/30 border-4 border-dashed border-border rounded-3xl space-y-6">
              <h3 className="font-display font-bold text-xl flex items-center gap-2">
                <Sparkles className="text-accent w-5 h-5" /> Қосымша медиа (Media - Optional)
              </h3>
              
              {/* Video URL */}
              <div className="space-y-2">
                <label className="font-bold text-foreground flex items-center gap-2">
                  <Video className="w-5 h-5 text-secondary" /> YouTube / Video URL
                </label>
                <input
                  {...form.register("videoUrl")}
                  className="w-full bg-white border-2 border-border rounded-xl py-2 px-4 focus:outline-none focus:border-secondary transition-all"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* Audio Upload */}
              <div className="space-y-2">
                <label className="font-bold text-foreground flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary" /> Аудио жүктеу (Upload Audio)
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-white border-2 border-border hover:border-primary px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm">
                    {isUploading ? 'Жүктелуде...' : 'Файл таңдау'}
                    <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} disabled={isUploading} />
                  </label>
                  {audioBase64 && <span className="text-sm font-bold text-green-600">✓ Аудио жүктелді</span>}
                </div>
              </div>

              {/* Image Upload for Slideshow */}
              <div className="space-y-4">
                <label className="font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-accent-foreground" /> Слайд-шоу үшін суреттер (Images for Slideshow)
                </label>
                <label className="cursor-pointer inline-block bg-white border-2 border-border hover:border-accent-foreground px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm">
                  {isUploading ? 'Жүктелуде...' : '+ Сурет қосу'}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesUpload} disabled={isUploading} />
                </label>
                
                {imagesBase64.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {imagesBase64.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-border group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={saveStory.isPending || isUploading}
                className="w-full sm:w-auto px-10 py-4 bg-primary text-white text-xl font-bold rounded-2xl shadow-[0_8px_0_hsl(var(--primary-border))] hover:-translate-y-1 hover:shadow-[0_12px_0_hsl(var(--primary-border))] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-6 h-6" /> {saveStory.isPending ? 'Сақталуда...' : 'Сақтау (Save)'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
