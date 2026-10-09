import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export interface TeacherProfile {
  id: string;
  name: string;
  data: Record<string, string | string[]>;
}

const QUERY_KEY = "teacher-profiles";

export function useTeacherProfiles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_profiles")
        .select("id, name, data")
        .eq("user_id", user!.id)
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((d) => ({
        id: d.id,
        name: d.name,
        data: d.data as unknown as Record<string, string | string[]>,
      })) as TeacherProfile[];
    },
  });
}

export function useSaveTeacherProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, data }: { name: string; data: Record<string, string | string[]> }) => {
      if (!user) throw new Error("Not authenticated");
      const jsonData = JSON.parse(JSON.stringify(data)) as Json;
      // Check if profile with this name exists
      const { data: existing } = await supabase
        .from("teacher_profiles")
        .select("id")
        .eq("user_id", user.id)
        .ilike("name", name)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("teacher_profiles")
          .update({ data: jsonData, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("teacher_profiles")
          .insert({ user_id: user.id, name, data: jsonData });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY, user?.id] }),
  });
}

export function useDeleteTeacherProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("teacher_profiles")
        .delete()
        .eq("user_id", user.id)
        .eq("name", name);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY, user?.id] }),
  });
}

export function useMigrateLocalProfiles() {
  const saveMutation = useSaveTeacherProfile();
  return useMutation({
    mutationFn: async () => {
      const raw = localStorage.getItem("perangkat_ajar_profiles");
      if (!raw) return;
      const profiles = JSON.parse(raw) as Record<string, Record<string, string | string[]>>;
      for (const [name, data] of Object.entries(profiles)) {
        await saveMutation.mutateAsync({ name, data });
      }
      localStorage.removeItem("perangkat_ajar_profiles");
    },
  });
}
