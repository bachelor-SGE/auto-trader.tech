import { SortOption, AnalysisSetup } from '../types';

export const TICKERS = [
  'ABIO','ABRD','AFKS','AFLT','AGRO','AKAI','AKBC','AKFB','AKGD','AKGP','AKHT','AKIE','AKMB','AKME','AKMM','AKMP','AKPP','AKQU','AKRN','AKUP','ALRS','AMEZ','AMFL','AMGB','AMNR','AMNY','AMRE','AMRH','APRI','APTK','AQUA','ARSA','ASSB','ASTR','AVAN','BANE','BANEP','BCSB','BCSD','BCSG','BCSR','BCSW','BELU','BISVP','BLNG','BNDA','BNDB','BNDC','BOND','BRZL','BSPB','BSPBP','CARM','CASH','CBOM','CHGZ','CHKZ','CHMF','CHMK','CNRU','CNTL','CNTLP','CNYM','DATA','DELI','DIAS','DIOD','DIVD','DVEC','DZRD','DZRDP','EELT','ELFV','ELMT','ENPG','EQMX','ESGE','ESGR','ETLN','EUTR','FEES','FESH','FINC','FIXP','FLOT','FMMM','GAZA','GAZAP','GAZC','GAZP','GAZS','GAZT','GCHE','GECO','GEMA','GEMC','GMKN','GOLD','GOOD','GROD','GTRK','HEAD','HIMCP','HNFG','HYDR','IGST','IGSTP','INFL','INGO','IRAO','IRKT','IVAT','JNOS','JNOSP','KAZT','KAZTP','KBSB','KCHE','KCHEP','KFBA','KGKC','KGKCP','KLSB','KLVZ','KMAZ','KMEZ','KOGK','KRKN','KRKNP','KRKOP','KROT','KROTP','KRSB','KRSBP','KUZB','KZOS','KZOSP','LEAS','LENT','LIFE','LKOH','LMBZ','LNZL','LNZLP','LPSB','LQDT','LSNG','LSNGP','LSRG','LVHK','MAGE','MAGEP','MAGN','MBNK','MDMG','MFGS','MFGSP','MGKL','MGNT','MGNZ','MGTS','MGTSP','MISB','MISBP','MKBD','MOEX','MONY','MRKC','MRKK','MRKP','MRKS','MRKU','MRKV','MRKY','MRKZ','MRSB','MSNG','MSRS','MSTT','MTLR','MTLRP','MTSS','MVID','NAUK','NFAZ','NKHP','NKNC','NKNCP','NKSH','NLMK','NMTP','NNSB','NNSBP','NSVZ','NVTK','OBLG','OGKB','OKEY','OMZZP','OPNB','OPNR','OZON','OZPH','PAZA','PHOR','PIKK','PLZL','PMSB','PMSBP','POSI','PRFN','PRIE','PRMB','PRMD','PSGM','PSMM','PSRB','QIWI','RAGR','RASP','RBCM','RDRB','RENI','RGSS','RKKE','RNFT','ROLO','ROSN','ROST','RSHU','RTGZ','RTKM','RTKMP','RTSB','RTSBP','RU0005418747','RU0006922010','RU0006922044','RU000A0ERGA7','RU000A0HGNG6','RU000A0HGNH4','RU000A0JP773','RU000A0JP799','RU000A0JPMD2','RU000A0JPZL7','RU000A0JPZP8','RU000A0JR282','RU000A0JR290','RU000A0JR2A5','RU000A0JR2C1','RU000A0JRHC0','RU000A0JRUQ3','RU000A0JS991','RU000A0JT4S1','RU000A0JTVY1','RU000A0JUR61','RU000A0JUYB1','RU000A0JVEZ0','RU000A0JVGP6','RU000A0JVJ29','RU000A0JWAW3','RU000A0JWCE7','RU000A0JXP78','RU000A0JXWF0','RU000A0ZYC64','RU000A0ZZ422','RU000A0ZZ5R2','RU000A0ZZAU6','RU000A0ZZCD8','RU000A0ZZMD7','RU000A0ZZML0','RU000A0ZZMN6','RU000A0ZZVH9','RU000A1000W4','RU000A1000Y0','RU000A100EQ2','RU000A100WZ5','RU000A101NK4','RU000A101UK9','RU000A101UY0','RU000A101YY2','RU000A1022Z1','RU000A1027E5','RU000A102AH5','RU000A102N77','RU000A102PE0','RU000A102PF7','RU000A102PN1','RU000A102PQ4','RU000A1034U7','RU000A103B62','RU000A103HD7','RU000A104172','RU000A104FB3','RU000A104KU3','RU000A104M43','RU000A104YX8','RU000A105153','RU000A105328','RU000A105GY0','RU000A105R70','RU000A105RJ8','RU000A105TU1','RU000A1068X9','RU000A106G80','RU000A106LB6','RU000A106LC4','RU000A106MG3','RU000A106N57','RU000A1075T2','RU000A107860','RU000A1079J5','RU000A107J37','RU000A107RE5','RU000A107U08','RU000A108157','RU000A108751','RU000A108KP4','RU000A108RS3','RU000A108TT7','RU000A108UH0','RU000A108VR7','RU000A108ZB2','RU000A1092L4','RU000A1095D4','RU000A1099U0','RU000A109G79','RU000A109QR5','RU000A109R27','RU000A10A489','RU000A10AN72','RU000A10AQT4','RU000A10ATA8','RU000A10BM31','RUAL','RUSI','RZSB','SAGO','SAGOP','SARE','SAREP','SBBC','SBBY','SBCB','SBCN','SBCS','SBDS','SBER','SBERP','SBFR','SBGB','SBGD','SBHI','SBLB','SBMM','SBMX','SBPS','SBRB','SBRI','SBRS','SBSC','SBWS','SCFT','SCLI','SELG','SFIN','SGZH','SIBN','SIPO','SLEN','SMCF','SMLT','SNGS','SNGSP','SOFL','SPBE','STSB','STSBP','SUGB','SVAV','SVCB','SVET','SVETP','T','TASB','TASBP','TATN','TATNP','TBEU','TBRU','TDIV','TEUR','TGKA','TGKB','TGKBP','TGKN','TGLD','TITR','TLCB','TMON','TMOS','TNSE','TOFZ','TORS','TORSP','TPAY','TRMK','TRND','TRNFP','TRUR','TTLK','TUSD','TUZA','UGLD','UKUZ','UNAC','UNKL','UPRO','URKZ','USBN','UTAR','UWGN','VEON-RX','VGSB','VGSBP','VJGZ','VJGZP','VKCO','VLHZ','VRSB','VRSBP','VSEH','VSMO','VSYD','VSYDP','VTBR','WILD','WTCM','WTCMP','WUSH','X5','XHOUSE','YAKG','YDEX','YKEN','YKENP','YRSB','YRSBP','YUAN','ZAYM','ZILL','ZVEZ'
];

export const DAY_OPTIONS = [7, 14, 30, 60, 100, 180];

export const SORT_OPTIONS: SortOption[] = [
  { value: 'growth', label: 'По росту' },
  { value: 'fall', label: 'По падению' },
  { value: 'alpha', label: 'По алфавиту' },
  { value: 'random', label: 'Случайно' },
];

export const ANALYSIS_SETUPS: AnalysisSetup[] = [
  {
    name: 'Сетап черепашки',
    description: 'Анализ пробития уровней по стратегии черепах',
    algorithm: '1. Берём последние 20 баров OHLC.\n2. Если Close<sub>последний</sub> > High<sub>предыдущие 19</sub> — ЛОНГ, стоп по минимуму последних 10.\n3. Если Close<sub>последний</sub> < Low<sub>предыдущие 19</sub> — ШОРТ, стоп по максимуму последних 10.'
  },
  {
    name: 'Сетап низк волотильности + мини-гепы вверх на 3-5 последних свечках',
    description: 'Анализ низкой волатильности с гэпами',
    algorithm: '1. Берём последние 30 баров OHLC.\n2. Ищем последовательность из 3-5 свечей с телом 0-2%.\n3. Все свечи зелёные или все красные.\n4. Между свечами гэпы 0.1-1%.\n5. Для лонга стоп по минимуму последних 2, для шорта — по максимуму.'
  },
  {
    name: 'Сетап глиссада v2',
    description: 'Анализ по SMA18 и SMA50 с проверкой волатильности',
    algorithm: '1. Берём последние 50 баров OHLC.\n2. Рассчитываем SMA18 и SMA50.\n3. Проверяем низкую волатильность.\n4. Определяем направление ускорения.\n5. Проверяем условия для лонга и шорта.'
  },
  {
    name: 'Сетап буква U',
    description: 'Поиск паттерна U-образной формы',
    algorithm: '1. Берём последние 100 баров OHLC.\n2. Ищем локальный максимум (A), затем минимум (B) с монотонным снижением, затем возврат (C) с монотонным ростом.\n3. Условия: A - максимум, B - минимум, C - возврат к максимуму (>=99%).\n4. Entry: close в точке C, SL: low в точке B, TP: high в точке A.'
  },
  {
    name: 'Сетап Oops',
    description: 'Анализ экстремумов и условий входа',
    algorithm: '1. Берём последние 40 баров OHLC.\n2. Ищем экстремумы (high/low) и условия входа.\n3. Bullish: high/close > Hmax, затем low/close < min - вход.\n4. Bearish: low/close < Lmin, затем high/close > max - вход.\n5. SL/TP по формуле.'
  },
  {
    name: 'Сетап 365 Х 50',
    description: 'Анализ пересечений SMA50 и SMA365',
    algorithm: '1. Берём последние 379 баров.\n2. Считаем SMA50 и SMA365.\n3. В окне 15 баров ищем пересечение SMA50 и SMA365.\n4. Gold cross: SMA50 снизу вверх, Death cross: сверху вниз.'
  },
  {
    name: 'Сетап пробитие',
    description: 'Анализ пробития максимумов',
    algorithm: '1. Берём последние 30 баров OHLC.\n2. Находим максимум High<sub>max</sub> за 30 дней.\n3. Если Close<sub>последний</sub> или High<sub>последний</sub> >= High<sub>max</sub> × 0.99,\n   и превышение не более 1% — сигнал.'
  }
];

export const SECRET_PASSWORD = 'VeryHardPass100%';

export const FUTURES_TICKERS = [
  "AEH6","AEM6","AEU5","AEZ5","AFU5","AFZ5","AKU5","AKZ5","ALU5","ALZ5","ANU5","ANZ5","ARH6","ARM6","ARU5","ARZ5","ASU5","ASZ5","AUU5","AUZ5","BBU5","BBZ5","BDU5","BDZ5","BMN5","BMQ5","BMU5","BMV5","BMX5","BNU5","BNZ5","BRF6","BRG6","BRH6","BRJ6","BRN5","BRQ5","BRU5","BRV5","BRX5","BRZ5","BSU5","BSZ5","BYU5","BYZ5","CAU5","CAZ5","CCN5","CCU5","CEU5","CEZ5","CFH6","CFU5","CFZ5","CHU5","CHZ5","CMU5","CMZ5","CNYRUBF","CRH6","CRM6","CRU5","CRU6","CRZ5","CRZ6","CSU5","CSZ5","DJU5","DJZ5","DXU5","DXZ5","ECU5","ECZ5","EDH6","EDU5","EDZ5","EGU5","EGZ5","EJU5","EJZ5","EMU5","EMZ5","EuH6","EuM6","EURRUBF","EuU5","EuU6","EuZ5","EuZ6","FEU5","FEZ5","FFM5","FFN5","FFQ5","FLU5","FLZ5","FNU5","FNZ5","FSU5","FSZ5","GAZPF","GDH6","GDU5","GDZ5","GKU5","GKZ5","GLDRUBF","GLH6","GLU5","GLZ5","GMU6","GNU5","GNZ5","GQH6","GRU6","GSR5","GSR6","GVU5","GVZ5","HGZ6","HRU5","HRZ5","IAZ6","IFV5","IFT5","IFT6","IGN5","IGU5","IMH6","IMOEXF","IMZ5","INGU5","INGZ5","INRUBF","IOH5","IOH6","IOU5","IOZ5","IST5","IST6","ITH6","JYU5","JYZ5","JPYU5","JPYZ5","KCV5","KCZ5","KMI5","KMZ5","KRH6","KRU5","KRZ5","KZH6","LHO5","LHZ5","LNU5","LNZ5","MAU5","MAZ5","MBZ5","MDZ5","MEU5","MEZ5","MHPF","MICEXR","MKSM","MMF5","MMFD","MMH6","MNR5","MNZ5","MOEXF","MORT5","MORT6","MPU5","MPZ5","MTH6","MTR5","MTZ5","MVZ5","MXU5","MXZ5","MZU5","MZZ5","NGF5","NGZ5","NIU5","NIZ5","NKD5","NKD6","NOK5","NOK6","NPF5","NPF6","NPU5","NPZ5","NSU5","NSZ5","NTU5","NTZ5","NXY5","OBG5","OBR5","ODF5","ODG5","ODH6","OEF5","OEZ5","OGF5","OGZ5","OIH6","OKH6","OKIJ5","OIS5","OIZ5","OJU5","OJV5","OJZ5","OHU5","OHZ5","OILF","OIH5","OQH6","ORU6","OSU5","OSZ5","OTF6","OUT5","OVZ5","OWZ5","OZU5","OZZ5","PALM","PBDQ","PDD5","PAO5","PAVU","PAVZ","PDV5","PDV6","PDU5","PDU6","PFD5","PFD6","PFHF","PFUF","PFUR","PIH5","PIH6","PJZ5","PLH6","PLM6","PMV5","PMX5","PNY6","POD5","PPU5","PPZ5","PRH5","PRZ5","PSU5","PSZ5","PTF6","PZUZ","RISKF","RNFTF","RODV","RUHF","RUIZ5","RUU5","RUZ5","RYU5","RYZ5","RTS5","RTS6","RTZM","RTZV","RTZVF","SFHHF","SFHUF","SFHUR","SFURF","SFURF.D","SIH6","SIZ5","SJI6","SKZ5","SLR5","SLR6","SMU5","SMZ5","SNGS","SPBFUT","SPZ6","SQM5","SQZ5","SRT5","STI5","STZ5","SUH6","SUZ5","SXM5","SXZ5","SYHU","SYHZ","TAURUS","TCH5","TCH6","TCM5","TCQ5","TCZ5","TEH5","TEH6","TEX5","TEX6","TFU6","THU5","THZ5","TIU5","TIU6","IIHZ5","TOLU5","TUR5","TUR6","TXH5","TXH6","TZH6","UCD5","UCD6","UFD5","UFU5","UFZ5","UGQ5","UGUF","UFUF","UHW5","UHS5","ULT5","ULT6","UQM5","UQM6","URH6","USH6","UUU5","UUU6","UVZ5","UZZ5","VALX","VIM5","VKN5","VPU5","VPU6","VUZ5","WHEAT5","WHEAT6","XAUUSD","XOMH6","YIH5","YIH6","YUZ5","ZCU5","ZLZ5","ZLZ6","ZT5","ZQ5","ZVZ5"
];

export const ALL_TICKERS = [...TICKERS, ...FUTURES_TICKERS]; 