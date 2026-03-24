import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Status, Priority, STATUS_LABELS } from '../types';
import { USERS } from '../data/seedData';
import { MultiSelect } from './ui/MultiSelect';
import { Button } from './ui/Button';

const statusOptions = Object.values(Status).map((s) => ({
  value: s,
  label: STATUS_LABELS[s],
}));

const priorityOptions = Object.values(Priority).map((p) => ({
  value: p,
  label: p,
}));

const assigneeOptions = USERS.map((u) => ({
  value: u.id,
  label: u.name,
}));

export const FilterBar: React.FC = () => {
  const { filters, setFilters, clearFilters } = useTaskStore();

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assignees.length > 0 ||
    filters.dueDateFrom !== '' ||
    filters.dueDateTo !== '';

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-b border-border">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mr-1">Filters</span>

      <MultiSelect
        label="Status"
        options={statusOptions}
        selected={filters.statuses}
        onChange={(statuses) => setFilters({ statuses: statuses as Status[] })}
      />

      <MultiSelect
        label="Priority"
        options={priorityOptions}
        selected={filters.priorities}
        onChange={(priorities) => setFilters({ priorities: priorities as Priority[] })}
      />

      <MultiSelect
        label="Assignee"
        options={assigneeOptions}
        selected={filters.assignees}
        onChange={(assignees) => setFilters({ assignees })}
      />

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={filters.dueDateFrom}
          onChange={(e) => setFilters({ dueDateFrom: e.target.value })}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-white text-text-secondary
            focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
          placeholder="From"
        />
        <span className="text-text-muted text-xs">to</span>
        <input
          type="date"
          value={filters.dueDateTo}
          onChange={(e) => setFilters({ dueDateTo: e.target.value })}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-white text-text-secondary
            focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
          placeholder="To"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear all
        </Button>
      )}
    </div>
  );
};
