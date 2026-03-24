import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Task, Status, CollaborationUser } from '../types';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { useTaskStore } from '../store/useTaskStore';

const COLUMNS: Status[] = [Status.Todo, Status.InProgress, Status.InReview, Status.Done];

interface KanbanViewProps {
  tasks: Task[];
  getCollabsForTask: (taskId: string) => CollaborationUser[];
}

export const KanbanView: React.FC<KanbanViewProps> = ({ tasks, getCollabsForTask }) => {
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [dropTarget, setDropTarget] = useState<Status | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const tasksByStatus = useCallback(
    (status: Status) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  const createGhost = useCallback((e: React.PointerEvent, task: Task) => {
    const target = (e.target as HTMLElement).closest('[data-task-id]') as HTMLElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const ghost = target.cloneNode(true) as HTMLDivElement;

    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.position = 'fixed';
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.style.zIndex = '9999';
    ghost.style.pointerEvents = 'none';
    ghost.style.opacity = '0.85';
    ghost.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1)';
    ghost.style.transform = 'rotate(2deg) scale(1.02)';
    ghost.style.transition = 'none';
    ghost.style.cursor = 'grabbing';

    document.body.appendChild(ghost);
    ghostRef.current = ghost;

    startPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleDragStart = useCallback(
    (e: React.PointerEvent, task: Task) => {
      if (e.button !== 0) return;
      e.preventDefault();

      hasMoved.current = false;
      setDraggingTask(task);
      createGhost(e, task);

      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [createGhost]
  );

  const findColumnUnderPointer = useCallback((clientX: number, clientY: number): Status | null => {
    const ghost = ghostRef.current;
    if (ghost) ghost.style.display = 'none';

    const elem = document.elementFromPoint(clientX, clientY);

    if (ghost) ghost.style.display = '';

    if (!elem) return null;

    const col = elem.closest('[data-column-status]');
    if (col) {
      return col.getAttribute('data-column-status') as Status;
    }
    return null;
  }, []);

  useEffect(() => {
    if (!draggingTask) return;

    const handleMove = (e: PointerEvent) => {
      hasMoved.current = true;
      if (ghostRef.current) {
        ghostRef.current.style.left = `${e.clientX - startPosRef.current.x}px`;
        ghostRef.current.style.top = `${e.clientY - startPosRef.current.y}px`;
      }
      const col = findColumnUnderPointer(e.clientX, e.clientY);
      setDropTarget(col);
    };

    const handleUp = (e: PointerEvent) => {
      const col = findColumnUnderPointer(e.clientX, e.clientY);

      if (col && col !== draggingTask.status && hasMoved.current) {
        updateTaskStatus(draggingTask.id, col);
      } else if (ghostRef.current && hasMoved.current) {
        // Snap back animation
        ghostRef.current.style.transition = 'all 0.3s cubic-bezier(0.2, 0, 0, 1)';
        ghostRef.current.style.opacity = '0';
        ghostRef.current.style.transform = 'scale(0.95)';
        setTimeout(() => {
          ghostRef.current?.remove();
          ghostRef.current = null;
        }, 300);
        setDraggingTask(null);
        setDropTarget(null);
        return;
      }

      ghostRef.current?.remove();
      ghostRef.current = null;
      setDraggingTask(null);
      setDropTarget(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [draggingTask, findColumnUnderPointer, updateTaskStatus]);

  return (
    <div className="flex gap-3 sm:gap-4 p-3 sm:p-6 overflow-x-auto h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)]">
      {COLUMNS.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasksByStatus(status)}
          getCollabsForTask={getCollabsForTask}
          onDragStart={handleDragStart}
          draggingTaskId={draggingTask?.id ?? null}
          isDropTarget={dropTarget === status}
        />
      ))}
    </div>
  );
};
