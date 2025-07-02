import axios from 'axios';
import * as cheerio from 'cheerio';

interface FinamTicker {
  code: string;
  name: string;
  market: string;
  board: string;
}

export class FinamParser {
  private static readonly BASE_URL = 'https://trading.finam.ru/profile/MOEX-SPBE';

  static async getTickers(): Promise<FinamTicker[]> {
    try {
      const response = await axios.get(this.BASE_URL);
      const $ = cheerio.load(response.data);
      const tickers: FinamTicker[] = [];

      // Парсим таблицу с тикерами
      $('.table tbody tr').each((_, element) => {
        const code = $(element).find('td:nth-child(1)').text().trim();
        const name = $(element).find('td:nth-child(2)').text().trim();
        const market = $(element).find('td:nth-child(3)').text().trim();
        const board = $(element).find('td:nth-child(4)').text().trim();

        if (code && name) {
          tickers.push({ code, name, market, board });
        }
      });

      return tickers;
    } catch (error) {
      console.error('Error parsing Finam:', error);
      throw error;
    }
  }

  static async getTickerDetails(ticker: string): Promise<any> {
    try {
      const url = `${this.BASE_URL}/${ticker}`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      // Здесь можно добавить парсинг детальной информации по тикеру
      // Например, текущую цену, объемы, графики и т.д.
      
      return {
        ticker,
        // Добавьте нужные поля
      };
    } catch (error) {
      console.error(`Error getting details for ${ticker}:`, error);
      throw error;
    }
  }

  static async getCategoryLinks(): Promise<string[]> {
    try {
      const response = await axios.get('https://trading.finam.ru/');
      const $ = cheerio.load(response.data);
      const links: string[] = [];
      // Меню слева — ищем все ссылки на категории
      $("nav a").each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('/profile/')) {
          links.push(`https://trading.finam.ru${href}`);
        }
      });
      return Array.from(new Set(links));
    } catch (e) {
      console.error('Ошибка при парсинге категорий:', e);
      return [];
    }
  }

  static async getTickersFromCategory(categoryUrl: string): Promise<string[]> {
    const tickers: string[] = [];
    let page = 1;
    let hasNext = true;
    while (hasNext) {
      try {
        const url = `${categoryUrl}${categoryUrl.includes('?') ? '&' : '?'}page=${page}`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        // Ссылки на тикеры (левая колонка)
        $("a[href^='/profile/']").each((_, el) => {
          const href = $(el).attr('href');
          if (href && href.match(/^\/profile\/[A-Z0-9\-]+$/)) {
            tickers.push(`https://trading.finam.ru${href}`);
          }
        });
        // Проверяем, есть ли следующая страница
        hasNext = $("button[aria-label='Следующая страница']").length > 0;
        page++;
      } catch (e) {
        hasNext = false;
      }
    }
    return Array.from(new Set(tickers));
  }

  static async getOCHLVFromTicker(tickerUrl: string): Promise<{
    open?: number;
    close?: number;
    high?: number;
    low?: number;
    volume?: number;
    date?: string;
    ticker: string;
  }> {
    try {
      const response = await axios.get(tickerUrl);
      const $ = cheerio.load(response.data);
      const ticker = tickerUrl.split('/').pop() || '';
      // Парсим блок 'Торги'
      const tradesBlock = $(".tab-content").find(".tab-pane:contains('Торги')");
      let open, close, high, low, volume, date;
      // Последняя цена (close)
      close = parseFloat($(".tab-content").find(".tab-pane[role='tabpanel'] span:contains('Последняя цена')").parent().next().text().replace(/[^\d.,]/g, '').replace(',', '.'));
      // Дневной диапазон (low/high)
      const rangeText = $(".tab-content").find(".tab-pane[role='tabpanel'] span:contains('Дневной диапазон')").parent().next().text();
      if (rangeText) {
        const [lowStr, highStr] = rangeText.split('—').map(s => s.replace(/[^\d.,]/g, '').replace(',', '.'));
        low = parseFloat(lowStr);
        high = parseFloat(highStr);
      }
      // Открытие (open)
      open = parseFloat($(".tab-content").find(".tab-pane[role='tabpanel'] span:contains('Открытие')").parent().next().text().replace(/[^\d.,]/g, '').replace(',', '.'));
      // Объём (volume)
      volume = parseFloat($(".tab-content").find(".tab-pane[role='tabpanel'] span:contains('Объём')").parent().next().text().replace(/[^\d.,]/g, '').replace(',', '.'));
      // Дата (берём текущее время)
      date = new Date().toISOString();
      return { open, close, high, low, volume, date, ticker };
    } catch (e) {
      console.error('Ошибка при парсинге OCHLV:', e);
      return { ticker: tickerUrl.split('/').pop() || '' };
    }
  }

  static async getCandles({
    securityCode,
    securityBoard,
    timeFrame = 'D1',
    from,
    to,
    intraday = false
  }: {
    securityCode: string;
    securityBoard: string;
    timeFrame?: 'D1' | 'W1' | 'M1' | 'M5' | 'M15' | 'H1';
    from: string; // 'YYYY-MM-DD' или 'YYYY-MM-DDTHH:mm:ssZ' для intraday
    to: string;   // 'YYYY-MM-DD' или 'YYYY-MM-DDTHH:mm:ssZ' для intraday
    intraday?: boolean;
  }): Promise<{
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
  }[]> {
    const endpoint = intraday
      ? 'https://trading.finam.ru/api/v1/intraday-candles'
      : 'https://trading.finam.ru/api/v1/day-candles';
    const params = {
      securityCode,
      securityBoard,
      timeFrame,
      from,
      to
    };
    const res = await axios.get(endpoint, { params });
    const candles = res.data || [];
    return candles.map((c: any) => ({
      date: c.date || c.timestamp,
      open: c.open ? c.open.num / Math.pow(10, c.open.scale) : null,
      close: c.close ? c.close.num / Math.pow(10, c.close.scale) : null,
      high: c.high ? c.high.num / Math.pow(10, c.high.scale) : null,
      low: c.low ? c.low.num / Math.pow(10, c.low.scale) : null,
      volume: c.volume
    }));
  }

  static async getSecurityParamsFromTickerPage(tickerUrl: string): Promise<{ securityCode: string, securityBoard: string }> {
    try {
      const response = await axios.get(tickerUrl);
      const $ = cheerio.load(response.data);
      // Обычно параметры лежат в data-атрибутах или в meta/script
      // Пробуем найти в meta
      let securityCode = '';
      let securityBoard = '';
      // Пробуем найти в script[type='application/ld+json'] или window.__INITIAL_STATE__
      const scripts = $('script');
      scripts.each((_, el) => {
        const scriptText = $(el).html() || '';
        if (scriptText.includes('securityCode') && scriptText.includes('securityBoard')) {
          try {
            const match = scriptText.match(/securityCode\s*[:=]\s*['\"]([A-Z0-9\-]+)['\"]/);
            const match2 = scriptText.match(/securityBoard\s*[:=]\s*['\"]([A-Z0-9]+)['\"]/);
            if (match && match2) {
              securityCode = match[1];
              securityBoard = match2[1];
            }
          } catch {}
        }
      });
      // Fallback: пробуем вытащить из URL
      if (!securityCode) {
        const urlParts = tickerUrl.split('/');
        securityCode = urlParts[urlParts.length - 1].split('-')[0];
      }
      // Если не нашли board — дефолт TQBR (для акций), иначе пусть пусто
      if (!securityBoard) securityBoard = 'TQBR';
      return { securityCode, securityBoard };
    } catch (e) {
      return { securityCode: '', securityBoard: '' };
    }
  }

  static async getAllCandlesForAllTickers({
    timeFrame = 'D1',
    from,
    to,
    intraday = false
  }: {
    timeFrame?: 'D1' | 'W1' | 'M1' | 'M5' | 'M15' | 'H1';
    from: string;
    to: string;
    intraday?: boolean;
  }) {
    const result: any[] = [];
    const categories = await this.getCategoryLinks();
    for (const categoryUrl of categories) {
      const tickers = await this.getTickersFromCategory(categoryUrl);
      for (const tickerUrl of tickers) {
        const { securityCode, securityBoard } = await this.getSecurityParamsFromTickerPage(tickerUrl);
        if (!securityCode || !securityBoard) continue;
        try {
          const candles = await this.getCandles({
            securityCode,
            securityBoard,
            timeFrame,
            from,
            to,
            intraday
          });
          result.push({
            categoryUrl,
            tickerUrl,
            securityCode,
            securityBoard,
            candles
          });
        } catch (e) {
          // skip errors, log if needed
        }
      }
    }
    return result;
  }
} 