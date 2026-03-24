import React from 'react';
import { Task, Status, STATUS_LABELS, CollaborationUser } from '../../types';
import { TaskCard } from './TaskCard';
import { getStatusColumnColor } from '../../utils/helpers';

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
  getCollabsForTask: (taskId: string) => CollaborationUser[];
  onDragStart: (e: React.PointerEvent, task: Task) => void;
  draggingTaskId: string | null;
  isDropTarget: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  getCollabsForTask,
  onDragStart,
  draggingTaskId,
  isDropTarget,
}) => {
  const statusColors: Record<Status, string> = {
    [Status.Todo]: '#64748b',
    [Status.InProgress]: '#3b82f6',
    [Status.InReview]: '#a855f7',
    [Status.Done]: '#22c55e',
  };

  return (
    <div
      data-column-status={status}
      className={`flex flex-col min-w-[240px] sm:min-w-[280px] max-w-[320px] flex-1 rounded-xl transition-colors duration-200
        ${isDropTarget ? 'drop-zone-active' : `${getStatusColumnColor(status)} border border-transparent`}`}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: statusColors[status] }}
        />
        <h3 className="text-sm font-semibold text-text-primary">{STATUS_LABELS[status]}</h3>
        <span className="ml-auto flex items-center justify-center w-6 h-6 rounded-full bg-white text-xs font-semibold text-text-secondary shadow-sm">
          {tasks.length}
        </span>
      </div>

      {/* Cards container */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm text-text-muted font-medium">No tasks here</p>
            <p className="text-xs text-text-muted mt-1">Drag tasks here to change their status</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id}>
              {draggingTaskId === task.id && (
                <div className="drag-placeholder rounded-lg" style={{ height: '110px' }} />
              )}
              <TaskCard
                task={task}
                collabs={getCollabsForTask(task.id)}
                onDragStart={onDragStart}
                isDragging={draggingTaskId === task.id}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
