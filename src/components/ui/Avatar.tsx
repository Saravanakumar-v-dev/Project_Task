import React from 'react';

interface AvatarProps {
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBorder?: boolean;
}

const sizeMap = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  color,
  size = 'md',
  className = '',
  showBorder = false,
}) => {
  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0
        ${showBorder ? 'ring-2 ring-white' : ''} ${className}`}
      style={{ backgroundColor: color }}
      title={initials}
    >
      {initials}
    </div>
  );
};

interface AvatarStackProps {
  avatars: { initials: string; color: string }[];
  max?: number;
  size?: 'sm' | 'md';
}

export const AvatarStack: React.FC<AvatarStackProps> = ({ avatars, max = 3, size = 'sm' }) => {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((a, i) => (
        <Avatar
          key={i}
          initials={a.initials}
          color={a.color}
          size={size}
          showBorder
          className="avatar-enter"
        />
      ))}
      {overflow > 0 && (
        <div
          className={`${size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'}
            rounded-full bg-gray-600 text-white flex items-center justify-center font-semibold ring-2 ring-white`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};
