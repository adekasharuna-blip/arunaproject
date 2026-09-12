"use client";

import React, { useState } from "react";
import ArunaLogo from "./ArunaLogo";
import SessionTimerBlock from "./SessionTimerBlock";
import BreakBlock from "./BreakBlock";
import { DailyPlanItem, Task } from "@/types";

interface DailyPlanScreenProps {
  plan: DailyPlanItem[];
  unassignedTasks: Task[];
}

function formatClock(d: Date): string {
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(":", ".");
}

export default function DailyPlanScreen({ plan, unassignedTasks }: DailyPlanScreenProps) {
  /**
   * activeIndex tracks which plan item the user is currently on.
   * Items before activeIndex are considered completed.
   * The item at activeIndex is the active one.
   * Items after are pending.
   */
  const [activeIndex, setActiveIndex] = useState(0);

  const handleItemComplete = () => {
    setActiveIndex((prev) => prev + 1);
  };

  /**
   * For a break item at a given index, find the next focus task title
   * so BreakBlock can display "Selanjutnya: X".
   */
  const getNextTaskTitle = (afterIndex: number): string | undefined => {
    for (let i = afterIndex + 1; i < plan.length; i++) {
      if (plan[i].type === "focus" && plan[i].taskTitle) {
        return plan[i].taskTitle;
      }
    }
    return undefined;
  };

  const allDone = activeIndex >= plan.length;

  return (
    <div className="flex flex-col w-full max-w-[700px] mx-auto px-6 min-h-screen animate-fade-in pb-16">
      <ArunaLogo />

      <main className="flex-1 flex flex-col mt-4 sm:mt-10">
        {/* Header */}
        <div className="space-y-2 text-center sm:text-left mb-10">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            Malam ini
          </h2>
          <p className="text-foreground/70 text-lg">
            {allDone ? "Semua sesi selesai. Bagus sekali." : "Ini yang paling penting dulu."}
          </p>
        </div>

        {/* Plan items */}
        <div className="space-y-4">
          {plan.map((item, index) => {
            const isActive = index === activeIndex;
            const isCompleted = index < activeIndex;

            // ── Focus block ────────────────────────────────────────────────
            if (item.type === "focus") {
              return (
                <SessionTimerBlock
                  key={item.id}
                  sessionId={item.id}
                  taskTitle={item.taskTitle ?? "Fokus"}
                  startTime={item.startTime}
                  endTime={item.endTime}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  onComplete={handleItemComplete}
                />
              );
            }

            // ── Break block ────────────────────────────────────────────────
            if (item.type === "break") {
              const breakDurationMs = item.endTime.getTime() - item.startTime.getTime();

              if (isCompleted) {
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-stone-100 bg-stone-50/30 opacity-50 flex items-center space-x-3"
                  >
                    <span className="text-primary/60 text-base" aria-hidden="true">✓</span>
                    <div>
                      <p className="text-sm text-foreground/40 font-medium">
                        {formatClock(item.startTime)}–{formatClock(item.endTime)}
                      </p>
                      <p className="text-sm text-foreground/50 line-through">Istirahat</p>
                    </div>
                  </div>
                );
              }

              if (!isActive) {
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-stone-200/40 bg-white/20 opacity-40"
                  >
                    <p className="text-sm text-foreground/40 font-medium mb-0.5">
                      {formatClock(item.startTime)}–{formatClock(item.endTime)}
                    </p>
                    <p className="text-sm text-foreground/50">Istirahat</p>
                  </div>
                );
              }

              return (
                <BreakBlock
                  key={item.id}
                  durationMs={breakDurationMs}
                  nextTaskTitle={getNextTaskTitle(index)}
                  onComplete={handleItemComplete}
                />
              );
            }

            // ── Buffer block (free time at the end) ────────────────────────
            if (item.type === "buffer") {
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-stone-200/40 bg-stone-50/30 mt-2"
                >
                  <p className="text-sm text-foreground/40 font-medium mb-0.5">
                    {formatClock(item.startTime)}–{formatClock(item.endTime)}
                  </p>
                  <p className="text-sm text-foreground/60">Waktu bebas</p>
                </div>
              );
            }

            return null;
          })}

          {/* All done message */}
          {allDone && plan.length > 0 && (
            <div className="pt-8 text-center sm:text-left animate-fade-in">
              <p className="text-foreground/60 text-base">
                Kamu sudah menyelesaikan semua yang direncanakan. Istirahat yang cukup. 🌙
              </p>
            </div>
          )}
        </div>

        {/* Unassigned tasks — show at the bottom, always */}
        {unassignedTasks.length > 0 && (
          <div className="mt-16 border-t border-stone-200/60 pt-10">
            <h3 className="text-2xl font-medium tracking-tight text-foreground mb-6">Nanti</h3>
            <div className="space-y-3">
              {unassignedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white/40 p-4 rounded-xl border border-stone-200/50 flex items-center space-x-3 opacity-70"
                >
                  <span className="text-lg" aria-hidden="true">
                    📚
                  </span>
                  <p className="font-medium text-foreground">{task.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
