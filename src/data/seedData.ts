import { Task, User, Priority, Status } from '../types';

const USERS: User[] = [
  { id: 'u1', name: 'Alex Morgan', color: '#6366f1', initials: 'AM' },
  { id: 'u2', name: 'Jordan Lee', color: '#ec4899', initials: 'JL' },
  { id: 'u3', name: 'Sam Rivera', color: '#14b8a6', initials: 'SR' },
  { id: 'u4', name: 'Taylor Kim', color: '#f97316', initials: 'TK' },
  { id: 'u5', name: 'Casey Chen', color: '#8b5cf6', initials: 'CC' },
  { id: 'u6', name: 'Riley Patel', color: '#06b6d4', initials: 'RP' },
];

export { USERS };

const TASK_PREFIXES = [
  'Implement', 'Design', 'Refactor', 'Debug', 'Optimize', 'Review', 'Update',
  'Build', 'Create', 'Fix', 'Migrate', 'Test', 'Deploy', 'Configure',
  'Document', 'Integrate', 'Analyse', 'Improve', 'Set up', 'Remove',
];

const TASK_SUBJECTS = [
  'authentication flow', 'dashboard layout', 'API endpoints', 'database schema',
  'notification system', 'user profile page', 'search functionality', 'payment gateway',
  'file upload module', 'email templates', 'caching layer', 'error handling',
  'logging system', 'CI/CD pipeline', 'admin panel', 'onboarding wizard',
  'dark mode theme', 'accessibility features', 'data export tool', 'analytics tracker',
  'WebSocket connection', 'rate limiter', 'image compression', 'form validation',
  'session management', 'role-based access', 'audit trail', 'backup strategy',
  'load balancer config', 'SSL certificate', 'localization support', 'PDF generator',
  'chart visualizations', 'drag-and-drop editor', 'real-time sync',
  'push notifications', 'two-factor auth', 'password reset flow', 'data migration script',
  'unit test coverage', 'integration tests', 'performance benchmarks', 'code splitting',
  'lazy loading strategy', 'responsive layouts', 'keyboard shortcuts', 'tooltip system',
  'breadcrumb navigation', 'infinite scroll', 'batch processing',
];

const DESCRIPTIONS = [
  'Review and address all pending items.',
  'Follow design specifications closely.',
  'Coordinate with the team before starting.',
  'Ensure backward compatibility.',
  'Add proper error handling and logging.',
  'Write comprehensive tests.',
  'Update documentation accordingly.',
  'Consider edge cases carefully.',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function generateTasks(count: number = 500): Task[] {
  const tasks: Task[] = [];
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const priorities = Object.values(Priority);
  const statuses = Object.values(Status);

  for (let i = 0; i < count; i++) {
    const hasStartDate = Math.random() > 0.15;
    const isOverdue = Math.random() < 0.2;
    const isDueToday = Math.random() < 0.05;

    let dueDate: Date;
    let startDate: Date | null = null;

    if (isDueToday) {
      dueDate = new Date(today);
    } else if (isOverdue) {
      const daysOverdue = Math.floor(Math.random() * 20) + 1;
      dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() - daysOverdue);
    } else {
      dueDate = randomDate(
        new Date(monthStart.getTime() - 5 * 86400000),
        new Date(monthEnd.getTime() + 10 * 86400000)
      );
    }

    if (hasStartDate) {
      const daysBefore = Math.floor(Math.random() * 14) + 1;
      startDate = new Date(dueDate);
      startDate.setDate(startDate.getDate() - daysBefore);
    }

    const prefix = randomItem(TASK_PREFIXES);
    const subject = randomItem(TASK_SUBJECTS);
    const title = `${prefix} ${subject}`;

    tasks.push({
      id: `task-${i + 1}`,
      title,
      description: randomItem(DESCRIPTIONS),
      assignee: randomItem(USERS),
      priority: randomItem(priorities),
      status: randomItem(statuses),
      startDate: startDate ? formatDate(startDate) : null,
      dueDate: formatDate(dueDate),
      createdAt: formatDate(randomDate(new Date(2025, 0, 1), today)),
    });
  }

  return tasks;
}
