"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TimerStatus } from "@/types";
import { saveTimerState, loadTimerState, clearTimerState } from "@/lib/timerStorage";
import { playAlarmLoop, stopAlarm, sendNotification, requestNotificationPermission } from "@/lib/alarmSound";

const RESCUE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

interface UseSessionTimerOptions {
  sessionId: string;
  /** Full planned duration for this focus block, in milliseconds. */
  durationMs: number;
  taskTitle: string;
  /** Called when the session is fully complete (alarm dismissed or manually finished). */
  onComplete: () => void;
}

interface UseSessionTimerReturn {
  remainingMs: number;
  status: TimerStatus;
  /** Formatted as "MM:SS" */
  displayTime: string;
  start: () => void;
  startRescue: () => void;
  pause: () => void;
  resume: () => void;
  /** User manually ends the session early. */
  finish: () => void;
  /** After rescue alarm: continue with the full planned session. */
  continueAfterRescue: () => void;
  /** After rescue alarm: stop here, advance to next plan item. */
  stopAfterRescue: () => void;
  /** Dismiss the focus-session-end alarm and move on. */
  dismissAlarm: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function useSessionTimer({
  sessionId,
  durationMs,
  taskTitle,
  onComplete,
}: UseSessionTimerOptions): UseSessionTimerReturn {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remainingMs, setRemainingMs] = useState<number>(durationMs);
  // Absolute timestamp (ms) at which the timer will/would reach zero
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep onComplete stable without causing re-renders
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // ── Restore timer from localStorage on mount ─────────────────────────────
  useEffect(() => {
    const stored = loadTimerState();
    if (!stored || stored.sessionId !== sessionId) return;

    if (stored.status === "running") {
      const remaining = stored.endTimestamp - Date.now();
      if (remaining > 0) {
        // eslint-disable-next-line
        setEndTimestamp(stored.endTimestamp);
        // eslint-disable-next-line
        setRemainingMs(remaining);
        // eslint-disable-next-line
        setStatus(stored.isRescueMode ? "rescue_running" : "running");
      } else {
        // Timer expired while tab was closed — show alarm immediately
        setRemainingMs(0);
        setStatus(stored.isRescueMode ? "rescue_alarm" : "alarm");
        clearTimerState();
        playAlarmLoop();
      }
    } else if (stored.status === "paused" && stored.pausedRemaining !== undefined) {
      setRemainingMs(stored.pausedRemaining);
      setStatus(stored.isRescueMode ? "rescue_paused" : "paused");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  // ── Tick interval — accuracy comes from endTimestamp, not decrement ───────
  useEffect(() => {
    const isRunning = status === "running" || status === "rescue_running";

    if (isRunning && endTimestamp !== null) {
      intervalRef.current = setInterval(() => {
        const remaining = Math.max(0, endTimestamp - Date.now());
        setRemainingMs(remaining);

        if (remaining === 0) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          clearTimerState();
          playAlarmLoop();

          if (status === "rescue_running") {
            setStatus("rescue_alarm");
          } else {
            setStatus("alarm");
            sendNotification("ARUNA", `Waktu belajar "${taskTitle}" selesai. Saatnya istirahat.`);
          }
        }
      }, 200);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, endTimestamp]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const start = useCallback(() => {
    requestNotificationPermission();
    const end = Date.now() + durationMs;
    setEndTimestamp(end);
    setRemainingMs(durationMs);
    setStatus("running");
    saveTimerState({
      sessionId,
      status: "running",
      endTimestamp: end,
      isRescueMode: false,
      durationMs,
    });
  }, [durationMs, sessionId]);

  const startRescue = useCallback(() => {
    requestNotificationPermission();
    const end = Date.now() + RESCUE_DURATION_MS;
    setEndTimestamp(end);
    setRemainingMs(RESCUE_DURATION_MS);
    setStatus("rescue_running");
    saveTimerState({
      sessionId,
      status: "running",
      endTimestamp: end,
      isRescueMode: true,
      durationMs,
    });
  }, [durationMs, sessionId]);

  const pause = useCallback(() => {
    if (endTimestamp === null) return;
    const remaining = Math.max(0, endTimestamp - Date.now());
    const wasRescue = status === "rescue_running";
    setEndTimestamp(null);
    setRemainingMs(remaining);
    setStatus(wasRescue ? "rescue_paused" : "paused");
    saveTimerState({
      sessionId,
      status: "paused",
      endTimestamp: 0,
      pausedRemaining: remaining,
      isRescueMode: wasRescue,
      durationMs,
    });
  }, [endTimestamp, status, sessionId, durationMs]);

  const resume = useCallback(() => {
    const wasRescue = status === "rescue_paused";
    const end = Date.now() + remainingMs;
    setEndTimestamp(end);
    setStatus(wasRescue ? "rescue_running" : "running");
    saveTimerState({
      sessionId,
      status: "running",
      endTimestamp: end,
      isRescueMode: wasRescue,
      durationMs,
    });
  }, [remainingMs, status, sessionId, durationMs]);

  const finish = useCallback(() => {
    stopAlarm();
    clearTimerState();
    setEndTimestamp(null);
    setStatus("completed");
    onCompleteRef.current();
  }, []);

  const dismissAlarm = useCallback(() => {
    stopAlarm();
    clearTimerState();
    setStatus("completed");
    onCompleteRef.current();
  }, []);

  const continueAfterRescue = useCallback(() => {
    stopAlarm();
    // Give the user the full planned block duration to continue
    const end = Date.now() + durationMs;
    setEndTimestamp(end);
    setRemainingMs(durationMs);
    setStatus("running");
    saveTimerState({
      sessionId,
      status: "running",
      endTimestamp: end,
      isRescueMode: false,
      durationMs,
    });
  }, [durationMs, sessionId]);

  const stopAfterRescue = useCallback(() => {
    stopAlarm();
    clearTimerState();
    setStatus("completed");
    onCompleteRef.current();
  }, []);

  return {
    remainingMs,
    status,
    displayTime: formatTime(remainingMs),
    start,
    startRescue,
    pause,
    resume,
    finish,
    continueAfterRescue,
    stopAfterRescue,
    dismissAlarm,
  };
}
