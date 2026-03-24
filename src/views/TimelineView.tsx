import React, { useMemo, useRef } from 'react';
import { Task, Priority, CollaborationUser } from '../types';
import { AvatarStack } from '../components/ui/Avatar';
import { getPriorityDotColor, formatDueDate } from '../utils/helpers';

interface TimelineViewProps {
  tasks: Task[];
  getCollabsForTask: (taskId: string) => CollaborationUser[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks, getCollabsForTask }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayWidth = 48;
  const rowHeight = 40;
  const headerHeight = 60;
  const leftLabelWidth = 260;

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return {
        date: d,
        dayNum: i + 1,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: d.toDateString() === today.toDateString(),
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      };
    });
  }, [year, month, daysInMonth]);

  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const todayIndex = today.getDate() - 1;

  const getBarPosition = (task: Task) => {
    const dueDate = new Date(task.dueDate);
    const startDate = task.startDate ? new Date(task.startDate) : null;

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, daysInMonth);

    if (!startDate) {
      // Single-day marker on due date
      const dueDay = dueDate >= monthStart && dueDate <= monthEnd
        ? dueDate.getDate() - 1
        : dueDate < monthStart ? 0 : daysInMonth - 1;
      return { left: dueDay * dayWidth, width: dayWidth, isSingleDay: true };
    }

    const effectiveStart = startDate < monthStart ? monthStart : startDate;
    const effectiveEnd = dueDate > monthEnd ? monthEnd : dueDate;

    const startDay = Math.max(0, Math.floor((effectiveStart.getTime() - monthStart.getTime()) / 86400000));
    const endDay = Math.min(daysInMonth - 1, Math.floor((effectiveEnd.getTime() - monthStart.getTime()) / 86400000));

    const left = startDay * dayWidth;
    const width = Math.max(dayWidth, (endDay - startDay + 1) * dayWidth);

    return { left, width, isSingleDay: false };
  };

  const priorityBarColor: Record<Priority, string> = {
    [Priority.Critical]: 'bg-critical/80',
    [Priority.High]: 'bg-high/80',
    [Priority.Medium]: 'bg-medium/80',
    [Priority.Low]: 'bg-low/80',
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-text-secondary font-medium mb-1">No tasks to display</p>
        <p className="text-xs text-text-muted">Adjust your filters to see tasks on the timeline</p>
      </div>
    );
  }

  // Limit displayed tasks for performance in timeline
  const displayTasks = tasks.slice(0, 100);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)] px-3 sm:px-6 py-3 sm:py-4">
      <div className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {monthLabel}
        <span className="text-text-muted font-normal">— {displayTasks.length} tasks</span>
      </div>

      <div className="flex-1 overflow-auto border border-border rounded-lg bg-white">
        <div className="relative" style={{ minWidth: leftLabelWidth + daysInMonth * dayWidth }}>
          {/* Header row */}
          <div className="sticky top-0 z-20 flex" style={{ height: headerHeight }}>
            <div
              className="sticky left-0 z-30 bg-surface-alt border-b border-r border-border flex items-end px-3 pb-2"
              style={{ width: leftLabelWidth, minWidth: leftLabelWidth }}
            >
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Task</span>
            </div>
            <div className="flex">
              {days.map((day) => (
                <div
                  key={day.dayNum}
                  className={`flex flex-col items-center justify-end pb-2 border-b border-r border-border text-center
                    ${day.isWeekend ? 'bg-gray-50' : 'bg-surface-alt'}
                    ${day.isToday ? 'bg-brand-light' : ''}`}
                  style={{ width: dayWidth }}
                >
                  <span className="text-[10px] text-text-muted uppercase">{day.dayName}</span>
                  <span className={`text-sm font-semibold ${day.isToday ? 'text-brand' : 'text-text-primary'}`}>
                    {day.dayNum}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Body rows */}
          {displayTasks.map((task, idx) => {
            const bar = getBarPosition(task);
            const collabs = getCollabsForTask(task.id);
            const { text: dueDateText, isOverdue } = formatDueDate(task.dueDate);

            return (
              <div
                key={task.id}
                className={`flex ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} border-b border-border-light`}
                style={{ height: rowHeight }}
              >
                {/* Task label */}
                <div
                  className="sticky left-0 z-10 bg-inherit border-r border-border flex items-center gap-2 px-3 min-w-0"
                  style={{ width: leftLabelWidth, minWidth: leftLabelWidth }}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getPriorityDotColor(task.priority) }}
                  />
                  <span className="text-xs font-medium text-text-primary truncate flex-1">{task.title}</span>
                  {collabs.length > 0 && (
                    <AvatarStack
                      avatars={collabs.map((c) => ({ initials: c.user.initials, color: c.user.color }))}
                      max={1}
                      size="sm"
                    />
                  )}
                </div>

                {/* Bar area */}
                <div className="relative flex-1" style={{ minWidth: daysInMonth * dayWidth }}>
                  {/* Day column lines */}
                  {days.map((day) => (
                    <div
                      key={day.dayNum}
                      className={`absolute top-0 bottom-0 border-r ${day.isWeekend ? 'bg-gray-50/50' : ''} border-border-light`}
                      style={{ left: (day.dayNum - 1) * dayWidth, width: dayWidth }}
                    />
                  ))}

                  {/* Today line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-critical z-10"
                    style={{ left: todayIndex * dayWidth + dayWidth / 2 }}
                  />

                  {/* Task bar */}
                  {bar.isSingleDay ? (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
                      style={{ left: bar.left + dayWidth / 2 - 6, width: 12, height: 12 }}
                    >
                      <div
                        className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: getPriorityDotColor(task.priority) }}
                      />
                    </div>
                  ) : (
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-full z-10 ${priorityBarColor[task.priority]}
                        shadow-sm flex items-center px-2 min-w-0`}
                      style={{ left: bar.left + 4, width: Math.max(bar.width - 8, 20) }}
                      title={`${task.title} — ${dueDateText}`}
                    >
                      <span className="text-[10px] font-medium text-white truncate">{task.title}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
