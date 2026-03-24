import React from 'react';
import { ViewType } from '../types';
import { useTaskStore } from '../store/useTaskStore';

const views: { key: ViewType; label: string; icon: React.ReactNode }[] = [
  {
    key: 'kanban',
    label: 'Board',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    key: 'list',
    label: 'List',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    key: 'timeline',
    label: 'Timeline',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export const ViewSwitcher: React.FC = () => {
  const { activeView, setView } = useTaskStore();

  return (
    <div className="flex items-center gap-1 bg-surface-alt rounded-lg p-1">
      {views.map((v) => (
        <button
          key={v.key}
          onClick={() => setView(v.key)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer
            ${activeView === v.key
              ? 'bg-white text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
            }`}
        >
          {v.icon}
          {v.label}
        </button>
      ))}
    </div>
  );
};
