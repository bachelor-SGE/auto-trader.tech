import React, { useState } from 'react';
import { CandleSticks, CandleTooltip } from '../Chart/CandleSticks';
import { SetupResult } from '../../types';

interface SetupCardProps {
  result: SetupResult;
  candles: any[];
  showSMA?: boolean;
  sma50?: { value: number }[];
  sma360?: { value: number }[];
  crosses?: number[];
}

export const SetupCard: React.FC<SetupCardProps> = ({ result, candles, showSMA, sma50, sma360, crosses }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div style={{background:'#1a1f2a', borderRadius:14, boxShadow:'0 2px 16px #0002', padding:'32px 32px 24px 32px', maxWidth:900, margin:'0 auto'}}>
      <div style={{display:'flex', alignItems:'center', gap:32, marginBottom:18}}>
        <div style={{fontSize:28, fontWeight:900, letterSpacing:1, color:'#fff', minWidth:100}}>{result.ticker}</div>
        {result.type && (
          <div style={{fontWeight:700, fontSize:22, color:result.type==='LONG'||result.type==='GOLD'?'#4f8cff':'#ff4f4f', minWidth:160}}>
            {result.type === 'LONG' ? 'ЛОНГ' : result.type === 'SHORT' ? 'ШОРТ' : result.type === 'GOLD' ? 'GOLD CROSS' : 'DEATH CROSS'}
          </div>
        )}
        {result.entry !== undefined && (
          <div style={{fontSize:18, color:'#bbb', minWidth:120}}>Вход: <span style={{color:'#fff', fontWeight:700}}>{result.entry}</span></div>
        )}
        {result.stop !== undefined && (
          <div style={{fontSize:18, color:'#bbb', minWidth:120}}>Стоп: <span style={{color:'#fff', fontWeight:700}}>{result.stop}</span></div>
        )}
        {result.price !== undefined && (
          <div style={{fontSize:18, color:'#bbb', minWidth:160}}>Цена пересечения: <span style={{color:'#fff', fontWeight:700}}>{result.price?.toFixed(2)}</span></div>
        )}
      </div>
      <CandleSticks
        candles={candles}
        width={800}
        height={320}
        showSMA={showSMA}
        sma50={sma50}
        sma360={sma360}
        crosses={crosses}
        onHover={setHoveredIndex}
        hoveredIndex={hoveredIndex}
      />
      {hoveredIndex !== null && candles[hoveredIndex] && (
        <CandleTooltip
          candle={candles[hoveredIndex]}
          sma50={sma50 && sma50[hoveredIndex] ? sma50[hoveredIndex].value : undefined}
          sma360={sma360 && sma360[hoveredIndex] ? sma360[hoveredIndex].value : undefined}
        />
      )}
    </div>
  );
}; 