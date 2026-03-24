export enum Priority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum Status {
  Todo = 'Todo',
  InProgress = 'InProgress',
  InReview = 'InReview',
  Done = 'Done',
}

export const STATUS_LABELS: Record<Status, string> = {
  [Status.Todo]: 'To Do',
  [Status.InProgress]: 'In Progress',
  [Status.InReview]: 'In Review',
  [Status.Done]: 'Done',
};

export interface User {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: User;
  priority: Priority;
  status: Status;
  startDate: string | null;
  dueDate: string;
  createdAt: string;
}

export interface FilterState {
  statuses: Status[];
  priorities: Priority[];
  assignees: string[];
  dueDateFrom: string;
  dueDateTo: string;
}

export interface SortConfig {
  field: 'title' | 'priority' | 'dueDate';
  direction: 'asc' | 'desc';
}

export type ViewType = 'kanban' | 'list' | 'timeline';

export interface CollaborationUser {
  user: User;
  taskId: string;
  action: 'viewing' | 'editing';
}
