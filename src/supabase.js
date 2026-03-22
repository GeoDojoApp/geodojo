import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://keqzwockepletagolccf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcXp3b2NrZXBsZXRhZ29sY2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjk2MDMsImV4cCI6MjA4OTc0NTYwM30.ilRCtqOEW9afSnjGh1F_uDIqMMxCSFywLoYZ3mJF8iI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── PROFILE ──
export const getProfile = async (id) => {
  const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
  return data;
};

export const createProfile = async (username, country = "Unknown") => {
  const { data, error } = await supabase
    .from("profiles")
    .insert({ username, country })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (id, updates) => {
  const { data } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return data;
};

// ── SCORES (session results) ──
export const submitScore = async (profileId, pts, correct, total, mode, streak, belt) => {
  // Insert score
  const { data, error } = await supabase
    .from("scores")
    .insert({ profile_id: profileId, pts, correct, total, mode, streak, belt })
    .select()
    .single();
  if (error) throw error;

  // Update profile totals
  const profile = await getProfile(profileId);
  if (profile) {
    await updateProfile(profileId, {
      total_pts: (profile.total_pts || 0) + pts,
      belt,
      best_streak: Math.max(profile.best_streak || 0, streak),
    });
  }
  return data;
};

// ── LEADERBOARD ──
export const getLeaderboard = async (limit = 50) => {
  const { data } = await supabase
    .from("leaderboard")
    .select("*")
    .limit(limit);
  return data || [];
};

export const getCountryLeaderboard = async (country, limit = 50) => {
  const { data } = await supabase
    .from("profiles")
    .select("id, username, country, belt, total_pts, mastered, best_streak")
    .eq("country", country)
    .order("total_pts", { ascending: false })
    .limit(limit);
  return data || [];
};

// ── REALTIME SUBSCRIPTION ──
export const subscribeToScores = (callback) => {
  return supabase
    .channel("public:scores")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "scores" }, callback)
    .subscribe();
};

// ── CHALLENGES ──
export const createChallenge = async (creatorId, questions, mode = "flags") => {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data, error } = await supabase
    .from("challenges")
    .insert({ creator_id: creatorId, code, questions, mode })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getChallenge = async (code) => {
  const { data } = await supabase
    .from("challenges")
    .select("*, challenge_results(*, profiles(username, belt))")
    .eq("code", code.toUpperCase())
    .single();
  return data;
};

export const submitChallengeResult = async (challengeId, profileId, pts, correct, total) => {
  const { data, error } = await supabase
    .from("challenge_results")
    .insert({ challenge_id: challengeId, profile_id: profileId, pts, correct, total })
    .select()
    .single();
  if (error) throw error;
  return data;
};