let activeAudioCtx: AudioContext | null = null;
let stopTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Plays a subtle two-tone chime in a loop for ~9 seconds.
 * Gracefully no-ops if AudioContext is unavailable.
 */
export function playAlarmLoop(): void {
  stopAlarm(); // Clear any existing

  if (typeof window === "undefined") return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    activeAudioCtx = new AudioCtx() as AudioContext;
    const ctx = activeAudioCtx;

    // Two-note chime: C5 then E5
    const notes = [523.25, 659.25];
    const chimeDuration = 0.85; // 0.85 seconds per loop
    const totalLoops = 10; // ~8.5 seconds total

    for (let loop = 0; loop < totalLoops; loop++) {
      const loopStartTime = ctx.currentTime + loop * chimeDuration;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.value = freq;

        const t = loopStartTime + i * 0.35;

        // Soft attack, natural decay
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

        osc.start(t);
        osc.stop(t + 0.75);
      });
    }

    // Automatically clean up after the sequence is fully done
    stopTimeout = setTimeout(() => {
      stopAlarm();
    }, totalLoops * chimeDuration * 1000 + 500);
  } catch {
    // Audio unavailable — silent fallback
  }
}

/**
 * Stops any actively playing alarm and cleans up resources immediately.
 */
export function stopAlarm(): void {
  if (stopTimeout) {
    clearTimeout(stopTimeout);
    stopTimeout = null;
  }
  if (activeAudioCtx) {
    activeAudioCtx.close().catch(() => {});
    activeAudioCtx = null;
  }
}

/**
 * Sends a browser notification if permission has been granted.
 * Does nothing if notifications are unavailable or denied.
 */
export function sendNotification(title: string, body: string): void {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    new Notification(title, { body, icon: "/favicon.ico" });
  } catch {
    // Ignore
  }
}

/**
 * Requests notification permission from the browser.
 * Safe to call — will not throw if unavailable.
 */
export async function requestNotificationPermission(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "default") return;

  try {
    await Notification.requestPermission();
  } catch {
    // Ignore
  }
}
