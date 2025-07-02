import React, { useState, useMemo } from 'react';
import { Candle, YScale } from '../../types';
import { CandleSticks } from './CandleSticks';
import { calculateSMA } from '../../utils/indicators';

interface StockChartProps {
  candles: Candle[];
  ticker: string;
  yScale?: YScale;
  onYScaleChange?: (field: 'min' | 'max', value: string) => void;
  onYScaleReset?: () => void;
  onHover?: (index: number | null) => void;
  showSMA?: boolean;
}

export const StockChart: React.FC<StockChartProps> = ({
  candles,
  ticker,
  yScale = { min: '', max: '' },
  onYScaleChange,
  onYScaleReset,
  onHover,
  showSMA = false
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Добавляем SMA к свечам
  const sma18 = calculateSMA(candles, 18);
  const sma50 = calculateSMA(candles, 50);

  const candlesWithSMA = candles.map((candle, i) => ({
    ...candle,
    sma18: sma18[i].value,
    sma50: sma50[i].value,
  }));

  const handleHover = (index: number | null) => {
    setHoveredIndex(index);
    onHover?.(index);
  };

  const lastCandle = candles[candles.length - 1];
  const changePercent = lastCandle 
    ? ((lastCandle.close - lastCandle.open) / lastCandle.open) * 100 
    : 0;

  return (
    <div style={{
      background: 'var(--color-card)',
      borderRadius: 'var(--radius)',
      boxShadow: '0 4px 32px #000a',
      border: '1.5px solid var(--color-border)',
      padding: '24px',
      margin: '0 auto',
      maxWidth: 900,
      transition: 'box-shadow 0.2s',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{ticker}</h3>
          <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
            {lastCandle && (
              <>
                <span>Цена: <b style={{ color: 'var(--color-text)' }}>{lastCandle.close.toFixed(2)}</b></span>
                <span style={{ marginLeft: '16px', color: changePercent >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                  {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <CandleSticks
        candles={candlesWithSMA}
        width={800}
        height={400}
        showSMA={showSMA}
        onHover={handleHover}
        hoveredIndex={hoveredIndex}
      />

      {hoveredIndex !== null && candles[hoveredIndex] && (
        <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', borderRadius: 8, padding: '10px 16px', boxShadow: '0 1px 4px #0002', maxWidth: 340 }}>
          <div>Дата: <b style={{ color: 'var(--color-text)' }}>{new Date(candles[hoveredIndex].begin).toLocaleDateString()}</b></div>
          <div>Открытие: {candles[hoveredIndex].open.toFixed(2)}</div>
          <div>Максимум: {candles[hoveredIndex].high.toFixed(2)}</div>
          <div>Минимум: {candles[hoveredIndex].low.toFixed(2)}</div>
          <div>Закрытие: {candles[hoveredIndex].close.toFixed(2)}</div>
          {showSMA && candlesWithSMA[hoveredIndex]?.sma18 && (
            <div>SMA18: {candlesWithSMA[hoveredIndex].sma18?.toFixed(2)}</div>
          )}
          {showSMA && candlesWithSMA[hoveredIndex]?.sma50 && (
            <div>SMA50: {candlesWithSMA[hoveredIndex].sma50?.toFixed(2)}</div>
          )}
        </div>
      )}
    </div>
  );
}; 