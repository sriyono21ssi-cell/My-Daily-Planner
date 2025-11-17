
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  planningTime: number; // in hours
  actualTime: number; // in hours
}

export interface SummaryData {
  tasks: Task[];
  total: number;
  done: number;
  pending: number;
  totalPlanning: number;
  totalActual: number;
  totalActualDone: number;
}
