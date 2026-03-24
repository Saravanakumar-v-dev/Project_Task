import React from 'react';
import { useTaskStore } from './store/useTaskStore';
import { useCollaboration } from './hooks/useCollaboration';
import { useFilterSync } from './hooks/useFilterSync';
import { FilterBar } from './components/FilterBar';
import { ViewSwitcher } from './components/ViewSwitcher';
import { PresenceBar } from './components/PresenceBar';
import { KanbanView } from './views/KanbanView';
import { ListView } from './views/ListView';
import { TimelineView } from './views/TimelineView';

const App: React.FC = () => {
  useFilterSync();
  const { activeView, getFilteredTasks } = useTaskStore();
  const { activeCollabs, getCollabsForTask } = useCollaboration();

  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">Project Tracker</h1>
              <p className="text-xs text-text-muted hidden sm:block">Manage your team's tasks efficiently</p>
            </div>
          </div>
          <ViewSwitcher />
        </div>
      </header>

      <PresenceBar activeCollabs={activeCollabs} />
      <FilterBar />

      {/* Main content */}
      <main>
        {activeView === 'kanban' && (
          <KanbanView tasks={filteredTasks} getCollabsForTask={getCollabsForTask} />
        )}
        {activeView === 'list' && (
          <ListView tasks={filteredTasks} getCollabsForTask={getCollabsForTask} />
        )}
        {activeView === 'timeline' && (
          <TimelineView tasks={filteredTasks} getCollabsForTask={getCollabsForTask} />
        )}
      </main>
    </div>
  );
};

export default App;
