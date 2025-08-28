// src/lib/profileService.ts
import { supabase } from "../supabaseClient";

export async function getProfiles() {
  return await supabase.from("profiles").select("*");
}

export async function getProfileById(id: string) {
  return await supabase.from("profiles").select("*").eq("id", id).single();
}

export async function updateProfile(id: string, fields: Partial<any>) {
  return await supabase.from("profiles").update(fields).eq("id", id);
}
