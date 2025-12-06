# Backend Instructions: Investment & Trading Journal API Specification

## Overview

The Investment & Trading Journal module provides comprehensive trade tracking and performance analytics, inspired by industry-leading platforms like TraderSync and Tradervue. It enables users to log trades, track performance metrics, and maintain psychological journals for continuous improvement.

**Key Features**:
- Multi-asset support (stocks, forex, crypto, futures, options)
- Real-time P&L calculation with R-Multiple tracking
- Risk management (stop loss, take profit, position sizing)
- Performance analytics (win rate, profit factor, Sharpe ratio)
- Trade journal with psychology tracking
- Screenshot/chart attachment support
- Tag-based trade categorization
- Broker/account management

**Currency Note**: All monetary values are stored in **halalas** (SAR × 100). For example, 500 SAR = 50000 halalas.

---

## Data Models

### Trade Model (Core)

```typescript
interface Trade {
  _id: string                      // MongoDB ObjectId

  // ========== BASIC TRADE INFO ==========
  symbol: string                   // Required: Trading symbol (e.g., 'AAPL', 'EUR/USD', 'BTC/USDT')
  symbolName?: string              // Full name (e.g., 'Apple Inc.')

  assetType: AssetType             // Required: Type of asset
  direction: TradeDirection        // Required: 'long' | 'short'
  status: TradeStatus              // Required: Current trade status

  // ========== ENTRY DETAILS ==========
  entryDate: string                // Required: ISO datetime of entry
  entryPrice: number               // Required: Entry price (in asset units, NOT halalas)
  quantity: number                 // Required: Position size/lot size/contracts
  entryCommission?: number         // Broker commission on entry (halalas)
  entryFees?: number               // Other fees on entry (halalas)
  slippage?: number                // Entry slippage (price difference)

  // ========== EXIT DETAILS (optional for open trades) ==========
  exitDate?: string                // ISO datetime of exit
  exitPrice?: number               // Exit price
  exitCommission?: number          // Broker commission on exit (halalas)
  exitFees?: number                // Other fees on exit (halalas)

  // ========== CALCULATED FIELDS (computed on save) ==========
  grossPnl?: number                // Gross P&L before fees (halalas)
  netPnl?: number                  // Net P&L after all fees (halalas)
  pnlPercent?: number              // P&L as percentage of entry
  rMultiple?: number               // R-Multiple (pnl / riskAmount)
  holdingPeriod?: number           // Duration in minutes
  holdingDays?: number             // Duration in days

  // ========== RISK MANAGEMENT ==========
  stopLoss?: number                // Stop loss price
  takeProfit?: number              // Take profit price
  riskAmount?: number              // Amount risked in halalas (this is your "R")
  riskPercent?: number             // Risk as % of account
  positionValue?: number           // Total position value (halalas)
  riskRewardRatio?: number         // Calculated risk/reward ratio

  // Trailing Stop
  trailingStopEnabled?: boolean
  trailingStopDistance?: number    // In price units
  trailingStopActivation?: number  // Price at which trailing activates

  // Scaling
  scaledIn?: boolean               // Added to position
  scaledOut?: boolean              // Partial exit
  averageEntryPrice?: number       // If scaled in

  // ========== TRADE ANALYSIS ==========
  setup?: TradeSetup               // Type of setup/pattern
  timeframe?: Timeframe            // Chart timeframe used
  strategy?: string                // Strategy name (free text or ID)
  marketCondition?: MarketCondition
  marketSession?: MarketSession    // 'asian' | 'london' | 'new_york' | 'overlap'

  // Technical Analysis
  technicalIndicators?: string[]   // Indicators used: ['RSI', 'MACD', 'Moving Average']
  entryReason?: string             // Why entered the trade
  exitReason?: string              // Why exited the trade

  // Fundamental Analysis
  fundamentalFactors?: string[]    // ['earnings', 'news', 'economic_data']
  newsEvent?: string               // Related news/event

  // ========== PSYCHOLOGY & JOURNAL ==========
  emotionEntry?: EmotionState      // Emotional state at entry
  emotionDuring?: EmotionState     // Emotional state during trade
  emotionExit?: EmotionState       // Emotional state at exit
  confidenceLevel?: number         // 1-10 scale

  // Trade Execution Quality
  executionQuality?: number        // 1-5 scale
  followedPlan?: boolean           // Did trader follow trading plan?

  // Journal Entries
  preTradeNotes?: string           // Notes before entering
  duringTradeNotes?: string        // Notes during trade
  postTradeNotes?: string          // Post-trade analysis
  lessonsLearned?: string          // Key takeaways
  mistakes?: string[]              // List of mistakes made
  improvements?: string[]          // Areas for improvement

  // ========== TAGS & CATEGORIZATION ==========
  tags?: string[]                  // Custom tags
  labels?: TradeLabel[]            // Predefined labels
  category?: string                // Custom category

  // ========== ATTACHMENTS ==========
  entryScreenshot?: string         // URL to entry chart screenshot
  exitScreenshot?: string          // URL to exit chart screenshot
  attachments?: Attachment[]       // Additional attachments

  // ========== BROKER & ACCOUNT ==========
  brokerId?: string                // Link to Broker record
  brokerName?: string              // Broker name (denormalized)
  accountId?: string               // Link to Account record
  accountName?: string             // Account name (denormalized)
  accountCurrency?: string         // Account currency (default: 'SAR')

  // ========== LINKING ==========
  linkedTrades?: string[]          // Related trade IDs (for scaling, hedging)
  parentTradeId?: string           // Original trade if this is a scale

  // ========== AUDIT ==========
  createdAt: string                // ISO datetime
  updatedAt: string                // ISO datetime
  createdBy?: string               // User ID
  updatedBy?: string               // User ID

  // Ownership
  userId: string                   // Required: Owner of this trade
  tenantId?: string                // Multi-tenant support
}

// ========== ENUMS ==========

type AssetType =
  | 'stock'           // Equities
  | 'forex'           // Currency pairs
  | 'crypto'          // Cryptocurrencies
  | 'futures'         // Futures contracts
  | 'options'         // Options contracts
  | 'cfd'             // Contracts for Difference
  | 'etf'             // Exchange-traded funds
  | 'commodity'       // Commodities
  | 'bond'            // Bonds
  | 'index'           // Index trading
  | 'other'

type TradeDirection = 'long' | 'short'

type TradeStatus =
  | 'pending'         // Order placed, not filled
  | 'open'            // Position is open
  | 'closed'          // Position closed
  | 'cancelled'       // Order cancelled
  | 'expired'         // Order expired

type TradeSetup =
  | 'breakout'              // Price breakout above resistance
  | 'breakdown'             // Price breakdown below support
  | 'trend_following'       // Following established trend
  | 'pullback'              // Entry on pullback/retracement
  | 'reversal'              // Trend reversal pattern
  | 'support_bounce'        // Bounce from support level
  | 'resistance_rejection'  // Rejection at resistance
  | 'range_trade'           // Trading within range
  | 'gap_fill'              // Trading gap fill
  | 'earnings_play'         // Earnings-based trade
  | 'news_trade'            // News-driven trade
  | 'scalp'                 // Quick scalp trade
  | 'swing'                 // Multi-day swing trade
  | 'position'              // Long-term position
  | 'momentum'              // Momentum trade
  | 'mean_reversion'        // Mean reversion strategy
  | 'arbitrage'             // Arbitrage opportunity
  | 'other'

type Timeframe =
  | '1m' | '2m' | '3m' | '5m' | '10m' | '15m' | '30m'  // Minutes
  | '1h' | '2h' | '4h' | '6h' | '8h' | '12h'           // Hours
  | '1d' | '2d' | '3d'                                  // Days
  | '1w' | '2w'                                         // Weeks
  | '1M'                                                // Month

type MarketCondition =
  | 'trending_up'      // Strong uptrend
  | 'trending_down'    // Strong downtrend
  | 'ranging'          // Sideways/consolidation
  | 'volatile'         // High volatility
  | 'choppy'           // Choppy/uncertain
  | 'breakout'         // Breaking out of range
  | 'low_volume'       // Low volume period

type MarketSession =
  | 'asian'            // Asian session (Tokyo, HK, Singapore)
  | 'london'           // London/European session
  | 'new_york'         // New York session
  | 'overlap'          // Session overlap
  | 'off_hours'        // Outside main sessions

type EmotionState =
  // Positive/Neutral
  | 'confident'        // واثق
  | 'calm'             // هادئ
  | 'focused'          // مركز
  | 'patient'          // صبور
  | 'neutral'          // محايد
  | 'disciplined'      // منضبط

  // Negative Entry Emotions
  | 'anxious'          // قلق
  | 'fearful'          // خائف
  | 'greedy'           // طماع
  | 'excited'          // متحمس (over-excited)
  | 'revenge'          // انتقامي (revenge trading)
  | 'fomo'             // خوف من الفوات
  | 'impatient'        // غير صبور
  | 'overconfident'    // مفرط الثقة
  | 'hesitant'         // متردد

  // Exit Emotions
  | 'satisfied'        // راضي
  | 'relieved'         // مرتاح
  | 'proud'            // فخور
  | 'disappointed'     // محبط
  | 'frustrated'       // منزعج
  | 'regretful'        // نادم
  | 'angry'            // غاضب

type TradeLabel =
  | 'a_plus_setup'     // A+ quality setup
  | 'textbook'         // Textbook perfect trade
  | 'impulsive'        // Impulsive entry
  | 'overtrading'      // Part of overtrading
  | 'revenge_trade'    // Revenge trade
  | 'fomo_trade'       // FOMO trade
  | 'early_exit'       // Exited too early
  | 'late_exit'        // Exited too late
  | 'moved_stop'       // Moved stop loss
  | 'no_stop'          // No stop loss used
  | 'sized_wrong'      // Wrong position size

interface Attachment {
  _id: string
  type: 'image' | 'video' | 'document' | 'link'
  url: string
  filename?: string
  description?: string
  uploadedAt: string
}
```

### Broker Model

```typescript
interface Broker {
  _id: string

  // Basic Info
  name: string                     // Required: Broker name
  displayName?: string             // Short display name
  type: BrokerType                 // Type of broker

  // Connection
  apiSupported?: boolean           // Does broker have API?
  apiConnected?: boolean           // Is API currently connected?
  lastSyncAt?: string              // Last sync timestamp

  // Credentials (encrypted)
  apiKey?: string                  // Encrypted
  apiSecret?: string               // Encrypted
  accessToken?: string             // Encrypted

  // Settings
  timezone?: string                // Broker's timezone
  defaultCurrency?: string         // Default: 'SAR'
  commissionStructure?: CommissionStructure

  // Status
  status: 'active' | 'inactive' | 'pending_verification'
  isDefault?: boolean              // Is this the default broker?

  // Audit
  userId: string
  createdAt: string
  updatedAt: string
}

type BrokerType =
  | 'stock_broker'     // Stock/equity broker
  | 'forex_broker'     // Forex broker
  | 'crypto_exchange'  // Cryptocurrency exchange
  | 'futures_broker'   // Futures broker
  | 'multi_asset'      // Multi-asset broker
  | 'prop_firm'        // Proprietary trading firm
  | 'other'

interface CommissionStructure {
  type: 'per_trade' | 'per_share' | 'percentage' | 'tiered'
  value: number                    // Commission value (halalas or percentage)
  minimumCommission?: number       // Minimum commission per trade (halalas)
  maximumCommission?: number       // Maximum commission per trade (halalas)
}
```

### TradingAccount Model

```typescript
interface TradingAccount {
  _id: string

  // Basic Info
  name: string                     // Required: Account name/label
  accountNumber?: string           // Broker account number
  brokerId: string                 // Link to Broker

  // Account Type
  type: AccountType
  currency: string                 // Default: 'SAR'

  // Balance Tracking
  initialBalance: number           // Starting balance (halalas)
  currentBalance?: number          // Current balance (halalas)
  realizedPnl?: number             // Total realized P&L (halalas)
  unrealizedPnl?: number           // Unrealized P&L (halalas)

  // Risk Settings
  maxDailyLoss?: number            // Max daily loss limit (halalas)
  maxDailyLossPercent?: number     // Max daily loss as % of balance
  maxPositionSize?: number         // Max position size (halalas)
  maxOpenTrades?: number           // Max concurrent trades
  defaultRiskPercent?: number      // Default risk per trade (%)

  // Status
  status: 'active' | 'inactive' | 'closed' | 'demo'
  isDemo?: boolean                 // Is this a demo account?
  isDefault?: boolean              // Is this the default account?

  // Audit
  userId: string
  createdAt: string
  updatedAt: string
}

type AccountType =
  | 'cash'             // Cash account
  | 'margin'           // Margin account
  | 'ira'              // Retirement account
  | 'prop'             // Prop firm account
  | 'demo'             // Demo/paper account
  | 'crypto'           // Crypto wallet/exchange
  | 'other'
```

### TradeStats Model (Aggregated Statistics)

```typescript
interface TradeStats {
  _id: string
  userId: string

  // Time Period
  periodType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time'
  periodStart: string              // ISO date
  periodEnd: string                // ISO date

  // Trade Counts
  totalTrades: number
  winningTrades: number
  losingTrades: number
  breakEvenTrades: number

  // P&L Metrics
  grossProfit: number              // Sum of winning trades (halalas)
  grossLoss: number                // Sum of losing trades (halalas)
  netPnl: number                   // Net P&L (halalas)
  totalCommissions: number         // Total commissions paid (halalas)

  // Performance Ratios
  winRate: number                  // Percentage (0-100)
  lossRate: number                 // Percentage (0-100)
  profitFactor: number             // grossProfit / |grossLoss|
  averageWin: number               // Average winning trade (halalas)
  averageLoss: number              // Average losing trade (halalas)
  averageRMultiple: number         // Average R-Multiple
  expectancy: number               // (winRate * avgWin) - (lossRate * avgLoss)

  // Risk Metrics
  largestWin: number               // Biggest winning trade (halalas)
  largestLoss: number              // Biggest losing trade (halalas)
  maxConsecutiveWins: number
  maxConsecutiveLosses: number
  currentStreak: number            // +ve for wins, -ve for losses
  maxDrawdown: number              // Maximum drawdown (halalas)
  maxDrawdownPercent: number       // Maximum drawdown %

  // Time Metrics
  averageHoldingTime: number       // Average holding time (minutes)
  shortestTrade: number            // Shortest trade (minutes)
  longestTrade: number             // Longest trade (minutes)

  // Breakdown by Asset Type
  byAssetType?: Record<AssetType, {
    trades: number
    netPnl: number
    winRate: number
  }>

  // Breakdown by Setup
  bySetup?: Record<TradeSetup, {
    trades: number
    netPnl: number
    winRate: number
  }>

  // Breakdown by Day of Week
  byDayOfWeek?: Record<number, {  // 0 = Sunday, 6 = Saturday
    trades: number
    netPnl: number
    winRate: number
  }>

  // Breakdown by Hour
  byHour?: Record<number, {       // 0-23
    trades: number
    netPnl: number
    winRate: number
  }>

  // Audit
  calculatedAt: string
  createdAt: string
  updatedAt: string
}
```

---

## API Endpoints

### Trades

#### Create Trade
```http
POST /api/v1/trades
Authorization: Bearer {token}
Content-Type: application/json

{
  "symbol": "AAPL",
  "assetType": "stock",
  "direction": "long",
  "status": "open",
  "entryDate": "2024-01-15T10:30:00Z",
  "entryPrice": 178.50,
  "quantity": 100,
  "entryCommission": 495,
  "stopLoss": 175.00,
  "takeProfit": 188.00,
  "riskAmount": 35000,
  "setup": "breakout",
  "timeframe": "1d",
  "emotionEntry": "confident",
  "confidenceLevel": 8,
  "preTradeNotes": "Breaking above resistance with high volume",
  "tags": ["breakout", "momentum"]
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "symbol": "AAPL",
    "riskRewardRatio": 2.71,
    "positionValue": 1785000,
    ...
  }
}
```

#### List Trades
```http
GET /api/v1/trades
Authorization: Bearer {token}
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `status` | string | Filter by status: `open`, `closed`, `pending` |
| `assetType` | string | Filter by asset type |
| `direction` | string | Filter by direction: `long`, `short` |
| `setup` | string | Filter by trade setup |
| `symbol` | string | Filter by symbol (partial match) |
| `startDate` | string | Filter trades from this date (ISO) |
| `endDate` | string | Filter trades until this date (ISO) |
| `minPnl` | number | Minimum P&L (halalas) |
| `maxPnl` | number | Maximum P&L (halalas) |
| `tags` | string | Comma-separated tags |
| `brokerId` | string | Filter by broker |
| `accountId` | string | Filter by account |
| `sortBy` | string | Sort field: `entryDate`, `exitDate`, `netPnl`, `symbol` |
| `sortOrder` | string | Sort order: `asc`, `desc` |

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "trades": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    },
    "summary": {
      "totalTrades": 156,
      "openTrades": 3,
      "closedTrades": 153,
      "totalNetPnl": 12500000,
      "winRate": 62.5
    }
  }
}
```

#### Get Trade
```http
GET /api/v1/trades/:id
Authorization: Bearer {token}
```

#### Update Trade
```http
PATCH /api/v1/trades/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "exitDate": "2024-01-18T14:45:00Z",
  "exitPrice": 185.20,
  "exitCommission": 495,
  "status": "closed",
  "emotionExit": "satisfied",
  "postTradeNotes": "Exited at first target. Could have held for more.",
  "lessonsLearned": "Waiting for confirmation was the right call."
}
```

#### Close Trade
```http
POST /api/v1/trades/:id/close
Authorization: Bearer {token}
Content-Type: application/json

{
  "exitDate": "2024-01-18T14:45:00Z",
  "exitPrice": 185.20,
  "exitCommission": 495,
  "exitReason": "Target reached",
  "emotionExit": "satisfied"
}
```

**Note**: This endpoint automatically:
- Sets status to `closed`
- Calculates `grossPnl`, `netPnl`, `pnlPercent`, `rMultiple`
- Updates holding period

#### Delete Trade
```http
DELETE /api/v1/trades/:id
Authorization: Bearer {token}
```

#### Bulk Delete Trades
```http
DELETE /api/v1/trades/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

---

### Trade Statistics

#### Get Statistics
```http
GET /api/v1/trades/stats
Authorization: Bearer {token}
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | Period: `today`, `week`, `month`, `year`, `all` |
| `startDate` | string | Custom start date (ISO) |
| `endDate` | string | Custom end date (ISO) |
| `assetType` | string | Filter by asset type |
| `accountId` | string | Filter by account |

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "overview": {
      "totalTrades": 45,
      "winningTrades": 28,
      "losingTrades": 15,
      "breakEvenTrades": 2,
      "openTrades": 3
    },
    "pnl": {
      "grossProfit": 8500000,
      "grossLoss": -3200000,
      "netPnl": 5300000,
      "totalCommissions": 44550
    },
    "ratios": {
      "winRate": 62.22,
      "profitFactor": 2.66,
      "averageWin": 303571,
      "averageLoss": -213333,
      "averageRMultiple": 1.42,
      "expectancy": 117778
    },
    "risk": {
      "largestWin": 1200000,
      "largestLoss": -450000,
      "maxConsecutiveWins": 5,
      "maxConsecutiveLosses": 3,
      "maxDrawdown": 850000,
      "maxDrawdownPercent": 4.25
    },
    "byAssetType": {
      "stock": { "trades": 25, "netPnl": 3500000, "winRate": 68 },
      "forex": { "trades": 15, "netPnl": 1200000, "winRate": 53 },
      "crypto": { "trades": 5, "netPnl": 600000, "winRate": 60 }
    },
    "bySetup": {
      "breakout": { "trades": 12, "netPnl": 2100000, "winRate": 75 },
      "pullback": { "trades": 8, "netPnl": 1500000, "winRate": 62.5 }
    }
  }
}
```

#### Get Performance Chart Data
```http
GET /api/v1/trades/stats/chart
Authorization: Bearer {token}
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | `week`, `month`, `3months`, `6months`, `year` |
| `metric` | string | `cumulative_pnl`, `daily_pnl`, `win_rate`, `trades` |
| `groupBy` | string | `day`, `week`, `month` |

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "labels": ["2024-01-01", "2024-01-02", ...],
    "datasets": [
      {
        "label": "Cumulative P&L",
        "data": [0, 150000, 280000, 180000, 350000, ...]
      }
    ]
  }
}
```

---

### Brokers

#### Create Broker
```http
POST /api/v1/brokers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Interactive Brokers",
  "type": "multi_asset",
  "defaultCurrency": "USD",
  "commissionStructure": {
    "type": "per_share",
    "value": 1,
    "minimumCommission": 100
  }
}
```

#### List Brokers
```http
GET /api/v1/brokers
Authorization: Bearer {token}
```

#### Update Broker
```http
PATCH /api/v1/brokers/:id
Authorization: Bearer {token}
```

#### Delete Broker
```http
DELETE /api/v1/brokers/:id
Authorization: Bearer {token}
```

---

### Trading Accounts

#### Create Account
```http
POST /api/v1/trading-accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Main Trading Account",
  "brokerId": "507f1f77bcf86cd799439011",
  "type": "margin",
  "currency": "SAR",
  "initialBalance": 10000000,
  "maxDailyLossPercent": 2,
  "defaultRiskPercent": 1
}
```

#### List Accounts
```http
GET /api/v1/trading-accounts
Authorization: Bearer {token}
```

#### Get Account Balance
```http
GET /api/v1/trading-accounts/:id/balance
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "initialBalance": 10000000,
    "deposits": 0,
    "withdrawals": 0,
    "realizedPnl": 5300000,
    "unrealizedPnl": -150000,
    "currentBalance": 15150000,
    "todayPnl": 250000,
    "todayLossLimit": 200000,
    "todayLossUsed": 0,
    "canTrade": true
  }
}
```

---

### Trade Import

#### Import from CSV
```http
POST /api/v1/trades/import/csv
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [CSV file]
brokerId: "507f1f77bcf86cd799439011"
accountId: "507f1f77bcf86cd799439012"
```

**CSV Format** (flexible mapping):
```csv
Date,Symbol,Side,Quantity,Entry Price,Exit Price,P&L,Commission
2024-01-15,AAPL,Long,100,178.50,185.20,670,9.90
```

#### Import from Broker API
```http
POST /api/v1/trades/import/broker
Authorization: Bearer {token}
Content-Type: application/json

{
  "brokerId": "507f1f77bcf86cd799439011",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

---

## Calculations

### P&L Calculation

```typescript
function calculatePnl(trade: Trade): { grossPnl: number, netPnl: number, pnlPercent: number } {
  if (!trade.exitPrice) return { grossPnl: 0, netPnl: 0, pnlPercent: 0 }

  const priceDiff = trade.direction === 'long'
    ? trade.exitPrice - trade.entryPrice
    : trade.entryPrice - trade.exitPrice

  // Convert to halalas
  const grossPnl = Math.round(priceDiff * trade.quantity * 100)

  const totalFees = (trade.entryCommission || 0) + (trade.exitCommission || 0)
                  + (trade.entryFees || 0) + (trade.exitFees || 0)

  const netPnl = grossPnl - totalFees

  const pnlPercent = (priceDiff / trade.entryPrice) * 100

  return { grossPnl, netPnl, pnlPercent }
}
```

### R-Multiple Calculation

```typescript
function calculateRMultiple(trade: Trade): number | null {
  if (!trade.riskAmount || trade.riskAmount === 0) return null
  if (!trade.netPnl) return null

  return trade.netPnl / trade.riskAmount
}
```

### Risk/Reward Ratio Calculation

```typescript
function calculateRiskReward(trade: Trade): number | null {
  if (!trade.stopLoss || !trade.takeProfit) return null

  const risk = trade.direction === 'long'
    ? trade.entryPrice - trade.stopLoss
    : trade.stopLoss - trade.entryPrice

  const reward = trade.direction === 'long'
    ? trade.takeProfit - trade.entryPrice
    : trade.entryPrice - trade.takeProfit

  if (risk <= 0) return null

  return reward / risk
}
```

### Profit Factor Calculation

```typescript
function calculateProfitFactor(stats: TradeStats): number {
  if (stats.grossLoss === 0) return stats.grossProfit > 0 ? Infinity : 0
  return stats.grossProfit / Math.abs(stats.grossLoss)
}
```

### Win Rate Calculation

```typescript
function calculateWinRate(stats: TradeStats): number {
  const decidedTrades = stats.winningTrades + stats.losingTrades
  if (decidedTrades === 0) return 0
  return (stats.winningTrades / decidedTrades) * 100
}
```

---

## Business Rules

### Trade Validation

1. **Symbol**: Required, alphanumeric with optional `/` for forex pairs
2. **Entry Price**: Required, must be positive
3. **Quantity**: Required, must be positive
4. **Entry Date**: Required, cannot be in the future
5. **Exit Date**: If provided, must be after entry date
6. **Stop Loss**:
   - For long: Must be below entry price
   - For short: Must be above entry price
7. **Take Profit**:
   - For long: Must be above entry price
   - For short: Must be below entry price

### Risk Management

1. **Daily Loss Limit**: If `maxDailyLoss` is set on account, reject trades when limit is reached
2. **Position Size Check**: Warn if position size exceeds `maxPositionSize`
3. **Max Open Trades**: Block new trades if `maxOpenTrades` limit reached

### Auto-calculations on Save

When a trade is created or updated, automatically calculate:
- `riskRewardRatio` (if stopLoss and takeProfit set)
- `positionValue` (entryPrice × quantity × 100)
- `holdingPeriod` (if exitDate set)
- `grossPnl`, `netPnl`, `pnlPercent` (if closed)
- `rMultiple` (if closed and riskAmount set)

---

## Error Codes

| Code | Message |
|------|---------|
| `TRADE_NOT_FOUND` | Trade not found |
| `TRADE_ALREADY_CLOSED` | Trade is already closed |
| `INVALID_EXIT_DATE` | Exit date must be after entry date |
| `INVALID_STOP_LOSS` | Stop loss must be below entry for long trades |
| `INVALID_TAKE_PROFIT` | Take profit must be above entry for long trades |
| `DAILY_LOSS_LIMIT_REACHED` | Daily loss limit has been reached |
| `MAX_TRADES_REACHED` | Maximum open trades limit reached |
| `BROKER_NOT_FOUND` | Broker not found |
| `ACCOUNT_NOT_FOUND` | Trading account not found |
| `IMPORT_FAILED` | Failed to import trades |

---

## Arabic Labels Reference

| English | Arabic |
|---------|--------|
| Investments | الاستثمارات |
| Trading Journal | سجل التداول |
| New Trade | صفقة جديدة |
| Open Trades | صفقات مفتوحة |
| Closed Trades | صفقات مغلقة |
| Total P&L | إجمالي الأرباح/الخسائر |
| Win Rate | معدل الفوز |
| Profit Factor | عامل الربح |
| R-Multiple | مضاعف المخاطرة |
| Entry Price | سعر الدخول |
| Exit Price | سعر الخروج |
| Stop Loss | وقف الخسارة |
| Take Profit | جني الأرباح |
| Position Size | حجم المركز |
| Risk Amount | مبلغ المخاطرة |
| Commission | العمولة |
| Holding Period | مدة الاحتفاظ |
| Trade Setup | إعداد الصفقة |
| Timeframe | الإطار الزمني |
| Market Condition | حالة السوق |
| Emotion | الحالة النفسية |
| Trade Notes | ملاحظات الصفقة |
| Lessons Learned | الدروس المستفادة |
| Mistakes | الأخطاء |

---

## Stock Data API Integration (Yahoo Finance)

### Overview

For fetching real-time stock prices and market data, use the `yahoo-finance2` npm package. This provides access to:
- Saudi stocks (Tadawul) via `.SR` suffix symbols
- International stocks
- Forex pairs
- Cryptocurrencies
- Commodities

### Installation

```bash
npm install yahoo-finance2
```

### Saudi Stock Symbol Format

Saudi stocks use the format `XXXX.SR` where XXXX is a 4-digit number:

| Company | Symbol | Yahoo Symbol |
|---------|--------|--------------|
| Al Rajhi Bank | 1120 | 1120.SR |
| Saudi Aramco | 2222 | 2222.SR |
| STC | 7010 | 7010.SR |
| SABIC | 2010 | 2010.SR |
| Almarai | 2280 | 2280.SR |
| TASI Index | ^TASI | ^TASI.SR |

### API Endpoints for Stock Data

#### GET /api/stocks/search
Search for stocks by symbol or name.

```typescript
// Query params
interface StockSearchParams {
  q: string           // Search query
  market?: string     // 'saudi' | 'international' | 'all'
  sector?: string     // Sector filter
  limit?: number      // Max results (default: 20)
}

// Response
interface StockSearchResult {
  symbol: string
  yahooSymbol: string
  nameAr: string
  nameEn: string
  sector: string
  sectorAr: string
  type: 'stock' | 'etf' | 'reit' | 'sukuk'
}
```

#### GET /api/stocks/quote/:symbol
Get real-time quote for a symbol.

```typescript
// Server-side implementation using yahoo-finance2
import yahooFinance from 'yahoo-finance2'

async function getQuote(yahooSymbol: string) {
  const quote = await yahooFinance.quote(yahooSymbol)
  return {
    symbol: quote.symbol,
    price: quote.regularMarketPrice,
    previousClose: quote.regularMarketPreviousClose,
    change: quote.regularMarketChange,
    changePercent: quote.regularMarketChangePercent,
    open: quote.regularMarketOpen,
    high: quote.regularMarketDayHigh,
    low: quote.regularMarketDayLow,
    volume: quote.regularMarketVolume,
    marketCap: quote.marketCap,
    currency: quote.currency,
    exchange: quote.exchange,
  }
}
```

#### GET /api/stocks/historical/:symbol
Get historical price data.

```typescript
// Query params
interface HistoricalParams {
  period1: string   // Start date (ISO)
  period2: string   // End date (ISO)
  interval: '1d' | '1wk' | '1mo'  // Data interval
}

// Server-side implementation
async function getHistoricalData(yahooSymbol: string, params: HistoricalParams) {
  const data = await yahooFinance.historical(yahooSymbol, {
    period1: params.period1,
    period2: params.period2,
    interval: params.interval,
  })
  return data.map(d => ({
    date: d.date,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
    volume: d.volume,
  }))
}
```

#### GET /api/stocks/batch-quotes
Get quotes for multiple symbols at once.

```typescript
// Request
interface BatchQuotesRequest {
  symbols: string[]  // Array of Yahoo symbols
}

// Response
interface BatchQuotesResponse {
  quotes: Record<string, StockQuote>
  errors: Record<string, string>
}
```

### Frontend Stock Data (Pre-loaded)

The frontend includes pre-loaded Saudi stock data in `/src/features/finance/data/saudi-stocks.ts`:
- 50+ major Saudi stocks
- 10+ REITs
- Mutual funds (ETFs)
- Sector mappings
- Search function

This allows instant symbol lookup without API calls, while prices are fetched from backend.

### Price Update Strategy

1. **Initial Load**: Fetch current price when viewing trade details
2. **Trade Entry**: Fetch price to validate entry (optional)
3. **Portfolio View**: Batch fetch prices for all open positions
4. **Refresh Interval**: Every 60 seconds for open market hours (9:00 AM - 3:00 PM Saudi time)

### Market Hours (Tadawul)

```typescript
const TADAWUL_HOURS = {
  timezone: 'Asia/Riyadh',
  openingHour: 10,      // 10:00 AM
  closingHour: 15,      // 3:00 PM
  workDays: [0, 1, 2, 3, 4], // Sunday to Thursday
}

function isTadawulOpen(): boolean {
  const now = new Date()
  const options = { timeZone: 'Asia/Riyadh' }
  const hours = parseInt(now.toLocaleTimeString('en-US', { ...options, hour: '2-digit', hour12: false }))
  const day = new Date().toLocaleDateString('en-US', { ...options, weekday: 'short' })

  const isWorkDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].includes(day)
  const isMarketHours = hours >= 10 && hours < 15

  return isWorkDay && isMarketHours
}
```

### Arabic Labels for Stock Data

| English | Arabic |
|---------|--------|
| Price | السعر |
| Change | التغير |
| Change % | نسبة التغير |
| Open | الافتتاح |
| High | الأعلى |
| Low | الأدنى |
| Close | الإغلاق |
| Volume | حجم التداول |
| Market Cap | القيمة السوقية |
| 52 Week High | أعلى سعر (52 أسبوع) |
| 52 Week Low | أدنى سعر (52 أسبوع) |
| P/E Ratio | مكرر الربحية |
| Dividend Yield | عائد التوزيعات |

---

## Implementation Priority

### Phase 1: Core Trading (MVP)
1. Trade CRUD operations
2. Basic P&L calculations
3. Trade list with filters
4. Basic statistics (win rate, total P&L)

### Phase 2: Analytics
1. Advanced statistics
2. Performance charts
3. Breakdown by asset/setup/time
4. Equity curve visualization

### Phase 3: Risk Management
1. Broker/Account management
2. Daily loss limits
3. Position size validation
4. Trade import from CSV

### Phase 4: Advanced Features
1. Broker API integrations
2. Real-time price sync
3. Automated trade journaling
4. AI-powered insights
