import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDemoApiKeys() {
  return useQuery({
    queryKey: ["demo_api_keys"],
    queryFn: async () => {
      const { data, error } = await supabase.from("demo_api_keys").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddDemoApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (key: { api_key: string; label?: string }) => {
      const { error } = await supabase.from("demo_api_keys").insert(key);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["demo_api_keys"] }),
  });
}

export function useToggleDemoApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("demo_api_keys").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["demo_api_keys"] }),
  });
}

export function useDeleteDemoApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("demo_api_keys").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["demo_api_keys"] }),
  });
}
