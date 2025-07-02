import React from 'react';
import { Candle } from '../../types';

interface CandleSticksProps {
  candles: Candle[];
  width: number;
  height: number;
  showSMA?: boolean;
  onHover?: (index: number | null) => void;
  hoveredIndex?: number | null;
  sma50?: { value: number }[];
  sma360?: { value: number }[];
  crosses?: number[];
}

export const CandleSticks: React.FC<CandleSticksProps> = ({
  candles,
  width,
  height,
  showSMA = false,
  onHover,
  hoveredIndex,
  sma50,
  sma360,
  crosses
}) => {
  if (!candles || candles.length === 0) {
    return <div>Нет данных для отображения</div>;
  }

  const margin = { top: 20, right: 20, bottom: 30, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Увеличиваем отступы между свечами
  const candleWidth = Math.max(4, Math.min(12, chartWidth / candles.length * 0.8));
  const candleSpacing = chartWidth / candles.length;

  const prices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  const xScale = (index: number) => margin.left + index * candleSpacing + candleSpacing / 2;
  const yScale = (price: number) => margin.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

  // Биржевая сетка
  const gridLinesCount = 10;
  const gridH = Array.from({ length: gridLinesCount + 1 }, (_, i) => i);
  const gridV = Array.from({ length: gridLinesCount + 1 }, (_, i) => i);

  // Для подписей цен и дат
  const priceStep = (maxPrice - minPrice) / gridLinesCount;
  const timeStep = Math.floor(candles.length / gridLinesCount);

  // Подписи только по краям
  const priceLevels = [minPrice, maxPrice];
  const timeLabels = [0, candles.length - 1];

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!onHover) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - margin.left;
    const index = Math.floor(x / candleSpacing);
    
    if (index >= 0 && index < candles.length) {
      onHover(index);
    } else {
      onHover(null);
    }
  };

  const handleMouseLeave = () => {
    if (onHover) onHover(null);
  };

  return (
    <svg
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'crosshair' }}
    >
      {/* Биржевая плотная сетка */}
      {gridH.map(i => {
        const y = margin.top + (chartHeight / gridLinesCount) * i;
        const price = maxPrice - priceStep * i;
        return (
          <g key={`dense-h-${i}`}>
            <line
              x1={margin.left}
              y1={y}
              x2={margin.left + chartWidth}
              y2={y}
              stroke="var(--color-border)"
              strokeWidth="1.2"
              opacity="0.5"
            />
            {/* Подпись цены */}
            <text
              x={margin.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--color-text-secondary)"
              style={{ fontFamily: 'monospace' }}
            >
              {price.toFixed(2)}
            </text>
          </g>
        );
      })}
      {gridV.map(i => {
        const x = margin.left + (chartWidth / gridLinesCount) * i;
        const candleIdx = Math.min(candles.length - 1, Math.round(i * timeStep));
        const date = new Date(candles[candleIdx]?.begin).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
        return (
          <g key={`dense-v-${i}`}>
            <line
              x1={x}
              y1={margin.top}
              x2={x}
              y2={margin.top + chartHeight}
              stroke="var(--color-border)"
              strokeWidth="1.2"
              opacity="0.5"
            />
            {/* Подпись даты */}
            <text
              x={x}
              y={height - 8}
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-text-secondary)"
            >
              {date}
            </text>
          </g>
        );
      })}

      {/* Оси */}
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={margin.top + chartHeight}
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />
      <line
        x1={margin.left}
        y1={margin.top + chartHeight}
        x2={margin.left + chartWidth}
        y2={margin.top + chartHeight}
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />

      {/* Подписи уровней цены только по краям */}
      <text
        x={margin.left - 8}
        y={margin.top + chartHeight + 4}
        textAnchor="end"
        fontSize="11"
        fill="var(--color-text-secondary)"
        style={{ fontFamily: 'monospace' }}
      >
        {minPrice.toFixed(2)}
      </text>
      <text
        x={margin.left - 8}
        y={margin.top + 4}
        textAnchor="end"
        fontSize="11"
        fill="var(--color-text-secondary)"
        style={{ fontFamily: 'monospace' }}
      >
        {maxPrice.toFixed(2)}
      </text>

      {/* Подписи времени только по краям */}
      <text
        x={margin.left}
        y={height - 8}
        textAnchor="start"
        fontSize="11"
        fill="var(--color-text-secondary)"
      >
        {new Date(candles[0].begin).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
      </text>
      <text
        x={margin.left + chartWidth}
        y={height - 8}
        textAnchor="end"
        fontSize="11"
        fill="var(--color-text-secondary)"
      >
        {new Date(candles[candles.length - 1].begin).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
      </text>

      {/* Свечи */}
      {candles.map((candle, index) => {
        const x = xScale(index);
        const openY = yScale(candle.open);
        const closeY = yScale(candle.close);
        const highY = yScale(candle.high);
        const lowY = yScale(candle.low);
        
        const isGreen = candle.close > candle.open;
        const color = isGreen ? 'var(--color-success)' : 'var(--color-danger)';
        const bodyHeight = Math.abs(closeY - openY) || 1;
        
        const isHovered = hoveredIndex === index;

        return (
          <g key={index}>
            {/* Тень */}
            <line
              x1={x}
              y1={highY}
              x2={x}
              y2={lowY}
              stroke={color}
              strokeWidth="1.5"
            />
            
            {/* Тело свечи */}
            <rect
              x={x - candleWidth / 2}
              y={Math.min(openY, closeY)}
              width={candleWidth}
              height={bodyHeight}
              fill={color}
              stroke={isHovered ? 'var(--color-text)' : color}
              strokeWidth={isHovered ? '2' : '1'}
              rx="1"
            />
          </g>
        );
      })}

      {/* SMA50 — синий */}
      {showSMA && sma50 && sma50.length === candles.length && (
        <polyline
          fill="none"
          stroke="#4f8cff"
          strokeWidth={2}
          points={sma50.map((s, i) => `${xScale(i)},${yScale(s.value)}`).join(' ')}
        />
      )}
      {/* SMA360 — красный */}
      {showSMA && sma360 && sma360.length === candles.length && (
        <polyline
          fill="none"
          stroke="#ff4f4f"
          strokeWidth={2}
          points={sma360.map((s, i) => `${xScale(i)},${yScale(s.value)}`).join(' ')}
        />
      )}

      {/* Точки пересечений */}
      {showSMA && crosses && crosses.length > 0 && crosses.map((crossIndex, i) => {
        if (crossIndex >= 0 && crossIndex < candles.length && sma50 && sma50[crossIndex]) {
          const x = xScale(crossIndex);
          const y = yScale(sma50[crossIndex].value);
          return (
            <g key={`cross-${i}`}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="#ffff00"
                stroke="#000"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#ffff00"
                fontWeight="bold"
              >
                {crossIndex}
              </text>
            </g>
          );
        }
        return null;
      })}
    </svg>
  );
};

export const CandleTooltip: React.FC<{ candle: any; sma50?: number; sma360?: number; }> = ({ candle, sma50, sma360 }) => {
  if (!candle) return null;
  return (
    <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', borderRadius: 8, padding: '10px 16px', boxShadow: '0 1px 4px #0002', maxWidth: 340 }}>
      <div>Дата: <b style={{ color: 'var(--color-text)' }}>{new Date(candle.begin).toLocaleDateString()}</b></div>
      <div>Открытие: {candle.open?.toFixed(2)}</div>
      <div>Максимум: {candle.high?.toFixed(2)}</div>
      <div>Минимум: {candle.low?.toFixed(2)}</div>
      <div>Закрытие: {candle.close?.toFixed(2)}</div>
      {sma50 !== undefined && <div>SMA50: {sma50.toFixed(2)}</div>}
      {sma360 !== undefined && <div>SMA360: {sma360.toFixed(2)}</div>}
    </div>
  );
}; 