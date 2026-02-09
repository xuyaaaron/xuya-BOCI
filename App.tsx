
import React, { useState } from 'react';
import { MainTab, SubTab, IndicatorMetrics } from './types';
import { SUB_TABS_CONFIG } from './constants';
import { DashboardHeader } from './components/DashboardHeader';
import { AdminConsole } from './components/AdminConsole';
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
  const [showAdminConsole, setShowAdminConsole] = useState(false);

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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 pb-2 pt-0">

        {/* 动态渲染子板块 */}
        <div className="relative">
          {renderIndicatorView()}
        </div>
      </main>

      {/* 管理员控制台 */}
      <AdminConsole
        show={showAdminConsole}
        onClose={() => setShowAdminConsole(false)}
      />

      {/* 管理员按钮（固定在右下角） */}
      <button
        onClick={() => setShowAdminConsole(true)}
        className="fixed bottom-6 right-6 bg-boc-red hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50"
        title="管理员控制台"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
};

export default App;
