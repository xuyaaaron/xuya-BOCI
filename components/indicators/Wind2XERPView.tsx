
import React, { useState, useEffect } from 'react';
import { ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Legend, ReferenceDot, Brush } from 'recharts';
import { WindDataService } from '../../services/windDataService';
import { IndicatorWrapper } from './IndicatorWrapper';

export const Wind2XERPView: React.FC<{ onHeaderDataUpdate: (data: any) => void }> = ({ onHeaderDataUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await WindDataService.getIndicatorData('WIND_2X_ERP');
        if (res && res.data) {
          setOriginalData(res.data);
          const sorted = [...res.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setChartData(sorted);
          setMetrics(res.metrics);
          onHeaderDataUpdate({
            title: "万得全A “2X” ERP 模型",
            metrics: res.metrics,
            subtitle: ""
          });
        }
      } catch (err) {
        console.error("Load failed", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const latestRow = originalData.length > 0 ? originalData[0] : null;
  const prevRow = originalData.length > 1 ? originalData[1] : null;

  const renderChange = (current: number, prev: number | undefined, isPercentageReading: boolean = false) => {
    if (prev === undefined || prev === 0) return null;
    const diff = current - prev;
    const isUp = diff >= 0;
    const colorClass = isUp ? 'text-red-600' : 'text-green-600';
    const arrow = isUp ? '↑' : '↓';

    // 对于 ERP 读数，直接显示差值（保留两位小数）
    // 对于 收盘价，显示百分比变动
    const displayValue = isPercentageReading
      ? Math.abs(diff).toFixed(2)
      : `${((Math.abs(diff) / Math.abs(prev)) * 100).toFixed(2)}%`;

    return (
      <span className={`text-[10px] font-bold ${colorClass} ml-2 whitespace-nowrap`}>
        {arrow} {displayValue}
      </span>
    );
  };

  return (
    <IndicatorWrapper
      title="万得全A “2X” ERP 模型"
      subtitle=""
      loading={loading}
      metrics={metrics}
      footerNote={`Row 2-5117 | 最新收盘价：${latestRow?.close || '-'}`}
    >
      <div className="w-full flex flex-col gap-6">
        {!loading && latestRow && (
          <div className="mx-4 mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-900 px-4 py-2 flex items-center">
              <span className="text-[11px] font-black text-white uppercase tracking-widest">WIND API 实时数据调取检验</span>
            </div>

            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-6 bg-blue-50/50">
              <div className="space-y-1 border-r border-gray-100">
                <p className="text-[10px] font-bold text-gray-400">最新日期</p>
                <p className="text-lg font-black text-gray-900 font-mono tracking-tight">{latestRow.date}</p>
              </div>
              <div className="space-y-1 border-r border-gray-100">
                <p className="text-[10px] font-bold text-gray-400">ERP读数</p>
                <div className="flex items-baseline">
                  <p className="text-xl font-black text-red-700 font-mono tracking-tight">
                    {typeof latestRow.erp === 'number' ? latestRow.erp.toFixed(2) : latestRow.erp}
                  </p>
                  {prevRow && typeof latestRow.erp === 'number' && typeof prevRow.erp === 'number' && renderChange(latestRow.erp, prevRow.erp, true)}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400">当期万得全A收盘价</p>
                <div className="flex items-baseline">
                  <p className="text-xl font-black text-gray-900 font-mono tracking-tight">{latestRow.close}</p>
                  {prevRow && renderChange(latestRow.close, prevRow.close)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ width: '100%', height: 500 }}>
          <ResponsiveContainer>
            <ComposedChart data={chartData} margin={{ top: 30, right: 15, left: -10, bottom: 40 }}>
              <defs>
                <linearGradient id="erpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" height={50} axisLine={true} tickLine={true} tick={{ fontSize: 9, fill: '#94a3b8' }} minTickGap={100} tickFormatter={(v) => {
                try {
                  const date = new Date(v);
                  const yy = date.getFullYear().toString().slice(-2);
                  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
                  return `${yy}-${mm}`;
                } catch (e) { return v; }
              }} />

              {/* ERP 读数不使用 % 呈现，且不乘以100 */}
              <YAxis yAxisId="left" orientation="left" reversed={true} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#dc2626', fontWeight: 'bold' }} domain={['auto', 'auto']} tickFormatter={(v) => (typeof v === 'number' ? v.toFixed(2) : v)} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} tickFormatter={(v) => v.toLocaleString()} />

              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} labelFormatter={(label) => label} formatter={(value: any, name: string) => {
                if (name === "ERP") return [value.toFixed(2), name];
                if (typeof value === 'number') return [value.toLocaleString(), name];
                return [value, name];
              }} />
              <Legend verticalAlign="top" align="right" height={36} wrapperStyle={{ fontSize: '11px', paddingBottom: '20px' }} />

              <Area yAxisId="left" type="monotone" dataKey="erp" stroke="#dc2626" strokeWidth={2} fill="url(#erpGrad)" name="ERP" dot={false} isAnimationActive={false} />
              <Line yAxisId="left" type="monotone" dataKey="avg" stroke="#475569" strokeDasharray="3 3" dot={false} strokeWidth={1} name="3年滚动均值" connectNulls={true} />

              {/* +1X / -1X: Purple Dashed */}
              <Line yAxisId="left" type="monotone" dataKey="sd1_up" stroke="#a855f7" strokeDasharray="3 3" dot={false} strokeWidth={1} name="+1X" connectNulls={true} />
              <Line yAxisId="left" type="monotone" dataKey="sd1_low" stroke="#a855f7" strokeDasharray="3 3" dot={false} strokeWidth={1} name="-1X" connectNulls={true} />

              {/* +2X: Yellow Dashed */}
              <Line yAxisId="left" type="monotone" dataKey="sd2_up" stroke="#fbbf24" strokeDasharray="5 5" dot={false} strokeWidth={2} name="+2X" connectNulls={true} />

              {/* -2X: Green Dashed */}
              <Line yAxisId="left" type="monotone" dataKey="sd2_low" stroke="#16a34a" strokeDasharray="5 5" dot={false} strokeWidth={2} name="-2X" connectNulls={true} />

              <Line yAxisId="right" type="monotone" dataKey="close" stroke="#94a3b8" strokeWidth={1} strokeOpacity={0.4} dot={false} name="万得全A" isAnimationActive={false} connectNulls={true} />

              {latestRow && (
                <ReferenceDot yAxisId="left" x={latestRow.date} y={latestRow.erp} r={5} fill="#dc2626" stroke="white" strokeWidth={2.5} />
              )}
              <Brush dataKey="date" height={30} stroke="#8884d8" tickFormatter={(v) => {
                try {
                  const d = new Date(v);
                  const yy = d.getFullYear().toString().slice(-2);
                  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
                  return `${yy}-${mm}`;
                } catch { return ''; }
              }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </IndicatorWrapper>
  );
};
