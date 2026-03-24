import { useState, useEffect, useCallback, useRef } from 'react';
import { CollaborationUser, User } from '../types';
import { USERS } from '../data/seedData';
import { useTaskStore } from '../store/useTaskStore';

const COLLAB_USERS: User[] = [
  { id: 'collab-1', name: 'Dana Wu', color: '#e11d48', initials: 'DW' },
  { id: 'collab-2', name: 'Liam Fox', color: '#0ea5e9', initials: 'LF' },
  { id: 'collab-3', name: 'Priya Nair', color: '#d946ef', initials: 'PN' },
];

export function useCollaboration() {
  const tasks = useTaskStore((s) => s.tasks);
  const [activeCollabs, setActiveCollabs] = useState<CollaborationUser[]>([]);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const getRandomTaskId = useCallback(() => {
    const t = tasksRef.current;
    if (t.length === 0) return '';
    return t[Math.floor(Math.random() * Math.min(t.length, 50))].id;
  }, []);

  useEffect(() => {
    const initial = COLLAB_USERS.map((user) => ({
      user,
      taskId: getRandomTaskId(),
      action: (Math.random() > 0.5 ? 'viewing' : 'editing') as 'viewing' | 'editing',
    }));
    setActiveCollabs(initial);

    const interval = setInterval(() => {
      setActiveCollabs((prev) =>
        prev.map((c) => {
          if (Math.random() < 0.4) {
            return {
              ...c,
              taskId: getRandomTaskId(),
              action: Math.random() > 0.5 ? 'viewing' : 'editing',
            };
          }
          return c;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [getRandomTaskId]);

  const getCollabsForTask = useCallback(
    (taskId: string) => activeCollabs.filter((c) => c.taskId === taskId),
    [activeCollabs]
  );

  return { activeCollabs, getCollabsForTask };
}
