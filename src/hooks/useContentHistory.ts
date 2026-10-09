import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { FormData, GeneratedContent } from "@/lib/constants";
import type { Json } from "@/integrations/supabase/types";

export interface ContentHistoryItem {
  id: string;
  user_id: string;
  name: string;
  form_data: FormData;
  modul_data: GeneratedContent | null;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = "content-history";

export function useContentHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((d) => ({
        id: d.id,
        user_id: d.user_id,
        name: d.name,
        form_data: d.form_data as unknown as FormData,
        modul_data: d.modul_data as unknown as GeneratedContent | null,
        created_at: d.created_at,
        updated_at: d.updated_at,
      })) as ContentHistoryItem[];
    },
  });
}

export function useSaveContentHistory() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      form_data: FormData;
      modul_data: GeneratedContent | null;
    }) => {
      if (!user) throw new Error("Not authenticated");
      // Check count
      const { count } = await supabase
        .from("content_history")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (count && count >= 50) {
        // Delete oldest
        const { data: oldest } = await supabase
          .from("content_history")
          .select("id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .single();
        if (oldest) {
          await supabase.from("content_history").delete().eq("id", oldest.id);
        }
      }

      const { error } = await supabase.from("content_history").insert({
        user_id: user.id,
        name: params.name,
        form_data: JSON.parse(JSON.stringify(params.form_data)) as Json,
        modul_data: params.modul_data ? (JSON.parse(JSON.stringify(params.modul_data)) as Json) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY, user?.id] }),
  });
}

export function useDeleteContentHistory() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("content_history")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY, user?.id] }),
  });
}
