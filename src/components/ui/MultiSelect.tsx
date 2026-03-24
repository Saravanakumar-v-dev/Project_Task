import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
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

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all cursor-pointer
          ${selected.length > 0
            ? 'border-brand bg-brand-light text-brand-dark font-medium'
            : 'border-border bg-white text-text-secondary hover:border-gray-300'
          }`}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold">
            {selected.length}
          </span>
        )}
        <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-56 bg-white rounded-lg shadow-lg border border-border py-1 max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface-alt cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
                className="w-4 h-4 rounded border-gray-300 text-brand accent-brand cursor-pointer"
              />
              <span className="text-text-primary">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
