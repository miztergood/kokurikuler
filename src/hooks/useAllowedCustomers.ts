import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAllowedCustomers(search: string = "") {
  return useQuery({
    queryKey: ["allowed_customers", search],
    queryFn: async () => {
      let q = supabase.from("allowed_customers").select("*").order("created_at", { ascending: false });
      if (search) {
        q = q.or(`email.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useAddAllowedCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (customer: { email: string; name: string; phone?: string; account_type?: string }) => {
      const { error } = await supabase.from("allowed_customers").insert(customer);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allowed_customers"] }),
  });
}

export function useAddBulkAllowedCustomers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (customers: { email: string; name: string; phone?: string; account_type?: string }[]) => {
      const { error } = await supabase.from("allowed_customers").upsert(customers, { onConflict: "email" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allowed_customers"] }),
  });
}

export function useDeleteAllowedCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("allowed_customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allowed_customers"] }),
  });
}
