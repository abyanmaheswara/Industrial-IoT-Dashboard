import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Sliders, Timer, Thermometer } from "lucide-react";

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const Dropdown: React.FC<DropdownProps> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, width: 0, align: "left" });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const alignRight = rect.left > window.innerWidth / 2;

      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        right: window.innerWidth - rect.right - window.scrollX,
        width: rect.width,
        align: alignRight ? "right" : "left",
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen]);

  const selectedLabel = options.find((o) => o.value === value)?.label || value;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex justify-between items-center rounded-xl border bg-industrial-950/60 border-white/5 text-white font-black text-[10px] uppercase tracking-widest focus:outline-none focus:border-brand-main/40 transition-all shadow-inner"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={14} className={`text-brand-main transform transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen &&
        createPortal(
          <div
            className="absolute bg-industrial-950 border border-white/10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] z-[99999] overflow-hidden backdrop-blur-2xl"
            style={{
              top: coords.top + 8,
              ...(coords.align === "left" ? { left: coords.left } : { right: coords.right }),
              minWidth: coords.width,
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-5 py-3.5 cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${
                  option.value === value ? "bg-brand-main/10 text-brand-main border-l-2 border-brand-main" : "text-industrial-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                {option.label}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};

export const SystemConfigSection: React.FC = () => {
  const [refreshInterval, setRefreshInterval] = useState("10");
  const [tempUnit, setTempUnit] = useState("Celsius");

  useEffect(() => {
    const savedInterval = localStorage.getItem("settings_refresh_interval");
    if (savedInterval) setRefreshInterval(savedInterval);

    const savedUnit = localStorage.getItem("settings_temp_unit");
    if (savedUnit) setTempUnit(savedUnit);
  }, []);

  const handleIntervalChange = (val: string) => {
    setRefreshInterval(val);
    localStorage.setItem("settings_refresh_interval", val);
    window.dispatchEvent(new CustomEvent("settingsChanged", { detail: { refreshInterval: val } }));
  };

  const handleUnitChange = (val: string) => {
    setTempUnit(val);
    localStorage.setItem("settings_temp_unit", val);
    window.dispatchEvent(new CustomEvent("settingsChanged", { detail: { tempUnit: val } }));
  };

  return (
    <div className="card-premium p-8 h-full bg-white/[0.01] border-white/5 flex flex-col justify-between">
      <div className="space-y-8">
        <div className="group">
          <div className="flex items-center gap-3 mb-4">
            <Timer size={14} className="text-brand-main opacity-50" />
            <label className="text-[10px] font-black text-industrial-500 uppercase tracking-widest">Telemetry Refresh Cycle</label>
          </div>
          <Dropdown
            value={refreshInterval}
            onChange={handleIntervalChange}
            options={[
              { value: "5", label: "05_SEC // HI_FREQ" },
              { value: "10", label: "10_SEC // OPTIMAL" },
              { value: "30", label: "30_SEC // ENERGY_SAVER" },
              { value: "60", label: "60_SEC // LOW_BANDWIDTH" },
            ]}
          />
          <p className="text-[8px] text-industrial-700 font-mono mt-3 uppercase tracking-widest italic leading-relaxed">System logic: Determines the polling frequency for all active hardware nodes.</p>
        </div>

        <div className="group">
          <div className="flex items-center gap-3 mb-4">
            <Thermometer size={14} className="text-brand-main opacity-50" />
            <label className="text-[10px] font-black text-industrial-500 uppercase tracking-widest">Thermal Metric Scaling</label>
          </div>
          <Dropdown
            value={tempUnit}
            onChange={handleUnitChange}
            options={[
              { value: "Celsius", label: "CELSIUS_INTERNAL (°C)" },
              { value: "Fahrenheit", label: "FAHRENHEIT_GLOBAL (°F)" },
            ]}
          />
          <p className="text-[8px] text-industrial-700 font-mono mt-3 uppercase tracking-widest italic leading-relaxed">Conversion engine: Affects all thermal telemetry displays and threshold calculations.</p>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-3 opacity-30">
        <Sliders size={12} className="text-brand-main" />
        <span className="text-[9px] font-black uppercase tracking-widest">Config_Engine_Locked</span>
      </div>
    </div>
  );
};
