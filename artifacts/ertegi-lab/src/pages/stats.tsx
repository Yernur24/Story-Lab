import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Trophy, Star, TrendingUp, Clock } from "lucide-react";
import { getReadLog, getQuizLog, getReadsByDay, ReadEntry, QuizResult } from "@/lib/stats";
import { useStories } from "@/hooks/use-stories";

const GAME_TYPE_LABELS: Record<string, string> = {
  'multiple-choice': '🎯 Дұрыс жауап',
  'character-match': '🧑‍🤝‍🧑 Кейіпкер',
  'continue-story': '✏️ Жалғастыр',
  'image-match': '🖼 Суретті тап',
};

export default function StatsPage() {
  const [readLog, setReadLog] = useState<ReadEntry[]>([]);
  const [quizLog, setQuizLog] = useState<QuizResult[]>([]);
  const [dayData, setDayData] = useState<{ date: string; label: string; count: number }[]>([]);
  const { data: stories } = useStories();

  useEffect(() => {
    setReadLog(getReadLog());
    setQuizLog(getQuizLog());
    setDayData(getReadsByDay(7));
  }, []);

  const totalRead = readLog.length;
  const uniqueStories = new Set(readLog.map(e => e.storyId)).size;
  const quizTotal = quizLog.length;
  const quizAvgScore = quizLog.length > 0
    ? Math.round(quizLog.reduce((sum, r) => sum + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / quizLog.length)
    : 0;

  const maxCount = Math.max(...dayData.map(d => d.count), 1);

  const topRated = stories
    ? [...stories].filter(s => s.ratingCount > 0).sort((a, b) => b.rating - a.rating).slice(0, 3)
    : [];

  const mostRead = stories
    ? [...stories].sort((a, b) => b.readCount - a.readCount).slice(0, 3)
    : [];

  const recentQuizzes = [...quizLog].reverse().slice(0, 10);
  const recentReads = [...readLog].reverse().slice(0, 10);

  return (
    <div className="min-h-screen pb-24 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary text-white rounded-2xl rotate-3 shadow-sm">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-extrabold text-foreground">📊 Статистика</h1>
            <p className="text-muted-foreground font-medium">Сенің оқу жетістіктерің</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Оқу саны', value: totalRead, color: 'bg-primary/10 text-primary', border: 'border-primary/20' },
            { icon: TrendingUp, label: 'Ертегі', value: uniqueStories, color: 'bg-secondary/10 text-secondary', border: 'border-secondary/20' },
            { icon: Trophy, label: 'Quiz ойыны', value: quizTotal, color: 'bg-green-100 text-green-700', border: 'border-green-200' },
            { icon: Star, label: 'Орташа балл', value: `${quizAvgScore}%`, color: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`${card.color} border-2 ${card.border} rounded-2xl p-4 flex flex-col items-center text-center`}
            >
              <card.icon className="w-6 h-6 mb-2" />
              <div className="text-2xl font-extrabold font-display">{card.value}</div>
              <div className="text-xs font-bold opacity-80 mt-0.5">{card.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Reading Activity Bar Chart */}
        <div className="bg-white rounded-3xl shadow-lg border-4 border-border p-6 mb-6">
          <h2 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Соңғы 7 күн
          </h2>
          <div className="flex items-end gap-2 h-32">
            {dayData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-muted-foreground">
                  {day.count > 0 ? day.count : ''}
                </span>
                <motion.div
                  className="w-full rounded-t-xl bg-gradient-to-t from-primary to-secondary"
                  initial={{ height: 0 }}
                  animate={{ height: day.count === 0 ? 4 : Math.max(8, (day.count / maxCount) * 96) }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                  style={{ minHeight: 4, opacity: day.count === 0 ? 0.2 : 1 }}
                />
                <span className="text-[10px] font-bold text-muted-foreground">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Top Rated Stories */}
          <div className="bg-white rounded-3xl shadow-lg border-4 border-border p-6">
            <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Жоғары рейтинг
            </h2>
            {topRated.length === 0 ? (
              <p className="text-muted-foreground text-sm font-medium text-center py-4">
                Әзірге рейтинг берілмеген
              </p>
            ) : (
              <div className="space-y-3">
                {topRated.map((s, i) => (
                  <Link key={s.id} href={`/story/${s.id}`}>
                    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-2xl hover:bg-amber-50 transition-colors cursor-pointer">
                      <span className="text-2xl">{s.coverEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{s.title}</p>
                        <div className="flex">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} className={`w-3 h-3 ${star <= Math.round(s.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">({s.ratingCount})</span>
                        </div>
                      </div>
                      <span className="text-lg font-extrabold text-amber-500">#{i + 1}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Most Read Stories */}
          <div className="bg-white rounded-3xl shadow-lg border-4 border-border p-6">
            <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Көп оқылды
            </h2>
            {mostRead.length === 0 ? (
              <p className="text-muted-foreground text-sm font-medium text-center py-4">Ертегілер жоқ</p>
            ) : (
              <div className="space-y-3">
                {mostRead.map((s, i) => (
                  <Link key={s.id} href={`/story/${s.id}`}>
                    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-2xl hover:bg-primary/5 transition-colors cursor-pointer">
                      <span className="text-2xl">{s.coverEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground font-medium">👁 {s.readCount} рет оқылды</p>
                      </div>
                      <span className="text-lg font-extrabold text-primary">#{i + 1}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quiz History */}
        <div className="bg-white rounded-3xl shadow-lg border-4 border-border p-6 mb-6">
          <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" /> Quiz нәтижелері тарихы
          </h2>
          {recentQuizzes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">🎮</div>
              <p className="font-medium">Әлі ешқандай ойын ойналмаған</p>
              <Link href="/library" className="mt-2 inline-block text-primary font-bold hover:underline text-sm">
                Ертегіге барып ойна →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentQuizzes.map((r, i) => {
                const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 100;
                const isGreat = pct >= 80;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl border border-border"
                  >
                    <span className="text-2xl">{r.coverEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{r.storyTitle}</p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {GAME_TYPE_LABELS[r.gameType] || r.gameType} · {new Date(r.playedAt).toLocaleDateString('kk-KZ', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className={`text-right`}>
                      <div className={`text-base font-extrabold ${isGreat ? 'text-green-600' : pct >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {r.score}/{r.total}
                      </div>
                      <div className="text-xs font-bold text-muted-foreground">{pct}%</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Reads */}
        <div className="bg-white rounded-3xl shadow-lg border-4 border-border p-6">
          <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-secondary" /> Соңғы оқылғандар
          </h2>
          {recentReads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📚</div>
              <p className="font-medium">Оқу тарихы жоқ</p>
              <Link href="/library" className="mt-2 inline-block text-primary font-bold hover:underline text-sm">
                Ертегі оқу →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentReads.map((r, i) => (
                <Link key={i} href={`/story/${r.storyId}`}>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl border border-border hover:bg-secondary/5 transition-colors cursor-pointer">
                    <span className="text-2xl">{r.coverEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{r.storyTitle}</p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {new Date(r.readAt).toLocaleDateString('kk-KZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">📖</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
