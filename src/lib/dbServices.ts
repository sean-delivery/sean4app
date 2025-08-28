// src/lib/dbServices.ts
import { supabase } from "../supabaseClient"

/* ===================== LEADS ===================== */
export async function getLeads(limit: number = 50) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getLeadById(id: string) {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

export async function addLead(lead: any) {
  const { data, error } = await supabase.from("leads").insert([lead]).select()
  if (error) throw error
  return data
}

export async function updateLead(id: string, fields: Partial<any>) {
  const { data, error } = await supabase.from("leads").update(fields).eq("id", id).select()
  if (error) throw error
  return data
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from("leads").delete().eq("id", id)
  if (error) throw error
  return true
}

/* ===================== SEARCHES ===================== */
export async function getSearches(limit: number = 50) {
  const { data, error } = await supabase
    .from("searches")
    .select("*")
    .order("executed_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getSearchById(id: string) {
  const { data, error } = await supabase.from("searches").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

export async function addSearch(term: string, location: string, source: string, total_results: number) {
  const { data, error } = await supabase.from("searches").insert([
    { term, location, source, total_results, executed_at: new Date().toISOString() },
  ]).select()
  if (error) throw error
  return data
}

export async function updateSearch(id: string, fields: Partial<any>) {
  const { data, error } = await supabase
    .from("searches")
    .update({ ...fields, executed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
  if (error) throw error
  return data
}

export async function deleteSearch(id: string) {
  const { error } = await supabase.from("searches").delete().eq("id", id)
  if (error) throw error
  return true
}

/* ===================== SEARCH_RESULTS ===================== */
export async function getResultsBySearchId(searchId: string) {
  const { data, error } = await supabase
    .from("search_results")
    .select("*")
    .eq("search_id", searchId)
    .order("inserted_at", { ascending: false })
  if (error) throw error
  return data
}

export async function addSearchResults(searchId: string, results: any[]) {
  const mapped = results.map(r => ({
    search_id: searchId,
    lead_id: r.lead_id,
    rank: r.rank || null,
    inserted_at: new Date().toISOString(),
  }))
  const { data, error } = await supabase.from("search_results").insert(mapped).select()
  if (error) throw error
  return data
}

export async function deleteResultsBySearchId(searchId: string) {
  const { error } = await supabase.from("search_results").delete().eq("search_id", searchId)
  if (error) throw error
  return true
}

/* ===================== USER_PLANS ===================== */
export async function getUserPlans(userId: string) {
  const { data, error } = await supabase.from("user_plans").select("*").eq("user_id", userId)
  if (error) throw error
  return data
}

export async function addUserPlan(userId: string, plan: string, leads_limit: number) {
  const { data, error } = await supabase.from("user_plans").insert([
    { user_id: userId, plan, leads_limit, leads_used: 0, cycle_start: new Date().toISOString() },
  ]).select()
  if (error) throw error
  return data
}

export async function updateUserPlan(id: string, fields: Partial<any>) {
  const { data, error } = await supabase.from("user_plans").update(fields).eq("id", id).select()
  if (error) throw error
  return data
}

export async function deleteUserPlan(id: string) {
  const { error } = await supabase.from("user_plans").delete().eq("id", id)
  if (error) throw error
  return true
}

/* ===================== PROFILES ===================== */
export async function getProfile(id: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

export async function updateProfile(id: string, fields: Partial<any>) {
  const { data, error } = await supabase.from("profiles").update(fields).eq("id", id).select()
  if (error) throw error
  return data
}

/* ===================== INVITES ===================== */
export async function getInvites() {
  const { data, error } = await supabase.from("invites").select("*")
  if (error) throw error
  return data
}

export async function addInvite(inviter_id: string, invitee_email: string, role: string) {
  const { data, error } = await supabase.from("invites").insert([
    { inviter_id, invitee_email, role, created_at: new Date().toISOString(), used: false },
  ]).select()
  if (error) throw error
  return data
}

/* ===================== COLLABORATORS ===================== */
export async function getCollaborators(project_id: string) {
  const { data, error } = await supabase.from("collaborators").select("*").eq("project_id", project_id)
  if (error) throw error
  return data
}

export async function addCollaborator(project_id: string, user_id: string, role: string) {
  const { data, error } = await supabase.from("collaborators").insert([
    { project_id, user_id, role, created_at: new Date().toISOString() },
  ]).select()
  if (error) throw error
  return data
}

/* ===================== CHAT_MESSAGES ===================== */
export async function getMessages(limit: number = 50) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function addMessage(role: string, content: string) {
  const { data, error } = await supabase.from("chat_messages").insert([
    { role, content, created_at: new Date().toISOString() },
  ]).select()
  if (error) throw error
  return data
}
