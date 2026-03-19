import React from "react";
import { ChevronDown } from "lucide-react";
import { US_LOCATIONS } from "../lib/us-locations";
import { cn } from "../lib/utils";

interface LocationSelectProps {
  selectedState: string;
  selectedCity: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export const LocationSelect = ({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  disabled,
  className,
  compact = false,
}: LocationSelectProps) => {
  const labelClasses = compact 
    ? "text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1"
    : "text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1";
    
  const selectClasses = compact
    ? "w-full appearance-none px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-sm"
    : "w-full appearance-none bg-white border border-gray-200 px-5 py-3.5 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-gray-700";

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      <div className="space-y-1.5">
        <label className={labelClasses}>State</label>
        <div className="relative">
          <select
            disabled={disabled}
            value={selectedState}
            onChange={(e) => {
              onStateChange(e.target.value);
              onCityChange("");
            }}
            className={cn(selectClasses, "disabled:bg-gray-100 disabled:text-gray-400")}
          >
            <option value="">Select State</option>
            {Object.keys(US_LOCATIONS).sort().map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none w-4 h-4" />
        </div>
      </div>
      
      <div className="space-y-1.5">
        <label className={labelClasses}>City</label>
        <div className="relative">
          <select
            disabled={disabled || !selectedState}
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className={cn(selectClasses, "disabled:bg-gray-100 disabled:text-gray-400")}
          >
            <option value="">Select City</option>
            {selectedState &&
              US_LOCATIONS[selectedState].sort().map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
