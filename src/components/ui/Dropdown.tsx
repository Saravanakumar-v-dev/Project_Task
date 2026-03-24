import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute z-50 mt-1 min-w-[180px] bg-white rounded-lg shadow-lg border border-border
            py-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({ children, onClick, active }) => {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer
        ${active ? 'bg-brand-light text-brand-dark font-medium' : 'text-text-secondary hover:bg-surface-alt'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
