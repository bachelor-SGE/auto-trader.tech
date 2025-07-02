import { useState, useCallback } from 'react';
import { AnalysisResult, Candle, IAnalysisProvider } from '../types';
import { AnalysisService } from '../services/analysisService';

export class AnalysisProvider implements IAnalysisProvider {
  private _isAnalyzing: boolean = false;
  private _analyzeProgress: number = 0;
  private _currentTicker: string | null = null;
  private _analyzeResults: AnalysisResult[] | Record<string, AnalysisResult[]> | null = null;
  private analysisService: AnalysisService;

  constructor() {
    this.analysisService = new AnalysisService();
  }

  async runAnalysis(
    setup: string, 
    data: Record<string, Candle[]>, 
    csvTicker?: string
  ): Promise<AnalysisResult[]> {
    this._isAnalyzing = true;
    this._analyzeProgress = 0;
    this._currentTicker = null;
    this._analyzeResults = null;
    
    await new Promise(r => setTimeout(r, 80));
    
    let tickers: string[];
    if (csvTicker && data[csvTicker]) {
      tickers = [csvTicker];
    } else {
      tickers = Object.keys(data).filter(ticker => data[ticker]?.length);
    }
    
    console.log('tickers for analysis', tickers);
    const results: AnalysisResult[] = [];
    
    for (let i = 0; i < tickers.length; ++i) {
      const ticker = tickers[i];
      const candles = data[ticker] || [];
      
      console.log('bars for analysis', ticker, candles);
      this._currentTicker = ticker;
      this._analyzeProgress = Math.round((i / tickers.length) * 100);
      await new Promise(res => setTimeout(res, 30));
      
      try {
        const tickerResults = await this.analysisService.analyze(setup, candles, ticker);
        results.push(...tickerResults);
      } catch (error) {
        console.error(`Error analyzing ${ticker}:`, error);
      }
    }
    
    this._isAnalyzing = false;
    this._analyzeProgress = 100;
    this._currentTicker = null;
    this._analyzeResults = results;
    console.log('analyzeResults', results);
    
    return results;
  }

  async runAllAnalysis(
    data: Record<string, Candle[]>, 
    csvTicker?: string
  ): Promise<Record<string, AnalysisResult[]>> {
    this._isAnalyzing = true;
    this._analyzeProgress = 0;
    this._currentTicker = null;
    this._analyzeResults = null;
    
    const setups = this.analysisService.getAllStrategies().map(s => s.name);
    const allResults: Record<string, AnalysisResult[]> = {};
    
    for (let i = 0; i < setups.length; ++i) {
      this._analyzeProgress = Math.round((i / setups.length) * 100);
      const res = await this.runAnalysis(setups[i], data, csvTicker);
      allResults[setups[i]] = res;
    }
    
    this._isAnalyzing = false;
    this._analyzeProgress = 100;
    this._currentTicker = null;
    this._analyzeResults = allResults;
    
    return allResults;
  }

  isAnalyzing(): boolean {
    return this._isAnalyzing;
  }

  getProgress(): number {
    return this._analyzeProgress;
  }

  getCurrentTicker(): string | null {
    return this._currentTicker;
  }

  getResults(): AnalysisResult[] | Record<string, AnalysisResult[]> | null {
    return this._analyzeResults;
  }

  getAllStrategies() {
    return this.analysisService.getAllStrategies();
  }
}

export const useAnalysis = () => {
  const [analysisProvider] = useState(() => new AnalysisProvider());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [currentTicker, setCurrentTicker] = useState<string | null>(null);
  const [analyzeResults, setAnalyzeResults] = useState<AnalysisResult[] | Record<string, AnalysisResult[]> | null>(null);
  const [analysisModal, setAnalysisModal] = useState<string | null>(null);

  const runAnalysis = useCallback(async (
    setup: string, 
    data: Record<string, Candle[]>, 
    csvTicker?: string
  ): Promise<AnalysisResult[]> => {
    const results = await analysisProvider.runAnalysis(setup, data, csvTicker);
    setIsAnalyzing(analysisProvider.isAnalyzing());
    setAnalyzeProgress(analysisProvider.getProgress());
    setCurrentTicker(analysisProvider.getCurrentTicker());
    setAnalyzeResults(analysisProvider.getResults());
    return results;
  }, [analysisProvider]);

  const runAllAnalysis = useCallback(async (
    data: Record<string, Candle[]>, 
    csvTicker?: string
  ): Promise<Record<string, AnalysisResult[]>> => {
    const results = await analysisProvider.runAllAnalysis(data, csvTicker);
    setIsAnalyzing(analysisProvider.isAnalyzing());
    setAnalyzeProgress(analysisProvider.getProgress());
    setCurrentTicker(analysisProvider.getCurrentTicker());
    setAnalyzeResults(analysisProvider.getResults());
    return results;
  }, [analysisProvider]);

  const openAnalysisModal = useCallback((setup: string) => {
    setAnalysisModal(setup);
  }, []);

  const closeAnalysisModal = useCallback(() => {
    setAnalysisModal(null);
  }, []);

  return {
    isAnalyzing,
    analyzeProgress,
    currentTicker,
    analyzeResults,
    analysisModal,
    runAnalysis,
    runAllAnalysis,
    openAnalysisModal,
    closeAnalysisModal,
    getAllStrategies: () => analysisProvider.getAllStrategies()
  };
}; 