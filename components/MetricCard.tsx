
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  subLabel?: string;
  footer?: string;
  isPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subValue, subLabel, footer, isPositive }) => (
  <div className="flex flex-col py-2">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</span>
      {subValue && (
        <span className={`text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {subValue}
        </span>
      )}
    </div>
    {(subLabel || footer) && (
      <p className="text-xs text-gray-500 mt-2 font-medium">
        {subLabel} <span className="text-red-700 font-bold">{footer}</span>
      </p>
    )}
  </div>
);
