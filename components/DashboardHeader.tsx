
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
    <header className="bg-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-[64px] flex items-end justify-between pb-3">
        <div className="flex items-center gap-4">
          <img src="/boci-logo.png" alt="BOCI Logo" className="w-8 h-8 object-contain mb-0.5" />
          <div className="flex flex-col">
            <div className="flex items-center text-[#333333]">
              <h1 className="text-xl font-bold tracking-tight leading-none">中银策略</h1>
              <span className="mx-2 text-gray-300 font-light">|</span>
              <span className="text-sm font-bold tracking-wider uppercase">BOCI STRATEGY</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium tracking-tight mt-0.5">Interesting Datasets</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[11px] text-gray-400 font-medium mb-0.5">
          <div className="flex items-center gap-1.5 hover:text-gray-600 transition-colors cursor-default">
            <span className="material-symbols-outlined text-[14px]">call</span>
            <span>联系电话：王君/徐亚 13636405358</span>
          </div>
          <button
            onClick={() => {
              const confirmUpdate = window.confirm("是否触发全量数据更新？\n(这将会运行 WIND API 脚本并更新 Excel 底稿)");
              if (confirmUpdate) {
                WindDataService.clearCache();
                alert("已触发后端更新任务并清除缓存。底稿正在同步中，请稍后刷新。");
              }
            }}
            className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            <span className="border-b border-transparent hover:border-blue-200">点击更新</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Line: Fixed 48px */}
      <div className="h-[48px] max-w-7xl mx-auto px-6">
        <div className="flex gap-8 h-full border-b border-gray-100">
          <button
            onClick={() => setActiveMainTab(MainTab.BOCIASI)}
            className={`h-full text-sm font-bold transition-all relative ${activeMainTab === MainTab.BOCIASI ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            BOCIASI 情绪指标
            {activeMainTab === MainTab.BOCIASI && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-700 rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveMainTab(MainTab.WIND_2X_ERP)}
            className={`h-full text-sm font-bold transition-all relative ${activeMainTab === MainTab.WIND_2X_ERP ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            万得全A “2X” ERP
            {activeMainTab === MainTab.WIND_2X_ERP && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-700 rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Sub Tabs Line - ONLY for BOCIASI: Fixed 52px */}
      {activeMainTab === MainTab.BOCIASI && (
        <div className="h-[52px] bg-gray-50/50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center">
            <div className="flex flex-wrap items-center gap-3">
              {SUB_TABS_CONFIG.map((tab) => {
                const isActive = activeSubTab === tab.id;

                // 基础样式
                let btnBase = "rounded-full font-bold border transition-all shadow-sm ";
                let btnSize = "px-3 py-1 text-[11px] ";
                let btnColors = "";

                if (tab.id === SubTab.OVERVIEW) {
                  btnSize = "px-5 py-2 text-[13px] ";
                  btnColors = isActive
                    ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-900";
                }
                else if (tab.id === SubTab.SLOW_LINE) {
                  btnSize = "px-4 py-1.5 text-[12px] ";
                  btnColors = isActive
                    ? "bg-red-700 text-white border-red-700 shadow-md"
                    : "bg-white text-red-700 border-red-200 hover:border-red-700";
                }
                else if (tab.id === SubTab.FAST_LINE) {
                  btnSize = "px-4 py-1.5 text-[12px] ";
                  btnColors = isActive
                    ? "bg-gray-100 text-gray-900 border-gray-300 shadow-md"
                    : "bg-white text-gray-400 border-gray-100 hover:border-gray-400";
                }
                else {
                  if (tab.color === 'red') {
                    btnColors = isActive
                      ? "bg-red-50 text-red-700 border-red-700"
                      : "bg-white text-red-700 border-red-200 hover:border-red-700 text-[10px]";
                  } else {
                    btnColors = isActive
                      ? "bg-gray-100 text-gray-600 border-gray-400"
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-400 text-[10px]";
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
                      <div className="w-px h-6 bg-gray-300 mx-4" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
