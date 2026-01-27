/**
 * 数据服务层
 * 封装所有数据API调用
 */

import { apiClient } from './api';
import { DataPoint, IndicatorMetrics } from '../types';

export interface IndicatorData {
    indicator_id: string;
    indicator_name: string;
    data_points: DataPoint[];
    metrics: IndicatorMetrics;
    last_update: string;
}

export interface IndicatorInfo {
    id: string;
    name: string;
    description: string;
    color: 'black' | 'red' | 'gray';
}

export interface ModuleInfo {
    id: string;
    name: string;
    description: string;
    indicators: IndicatorInfo[];
    enabled: boolean;
}

/**
 * 数据服务类
 */
export class DataService {
    /**
     * 获取所有模块列表
     */
    async getModules(): Promise<ModuleInfo[]> {
        const response = await apiClient.get<{ modules: ModuleInfo[]; total: number }>('/modules');
        return response.modules;
    }

    /**
     * 获取指定模块信息
     */
    async getModule(moduleId: string): Promise<ModuleInfo> {
        return apiClient.get<ModuleInfo>(`/modules/${moduleId}`);
    }

    /**
     * 获取BOCIASI指标数据
     */
    async getBOCIASIIndicatorData(
        indicatorId: string,
        startDate?: string,
        endDate?: string
    ): Promise<IndicatorData> {
        return apiClient.get<IndicatorData>(`/bociasi/${indicatorId}/data`, {
            start_date: startDate,
            end_date: endDate,
        });
    }

    /**
     * 获取BOCIASI指标统计
     */
    async getBOCIASIIndicatorMetrics(indicatorId: string): Promise<IndicatorMetrics> {
        return apiClient.get<IndicatorMetrics>(`/bociasi/${indicatorId}/metrics`);
    }

    /**
     * 获取Wind 2X ERP数据
     */
    async getWind2XERPData(startDate?: string, endDate?: string): Promise<IndicatorData> {
        return apiClient.get<IndicatorData>('/wind_2x_erp/data', {
            start_date: startDate,
            end_date: endDate,
        });
    }

    /**
     * 获取Wind 2X ERP统计
     */
    async getWind2XERPMetrics(): Promise<IndicatorMetrics> {
        return apiClient.get<IndicatorMetrics>('/wind_2x_erp/metrics');
    }
}

// 全局数据服务实例
export const dataService = new DataService();
