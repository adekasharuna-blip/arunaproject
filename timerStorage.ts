/**
 * Minimal localStorage persistence for ARUNA timer state.
 * Allows the timer to survive accidental browser refreshes.
 */

const STORAGE_KEY = "aruna_timer_v1";

export interface StoredTimerState {
  /** Matches a DailyPlanItem.id to restore the right session. */
  sessionId: string;
  /** Whether the timer was running or paused when stored. */
  status: "running" | "paused";
  /**
   * For running timers: the absolute timestamp (ms) when the timer will reach zero.
   * Computed as Date.now() + remainingMs at the moment of storage.
   */
  endTimestamp: number;
  /** For paused timers: milliseconds remaining at the time of pause. */
  pausedRemaining?: number;
  /** True when Rescue Mode (10-min session) was active. */
  isRescueMode: boolean;
  /** Full planned duration in ms — needed to restore "continue after rescue". */
  durationMs: number;
}

export function saveTimerState(state: StoredTimerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable — ignore
  }
}

export function loadTimerState(): StoredTimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredTimerState;
  } catch {
    return null;
  }
}

export function clearTimerState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
