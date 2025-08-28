// src/lib/planService.ts
import { supabase } from "../supabaseClient";

export async function getUserPlans() {
  return await supabase.from("user_plans").select("*");
}

export async function addUserPlan(plan: any) {
  return await supabase.from("user_plans").insert([plan]);
}

export async function updateUserPlan(id: string, fields: Partial<any>) {
  return await supabase.from("user_plans").update(fields).eq("id", id);
}

export async function deleteUserPlan(id: string) {
  return await supabase.from("user_plans").delete().eq("id", id);
}
