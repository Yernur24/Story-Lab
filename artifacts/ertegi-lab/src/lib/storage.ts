import { v4 as uuidv4 } from 'uuid';

export type StoryCategory = 'fairy-tale' | 'comic' | 'cartoon' | 'custom';

export interface Story {
  id: string;
  title: string;
  category: StoryCategory;
  description: string;
  content: string;
  coverEmoji: string;
  videoUrl?: string;
  videoFile?: string; // IndexedDB key for uploaded video blob
  audioFile?: string;
  images?: string[];
  voiceRecordings?: string[];
  isFavorite?: boolean;
  readCount?: number;
  createdAt: number;
}

const STORAGE_KEY = 'ertegi_lab_stories';

const SEED_STORIES: Story[] = [
  {
    id: uuidv4(),
    title: 'Алтын Балық',
    category: 'fairy-tale',
    description: 'Шал мен кемпірдің және барлық тілекті орындайтын алтын балықтың ғажайып ертегісі.',
    content: 'Ерте, ерте, ертеде, көк теңіздің жағасында бір шал мен кемпір өмір сүріпті. Олар өте кедей болыпты.\n\nБір күні шал теңізге тор салып, бір кішкентай алтын балық ұстап алады. Балық адамша тіл қатып: "Ата, мені теңізге жіберші, мен сенің кез келген тілегіңді орындаймын!" - дейді.\n\nШал жаны ашып балықты теңізге жіберіп жібереді. Кемпір болса жаңа шөміш сұрайды. Балық орындайды. Сонан соң жаңа үй, байлық, ең соңында патшайым болғысы келеді...\n\nБірақ ашкөз кемпірдің тілегі бітпейді. Ең соңында барлығы кетіп, тағы да ескі жерлеріне оралады. Бұл ертегі ашкөздіктің жаман екенін үйретеді.',
    coverEmoji: '🐠',
    isFavorite: true,
    readCount: 5,
    createdAt: Date.now() - 500000,
  },
  {
    id: uuidv4(),
    title: 'Батыр Ер Тостик',
    category: 'fairy-tale',
    description: 'Ер Тостик — қазақтың ең танымал батыры. Оның ғажайып іс-қимылдары туралы ертегі.',
    content: 'Ерте заманда бір шалдың Ер Тостик деген баласы болыпты. Ол туа салысымен жерден тіршілік табады, аттарды бағады.\n\nКүндердің бір күні жауыз мыстан кемпір ауылдың балаларын ұрлайды. Ер Тостик оларды іздеп жолға шығады.\n\nЖолда ол сиқырлы жылқы Тайбурылды кездестіреді. Тайбурыл оған: "Мінші, батырым, мен сені апарамын!" — дейді.\n\nЕр Тостик мыстан кемпірмен айқасып, балаларды азат етеді. Ел оны қарсы алып, той жасайды. Батыр үнемі халқы үшін еңбек етеді.',
    coverEmoji: '🦸‍♂️',
    readCount: 3,
    createdAt: Date.now() - 400000,
  },
  {
    id: uuidv4(),
    title: 'Сиқырлы Орман',
    category: 'fairy-tale',
    description: 'Сөйлейтін ағаштар мен мейірімді жануарлар мекендейтін орман.',
    content: 'Бір кішкентай қыз орманға жидек теруге шығып, адасып қалады.\n\nКенеттен ол бір ғажайып алаңқайға тап болады. Ондағы ағаштар ән салып, гүлдер билеп жүр екен.\n\nБір ақ қоян секіріп келіп: "Қош келдің, сиқырлы орманға!" — депті. Ол қызды үйіне дейін бастап апарады.\n\nОрман оның достары болды. Ол енді жалғыздық сезінбейді.',
    coverEmoji: '🌳',
    readCount: 2,
    createdAt: Date.now() - 300000,
  },
  {
    id: uuidv4(),
    title: 'Маша мен Аю',
    category: 'cartoon',
    description: 'Қызғылт киім киген қызалақ Маша мен оның досы Аю туралы күлкілі мультфильм.',
    content: 'Маша — өте қызық, қуаты мол, тентек қызалақ. Ол орманда тұратын үлкен мейірімді Аюмен дос болып алады.\n\nМаша үнемі Аюдың үйіне келіп, оның тамақтарын жейді, ойыншықтарымен ойнайды.\n\nАю болса Машаны жақсы көреді, бірақ оның тентектіктері кейде шаршатады.\n\nБірге олар көптеген қызықты оқиғаларды басынан өткереді. Достық — ең бағалы нәрсе!',
    coverEmoji: '🐻',
    videoUrl: 'https://www.youtube.com/watch?v=LvJiMCNDEMI',
    isFavorite: true,
    readCount: 8,
    createdAt: Date.now() - 200000,
  },
  {
    id: uuidv4(),
    title: 'Пеппа Шошқа',
    category: 'cartoon',
    description: 'Кішкентай шошқа Пеппа мен оның отбасының күнделікті өмірі туралы мультфильм.',
    content: 'Пеппа — кішкентай шошқа. Оның Жорж деген ағасы, Мама Шошқа мен Папа Шошқа бар.\n\nПеппа мектепке барады, досымен ойнайды, саяхатқа шығады.\n\nОның ең ұнататын ісі — лас шұңқырда секіру! Мамасы ренжіп кетсе де Пеппа тоқтамайды.\n\nПеппаның ертегілері балаларға достық, үлкенді сыйлау, табиғатты сүю туралы үйретеді.',
    coverEmoji: '🐷',
    videoUrl: 'https://www.youtube.com/watch?v=GJXDGdFa94o',
    readCount: 6,
    createdAt: Date.now() - 150000,
  },
  {
    id: uuidv4(),
    title: 'Робокар Поли',
    category: 'cartoon',
    description: 'Сиқырлы машиналар мен олардың адамдарға көмек ету туралы ертегісі.',
    content: 'Брум мен оның достары — сиқырлы роботтар! Олар адамдар қиналғанда үнемі көмекке келеді.\n\nПоли — ақылды полиция машинасы. Рой — жылдам жедел жәрдем. Амбер — ұшқыш.\n\nКүн сайын олар қалада тәртіп сақтап, балаларға дос болады.\n\nБіріге жұмыс істеу — мықты команданың сыры!',
    coverEmoji: '🚓',
    videoUrl: 'https://www.youtube.com/watch?v=8_vJHCbF9g0',
    readCount: 4,
    createdAt: Date.now() - 100000,
  },
  {
    id: uuidv4(),
    title: 'Батыр Ер мен Айдаһар',
    category: 'comic',
    description: 'Жауыз айдаһарды жеңуге аттанған батыр туралы қызықты комикс оқиғасы.',
    content: 'ТАРАУ 1: ШАҚЫРУ\nАуылда үлкен үрей туды! Қызыл айдаһар тауда пайда болып, ауылдықтарды қорқытып жатыр.\n\nТАРАУ 2: ЖОЛҒА ШЫҒУ\nЖас батыр Арман қылышын алып жолға шықты. Жолда ол сиқырлы жебесі бар садақшыны кездестірді.\n\nТАРАУ 3: ШАЙҚАС\nАйдаһармен шайқас ұзаққа созылды. Арман батылдығын жоғалтпады.\n\nТАРАУ 4: ЖЕҢІС\nАрман айдаһарды жеңіп, ауылға оралды. Барлық ел оны қарсы алып, той жасады.',
    coverEmoji: '🐲',
    readCount: 7,
    createdAt: Date.now() - 50000,
  },
  {
    id: uuidv4(),
    title: 'Ғарышкер Аспан',
    category: 'comic',
    description: 'Кішкентай ғарышкердің жұлдыздар арасындағы саяхаты туралы комикс.',
    content: 'БАСТАУЫ\nАспан — 8 жасар ғарышкер. Оның ракетасы — ескі теңге қорабынан жасалған!\n\nЖОЛ\nАспан жұлдыздарға ұшып кетті. Жолда ол кішкентай жасыл инопланетяндарды кездестірді.\n\nДОСТЫҚ\nОлар тіл таппаса да, күлкімен тіл табысты. Аспан оларға жер туралы айтты.\n\nҮЙГЕ ҚАЙТУ\nАспан үйіне оралып, барлығына жаңа достары туралы айтты. Әркімнің армандауға құқығы бар!',
    coverEmoji: '🚀',
    readCount: 5,
    createdAt: Date.now() - 25000,
  },
];

export const storage = {
  getStories: (): Story[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_STORIES));
        return SEED_STORIES;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return [];
    }
  },

  getStory: (id: string): Story | undefined => {
    const stories = storage.getStories();
    return stories.find(s => s.id === id);
  },

  saveStory: (story: Omit<Story, 'id' | 'createdAt'> & { id?: string }): Story => {
    const stories = storage.getStories();

    if (story.id) {
      const index = stories.findIndex(s => s.id === story.id);
      if (index !== -1) {
        const updatedStory = { ...stories[index], ...story } as Story;
        stories[index] = updatedStory;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
        return updatedStory;
      }
    }

    const newStory: Story = {
      ...story,
      id: uuidv4(),
      createdAt: Date.now(),
    } as Story;

    stories.unshift(newStory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    return newStory;
  },

  deleteStory: (id: string): void => {
    const stories = storage.getStories();
    const filtered = stories.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  addVoiceRecording: (storyId: string, base64Audio: string): Story | undefined => {
    const story = storage.getStory(storyId);
    if (!story) return undefined;
    const recordings = story.voiceRecordings || [];
    const updatedStory = { ...story, voiceRecordings: [...recordings, base64Audio] };
    return storage.saveStory(updatedStory);
  },

  deleteVoiceRecording: (storyId: string, index: number): Story | undefined => {
    const story = storage.getStory(storyId);
    if (!story) return undefined;
    const recordings = [...(story.voiceRecordings || [])];
    recordings.splice(index, 1);
    const updatedStory = { ...story, voiceRecordings: recordings };
    return storage.saveStory(updatedStory);
  },

  toggleFavorite: (storyId: string): Story | undefined => {
    const story = storage.getStory(storyId);
    if (!story) return undefined;
    const updatedStory = { ...story, isFavorite: !story.isFavorite };
    return storage.saveStory(updatedStory);
  },

  incrementReadCount: (storyId: string): void => {
    const story = storage.getStory(storyId);
    if (!story) return;
    const updatedStory = { ...story, readCount: (story.readCount || 0) + 1 };
    storage.saveStory(updatedStory);
  },

  resetToSeed: (): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_STORIES));
  },
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
