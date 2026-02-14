import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

import { ChevronDown, Settings as SettingsIcon } from 'lucide-react';

interface DropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}

const Dropdown: React.FC<DropdownProps> = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, width: 0, align: 'left' });

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update position when opening
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const alignRight = rect.left > window.innerWidth / 2;
            
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                right: window.innerWidth - rect.right - window.scrollX, // Distance from right edge
                width: rect.width,
                align: alignRight ? 'right' : 'left'
            });
        }
    }, [isOpen]);

    // Handle scroll/resize
    useEffect(() => {
        const handleScroll = () => { if (isOpen) setIsOpen(false); };
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 flex justify-between items-center rounded-lg border bg-industrial-200 dark:bg-industrial-950 border-industrial-300 dark:border-industrial-600 text-industrial-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
                style={{ minWidth: '0' }} // Allow shrinking if needed
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="truncate">{selectedLabel}</span>
                </div>
                <ChevronDown size={16} className={`flex-shrink-0 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && createPortal(
                <div 
                    className="absolute bg-industrial-50 dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-700 rounded-lg shadow-xl z-[99999] overflow-hidden"
                    style={{
                        top: coords.top + 4,
                        ...(coords.align === 'left' ? { left: coords.left } : { right: coords.right }),
                        minWidth: coords.width,
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}
                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent closing immediately
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`px-4 py-2 cursor-pointer whitespace-nowrap transition-colors ${
                                option.value === value
                                    ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-900 dark:text-brand-100 font-medium'
                                    : 'text-industrial-700 dark:text-industrial-300 hover:bg-industrial-200 dark:hover:bg-industrial-800 hover:text-industrial-900 dark:hover:text-white'
                            }`}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
};

export const SystemConfigSection: React.FC = () => {
    // const { theme, setTheme } = useTheme(); // Removed for Dark Mode Lock

    const [refreshInterval, setRefreshInterval] = useState('10');
    const [tempUnit, setTempUnit] = useState('Celsius');

    useEffect(() => {
        const savedInterval = localStorage.getItem('settings_refresh_interval');
        if (savedInterval) setRefreshInterval(savedInterval);

        const savedUnit = localStorage.getItem('settings_temp_unit');
        if (savedUnit) setTempUnit(savedUnit);
    }, []);

    const handleIntervalChange = (val: string) => {
        setRefreshInterval(val);
        localStorage.setItem('settings_refresh_interval', val);
        window.dispatchEvent(new CustomEvent('settingsChanged', { detail: { refreshInterval: val } }));
    };

    const handleUnitChange = (val: string) => {
        setTempUnit(val);
        localStorage.setItem('settings_temp_unit', val);
        window.dispatchEvent(new CustomEvent('settingsChanged', { detail: { tempUnit: val } }));
    };

    return (
        <div className="card p-6 h-full">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-industrial-200 dark:border-industrial-700">
            <SettingsIcon className="text-brand-600 dark:text-brand-400" size={20} />
            <h3 className="text-lg font-medium text-industrial-100 dark:text-industrial-50">
              System Configuration
            </h3>
          </div>



          {/* Other Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-industrial-700 dark:text-industrial-300">
                Refresh Interval
              </label>
              <Dropdown 
                value={refreshInterval}
                onChange={handleIntervalChange}
                options={[
                    { value: "5", label: "5 Seconds" },
                    { value: "10", label: "10 Seconds" },
                    { value: "30", label: "30 Seconds" },
                    { value: "60", label: "1 Minute" }
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-industrial-700 dark:text-industrial-300">
                Temperature Unit
              </label>
               <Dropdown 
                value={tempUnit}
                onChange={handleUnitChange}
                options={[
                    { value: "Celsius", label: "Celsius (°C)" },
                    { value: "Fahrenheit", label: "Fahrenheit (°F)" }
                ]}
              />
            </div>
          </div>
        </div>
    );
};
