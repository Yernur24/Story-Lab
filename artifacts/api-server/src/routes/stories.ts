import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, storiesTable, videoFilesTable } from "@workspace/db";
import { randomUUID } from "crypto";

const router = Router();

const SEED_STORIES = [
  {
    id: randomUUID(),
    title: "Алтын Балық",
    category: "fairy-tale",
    description: "Шал мен кемпірдің және барлық тілекті орындайтын алтын балықтың ғажайып ертегісі.",
    content: "Ерте, ерте, ертеде, көк теңіздің жағасында бір шал мен кемпір өмір сүріпті. Олар өте кедей болыпты.\n\nБір күні шал теңізге тор салып, бір кішкентай алтын балық ұстап алады. Балық адамша тіл қатып: \"Ата, мені теңізге жіберші, мен сенің кез келген тілегіңді орындаймын!\" - дейді.\n\nШал жаны ашып балықты теңізге жіберіп жібереді. Кемпір болса жаңа шөміш сұрайды. Балық орындайды. Сонан соң жаңа үй, байлық, ең соңында патшайым болғысы келеді...\n\nБірақ ашкөз кемпірдің тілегі бітпейді. Ең соңында барлығы кетіп, тағы да ескі жерлеріне оралады. Бұл ертегі ашкөздіктің жаман екенін үйретеді.",
    coverEmoji: "🐠",
    isFavorite: true,
    readCount: 5,
    quizEnabled: false,
    images: [] as string[],
    voiceRecordings: [] as string[],
    createdAt: Date.now() - 500000,
    videoUrl: null,
    videoFile: null,
    audioFile: null,
  },
  {
    id: randomUUID(),
    title: "Батыр Ер Тостик",
    category: "fairy-tale",
    description: "Ер Тостик — қазақтың ең танымал батыры. Оның ғажайып іс-қимылдары туралы ертегі.",
    content: "Ерте заманда бір шалдың Ер Тостик деген баласы болыпты. Ол туа салысымен жерден тіршілік табады, аттарды бағады.\n\nКүндердің бір күні жауыз мыстан кемпір ауылдың балаларын ұрлайды. Ер Тостик оларды іздеп жолға шығады.\n\nЖолда ол сиқырлы жылқы Тайбурылды кездестіреді. Тайбурыл оған: \"Мінші, батырым, мен сені апарамын!\" — дейді.\n\nЕр Тостик мыстан кемпірмен айқасып, балаларды азат етеді. Ел оны қарсы алып, той жасайды. Батыр үнемі халқы үшін еңбек етеді.",
    coverEmoji: "🦸‍♂️",
    isFavorite: false,
    readCount: 3,
    quizEnabled: false,
    images: [] as string[],
    voiceRecordings: [] as string[],
    createdAt: Date.now() - 400000,
    videoUrl: null,
    videoFile: null,
    audioFile: null,
  },
  {
    id: randomUUID(),
    title: "Сиқырлы Орман",
    category: "fairy-tale",
    description: "Сөйлейтін ағаштар мен мейірімді жануарлар мекендейтін орман.",
    content: "Бір кішкентай қыз орманға жидек теруге шығып, адасып қалады.\n\nКенеттен ол бір ғажайып алаңқайға тап болады. Ондағы ағаштар ән салып, гүлдер билеп жүр екен.\n\nБір ақ қоян секіріп келіп: \"Қош келдің, сиқырлы орманға!\" — депті. Ол қызды үйіне дейін бастап апарады.\n\nОрман оның достары болды. Ол енді жалғыздық сезінбейді.",
    coverEmoji: "🌳",
    isFavorite: false,
    readCount: 2,
    quizEnabled: false,
    images: [] as string[],
    voiceRecordings: [] as string[],
    createdAt: Date.now() - 300000,
    videoUrl: null,
    videoFile: null,
    audioFile: null,
  },
  {
    id: randomUUID(),
    title: "Маша мен Аю",
    category: "cartoon",
    description: "Қызғылт киім киген қызалақ Маша мен оның досы Аю туралы күлкілі мультфильм.",
    content: "Маша — өте қызық, қуаты мол, тентек қызалақ. Ол орманда тұратын үлкен мейірімді Аюмен дос болып алады.\n\nМаша үнемі Аюдың үйіне келіп, оның тамақтарын жейді, ойыншықтарымен ойнайды.\n\nАю болса Машаны жақсы көреді, бірақ оның тентектіктері кейде шаршатады.\n\nБірге олар көптеген қызықты оқиғаларды басынан өткереді. Достық — ең бағалы нәрсе!",
    coverEmoji: "🐻",
    isFavorite: true,
    readCount: 8,
    quizEnabled: false,
    images: [] as string[],
    voiceRecordings: [] as string[],
    createdAt: Date.now() - 200000,
    videoUrl: "https://www.youtube.com/watch?v=LvJiMCNDEMI",
    videoFile: null,
    audioFile: null,
  },
  {
    id: randomUUID(),
    title: "Пеппа Шошқа",
    category: "cartoon",
    description: "Кішкентай шошқа Пеппа мен оның отбасының күнделікті өмірі туралы мультфильм.",
    content: "Пеппа — кішкентай шошқа. Оның Жорж деген ағасы, Мама Шошқа мен Папа Шошқа бар.\n\nПеппа мектепке барады, досымен ойнайды, саяхатқа шығады.\n\nОның ең ұнататын ісі — лас шұңқырда секіру! Мамасы ренжіп кетсе де Пеппа тоқтамайды.\n\nПеппаның ертегілері балаларға достық, үлкенді сыйлау, табиғатты сүю туралы үйретеді.",
    coverEmoji: "🐷",
    isFavorite: false,
    readCount: 6,
    quizEnabled: false,
    images: [] as string[],
    voiceRecordings: [] as string[],
    createdAt: Date.now() - 100000,
    videoUrl: null,
    videoFile: null,
    audioFile: null,
  },
];

function mapStory(row: typeof storiesTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    content: row.content,
    coverEmoji: row.coverEmoji,
    videoUrl: row.videoUrl ?? undefined,
    videoFile: row.videoFile ?? undefined,
    quizEnabled: row.quizEnabled,
    audioFile: row.audioFile ?? undefined,
    images: (row.images as string[]) ?? [],
    voiceRecordings: (row.voiceRecordings as string[]) ?? [],
    isFavorite: row.isFavorite,
    readCount: row.readCount,
    createdAt: Number(row.createdAt),
  };
}

router.get("/stories", async (req, res) => {
  try {
    const rows = await db.select().from(storiesTable).orderBy(storiesTable.createdAt);
    if (rows.length === 0) {
      await db.insert(storiesTable).values(SEED_STORIES);
      const seeded = await db.select().from(storiesTable).orderBy(storiesTable.createdAt);
      return res.json(seeded.map(mapStory));
    }
    return res.json(rows.map(mapStory));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stories/reset", async (req, res) => {
  try {
    await db.delete(storiesTable);
    const freshSeeds = SEED_STORIES.map(s => ({ ...s, id: randomUUID(), createdAt: Date.now() }));
    await db.insert(storiesTable).values(freshSeeds);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stories/:id", async (req, res) => {
  try {
    const rows = await db.select().from(storiesTable).where(eq(storiesTable.id, req.params.id));
    if (!rows[0]) return res.status(404).json({ error: "Ертегі табылмады" });
    return res.json(mapStory(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stories", async (req, res) => {
  try {
    const {
      title, category, description, content, coverEmoji,
      videoUrl, videoFile, quizEnabled, audioFile, images, voiceRecordings,
    } = req.body;
    const id = randomUUID();
    const now = Date.now();
    await db.insert(storiesTable).values({
      id,
      title,
      category,
      description,
      content,
      coverEmoji,
      videoUrl: videoUrl ?? null,
      videoFile: videoFile ?? null,
      quizEnabled: quizEnabled ?? false,
      audioFile: audioFile ?? null,
      images: images ?? [],
      voiceRecordings: voiceRecordings ?? [],
      isFavorite: false,
      readCount: 0,
      createdAt: now,
    });
    const rows = await db.select().from(storiesTable).where(eq(storiesTable.id, id));
    return res.status(201).json(mapStory(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/stories/:id", async (req, res) => {
  try {
    const rows = await db.select().from(storiesTable).where(eq(storiesTable.id, req.params.id));
    if (!rows[0]) return res.status(404).json({ error: "Ертегі табылмады" });
    const update: Partial<typeof storiesTable.$inferInsert> = {};
    const fields = ["title","category","description","content","coverEmoji","videoUrl","videoFile","quizEnabled","audioFile","images","voiceRecordings","isFavorite","readCount"] as const;
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        (update as Record<string, unknown>)[field] = req.body[field];
      }
    }
    await db.update(storiesTable).set(update).where(eq(storiesTable.id, req.params.id));
    const updated = await db.select().from(storiesTable).where(eq(storiesTable.id, req.params.id));
    return res.json(mapStory(updated[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/stories/:id", async (req, res) => {
  try {
    const rows = await db.select().from(storiesTable).where(eq(storiesTable.id, req.params.id));
    if (!rows[0]) return res.status(404).json({ error: "Ертегі табылмады" });
    await db.delete(storiesTable).where(eq(storiesTable.id, req.params.id));
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stories/:id/favorite", async (req, res) => {
  try {
    const rows = await db.select().from(storiesTable).where(eq(storiesTable.id, req.params.id));
    if (!rows[0]) return res.status(404).json({ error: "Ертегі табылмады" });
    await db.update(storiesTable).set({ isFavorite: !rows[0].isFavorite }).where(eq(storiesTable.id, req.params.id));
    const updated = await db.select().from(storiesTable).where(eq(storiesTable.id, req.params.id));
    return res.json(mapStory(updated[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stories/:id/read", async (req, res) => {
  try {
    const rows = await db.select().from(storiesTable).where(eq(storiesTable.id, req.params.id));
    if (!rows[0]) return res.status(404).json({ error: "Ертегі табылмады" });
    await db.update(storiesTable).set({ readCount: rows[0].readCount + 1 }).where(eq(storiesTable.id, req.params.id));
    const updated = await db.select().from(storiesTable).where(eq(storiesTable.id, req.params.id));
    return res.json(mapStory(updated[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stories/:id/voice-recordings", async (req, res) => {
  try {
    const rows = await db.select().from(storiesTable).where(eq(storiesTable.id, req.params.id));
    if (!rows[0]) return res.status(404).json({ error: "Ертегі табылмады" });
    const recordings = [...((rows[0].voiceRecordings as string[]) ?? []), req.body.audioBase64];
    await db.update(storiesTable).set({ voiceRecordings: recordings }).where(eq(storiesTable.id, req.params.id));
    const updated = await db.select().from(storiesTable).where(eq(storiesTable.id, req.params.id));
    return res.json(mapStory(updated[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/stories/:id/voice-recordings/:index", async (req, res) => {
  try {
    const rows = await db.select().from(storiesTable).where(eq(storiesTable.id, req.params.id));
    if (!rows[0]) return res.status(404).json({ error: "Ертегі табылмады" });
    const recordings = [...((rows[0].voiceRecordings as string[]) ?? [])];
    const idx = parseInt(req.params.index, 10);
    if (idx >= 0 && idx < recordings.length) recordings.splice(idx, 1);
    await db.update(storiesTable).set({ voiceRecordings: recordings }).where(eq(storiesTable.id, req.params.id));
    const updated = await db.select().from(storiesTable).where(eq(storiesTable.id, req.params.id));
    return res.json(mapStory(updated[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/videos", async (req, res) => {
  try {
    const { key, dataBase64 } = req.body;
    await db.insert(videoFilesTable).values({ key, dataBase64 })
      .onConflictDoUpdate({ target: videoFilesTable.key, set: { dataBase64 } });
    return res.json({ key });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/videos/:key", async (req, res) => {
  try {
    const rows = await db.select().from(videoFilesTable).where(eq(videoFilesTable.key, req.params.key));
    if (!rows[0]) return res.status(404).json({ error: "Видео табылмады" });
    return res.json({ dataBase64: rows[0].dataBase64 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/videos/:key", async (req, res) => {
  try {
    await db.delete(videoFilesTable).where(eq(videoFilesTable.key, req.params.key));
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
