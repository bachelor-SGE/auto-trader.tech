import { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { Candle, IDataProvider } from '../types';
import { TICKERS, FUTURES_TICKERS } from '../constants';
import { DataServiceFactory } from '../services/dataService';

const ALL_TICKERS = [...TICKERS, ...FUTURES_TICKERS];

function getMoexFromTill(timeFrame: string, candlesCount: number): { from: string, till: string } {
  const now = new Date();
  const till = now;
  let from = new Date(now);

  const MS_IN_MIN = 60 * 1000;
  const MS_IN_HOUR = 60 * MS_IN_MIN;
  const MS_IN_DAY = 24 * MS_IN_HOUR;
  const MS_IN_WEEK = 7 * MS_IN_DAY;

  // MOEX рабочие часы: 10:00 - 00:00 (МСК), только будни
  function isMoexWorkingTime(date: Date) {
    const day = date.getDay(); // 0 - воскресенье, 6 - суббота
    const hour = date.getHours();
    return day >= 1 && day <= 5 && hour >= 10 && hour < 24;
  }

  if (timeFrame === 'day') {
    from = new Date(now.getTime() - candlesCount * MS_IN_DAY);
  } else if (timeFrame === 'week') {
    from = new Date(now.getTime() - candlesCount * MS_IN_WEEK);
  } else if (timeFrame === 'hour') {
    let bars = 0;
    let d = new Date(now);
    while (bars < candlesCount) {
      d = new Date(d.getTime() - MS_IN_HOUR);
      if (isMoexWorkingTime(d)) bars++;
    }
    from = d;
  } else if (timeFrame === 'minute') {
    let bars = 0;
    let d = new Date(now);
    while (bars < candlesCount) {
      d = new Date(d.getTime() - MS_IN_MIN);
      if (isMoexWorkingTime(d)) bars++;
    }
    from = d;
  }

  return {
    from: from.toISOString().slice(0, 19),
    till: till.toISOString().slice(0, 19)
  };
}

export class DataProvider implements IDataProvider {
  private data: Record<string, Candle[]> = {};
  private loading: boolean = false;
  private error: string | null = null;
  private candlesCount: number = 180;
  private timeFrame: string = 'day';

  async fetchData(candlesCount: number, timeFrame: string): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const { from, till } = getMoexFromTill(timeFrame, candlesCount);
      const dataService = DataServiceFactory.getService('moex');
      if (!dataService) throw new Error('MOEX data service not available');
      const intervalMap: Record<string, number> = { day: 24, week: 7, hour: 60, minute: 1 };
      const interval = intervalMap[timeFrame] || 24;
      const promises = ALL_TICKERS.map(async (ticker) => {
        try {
          const candles = await (dataService as any).fetchData(ticker, from, till, interval, candlesCount);
          return [ticker, candles.slice(-candlesCount)] as [string, Candle[]];
        } catch (error) {
          console.error(`Error fetching data for ${ticker}:`, error);
          return [ticker, []] as [string, Candle[]];
        }
      });
      const results = await Promise.all(promises);
      const newData: Record<string, Candle[]> = {};
      results.forEach(([ticker, candles]) => {
        newData[ticker] = candles;
      });
      this.data = newData;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }

  getData(): Record<string, Candle[]> {
    return this.data;
  }

  isLoading(): boolean {
    return this.loading;
  }

  getError(): string | null {
    return this.error;
  }
}

export const useData = (params: { timeFrame: string; candlesCount: number }) => {
  const [dataProvider] = useState(() => new DataProvider());
  const [data, setData] = useState<Record<string, Candle[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { timeFrame, candlesCount } = params;

  const fetchData = useCallback(async () => {
    await dataProvider.fetchData(candlesCount, timeFrame);
    setData(dataProvider.getData());
    setLoading(dataProvider.isLoading());
    setError(dataProvider.getError());
  }, [dataProvider, candlesCount, timeFrame]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error
  };
}; 