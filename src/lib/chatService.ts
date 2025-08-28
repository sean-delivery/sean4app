// src/lib/chatService.ts
import { supabase } from "../supabaseClient";

export async function getMessages(limit: number = 50) {
  return await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function sendMessage(msg: any) {
  return await supabase.from("chat_messages").insert([msg]);
}

export async function deleteMessage(id: string) {
  return await supabase.from("chat_messages").delete().eq("id", id);
}
