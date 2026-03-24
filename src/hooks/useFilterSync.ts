import { useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Status, Priority } from '../types';

export function useFilterSync() {
  const { filters, setFilters } = useTaskStore();

  // On mount, read URL params and hydrate store
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFilters: Record<string, unknown> = {};

    const statuses = params.get('statuses');
    if (statuses) urlFilters.statuses = statuses.split(',') as Status[];

    const priorities = params.get('priorities');
    if (priorities) urlFilters.priorities = priorities.split(',') as Priority[];

    const assignees = params.get('assignees');
    if (assignees) urlFilters.assignees = assignees.split(',');

    const dueDateFrom = params.get('dueDateFrom');
    if (dueDateFrom) urlFilters.dueDateFrom = dueDateFrom;

    const dueDateTo = params.get('dueDateTo');
    if (dueDateTo) urlFilters.dueDateTo = dueDateTo;

    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write filters to URL when they change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.statuses.length > 0) params.set('statuses', filters.statuses.join(','));
    if (filters.priorities.length > 0) params.set('priorities', filters.priorities.join(','));
    if (filters.assignees.length > 0) params.set('assignees', filters.assignees.join(','));
    if (filters.dueDateFrom) params.set('dueDateFrom', filters.dueDateFrom);
    if (filters.dueDateTo) params.set('dueDateTo', filters.dueDateTo);

    const search = params.toString();
    const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [filters]);

  // Listen for popstate (back/forward) and restore filters
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setFilters({
        statuses: params.get('statuses')?.split(',') as Status[] ?? [],
        priorities: params.get('priorities')?.split(',') as Priority[] ?? [],
        assignees: params.get('assignees')?.split(',') ?? [],
        dueDateFrom: params.get('dueDateFrom') ?? '',
        dueDateTo: params.get('dueDateTo') ?? '',
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setFilters]);
}
