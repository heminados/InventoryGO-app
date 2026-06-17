// Shared types and the status colour map for the task page and its sub-components.
// TaskManage.tsx and the components in this folder all import from here.

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

// A user that can be assigned to a task
export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface TaskAssignment {
  user: Employee;
}

// One task as returned by GET /tasks
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  created_by: number;
  creator: { id: number; name: string; email: string };
  assignments: TaskAssignment[];
}

// Values edited in the Edit Task drawer
export interface EditTaskForm {
  title: string;
  description: string;
  due_date: string;
  status: TaskStatus;
  assignee_ids: number[];
}

// Values entered in the Create Task dialog
export interface AddTaskForm {
  title: string;
  description: string;
  due_date: string;
  assignee_ids: number[];
}

// How each status is labelled and coloured in the table / chips
export const STATUS_CONFIG: Record<TaskStatus, { label: string; bg: string; color: string }> = {
  OPEN:        { label: 'Pending',     bg: '#eff6ff', color: '#3b82f6' },
  IN_PROGRESS: { label: 'In Progress', bg: '#fefce8', color: '#ca8a04' },
  DONE:        { label: 'Completed',   bg: '#dcfce7', color: '#16a34a' },
  CANCELLED:   { label: 'Cancelled',   bg: '#fee2e2', color: '#dc2626' },
};
