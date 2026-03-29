import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useStory, useStories } from "@/hooks/use-stories";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, RotateCcw, ChevronRight, Lightbulb, CheckCircle2, XCircle, Pencil, Settings2 } from "lucide-react";
import { getQuizForStory, generateAutoQuiz, generateImageMatchQuestions, QuizQuestion, QuizType } from "@/data/quizData";
import { trackQuiz } from "@/lib/stats";
import { loadCustomQuiz } from "./quiz-editor";

const GAME_TYPE_LABELS: Record<QuizType, string> = {
  'multiple-choice': '🎯 Дұрыс жауапты таңда',
  'character-match': '🧑‍🤝‍🧑 Кейіпкерді тап',
  'continue-story': '✏️ Ертегіні жалғастыр',
  'image-match': '🖼 Суретті анықта',
};

const GAME_TYPE_COLORS: Record<QuizType, string> = {
  'multiple-choice': 'from-primary to-blue-500',
  'character-match': 'from-secondary to-pink-500',
  'continue-story': 'from-green-500 to-teal-500',
  'image-match': 'from-orange-500 to-yellow-500',
};

type GameState = 'menu' | 'playing' | 'result';
type AnswerState = 'unanswered' | 'correct' | 'wrong';

export default function QuizPage() {
  const [, params] = useRoute("/quiz/:id");
  const id = params?.id || "";

  const { data: story, isLoading } = useStory(id);
  const { data: allStories } = useStories();

  const [gameState, setGameState] = useState<GameState>('menu');
  const [activeType, setActiveType] = useState<QuizType>('multiple-choice');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [continueText, setContinueText] = useState('');
  const [continueSaved, setContinueSaved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const allStoriesSimple = allStories
    ? allStories.map(s => ({ id: s.id, title: s.title, coverEmoji: s.coverEmoji }))
    : [];

  const customQuestions: QuizQuestion[] = id
    ? loadCustomQuiz(id).map(q => ({
        type: q.type as QuizType,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        hint: q.hint || undefined,
        snippet: q.snippet || undefined,
      }))
    : [];

  const manualQuestions = story ? getQuizForStory(story.title) : [];
  const storyQuestions = manualQuestions.length > 0
    ? manualQuestions
    : story
    ? generateAutoQuiz(
        {
          title: story.title,
          description: story.description,
          content: story.content,
          coverEmoji: story.coverEmoji,
          category: story.category,
        },
        allStoriesSimple
      )
    : [];

  const imageMatchQuestions = allStories
    ? generateImageMatchQuestions(allStoriesSimple)
    : [];

  const getQuestionsForType = (type: QuizType): QuizQuestion[] => {
    if (type === 'image-match') return imageMatchQuestions;
    const custom = customQuestions.filter(q => q.type === type);
    if (custom.length > 0) return custom;
    return storyQuestions.filter(q => q.type === type);
  };

  const hasCustomQuestions = customQuestions.length > 0;

  const startGame = (type: QuizType) => {
    const qs = getQuestionsForType(type);
    if (qs.length === 0) return;
    setActiveType(type);
    setQuestions(qs);
    setCurrentQ(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setAnswerState('unanswered');
    setSelectedOption(null);
    setContinueText('');
    setContinueSaved(false);
    setShowHint(false);
    setGameState('playing');
  };

  const handleAnswer = (index: number) => {
    if (answerState !== 'unanswered') return;
    const q = questions[currentQ];
    setSelectedOption(index);

    if (index === q.correctIndex) {
      setAnswerState('correct');
      setScore(s => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setAnswerState('wrong');
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      if (story) {
        trackQuiz(
          { id: story.id, title: story.title, coverEmoji: story.coverEmoji },
          score,
          questions.length,
          activeType
        );
      }
      setGameState('result');
    } else {
      setCurrentQ(c => c + 1);
      setAnswerState('unanswered');
      setSelectedOption(null);
      setShowHint(false);
      setContinueSaved(false);
      setContinueText('');
    }
  };

  const handleContinueSave = () => {
    if (!continueText.trim()) return;
    setContinueSaved(true);
    setScore(s => s + 1);
    const newStreak = streak + 1;
    setStreak(newStreak);
    if (newStreak > bestStreak) setBestStreak(newStreak);
  };

  const resetGame = () => {
    setGameState('menu');
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setStreak(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="text-6xl">⭐</motion.div>
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

  if (!story.quizEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-8xl mb-6"
        >
          🔒
        </motion.div>
        <h2 className="text-3xl font-display font-extrabold mb-3">Ойын өшірулі</h2>
        <p className="text-muted-foreground font-medium mb-6 max-w-xs">
          Бұл ертегі үшін викторина қосылмаған. Ойынды іске қосу үшін ертегіні өңдеңіз.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/story/${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:-translate-y-0.5 transition-all"
          >
            ← Ертегіге қайту
          </Link>
          <Link
            href={`/edit/${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-border text-foreground font-bold rounded-xl hover:bg-muted transition-all"
          >
            ✏️ Өңдеу
          </Link>
        </div>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQ) / totalQuestions) * 100 : 0;
  const q = questions[currentQ];
  const isLastQuestion = currentQ === totalQuestions - 1;

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (gameState === 'menu') {
    const gameTypes: { type: QuizType; emoji: string; desc: string }[] = [
      { type: 'multiple-choice', emoji: '🎯', desc: '4 жауаптан дұрысын таңда' },
      { type: 'character-match', emoji: '🧑‍🤝‍🧑', desc: 'Ертегі кейіпкерін тап' },
      { type: 'continue-story', emoji: '✏️', desc: 'Ертегіні өз қолыңмен жалғастыр' },
      { type: 'image-match', emoji: '🖼', desc: 'Суретке сай ертегіні тап' },
    ];

    return (
      <div className="min-h-screen pb-24 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link href={`/story/${id}`} className="inline-flex items-center gap-2 text-muted-foreground font-bold hover:text-foreground mb-8 block">
            <ArrowLeft className="w-5 h-5" /> Ертегіге қайту
          </Link>

          <div className="text-center mb-10">
            <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-7xl mb-4">
              🎮
            </motion.div>
            <h1 className="text-4xl font-display font-extrabold mb-2">{story.title}</h1>
            <p className="text-muted-foreground font-bold text-lg">Ойын тапсырмаларын таңда!</p>
            {hasCustomQuestions && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full border-2 border-primary/20">
                ✅ Өз сұрақтарыңыз белсенді ({customQuestions.length} сұрақ)
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {gameTypes.map(({ type, emoji, desc }) => {
              const qs = getQuestionsForType(type);
              const available = qs.length > 0;
              return (
                <motion.button
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={available ? { scale: 1.03, y: -4 } : {}}
                  onClick={() => available && startGame(type)}
                  disabled={!available}
                  className={`relative p-6 rounded-3xl border-4 text-left transition-all shadow-lg ${
                    available
                      ? 'bg-white border-border hover:border-primary cursor-pointer hover:shadow-xl'
                      : 'bg-muted/30 border-dashed border-border opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-5xl mb-3">{emoji}</div>
                  <div className="font-display font-extrabold text-lg mb-1">{GAME_TYPE_LABELS[type]}</div>
                  <div className="text-sm text-muted-foreground font-medium">{desc}</div>
                  {available && (
                    <div className="absolute top-4 right-4 bg-primary/10 text-primary font-bold text-xs px-2 py-1 rounded-full">
                      {qs.length} сұрақ
                    </div>
                  )}
                  {!available && (
                    <div className="absolute top-4 right-4 bg-muted text-muted-foreground font-bold text-xs px-2 py-1 rounded-full">
                      Жоқ
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <Link
            href={`/quiz-editor/${id}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-dashed border-border text-muted-foreground font-bold rounded-2xl hover:border-primary hover:text-primary transition-all"
          >
            <Settings2 className="w-4 h-4" /> ✏️ Өз сұрақтарымды жасау
          </Link>
        </div>
      </div>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (gameState === 'result') {
    const percent = Math.round((score / totalQuestions) * 100);
    const emoji = percent === 100 ? '🏆' : percent >= 70 ? '🌟' : percent >= 40 ? '👍' : '💪';
    const msg = percent === 100
      ? 'Тамаша! Барлығын дұрыс жауаптадың!'
      : percent >= 70
      ? 'Жақсы нәтиже! Ертегіні жақсы білесің!'
      : percent >= 40
      ? 'Жаман емес! Тағы бір рет оқып шық!'
      : 'Ертегіні тағы оқып, қайта сынап көр!';

    return (
      <div className="min-h-screen flex items-center justify-center pb-24 px-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="bg-white rounded-3xl border-4 border-border shadow-2xl p-10 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-8xl mb-6"
            >
              {emoji}
            </motion.div>
            <h2 className="text-3xl font-display font-extrabold mb-2">{msg}</h2>
            <div className="text-6xl font-extrabold text-primary my-6">{score}/{totalQuestions}</div>

            {bestStreak > 1 && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-3 mb-6 text-sm font-bold text-orange-700">
                🔥 Ең ұзын тізбек: {bestStreak} сұрақ қатарынан!
              </div>
            )}

            <div className="w-full bg-muted rounded-full h-4 mb-8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => startGame(activeType)}
                className="w-full py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-[0_4px_0_hsl(var(--primary-border))] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" /> Қайта ойнау
              </button>
              <button
                onClick={resetGame}
                className="w-full py-3 bg-muted text-foreground font-bold rounded-2xl hover:bg-muted/70 transition-all"
              >
                🎮 Басқа ойын таңда
              </button>
              <Link
                href={`/story/${id}`}
                className="w-full py-3 bg-white border-2 border-border text-foreground font-bold rounded-2xl hover:bg-muted transition-all text-center flex items-center justify-center gap-2"
              >
                📖 Ертегіге қайту
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-24 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={resetGame} className="inline-flex items-center gap-2 text-muted-foreground font-bold hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" /> Шығу
          </button>
          <div className="flex items-center gap-3">
            {streak >= 2 && (
              <motion.div
                key={streak}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="bg-orange-100 text-orange-700 font-bold text-sm px-3 py-1 rounded-full border-2 border-orange-200"
              >
                🔥 ×{streak}
              </motion.div>
            )}
            <div className="bg-primary/10 text-primary font-extrabold px-4 py-2 rounded-xl border-2 border-primary/20">
              ⭐ {score}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
            <span className={`px-3 py-1 rounded-full text-white text-xs bg-gradient-to-r ${GAME_TYPE_COLORS[activeType]}`}>
              {GAME_TYPE_LABELS[activeType]}
            </span>
            <span>{currentQ + 1} / {totalQuestions}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className={`h-full bg-gradient-to-r ${GAME_TYPE_COLORS[activeType]} rounded-full transition-all`}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl border-4 border-border shadow-xl p-6 md:p-10 mb-6"
          >
            {/* Image-match: show big emoji */}
            {q.type === 'image-match' && q.hint && (
              <div className="text-center text-7xl mb-6 animate-float">{q.hint}</div>
            )}

            {/* Continue-story snippet */}
            {q.type === 'continue-story' && q.snippet && (
              <div className="bg-muted/50 rounded-2xl p-4 border-l-4 border-primary mb-6">
                <p className="text-muted-foreground font-medium italic">"{q.snippet}"</p>
              </div>
            )}

            <h2 className="text-2xl font-display font-extrabold text-foreground mb-6">
              {q.question}
            </h2>

            {/* Multiple choice / character / image-match options */}
            {(q.type !== 'continue-story') && q.options && (
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((option, i) => {
                  const isSelected = selectedOption === i;
                  const isCorrect = i === q.correctIndex;
                  let cls = 'w-full text-left px-5 py-4 rounded-2xl border-4 font-bold text-lg transition-all ';

                  if (answerState === 'unanswered') {
                    cls += 'bg-muted/50 border-border hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5 cursor-pointer';
                  } else if (isCorrect) {
                    cls += 'bg-green-50 border-green-400 text-green-800';
                  } else if (isSelected && !isCorrect) {
                    cls += 'bg-red-50 border-red-400 text-red-800';
                  } else {
                    cls += 'bg-muted/30 border-border opacity-60';
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={answerState === 'unanswered' ? { scale: 1.01 } : {}}
                      onClick={() => handleAnswer(i)}
                      className={cls}
                      disabled={answerState !== 'unanswered'}
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center text-sm font-extrabold flex-shrink-0">
                          {answerState !== 'unanswered' && isCorrect ? '✓' :
                           answerState !== 'unanswered' && isSelected && !isCorrect ? '✗' :
                           ['A', 'B', 'C', 'D'][i]}
                        </span>
                        {option}
                        {answerState !== 'unanswered' && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />}
                        {answerState !== 'unanswered' && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 ml-auto" />}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Continue story text input */}
            {q.type === 'continue-story' && (
              <div className="space-y-4">
                <textarea
                  rows={5}
                  value={continueText}
                  onChange={e => setContinueText(e.target.value)}
                  disabled={continueSaved}
                  placeholder="Өз жалғасыңды жаз..."
                  className="w-full bg-muted/50 border-4 border-border rounded-2xl py-4 px-5 font-medium text-lg focus:outline-none focus:border-primary focus:bg-white transition-all resize-none leading-relaxed"
                />
                {!continueSaved ? (
                  <button
                    onClick={handleContinueSave}
                    disabled={!continueText.trim()}
                    className="px-6 py-3 bg-green-500 text-white font-bold rounded-2xl shadow-[0_4px_0_hsl(150,60%,30%)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Pencil className="w-4 h-4" /> Сақтау
                  </button>
                ) : (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                    <p className="font-bold text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Керемет! Жалғасың сақталды! +1 ⭐
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Feedback message for MC/character/image */}
            <AnimatePresence>
              {answerState !== 'unanswered' && q.type !== 'continue-story' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-5 p-4 rounded-2xl font-bold flex items-center gap-3 ${
                    answerState === 'correct'
                      ? 'bg-green-50 border-2 border-green-200 text-green-800'
                      : 'bg-red-50 border-2 border-red-200 text-red-800'
                  }`}
                >
                  {answerState === 'correct' ? (
                    <><CheckCircle2 className="w-6 h-6 flex-shrink-0" /> {streak >= 3 ? '🔥 Тамаша тізбек!' : '✓ Дұрыс жауап!'}</>
                  ) : (
                    <><XCircle className="w-6 h-6 flex-shrink-0" /> Қате. Дұрыс жауап: <span className="text-green-700">{q.options?.[q.correctIndex ?? 0]}</span></>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint */}
            {q.hint && q.type !== 'image-match' && answerState === 'unanswered' && (
              <div className="mt-4">
                {!showHint ? (
                  <button onClick={() => setShowHint(true)} className="text-sm font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                    <Lightbulb className="w-4 h-4" /> Кеңес алу
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 flex-shrink-0" /> {q.hint}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        {(answerState !== 'unanswered' || (q.type === 'continue-story' && continueSaved)) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={handleNext}
              className="w-full py-4 bg-primary text-white text-xl font-bold rounded-2xl shadow-[0_6px_0_hsl(var(--primary-border))] hover:-translate-y-1 hover:shadow-[0_10px_0_hsl(var(--primary-border))] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {isLastQuestion ? <><Trophy className="w-6 h-6" /> Нәтижені көру</> : <>Келесі сұрақ <ChevronRight className="w-6 h-6" /></>}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
