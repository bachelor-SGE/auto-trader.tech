export interface Candle {
  begin: string;
  open: number;
  high: number;
  low: number;
  close: number;
  x?: number;
  volume?: number;
}

export interface SMA {
  date: string;
  value: number;
}

/**
 * Рассчитывает Simple Moving Average (SMA) для массива свечей
 * @param candles Массив свечей
 * @param period Период SMA
 * @returns Массив значений SMA с датами
 */
export function calculateSMA(candles: Candle[], period: number): SMA[] {
  return candles.map((candle, index) => {
    const start = Math.max(0, index - period + 1);
    const window = candles.slice(start, index + 1);
    const sum = window.reduce((acc, c) => acc + c.close, 0);
    const sma = sum / window.length;
    return { date: candle.begin, value: sma };
  });
}

/**
 * Рассчитывает несколько SMA для массива свечей
 * @param candles Массив свечей
 * @param periods Массив периодов SMA
 * @returns Объект с массивами значений SMA для каждого периода
 */
export function calculateMultipleSMA(
  candles: Candle[],
  periods: number[]
): Record<number, SMA[]> {
  return periods.reduce((acc, period) => {
    acc[period] = calculateSMA(candles, period);
    return acc;
  }, {} as Record<number, SMA[]>);
}

/**
 * Проверяет, что две SMA идут почти вровень (низкая волатильность)
 * @param sma1 Первая SMA
 * @param sma2 Вторая SMA
 * @param maxDifferencePercent Максимальная разница в процентах
 * @returns true если SMA идут почти вровень
 */
export function isLowVolatility(
  sma1: SMA[],
  sma2: SMA[],
  maxDifferencePercent: number = 0.5
): boolean {
  if (sma1.length < 2 || sma2.length < 2) return false;

  return sma1.slice(0, -1).every((s, i) => {
    const v1 = s.value;
    const v2 = sma2[i].value;
    const diff = Math.abs(v1 - v2);
    const avg = (v1 + v2) / 2;
    return (diff / avg) * 100 <= maxDifferencePercent;
  });
}

/**
 * Определяет направление ускорения между двумя SMA
 * @param sma1 Первая SMA
 * @param sma2 Вторая SMA
 * @returns 1 для ускорения вверх, -1 для ускорения вниз, 0 для отсутствия ускорения
 */
export function getAccelerationDirection(
  sma1: SMA[],
  sma2: SMA[]
): number {
  if (sma1.length < 2 || sma2.length < 2) return 0;

  const last1 = sma1[sma1.length - 1].value;
  const prev1 = sma1[sma1.length - 2].value;
  const last2 = sma2[sma2.length - 1].value;
  const prev2 = sma2[sma2.length - 2].value;

  const acc1 = last1 - prev1;
  const acc2 = last2 - prev2;

  return acc1 > acc2 ? 1 : acc1 < acc2 ? -1 : 0;
} 