import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useStory, useSaveStory } from "@/hooks/use-stories";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, Save, CheckCircle2,
  HelpCircle, PenLine, ChevronDown, ChevronUp, Lightbulb,
  Gamepad2, Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type CustomQuizType = "multiple-choice" | "character-match" | "continue-story";

export interface CustomQuestion {
  id: string;
  type: CustomQuizType;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  snippet: string;
}

function newQuestion(type: CustomQuizType): CustomQuestion {
  return {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    hint: "",
    snippet: "",
  };
}

const TYPE_META: Record<CustomQuizType, { emoji: string; label: string; desc: string; color: string; border: string }> = {
  "multiple-choice": {
    emoji: "🎯",
    label: "Дұрыс жауапты таңда",
    desc: "4 жауап нұсқасы — бірін дұрыс деп белгіле",
    color: "bg-primary/10 text-primary",
    border: "border-primary/30",
  },
  "character-match": {
    emoji: "🧑‍🤝‍🧑",
    label: "Кейіпкерді тап",
    desc: "Ертегі кейіпкерін анықтайтын сұрақ",
    color: "bg-pink-50 text-pink-700",
    border: "border-pink-200",
  },
  "continue-story": {
    emoji: "✏️",
    label: "Ертегіні жалғастыр",
    desc: "Бала өз жалғасын еркін жазады",
    color: "bg-green-50 text-green-700",
    border: "border-green-200",
  },
};

function QuestionCard({
  q,
  index,
  onChange,
  onDelete,
}: {
  q: CustomQuestion;
  index: number;
  onChange: (updated: CustomQuestion) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const meta = TYPE_META[q.type];
  const hasOptions = q.type === "multiple-choice" || q.type === "character-match";

  const updateOption = (i: number, val: string) => {
    const opts = [...q.options];
    opts[i] = val;
    onChange({ ...q, options: opts });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      className="bg-white rounded-3xl border-4 border-border shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-extrabold text-primary text-sm">
          {index + 1}
        </div>
        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border-2 ${meta.color} ${meta.border}`}>
          {meta.emoji} {meta.label}
        </span>
        <p className="flex-1 font-bold text-foreground truncate text-sm min-w-0">
          {q.question || <span className="text-muted-foreground italic">Сұрақ жазылмаған...</span>}
        </p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-xl transition-all"
            title="Өшіру"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t-2 border-dashed border-border pt-4">

              {/* Snippet — only for continue-story */}
              {q.type === "continue-story" && (
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <PenLine className="w-3.5 h-3.5" /> Ертегі үзіндісі (оқушыға көрсетіледі)
                  </label>
                  <textarea
                    rows={3}
                    value={q.snippet}
                    onChange={e => onChange({ ...q, snippet: e.target.value })}
                    placeholder="Мысалы: «Шал балықты теңізге жіберіп жіберді...»"
                    className="w-full bg-muted/50 border-2 border-border rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-green-400 focus:bg-white transition-all resize-none"
                  />
                </div>
              )}

              {/* Question text */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Сұрақ мәтіні
                </label>
                <textarea
                  rows={2}
                  value={q.question}
                  onChange={e => onChange({ ...q, question: e.target.value })}
                  placeholder="Сұрақты осында жазыңыз..."
                  className="w-full bg-muted/50 border-2 border-border rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Options */}
              {hasOptions && (
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wide">
                    Жауап нұсқалары — дұрысын жасылға басыңыз
                  </label>
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onChange({ ...q, correctIndex: i })}
                          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 font-extrabold text-sm transition-all ${
                            q.correctIndex === i
                              ? "bg-green-500 border-green-500 text-white shadow-md"
                              : "bg-white border-border text-muted-foreground hover:border-green-400"
                          }`}
                        >
                          {["A", "B", "C", "D"][i]}
                        </button>
                        <input
                          type="text"
                          value={opt}
                          onChange={e => updateOption(i, e.target.value)}
                          placeholder={`${["A", "B", "C", "D"][i]} нұсқасы...`}
                          className={`flex-1 border-2 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none transition-all ${
                            q.correctIndex === i
                              ? "border-green-300 bg-green-50 focus:border-green-400"
                              : "bg-muted/50 border-border focus:border-primary focus:bg-white"
                          }`}
                        />
                        {q.correctIndex === i && (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hint */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Кеңес (міндетті емес)
                </label>
                <input
                  type="text"
                  value={q.hint}
                  onChange={e => onChange({ ...q, hint: e.target.value })}
                  placeholder="Оқушыға берілетін кеңес..."
                  className="w-full bg-muted/50 border-2 border-border rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function QuizEditor() {
  const [, params] = useRoute("/quiz-editor/:id");
  const id = params?.id || "";
  const { toast } = useToast();

  const { data: story, isLoading } = useStory(id);
  const saveStory = useSaveStory();

  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [quizEnabled, setQuizEnabled] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (story) {
      if (story.quizQuestions && Array.isArray(story.quizQuestions)) {
        setQuestions(story.quizQuestions as CustomQuestion[]);
      }
      setQuizEnabled(story.quizEnabled !== false);
    }
  }, [story?.id]);

  const addQuestion = (type: CustomQuizType) => {
    setQuestions(prev => [...prev, newQuestion(type)]);
    setShowTypeMenu(false);
    setSaved(false);
  };

  const updateQuestion = (idx: number, updated: CustomQuestion) => {
    setQuestions(prev => prev.map((q, i) => (i === idx ? updated : q)));
    setSaved(false);
  };

  const deleteQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
    setSaved(false);
  };

  const handleSave = () => {
    saveStory.mutate(
      { id, quizQuestions: questions as object[], quizEnabled },
      {
        onSuccess: () => {
          setSaved(true);
          toast({ title: "✅ Сақталды!", description: `${questions.length} сұрақ базаға жазылды` });
          setTimeout(() => setSaved(false), 3000);
        },
        onError: () => {
          toast({ title: "Қате", description: "Сақтау сәтсіз аяқталды", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="text-6xl">🌟</motion.div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-4">😢</div>
        <p className="font-bold text-xl mb-4">Ертегі табылмады</p>
        <Link href="/library" className="text-primary font-bold hover:underline">← Кітапханаға қайту</Link>
      </div>
    );
  }

  const mcCount = questions.filter(q => q.type === "multiple-choice").length;
  const cmCount = questions.filter(q => q.type === "character-match").length;
  const csCount = questions.filter(q => q.type === "continue-story").length;

  return (
    <div className="min-h-screen pb-32 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <Link href={`/story/${id}`} className="inline-flex items-center gap-2 text-muted-foreground font-bold hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" /> Ертегіге қайту
        </Link>

        {/* Story card */}
        <div className="bg-white rounded-3xl border-4 border-border shadow-sm p-5 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0 overflow-hidden">
            {story.images?.[0]
              ? <img src={story.images[0]} alt="" className="w-full h-full object-cover" />
              : story.coverEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wide mb-0.5">Ойын редакторы</p>
            <h1 className="text-xl font-display font-extrabold text-foreground truncate">{story.title}</h1>
            <div className="flex gap-2 mt-1 flex-wrap">
              {mcCount > 0 && <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">🎯 {mcCount}</span>}
              {cmCount > 0 && <span className="text-xs font-bold bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full">🧑‍🤝‍🧑 {cmCount}</span>}
              {csCount > 0 && <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">✏️ {csCount}</span>}
              {questions.length === 0 && <span className="text-xs text-muted-foreground font-medium">Сұрақ жоқ</span>}
            </div>
          </div>
          <Link
            href={`/quiz/${id}`}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-bold text-sm rounded-xl shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Play className="w-4 h-4" /> Ойнау
          </Link>
        </div>

        {/* Quiz on/off toggle */}
        <div className={`rounded-3xl border-4 p-5 mb-5 transition-all ${quizEnabled ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border'}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl transition-colors ${quizEnabled ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-foreground">🎮 Ойын (Викторина)</p>
                <p className="text-sm text-muted-foreground font-medium">
                  {quizEnabled ? 'Ойын қосулы — оқырмандар тест тапсыра алады' : 'Ойын өшірулі'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setQuizEnabled(v => !v); setSaved(false); }}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${quizEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${quizEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4 mb-5">
          <AnimatePresence>
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                q={q}
                index={idx}
                onChange={updated => updateQuestion(idx, updated)}
                onDelete={() => deleteQuestion(idx)}
              />
            ))}
          </AnimatePresence>

          {questions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-14 bg-white rounded-3xl border-4 border-dashed border-border"
            >
              <div className="text-5xl mb-3">🎮</div>
              <p className="font-bold text-foreground text-lg mb-1">Сұрақ жоқ</p>
              <p className="text-muted-foreground font-medium text-sm">Төмендегі «+ Сұрақ қосу» батырмасын басыңыз</p>
            </motion.div>
          )}
        </div>

        {/* Add question */}
        <div className="relative mb-6">
          <button
            type="button"
            onClick={() => setShowTypeMenu(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white border-4 border-dashed border-primary/40 text-primary font-extrabold rounded-3xl hover:border-primary hover:bg-primary/5 transition-all text-lg"
          >
            <Plus className="w-6 h-6" /> Сұрақ қосу
          </button>

          <AnimatePresence>
            {showTypeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-2 bg-white border-4 border-border rounded-3xl shadow-2xl z-20 overflow-hidden"
              >
                {(Object.entries(TYPE_META) as [CustomQuizType, typeof TYPE_META[CustomQuizType]][]).map(([type, meta]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addQuestion(type)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors text-left border-b last:border-b-0 border-border"
                  >
                    <span className={`text-2xl w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>{meta.emoji}</span>
                    <div>
                      <p className="font-extrabold text-foreground">{meta.label}</p>
                      <p className="text-sm text-muted-foreground font-medium">{meta.desc}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky save button */}
        <div className="fixed bottom-6 left-0 right-0 px-4 z-30 max-w-2xl mx-auto">
          <motion.button
            type="button"
            onClick={handleSave}
            disabled={saveStory.isPending}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-4 font-extrabold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all ${
              saved
                ? "bg-green-500 text-white shadow-[0_6px_0_hsl(150,60%,30%)]"
                : "bg-primary text-white shadow-[0_6px_0_hsl(var(--primary-border))] hover:-translate-y-0.5 hover:shadow-[0_10px_0_hsl(var(--primary-border))] disabled:opacity-60"
            }`}
          >
            {saveStory.isPending
              ? <>⏳ Сақталуда...</>
              : saved
              ? <><CheckCircle2 className="w-6 h-6" /> Сақталды!</>
              : <><Save className="w-6 h-6" /> Сақтау — {questions.length} сұрақ, ойын {quizEnabled ? 'қосулы' : 'өшірулі'}</>}
          </motion.button>
        </div>

      </div>
    </div>
  );
}
