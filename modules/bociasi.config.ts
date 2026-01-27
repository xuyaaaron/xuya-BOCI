/**
 * BOCIASI模块配置
 */

import { ModuleConfig, SubTabConfig } from './types';
import { SubTab } from '../types';

// BOCIASI子标签配置
export const BOCIASI_SUB_TABS: SubTabConfig[] = [
    {
        id: SubTab.OVERVIEW,
        label: '总览',
        color: 'black',
        description: 'A股情绪综合总览'
    },
    {
        id: SubTab.EQUITY_PREMIUM,
        label: '股权溢价',
        color: 'red',
        description: '股票相对债券的风险溢价'
    },
    {
        id: SubTab.EB_POSITION_GAP,
        label: '股债位置差',
        color: 'red',
        description: '股债相对位置差异'
    },
    {
        id: SubTab.EB_YIELD_GAP,
        label: '股债收益差',
        color: 'red',
        description: '股债收益率差值'
    },
    {
        id: SubTab.MARGIN_BALANCE,
        label: '融资余额',
        color: 'red',
        description: '市场融资余额变化'
    },
    {
        id: SubTab.SLOW_LINE,
        label: '慢线',
        color: 'red',
        description: '情绪慢速移动平均线'
    },
    {
        id: SubTab.MA20,
        label: 'MA20',
        color: 'gray',
        description: '20日移动平均线'
    },
    {
        id: SubTab.TURNOVER,
        label: '换手率',
        color: 'gray',
        description: '市场换手率指标'
    },
    {
        id: SubTab.UP_DOWN_RATIO,
        label: '涨跌停比',
        color: 'gray',
        description: '涨停跌停家数比'
    },
    {
        id: SubTab.RSI,
        label: 'RSI',
        color: 'gray',
        description: '相对强弱指标'
    },
    {
        id: SubTab.FAST_LINE,
        label: '快线',
        color: 'gray',
        description: '情绪快速移动平均线'
    },
];

// BOCIASI模块配置
export const BOCIASI_MODULE: ModuleConfig = {
    id: 'bociasi',
    name: 'BOCIASI A股情绪指标',
    description: '中银国际证券A股情绪综合指标体系',
    hasSubTabs: true,
    subTabs: BOCIASI_SUB_TABS,
    apiPrefix: '/bociasi'
};
