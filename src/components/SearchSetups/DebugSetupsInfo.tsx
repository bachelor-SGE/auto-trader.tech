import React, { useState } from 'react';
import { CandleSticks, CandleTooltip } from '../Chart/CandleSticks';

interface CrossInfo {
  idx: number;
  date: string;
  price: number;
}

interface DebugChart {
  ticker: string;
  candles: any[];
  sma50: { value: number }[];
  sma360: { value: number }[];
  crosses: CrossInfo[];
}

interface DebugSetupsInfoProps {
  debugCharts: DebugChart[];
}

export const DebugSetupsInfo: React.FC<DebugSetupsInfoProps> = ({ debugCharts }) => {
  // Для каждого тикера свой hoveredIndex
  const [hoveredIndexes, setHoveredIndexes] = useState<Record<string, number | null>>({});

  // Функция для анализа пересечений
  const analyzeCrosses = (sma50: { value: number }[], sma360: { value: number }[], candles: any[]) => {
    const analysis = [];
    const lastBars = Math.min(40, sma50.length);
    for (let i = sma50.length - lastBars; i < sma50.length - 1; i++) {
      if (!sma50[i] || !sma360[i] || !sma50[i+1] || !sma360[i+1]) continue;
      const prevDiff = sma50[i].value - sma360[i].value;
      const nextDiff = sma50[i+1].value - sma360[i+1].value;
      const product = prevDiff * nextDiff;
      const isCross = product < -0.0001;
      let crossType: 'GOLD' | 'DEATH' | null = null;
      if (isCross) crossType = prevDiff < 0 ? 'GOLD' : 'DEATH';
      analysis.push({
        bar: i,
        sma50: sma50[i].value.toFixed(4),
        sma360: sma360[i].value.toFixed(4),
        prevDiff: prevDiff.toFixed(6),
        nextDiff: nextDiff.toFixed(6),
        product: product.toFixed(8),
        isCross,
        crossType,
        date: candles[i+1]?.begin
      });
    }
    return analysis;
  };

  // Фильтруем только те графики, где есть Gold/Death cross
  const filteredCharts = debugCharts.filter(dbg => {
    const analysis = analyzeCrosses(dbg.sma50, dbg.sma360, dbg.candles);
    return analysis.some(a => a.isCross);
  });

  return (
    <div style={{margin:'40px auto 0 auto', maxWidth:1100}}>
      {filteredCharts.map((dbg) => {
        if (!dbg.candles || dbg.candles.length === 0) return null;
        const analysis = analyzeCrosses(dbg.sma50, dbg.sma360, dbg.candles);
        const hoveredIndex = hoveredIndexes[dbg.ticker] ?? null;
        const foundCross = analysis.find(a => a.isCross);
        return (
          <div key={dbg.ticker} style={{background:'#1a1f2a', borderRadius:14, boxShadow:'0 2px 16px #0002', padding:'32px 32px 24px 32px', maxWidth:900, margin:'40px auto 0 auto'}}>
            <div style={{fontSize:24, fontWeight:900, color:'#fff', marginBottom:18}}>{dbg.ticker}</div>
            <CandleSticks
              candles={dbg.candles}
              width={800}
              height={320}
              showSMA={true}
              sma50={dbg.sma50}
              sma360={dbg.sma360}
              crosses={dbg.crosses.map(c => c.idx)}
              onHover={idx => setHoveredIndexes(prev => ({ ...prev, [dbg.ticker]: idx }))}
              hoveredIndex={hoveredIndex}
            />
            {hoveredIndex !== null && dbg.candles[hoveredIndex] && (
              <CandleTooltip
                candle={dbg.candles[hoveredIndex]}
                sma50={dbg.sma50 && dbg.sma50[hoveredIndex] ? dbg.sma50[hoveredIndex].value : undefined}
                sma360={dbg.sma360 && dbg.sma360[hoveredIndex] ? dbg.sma360[hoveredIndex].value : undefined}
              />
            )}
            {/* Если найдено пересечение, выводим инфу по шаблону */}
            {foundCross && (
              <div style={{marginTop:18, fontSize:18, fontWeight:700, color: foundCross.crossType === 'GOLD' ? '#27ae60' : '#e74c3c'}}>
                {foundCross.crossType === 'GOLD' ? 'Gold cross' : 'Death cross'} — {foundCross.date ? new Date(foundCross.date).toLocaleDateString() : ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}; 