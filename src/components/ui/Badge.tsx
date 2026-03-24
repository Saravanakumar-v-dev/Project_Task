import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'neutral';
  className?: string;
}

const variantStyles: Record<string, string> = {
  critical: 'bg-critical/15 text-critical border-critical/20',
  high: 'bg-high/15 text-high border-high/20',
  medium: 'bg-medium/15 text-yellow-700 border-medium/20',
  low: 'bg-low/15 text-green-700 border-low/20',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border
        ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
