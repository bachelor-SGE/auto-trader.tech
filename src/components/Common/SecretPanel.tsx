import React, { useState } from 'react';
import { Candle } from '../../types';
import { DataServiceFactory } from '../../services/dataService';

interface SecretPanelProps {
  onAnalysisRequest: (setup: string, csvData?: Record<string, Candle[]>) => void;
  onAllAnalysisRequest: (csvData?: Record<string, Candle[]>, csvTicker?: string) => void;
  onClose: () => void;
  data: Record<string, Candle[]>;
}

export const SecretPanel: React.FC<SecretPanelProps> = ({
  onAnalysisRequest,
  onAllAnalysisRequest,
  onClose,
  data
}) => {
  const [password, setPassword] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [csvData, setCsvData] = useState<Record<string, Candle[]> | null>(null);
  const [selectedTicker, setSelectedTicker] = useState<string>('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'VeryHardPass100%') {
      setShowPanel(true);
    } else {
      alert('Неверный пароль!');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        const finamService = DataServiceFactory.getService('finam');
        if (finamService) {
          const parsedData = finamService.parseCSV(text);
          setCsvData(parsedData);
          console.log('Parsed CSV data:', parsedData);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Ошибка при парсинге CSV файла');
      }
    };
    reader.readAsText(file);
  };

  const handleAnalysisClick = (setup: string) => {
    const analysisData = csvData || data;
    onAnalysisRequest(setup, analysisData);
  };

  const handleAllAnalysisClick = () => {
    const analysisData = csvData || data;
    onAllAnalysisRequest(analysisData, selectedTicker);
  };

  if (!showPanel) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ marginBottom: '24px', color: '#333' }}>🔒 Секретная панель</h2>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                marginBottom: '16px'
              }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                backgroundColor: '#0074d9',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Войти
            </button>
          </form>
          <button
            onClick={onClose}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  const availableTickers = csvData ? Object.keys(csvData) : Object.keys(data);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>🔓 Секретная панель управления</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3>📁 Загрузка CSV данных</h3>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{
              padding: '8px',
              border: '2px dashed #ddd',
              borderRadius: '6px',
              width: '100%'
            }}
          />
          {csvData && (
            <div style={{ marginTop: '8px', color: '#4CAF50', fontSize: '14px' }}>
              ✓ CSV файл загружен: {Object.keys(csvData).length} тикеров
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3>📊 Выбор тикера для анализа</h3>
          <select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '200px'
            }}
          >
            <option value="">Все тикеры</option>
            {availableTickers.map(ticker => (
              <option key={ticker} value={ticker}>{ticker}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3>🔍 Анализ по стратегиям</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <button
              onClick={() => handleAnalysisClick('Сетап черепашки')}
              style={{
                padding: '12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🐢 Черепашки
            </button>
            <button
              onClick={() => handleAnalysisClick('Сетап низк волотильности + мини-гепы вверх на 3-5 последних свечках')}
              style={{
                padding: '12px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              📉 Низкая волатильность
            </button>
            <button
              onClick={() => handleAnalysisClick('Сетап глиссада v2')}
              style={{
                padding: '12px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ✈️ Глиссада
            </button>
            <button
              onClick={() => handleAnalysisClick('Сетап буква U')}
              style={{
                padding: '12px',
                backgroundColor: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🔄 U-паттерн
            </button>
            <button
              onClick={() => handleAnalysisClick('Сетап Oops')}
              style={{
                padding: '12px',
                backgroundColor: '#F44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ⚡ Oops
            </button>
            <button
              onClick={() => handleAnalysisClick('Сетап 365 Х 50')}
              style={{
                padding: '12px',
                backgroundColor: '#607D8B',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              📈 SMA 365x50
            </button>
            <button
              onClick={() => handleAnalysisClick('Сетап пробитие')}
              style={{
                padding: '12px',
                backgroundColor: '#795548',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🚀 Пробитие
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3>🎯 Комплексный анализ</h3>
          <button
            onClick={handleAllAnalysisClick}
            style={{
              padding: '16px 24px',
              backgroundColor: '#E91E63',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            🚀 Запустить все анализы
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
          Используются данные: {csvData ? 'CSV файл' : 'MOEX API'}
          {selectedTicker && ` | Тикер: ${selectedTicker}`}
        </div>
      </div>
    </div>
  );
}; 