/**
 * 模块配置接口定义
 */

import { SubTab } from '../types';

export interface ModuleConfig {
    id: string;
    name: string;
    description: string;
    // 是否有子标签
    hasSubTabs: boolean;
    // 子标签列表（如果hasSubTabs为true）
    subTabs?: SubTabConfig[];
    // API端点前缀
    apiPrefix: string;
}

export interface SubTabConfig {
    id: SubTab;
    label: string;
    color: 'black' | 'red' | 'gray';
    description: string;
}
