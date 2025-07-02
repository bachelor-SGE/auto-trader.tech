import React from 'react';
import { AnalysisResult } from '../../types';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  setupName: string;
  results: AnalysisResult[] | Record<string, AnalysisResult[]> | null;
  isAnalyzing: boolean;
  analyzeProgress: number;
  currentTicker: string | null;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  setupName,
  results,
  isAnalyzing,
  analyzeProgress,
  currentTicker
}) => {
  if (!isOpen) return null;

  const renderResults = () => {
    if (!results) return null;

    if (Array.isArray(results)) {
      return (
        <div>
          <h3>Результаты анализа: {setupName}</h3>
          {results.length === 0 ? (
            <p>Сигналы не найдены</p>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {results.map((result, index) => (
                <div key={index} style={{ 
                  border: '1px solid #ddd', 
                  padding: '12px', 
                  margin: '8px 0', 
                  borderRadius: '4px',
                  backgroundColor: result.type === 'long' ? '#e8f5e8' : 
                                 result.type === 'short' ? '#ffe8e8' : '#f8f8f8'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    {result.ticker} - {result.type?.toUpperCase() || 'SIGNAL'}
                  </div>
                  {result.entry && <div>Entry: {result.entry.toFixed(2)}</div>}
                  {result.stop && <div>Stop: {result.stop.toFixed(2)}</div>}
                  {result.sl && <div>SL: {result.sl.toFixed(2)}</div>}
                  {result.tp && <div>TP: {result.tp.toFixed(2)}</div>}
                  {result.sma18 && <div>SMA18: {result.sma18.toFixed(2)}</div>}
                  {result.sma50 && <div>SMA50: {result.sma50.toFixed(2)}</div>}
                  {result.acceleration && <div>Acceleration: {result.acceleration}</div>}
                  {result.count && <div>Count: {result.count}</div>}
                  {result.a !== undefined && result.b !== undefined && result.c !== undefined && (
                    <div>
                      <div>A: {result.a}</div>
                      <div>B: {result.b}</div>
                      <div>C: {result.c}</div>
                    </div>
                  )}
                  {result.t !== undefined && <div>T: {result.t}</div>}
                  {result.close && <div>Close: {result.close.toFixed(2)}</div>}
                  {result.high && <div>High: {result.high.toFixed(2)}</div>}
                  {result.max30 && <div>Max30: {result.max30.toFixed(2)}</div>}
                  {result.over !== undefined && <div>Over: {result.over.toFixed(2)}%</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      // Record<string, AnalysisResult[]>
      return (
        <div>
          <h3>Результаты всех анализов</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {Object.entries(results).map(([setup, setupResults]) => (
              <div key={setup} style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '8px 0', color: '#333' }}>{setup}</h4>
                {setupResults.length === 0 ? (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>Сигналы не найдены</p>
                ) : (
                  setupResults.map((result, index) => (
                    <div key={index} style={{ 
                      border: '1px solid #ddd', 
                      padding: '8px', 
                      margin: '4px 0', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: result.type === 'long' ? '#e8f5e8' : 
                                     result.type === 'short' ? '#ffe8e8' : '#f8f8f8'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {result.ticker} - {result.type?.toUpperCase() || 'SIGNAL'}
                      </div>
                      {result.entry && <div>Entry: {result.entry.toFixed(2)}</div>}
                      {result.stop && <div>Stop: {result.stop.toFixed(2)}</div>}
                      {result.sl && <div>SL: {result.sl.toFixed(2)}</div>}
                      {result.tp && <div>TP: {result.tp.toFixed(2)}</div>}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>

        {isAnalyzing ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>Анализ в процессе...</h3>
            <div style={{ 
              width: '100%', 
              height: '20px', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '10px',
              overflow: 'hidden',
              margin: '20px 0'
            }}>
              <div style={{
                width: `${analyzeProgress}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div>{analyzeProgress}%</div>
            {currentTicker && (
              <div style={{ marginTop: '10px', color: '#666' }}>
                Анализируем: {currentTicker}
              </div>
            )}
          </div>
        ) : (
          renderResults()
        )}
      </div>
    </div>
  );
}; 