import { IDataService } from '../types';
import { calculateSMA } from '../utils/indicators';

export interface SmaSetup {
  ticker: string;
  type: 'GOLD' | 'DEATH';
  price: number;
  crossIndex: number;
  timeframe: string;
}

export interface SmaSearchParams {
  ticker: string;
  candles: any[];
  timeframe: string;
  dataService: IDataService;
}

export interface SmaCross {
  idx: number;
  date: string;
  price: number;
}

export class SmaStrategy {
  static key = 'sma';
  static label = 'Золотое сечение (SMA360/50)';

  static async search({ ticker, candles, timeframe }: SmaSearchParams): Promise<SmaSetup | null> {
    if (candles.length < 360) return null;

    // Берём только последние 360 баров для анализа
    const lastCandles = candles.slice(-360);
    const sma50 = calculateSMA(lastCandles, 50);
    const sma360 = calculateSMA(lastCandles, 360);

    // Поиск пересечения в последних 15 барах (относительно конца массива)
    for (let i = sma50.length - 15; i < sma50.length - 1; ++i) {
      if (!sma50[i] || !sma360[i] || !sma50[i+1] || !sma360[i+1]) continue;
      
      const prevDiff = sma50[i].value - sma360[i].value;
      const nextDiff = sma50[i+1].value - sma360[i+1].value;
      
      const tolerance = 0.0001;
      if (prevDiff * nextDiff < -tolerance) {
        const crossType = prevDiff < 0 ? 'GOLD' : 'DEATH';
        return {
          ticker,
          type: crossType,
          price: sma50[i+1].value,
          crossIndex: i+1 + (candles.length - lastCandles.length), // абсолютный индекс относительно исходного массива
          timeframe
        };
      }
    }
    
    return null;
  }

  static findCrosses(candles: any[]): SmaCross[] {
    if (candles.length < 360) return [];
    // Берём только последние 360 баров для анализа
    const lastCandles = candles.slice(-360);
    const sma50 = calculateSMA(lastCandles, 50);
    const sma360 = calculateSMA(lastCandles, 360);
    const crosses: SmaCross[] = [];
    // Поиск всех пересечений на последних 90 барах (относительно конца массива)
    for (let i = Math.max(1, sma50.length - 90); i < sma50.length; ++i) {
      if (!sma50[i] || !sma360[i] || !sma50[i-1] || !sma360[i-1]) continue;
      
      const prevDiff = sma50[i-1].value - sma360[i-1].value;
      const nextDiff = sma50[i].value - sma360[i].value;
      const tolerance = 0.0001;
      if (prevDiff * nextDiff < -tolerance) {
        crosses.push({ 
          idx: i + (candles.length - lastCandles.length), // абсолютный индекс относительно исходного массива
          date: candles[i + (candles.length - lastCandles.length)].begin, 
          price: sma50[i].value 
        });
      }
    }
    return crosses;
  }
} 