import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { BigPlan, SchoolContext, BigPlanTheme } from "@/lib/bigPlanConstants";

export function useBigPlans() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["big-plans", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("big_plans")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        school_context: d.school_context as unknown as SchoolContext,
        themes: d.themes as unknown as BigPlanTheme[],
      })) as BigPlan[];
    },
    enabled: !!user,
  });
}

export function useBigPlan(id: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["big-plan", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("big_plans")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return {
        ...data,
        school_context: data.school_context as unknown as SchoolContext,
        themes: data.themes as unknown as BigPlanTheme[],
      } as BigPlan;
    },
    enabled: !!user && !!id,
  });
}

export function useSaveBigPlan() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: { id?: string; name: string; school_context: SchoolContext; themes: BigPlanTheme[] }) => {
      if (plan.id) {
        const { error } = await supabase
          .from("big_plans")
          .update({
            name: plan.name,
            school_context: plan.school_context as any,
            themes: plan.themes as any,
            updated_at: new Date().toISOString(),
          })
          .eq("id", plan.id);
        if (error) throw error;
        return plan.id;
      } else {
        const { data, error } = await supabase
          .from("big_plans")
          .insert({
            user_id: user!.id,
            name: plan.name,
            school_context: plan.school_context as any,
            themes: plan.themes as any,
          })
          .select("id")
          .single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["big-plans"] });
      qc.invalidateQueries({ queryKey: ["big-plan"] });
    },
  });
}

export function useDeleteBigPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("big_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["big-plans"] });
    },
  });
}
