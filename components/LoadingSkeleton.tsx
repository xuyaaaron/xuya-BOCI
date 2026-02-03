/**
 * 加载骨架屏组件 - 用于数据加载时的占位显示
 */
import React from 'react';

interface LoadingSkeletonProps {
    type?: 'chart' | 'card' | 'table';
    message?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    type = 'chart',
    message = '正在加载数据...'
}) => {
    if (type === 'chart') {
        return (
            <div className="w-full animate-pulse">
                {/* 标题骨架 */}
                <div className="mb-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                </div>

                {/* 指标卡片骨架 */}
                <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                                <div className="h-8 bg-gray-300 rounded w-24"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 图表骨架 */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="text-center space-y-4">
                            {/* 加载动画 */}
                            <div className="inline-flex items-center justify-center">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-gray-200 border-t-boc-red rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-boc-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* 加载提示 */}
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-700">{message}</p>
                                <p className="text-xs text-gray-500">首次加载可能需要几秒钟...</p>
                            </div>

                            {/* 进度条 */}
                            <div className="w-64 mx-auto">
                                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-boc-red rounded-full animate-progress"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 添加动画样式 */}
                <style>{`
          @keyframes progress {
            0% {
              width: 0%;
              margin-left: 0%;
            }
            50% {
              width: 50%;
              margin-left: 25%;
            }
            100% {
              width: 0%;
              margin-left: 100%;
            }
          }
          .animate-progress {
            animation: progress 2s ease-in-out infinite;
          }
        `}</style>
            </div>
        );
    }

    if (type === 'card') {
        return (
            <div className="animate-pulse bg-white border border-gray-200 rounded-xl p-6">
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // table type
    return (
        <div className="animate-pulse bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex space-x-4">
                        <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                        <div className="flex-1 h-4 bg-gray-100 rounded"></div>
                        <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
