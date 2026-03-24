import React from 'react';
import { Task, Priority, CollaborationUser } from '../../types';
import { Avatar, AvatarStack } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { formatDueDate } from '../../utils/helpers';

interface TaskCardProps {
  task: Task;
  collabs: CollaborationUser[];
  onDragStart: (e: React.PointerEvent, task: Task) => void;
  isDragging?: boolean;
}

const priorityVariant: Record<Priority, 'critical' | 'high' | 'medium' | 'low'> = {
  [Priority.Critical]: 'critical',
  [Priority.High]: 'high',
  [Priority.Medium]: 'medium',
  [Priority.Low]: 'low',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, collabs, onDragStart, isDragging }) => {
  const { text: dueDateText, isOverdue, isToday } = formatDueDate(task.dueDate);

  return (
    <div
      data-task-id={task.id}
      className={`group relative bg-white rounded-lg border border-border p-3.5 cursor-grab select-none
        transition-shadow duration-150 hover:shadow-md hover:border-gray-300
        ${isDragging ? 'opacity-0' : ''}`}
      onPointerDown={(e) => onDragStart(e, task)}
      style={{ touchAction: 'none' }}
    >
      {/* Collaboration indicators */}
      {collabs.length > 0 && (
        <div className="absolute -top-1.5 -right-1.5 z-10">
          <AvatarStack
            avatars={collabs.map((c) => ({ initials: c.user.initials, color: c.user.color }))}
            max={2}
            size="sm"
          />
        </div>
      )}

      {/* Priority badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-text-primary mb-2.5 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Avatar
          initials={task.assignee.initials}
          color={task.assignee.color}
          size="sm"
        />
        <span
          className={`text-xs font-medium ${
            isOverdue
              ? 'text-critical'
              : isToday
              ? 'text-brand font-semibold'
              : 'text-text-muted'
          }`}
        >
          {dueDateText}
        </span>
      </div>
    </div>
  );
};
