export interface Candle {
  begin: string;
  open: number;
  close: number;
  high: number;
  low: number;
  x: number;
  volume?: number;
  sma18?: number;
  sma50?: number;
}

export interface AnalysisResult {
  ticker: string;
  candles: Candle[];
  type?: 'long' | 'short' | 'bullish' | 'bearish' | 'gold' | 'death';
  signal?: 'LONG' | 'SHORT';
  entry?: number;
  stop?: number;
  sl?: number;
  tp?: number;
  count?: number;
  sma18?: number;
  sma50?: number;
  sma365?: number;
  acceleration?: number;
  a?: number;
  b?: number;
  c?: number;
  close?: number;
  high?: number;
  max30?: number;
  over?: number;
  t?: number;
}

export interface YScale {
  min: string;
  max: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface AnalysisSetup {
  name: string;
  description: string;
  algorithm: string;
}

export interface ChartConfig {
  width: string;
  height: number;
  showSMA: boolean;
  showVolume: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  fetchData: (ticker: string, from?: string, till?: string, interval?: number, limit?: number) => Promise<Candle[]>;
}

// Новые интерфейсы для лучшего разделения ответственности
export interface IDataService {
  id: string;
  name: string;
  fetchData(ticker: string, from?: string, till?: string, interval?: number, limit?: number): Promise<Candle[]>;
  parseCSV(text: string): Record<string, Candle[]>;
}

export interface IAnalysisStrategy {
  name: string;
  analyze(candles: Candle[], ticker: string): AnalysisResult[];
}

export interface IAnalysisService {
  registerStrategy(strategy: IAnalysisStrategy): void;
  getStrategy(name: string): IAnalysisStrategy | undefined;
  getAllStrategies(): IAnalysisStrategy[];
  analyze(setupName: string, candles: Candle[], ticker: string): Promise<AnalysisResult[]>;
  analyzeAll(setupName: string, data: Record<string, Candle[]>): Promise<Record<string, AnalysisResult[]>>;
}

export interface IChartRenderer {
  render(candles: Candle[], config: ChartConfig): void;
}

export interface IDataProvider {
  getData(): Record<string, Candle[]>;
  isLoading(): boolean;
  getError(): string | null;
}

export interface IAnalysisProvider {
  isAnalyzing(): boolean;
  getProgress(): number;
  getCurrentTicker(): string | null;
  getResults(): AnalysisResult[] | Record<string, AnalysisResult[]> | null;
  runAnalysis(setup: string, data: Record<string, Candle[]>, csvTicker?: string): Promise<AnalysisResult[]>;
  runAllAnalysis(data: Record<string, Candle[]>, csvTicker?: string): Promise<Record<string, AnalysisResult[]>>;
}

export interface ISetupStrategy {
  key: string;
  label: string;
  search: (params: {
    ticker: string;
    candles: Candle[];
    timeframe: string;
    dataService: any;
  }) => Promise<SetupResult | null>;
}

export interface SetupResult {
  ticker: string;
  type: string;
  entry?: number;
  stop?: number;
  price?: number;
  crossIndex?: number;
  [key: string]: any;
} 