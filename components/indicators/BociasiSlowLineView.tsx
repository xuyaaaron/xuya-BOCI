
import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush, ReferenceDot } from 'recharts';
import { WindDataService } from '../../services/windDataService';
import { IndicatorWrapper } from './IndicatorWrapper';

export const BociasiSlowLineView: React.FC<{ onHeaderDataUpdate: (data: any) => void }> = ({ onHeaderDataUpdate }) => {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);
    const [originalData, setOriginalData] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await WindDataService.getIndicatorData('slow_line');
                if (res && res.data) {
                    setOriginalData(res.data);
                    const sorted = [...res.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    setChartData(sorted);
                    setMetrics(res.metrics);
                    onHeaderDataUpdate({
                        title: "BOCIASI 情绪指标 - 慢线",
                        metrics: res.metrics,
                        subtitle: ""
                    });
                }
            } catch (err) {
                console.error("Failed to load slow line", err);
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

    const getSlowThreshold = (row: any) => {
        if (!row) return null;
        const di = row.di_signal;
        if (di === 1) return row.slow_threshold_1;
        if (di === 0) return row.slow_threshold_0;
        if (di === -1) return row.slow_threshold_neg1;
        return null;
    };

    const SquareShape = (props: any) => {
        const { cx, cy, fill } = props;
        if (!cx || !cy || isNaN(cx) || isNaN(cy)) return null;
        return <rect x={cx - 2.5} y={cy - 2.5} width={5} height={5} fill={fill} stroke="none" />;
    };

    return (
        <IndicatorWrapper
            title="BOCIASI 情绪指标 - 慢线"
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
                        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50/50">
                            <div className="space-y-1 border-r border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400">最新日期</p>
                                <p className="text-lg font-black text-gray-900 font-mono italic tracking-tight">{latestRow.date}</p>
                            </div>
                            <div className="space-y-1 border-r border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400">慢线读数</p>
                                <div className="flex items-baseline">
                                    <p className="text-xl font-black text-[#E38087] font-mono tracking-tight">{`${(latestRow.value * 100).toFixed(2)}%`}</p>
                                    {prevRow && renderChange(latestRow.value, prevRow.value, true)}
                                </div>
                            </div>
                            <div className="space-y-1 border-r border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400">慢线阈值</p>
                                <div className="flex items-baseline">
                                    <p className="text-xl font-black text-indigo-600 font-mono tracking-tight">
                                        {getSlowThreshold(latestRow) !== null ? `${(getSlowThreshold(latestRow)! * 100).toFixed(2)}%` : '--'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400">当期万得全A收盘价</p>
                                <div className="flex items-baseline">
                                    <p className="text-xl font-black text-gray-800 font-mono tracking-tight">
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

                            <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#E38087', fontWeight: 'bold' }} domain={['auto', 'auto']} tickFormatter={(v) => `${(v * 100).toFixed(2)}%`} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} tickFormatter={(v) => v.toLocaleString()} />

                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                formatter={(value: any, name: string) => {
                                    if (typeof value === 'number') {
                                        if (name.includes("慢线")) return [`${(value * 100).toFixed(2)}%`, name];
                                        return [value.toLocaleString(), name];
                                    }
                                    return [value, name];
                                }}
                            />
                            <Legend verticalAlign="top" align="right" height={36} wrapperStyle={{ fontSize: '11px', paddingBottom: '20px' }} />

                            <Line yAxisId="left" type="monotone" dataKey="value" name="慢线" stroke="#E38087" strokeWidth={1.5} dot={false} connectNulls={true} />

                            <Line yAxisId="right" type="monotone" dataKey="line_green" name="收盘价-下行市" stroke="#84cc16" strokeWidth={1} dot={false} connectNulls={false} />
                            <Line yAxisId="right" type="monotone" dataKey="line_black" name="收盘价-震荡市" stroke="#000000" strokeWidth={1} dot={false} connectNulls={false} />
                            <Line yAxisId="right" type="monotone" dataKey="line_yellow" name="收盘价-上行市" stroke="#facc15" strokeWidth={1} dot={false} connectNulls={false} />

                            <Line yAxisId="right" dataKey="marker_red" name="慢线Buy信号" stroke="none" dot={<SquareShape fill="#dc2626" />} isAnimationActive={false} connectNulls={true} />
                            <Line yAxisId="right" dataKey="marker_green" name="慢线Sell信号" stroke="none" dot={<SquareShape fill="#16a34a" />} isAnimationActive={false} connectNulls={true} />

                            {latestRow && (
                                <ReferenceDot yAxisId="left" x={latestRow.date} y={latestRow.value} r={5} fill="#E38087" stroke="white" strokeWidth={2.5} />
                            )}
                            <Brush dataKey="date" height={30} stroke="#8884d8" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </IndicatorWrapper>
    );
};
