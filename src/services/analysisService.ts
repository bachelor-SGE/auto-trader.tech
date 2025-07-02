import { Candle, AnalysisResult, IAnalysisStrategy, IAnalysisService } from '../types';
import { calculateSMA, isLowVolatility, getAccelerationDirection } from '../utils/indicators';

export interface AnalysisStrategy {
  name: string;
  analyze(candles: Candle[], ticker: string): AnalysisResult[];
}

export class TurtleStrategy implements AnalysisStrategy {
  name = 'Сетап черепашки';

  analyze(candles: Candle[], ticker: string): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    const bars = candles.slice(-30);
    const last20 = bars.slice(-20);
    const last10 = bars.slice(-10);
    const last = last20[last20.length - 1];
    
    if (!last) return results;

    const prevHigh = Math.max(...last20.slice(0, -1).map((c: Candle) => c.high));
    if (last.close > prevHigh) {
      const stop = Math.min(...last10.map((c: Candle) => c.low));
      results.push({ ticker, candles: last20, type: 'long', entry: last.close, stop });
      return results;
    }
    
    const prevLow = Math.min(...last20.slice(0, -1).map((c: Candle) => c.low));
    if (last.close < prevLow) {
      const stop = Math.max(...last10.map((c: Candle) => c.high));
      results.push({ ticker, candles: last20, type: 'short', entry: last.close, stop });
    }
    
    return results;
  }
}

export class LowVolatilityStrategy implements AnalysisStrategy {
  name = 'Сетап низк волотильности + мини-гепы вверх на 3-5 последних свечках';

  analyze(candles: Candle[], ticker: string): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    const bars = candles.slice(-30);
    
    for (let count = 5; count >= 3; count--) {
      const seq = bars.slice(-count);
      if (seq.length < count) continue;
      
      const lowVol = seq.every((c: Candle) => {
        const body = Math.abs(c.close - c.open) / c.open * 100;
        return body >= 0 && body <= 2;
      });
      
      if (!lowVol) continue;
      
      const allGreen = seq.every((c: Candle) => c.close > c.open);
      const allRed = seq.every((c: Candle) => c.close < c.open);
      
      let gapsOk = true;
      for (let j = 1; j < seq.length; ++j) {
        const gap = (seq[j].open - seq[j-1].close) / seq[j-1].close * 100;
        if (allGreen && (gap < 0.1 || gap > 1)) { gapsOk = false; break; }
        if (allRed && (gap > -0.1 || gap < -1)) { gapsOk = false; break; }
      }
      
      if (!gapsOk) continue;
      
      if (allGreen) {
        const stop = seq.length > 1 ? Math.min(seq[seq.length-2].low, seq[seq.length-1].low) : seq[seq.length-1].low;
        results.push({ ticker, candles: seq, type: 'long', entry: seq[seq.length-1].close, stop, count });
        break;
      }
      
      if (allRed) {
        const stop = seq.length > 1 ? Math.max(seq[seq.length-2].high, seq[seq.length-1].high) : seq[seq.length-1].high;
        results.push({ ticker, candles: seq, type: 'short', entry: seq[seq.length-1].close, stop, count });
        break;
      }
    }
    
    return results;
  }
}

export class GlideStrategy implements AnalysisStrategy {
  name = 'Сетап глиссада v2';

  analyze(candles: Candle[], ticker: string): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    const bars = candles.slice(-50);
    
    if (!bars || bars.length < 50) return results;

    const sma18 = calculateSMA(bars, 18);
    const sma50 = calculateSMA(bars, 50);

    if (sma18.length < 3 || sma50.length < 3) return results;

    if (!isLowVolatility(sma18, sma50)) return results;

    const lastSma18 = sma18[sma18.length - 1];
    const lastSma50 = sma50[sma50.length - 1];
    if (!lastSma18 || !lastSma50 || lastSma18.value == null || lastSma50.value == null) return results;
    const acceleration = getAccelerationDirection(sma18, sma50);

    if (lastSma18.value > lastSma50.value && acceleration > 0) {
      results.push({ 
        ticker, 
        candles: bars,
        signal: 'LONG',
        sma18: lastSma18.value,
        sma50: lastSma50.value,
        acceleration
      });
    } else if (lastSma18.value < lastSma50.value && acceleration < 0) {
      results.push({ 
        ticker, 
        candles: bars,
        signal: 'SHORT',
        sma18: lastSma18.value,
        sma50: lastSma50.value,
        acceleration
      });
    }
    
    return results;
  }
}

export class UPatternStrategy implements AnalysisStrategy {
  name = 'Сетап буква U';

  analyze(candles: Candle[], ticker: string): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    const bars = candles.slice(-100);
    
    if (!bars || bars.length < 20) return results;

    let ii = 1;
    while (ii <= bars.length - 2) {
      if (ii - 1 < 0 || ii + 1 >= bars.length) { ii++; continue; }
      if (!bars[ii] || !bars[ii-1] || !bars[ii+1]) { ii++; continue; }
      
      if (!(bars[ii].high > bars[ii-1].high && bars[ii].high > bars[ii+1].high)) {
        ii++;
        continue;
      }
      
      let foundB = false;
      for (let j = ii+3; j <= Math.min(ii+15, bars.length-2); ++j) {
        if (j - 1 < 0 || j + 1 >= bars.length) continue;
        if (!bars[j] || !bars[j-1] || !bars[j+1]) continue;
        
        let monoDown = true;
        for (let t = ii+1; t <= j; ++t) {
          if (t < 1 || t >= bars.length) { monoDown = false; break; }
          if (!bars[t] || !bars[t-1]) { monoDown = false; break; }
          if (bars[t].close >= bars[t-1].close) { monoDown = false; break; }
        }
        
        if (!monoDown) continue;
        if (!(bars[j].low < bars[j-1].low && bars[j].low < bars[j+1].low)) continue;
        
        for (let k = j+3; k <= Math.min(j+15, bars.length); ++k) {
          if (k-1 < 0 || k-1 >= bars.length) continue;
          if (!bars[k-1]) continue;
          
          let monoUp = true;
          for (let t = j+1; t <= k; ++t) {
            if (t < 1 || t >= bars.length) { monoUp = false; break; }
            if (!bars[t] || !bars[t-1]) { monoUp = false; break; }
            if (bars[t].close <= bars[t-1].close) { monoUp = false; break; }
          }
          
          if (!monoUp) continue;
          
          if (bars[k-1].high >= bars[ii].high * 0.99) {
            results.push({
              ticker,
              candles: bars,
              a: ii,
              b: j,
              c: k-1,
              entry: bars[k-1].close,
              sl: bars[j].low,
              tp: bars[ii].high
            });
            ii = k;
            foundB = true;
            break;
          }
        }
        if (foundB) break;
      }
      ii++;
    }
    
    return results;
  }
}

export class OopsStrategy implements AnalysisStrategy {
  name = 'Сетап Oops';

  analyze(candles: Candle[], ticker: string): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    const bars = candles.slice(-40);
    
    if (!bars || bars.length < 2) return results;

    const N = bars.length - 1;
    const i_1 = N - 1;
    const P = 40;
    const delta = 0.001;
    const epsilon = 0.001;
    const Hmax = Math.max(...bars.slice(i_1-P, i_1).map((b: Candle) => b.high));
    const Lmin = Math.min(...bars.slice(i_1-P, i_1).map((b: Candle) => b.low));
    
    if (
      bars[i_1].high > Hmax &&
      bars[i_1].close > Hmax &&
      bars[N].low <= Math.min(bars[i_1].open, bars[i_1].close) - delta &&
      bars[N].close < bars[i_1].close
    ) {
      results.push({
        ticker,
        candles: bars,
        type: 'bullish',
        entry: bars[N].close,
        sl: bars[i_1].low - epsilon,
        tp: bars[N].close + (bars[i_1].low - epsilon - bars[N].close) * 2
      });
    }
    
    if (
      bars[i_1].low < Lmin &&
      bars[i_1].close < Lmin &&
      bars[N].high >= Math.max(bars[i_1].open, bars[i_1].close) + delta &&
      bars[N].close > bars[i_1].close
    ) {
      results.push({
        ticker,
        candles: bars,
        type: 'bearish',
        entry: bars[N].close,
        sl: bars[i_1].high + epsilon,
        tp: bars[N].close - (bars[N].close - (bars[i_1].high + epsilon)) * 2
      });
    }
    
    return results;
  }
}

export class SMA365x50Strategy implements AnalysisStrategy {
  name = 'Сетап 365 Х 50';

  analyze(candles: Candle[], ticker: string): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    const bars = candles.slice(-379);
    
    if (!bars || bars.length < 365) return results;

    const closes = bars.map((c: Candle) => c.close);
    const sma50 = this.calcSMA(closes, 50);
    const sma365 = this.calcSMA(closes, 365);
    const N = bars.length - 1;
    const window = 15;
    
    for (let t = N - window + 1; t <= N; ++t) {
      if (
        t-1 < 0 ||
        sma50[t-1] == null || sma50[t] == null ||
        sma365[t-1] == null || sma365[t] == null ||
        bars[t] == null || bars[t-1] == null
      ) continue;
      
      if (sma50[t-1]! <= sma365[t-1]! && sma50[t]! > sma365[t]!) {
        results.push({
          ticker,
          candles: bars,
          type: 'gold',
          t,
          sma50: sma50[t]!,
          sma365: sma365[t]!
        });
        break;
      }
      
      if (sma50[t-1]! >= sma365[t-1]! && sma50[t]! < sma365[t]!) {
        results.push({
          ticker,
          candles: bars,
          type: 'death',
          t,
          sma50: sma50[t]!,
          sma365: sma365[t]!
        });
        break;
      }
    }
    
    return results;
  }

  private calcSMA(arr: number[], period: number): (number|null)[] {
    const res: (number|null)[] = [];
    for (let i = 0; i < arr.length; ++i) {
      if (i < period - 1) { res.push(null); continue; }
      let sum = 0;
      for (let j = i - period + 1; j <= i; ++j) sum += arr[j];
      res.push(sum / period);
    }
    return res;
  }
}

export class BreakoutStrategy implements AnalysisStrategy {
  name = 'Сетап пробитие';

  analyze(candles: Candle[], ticker: string): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    const bars = candles.slice(-30);
    
    if (!bars || bars.length === 0) return results;

    const max30 = Math.max(...bars.map((c: Candle) => c.high));
    const last = bars[bars.length - 1];
    
    if (
      last.close >= max30 * 0.99 ||
      last.high >= max30 * 0.99
    ) {
      const over = ((last.close - max30) / max30) * 100;
      if (over <= 1) {
        results.push({ ticker, candles: bars, close: last.close, high: last.high, max30, over });
      }
    }
    
    return results;
  }
}

export class AnalysisService implements IAnalysisService {
  private strategies: Map<string, IAnalysisStrategy> = new Map();

  constructor() {
    this.registerStrategy(new TurtleStrategy());
    this.registerStrategy(new LowVolatilityStrategy());
    this.registerStrategy(new GlideStrategy());
    this.registerStrategy(new UPatternStrategy());
    this.registerStrategy(new OopsStrategy());
    this.registerStrategy(new SMA365x50Strategy());
    this.registerStrategy(new BreakoutStrategy());
  }

  registerStrategy(strategy: IAnalysisStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  getStrategy(name: string): IAnalysisStrategy | undefined {
    return this.strategies.get(name);
  }

  getAllStrategies(): IAnalysisStrategy[] {
    return Array.from(this.strategies.values());
  }

  async analyze(setupName: string, candles: Candle[], ticker: string): Promise<AnalysisResult[]> {
    const strategy = this.getStrategy(setupName);
    if (!strategy) {
      throw new Error(`Strategy "${setupName}" not found`);
    }
    
    return strategy.analyze(candles, ticker);
  }

  async analyzeAll(setupName: string, data: Record<string, Candle[]>): Promise<Record<string, AnalysisResult[]>> {
    const results: Record<string, AnalysisResult[]> = {};
    
    for (const [ticker, candles] of Object.entries(data)) {
      if (candles && candles.length > 0) {
        try {
          results[ticker] = await this.analyze(setupName, candles, ticker);
        } catch (error) {
          console.error(`Error analyzing ${ticker}:`, error);
          results[ticker] = [];
        }
      }
    }
    
    return results;
  }
} 