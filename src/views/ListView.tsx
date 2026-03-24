import React, { useRef, useState, useEffect } from 'react';
import { Task, Status, Priority, STATUS_LABELS, CollaborationUser } from '../types';
import { useTaskStore } from '../store/useTaskStore';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import { Avatar, AvatarStack } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { formatDueDate } from '../utils/helpers';

const ROW_HEIGHT = 52;

const priorityVariant: Record<Priority, 'critical' | 'high' | 'medium' | 'low'> = {
  [Priority.Critical]: 'critical',
  [Priority.High]: 'high',
  [Priority.Medium]: 'medium',
  [Priority.Low]: 'low',
};

interface ListViewProps {
  tasks: Task[];
  getCollabsForTask: (taskId: string) => CollaborationUser[];
}

interface InlineStatusDropdownProps {
  currentStatus: Status;
  onStatusChange: (status: Status) => void;
}

const InlineStatusDropdown: React.FC<InlineStatusDropdownProps> = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const statusStyleMap: Record<Status, string> = {
    [Status.Todo]: 'bg-gray-100 text-gray-700',
    [Status.InProgress]: 'bg-blue-100 text-blue-700',
    [Status.InReview]: 'bg-purple-100 text-purple-700',
    [Status.Done]: 'bg-green-100 text-green-700',
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all
          ${statusStyleMap[currentStatus]} hover:opacity-80`}
      >
        {STATUS_LABELS[currentStatus]}
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 min-w-[140px] bg-white rounded-lg shadow-lg border border-border py-1">
          {Object.values(Status).map((s) => (
            <button
              key={s}
              className={`w-full text-left px-3 py-2 text-xs cursor-pointer transition-colors
                ${s === currentStatus ? 'bg-brand-light text-brand-dark font-medium' : 'text-text-secondary hover:bg-surface-alt'}`}
              onClick={() => { onStatusChange(s); setIsOpen(false); }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SortIcon: React.FC<{ direction: 'asc' | 'desc' | null }> = ({ direction }) => {
  if (!direction) return (
    <svg className="w-3.5 h-3.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
  return (
    <svg
      className="w-3.5 h-3.5 text-brand"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      style={{ transform: direction === 'desc' ? 'rotate(180deg)' : 'none' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
};

export const ListView: React.FC<ListViewProps> = ({ tasks, getCollabsForTask }) => {
  const { sortConfig, setSort, updateTaskStatus, getSortedTasks } = useTaskStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);

  const sortedTasks = getSortedTasks(tasks);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const { visibleItems, totalHeight, onScroll } = useVirtualScroll({
    itemCount: sortedTasks.length,
    itemHeight: ROW_HEIGHT,
    containerHeight,
    overscan: 5,
  });

  if (sortedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-text-secondary font-medium mb-1">No tasks match your filters</p>
        <button
          onClick={() => useTaskStore.getState().clearFilters()}
          className="text-sm text-brand hover:text-brand-dark cursor-pointer font-medium"
        >
          Clear filters
        </button>
      </div>
    );
  }

  const sortFields: { key: 'title' | 'priority' | 'dueDate'; label: string; width: string }[] = [
    { key: 'title', label: 'Task', width: 'flex-[3]' },
    { key: 'priority', label: 'Priority', width: 'flex-1' },
    { key: 'dueDate', label: 'Due Date', width: 'flex-1' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)] px-3 sm:px-6 py-3 sm:py-4">
      {/* Table header */}
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 bg-surface-alt rounded-t-lg border border-border text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider min-w-[640px]">
        {sortFields.map((sf) => (
          <button
            key={sf.key}
            className={`flex items-center gap-1.5 ${sf.width} cursor-pointer hover:text-text-primary transition-colors`}
            onClick={() => setSort(sf.key)}
          >
            {sf.label}
            <SortIcon direction={sortConfig.field === sf.key ? sortConfig.direction : null} />
          </button>
        ))}
        <div className="flex-1">Status</div>
        <div className="flex-1">Assignee</div>
        <div className="w-10"></div>
      </div>

      {/* Scrollable table body with virtual scrolling */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto border-x border-b border-border rounded-b-lg bg-white"
        onScroll={onScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map(({ index, offsetTop }) => {
            const task = sortedTasks[index];
            if (!task) return null;
            const { text: dueDateText, isOverdue, isToday } = formatDueDate(task.dueDate);
            const collabs = getCollabsForTask(task.id);

            return (
              <div
                key={task.id}
                style={{ position: 'absolute', top: offsetTop, height: ROW_HEIGHT, left: 0, right: 0 }}
                className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 border-b border-border-light hover:bg-surface-hover transition-colors min-w-[640px]"
              >
                <div className="flex-[3] flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-text-primary truncate">{task.title}</span>
                  {collabs.length > 0 && (
                    <AvatarStack
                      avatars={collabs.map((c) => ({ initials: c.user.initials, color: c.user.color }))}
                      max={2}
                      size="sm"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                </div>
                <div className={`flex-1 text-sm ${isOverdue ? 'text-critical font-medium' : isToday ? 'text-brand font-semibold' : 'text-text-secondary'}`}>
                  {dueDateText}
                </div>
                <div className="flex-1">
                  <InlineStatusDropdown
                    currentStatus={task.status}
                    onStatusChange={(s) => updateTaskStatus(task.id, s)}
                  />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <Avatar initials={task.assignee.initials} color={task.assignee.color} size="sm" />
                  <span className="text-xs text-text-secondary truncate hidden md:inline">{task.assignee.name}</span>
                </div>
                <div className="w-10" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
