import axios from 'axios';
import { Candle, DataSource, IDataService } from '../types';
import { FUTURES_TICKERS } from '../constants';

function getFromTill(interval: number): { from: string, till: string } {
  const now = new Date();
  let from = new Date(now);
  if (interval === 24) { // дневной
    from.setDate(now.getDate() - 180);
    return {
      from: from.toISOString().slice(0, 10),
      till: now.toISOString().slice(0, 10)
    };
  }
  if (interval === 60) { // часовой
    from.setDate(now.getDate() - 8);
    return {
      from: from.toISOString().slice(0, 10) + 'T00:00:00',
      till: now.toISOString().slice(0, 10) + 'T23:59:59'
    };
  }
  if (interval === 7) { // недельный
    from.setDate(now.getDate() - 180 * 7);
    return {
      from: from.toISOString().slice(0, 10),
      till: now.toISOString().slice(0, 10)
    };
  }
  if (interval === 1) { // минутный
    return {
      from: now.toISOString().slice(0, 10) + 'T00:00:00',
      till: now.toISOString().slice(0, 10) + 'T23:59:59'
    };
  }
  // fallback
  return {
    from: from.toISOString().slice(0, 10),
    till: now.toISOString().slice(0, 10)
  };
}

export class MoexDataService implements DataSource, IDataService {
  id = 'moex';
  name = 'MOEX API';

  async fetchData(ticker: string, from: string | undefined, till: string | undefined, interval: number = 24, limit?: number): Promise<Candle[]> {
    const isFuture = FUTURES_TICKERS.includes(ticker);
    // Если from/till не переданы — вычисляем автоматически
    let range = { from, till };
    if (!from || !till) {
      range = getFromTill(interval);
    }
    let url;
    if (isFuture) {
      url = `https://iss.moex.com/iss/engines/futures/markets/forts/boards/RFUD/securities/${ticker}/candles.json?interval=${interval}&from=${range.from}&till=${range.till}&iss.meta=off&iss.only=candles`;
    } else {
      url = `https://iss.moex.com/iss/engines/stock/markets/shares/securities/${ticker}/candles.json?interval=${interval}&from=${range.from}&till=${range.till}`;
    }
    if (limit) url += `&limit=${limit}`;
    const resp = await axios.get(url);
    const data = resp.data.candles.data;
    const columns = resp.data.candles.columns;
    
    return data.map((row: any[], idx: number) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return {
        begin: obj['begin'],
        open: obj['open'],
        close: obj['close'],
        high: obj['high'],
        low: obj['low'],
        x: idx,
      };
    });
  }

  parseCSV(text: string): Record<string, Candle[]> {
    throw new Error('CSV parsing not supported for MOEX service');
  }
}

export class FinamDataService implements DataSource, IDataService {
  id = 'finam';
  name = 'Finam CSV';

  async fetchData(ticker: string, from?: string, till?: string, interval?: number, limit?: number): Promise<Candle[]> {
    // Заглушка для Finam - в реальности здесь был бы парсинг CSV
    throw new Error('Finam data service not implemented');
  }

  parseCSV(text: string): Record<string, Candle[]> {
    const delimiter = ';';
    const lines = text.split(/\r?\n/).filter(l => {
      const trimmed = l.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith('<TICKER>')) return false;
      if (trimmed.startsWith('<')) return false;
      return true;
    });
    
    const result: Record<string, Candle[]> = {};
    for (const line of lines) {
      const parts = line.split(delimiter);
      if (parts.length < 9) continue;
      const [ticker, , date, time, open, high, low, close] = parts;
      if (!ticker || ticker.startsWith('<') || ticker === 'TICKER') continue;
      
      const dt = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
      const candle: Candle = {
        begin: dt + 'T' + (time.length === 6 ? time.slice(0,2)+':'+time.slice(2,4)+':'+time.slice(4,6) : '00:00:00'),
        open: +open.replace(',', '.'),
        high: +high.replace(',', '.'),
        low: +low.replace(',', '.'),
        close: +close.replace(',', '.'),
        x: 0
      };
      
      if (!result[ticker]) result[ticker] = [];
      result[ticker].push(candle);
    }
    
    for (const t of Object.keys(result)) {
      result[t] = result[t].map((c, i) => ({...c, x: i}));
    }
    
    return result;
  }
}

export class DataServiceFactory {
  private static services: Map<string, IDataService> = new Map();

  static registerService(service: IDataService): void {
    this.services.set(service.id, service);
  }

  static getService(id: string): IDataService | undefined {
    return this.services.get(id);
  }

  static getAllServices(): IDataService[] {
    return Array.from(this.services.values());
  }
}

// Регистрируем сервисы по умолчанию
DataServiceFactory.registerService(new MoexDataService());
DataServiceFactory.registerService(new FinamDataService()); 