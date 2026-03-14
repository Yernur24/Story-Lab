import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storage, Story } from "@/lib/storage";

// React Query hooks for local storage simulation

const KEYS = {
  all: ['stories'] as const,
  detail: (id: string) => ['stories', id] as const,
};

export function useStories() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: async () => {
      // Simulate network delay for UI realism
      await new Promise(r => setTimeout(r, 300));
      return storage.getStories();
    },
  });
}

export function useStory(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 200));
      const story = storage.getStory(id);
      if (!story) throw new Error("Ертегі табылмады (Story not found)");
      return story;
    },
    enabled: !!id,
  });
}

export function useSaveStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (story: Partial<Story>) => {
      await new Promise(r => setTimeout(r, 400));
      return storage.saveStory(story as Omit<Story, 'id' | 'createdAt'>);
    },
    onSuccess: (savedStory) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: KEYS.detail(savedStory.id) });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(r => setTimeout(r, 300));
      storage.deleteStory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useAddVoiceRecording() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, audioStr }: { id: string, audioStr: string }) => {
      await new Promise(r => setTimeout(r, 200));
      return storage.addVoiceRecording(id, audioStr);
    },
    onSuccess: (savedStory) => {
      if (savedStory) {
        queryClient.invalidateQueries({ queryKey: KEYS.detail(savedStory.id) });
      }
    },
  });
}
