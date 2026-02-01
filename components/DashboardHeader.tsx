
import React from 'react';
import { WindDataService } from '../services/windDataService';
import { MainTab, SubTab, IndicatorMetrics } from '../types';
import { SUB_TABS_CONFIG } from '../constants';

interface HeaderProps {
  activeMainTab: MainTab;
  setActiveMainTab: (tab: MainTab) => void;
  activeSubTab: SubTab;
  setActiveSubTab: (tab: SubTab) => void;
  indicatorTitle?: string;
  indicatorMetrics?: IndicatorMetrics | null;
  indicatorSubtitle?: string;
}

export const DashboardHeader: React.FC<HeaderProps> = ({
  activeMainTab, setActiveMainTab, activeSubTab, setActiveSubTab,
  indicatorTitle, indicatorMetrics, indicatorSubtitle
}) => {
  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm md:shadow-md transition-all duration-300">
      {/* Top Bar: Compact App Bar Style for Mobile */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-[56px] md:h-[64px] flex items-center justify-between">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3 md:gap-4">
          <img src={`${import.meta.env.BASE_URL}boci-logo.png`} alt="BOCI Logo" className="w-7 h-7 md:w-8 md:h-8 object-contain" loading="lazy" />
          <div className="flex flex-col">
            <div className="flex items-center text-[#333333]">
              <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none text-gray-900">中银策略</h1>
              <span className="hidden md:inline mx-2 text-gray-300 font-light">|</span>
              <span className="hidden md:inline text-sm font-bold tracking-wider uppercase">BOCI STRATEGY</span>
            </div>
            {/* Subtitle hidden on mobile for cleaner look */}
            <span className="hidden md:block text-[10px] text-gray-400 font-medium tracking-tight mt-0.5">Interesting Datasets</span>
          </div>
        </div>

        {/* Right: Actions (Icons on Mobile, Text on Desktop) */}
        <div className="flex items-center gap-3 md:gap-8">
          {/* Contact Button */}
          <button
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
            onClick={() => alert("联系电话：王君/徐亚 13636405358")}
            title="联系我们"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span className="text-[11px] font-medium">联系方式</span>
          </button>

          {/* Update Button */}
          <button
            onClick={async () => {
              const confirmUpdate = window.confirm(
                "是否触发全量数据更新？\n\n" +
                "注意：此功能仅在您本地电脑上运行后端服务时有效。\n" +
                "步骤：\n" +
                "1. 后端将调用 Wind API 获取最新数据\n" +
                "2. 更新 Excel 底稿\n" +
                "3. 生成静态快照并推送到 GitHub\n\n" +
                "确定要继续吗？"
              );

              if (confirmUpdate) {
                try {
                  const response = await fetch('http://127.0.0.1:8000/api/admin/update', { method: 'POST' });
                  if (response.ok) {
                    alert("✅ 已成功触发后台更新任务！请等待约2-3分钟后刷新网页。");
                  } else { throw new Error("Backend Error"); }
                } catch (e) {
                  alert("❌ 无法连接到本地后端服务 (http://127.0.0.1:8000)。\n请确保本地Python服务正在运行。");
                }
                WindDataService.clearCache();
              }
            }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-all active:scale-95"
            title="更新数据 (仅限本地)"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span className="text-[11px] font-medium border-b border-transparent hover:border-blue-200">点击更新</span>
          </button>
        </div>
      </div>

      {/* Main Tabs: Segmented Control Style on Mobile */}
      <div className="w-full border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex w-full md:gap-8 md:w-auto">
            {/* Tab 1 */}
            <button
              onClick={() => setActiveMainTab(MainTab.BOCIASI)}
              className={`flex-1 md:flex-none h-[44px] md:h-[48px] text-[13px] md:text-sm font-bold transition-all relative flex items-center justify-center
                ${activeMainTab === MainTab.BOCIASI ? 'text-gray-900 bg-gray-50 md:bg-transparent' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              BOCIASI 情绪指标
              {activeMainTab === MainTab.BOCIASI && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-700 rounded-t-full md:rounded-none"></div>
              )}
            </button>

            {/* Tab 2 */}
            <button
              onClick={() => setActiveMainTab(MainTab.WIND_2X_ERP)}
              className={`flex-1 md:flex-none h-[44px] md:h-[48px] text-[13px] md:text-sm font-bold transition-all relative flex items-center justify-center
                ${activeMainTab === MainTab.WIND_2X_ERP ? 'text-gray-900 bg-gray-50 md:bg-transparent' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              万得全A “2X” ERP
              {activeMainTab === MainTab.WIND_2X_ERP && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-700 rounded-t-full md:rounded-none"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs Line - Horizontal Scroll for Mobile */}
      {activeMainTab === MainTab.BOCIASI && (
        <div className="bg-gray-50/50 border-b border-gray-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center h-[48px] md:h-[52px] overflow-x-auto no-scrollbar mask-gradient-right">
              <div className="flex flex-nowrap items-center gap-2 md:gap-3 pr-4">
                {SUB_TABS_CONFIG.map((tab) => {
                  const isActive = activeSubTab === tab.id;

                  // 样式逻辑
                  let btnBase = "rounded-full font-bold border transition-all shadow-sm whitespace-nowrap flex-shrink-0 ";
                  // Mobile: Smaller padding/text, Desktop: Standard
                  let btnSize = "px-3 py-1 text-[11px] md:text-[11px] ";
                  let btnColors = "";

                  if (tab.id === SubTab.OVERVIEW) {
                    btnSize = "px-4 py-1.5 md:px-5 md:py-2 text-[12px] md:text-[13px] ";
                    btnColors = isActive
                      ? "bg-gray-900 text-white border-gray-900 shadow-md transform scale-105"
                      : "bg-white text-gray-700 border-gray-200";
                  }
                  else if (tab.id === SubTab.SLOW_LINE) {
                    btnSize = "px-3.5 py-1 md:px-4 md:py-1.5 text-[11px] md:text-[12px] ";
                    btnColors = isActive
                      ? "bg-red-700 text-white border-red-700 shadow-md"
                      : "bg-white text-red-700 border-red-200";
                  }
                  else if (tab.id === SubTab.FAST_LINE) {
                    btnSize = "px-3.5 py-1 md:px-4 md:py-1.5 text-[11px] md:text-[12px] ";
                    btnColors = isActive
                      ? "bg-gray-100 text-gray-900 border-gray-300 shadow-md"
                      : "bg-white text-gray-400 border-gray-100";
                  }
                  else {
                    if (tab.color === 'red') {
                      btnColors = isActive
                        ? "bg-red-50 text-red-700 border-red-700"
                        : "bg-white text-red-700 border-red-200";
                    } else {
                      btnColors = isActive
                        ? "bg-gray-100 text-gray-600 border-gray-400"
                        : "bg-white text-gray-400 border-gray-200";
                    }
                  }

                  return (
                    <React.Fragment key={tab.id}>
                      <button
                        onClick={() => setActiveSubTab(tab.id as SubTab)}
                        className={`${btnBase} ${btnSize} ${btnColors}`}
                      >
                        {tab.label}
                      </button>
                      {tab.id === SubTab.FAST_LINE && (
                        <div className="w-px h-5 bg-gray-300 mx-2 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
