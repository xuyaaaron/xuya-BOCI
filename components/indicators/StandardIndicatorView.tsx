
import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from 'recharts';
import { WindDataService } from '../../services/windDataService';
import { IndicatorWrapper } from './IndicatorWrapper';

interface Props {
  subTabId: string;
  label: string;
  onHeaderDataUpdate: (data: any) => void;
}

export const StandardIndicatorView: React.FC<Props> = ({ subTabId, label, onHeaderDataUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await WindDataService.getIndicatorData(subTabId);
        if (res && res.data) {
          setOriginalData(res.data);
          const sorted = [...res.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setChartData(sorted);
          setMetrics(res.metrics);
          onHeaderDataUpdate({
            title: `BOCIASI 情绪指标 - ${label}`,
            metrics: res.metrics,
            subtitle: ""
          });
        }
      } catch (err) {
        console.error(`Failed to load ${subTabId}`, err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subTabId]);

  const latestRow = originalData.length > 0 ? originalData[0] : null;
  const prevRow = originalData.length > 1 ? originalData[1] : null;

  const renderChange = (current: number, prev: number | undefined, isPercentage: boolean = false) => {
    if (prev === undefined || prev === 0) return null;
    const diff = current - prev;
    const isUp = diff >= 0;
    const colorClass = isUp ? 'text-red-600' : 'text-green-600';
    const arrow = isUp ? '↑' : '↓';
    const displayValue = isPercentage
      ? `${(Math.abs(diff) * 100).toFixed(2)}%`
      : `${((Math.abs(diff) / Math.abs(prev)) * 100).toFixed(2)}%`;
    return (
      <span className={`text-[10px] font-bold ${colorClass} ml-2 whitespace-nowrap`}>
        {arrow} {displayValue}
      </span>
    );
  };

  return (
    <IndicatorWrapper
      title={`BOCIASI 情绪指标 - ${label}`}
      subtitle=""
      loading={loading}
      metrics={metrics}
      footerNote="数据源: BOCIASIV2.xlsx (Row 2194+)"
    >
      <div className="w-full flex flex-col gap-6">
        {!loading && latestRow && (
          <div className="mx-4 mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-900 px-4 py-2 flex items-center">
              <span className="text-[11px] font-black text-white uppercase tracking-widest">WIND API 实时数据调调取检验</span>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-6 bg-gray-50/50">
              <div className="space-y-1 border-r border-gray-100">
                <p className="text-[10px] font-bold text-gray-400">最新日期</p>
                <p className="text-lg font-black text-gray-900 font-mono italic">{latestRow.date}</p>
              </div>
              <div className="space-y-1 border-r border-gray-100">
                <p className="text-[10px] font-bold text-gray-400">{label}读数</p>
                <div className="flex items-baseline">
                  <p className="text-xl font-black text-[#E38087] font-mono">
                    {latestRow.value !== undefined ? `${(latestRow.value * 100).toFixed(2)}%` : '0.00%'}
                  </p>
                  {prevRow && renderChange(latestRow.value, prevRow.value, true)}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400">当期万得全A收盘价</p>
                <div className="flex items-baseline">
                  <p className="text-xl font-black text-gray-900 font-mono">
                    {latestRow.close?.toLocaleString() || '-'}
                  </p>
                  {renderChange(latestRow.close, prevRow?.close)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ width: '100%', height: 500 }}>
          <ResponsiveContainer>
            <ComposedChart data={chartData} margin={{ top: 30, right: 30, left: -10, bottom: 40 }}>
              <defs>
                <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E38087" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#E38087" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" height={50} axisLine={true} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} minTickGap={100} />

              <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#E38087', fontWeight: 'bold' }} domain={['auto', 'auto']} tickFormatter={(v) => `${(v * 100).toFixed(2)}%`} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB9CA' }} domain={['auto', 'auto']} tickFormatter={(v) => v?.toLocaleString()} />

              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                formatter={(value: any, name: string) => {
                  if (name === label) return [`${(value * 100).toFixed(2)}%`, name];
                  if (typeof value === 'number') return [value.toLocaleString(), name];
                  return [value, name];
                }}
              />
              <Legend verticalAlign="top" align="right" height={36} wrapperStyle={{ fontSize: '10px', paddingBottom: '20px' }} />

              <Line yAxisId="right" type="monotone" dataKey="close" name="收盘价" stroke="#ADB9CA" strokeWidth={1} dot={false} connectNulls={true} isAnimationActive={false} />

              <Area yAxisId="left" type="monotone" dataKey="value" name={label} stroke="#E38087" strokeWidth={2} fill="url(#valueGrad)" connectNulls={true} isAnimationActive={false} />
              <Brush dataKey="date" height={30} stroke="#cbd5e1" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </IndicatorWrapper>
  );
};
