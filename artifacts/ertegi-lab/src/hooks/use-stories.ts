import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, Story } from "@/lib/api-client";

export type { Story };

const KEYS = {
  all: ['stories'] as const,
  detail: (id: string) => ['stories', id] as const,
};

export function useStories() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => apiClient.getStories(),
    staleTime: 0,
  });
}

export function useStory(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => apiClient.getStory(id),
    enabled: !!id,
  });
}

export function useSaveStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (story: Partial<Story>) => {
      if (story.id) {
        return apiClient.updateStory(story.id, story);
      } else {
        return apiClient.createStory(story as Omit<Story, 'id' | 'createdAt' | 'isFavorite' | 'readCount'>);
      }
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
    mutationFn: (id: string) => apiClient.deleteStory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useAddVoiceRecording() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, audioStr }: { id: string; audioStr: string }) =>
      apiClient.addVoiceRecording(id, audioStr),
    onSuccess: (savedStory) => {
      if (savedStory) {
        queryClient.invalidateQueries({ queryKey: KEYS.detail(savedStory.id) });
        queryClient.invalidateQueries({ queryKey: KEYS.all });
      }
    },
  });
}

export function useDeleteVoiceRecording() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, index }: { id: string; index: number }) =>
      apiClient.deleteVoiceRecording(id, index),
    onSuccess: (savedStory) => {
      if (savedStory) {
        queryClient.invalidateQueries({ queryKey: KEYS.detail(savedStory.id) });
        queryClient.invalidateQueries({ queryKey: KEYS.all });
      }
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.toggleFavorite(id),
    onSuccess: (savedStory) => {
      if (savedStory) {
        queryClient.invalidateQueries({ queryKey: KEYS.all });
        queryClient.invalidateQueries({ queryKey: KEYS.detail(savedStory.id) });
      }
    },
  });
}

export function useIncrementReadCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.incrementReadCount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useRateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      apiClient.rateStory(id, rating),
    onSuccess: (savedStory) => {
      if (savedStory) {
        queryClient.invalidateQueries({ queryKey: KEYS.all });
        queryClient.invalidateQueries({ queryKey: KEYS.detail(savedStory.id) });
      }
    },
  });
}
