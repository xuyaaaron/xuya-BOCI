
export enum MainTab {
  BOCIASI = 'BOCIASI',
  WIND_2X_ERP = 'WIND_2X_ERP'
}

export enum SubTab {
  OVERVIEW = 'OVERVIEW',
  EQUITY_PREMIUM = 'EQUITY_PREMIUM',
  EB_POSITION_GAP = 'EB_POSITION_GAP',
  EB_YIELD_GAP = 'EB_YIELD_GAP',
  MARGIN_BALANCE = 'MARGIN_BALANCE',
  SLOW_LINE = 'SLOW_LINE',
  MA20 = 'MA20',
  TURNOVER = 'TURNOVER',
  UP_DOWN_RATIO = 'UP_DOWN_RATIO',
  RSI = 'RSI',
  FAST_LINE = 'FAST_LINE'
}

export interface DataPoint {
  date: string;
  value: number;
  close?: number;
  erp?: number;
  avg?: number;
  sd1_up?: number;
  sd1_low?: number;
  sd2_up?: number;
  sd2_low?: number;
  // BOCIASI specific
  fast_line?: number;
  slow_line?: number;
  equity_premium?: number;
  eb_position_gap?: number;
  eb_yield_gap?: number;
  margin_balance?: number;
  ma20?: number;
  turnover?: number;
  up_down_ratio?: number;
  rsi?: number;
  line_green?: number;
  line_black?: number;
  line_yellow?: number;
  marker_red?: number;
  marker_green?: number;
  marker_fast_buy?: number;
  marker_fast_sell?: number;
}

export interface IndicatorMetrics {
  current_value: string;
  percentile_5y: string;
  change_weekly: string;
  status: 'Attractive' | 'Neutral' | 'Caution';
  description: string;
}
