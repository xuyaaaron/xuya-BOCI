
import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from 'recharts';
import { WindDataService } from '../../services/windDataService';
import { IndicatorWrapper } from './IndicatorWrapper';

export const BociasiOverviewView: React.FC<{ onHeaderDataUpdate: (data: any) => void }> = ({ onHeaderDataUpdate }) => {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);
    const [originalData, setOriginalData] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await WindDataService.getIndicatorData('overview');
                if (res && res.data) {
                    setOriginalData(res.data);
                    const sorted = [...res.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    setChartData(sorted);
                    setMetrics(res.metrics);
                    onHeaderDataUpdate({
                        title: "BOCIASI 情绪指标 - 快线+慢线综合总览",
                        metrics: res.metrics,
                        subtitle: ""
                    });
                }
            } catch (err) {
                console.error("Failed to load overview data", err);
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

    const getThresholdValue = (row: any, type: 'slow' | 'fast') => {
        const di = row.di_signal;
        if (type === 'slow') {
            if (di === 1) return row.slow_threshold_1;
            if (di === 0) return row.slow_threshold_0;
            if (di === -1) return row.slow_threshold_neg1;
        } else {
            if (di === 1) return row.fast_threshold_1;
            if (di === 0) return row.fast_threshold_0;
            if (di === -1) return row.fast_threshold_neg1;
        }
        return null;
    };

    const SquareShape = (props: any) => {
        const { cx, cy, fill } = props;
        if (!cx || !cy || isNaN(cx) || isNaN(cy)) return null;
        return <rect x={cx - 3} y={cy - 3} width={6} height={6} fill={fill} stroke="none" />;
    };

    const XShape = (props: any) => {
        const { cx, cy, stroke } = props;
        if (!cx || !cy || isNaN(cx) || isNaN(cy)) return null;
        const size = 3;
        return (
            <g transform={`translate(${cx},${cy}) rotate(45)`}>
                <line x1={-size} y1={0} x2={size} y2={0} stroke={stroke} strokeWidth={2} />
                <line x1={0} y1={-size} x2={0} y2={size} stroke={stroke} strokeWidth={2} />
            </g>
        );
    };

    return (
        <IndicatorWrapper
            title="BOCIASI 情绪指标 - 快线+慢线综合总览"
            subtitle=""
            loading={loading}
            metrics={metrics}
            footerNote="数据源: BOCIASIV2.xlsx (A2194+)"
        >
            <div className="w-full flex flex-col gap-6">
                {!loading && latestRow && (
                    <div className="mx-4 mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-gray-900 px-4 py-2 flex items-center">
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">WIND API 实时数据调取检验</span>
                        </div>
                        <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50/30">
                            <div className="space-y-1 border-r border-gray-100 pr-2">
                                <p className="text-[10px] font-bold text-gray-400">最新日期</p>
                                <p className="text-sm font-black text-gray-900 font-mono italic">{latestRow.date}</p>
                            </div>
                            <div className="space-y-1 border-r border-gray-100 pr-2">
                                <p className="text-[10px] font-bold text-gray-400">慢线读数/阈值</p>
                                <div className="flex flex-col">
                                    <div className="flex items-baseline">
                                        <p className="text-lg font-black text-[#E38087] font-mono">
                                            {latestRow.slow_line !== undefined ? `${(latestRow.slow_line * 100).toFixed(2)}%` : 'N/A'}
                                        </p>
                                        {latestRow.slow_line !== undefined && prevRow?.slow_line !== undefined && renderChange(latestRow.slow_line, prevRow.slow_line, true)}
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                        阈值: {getThresholdValue(latestRow, 'slow') !== null ? `${(getThresholdValue(latestRow, 'slow')! * 100).toFixed(2)}%` : '--'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1 border-r border-gray-100 pr-2">
                                <p className="text-[10px] font-bold text-gray-400">快线读数/阈值</p>
                                <div className="flex flex-col">
                                    <div className="flex items-baseline">
                                        <p className="text-lg font-black text-[#ADB9CA] font-mono">
                                            {latestRow.fast_line !== undefined ? `${(latestRow.fast_line * 100).toFixed(2)}%` : 'N/A'}
                                        </p>
                                        {latestRow.fast_line !== undefined && prevRow?.fast_line !== undefined && renderChange(latestRow.fast_line, prevRow.fast_line, true)}
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                        阈值: {getThresholdValue(latestRow, 'fast') !== null ? `${(getThresholdValue(latestRow, 'fast')! * 100).toFixed(2)}%` : '--'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <p className="text-[10px] font-bold text-gray-400">当期万得全A收盘价</p>
                                <div className="flex items-baseline">
                                    <p className="text-lg font-black text-gray-800 font-mono">
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

                <div style={{ width: '100%', height: 650 }}>
                    <ResponsiveContainer>
                        <ComposedChart data={chartData} margin={{ top: 30, right: 30, left: -10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" height={50} axisLine={true} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} minTickGap={100} />

                            <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} tickFormatter={(v) => `${(v * 100).toFixed(2)}%`} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} tickFormatter={(v) => v.toLocaleString()} />

                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                                formatter={(value: any, name: string) => {
                                    if (name.includes("线")) return [`${(value * 100).toFixed(2)}%`, name];
                                    if (typeof value === 'number') return [value.toLocaleString(), name];
                                    return [value, name];
                                }}
                            />
                            <Legend verticalAlign="top" align="right" height={36} wrapperStyle={{ fontSize: '10px', paddingBottom: '20px' }} />

                            <Line yAxisId="right" type="monotone" dataKey="line_green" name="收盘价-下行市" stroke="#84cc16" strokeWidth={1} dot={false} connectNulls={false} />
                            <Line yAxisId="right" type="monotone" dataKey="line_black" name="收盘价-震荡市" stroke="#000000" strokeWidth={1} dot={false} connectNulls={false} />
                            <Line yAxisId="right" type="monotone" dataKey="line_yellow" name="收盘价-上行市" stroke="#facc15" strokeWidth={1} dot={false} connectNulls={false} />

                            <Line yAxisId="left" type="monotone" dataKey="fast_line" name="快线" stroke="#ADB9CA" strokeWidth={0.5} strokeOpacity={0.6} dot={false} connectNulls={true} />
                            <Line yAxisId="left" type="monotone" dataKey="slow_line" name="慢线" stroke="#E38087" strokeWidth={1.5} dot={false} connectNulls={true} />

                            <Line yAxisId="right" dataKey="marker_red" name="慢线Buy信号" stroke="none" dot={<SquareShape fill="#dc2626" />} connectNulls={true} isAnimationActive={false} />
                            <Line yAxisId="right" dataKey="marker_green" name="慢线Sell信号" stroke="none" dot={<SquareShape fill="#16a34a" />} connectNulls={true} isAnimationActive={false} />
                            <Line yAxisId="right" dataKey="marker_fast_buy" name="快线Buy信号" stroke="none" dot={<XShape stroke="#f87171" />} connectNulls={true} isAnimationActive={false} />
                            <Line yAxisId="right" dataKey="marker_fast_sell" name="快线Sell信号" stroke="none" dot={<XShape stroke="#4ade80" />} connectNulls={true} isAnimationActive={false} />

                            <Brush dataKey="date" height={30} stroke="#cbd5e1" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </IndicatorWrapper>
    );
};
