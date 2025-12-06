# Backend Instructions: Investment Portfolio Tracking API

## Overview

The Investment Portfolio Tracking module enables companies to track their investment holdings, monitor gains/losses, record dividends, and integrate investment performance with overall financial reporting.

**Purpose**: Track company investments in stocks, mutual funds, REITs, sukuk, bonds, forex, crypto, and commodities.

**Currency**: All monetary values are stored in **halalas** (SAR × 100). Example: 1,000 SAR = 100,000 halalas.

---

## Required Packages

```bash
# TradingView API for real-time prices
npm install @mathieuc/tradingview

# Yahoo Finance as fallback
npm install yahoo-finance2

# Web scraping for Tadawul data
npm install axios cheerio puppeteer

# Scheduling
npm install node-cron

# Caching
npm install node-cache
```

---

## Supported Asset Types

### 1. Saudi Market (Tadawul)
| Type | Count | Example |
|------|-------|---------|
| Stocks | 200+ | أرامكو (2222), الراجحي (1120) |
| REITs | 18+ | الرياض ريت (4330) |
| ETFs | 10+ | FALCOM 30 (9001) |
| Sukuk | Various | Listed sukuk |

### 2. International Markets
| Type | Examples |
|------|----------|
| US Stocks | AAPL, GOOGL, MSFT, AMZN, TSLA, META, NVDA |
| Forex | EUR/USD, GBP/USD, USD/JPY, USD/SAR |
| Crypto | BTC, ETH, XRP |
| Commodities | Gold, Silver, Oil |

---

## Data Models

### Investment Model

```typescript
interface Investment {
    _id: string                     // MongoDB ObjectId

    // ========== IDENTIFICATION ==========
    symbol: string                  // Required: Stock/Fund symbol (e.g., '1120', 'AAPL', 'BTC')
    name: string                    // Required: Name in Arabic
    nameEn: string                  // Name in English

    // ========== CLASSIFICATION ==========
    type: InvestmentType            // Required
    market: Market                  // Required
    sector: string                  // Sector in Arabic
    sectorEn: string                // Sector in English
    category: Category              // For financial reporting

    // ========== SYMBOLS FOR PRICE APIs ==========
    tradingViewSymbol: string       // For TradingView (e.g., 'TADAWUL:1120', 'NASDAQ:AAPL')
    yahooSymbol: string             // For Yahoo Finance (e.g., '1120.SR', 'AAPL')

    // ========== PURCHASE DETAILS ==========
    purchaseDate: string            // Required: ISO date
    purchasePrice: number           // Required: Price per unit in halalas
    quantity: number                // Required: Number of units
    totalCost: number               // Calculated: purchasePrice × quantity (halalas)
    fees: number                    // Purchase fees (halalas)

    // ========== CURRENT VALUE (Auto-updated) ==========
    currentPrice: number            // Current market price per unit (halalas)
    currentValue: number            // currentPrice × quantity (halalas)
    previousClose: number           // Yesterday's closing price (halalas)
    dailyChange: number             // Today's change (halalas)
    dailyChangePercent: number      // Today's change %
    lastPriceUpdate: string         // ISO datetime

    // ========== PERFORMANCE ==========
    gainLoss: number                // currentValue - totalCost (halalas)
    gainLossPercent: number         // (gainLoss / totalCost) × 100
    dividendsReceived: number       // Total dividends (halalas)
    totalReturn: number             // gainLoss + dividendsReceived (halalas)
    totalReturnPercent: number      // (totalReturn / totalCost) × 100

    // ========== STATUS ==========
    status: InvestmentStatus        // 'active' | 'sold' | 'partial_sold'
    notes: string
    createdAt: string
    updatedAt: string
    userId: string
    companyId: string
}

type InvestmentType = 'stock' | 'mutual_fund' | 'etf' | 'reit' | 'sukuk' | 'bond' | 'forex' | 'crypto' | 'commodity'
type Market = 'tadawul' | 'us' | 'forex' | 'crypto' | 'commodities'
type Category = 'equities' | 'fixed_income' | 'real_estate' | 'mutual_funds' | 'alternative' | 'currencies' | 'commodities'
type InvestmentStatus = 'active' | 'sold' | 'partial_sold'
```

### Investment Transaction Model

```typescript
interface InvestmentTransaction {
    _id: string
    investmentId: string
    type: 'purchase' | 'sale' | 'dividend' | 'fee'
    date: string
    quantity?: number
    pricePerUnit?: number           // halalas
    amount: number                  // halalas (positive=income, negative=expense)
    fees?: number                   // halalas
    description: string
    createdAt: string
}
```

---

## Complete Symbol Database

### Create this file: `data/symbols.ts`

```typescript
// ============================================================
// SAUDI STOCKS (Tadawul) - 50+ Major Companies
// ============================================================
export const SAUDI_STOCKS = [
    // Banking (البنوك)
    { symbol: '1120', tv: 'TADAWUL:1120', yahoo: '1120.SR', nameAr: 'مصرف الراجحي', nameEn: 'Al Rajhi Bank', sector: 'Banking', sectorAr: 'البنوك' },
    { symbol: '1180', tv: 'TADAWUL:1180', yahoo: '1180.SR', nameAr: 'بنك الأهلي', nameEn: 'Saudi National Bank', sector: 'Banking', sectorAr: 'البنوك' },
    { symbol: '1150', tv: 'TADAWUL:1150', yahoo: '1150.SR', nameAr: 'بنك الإنماء', nameEn: 'Alinma Bank', sector: 'Banking', sectorAr: 'البنوك' },
    { symbol: '1050', tv: 'TADAWUL:1050', yahoo: '1050.SR', nameAr: 'بنك الجزيرة', nameEn: 'Bank AlJazira', sector: 'Banking', sectorAr: 'البنوك' },
    { symbol: '1020', tv: 'TADAWUL:1020', yahoo: '1020.SR', nameAr: 'بنك الرياض', nameEn: 'Riyad Bank', sector: 'Banking', sectorAr: 'البنوك' },
    { symbol: '1030', tv: 'TADAWUL:1030', yahoo: '1030.SR', nameAr: 'البنك السعودي الفرنسي', nameEn: 'Banque Saudi Fransi', sector: 'Banking', sectorAr: 'البنوك' },
    { symbol: '1010', tv: 'TADAWUL:1010', yahoo: '1010.SR', nameAr: 'البنك السعودي البريطاني', nameEn: 'SABB', sector: 'Banking', sectorAr: 'البنوك' },
    { symbol: '1060', tv: 'TADAWUL:1060', yahoo: '1060.SR', nameAr: 'البنك العربي الوطني', nameEn: 'Arab National Bank', sector: 'Banking', sectorAr: 'البنوك' },

    // Energy (الطاقة)
    { symbol: '2222', tv: 'TADAWUL:2222', yahoo: '2222.SR', nameAr: 'أرامكو السعودية', nameEn: 'Saudi Aramco', sector: 'Energy', sectorAr: 'الطاقة' },
    { symbol: '2082', tv: 'TADAWUL:2082', yahoo: '2082.SR', nameAr: 'أكوا باور', nameEn: 'ACWA Power', sector: 'Energy', sectorAr: 'الطاقة' },

    // Petrochemicals (البتروكيماويات)
    { symbol: '2010', tv: 'TADAWUL:2010', yahoo: '2010.SR', nameAr: 'سابك', nameEn: 'SABIC', sector: 'Petrochemicals', sectorAr: 'البتروكيماويات' },
    { symbol: '2330', tv: 'TADAWUL:2330', yahoo: '2330.SR', nameAr: 'المتقدمة', nameEn: 'Advanced Petrochemical', sector: 'Petrochemicals', sectorAr: 'البتروكيماويات' },
    { symbol: '2310', tv: 'TADAWUL:2310', yahoo: '2310.SR', nameAr: 'سبكيم', nameEn: 'SIPCHEM', sector: 'Petrochemicals', sectorAr: 'البتروكيماويات' },
    { symbol: '2290', tv: 'TADAWUL:2290', yahoo: '2290.SR', nameAr: 'ينساب', nameEn: 'Yanbu Petrochemical', sector: 'Petrochemicals', sectorAr: 'البتروكيماويات' },
    { symbol: '2380', tv: 'TADAWUL:2380', yahoo: '2380.SR', nameAr: 'بترو رابغ', nameEn: 'Petro Rabigh', sector: 'Petrochemicals', sectorAr: 'البتروكيماويات' },

    // Telecom (الاتصالات)
    { symbol: '7010', tv: 'TADAWUL:7010', yahoo: '7010.SR', nameAr: 'الاتصالات السعودية', nameEn: 'STC', sector: 'Telecom', sectorAr: 'الاتصالات' },
    { symbol: '7020', tv: 'TADAWUL:7020', yahoo: '7020.SR', nameAr: 'اتحاد اتصالات', nameEn: 'Mobily', sector: 'Telecom', sectorAr: 'الاتصالات' },
    { symbol: '7030', tv: 'TADAWUL:7030', yahoo: '7030.SR', nameAr: 'زين السعودية', nameEn: 'Zain KSA', sector: 'Telecom', sectorAr: 'الاتصالات' },

    // Retail (التجزئة)
    { symbol: '4190', tv: 'TADAWUL:4190', yahoo: '4190.SR', nameAr: 'جرير', nameEn: 'Jarir Marketing', sector: 'Retail', sectorAr: 'التجزئة' },
    { symbol: '4003', tv: 'TADAWUL:4003', yahoo: '4003.SR', nameAr: 'إكسترا', nameEn: 'Extra', sector: 'Retail', sectorAr: 'التجزئة' },
    { symbol: '4001', tv: 'TADAWUL:4001', yahoo: '4001.SR', nameAr: 'عبدالله العثيم', nameEn: 'Abdullah Al Othaim', sector: 'Retail', sectorAr: 'التجزئة' },

    // Food (الأغذية)
    { symbol: '2280', tv: 'TADAWUL:2280', yahoo: '2280.SR', nameAr: 'المراعي', nameEn: 'Almarai', sector: 'Food', sectorAr: 'الأغذية' },
    { symbol: '6010', tv: 'TADAWUL:6010', yahoo: '6010.SR', nameAr: 'نادك', nameEn: 'NADEC', sector: 'Food', sectorAr: 'الأغذية' },
    { symbol: '2270', tv: 'TADAWUL:2270', yahoo: '2270.SR', nameAr: 'صافولا', nameEn: 'Savola', sector: 'Food', sectorAr: 'الأغذية' },

    // Healthcare (الرعاية الصحية)
    { symbol: '4002', tv: 'TADAWUL:4002', yahoo: '4002.SR', nameAr: 'المواساة', nameEn: 'Mouwasat Medical', sector: 'Healthcare', sectorAr: 'الرعاية الصحية' },
    { symbol: '4004', tv: 'TADAWUL:4004', yahoo: '4004.SR', nameAr: 'دله الصحية', nameEn: 'Dallah Healthcare', sector: 'Healthcare', sectorAr: 'الرعاية الصحية' },
    { symbol: '4005', tv: 'TADAWUL:4005', yahoo: '4005.SR', nameAr: 'رعاية', nameEn: 'Care', sector: 'Healthcare', sectorAr: 'الرعاية الصحية' },

    // Real Estate (العقارات)
    { symbol: '4300', tv: 'TADAWUL:4300', yahoo: '4300.SR', nameAr: 'دار الأركان', nameEn: 'Dar Al Arkan', sector: 'Real Estate', sectorAr: 'العقارات' },
    { symbol: '4250', tv: 'TADAWUL:4250', yahoo: '4250.SR', nameAr: 'جبل عمر', nameEn: 'Jabal Omar', sector: 'Real Estate', sectorAr: 'العقارات' },

    // Insurance (التأمين)
    { symbol: '8010', tv: 'TADAWUL:8010', yahoo: '8010.SR', nameAr: 'التعاونية', nameEn: 'Tawuniya', sector: 'Insurance', sectorAr: 'التأمين' },

    // Industrial (الصناعة)
    { symbol: '1211', tv: 'TADAWUL:1211', yahoo: '1211.SR', nameAr: 'معادن', nameEn: 'Maaden', sector: 'Industrial', sectorAr: 'الصناعة' },
    { symbol: '3010', tv: 'TADAWUL:3010', yahoo: '3010.SR', nameAr: 'أسمنت العربية', nameEn: 'Arabian Cement', sector: 'Industrial', sectorAr: 'الصناعة' },

    // Utilities (المرافق)
    { symbol: '5110', tv: 'TADAWUL:5110', yahoo: '5110.SR', nameAr: 'الكهرباء', nameEn: 'Saudi Electricity', sector: 'Utilities', sectorAr: 'المرافق العامة' },

    // Financial Services
    { symbol: '1111', tv: 'TADAWUL:1111', yahoo: '1111.SR', nameAr: 'مجموعة تداول', nameEn: 'Tadawul Group', sector: 'Financial Services', sectorAr: 'الخدمات المالية' },
]

// ============================================================
// SAUDI REITs (صناديق الريت)
// ============================================================
export const SAUDI_REITS = [
    { symbol: '4330', tv: 'TADAWUL:4330', yahoo: '4330.SR', nameAr: 'الرياض ريت', nameEn: 'Riyad REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4331', tv: 'TADAWUL:4331', yahoo: '4331.SR', nameAr: 'الجزيرة ريت', nameEn: 'Aljazira Mawten REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4332', tv: 'TADAWUL:4332', yahoo: '4332.SR', nameAr: 'جدوى ريت الحرمين', nameEn: 'Jadwa REIT Al Haramain', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4334', tv: 'TADAWUL:4334', yahoo: '4334.SR', nameAr: 'سدكو كابيتال ريت', nameEn: 'SEDCO Capital REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4335', tv: 'TADAWUL:4335', yahoo: '4335.SR', nameAr: 'مشاركة ريت', nameEn: 'Musharaka REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4336', tv: 'TADAWUL:4336', yahoo: '4336.SR', nameAr: 'ملكية ريت', nameEn: 'Mulkia REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4337', tv: 'TADAWUL:4337', yahoo: '4337.SR', nameAr: 'سيكو السعودية ريت', nameEn: 'SICO Saudi REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4338', tv: 'TADAWUL:4338', yahoo: '4338.SR', nameAr: 'الأندلس ريت', nameEn: 'Alandalus REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4339', tv: 'TADAWUL:4339', yahoo: '4339.SR', nameAr: 'دراية ريت', nameEn: 'Derayah REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4340', tv: 'TADAWUL:4340', yahoo: '4340.SR', nameAr: 'الراجحي ريت', nameEn: 'Al Rajhi REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4342', tv: 'TADAWUL:4342', yahoo: '4342.SR', nameAr: 'جدوى ريت السعودية', nameEn: 'Jadwa Saudi REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4344', tv: 'TADAWUL:4344', yahoo: '4344.SR', nameAr: 'الإنماء ريت للتجزئة', nameEn: 'Alinma Retail REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4345', tv: 'TADAWUL:4345', yahoo: '4345.SR', nameAr: 'الخبير ريت', nameEn: 'Alkhabeer REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4346', tv: 'TADAWUL:4346', yahoo: '4346.SR', nameAr: 'مبكو ريت', nameEn: 'MEFIC REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4347', tv: 'TADAWUL:4347', yahoo: '4347.SR', nameAr: 'بنيان ريت', nameEn: 'Bonyan REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
    { symbol: '4348', tv: 'TADAWUL:4348', yahoo: '4348.SR', nameAr: 'الأهلي ريت', nameEn: 'AlAhli REIT', sector: 'REIT', sectorAr: 'صناديق الريت' },
]

// ============================================================
// SAUDI ETFs (صناديق المؤشرات)
// ============================================================
export const SAUDI_ETFS = [
    { symbol: '9001', tv: 'TADAWUL:9001', yahoo: '9001.SR', nameAr: 'صندوق فالكم 30', nameEn: 'FALCOM 30 ETF', sector: 'ETF', sectorAr: 'صناديق المؤشرات' },
    { symbol: '9002', tv: 'TADAWUL:9002', yahoo: '9002.SR', nameAr: 'صندوق إم إس سي آي', nameEn: 'MSCI Tadawul 30 ETF', sector: 'ETF', sectorAr: 'صناديق المؤشرات' },
    { symbol: '9003', tv: 'TADAWUL:9003', yahoo: '9003.SR', nameAr: 'صندوق الإنماء', nameEn: 'Alinma ETF', sector: 'ETF', sectorAr: 'صناديق المؤشرات' },
]

// ============================================================
// INTERNATIONAL STOCKS (US Markets)
// ============================================================
export const INTERNATIONAL_STOCKS = [
    // US Tech Giants
    { symbol: 'AAPL', tv: 'NASDAQ:AAPL', yahoo: 'AAPL', nameAr: 'أبل', nameEn: 'Apple Inc.', sector: 'Technology', sectorAr: 'التقنية' },
    { symbol: 'GOOGL', tv: 'NASDAQ:GOOGL', yahoo: 'GOOGL', nameAr: 'جوجل', nameEn: 'Alphabet Inc.', sector: 'Technology', sectorAr: 'التقنية' },
    { symbol: 'MSFT', tv: 'NASDAQ:MSFT', yahoo: 'MSFT', nameAr: 'مايكروسوفت', nameEn: 'Microsoft Corp.', sector: 'Technology', sectorAr: 'التقنية' },
    { symbol: 'AMZN', tv: 'NASDAQ:AMZN', yahoo: 'AMZN', nameAr: 'أمازون', nameEn: 'Amazon.com Inc.', sector: 'Technology', sectorAr: 'التقنية' },
    { symbol: 'TSLA', tv: 'NASDAQ:TSLA', yahoo: 'TSLA', nameAr: 'تسلا', nameEn: 'Tesla Inc.', sector: 'Technology', sectorAr: 'التقنية' },
    { symbol: 'META', tv: 'NASDAQ:META', yahoo: 'META', nameAr: 'ميتا', nameEn: 'Meta Platforms', sector: 'Technology', sectorAr: 'التقنية' },
    { symbol: 'NVDA', tv: 'NASDAQ:NVDA', yahoo: 'NVDA', nameAr: 'نفيديا', nameEn: 'NVIDIA Corp.', sector: 'Technology', sectorAr: 'التقنية' },
    { symbol: 'AMD', tv: 'NASDAQ:AMD', yahoo: 'AMD', nameAr: 'إيه إم دي', nameEn: 'AMD Inc.', sector: 'Technology', sectorAr: 'التقنية' },
    { symbol: 'NFLX', tv: 'NASDAQ:NFLX', yahoo: 'NFLX', nameAr: 'نتفليكس', nameEn: 'Netflix Inc.', sector: 'Technology', sectorAr: 'التقنية' },
    { symbol: 'UBER', tv: 'NYSE:UBER', yahoo: 'UBER', nameAr: 'أوبر', nameEn: 'Uber Technologies', sector: 'Technology', sectorAr: 'التقنية' },

    // Finance
    { symbol: 'JPM', tv: 'NYSE:JPM', yahoo: 'JPM', nameAr: 'جي بي مورغان', nameEn: 'JPMorgan Chase', sector: 'Finance', sectorAr: 'المالية' },
    { symbol: 'V', tv: 'NYSE:V', yahoo: 'V', nameAr: 'فيزا', nameEn: 'Visa Inc.', sector: 'Finance', sectorAr: 'المالية' },
    { symbol: 'MA', tv: 'NYSE:MA', yahoo: 'MA', nameAr: 'ماستركارد', nameEn: 'Mastercard Inc.', sector: 'Finance', sectorAr: 'المالية' },

    // Consumer
    { symbol: 'KO', tv: 'NYSE:KO', yahoo: 'KO', nameAr: 'كوكاكولا', nameEn: 'Coca-Cola', sector: 'Consumer', sectorAr: 'السلع الاستهلاكية' },
    { symbol: 'PEP', tv: 'NASDAQ:PEP', yahoo: 'PEP', nameAr: 'بيبسي', nameEn: 'PepsiCo Inc.', sector: 'Consumer', sectorAr: 'السلع الاستهلاكية' },
    { symbol: 'MCD', tv: 'NYSE:MCD', yahoo: 'MCD', nameAr: 'ماكدونالدز', nameEn: 'McDonalds Corp.', sector: 'Consumer', sectorAr: 'السلع الاستهلاكية' },
]

// ============================================================
// FOREX PAIRS (العملات)
// ============================================================
export const FOREX_PAIRS = [
    { symbol: 'EUR/USD', tv: 'FX:EURUSD', yahoo: 'EURUSD=X', nameAr: 'اليورو/الدولار', nameEn: 'EUR/USD', sector: 'Forex', sectorAr: 'العملات' },
    { symbol: 'GBP/USD', tv: 'FX:GBPUSD', yahoo: 'GBPUSD=X', nameAr: 'الجنيه/الدولار', nameEn: 'GBP/USD', sector: 'Forex', sectorAr: 'العملات' },
    { symbol: 'USD/JPY', tv: 'FX:USDJPY', yahoo: 'USDJPY=X', nameAr: 'الدولار/الين', nameEn: 'USD/JPY', sector: 'Forex', sectorAr: 'العملات' },
    { symbol: 'USD/SAR', tv: 'FX:USDSAR', yahoo: 'SAR=X', nameAr: 'الدولار/الريال', nameEn: 'USD/SAR', sector: 'Forex', sectorAr: 'العملات' },
    { symbol: 'EUR/SAR', tv: 'FX_IDC:EURSAR', yahoo: 'EURSAR=X', nameAr: 'اليورو/الريال', nameEn: 'EUR/SAR', sector: 'Forex', sectorAr: 'العملات' },
    { symbol: 'USD/CHF', tv: 'FX:USDCHF', yahoo: 'USDCHF=X', nameAr: 'الدولار/الفرنك', nameEn: 'USD/CHF', sector: 'Forex', sectorAr: 'العملات' },
    { symbol: 'AUD/USD', tv: 'FX:AUDUSD', yahoo: 'AUDUSD=X', nameAr: 'الأسترالي/الدولار', nameEn: 'AUD/USD', sector: 'Forex', sectorAr: 'العملات' },
]

// ============================================================
// CRYPTOCURRENCIES (العملات الرقمية)
// ============================================================
export const CRYPTO = [
    { symbol: 'BTC', tv: 'COINBASE:BTCUSD', yahoo: 'BTC-USD', nameAr: 'بيتكوين', nameEn: 'Bitcoin', sector: 'Crypto', sectorAr: 'العملات الرقمية' },
    { symbol: 'ETH', tv: 'COINBASE:ETHUSD', yahoo: 'ETH-USD', nameAr: 'إيثيريوم', nameEn: 'Ethereum', sector: 'Crypto', sectorAr: 'العملات الرقمية' },
    { symbol: 'XRP', tv: 'COINBASE:XRPUSD', yahoo: 'XRP-USD', nameAr: 'ريبل', nameEn: 'Ripple XRP', sector: 'Crypto', sectorAr: 'العملات الرقمية' },
    { symbol: 'SOL', tv: 'COINBASE:SOLUSD', yahoo: 'SOL-USD', nameAr: 'سولانا', nameEn: 'Solana', sector: 'Crypto', sectorAr: 'العملات الرقمية' },
    { symbol: 'BNB', tv: 'BINANCE:BNBUSD', yahoo: 'BNB-USD', nameAr: 'بينانس', nameEn: 'BNB', sector: 'Crypto', sectorAr: 'العملات الرقمية' },
    { symbol: 'ADA', tv: 'COINBASE:ADAUSD', yahoo: 'ADA-USD', nameAr: 'كاردانو', nameEn: 'Cardano', sector: 'Crypto', sectorAr: 'العملات الرقمية' },
    { symbol: 'DOGE', tv: 'COINBASE:DOGEUSD', yahoo: 'DOGE-USD', nameAr: 'دوجكوين', nameEn: 'Dogecoin', sector: 'Crypto', sectorAr: 'العملات الرقمية' },
]

// ============================================================
// COMMODITIES (السلع)
// ============================================================
export const COMMODITIES = [
    { symbol: 'GOLD', tv: 'COMEX:GC1!', yahoo: 'GC=F', nameAr: 'الذهب', nameEn: 'Gold Futures', sector: 'Commodities', sectorAr: 'السلع' },
    { symbol: 'SILVER', tv: 'COMEX:SI1!', yahoo: 'SI=F', nameAr: 'الفضة', nameEn: 'Silver Futures', sector: 'Commodities', sectorAr: 'السلع' },
    { symbol: 'OIL', tv: 'NYMEX:CL1!', yahoo: 'CL=F', nameAr: 'النفط الخام', nameEn: 'Crude Oil WTI', sector: 'Commodities', sectorAr: 'السلع' },
    { symbol: 'BRENT', tv: 'NYMEX:BZ1!', yahoo: 'BZ=F', nameAr: 'نفط برنت', nameEn: 'Brent Crude Oil', sector: 'Commodities', sectorAr: 'السلع' },
    { symbol: 'NATGAS', tv: 'NYMEX:NG1!', yahoo: 'NG=F', nameAr: 'الغاز الطبيعي', nameEn: 'Natural Gas', sector: 'Commodities', sectorAr: 'السلع' },
    { symbol: 'COPPER', tv: 'COMEX:HG1!', yahoo: 'HG=F', nameAr: 'النحاس', nameEn: 'Copper Futures', sector: 'Commodities', sectorAr: 'السلع' },
    { symbol: 'PLATINUM', tv: 'NYMEX:PL1!', yahoo: 'PL=F', nameAr: 'البلاتين', nameEn: 'Platinum Futures', sector: 'Commodities', sectorAr: 'السلع' },
]

// ============================================================
// ALL SYMBOLS COMBINED
// ============================================================
export const ALL_SYMBOLS = [
    ...SAUDI_STOCKS.map(s => ({ ...s, market: 'tadawul', type: 'stock' })),
    ...SAUDI_REITS.map(s => ({ ...s, market: 'tadawul', type: 'reit' })),
    ...SAUDI_ETFS.map(s => ({ ...s, market: 'tadawul', type: 'etf' })),
    ...INTERNATIONAL_STOCKS.map(s => ({ ...s, market: 'us', type: 'stock' })),
    ...FOREX_PAIRS.map(s => ({ ...s, market: 'forex', type: 'forex' })),
    ...CRYPTO.map(s => ({ ...s, market: 'crypto', type: 'crypto' })),
    ...COMMODITIES.map(s => ({ ...s, market: 'commodities', type: 'commodity' })),
]
```

---

## Price Service Implementation

### Create: `services/priceService.ts`

```typescript
import TradingView from '@mathieuc/tradingview'
import yahooFinance from 'yahoo-finance2'
import NodeCache from 'node-cache'

// Cache prices for 60 seconds
const priceCache = new NodeCache({ stdTTL: 60 })

interface PriceQuote {
    symbol: string
    price: number               // In original currency
    previousClose: number
    change: number
    changePercent: number
    high: number
    low: number
    volume: number
    lastUpdated: Date
    source: 'tradingview' | 'yahoo'
}

class PriceService {
    private tvClient: any

    constructor() {
        this.tvClient = new TradingView.Client()
    }

    /**
     * Get real-time price using TradingView API
     */
    async getPriceFromTradingView(tvSymbol: string): Promise<PriceQuote> {
        // Check cache first
        const cached = priceCache.get<PriceQuote>(tvSymbol)
        if (cached) return cached

        return new Promise((resolve, reject) => {
            const chart = new this.tvClient.Session.Chart()
            chart.setMarket(tvSymbol, { timeframe: 'D' })

            const timeout = setTimeout(() => {
                reject(new Error(`TradingView timeout for ${tvSymbol}`))
                chart.delete()
            }, 15000)

            chart.onSymbolLoaded(() => {
                clearTimeout(timeout)
                const period = chart.periods[0]
                const prevClose = chart.periods[1]?.close || period.open

                const quote: PriceQuote = {
                    symbol: tvSymbol,
                    price: period.close,
                    previousClose: prevClose,
                    change: period.close - prevClose,
                    changePercent: ((period.close - prevClose) / prevClose) * 100,
                    high: period.max,
                    low: period.min,
                    volume: period.volume || 0,
                    lastUpdated: new Date(),
                    source: 'tradingview'
                }

                priceCache.set(tvSymbol, quote)
                resolve(quote)
                chart.delete()
            })

            chart.onError((err: Error) => {
                clearTimeout(timeout)
                reject(err)
                chart.delete()
            })
        })
    }

    /**
     * Get price using Yahoo Finance as fallback
     */
    async getPriceFromYahoo(yahooSymbol: string): Promise<PriceQuote> {
        const cached = priceCache.get<PriceQuote>(`yahoo:${yahooSymbol}`)
        if (cached) return cached

        try {
            const quote = await yahooFinance.quote(yahooSymbol)

            const result: PriceQuote = {
                symbol: yahooSymbol,
                price: quote.regularMarketPrice || 0,
                previousClose: quote.regularMarketPreviousClose || 0,
                change: quote.regularMarketChange || 0,
                changePercent: quote.regularMarketChangePercent || 0,
                high: quote.regularMarketDayHigh || 0,
                low: quote.regularMarketDayLow || 0,
                volume: quote.regularMarketVolume || 0,
                lastUpdated: new Date(),
                source: 'yahoo'
            }

            priceCache.set(`yahoo:${yahooSymbol}`, result)
            return result
        } catch (error) {
            throw new Error(`Yahoo Finance error: ${error}`)
        }
    }

    /**
     * Get price with automatic fallback
     * Primary: TradingView, Fallback: Yahoo Finance
     */
    async getPrice(tvSymbol: string, yahooSymbol: string): Promise<PriceQuote> {
        try {
            return await this.getPriceFromTradingView(tvSymbol)
        } catch (tvError) {
            console.warn(`TradingView failed for ${tvSymbol}, trying Yahoo...`)
            try {
                return await this.getPriceFromYahoo(yahooSymbol)
            } catch (yahooError) {
                throw new Error(`All price sources failed for ${tvSymbol}`)
            }
        }
    }

    /**
     * Get multiple prices in batch
     */
    async getBatchPrices(symbols: Array<{ tv: string; yahoo: string }>): Promise<Map<string, PriceQuote>> {
        const results = new Map<string, PriceQuote>()

        // Process in parallel with rate limiting
        const batchSize = 5
        for (let i = 0; i < symbols.length; i += batchSize) {
            const batch = symbols.slice(i, i + batchSize)
            const promises = batch.map(async (s) => {
                try {
                    const quote = await this.getPrice(s.tv, s.yahoo)
                    results.set(s.tv, quote)
                } catch (error) {
                    console.error(`Failed to get price for ${s.tv}:`, error)
                }
            })
            await Promise.all(promises)

            // Rate limiting between batches
            if (i + batchSize < symbols.length) {
                await new Promise(r => setTimeout(r, 500))
            }
        }

        return results
    }

    /**
     * Search for symbols using TradingView
     */
    async searchSymbols(query: string): Promise<any[]> {
        try {
            const results = await TradingView.searchMarketV3(query)
            return results.slice(0, 20) // Limit results
        } catch (error) {
            console.error('TradingView search failed:', error)
            return []
        }
    }

    close() {
        this.tvClient.end()
    }
}

export const priceService = new PriceService()
```

---

## Web Scraping for Tadawul Data

### Create: `services/tadawulScraper.ts`

```typescript
import axios from 'axios'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'

interface TadawulStock {
    symbol: string
    name: string
    nameAr: string
    lastPrice: number
    change: number
    changePercent: number
    volume: number
    sector: string
}

class TadawulScraper {
    private baseUrl = 'https://www.saudiexchange.sa'

    /**
     * Scrape all Tadawul stocks using Puppeteer
     * This gets real-time data from the official exchange
     */
    async scrapeAllStocks(): Promise<TadawulStock[]> {
        const browser = await puppeteer.launch({ headless: true })
        const page = await browser.newPage()

        try {
            await page.goto(`${this.baseUrl}/en/market-data/all-shares`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            })

            // Wait for table to load
            await page.waitForSelector('table tbody tr', { timeout: 10000 })

            // Extract data from table
            const stocks = await page.evaluate(() => {
                const rows = document.querySelectorAll('table tbody tr')
                const results: any[] = []

                rows.forEach((row) => {
                    const cells = row.querySelectorAll('td')
                    if (cells.length >= 6) {
                        results.push({
                            symbol: cells[0]?.textContent?.trim() || '',
                            name: cells[1]?.textContent?.trim() || '',
                            lastPrice: parseFloat(cells[2]?.textContent?.replace(/,/g, '') || '0'),
                            change: parseFloat(cells[3]?.textContent?.replace(/,/g, '') || '0'),
                            changePercent: parseFloat(cells[4]?.textContent?.replace('%', '') || '0'),
                            volume: parseInt(cells[5]?.textContent?.replace(/,/g, '') || '0'),
                        })
                    }
                })

                return results
            })

            await browser.close()
            return stocks
        } catch (error) {
            await browser.close()
            throw error
        }
    }

    /**
     * Get stock details by symbol
     */
    async getStockDetails(symbol: string): Promise<any> {
        const browser = await puppeteer.launch({ headless: true })
        const page = await browser.newPage()

        try {
            await page.goto(`${this.baseUrl}/en/market-data/stocks/${symbol}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            })

            const details = await page.evaluate(() => {
                // Extract stock details from page
                return {
                    price: document.querySelector('.price-value')?.textContent?.trim(),
                    change: document.querySelector('.price-change')?.textContent?.trim(),
                    high: document.querySelector('[data-label="High"]')?.textContent?.trim(),
                    low: document.querySelector('[data-label="Low"]')?.textContent?.trim(),
                    volume: document.querySelector('[data-label="Volume"]')?.textContent?.trim(),
                    marketCap: document.querySelector('[data-label="Market Cap"]')?.textContent?.trim(),
                }
            })

            await browser.close()
            return details
        } catch (error) {
            await browser.close()
            throw error
        }
    }

    /**
     * Get TASI index data
     */
    async getTasiIndex(): Promise<{ value: number; change: number; changePercent: number }> {
        try {
            const response = await axios.get(`${this.baseUrl}/api/market-overview`, {
                headers: { 'Accept': 'application/json' }
            })

            return {
                value: response.data.tasiValue || 0,
                change: response.data.tasiChange || 0,
                changePercent: response.data.tasiChangePercent || 0
            }
        } catch (error) {
            console.error('Failed to get TASI index:', error)
            throw error
        }
    }
}

export const tadawulScraper = new TadawulScraper()
```

---

## Search API

### Create: `routes/search.ts`

```typescript
import express from 'express'
import { ALL_SYMBOLS } from '../data/symbols'
import { priceService } from '../services/priceService'

const router = express.Router()

/**
 * GET /api/search/symbols
 * Search for investment symbols across all markets
 */
router.get('/symbols', async (req, res) => {
    try {
        const { q, market, type, limit = 20 } = req.query
        const query = (q as string || '').toLowerCase()

        let results = ALL_SYMBOLS

        // Filter by market
        if (market && market !== 'all') {
            results = results.filter(s => s.market === market)
        }

        // Filter by type
        if (type && type !== 'all') {
            results = results.filter(s => s.type === type)
        }

        // Search by query
        if (query) {
            results = results.filter(s =>
                s.symbol.toLowerCase().includes(query) ||
                s.nameAr.includes(query) ||
                s.nameEn.toLowerCase().includes(query) ||
                s.sector.toLowerCase().includes(query) ||
                s.sectorAr.includes(query)
            )
        }

        // Limit results
        results = results.slice(0, parseInt(limit as string))

        res.json({
            success: true,
            count: results.length,
            symbols: results
        })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Search failed' })
    }
})

/**
 * GET /api/search/tradingview
 * Search TradingView for any symbol globally
 */
router.get('/tradingview', async (req, res) => {
    try {
        const { q } = req.query

        if (!q) {
            return res.status(400).json({ success: false, error: 'Query required' })
        }

        const results = await priceService.searchSymbols(q as string)

        res.json({
            success: true,
            count: results.length,
            symbols: results.map(r => ({
                symbol: r.symbol,
                name: r.description,
                exchange: r.exchange,
                type: r.type,
                tvSymbol: `${r.exchange}:${r.symbol}`
            }))
        })
    } catch (error) {
        res.status(500).json({ success: false, error: 'TradingView search failed' })
    }
})

/**
 * GET /api/search/quote
 * Get quick quote for a symbol
 */
router.get('/quote', async (req, res) => {
    try {
        const { symbol } = req.query

        if (!symbol) {
            return res.status(400).json({ success: false, error: 'Symbol required' })
        }

        // Find symbol in database
        const found = ALL_SYMBOLS.find(s =>
            s.symbol.toLowerCase() === (symbol as string).toLowerCase()
        )

        if (!found) {
            return res.status(404).json({ success: false, error: 'Symbol not found' })
        }

        // Get live price
        const quote = await priceService.getPrice(found.tv, found.yahoo)

        res.json({
            success: true,
            symbol: found,
            quote: {
                price: quote.price,
                priceHalalas: Math.round(quote.price * 100),
                change: quote.change,
                changePercent: quote.changePercent,
                high: quote.high,
                low: quote.low,
                volume: quote.volume,
                lastUpdated: quote.lastUpdated,
                source: quote.source
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get quote' })
    }
})

export default router
```

---

## API Endpoints

### Investments CRUD

```typescript
// GET /api/investments
// List all investments with filters
interface ListParams {
    status?: 'active' | 'sold' | 'all'
    type?: string
    market?: string
    search?: string
    page?: number
    limit?: number
}

// POST /api/investments
// Create new investment
interface CreateRequest {
    symbol: string              // Required
    name: string                // Required
    nameEn?: string
    type: string                // Required
    market: string              // Required
    tradingViewSymbol?: string  // Auto-detected from symbol database
    yahooSymbol?: string        // Auto-detected from symbol database

    purchaseDate: string        // Required
    purchasePrice: number       // SAR (converted to halalas)
    quantity: number            // Required
    fees?: number               // SAR

    sector?: string
    sectorEn?: string
    category?: string
    notes?: string
}

// GET /api/investments/:id
// Get single investment with transactions

// PUT /api/investments/:id
// Update investment

// DELETE /api/investments/:id
// Soft delete

// POST /api/investments/:id/refresh-price
// Manual price refresh for single investment

// POST /api/investments/refresh-all
// Refresh all active investment prices
```

### Transactions

```typescript
// GET /api/investments/:id/transactions
// List all transactions for investment

// POST /api/investments/:id/transactions
// Add transaction (purchase/sale/dividend)
interface AddTransaction {
    type: 'purchase' | 'sale' | 'dividend'
    date: string
    quantity?: number           // For purchase/sale
    pricePerUnit?: number       // SAR
    amount: number              // SAR
    description: string
}
```

### Search

```typescript
// GET /api/search/symbols?q=&market=&type=
// Search local symbol database

// GET /api/search/tradingview?q=
// Search TradingView globally

// GET /api/search/quote?symbol=
// Get live quote for symbol
```

---

## Background Jobs

### Create: `jobs/priceUpdater.ts`

```typescript
import cron from 'node-cron'
import { priceService } from '../services/priceService'
import { Investment } from '../models/Investment'
import { ALL_SYMBOLS } from '../data/symbols'

/**
 * Update prices for all active investments
 * Runs every 15 minutes during market hours
 */

// Tadawul: Sun-Thu 10:00-15:00 (Asia/Riyadh)
cron.schedule('*/15 10-15 * * 0-4', async () => {
    console.log('[Price Update] Starting Tadawul price update...')
    await updateMarketPrices('tadawul')
}, { timezone: 'Asia/Riyadh' })

// US Markets: Mon-Fri 16:30-23:00 (US Eastern = Saudi evening)
cron.schedule('*/15 16-23 * * 1-5', async () => {
    console.log('[Price Update] Starting US market price update...')
    await updateMarketPrices('us')
}, { timezone: 'Asia/Riyadh' })

// Crypto & Forex: 24/7, every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    console.log('[Price Update] Starting crypto/forex price update...')
    await updateMarketPrices('crypto')
    await updateMarketPrices('forex')
    await updateMarketPrices('commodities')
})

async function updateMarketPrices(market: string) {
    try {
        const investments = await Investment.find({
            status: 'active',
            market: market
        })

        console.log(`[Price Update] Updating ${investments.length} ${market} investments`)

        for (const investment of investments) {
            try {
                // Find symbol info
                const symbolInfo = ALL_SYMBOLS.find(s => s.symbol === investment.symbol)
                if (!symbolInfo) continue

                const quote = await priceService.getPrice(symbolInfo.tv, symbolInfo.yahoo)

                // Convert to halalas
                const priceInHalalas = Math.round(quote.price * 100)
                const currentValue = priceInHalalas * investment.quantity
                const gainLoss = currentValue - investment.totalCost

                await Investment.findByIdAndUpdate(investment._id, {
                    currentPrice: priceInHalalas,
                    currentValue: currentValue,
                    previousClose: Math.round(quote.previousClose * 100),
                    dailyChange: Math.round(quote.change * 100),
                    dailyChangePercent: quote.changePercent,
                    gainLoss: gainLoss,
                    gainLossPercent: (gainLoss / investment.totalCost) * 100,
                    totalReturn: gainLoss + investment.dividendsReceived,
                    totalReturnPercent: ((gainLoss + investment.dividendsReceived) / investment.totalCost) * 100,
                    lastPriceUpdate: new Date().toISOString()
                })

                console.log(`[Price Update] ${investment.symbol}: ${quote.price}`)

                // Rate limiting
                await new Promise(r => setTimeout(r, 300))
            } catch (err) {
                console.error(`[Price Update] Failed ${investment.symbol}:`, err)
            }
        }

        console.log(`[Price Update] ${market} update complete`)
    } catch (err) {
        console.error(`[Price Update] ${market} job failed:`, err)
    }
}

export { updateMarketPrices }
```

---

## Implementation Checklist

### Phase 1: Core Setup
- [ ] Install required packages
- [ ] Create symbol database (`data/symbols.ts`)
- [ ] Set up MongoDB models
- [ ] Create Investment CRUD endpoints
- [ ] Create Transaction endpoints

### Phase 2: Price Integration
- [ ] Implement PriceService with TradingView
- [ ] Add Yahoo Finance fallback
- [ ] Create search endpoints
- [ ] Add quote endpoint
- [ ] Test all symbol types (stocks, REITs, forex, crypto, commodities)

### Phase 3: Automation
- [ ] Set up cron jobs for price updates
- [ ] Add Tadawul market hours schedule
- [ ] Add US market hours schedule
- [ ] Add 24/7 crypto/forex updates
- [ ] Implement price caching

### Phase 4: Web Scraping (Optional)
- [ ] Set up Puppeteer
- [ ] Create Tadawul scraper
- [ ] Sync symbol database from Tadawul
- [ ] Update stock lists automatically

### Phase 5: Frontend Connection
- [ ] Replace mock hooks with real API calls
- [ ] Implement React Query for data fetching
- [ ] Add real-time price updates
- [ ] Test all investment flows

---

## Testing

```bash
# Test price fetching
curl "http://localhost:3000/api/search/quote?symbol=1120"
# Expected: { success: true, quote: { price: 92.40, ... } }

# Test symbol search
curl "http://localhost:3000/api/search/symbols?q=راجحي"
# Expected: { symbols: [{ symbol: '1120', nameAr: 'مصرف الراجحي', ... }] }

# Test TradingView search
curl "http://localhost:3000/api/search/tradingview?q=AAPL"
# Expected: { symbols: [{ symbol: 'AAPL', exchange: 'NASDAQ', ... }] }

# Test investment creation
curl -X POST "http://localhost:3000/api/investments" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"1120","name":"مصرف الراجحي","type":"stock","market":"tadawul","purchaseDate":"2024-01-15","purchasePrice":85,"quantity":100}'
```

---

## Security

1. **API Rate Limiting**: Limit TradingView/Yahoo requests
2. **Caching**: Cache prices for 60 seconds minimum
3. **Authentication**: Require auth for all endpoints
4. **Validation**: Validate all inputs
5. **Error Handling**: Never expose internal errors

---

## Arabic Labels

| English | Arabic |
|---------|--------|
| Investment | استثمار |
| Portfolio | المحفظة |
| Stock | سهم |
| REIT | صندوق ريت |
| ETF | صندوق مؤشر |
| Forex | العملات |
| Crypto | العملات الرقمية |
| Commodities | السلع |
| Gold | الذهب |
| Silver | الفضة |
| Oil | النفط |
| Purchase | شراء |
| Sale | بيع |
| Dividend | توزيعات |
| Current Price | السعر الحالي |
| Gain/Loss | الربح/الخسارة |
| Total Return | العائد الإجمالي |
| Refresh Price | تحديث السعر |
| Search | بحث |
