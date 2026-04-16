/**
 * Date Range Selector Component
 * UI component for selecting predefined or custom date ranges
 */

import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { dateRangeOptions, DateRange, formatDateDisplay } from '../utils/dashboardUtils';

interface DateRangeSelectorProps {
  onRangeChange: (range: DateRange) => void;
  defaultRange?: keyof typeof dateRangeOptions;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  onRangeChange,
  defaultRange = 'last7Days',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>(
    dateRangeOptions[defaultRange]()
  );
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const handleSelectPreset = (presetKey: keyof typeof dateRangeOptions) => {
    const range = dateRangeOptions[presetKey]();
    setSelectedRange(range);
    onRangeChange(range);
    setIsOpen(false);
    setCustomStart('');
    setCustomEnd('');
  };

  const handleCustomRange = () => {
    if (customStart && customEnd) {
      const range: DateRange = {
        startDate: new Date(customStart),
        endDate: new Date(customEnd),
        label: `${formatDateDisplay(new Date(customStart))} - ${formatDateDisplay(new Date(customEnd))}`,
      };
      setSelectedRange(range);
      onRangeChange(range);
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e5e7eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
        }}
      >
        <Calendar size={16} />
        <span>{selectedRange.label}</span>
        <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            minWidth: '280px',
          }}
        >
          {/* Presets */}
          <div style={{ padding: '8px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', padding: '8px', margin: 0 }}>
              QUICK SELECT
            </p>
            {(Object.keys(dateRangeOptions) as Array<keyof typeof dateRangeOptions>).map((key) => (
              <button
                key={key}
                onClick={() => handleSelectPreset(key)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  backgroundColor: key === defaultRange ? '#dbeafe' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = key === defaultRange ? '#dbeafe' : 'transparent';
                }}
              >
                {dateRangeOptions[key]().label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />

          {/* Custom Range */}
          <div style={{ padding: '12px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0' }}>
              CUSTOM RANGE
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                onClick={handleCustomRange}
                disabled={!customStart || !customEnd}
                style={{
                  padding: '6px 12px',
                  backgroundColor: customStart && customEnd ? '#3b82f6' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: customStart && customEnd ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
