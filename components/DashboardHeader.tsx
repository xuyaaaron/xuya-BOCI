
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
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-auto md:h-[64px] flex flex-col md:flex-row md:items-end justify-between pb-3 pt-3 md:pt-0">
        <div className="flex items-center justify-between w-full md:w-auto mb-3 md:mb-0">
          <div className="flex items-center gap-4">
            <img src={`${import.meta.env.BASE_URL}boci-logo.png`} alt="BOCI Logo" className="w-8 h-8 object-contain mb-0.5" />
            <div className="flex flex-col">
              <div className="flex items-center text-[#333333]">
                <h1 className="text-xl font-bold tracking-tight leading-none">中银策略</h1>
                <span className="mx-2 text-gray-300 font-light">|</span>
                <span className="text-sm font-bold tracking-wider uppercase">BOCI STRATEGY</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium tracking-tight mt-0.5">Interesting Datasets</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end w-full md:w-auto gap-4 md:gap-8 text-[11px] text-gray-400 font-medium mb-0.5">
          <div className="flex items-center gap-1.5 transition-colors cursor-default whitespace-nowrap">
            <span className="material-symbols-outlined text-[14px]">call</span>
            <div className="flex flex-col md:flex-row md:gap-1">
              <span>联系电话：王君/徐亚</span>
              <span>13636405358</span>
            </div>
          </div>
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
                  // 尝试调用本地后端
                  const response = await fetch('http://127.0.0.1:8000/api/admin/update', {
                    method: 'POST'
                  });

                  if (response.ok) {
                    alert("✅ 已成功触发后台更新任务！\n\n程序正在后台运行：\n1. 更新Excel\n2. 同步到GitHub\n\n请等待约2-3分钟后，GitHub会自动重新部署网页。");
                  } else {
                    throw new Error("后端返回错误");
                  }
                } catch (e) {
                  alert("❌ 无法连接到本地后端服务。\n\n请确认您已在本地电脑启动了 Python 后端程序 (python -m uvicorn app.main:app)。\n\n如果您正在 GitHub Pages 上浏览此页面，请注意：网页无法直接控制您的电脑，必须在本地操作。");
                }

                WindDataService.clearCache();
              }
            }}
            className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-all active:scale-95 whitespace-nowrap"
            title="仅限本地使用：调用Wind终端更新数据并推送GitHub"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            <span className="border-b border-transparent hover:border-blue-200">点击更新</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Line */}
      <div className="h-auto min-h-[48px] max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex gap-4 md:gap-8 h-full border-b border-gray-100 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveMainTab(MainTab.BOCIASI)}
            className={`h-[48px] text-sm font-bold transition-all relative whitespace-nowrap flex-shrink-0 ${activeMainTab === MainTab.BOCIASI ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            BOCIASI 情绪指标
            {activeMainTab === MainTab.BOCIASI && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-700 rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveMainTab(MainTab.WIND_2X_ERP)}
            className={`h-[48px] text-sm font-bold transition-all relative whitespace-nowrap flex-shrink-0 ${activeMainTab === MainTab.WIND_2X_ERP ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            万得全A “2X” ERP
            {activeMainTab === MainTab.WIND_2X_ERP && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-700 rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Sub Tabs Line - ONLY for BOCIASI */}
      {activeMainTab === MainTab.BOCIASI && (
        <div className="h-auto min-h-[52px] bg-gray-50/50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-0 h-full flex items-center">
            <div className="flex flex-nowrap md:flex-wrap items-center gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0 w-full">
              {SUB_TABS_CONFIG.map((tab) => {
                const isActive = activeSubTab === tab.id;

                // 基础样式
                let btnBase = "rounded-full font-bold border transition-all shadow-sm whitespace-nowrap flex-shrink-0 ";
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
                      <div className="w-px h-6 bg-gray-300 mx-4 flex-shrink-0" />
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
