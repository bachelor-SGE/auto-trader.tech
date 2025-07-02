// Тест Turtle стратегии
const testCandles = [
  // Создаем тестовые свечи с пробитием максимума
  { begin: '2024-01-01', open: 100, high: 105, low: 99, close: 104 },
  { begin: '2024-01-02', open: 101, high: 106, low: 100, close: 105 },
  { begin: '2024-01-03', open: 102, high: 107, low: 101, close: 106 },
  { begin: '2024-01-04', open: 103, high: 108, low: 102, close: 107 },
  { begin: '2024-01-05', open: 104, high: 109, low: 103, close: 108 },
  { begin: '2024-01-06', open: 105, high: 110, low: 104, close: 109 },
  { begin: '2024-01-07', open: 106, high: 111, low: 105, close: 110 },
  { begin: '2024-01-08', open: 107, high: 112, low: 106, close: 111 },
  { begin: '2024-01-09', open: 108, high: 113, low: 107, close: 112 },
  { begin: '2024-01-10', open: 109, high: 114, low: 108, close: 113 },
  { begin: '2024-01-11', open: 110, high: 115, low: 109, close: 114 },
  { begin: '2024-01-12', open: 111, high: 116, low: 110, close: 115 },
  { begin: '2024-01-13', open: 112, high: 117, low: 111, close: 116 },
  { begin: '2024-01-14', open: 113, high: 118, low: 112, close: 117 },
  { begin: '2024-01-15', open: 114, high: 119, low: 113, close: 118 },
  { begin: '2024-01-16', open: 115, high: 120, low: 114, close: 119 },
  { begin: '2024-01-17', open: 116, high: 121, low: 115, close: 120 },
  { begin: '2024-01-18', open: 117, high: 122, low: 116, close: 121 },
  { begin: '2024-01-19', open: 118, high: 123, low: 117, close: 122 },
  { begin: '2024-01-20', open: 119, high: 124, low: 118, close: 123 },
  { begin: '2024-01-21', open: 120, high: 125, low: 119, close: 124 },
  { begin: '2024-01-22', open: 121, high: 126, low: 120, close: 125 },
  { begin: '2024-01-23', open: 122, high: 127, low: 121, close: 126 },
  { begin: '2024-01-24', open: 123, high: 128, low: 122, close: 127 },
  { begin: '2024-01-25', open: 124, high: 129, low: 123, close: 128 },
  { begin: '2024-01-26', open: 125, high: 130, low: 124, close: 129 },
  { begin: '2024-01-27', open: 126, high: 131, low: 125, close: 130 },
  { begin: '2024-01-28', open: 127, high: 132, low: 126, close: 131 },
  { begin: '2024-01-29', open: 128, high: 133, low: 127, close: 132 },
  { begin: '2024-01-30', open: 129, high: 134, low: 128, close: 133 },
  // Последняя свеча пробивает максимум
  { begin: '2024-01-31', open: 130, high: 136, low: 129, close: 136 }
];

// Симуляция Turtle стратегии
function testTurtleStrategy(candles, timeframe = 'day') {
  if (candles.length < 30) return null;

  const period20 = 20;
  const period10 = 10;
  
  const recentCandles = candles.slice(-Math.max(30, period20 + 10));
  
  const last20 = recentCandles.slice(-period20);
  const high20 = Math.max(...last20.map(c => c.high));
  const low20 = Math.min(...last20.map(c => c.low));
  
  const last10 = recentCandles.slice(-period10);
  const longStop = Math.min(...last10.map(c => c.close));
  const shortStop = Math.max(...last10.map(c => c.close));
  
  const currentPrice = recentCandles[recentCandles.length - 1].close;
  
  console.log('Тест Turtle стратегии:');
  console.log('Количество свечей:', candles.length);
  console.log('High20:', high20);
  console.log('Low20:', low20);
  console.log('Current price:', currentPrice);
  console.log('Long stop:', longStop);
  console.log('Short stop:', shortStop);
  
  if (currentPrice > high20) {
    console.log('✅ LONG сигнал!');
    return { type: 'LONG', entry: currentPrice, stop: longStop };
  }
  
  if (currentPrice < low20) {
    console.log('✅ SHORT сигнал!');
    return { type: 'SHORT', entry: currentPrice, stop: shortStop };
  }
  
  console.log('❌ Нет сигнала');
  return null;
}

const result = testTurtleStrategy(testCandles);
console.log('Результат:', result); 