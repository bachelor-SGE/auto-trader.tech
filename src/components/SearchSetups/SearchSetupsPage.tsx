import React, { useState } from 'react';
import { ALL_TICKERS } from '../../constants';
import { DataServiceFactory } from '../../services/dataService';
import { SetupCard } from './SetupCard';
import { TurtleStrategy } from '../../strategies/TurtleStrategy';
import { SmaStrategy } from '../../strategies/SmaStrategy';
import { calculateSMA } from '../../utils/indicators';
import { DebugSetupsInfo } from './DebugSetupsInfo';

const STRATEGIES = [TurtleStrategy, SmaStrategy];
const TIMEFRAMES = [
  { key: 'day', label: 'День' },
  { key: 'hour', label: 'Час' },
  { key: 'minute', label: 'Минута' },
];

export const SearchSetupsPage: React.FC = () => {
  const [strategyKey, setStrategyKey] = useState(STRATEGIES[0].key);
  const [timeframe, setTimeframe] = useState('day');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [charts, setCharts] = useState<Record<string, any[]>>({});
  const [debugMsg, setDebugMsg] = useState('');
  const [debugCharts, setDebugCharts] = useState<any[]>([]);

  const strategy = STRATEGIES.find(s => s.key === strategyKey)!;

  const handleSearch = async () => {
    setLoading(true);
    setResults([]);
    setCharts({});
    setDebugMsg('');
    setDebugCharts([]);
    const dataService = DataServiceFactory.getService('moex');
    const intervalMap: Record<string, number> = { day: 24, week: 7, hour: 60, minute: 1 };
    const interval = intervalMap[timeframe] || 24;
    if (!dataService) return;
    const chartCandles: Record<string, any[]> = {};
    let errorCount = 0;
    let debugArr: any[] = [];
    if (strategy.key === 'sma') {
      // SOLID: используем методы класса SmaStrategy
      const promises = ALL_TICKERS.map(async (ticker: string) => {
        try {
          const candles = await dataService.fetchData(ticker, undefined, undefined, interval, 360);
          const crosses = SmaStrategy.findCrosses(candles);
          debugArr.push({ticker, candles, sma50: calculateSMA(candles, 50), sma360: calculateSMA(candles, 360), crosses});
          const res = await SmaStrategy.search({ ticker, candles, timeframe, dataService });
          if (res) chartCandles[ticker] = candles;
          return res;
        } catch { errorCount += 1; return null; }
      });
      const found = (await Promise.all(promises)).filter(Boolean);
      setResults(found);
      setCharts(chartCandles);
      setDebugCharts(debugArr);
      setDebugMsg(`Обработано тикеров: ${ALL_TICKERS.length}, найдено сетапов: ${found.length}, ошибок: ${errorCount}`);
    } else {
      // Turtle и любые другие стратегии через единый интерфейс
      const promises = ALL_TICKERS.map(async (ticker: string) => {
        try {
          const candles = await dataService.fetchData(ticker, undefined, undefined, interval, 200);
          if (!candles) return null;
          const res = await strategy.search({ ticker, candles, timeframe, dataService });
          if (res) chartCandles[ticker] = candles;
          return res;
        } catch { errorCount += 1; return null; }
      });
      const found = (await Promise.all(promises)).filter(Boolean);
      setResults(found);
      setCharts(chartCandles);
      setDebugMsg(`Обработано тикеров: ${ALL_TICKERS.length}, найдено сетапов: ${found.length}, ошибок: ${errorCount}`);
    }
    setLoading(false);
  };

  return (
    <div style={{maxWidth:1100, margin:'40px auto', background:'#232a3a', borderRadius:16, padding:36, color:'#fff', boxShadow:'0 8px 40px #0004'}}>
      <h2 style={{fontWeight:800, fontSize:28, marginBottom:24}}>Поиск сетапов</h2>
      <div style={{display:'flex', gap:24, marginBottom:32}}>
        <div>
          <div style={{color:'#bbb', marginBottom:8}}>Сетап:</div>
          <select value={strategyKey} onChange={e=>setStrategyKey(e.target.value)} style={{padding:'10px 18px', borderRadius:8, fontSize:16}}>
            {STRATEGIES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <div style={{color:'#bbb', marginBottom:8}}>Таймфрейм:</div>
          <select value={timeframe} onChange={e=>setTimeframe(e.target.value)} style={{padding:'10px 18px', borderRadius:8, fontSize:16}}>
            {TIMEFRAMES.map(tf => <option key={tf.key} value={tf.key}>{tf.label}</option>)}
          </select>
        </div>
        <button onClick={handleSearch} style={{background:'#4f8cff', color:'#fff', border:'none', borderRadius:8, padding:'12px 28px', fontWeight:800, fontSize:18, cursor:'pointer', marginTop:24, height:48}}>Поиск</button>
      </div>
      {loading && <div style={{color:'#888', margin:'32px 0'}}>Поиск сетапов...</div>}
      {!loading && results.length > 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:36, marginTop:24}}>
          {results.map((r, i) => (
            <SetupCard
              key={r.ticker}
              result={r}
              candles={charts[r.ticker]}
              showSMA={strategy.key === 'sma'}
              sma50={strategy.key === 'sma' ? calculateSMA(charts[r.ticker], 50) : undefined}
              sma360={strategy.key === 'sma' ? calculateSMA(charts[r.ticker], 360) : undefined}
            />
          ))}
        </div>
      )}
      {!loading && results.length === 0 && strategy.key !== 'sma' && <div style={{color:'#888', marginTop:32}}>Нет сигналов по выбранным условиям</div>}
      {debugMsg && strategy.key !== 'sma' && <div style={{color:'#4f8cff', margin:'16px 0 0 0', fontSize:15, fontWeight:700}}>{debugMsg}</div>}
      {!loading && strategy.key === 'sma' && debugCharts.length > 0 && (
        <DebugSetupsInfo debugCharts={debugCharts} />
      )}
    </div>
  );
}; 