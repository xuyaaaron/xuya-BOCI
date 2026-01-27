/**
 * 自定义Hook：useIndicatorData
 * 用于获取指标数据
 */

import { useState, useEffect } from 'react';
import { dataService, IndicatorData } from '../services/dataService';
import { SubTab } from '../types';

interface UseIndicatorDataOptions {
    moduleId: string;
    indicatorId: string | SubTab;
    startDate?: string;
    endDate?: string;
    enabled?: boolean;
}

interface UseIndicatorDataResult {
    data: IndicatorData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

/**
 * 使用指标数据的Hook
 */
export function useIndicatorData(options: UseIndicatorDataOptions): UseIndicatorDataResult {
    const { moduleId, indicatorId, startDate, endDate, enabled = true } = options;

    const [data, setData] = useState<IndicatorData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        if (!enabled) return;

        setLoading(true);
        setError(null);

        try {
            let result: IndicatorData;

            // 根据模块ID调用不同的API
            if (moduleId === 'bociasi') {
                result = await dataService.getBOCIASIIndicatorData(
                    indicatorId as string,
                    startDate,
                    endDate
                );
            } else if (moduleId === 'wind_2x_erp') {
                result = await dataService.getWind2XERPData(startDate, endDate);
            } else {
                throw new Error(`未知的模块ID: ${moduleId}`);
            }

            setData(result);
        } catch (err) {
            setError(err as Error);
            console.error('获取指标数据失败:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [moduleId, indicatorId, startDate, endDate, enabled]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
}
