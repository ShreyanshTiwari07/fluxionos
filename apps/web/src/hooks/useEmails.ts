"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface Email {
  id: string;
  to: string[];
  cc: string[] | null;
  subject: string;
  body: string;
  scheduled_at: string;
  sent_at: string | null;
  status: string;
  gmail_message_id: string | null;
  gmail_thread_id: string | null;
  error_message: string | null;
  created_at: string;
  follow_up: {
    id: string;
    delay_hours: number;
    status: string;
    check_at: string | null;
  } | null;
}

interface EmailStats {
  scheduled: number;
  sent: number;
  failed: number;
  remaining_quota: number;
}

interface ListResponse {
  success: boolean;
  data: Email[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface ScheduleInput {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  scheduled_at: string;
  follow_up?: {
    delay_hours: number;
    follow_up_body: string;
  };
}

export function useEmails(options?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ["emails", options],
    queryFn: () => {
      const params = new URLSearchParams();
      if (options?.status) params.set("status", options.status);
      if (options?.page) params.set("page", options.page.toString());
      return apiFetch<ListResponse>(`/api/emails?${params}`);
    },
    refetchInterval: 30000,
  });
}

export function useEmailStats() {
  return useQuery({
    queryKey: ["email-stats"],
    queryFn: () => apiFetch<{ success: boolean; data: EmailStats }>("/api/emails/stats"),
  });
}

export function useScheduleEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ScheduleInput) =>
      apiFetch("/api/emails/schedule", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
    },
  });
}

export function useCancelEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailId: string) =>
      apiFetch(`/api/emails/${emailId}/cancel`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
    },
  });
}
