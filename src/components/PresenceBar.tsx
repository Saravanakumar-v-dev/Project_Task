import React from 'react';
import { CollaborationUser } from '../types';
import { AvatarStack } from './ui/Avatar';

interface PresenceBarProps {
  activeCollabs: CollaborationUser[];
}

export const PresenceBar: React.FC<PresenceBarProps> = ({ activeCollabs }) => {
  const uniqueUsers = activeCollabs.reduce((acc, c) => {
    if (!acc.find((u) => u.initials === c.user.initials)) {
      acc.push({ initials: c.user.initials, color: c.user.color });
    }
    return acc;
  }, [] as { initials: string; color: string }[]);

  return (
    <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 bg-white border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ animationName: 'pulse-dot' }} />
        <AvatarStack avatars={uniqueUsers} max={4} size="sm" />
      </div>
      <span className="text-sm text-text-secondary">
        <span className="font-semibold text-text-primary">{uniqueUsers.length}</span>
        {' '}{uniqueUsers.length === 1 ? 'person is' : 'people are'} viewing this board
      </span>
    </div>
  );
};
