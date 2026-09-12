import { MentalStateId } from "./data/mentalStates";
export type { MentalStateId };

export type TaskDeadline = "besok" | "minggu_ini" | "minggu_depan" | "tidak_ada";
export type TaskWorkload = "sedikit" | "sedang" | "banyak" | "belum_tahu";

export type TimerStatus =
  | "idle"
  | "running"
  | "paused"
  | "alarm"
  | "completed"
  | "rescue_running"
  | "rescue_paused"
  | "rescue_alarm";

export interface Task {
  id: string;
  title: string;
  deadline?: TaskDeadline;
  workload?: TaskWorkload;
  completed: boolean;
}

export interface DailyPlanItem {
  id: string;
  taskId?: string; // If undefined, it's a break or buffer
  type: "focus" | "break" | "buffer";
  startTime: Date;
  endTime: Date;
  taskTitle?: string;
}

export interface UserPlanningState {
  mentalState: MentalStateId | null;
  tasks: Task[];
  availableUntil?: Date;
  plan?: DailyPlanItem[];
  unassignedTasks?: Task[];
}
