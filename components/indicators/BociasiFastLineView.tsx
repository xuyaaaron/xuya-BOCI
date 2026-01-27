
import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush, ReferenceDot } from 'recharts';
import { WindDataService } from '../../services/windDataService';
import { IndicatorWrapper } from './IndicatorWrapper';

export const BociasiFastLineView: React.FC<{ onHeaderDataUpdate: (data: any) => void }> = ({ onHeaderDataUpdate }) => {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);
    const [originalData, setOriginalData] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await WindDataService.getIndicatorData('fast_line');
                if (res && res.data) {
                    setOriginalData(res.data);
                    const sorted = [...res.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    setChartData(sorted);
                    setMetrics(res.metrics);
                    onHeaderDataUpdate({
                        title: "BOCIASI 情绪指标 - 快线",
                        metrics: res.metrics,
                        subtitle: ""
                    });
                }
            } catch (err) {
                console.error("Failed to load fast line", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

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

    const getFastThreshold = (row: any) => {
        if (!row) return null;
        const di = row.di_signal;
        if (di === 1) return row.fast_threshold_1;
        if (di === 0) return row.fast_threshold_0;
        if (di === -1) return row.fast_threshold_neg1;
        return null;
    };

    const XShape = (props: any) => {
        const { cx, cy, stroke } = props;
        if (!cx || !cy || isNaN(cx) || isNaN(cy)) return null;
        const s = 3.5;
        return (
            <g>
                <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s} stroke={stroke} strokeWidth={2} />
                <line x1={cx - s} y1={cy + s} x2={cx + s} y2={cy - s} stroke={stroke} strokeWidth={2} />
            </g>
        );
    };

    return (
        <IndicatorWrapper
            title="BOCIASI 情绪指标 - 快线"
            subtitle=""
            loading={loading}
            metrics={metrics}
            footerNote="数据源: BOCIASIV2.xlsx (Row 2194+)"
        >
            <div className="w-full flex flex-col gap-6">
                {!loading && latestRow && (
                    <div className="mx-4 mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-gray-900 px-4 py-2 flex items-center">
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">WIND API 实时数据调取检验</span>
                        </div>
                        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50/50">
                            <div className="space-y-1 border-r border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400">最新日期</p>
                                <p className="text-lg font-black text-slate-900 font-mono tracking-tight">{latestRow.date}</p>
                            </div>
                            <div className="space-y-1 border-r border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400">快线读数</p>
                                <div className="flex items-baseline">
                                    <p className="text-xl font-black text-[#ADB9CA] font-mono tracking-tight">{`${(latestRow.value * 100).toFixed(2)}%`}</p>
                                    {prevRow && renderChange(latestRow.value, prevRow.value, true)}
                                </div>
                            </div>
                            <div className="space-y-1 border-r border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400">快线阈值</p>
                                <div className="flex items-baseline">
                                    <p className="text-xl font-black text-indigo-600 font-mono tracking-tight">
                                        {getFastThreshold(latestRow) !== null ? `${(getFastThreshold(latestRow)! * 100).toFixed(2)}%` : '--'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400">当期万得全A收盘价</p>
                                <div className="flex items-baseline">
                                    <p className="text-xl font-black text-gray-900 font-mono tracking-tight">
                                        {(latestRow.line_green || latestRow.line_black || latestRow.line_yellow || 0).toLocaleString()}
                                    </p>
                                    {renderChange(
                                        (latestRow.line_green || latestRow.line_black || latestRow.line_yellow || 0),
                                        (prevRow?.line_green || prevRow?.line_black || prevRow?.line_yellow || 0)
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ width: '100%', height: 600 }}>
                    <ResponsiveContainer>
                        <ComposedChart data={chartData} margin={{ top: 30, right: 15, left: -10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" height={50} axisLine={true} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} minTickGap={100} />

                            <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB9CA', fontWeight: 'bold' }} domain={['auto', 'auto']} tickFormatter={(v) => `${(v * 100).toFixed(2)}%`} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} tickFormatter={(v) => v.toLocaleString()} />

                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                formatter={(value: any, name: string) => {
                                    if (typeof value === 'number') {
                                        if (name.includes("快线")) return [`${(value * 100).toFixed(2)}%`, name];
                                        return [value.toLocaleString(), name];
                                    }
                                    return [value, name];
                                }}
                            />
                            <Legend verticalAlign="top" align="right" height={36} wrapperStyle={{ fontSize: '11px', paddingBottom: '20px' }} />

                            <Line yAxisId="left" type="monotone" dataKey="value" name="快线" stroke="#ADB9CA" strokeWidth={0.5} strokeOpacity={0.6} dot={false} connectNulls={true} />

                            <Line yAxisId="right" type="monotone" dataKey="line_green" name="收盘价-下行市" stroke="#84cc16" strokeWidth={1} dot={false} connectNulls={false} />
                            <Line yAxisId="right" type="monotone" dataKey="line_black" name="收盘价-震荡市" stroke="#000000" strokeWidth={1} dot={false} connectNulls={false} />
                            <Line yAxisId="right" type="monotone" dataKey="line_yellow" name="收盘价-上行市" stroke="#facc15" strokeWidth={1} dot={false} connectNulls={false} />

                            <Line yAxisId="right" dataKey="marker_fast_buy" name="快线Buy信号" stroke="none" dot={<XShape stroke="#f87171" />} isAnimationActive={false} connectNulls={true} />
                            <Line yAxisId="right" dataKey="marker_fast_sell" name="快线Sell信号" stroke="none" dot={<XShape stroke="#4ade80" />} isAnimationActive={false} connectNulls={true} />

                            {latestRow && (
                                <ReferenceDot yAxisId="left" x={latestRow.date} y={latestRow.value} r={5} fill="#ADB9CA" stroke="white" strokeWidth={2.5} />
                            )}
                            <Brush dataKey="date" height={30} stroke="#94a3b8" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </IndicatorWrapper>
    );
};
