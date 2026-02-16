import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface IndustrialDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  labelPrefix?: string;
}

export const IndustrialDropdown: React.FC<IndustrialDropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  icon,
  labelPrefix 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-industrial-950/40 border border-brand-500/10 rounded-lg p-1 group hover:border-brand-500/30 transition-all focus:outline-none"
      >
        <div className="p-2 text-industrial-600 group-hover:text-brand-500 transition-colors">
          {icon}
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="text-[10px] font-black text-industrial-100 uppercase tracking-widest leading-none">
            {labelPrefix && <span className="text-industrial-500 mr-1">{labelPrefix}:</span>}
            {selectedOption?.label}
          </span>
          <ChevronDown size={12} className={`text-industrial-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Glassmorphic Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-industrial-950/60 backdrop-blur-2xl border border-brand-500/20 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-50 animate-in fade-in zoom-in-95 duration-200 origin-top">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group/opt
                  ${value === option.value 
                    ? 'bg-brand-500/20 text-brand-500 border-l-2 border-brand-500' 
                    : 'text-industrial-400 hover:bg-industrial-800/40 hover:text-industrial-100'
                  }`}
              >
                {option.label}
                {value === option.value && (
                   <div className="w-1.5 h-1.5 bg-brand-500 rounded-full shadow-[0_0_10px_rgba(168,121,50,1)]" />
                )}
              </button>
            ))}
          </div>
          
          {/* Bottom Decoration */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
        </div>
      )}
    </div>
  );
};
