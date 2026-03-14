export type StoryCategory = 'fairy-tale' | 'comic' | 'cartoon' | 'custom';

export interface Story {
  id: string;
  title: string;
  category: StoryCategory;
  description: string;
  content: string;
  coverEmoji: string;
  videoUrl?: string;
  videoFile?: string;
  quizEnabled: boolean;
  audioFile?: string;
  images: string[];
  voiceRecordings: string[];
  isFavorite: boolean;
  readCount: number;
  createdAt: number;
}

const BASE = '/api';

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const apiClient = {
  getStories: () => fetchJSON<Story[]>('/stories'),

  getStory: (id: string) => fetchJSON<Story>(`/stories/${id}`),

  createStory: (data: Omit<Story, 'id' | 'createdAt' | 'isFavorite' | 'readCount'>) =>
    fetchJSON<Story>('/stories', { method: 'POST', body: JSON.stringify(data) }),

  updateStory: (id: string, data: Partial<Story>) =>
    fetchJSON<Story>(`/stories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteStory: (id: string) =>
    fetchJSON<void>(`/stories/${id}`, { method: 'DELETE' }),

  toggleFavorite: (id: string) =>
    fetchJSON<Story>(`/stories/${id}/favorite`, { method: 'POST' }),

  incrementReadCount: (id: string) =>
    fetchJSON<Story>(`/stories/${id}/read`, { method: 'POST' }),

  addVoiceRecording: (id: string, audioBase64: string) =>
    fetchJSON<Story>(`/stories/${id}/voice-recordings`, {
      method: 'POST',
      body: JSON.stringify({ audioBase64 }),
    }),

  deleteVoiceRecording: (id: string, index: number) =>
    fetchJSON<Story>(`/stories/${id}/voice-recordings/${index}`, { method: 'DELETE' }),

  resetStories: () =>
    fetchJSON<{ success: boolean }>('/stories/reset', { method: 'POST' }),

  uploadVideo: (key: string, dataBase64: string) =>
    fetchJSON<{ key: string }>('/videos', { method: 'POST', body: JSON.stringify({ key, dataBase64 }) }),

  getVideoBase64: (key: string) =>
    fetchJSON<{ dataBase64: string }>(`/videos/${key}`),

  deleteVideo: (key: string) =>
    fetchJSON<void>(`/videos/${key}`, { method: 'DELETE' }),
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
