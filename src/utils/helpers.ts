import { Priority, Status } from '../types';

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.Critical: return 'bg-critical text-white';
    case Priority.High: return 'bg-high text-white';
    case Priority.Medium: return 'bg-medium text-gray-900';
    case Priority.Low: return 'bg-low text-white';
  }
}

export function getPriorityDotColor(priority: Priority): string {
  switch (priority) {
    case Priority.Critical: return '#ef4444';
    case Priority.High: return '#f97316';
    case Priority.Medium: return '#eab308';
    case Priority.Low: return '#22c55e';
  }
}

export function getStatusColumnColor(status: Status): string {
  switch (status) {
    case Status.Todo: return 'bg-kanban-todo';
    case Status.InProgress: return 'bg-kanban-progress';
    case Status.InReview: return 'bg-kanban-review';
    case Status.Done: return 'bg-kanban-done';
  }
}

export function formatDueDate(dueDate: string): { text: string; isOverdue: boolean; isToday: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / 86400000);

  if (diffDays === 0) {
    return { text: 'Due Today', isOverdue: false, isToday: true };
  }

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    if (overdueDays > 7) {
      return { text: `${overdueDays}d overdue`, isOverdue: true, isToday: false };
    }
    return {
      text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isOverdue: true,
      isToday: false,
    };
  }

  return {
    text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue: false,
    isToday: false,
  };
}
