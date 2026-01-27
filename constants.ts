
import { SubTab } from './types';

export const SUB_TABS_CONFIG = [
  { id: SubTab.OVERVIEW, label: '快线+慢线综合', color: 'black' },
  { id: SubTab.SLOW_LINE, label: '慢线', color: 'red' },
  { id: SubTab.FAST_LINE, label: '快线', color: 'gray' },
  { id: SubTab.EQUITY_PREMIUM, label: '股权溢价', color: 'red' },
  { id: SubTab.EB_POSITION_GAP, label: '股债位置差', color: 'red' },
  { id: SubTab.EB_YIELD_GAP, label: '股债收益差', color: 'red' },
  { id: SubTab.MARGIN_BALANCE, label: '融资余额', color: 'red' },
  { id: SubTab.MA20, label: 'MA20', color: 'gray' },
  { id: SubTab.TURNOVER, label: '换手率', color: 'gray' },
  { id: SubTab.UP_DOWN_RATIO, label: '涨跌停比', color: 'gray' },
  { id: SubTab.RSI, label: 'RSI', color: 'gray' },
];

export const TAB_LABELS = {
  BOCIASI: 'BOCIASI A股情绪指标',
  WIND_2X_ERP: '万得全A “2X” ERP'
};
