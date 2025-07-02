import { IDataService } from '../types';

export interface TurtleSetup {
  ticker: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  stop: number;
  timeframe: string;
}

export interface TurtleSearchParams {
  ticker: string;
  candles: any[];
  timeframe: string;
  dataService: IDataService;
}

export class TurtleStrategy {
  static key = 'turtle';
  static label = 'Черепашки';

  static async search({ ticker, candles, timeframe }: TurtleSearchParams): Promise<TurtleSetup | null> {
    if (candles.length < 30) return null;

    // Адаптивные периоды в зависимости от таймфрейма
    const period20 = timeframe === 'minute' ? 20 : timeframe === 'hour' ? 20 : 20;
    const period10 = timeframe === 'minute' ? 10 : timeframe === 'hour' ? 10 : 10;
    
    // Анализ последних свечей (минимум 30)
    const recentCandles = candles.slice(-Math.max(30, period20 + 10));
    
    // Находим high20 и low20 за последние period20 баров
    const last20 = recentCandles.slice(-period20);
    const high20 = Math.max(...last20.map(c => c.high));
    const low20 = Math.min(...last20.map(c => c.low));
    
    // Находим стопы за последние period10 баров
    const last10 = recentCandles.slice(-period10);
    const longStop = Math.min(...last10.map(c => c.close));
    const shortStop = Math.max(...last10.map(c => c.close));
    
    const currentPrice = recentCandles[recentCandles.length - 1].close;
    
    // Проверяем условия входа
    if (currentPrice >= high20) {
      return {
        ticker,
        type: 'LONG',
        entry: currentPrice,
        stop: longStop,
        timeframe
      };
    }
    
    if (currentPrice <= low20) {
      return {
        ticker,
        type: 'SHORT',
        entry: currentPrice,
        stop: shortStop,
        timeframe
      };
    }
    
    return null;
  }
} 