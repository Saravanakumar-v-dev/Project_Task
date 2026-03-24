import { create } from 'zustand';
import { Task, Status, Priority, FilterState, SortConfig, ViewType } from '../types';
import { generateTasks } from '../data/seedData';

interface TaskStore {
  tasks: Task[];
  activeView: ViewType;
  filters: FilterState;
  sortConfig: SortConfig;
  setView: (view: ViewType) => void;
  updateTaskStatus: (taskId: string, newStatus: Status) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setSort: (field: SortConfig['field']) => void;
  getFilteredTasks: () => Task[];
  getSortedTasks: (tasks: Task[]) => Task[];
}

const DEFAULT_FILTERS: FilterState = {
  statuses: [],
  priorities: [],
  assignees: [],
  dueDateFrom: '',
  dueDateTo: '',
};

const PRIORITY_ORDER: Record<Priority, number> = {
  [Priority.Critical]: 0,
  [Priority.High]: 1,
  [Priority.Medium]: 2,
  [Priority.Low]: 3,
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: generateTasks(500),
  activeView: 'kanban',
  filters: { ...DEFAULT_FILTERS },
  sortConfig: { field: 'dueDate', direction: 'asc' },

  setView: (view) => set({ activeView: view }),

  updateTaskStatus: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    })),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  clearFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  setSort: (field) =>
    set((state) => ({
      sortConfig: {
        field,
        direction:
          state.sortConfig.field === field && state.sortConfig.direction === 'asc'
            ? 'desc'
            : 'asc',
      },
    })),

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      if (filters.statuses.length > 0 && !filters.statuses.includes(task.status))
        return false;
      if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority))
        return false;
      if (filters.assignees.length > 0 && !filters.assignees.includes(task.assignee.id))
        return false;
      if (filters.dueDateFrom && task.dueDate < filters.dueDateFrom) return false;
      if (filters.dueDateTo && task.dueDate > filters.dueDateTo) return false;
      return true;
    });
  },

  getSortedTasks: (tasks) => {
    const { sortConfig } = get();
    const sorted = [...tasks];
    const dir = sortConfig.direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      switch (sortConfig.field) {
        case 'title':
          return dir * a.title.localeCompare(b.title);
        case 'priority':
          return dir * (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
        case 'dueDate':
          return dir * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        default:
          return 0;
      }
    });

    return sorted;
  },
}));
