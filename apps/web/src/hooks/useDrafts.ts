"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface Draft {
  id: string;
  to: string[] | null;
  subject: string | null;
  body: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

interface ListResponse {
  success: boolean;
  data: Draft[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface CreateDraftInput {
  to?: string[];
  subject?: string;
  body?: string;
  category?: string;
}

interface ScheduleDraftInput {
  scheduled_at: string;
  follow_up?: {
    delay_hours: number;
    follow_up_body: string;
  };
}

export function useDrafts(options?: { category?: string; page?: number }) {
  return useQuery({
    queryKey: ["drafts", options],
    queryFn: () => {
      const params = new URLSearchParams();
      if (options?.category) params.set("category", options.category);
      if (options?.page) params.set("page", options.page.toString());
      return apiFetch<ListResponse>(`/api/drafts?${params}`);
    },
  });
}

export function useCreateDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDraftInput) =>
      apiFetch("/api/drafts", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drafts"] }),
  });
}

export function useUpdateDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: CreateDraftInput & { id: string }) =>
      apiFetch(`/api/drafts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drafts"] }),
  });
}

export function useDeleteDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/drafts/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drafts"] }),
  });
}

export function useScheduleDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: ScheduleDraftInput & { id: string }) =>
      apiFetch(`/api/drafts/${id}/schedule`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
    },
  });
}
