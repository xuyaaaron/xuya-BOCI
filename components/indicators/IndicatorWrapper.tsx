
import React from 'react';
import { IndicatorMetrics } from '../../types';
import { MetricCard } from '../MetricCard';
import { LoadingSkeleton } from '../LoadingSkeleton';

interface IndicatorWrapperProps {
  title: string;
  subtitle: string;
  loading: boolean;
  metrics: IndicatorMetrics | null;
  children: React.ReactNode;
  footerNote: string;
}

export const IndicatorWrapper: React.FC<IndicatorWrapperProps> = ({
  title, subtitle, loading, metrics, children, footerNote
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 overflow-visible">

      <div className="relative min-h-[450px] w-full border border-gray-50 rounded-xl bg-gray-50/30">
        {loading ? (
          <LoadingSkeleton type="chart" message="正在加载图表数据..." />
        ) : (
          children
        )}
      </div>

      <div className="mt-4 p-4 bg-gray-50 border-l-4 border-gray-900 rounded-r-xl">
        <p className="text-sm text-gray-600 leading-relaxed font-medium mb-2">
          <span className="font-bold text-gray-900">免责声明：</span>
          仅为客观数据，不代表分析师观点和投资建议，投资信息和风险提示以正式报告为准。本内容向特定客户发布
        </p>
        <p className="text-sm text-gray-600 font-bold">资料来源：万得，太平桥策略</p>
      </div>
    </div>
  );
};
