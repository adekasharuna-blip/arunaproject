"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { playAlarmLoop, stopAlarm } from "@/lib/alarmSound";

interface BreakBlockProps {
  durationMs: number;
  /** Title of the next focus task, shown in the "break over" alarm. */
  nextTaskTitle?: string;
  /** Called when the break is fully dismissed and the next session should start. */
  onComplete: () => void;
}

type BreakStatus = "waiting" | "running" | "paused" | "alarm";

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function BreakBlock({ durationMs, nextTaskTitle, onComplete }: BreakBlockProps) {
  const [status, setStatus] = useState<BreakStatus>("waiting");
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Tick
  useEffect(() => {
    if ((status === "running") && endTimestamp !== null) {
      intervalRef.current = setInterval(() => {
        const remaining = Math.max(0, endTimestamp - Date.now());
        setRemainingMs(remaining);
        if (remaining === 0) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          playAlarmLoop();
          setStatus("alarm");
          setIsAlarmMuted(false);
        }
      }, 200);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, endTimestamp]);

  useEffect(() => {
    if (status === "alarm") {
      const t = setTimeout(() => {
        setIsAlarmMuted(true);
      }, 10000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const startBreak = useCallback(() => {
    const end = Date.now() + durationMs;
    setEndTimestamp(end);
    setRemainingMs(durationMs);
    setStatus("running");
  }, [durationMs]);

  const pauseBreak = useCallback(() => {
    if (endTimestamp === null) return;
    const remaining = Math.max(0, endTimestamp - Date.now());
    setEndTimestamp(null);
    setRemainingMs(remaining);
    setStatus("paused");
  }, [endTimestamp]);

  const resumeBreak = useCallback(() => {
    const end = Date.now() + remainingMs;
    setEndTimestamp(end);
    setStatus("running");
  }, [remainingMs]);

  const handleComplete = () => {
    stopAlarm();
    onCompleteRef.current();
  };

  if (status === "alarm") {
    return (
      <div className="p-5 rounded-2xl border border-stone-200/80 bg-white/70 shadow-sm space-y-4 animate-fade-in">
        <div className="space-y-1">
          <p className="text-xl font-medium text-foreground">Istirahat selesai.</p>
          <p className="text-foreground/70">Yuk, lanjut lagi.</p>
        </div>
        
        {!isAlarmMuted && (
          <div className="pt-2">
            <button
              onClick={() => { stopAlarm(); setIsAlarmMuted(true); }}
              aria-label="Matikan alarm"
              className="px-6 py-3 rounded-full border border-stone-300 bg-white text-foreground text-sm font-medium hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Matikan alarm
            </button>
          </div>
        )}

        {nextTaskTitle ? (
          <div className="space-y-1 mt-6">
            <p className="text-sm text-foreground/60 uppercase tracking-wider font-medium">Selanjutnya:</p>
            <p className="text-lg text-foreground font-medium">{nextTaskTitle}</p>
          </div>
        ) : (
          <p className="text-foreground/70 mt-6">Kamu sudah selesai untuk malam ini.</p>
        )}
        
        <div className="pt-2">
          <button
            onClick={handleComplete}
            aria-label={nextTaskTitle ? `Mulai sesi ${nextTaskTitle}` : "Selesai"}
            className="px-6 py-3 rounded-full bg-foreground text-background font-medium text-sm hover:bg-stone-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {nextTaskTitle ? "Mulai" : "Selesai"}
          </button>
        </div>
      </div>
    );
  }

  if (status === "waiting") {
    return (
      <div className="p-5 rounded-2xl border border-stone-200/60 bg-stone-50/60 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-stone-300 shrink-0" aria-hidden="true" />
          <p className="text-lg text-foreground/70 font-medium">Istirahat</p>
        </div>
        <p className="text-sm text-foreground/50">{formatTime(durationMs)} menit untuk istirahat</p>
        <button
          onClick={startBreak}
          aria-label="Mulai istirahat"
          className="px-6 py-3 rounded-full bg-foreground text-background font-medium text-sm hover:bg-stone-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          Mulai istirahat
        </button>
      </div>
    );
  }

  // running or paused
  return (
    <div className="p-5 rounded-2xl border border-stone-200/80 bg-white/60 shadow-sm space-y-4">
      <div className="flex items-center space-x-3">
        <span className="w-2 h-2 rounded-full bg-stone-300 shrink-0" aria-hidden="true" />
        <p className="text-lg text-foreground/70 font-medium">Istirahat</p>
      </div>

      <p
        className="text-4xl font-medium tracking-tight text-foreground/80 tabular-nums"
        aria-live="polite"
        aria-label={`Sisa waktu istirahat: ${formatTime(remainingMs)}`}
      >
        {formatTime(remainingMs)}
      </p>

      {status === "paused" && (
        <p className="text-sm text-foreground/50 italic">Dijeda</p>
      )}

      <div className="flex gap-3">
        {status === "running" ? (
          <button
            onClick={pauseBreak}
            aria-label="Jeda istirahat"
            className="px-5 py-2.5 rounded-full border border-stone-300 bg-white text-foreground text-sm font-medium hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Jeda
          </button>
        ) : (
          <button
            onClick={resumeBreak}
            aria-label="Lanjutkan istirahat"
            className="px-5 py-2.5 rounded-full border border-stone-300 bg-white text-foreground text-sm font-medium hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Lanjutkan
          </button>
        )}
      </div>
    </div>
  );
}
