export interface ReadEntry {
  storyId: string;
  storyTitle: string;
  coverEmoji: string;
  date: string;
  readAt: number;
}

export interface QuizResult {
  storyId: string;
  storyTitle: string;
  coverEmoji: string;
  score: number;
  total: number;
  gameType: string;
  playedAt: number;
}

const READ_KEY = 'ertegi_read_log';
const QUIZ_KEY = 'ertegi_quiz_log';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function trackRead(story: { id: string; title: string; coverEmoji: string }) {
  try {
    const log: ReadEntry[] = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
    log.push({ storyId: story.id, storyTitle: story.title, coverEmoji: story.coverEmoji, date: todayStr(), readAt: Date.now() });
    const trimmed = log.slice(-200);
    localStorage.setItem(READ_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function trackQuiz(story: { id: string; title: string; coverEmoji: string }, score: number, total: number, gameType: string) {
  try {
    const log: QuizResult[] = JSON.parse(localStorage.getItem(QUIZ_KEY) || '[]');
    log.push({ storyId: story.id, storyTitle: story.title, coverEmoji: story.coverEmoji, score, total, gameType, playedAt: Date.now() });
    const trimmed = log.slice(-100);
    localStorage.setItem(QUIZ_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function getReadLog(): ReadEntry[] {
  try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch { return []; }
}

export function getQuizLog(): QuizResult[] {
  try { return JSON.parse(localStorage.getItem(QUIZ_KEY) || '[]'); } catch { return []; }
}

export function getReadsByDay(days = 7): { date: string; label: string; count: number }[] {
  const log = getReadLog();
  const result: { date: string; label: string; count: number }[] = [];
  const now = new Date();
  const DAY_LABELS = ['Жк', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = i === 0 ? 'Бүгін' : i === 1 ? 'Кеше' : DAY_LABELS[d.getDay()];
    const count = log.filter(e => e.date === dateStr).length;
    result.push({ date: dateStr, label, count });
  }
  return result;
}
