
import React, { useState } from 'react';
import { MainTab, SubTab, IndicatorMetrics } from './types';
import { SUB_TABS_CONFIG } from './constants';
import { DashboardHeader } from './components/DashboardHeader';
import { YieldGapView } from './components/indicators/YieldGapView';
import { Wind2XERPView } from './components/indicators/Wind2XERPView';
import { StandardIndicatorView } from './components/indicators/StandardIndicatorView';
import { BociasiSlowLineView } from './components/indicators/BociasiSlowLineView';
import { BociasiFastLineView } from './components/indicators/BociasiFastLineView';
import { BociasiOverviewView } from './components/indicators/BociasiOverviewView';

const App: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>(MainTab.BOCIASI);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(SubTab.OVERVIEW);
  const [headerData, setHeaderData] = useState<{ title?: string, metrics?: IndicatorMetrics | null, subtitle?: string }>({});

  // 渲染当前指标板块
  const renderIndicatorView = () => {
    // 修复点：直接指向专门的 2X ERP 视图组件
    if (activeMainTab === MainTab.WIND_2X_ERP) {
      return <Wind2XERPView onHeaderDataUpdate={(data: any) => setHeaderData(data)} />;
    }

    const commonProps = { onHeaderDataUpdate: (data: any) => setHeaderData(data) };

    switch (activeSubTab) {
      case SubTab.EB_YIELD_GAP:
        return <YieldGapView {...commonProps} />;
      case SubTab.SLOW_LINE:
        return <BociasiSlowLineView {...commonProps} />;
      case SubTab.FAST_LINE:
        return <BociasiFastLineView {...commonProps} />;
      case SubTab.OVERVIEW:
        return <BociasiOverviewView {...commonProps} />;
      default:
        const config = SUB_TABS_CONFIG.find(t => t.id === activeSubTab);
        return <StandardIndicatorView subTabId={activeSubTab} label={config?.label || ''} {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        activeMainTab={activeMainTab}
        setActiveMainTab={(tab) => {
          setActiveMainTab(tab);
          setHeaderData({}); // 清空以便重新加载
        }}
        activeSubTab={activeSubTab}
        setActiveSubTab={(tab) => {
          setActiveSubTab(tab);
          setHeaderData({}); // 清空以便重新加载
        }}
        indicatorTitle={headerData.title}
        indicatorMetrics={headerData.metrics}
        indicatorSubtitle={headerData.subtitle}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 pb-8 pt-0">

        {/* 动态渲染子板块 */}
        <div className="relative">
          {renderIndicatorView()}
        </div>
      </main>
    </div>
  );
};

export default App;
