import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark shadow-sm',
  secondary: 'bg-white text-text-secondary border border-border hover:bg-surface-hover shadow-sm',
  ghost: 'text-text-secondary hover:bg-surface-alt hover:text-text-primary',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium
        transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
