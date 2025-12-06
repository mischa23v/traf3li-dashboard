# Backend Instructions: Investment Portfolio Tracking API

## Overview

The Investment Portfolio Tracking module enables companies to track their investment holdings, monitor gains/losses, record dividends, and integrate investment performance with overall financial reporting.

**Purpose**: Track company investments in stocks, mutual funds, REITs, sukuk, and bonds to understand how investments affect overall company finances.

**NOT a Trading Journal**: This is for portfolio tracking, not active trading. Users add investment purchases, track current values, record dividends, and sell investments.

**Currency**: All monetary values are stored in **halalas** (SAR × 100). Example: 1,000 SAR = 100,000 halalas.

---

## Data Models

### Investment Model

```typescript
interface Investment {
    _id: string                     // MongoDB ObjectId

    // ========== IDENTIFICATION ==========
    symbol: string                  // Required: Stock/Fund symbol (e.g., '1120', '2222', 'RJHI-EQTY')
    name: string                    // Required: Name in Arabic (e.g., 'مصرف الراجحي')
    nameEn: string                  // Name in English (e.g., 'Al Rajhi Bank')

    // ========== CLASSIFICATION ==========
    type: InvestmentType            // Required: 'stock' | 'mutual_fund' | 'etf' | 'reit' | 'sukuk' | 'bond'
    market: Market                  // Required: 'tadawul' | 'international'
    sector: string                  // Sector in Arabic (e.g., 'البنوك')
    sectorEn: string                // Sector in English (e.g., 'Banking')
    category: Category              // For financial reporting: 'equities' | 'fixed_income' | 'real_estate' | 'mutual_funds' | 'alternative'

    // ========== PURCHASE DETAILS ==========
    purchaseDate: string            // Required: ISO date of initial purchase
    purchasePrice: number           // Required: Price per unit in halalas
    quantity: number                // Required: Number of units/shares
    totalCost: number               // Calculated: purchasePrice × quantity (halalas)
    fees: number                    // Purchase fees/commissions (halalas)

    // ========== CURRENT VALUE (Updated from API) ==========
    currentPrice: number            // Current market price per unit (halalas)
    currentValue: number            // Calculated: currentPrice × quantity (halalas)
    lastPriceUpdate: string         // ISO datetime of last price fetch

    // ========== PERFORMANCE (Calculated) ==========
    gainLoss: number                // Unrealized gain/loss: currentValue - totalCost (halalas)
    gainLossPercent: number         // Percentage: (gainLoss / totalCost) × 100
    dividendsReceived: number       // Total dividends received (halalas)
    totalReturn: number             // gainLoss + dividendsReceived (halalas)
    totalReturnPercent: number      // (totalReturn / totalCost) × 100

    // ========== STATUS ==========
    status: InvestmentStatus        // 'active' | 'sold' | 'partial_sold'
    soldDate?: string               // ISO date if fully sold
    soldPrice?: number              // Sale price per unit if sold (halalas)
    realizedGainLoss?: number       // Actual profit/loss after sale (halalas)

    // ========== METADATA ==========
    notes: string                   // User notes
    createdAt: string               // ISO datetime
    updatedAt: string               // ISO datetime
    userId: string                  // Owner
    companyId: string               // Company

    // ========== TRADINGVIEW/YAHOO SYMBOL ==========
    tradingViewSymbol?: string      // For TradingView API (e.g., 'TADAWUL:1120')
    yahooSymbol?: string            // For Yahoo Finance (e.g., '1120.SR')
}

type InvestmentType = 'stock' | 'mutual_fund' | 'etf' | 'reit' | 'sukuk' | 'bond'
type Market = 'tadawul' | 'international'
type Category = 'equities' | 'fixed_income' | 'real_estate' | 'mutual_funds' | 'alternative'
type InvestmentStatus = 'active' | 'sold' | 'partial_sold'
```

### Investment Transaction Model

Records all transactions for an investment (purchases, sales, dividends).

```typescript
interface InvestmentTransaction {
    _id: string                     // MongoDB ObjectId
    investmentId: string            // Reference to Investment

    type: TransactionType           // 'purchase' | 'sale' | 'dividend' | 'fee'
    date: string                    // ISO date of transaction

    // For purchase/sale
    quantity?: number               // Units bought/sold
    pricePerUnit?: number           // Price per unit (halalas)

    amount: number                  // Total amount (halalas). Positive for income, negative for expense
    fees?: number                   // Associated fees (halalas)

    description: string             // User description

    createdAt: string
    updatedAt: string
}

type TransactionType = 'purchase' | 'sale' | 'dividend' | 'fee'
```

### Portfolio Summary Model

Aggregated portfolio statistics for reporting.

```typescript
interface PortfolioSummary {
    userId: string
    companyId: string

    // Totals
    totalInvested: number           // Sum of all investment costs (halalas)
    currentValue: number            // Sum of all current values (halalas)
    totalGainLoss: number           // Unrealized gain/loss (halalas)
    totalGainLossPercent: number    // Percentage
    totalDividends: number          // All dividends received (halalas)
    totalReturn: number             // Overall return (halalas)
    totalReturnPercent: number      // Percentage

    // By Category
    byCategory: {
        [key in Category]: {
            invested: number
            currentValue: number
            gainLoss: number
            percentage: number      // % of total portfolio
        }
    }

    // By Sector
    bySector: {
        [sector: string]: {
            invested: number
            currentValue: number
            gainLoss: number
            percentage: number
        }
    }

    // Last Updated
    lastUpdated: string
}
```

---

## API Endpoints

### Investments CRUD

#### GET /api/investments
List all investments with optional filters.

```typescript
// Query Parameters
interface ListInvestmentsParams {
    status?: 'active' | 'sold' | 'all'   // Default: 'active'
    type?: InvestmentType
    category?: Category
    market?: Market
    search?: string                       // Search symbol, name
    sortBy?: 'purchaseDate' | 'currentValue' | 'gainLoss' | 'symbol'
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
}

// Response
interface ListInvestmentsResponse {
    investments: Investment[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    summary: {
        totalInvested: number
        currentValue: number
        totalGainLoss: number
        totalDividends: number
    }
}
```

#### GET /api/investments/:id
Get single investment with transactions.

```typescript
interface GetInvestmentResponse {
    investment: Investment
    transactions: InvestmentTransaction[]
    performance: {
        dailyChange: number
        dailyChangePercent: number
        weeklyChange: number
        monthlyChange: number
        yearlyChange: number
    }
}
```

#### POST /api/investments
Create new investment.

```typescript
interface CreateInvestmentRequest {
    symbol: string                  // Required
    name: string                    // Required
    nameEn?: string
    type: InvestmentType            // Required
    market: Market                  // Required
    sector?: string
    sectorEn?: string
    category: Category              // Required

    purchaseDate: string            // Required: ISO date
    purchasePrice: number           // Required: SAR (will convert to halalas)
    quantity: number                // Required
    fees?: number                   // SAR (will convert to halalas)

    notes?: string
}

// Server-side processing:
// 1. Convert SAR to halalas (×100)
// 2. Calculate totalCost = purchasePrice × quantity
// 3. Fetch current price from TradingView
// 4. Calculate currentValue, gainLoss
// 5. Create initial 'purchase' transaction
```

#### PUT /api/investments/:id
Update investment details.

#### DELETE /api/investments/:id
Soft delete (mark as archived).

---

### Transactions

#### POST /api/investments/:id/transactions
Add transaction to investment.

```typescript
interface AddTransactionRequest {
    type: TransactionType
    date: string

    // For purchase/sale
    quantity?: number
    pricePerUnit?: number           // SAR

    amount: number                  // SAR
    fees?: number                   // SAR
    description: string
}

// When type === 'purchase':
// - Add to investment quantity
// - Recalculate average purchase price
// - Update totalCost

// When type === 'sale':
// - Subtract from investment quantity
// - Calculate realized gain/loss
// - If quantity === 0, mark as 'sold'

// When type === 'dividend':
// - Add to dividendsReceived
// - Update totalReturn
```

#### GET /api/investments/:id/transactions
List all transactions for an investment.

---

### Portfolio

#### GET /api/portfolio/summary
Get portfolio summary for reporting.

```typescript
interface PortfolioSummaryResponse {
    summary: PortfolioSummary
    investments: Investment[]
    recentTransactions: InvestmentTransaction[]
}
```

#### GET /api/portfolio/performance
Get historical performance data.

```typescript
interface PortfolioPerformanceParams {
    period: '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL'
}

interface PortfolioPerformanceResponse {
    dataPoints: {
        date: string
        totalValue: number
        totalCost: number
        gainLoss: number
    }[]
    totalReturn: number
    totalReturnPercent: number
    benchmarkComparison?: {
        tasiReturn: number          // Compare to TASI index
    }
}
```

---

## Price Fetching with TradingView API

### Installation

```bash
npm install @mathieuc/tradingview
```

GitHub: https://github.com/Mathieu2301/TradingView-API

### Price Service Implementation

```typescript
// services/priceService.ts
import TradingView from '@mathieuc/tradingview'

interface PriceQuote {
    symbol: string
    price: number           // In original currency
    previousClose: number
    change: number
    changePercent: number
    lastUpdated: Date
}

class PriceService {
    private client: any

    constructor() {
        this.client = new TradingView.Client()
    }

    /**
     * Get real-time price for a symbol
     * Saudi stocks: Use format 'TADAWUL:1120'
     * US stocks: Use format 'NASDAQ:AAPL'
     */
    async getQuote(tradingViewSymbol: string): Promise<PriceQuote> {
        return new Promise((resolve, reject) => {
            const chart = new this.client.Session.Chart()

            chart.setMarket(tradingViewSymbol, { timeframe: 'D' })

            chart.onSymbolLoaded(() => {
                const period = chart.periods[0]
                const prevClose = chart.periods[1]?.close || period.close

                resolve({
                    symbol: tradingViewSymbol,
                    price: period.close,
                    previousClose: prevClose,
                    change: period.close - prevClose,
                    changePercent: ((period.close - prevClose) / prevClose) * 100,
                    lastUpdated: new Date()
                })
                chart.delete()
            })

            chart.onError((err: Error) => {
                reject(err)
                chart.delete()
            })

            // Timeout after 10 seconds
            setTimeout(() => {
                reject(new Error('Price fetch timeout'))
                chart.delete()
            }, 10000)
        })
    }

    /**
     * Search for symbols
     */
    async searchSymbol(query: string): Promise<any[]> {
        return TradingView.searchMarketV3(query)
    }

    /**
     * Close connection
     */
    close() {
        this.client.end()
    }
}

export const priceService = new PriceService()
```

### Saudi Stock Symbol Mapping

```typescript
// TradingView format: TADAWUL:XXXX
// Yahoo Finance format: XXXX.SR

const TADAWUL_SYMBOLS: Record<string, { tv: string; yahoo: string; nameAr: string }> = {
    '1120': { tv: 'TADAWUL:1120', yahoo: '1120.SR', nameAr: 'مصرف الراجحي' },
    '1180': { tv: 'TADAWUL:1180', yahoo: '1180.SR', nameAr: 'بنك الأهلي' },
    '1150': { tv: 'TADAWUL:1150', yahoo: '1150.SR', nameAr: 'بنك الإنماء' },
    '2222': { tv: 'TADAWUL:2222', yahoo: '2222.SR', nameAr: 'أرامكو السعودية' },
    '2010': { tv: 'TADAWUL:2010', yahoo: '2010.SR', nameAr: 'سابك' },
    '7010': { tv: 'TADAWUL:7010', yahoo: '7010.SR', nameAr: 'الاتصالات السعودية' },
    '2280': { tv: 'TADAWUL:2280', yahoo: '2280.SR', nameAr: 'المراعي' },
    '4330': { tv: 'TADAWUL:4330', yahoo: '4330.SR', nameAr: 'الرياض ريت' },
    '4190': { tv: 'TADAWUL:4190', yahoo: '4190.SR', nameAr: 'جرير' },
    '5110': { tv: 'TADAWUL:5110', yahoo: '5110.SR', nameAr: 'الكهرباء' },
    // Add more as needed...
}

function getTradingViewSymbol(symbol: string, market: string): string {
    if (market === 'tadawul') {
        return TADAWUL_SYMBOLS[symbol]?.tv || `TADAWUL:${symbol}`
    }
    return symbol
}
```

### Background Price Update Job

```typescript
// jobs/updatePrices.ts
import cron from 'node-cron'
import { priceService } from '../services/priceService'
import { Investment } from '../models/Investment'

// Run every 15 minutes during Tadawul market hours
// Sun-Thu 10:00-15:00 (Asia/Riyadh)
cron.schedule('*/15 10-15 * * 0-4', async () => {
    console.log('Starting price update job...')

    try {
        const investments = await Investment.find({ status: 'active' })
        console.log(`Updating prices for ${investments.length} investments`)

        for (const investment of investments) {
            try {
                const tvSymbol = getTradingViewSymbol(investment.symbol, investment.market)
                const quote = await priceService.getQuote(tvSymbol)

                // Convert to halalas (price is in SAR)
                const priceInHalalas = Math.round(quote.price * 100)

                // Update investment
                await Investment.findByIdAndUpdate(investment._id, {
                    currentPrice: priceInHalalas,
                    currentValue: priceInHalalas * investment.quantity,
                    gainLoss: (priceInHalalas * investment.quantity) - investment.totalCost,
                    gainLossPercent: (((priceInHalalas * investment.quantity) - investment.totalCost) / investment.totalCost) * 100,
                    lastPriceUpdate: new Date().toISOString()
                })

                console.log(`Updated ${investment.symbol}: ${quote.price} SAR`)

                // Rate limiting - wait 500ms between requests
                await new Promise(r => setTimeout(r, 500))
            } catch (err) {
                console.error(`Failed to update ${investment.symbol}:`, err)
            }
        }

        console.log('Price update job completed')
    } catch (err) {
        console.error('Price update job failed:', err)
    }
}, {
    timezone: 'Asia/Riyadh'
})
```

---

## Integration with Finance Reports

### Investment Impact on Financial Reports

Investments should be reflected in the company's financial reports:

```typescript
// GET /api/reports/investments
interface InvestmentReportResponse {
    period: string                  // e.g., '2024-Q3'

    // Portfolio Summary
    totalInvested: number           // Total cost (halalas)
    currentValue: number            // Current value (halalas)
    unrealizedGainLoss: number      // Paper profit/loss (halalas)
    realizedGainLoss: number        // Actual profit/loss from sales (halalas)
    dividendIncome: number          // Total dividends (halalas)

    // For Balance Sheet
    assetValue: number              // currentValue (as current/non-current assets)

    // For Income Statement
    investmentIncome: number        // dividends + realized gains

    // Breakdown by Category
    byCategory: {
        equities: CategoryBreakdown
        fixed_income: CategoryBreakdown
        real_estate: CategoryBreakdown
        mutual_funds: CategoryBreakdown
    }

    // Monthly Performance
    monthlyPerformance: {
        month: string
        value: number
        gainLoss: number
    }[]
}

interface CategoryBreakdown {
    invested: number
    currentValue: number
    gainLoss: number
    dividends: number
    percentOfPortfolio: number
}
```

---

## Calculations

### Gain/Loss Calculation

```typescript
// Unrealized (paper) gain/loss
gainLoss = currentValue - totalCost
gainLossPercent = (gainLoss / totalCost) * 100

// Total return (including dividends)
totalReturn = gainLoss + dividendsReceived
totalReturnPercent = (totalReturn / totalCost) * 100

// Realized gain/loss (when sold)
realizedGainLoss = (salePrice × quantity) - (purchasePrice × quantity) - fees
```

### Average Purchase Price (for multiple purchases)

```typescript
// When adding to position
newAveragePrice = (oldTotalCost + newPurchaseCost) / (oldQuantity + newQuantity)

// Example:
// Initial: 100 shares @ 85 SAR = 8,500 SAR
// Add: 50 shares @ 90 SAR = 4,500 SAR
// New average: 13,000 / 150 = 86.67 SAR
```

### Dividend Yield

```typescript
dividendYield = (annualDividends / currentValue) * 100
yieldOnCost = (annualDividends / totalCost) * 100
```

---

## Arabic Labels

| English | Arabic |
|---------|--------|
| Investment | استثمار |
| Portfolio | المحفظة الاستثمارية |
| Stock | سهم |
| Mutual Fund | صندوق استثماري |
| ETF | صندوق مؤشر |
| REIT | صندوق ريت |
| Sukuk | صكوك |
| Bond | سندات |
| Purchase Date | تاريخ الشراء |
| Purchase Price | سعر الشراء |
| Quantity | الكمية |
| Current Price | السعر الحالي |
| Current Value | القيمة الحالية |
| Total Cost | التكلفة الإجمالية |
| Gain/Loss | الربح/الخسارة |
| Dividends | التوزيعات |
| Total Return | العائد الإجمالي |
| Sector | القطاع |
| Active | نشط |
| Sold | مباع |
| Fees | الرسوم |
| Refresh Price | تحديث السعر |
| Add Investment | إضافة استثمار |
| Additional Purchase | شراء إضافي |
| Partial Sale | بيع جزئي |
| Full Sale | بيع كامل |
| Record Dividend | تسجيل توزيعات |
| Transaction History | سجل العمليات |
| Return Analysis | تحليل العائد |
| Dividend Yield | عائد التوزيعات |

---

## Security Considerations

1. **Authorization**: Users can only access their company's investments
2. **Validation**: Validate all numeric inputs, prevent negative quantities
3. **Rate Limiting**: Limit price fetch requests to prevent API abuse
4. **Audit Trail**: Log all transactions for compliance
5. **Data Encryption**: Encrypt sensitive financial data at rest

---

## Implementation Priority

### Phase 1: Core Portfolio (MVP)
1. Investment CRUD operations
2. Transaction recording (purchase, sale, dividend)
3. Portfolio summary calculation
4. Basic list/detail views

### Phase 2: Price Integration
1. TradingView API integration
2. Scheduled price updates (every 15 min during market hours)
3. Manual price refresh button
4. Price history tracking

### Phase 3: Reporting Integration
1. Connect investments to finance reports
2. Category/sector breakdown charts
3. Performance comparison to TASI index
4. Export to Excel/PDF

### Phase 4: Advanced Features
1. Multiple currency support
2. Cost basis methods (FIFO, LIFO, Average)
3. Tax reporting for Saudi regulations
4. Alert notifications for price changes
