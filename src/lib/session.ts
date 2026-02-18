import { supabase } from "@/integrations/supabase/client";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createSession(): Promise<{ id: string; code: string }> {
  const code = generateCode();
  const { data, error } = await supabase
    .from("sessions")
    .insert({ code })
    .select()
    .single();

  if (error) throw error;
  return { id: data.id, code: data.code };
}

export async function joinSession(code: string): Promise<{ id: string; code: string } | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select()
    .eq("code", code.toUpperCase().trim())
    .single();

  if (error) return null;
  return { id: data.id, code: data.code };
}

export async function submitVote(
  sessionId: string,
  showId: string,
  player: 1 | 2,
  liked: boolean,
  voteType: "liked" | "skipped" | "not_tonight" = liked ? "liked" : "skipped"
) {
  const { error } = await supabase
    .from("votes")
    .insert({ session_id: sessionId, show_id: showId, player, liked, vote_type: voteType });

  if (error) throw error;
}

export async function getVotes(sessionId: string) {
  const { data, error } = await supabase
    .from("votes")
    .select()
    .eq("session_id", sessionId);

  if (error) throw error;
  return data || [];
}

export function getShareUrl(code: string): string {
  return `${window.location.origin}/join/${code}`;
}

export function getWhatsAppShareUrl(code: string): string {
  const url = getShareUrl(code);
  const message = `🎬 Let's pick a show together! Join my WatchWhat? session:\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

// --- Local session persistence ---

const STORAGE_KEY = "watchtogether_session";

interface StoredSession {
  id: string;
  code: string;
  player: 1 | 2;
  leadCaptured: boolean;
}

export function saveLocalSession(session: StoredSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadLocalSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearLocalSession() {
  localStorage.removeItem(STORAGE_KEY);
}
