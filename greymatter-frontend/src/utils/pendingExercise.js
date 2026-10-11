import { api } from "./api";

const KEY = "pendingExercise";
const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export function storePendingExercise(payload) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("Failed to store pending exercise:", e);
  }
}

export function getPendingExercise() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - (data.stored_at || 0) > MAX_AGE_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearPendingExercise() {
  sessionStorage.removeItem(KEY);
}

export async function flushPendingExercise() {
  const pending = getPendingExercise();
  if (!pending) return null;

  try {
    const response = await api.batch.submitExercise(
      pending.exercise_id,
      pending.answers,
      pending.time_taken_seconds,
      pending.notes || "No notes taken.",
      pending.breakdown || []
    );
    const data = await response.json();
    if (response.ok && data.success) {
      clearPendingExercise();
      return { saved: true, exercise_id: pending.exercise_id };
    }
    return { saved: false, reason: data.error || "Save failed" };
  } catch (e) {
    return { saved: false, reason: e.message };
  }
}