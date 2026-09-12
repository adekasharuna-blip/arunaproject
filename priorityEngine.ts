import { Task, DailyPlanItem, MentalStateId } from "@/types";

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

/**
 * Higher score = more urgent deadline.
 * Priority order: overdue/custom → besok → minggu_ini → minggu_depan → tidak_ada
 */
function getDeadlineScore(deadline?: string): number {
  switch (deadline) {
    case 'besok':        return 5;
    case 'minggu_ini':   return 4;
    case 'minggu_depan': return 3;
    case 'tidak_ada':    return 1;
    default:             return 5; // Custom / unknown dates treated as high priority
  }
}

/** Estimated workload in minutes for a given workload label. */
function getWorkloadMinutes(workload?: string): number {
  switch (workload) {
    case 'sedikit':    return 30;
    case 'sedang':     return 60;
    case 'banyak':     return 120;
    case 'belum_tahu': return 45;
    default:           return 45;
  }
}

/**
 * Maximum focus-block length driven by mental state.
 * This is an UPPER BOUND — it must never prevent scheduling when time is short.
 */
function getFocusBlockMaxMinutes(mentalState: MentalStateId | null): number {
  switch (mentalState) {
    case 'bersemangat':       return 60;
    case 'cukup_baik':        return 45;
    case 'biasa_saja':        return 40;
    case 'agak_lelah':        return 30;
    case 'benar_benar_lelah': return 25;
    default:                  return 45;
  }
}

/**
 * How long a break should be after a focus block.
 */
function getBreakMinutes(mentalState: MentalStateId | null): number {
  switch (mentalState) {
    case 'bersemangat':       return 10;
    case 'cukup_baik':        return 10;
    case 'biasa_saja':        return 15;
    case 'agak_lelah':        return 15;
    case 'benar_benar_lelah': return 20;
    default:                  return 10;
  }
}

/**
 * Minimum remaining time (minutes) needed AFTER a break before we bother
 * inserting one. A break is only useful if there is meaningful work after it.
 */
const MIN_REMAINING_AFTER_BREAK = 20;

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function generateDailyPlan(
  tasks: Task[],
  mentalState: MentalStateId | null,
  availableTimeStr: string
): { plan: DailyPlanItem[], unassignedTasks: Task[] } {

  // ── 1. Calculate available minutes ────────────────────────────────────────
  const now = new Date();

  let targetHour = 22;
  let targetMinute = 0;

  if (availableTimeStr === 'Tidak tentu') {
    targetHour   = now.getHours() + 2;
    targetMinute = now.getMinutes();
  } else {
    // Accept "HH:MM" or "HH.MM"
    const match = availableTimeStr.match(/(\d{1,2})[:.:](\d{2})/);
    if (match) {
      targetHour   = parseInt(match[1], 10);
      targetMinute = parseInt(match[2], 10);
    }
  }

  const endTime = new Date(now);
  endTime.setHours(targetHour, targetMinute, 0, 0);

  // Wrap to tomorrow if the target has already passed today
  if (endTime <= now) {
    endTime.setDate(endTime.getDate() + 1);
  }

  const availableMinutes = Math.floor((endTime.getTime() - now.getTime()) / 60000);

  // ── 2. Guard: nothing to schedule ─────────────────────────────────────────
  if (availableMinutes <= 0 || tasks.length === 0) {
    return { plan: [], unassignedTasks: [...tasks] };
  }

  // ── 3. Sort pending tasks: deadline first, then heavier workload ──────────
  const pendingTasks  = tasks.filter(t => !t.completed);
  const sortedTasks   = [...pendingTasks].sort((a, b) => {
    const dA = getDeadlineScore(a.deadline);
    const dB = getDeadlineScore(b.deadline);
    if (dA !== dB) return dB - dA;
    return getWorkloadMinutes(b.workload) - getWorkloadMinutes(a.workload);
  });

  if (sortedTasks.length === 0) {
    return { plan: [], unassignedTasks: [] };
  }

  // ── 4. Mental-state adjustments ───────────────────────────────────────────
  // "Very tired" → only process the single most-urgent task.
  // This is an ADJUSTMENT, not a veto on scheduling.
  const maxTasksToProcess =
    mentalState === 'benar_benar_lelah' ? 1 : sortedTasks.length;

  const maxBlock  = getFocusBlockMaxMinutes(mentalState);
  const breakMins = getBreakMinutes(mentalState);

  // ── 5. SHORT-TIME RULE: ≤15 minutes ───────────────────────────────────────
  // Simplified schedule: one task, all available time, no breaks.
  // ARUNA must never leave this time unused just because it is short.
  if (availableMinutes <= 15) {
    const topTask     = sortedTasks[0];
    const sessionMins = availableMinutes; // use every available minute

    const blockStart  = new Date(now);
    const blockEnd    = new Date(now.getTime() + sessionMins * 60000);

    const plan: DailyPlanItem[] = [{
      id:        Math.random().toString(36).substr(2, 9),
      taskId:    topTask.id,
      taskTitle: topTask.title,
      type:      'focus',
      startTime: blockStart,
      endTime:   blockEnd,
    }];

    // All other tasks are deferred to "Nanti"
    const unassignedTasks = sortedTasks.slice(1);
    return { plan, unassignedTasks };
  }

  // ── 6. NORMAL SCHEDULING (> 15 minutes) ───────────────────────────────────
  const plan: DailyPlanItem[]   = [];
  const unassignedTasks: Task[] = [];

  let currentStartTime = new Date(now);
  let remainingMinutes = availableMinutes;

  for (let i = 0; i < sortedTasks.length; i++) {
    const task = sortedTasks[i];

    // Mental-state cap: defer lower-priority tasks when very tired
    if (i >= maxTasksToProcess) {
      unassignedTasks.push(task);
      continue;
    }

    // No time left — defer remaining tasks
    if (remainingMinutes <= 0) {
      unassignedTasks.push(task);
      continue;
    }

    let neededMins    = getWorkloadMinutes(task.workload);
    let taskScheduled = false;

    while (neededMins > 0 && remainingMinutes > 0) {
      // Cap by maxBlock (mental-state), then cap by remaining time.
      // We ALWAYS use whatever time is left — never skip because "not enough".
      const blockMins   = Math.min(neededMins, maxBlock);
      const actualBlock = Math.min(blockMins, remainingMinutes);

      const blockEnd = new Date(currentStartTime.getTime() + actualBlock * 60000);

      plan.push({
        id:        Math.random().toString(36).substr(2, 9),
        taskId:    task.id,
        taskTitle: task.title,
        type:      'focus',
        startTime: new Date(currentStartTime),
        endTime:   new Date(blockEnd),
      });

      neededMins       -= actualBlock;
      remainingMinutes -= actualBlock;
      currentStartTime  = new Date(blockEnd);
      taskScheduled     = true;

      // ── Break logic ──────────────────────────────────────────────────────
      // Insert a break only when:
      //   (a) there is still work ahead (this task or a subsequent one), AND
      //   (b) enough time remains for both the break AND meaningful work after
      const moreWork      = neededMins > 0 || i < sortedTasks.length - 1;
      const afterBreak    = remainingMinutes - breakMins;
      const worthBreaking = moreWork && afterBreak >= MIN_REMAINING_AFTER_BREAK;

      if (worthBreaking) {
        const breakEnd = new Date(currentStartTime.getTime() + breakMins * 60000);
        plan.push({
          id:        Math.random().toString(36).substr(2, 9),
          type:      'break',
          startTime: new Date(currentStartTime),
          endTime:   new Date(breakEnd),
        });
        remainingMinutes -= breakMins;
        currentStartTime  = new Date(breakEnd);
      }
    }

    // Task could not fit at all → defer to "Nanti"
    if (!taskScheduled) {
      unassignedTasks.push(task);
    }
    // Note: if a task was partially scheduled (neededMins > 0 but taskScheduled),
    // it stays in the plan as a partial session. It remains active for future sessions.
    // Do NOT push it to unassignedTasks — it would create a confusing duplicate.
  }

  // ── 7. Free-time buffer at the end (only if meaningful) ───────────────────
  if (remainingMinutes >= 10 && plan.length > 0) {
    plan.push({
      id:        Math.random().toString(36).substr(2, 9),
      type:      'buffer',
      startTime: new Date(currentStartTime),
      endTime:   new Date(currentStartTime.getTime() + remainingMinutes * 60000),
    });
  }

  return { plan, unassignedTasks };
}
