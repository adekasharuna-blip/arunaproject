"use client";

import React from "react";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { stopAlarm } from "@/lib/alarmSound";

interface SessionTimerBlockProps {
  sessionId: string;
  taskTitle: string;
  startTime: Date;
  endTime: Date;
  /** Whether this session is the currently active one (others are dimmed). */
  isActive: boolean;
  /** Whether this session has been completed by a previous action. */
  isCompleted: boolean;
  onComplete: () => void;
}

function formatClock(d: Date): string {
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(":", ".");
}

export default function SessionTimerBlock({
  sessionId,
  taskTitle,
  startTime,
  endTime,
  isActive,
  isCompleted,
  onComplete,
}: SessionTimerBlockProps) {
  const durationMs = endTime.getTime() - startTime.getTime();

  const {
    status,
    displayTime,
    start,
    startRescue,
    pause,
    resume,
    finish,
    continueAfterRescue,
    stopAfterRescue,
    dismissAlarm,
  } = useSessionTimer({ sessionId, durationMs, taskTitle, onComplete });

  const [showConfirmFinish, setShowConfirmFinish] = React.useState(false);

  const handleFinishClick = () => setShowConfirmFinish(true);
  const cancelFinish = () => setShowConfirmFinish(false);
  const confirmFinish = () => {
    setShowConfirmFinish(false);
    finish();
  };

  const [isAlarmMuted, setIsAlarmMuted] = React.useState(false);

  React.useEffect(() => {
    if (status === "alarm" || status === "rescue_alarm") {
      setIsAlarmMuted(false);
      // Auto-hide the Matikan alarm button after 10 seconds since the audio naturally stops then.
      const t = setTimeout(() => {
        setIsAlarmMuted(true);
      }, 10000);
      return () => clearTimeout(t);
    }
  }, [status]);

  // ── Completed (by any path) ───────────────────────────────────────────────
  if (isCompleted || status === "completed") {
    return (
      <div className="p-5 rounded-2xl border border-stone-100 bg-stone-50/40 shadow-none opacity-60 flex items-center space-x-3">
        <span className="text-primary/70 text-lg" aria-hidden="true">✓</span>
        <div>
          <p className="text-sm text-foreground/50 font-medium">
            {formatClock(startTime)}–{formatClock(endTime)}
          </p>
          <p className="text-base font-medium text-foreground/60 line-through">{taskTitle}</p>
        </div>
      </div>
    );
  }

  // ── Future session (not yet active) ──────────────────────────────────────
  if (!isActive) {
    return (
      <div className="p-5 rounded-2xl border border-stone-200/50 bg-white/30 shadow-none opacity-50">
        <p className="text-sm text-foreground/50 font-medium mb-1">
          {formatClock(startTime)}–{formatClock(endTime)}
        </p>
        <p className="text-base font-medium text-foreground/60">{taskTitle}</p>
      </div>
    );
  }

  // ── ALARM — focus session just ended naturally ────────────────────────────
  if (status === "alarm") {
    return (
      <div className="p-5 rounded-2xl border border-primary/20 bg-white/80 shadow-sm space-y-4 animate-fade-in">
        <div className="flex items-center space-x-2">
          <span className="text-xl" aria-hidden="true">🔔</span>
          <p className="text-xl font-medium text-foreground">Waktu belajar selesai.</p>
        </div>
        <p className="text-foreground/70">Saatnya istirahat.</p>
        
        <div className="flex gap-3 flex-wrap mt-4">
          {!isAlarmMuted && (
            <button
              onClick={() => { stopAlarm(); setIsAlarmMuted(true); }}
              aria-label="Matikan alarm"
              className="px-6 py-3 rounded-full border border-stone-300 bg-white text-foreground text-sm font-medium hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Matikan alarm
            </button>
          )}
          <button
            onClick={dismissAlarm}
            aria-label="Mulai istirahat sekarang"
            className="px-6 py-3 rounded-full bg-foreground text-background font-medium text-sm hover:bg-stone-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Mulai istirahat
          </button>
        </div>
      </div>
    );
  }

  // ── RESCUE ALARM — 10-minute rescue session ended ─────────────────────────
  if (status === "rescue_alarm") {
    return (
      <div className="p-5 rounded-2xl border border-primary/20 bg-white/80 shadow-sm space-y-5 animate-fade-in">
        <p className="text-xl font-medium text-foreground">10 menit selesai.</p>
        <p className="text-foreground/70 text-sm">
          Sudah cukup untuk memulai. Mau lanjut?
        </p>
        <div className="flex gap-3 flex-wrap">
          {!isAlarmMuted && (
            <button
              onClick={() => { stopAlarm(); setIsAlarmMuted(true); }}
              aria-label="Matikan alarm"
              className="px-6 py-3 rounded-full border border-stone-300 bg-white text-foreground text-sm font-medium hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Matikan alarm
            </button>
          )}
          <button
            onClick={continueAfterRescue}
            aria-label="Lanjutkan sesi penuh"
            className="px-6 py-3 rounded-full bg-foreground text-background font-medium text-sm hover:bg-stone-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Lanjutkan
          </button>
          <button
            onClick={stopAfterRescue}
            aria-label="Berhenti dulu"
            className="px-6 py-3 rounded-full border border-stone-300 bg-white text-foreground text-sm font-medium hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Berhenti dulu
          </button>
        </div>
      </div>
    );
  }

  // ── RESCUE RUNNING / RESCUE PAUSED ───────────────────────────────────────
  if (status === "rescue_running" || status === "rescue_paused") {
    return (
      <div className="p-5 rounded-2xl border border-primary/30 bg-white/80 shadow-sm space-y-4 animate-fade-in">
        <div>
          <p className="text-sm text-foreground/50 font-medium mb-1">
            {formatClock(startTime)}–{formatClock(endTime)}
          </p>
          <p className="text-lg font-medium text-foreground">{taskTitle}</p>
          <p className="text-xs text-foreground/40 italic mt-1">Mode 10 menit</p>
        </div>

        <p
          className="text-5xl font-medium tracking-tight text-foreground tabular-nums"
          aria-live="polite"
          aria-label={`Sisa waktu: ${displayTime}`}
        >
          {displayTime}
        </p>

        {status === "rescue_paused" && (
          <p className="text-sm text-foreground/50 italic" aria-live="polite">Dijeda</p>
        )}

        {showConfirmFinish ? (
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 mt-2 animate-fade-in">
            <p className="text-sm font-medium text-foreground mb-3">Selesaikan sesi ini?</p>
            <div className="flex gap-2">
              <button
                onClick={confirmFinish}
                className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:bg-stone-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Ya, selesai
              </button>
              <button
                onClick={cancelFinish}
                className="px-4 py-2 rounded-full border border-stone-300 bg-white text-foreground text-sm font-medium hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Kembali
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 flex-wrap mt-2">
            {status === "rescue_running" ? (
              <button
                onClick={pause}
                aria-label="Jeda sesi"
                className="px-5 py-2.5 rounded-full border border-stone-300 bg-white text-foreground text-sm font-medium hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Jeda
              </button>
            ) : (
              <button
                onClick={resume}
                aria-label="Lanjutkan sesi"
                className="px-5 py-2.5 rounded-full border border-stone-300 bg-white text-foreground text-sm font-medium hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Lanjutkan
              </button>
            )}
            <button
              onClick={handleFinishClick}
              aria-label="Selesaikan sesi ini"
              className="px-5 py-2.5 rounded-full border border-stone-300 bg-white text-foreground/70 text-sm hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── RUNNING / PAUSED ─────────────────────────────────────────────────────
  if (status === "running" || status === "paused") {
    return (
      <div className="p-5 rounded-2xl border border-primary/30 bg-white shadow-md space-y-4 animate-fade-in">
        <div>
          <p className="text-sm text-foreground/50 font-medium mb-1">
            {formatClock(startTime)}–{formatClock(endTime)}
          </p>
          <p className="text-xl font-medium text-foreground">{taskTitle}</p>
        </div>

        <p
          className="text-6xl font-medium tracking-tight text-foreground tabular-nums"
          aria-live="polite"
          aria-label={`Sisa waktu: ${displayTime}`}
        >
          {displayTime}
        </p>

        {status === "paused" && (
          <p className="text-sm text-foreground/50 italic" aria-live="polite">Dijeda</p>
        )}

        {showConfirmFinish ? (
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 mt-2 animate-fade-in">
            <p className="text-sm font-medium text-foreground mb-3">Selesaikan sesi ini?</p>
            <div className="flex gap-2">
              <button
                onClick={confirmFinish}
                className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:bg-stone-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Ya, selesai
              </button>
              <button
                onClick={cancelFinish}
                className="px-4 py-2 rounded-full border border-stone-300 bg-white text-foreground text-sm font-medium hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Kembali
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 flex-wrap mt-2">
            {status === "running" ? (
              <button
                onClick={pause}
                aria-label="Jeda sesi"
                className="px-5 py-2.5 rounded-full border border-stone-300 bg-white text-foreground text-sm font-medium hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Jeda
              </button>
            ) : (
              <button
                onClick={resume}
                aria-label="Lanjutkan sesi"
                className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-stone-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Lanjutkan
              </button>
            )}
            <button
              onClick={handleFinishClick}
              aria-label="Selesaikan sesi ini"
              className="px-5 py-2.5 rounded-full border border-stone-300 bg-white text-foreground/70 text-sm hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── IDLE — session not yet started ────────────────────────────────────────
  return (
    <div className="p-5 rounded-2xl border border-stone-200/80 bg-white/60 shadow-sm space-y-4 animate-fade-in">
      <div>
        <p className="text-sm text-foreground/50 font-medium mb-1">
          {formatClock(startTime)}–{formatClock(endTime)}
        </p>
        <p className="text-xl font-medium text-foreground">{taskTitle}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <button
          onClick={start}
          id={`start-session-${sessionId}`}
          aria-label={`Mulai sesi ${taskTitle}`}
          className="px-6 py-3 rounded-full bg-foreground text-background font-medium text-sm hover:bg-stone-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          Mulai
        </button>

        {/* Rescue Mode — visually secondary */}
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-foreground/40">Sulit mulai?</p>
          <button
            onClick={startRescue}
            id={`rescue-session-${sessionId}`}
            aria-label={`Coba 10 menit untuk ${taskTitle}`}
            className="text-sm text-foreground/50 underline underline-offset-2 hover:text-foreground/70 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
          >
            Coba 10 menit
          </button>
        </div>
      </div>
    </div>
  );
}
