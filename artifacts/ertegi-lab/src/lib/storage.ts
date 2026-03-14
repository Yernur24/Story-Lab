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
  audioFile?: string; // base64
  images?: string[]; // array of base64
  voiceRecordings?: string[]; // array of base64
  createdAt: number;
}

const STORAGE_KEY = 'ertegi_lab_stories';

const SEED_STORIES: Story[] = [
  {
    id: uuidv4(),
    title: 'Алтын Балық',
    category: 'fairy-tale',
    description: 'Шал мен кемпірдің және барлық тілекті орындайтын алтын балықтың ғажайып ертегісі.',
    content: 'Ерте, ерте, ертеде, көк теңіздің жағасында бір шал мен кемпір өмір сүріпті. Олар өте кедей болыпты. Бір күні шал теңізге тор салып, бір кішкентай алтын балық ұстап алады. Балық адамша тіл қатып: "Ата, мені теңізге жіберші, мен сенің кез келген тілегіңді орындаймын!" - дейді...',
    coverEmoji: '🐠',
    createdAt: Date.now() - 100000,
  },
  {
    id: uuidv4(),
    title: 'Батыр Ер',
    category: 'comic',
    description: 'Жауыз айдаһарды жеңуге аттанған батыр туралы қызықты оқиға.',
    content: 'Баяғы өткен заманда, бір үлкен таудың басында жауыз айдаһар өмір сүріпті. Ол ауыл адамдарына көп зиян тигізіпті. Содан бір күні ауылдың ең батыр жігіті Ерасыл айдаһармен жекпе-жекке шығуға бел буады. Ол өзінің жүйрік тұлпарына мініп, қолына алмас қылышын алып, жолға шығады...',
    coverEmoji: '🦸‍♂️',
    createdAt: Date.now() - 50000,
  },
  {
    id: uuidv4(),
    title: 'Сиқырлы Орман',
    category: 'cartoon',
    description: 'Сөйлейтін ағаштар мен мейірімді жануарлар мекендейтін орман.',
    content: 'Бір кішкентай қыз орманға жидек теруге шығып, адасып қалады. Кенеттен ол бір ғажайып алаңқайға тап болады. Ондағы ағаштар ән салып, гүлдер билеп жүр екен. Бір ақ қоян секіріп келіп: "Қош келдің, сиқырлы орманға!" - депті.',
    coverEmoji: '🌳',
    createdAt: Date.now(),
  }
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
      // Update
      const index = stories.findIndex(s => s.id === story.id);
      if (index !== -1) {
        const updatedStory = { ...stories[index], ...story } as Story;
        stories[index] = updatedStory;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
        return updatedStory;
      }
    }
    
    // Create
    const newStory: Story = {
      ...story,
      id: uuidv4(),
      createdAt: Date.now(),
    } as Story;
    
    stories.unshift(newStory); // Add to beginning
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
    const updatedStory = {
      ...story,
      voiceRecordings: [...recordings, base64Audio]
    };
    
    return storage.saveStory(updatedStory);
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
