import api from './api'

export interface CurrencySettings {
  baseCurrency: string
  supportedCurrencies: string[]
  autoUpdate: boolean
  updateFrequency: string
  lastUpdate?: string
}

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  source: 'manual' | 'api'
  effectiveDate: string
  updatedAt: string
}

export interface ConvertAmountRequest {
  amount: number
  from: string
  to: string
  date?: string
}

export interface ConvertAmountResponse {
  originalAmount: number
  convertedAmount: number
  fromCurrency: string
  toCurrency: string
  exchangeRate: number
  date: string
}

export interface SupportedCurrency {
  code: string
  name: string
  symbol: string
}

const currencyService = {
  // Get currency settings
  getCurrencySettings: async (): Promise<CurrencySettings> => {
    const response = await api.get('/currency/settings')
    return response.data
  },

  // Get current exchange rates
  getExchangeRates: async (): Promise<ExchangeRate[]> => {
    const response = await api.get('/currency/rates')
    return response.data
  },

  // Convert amount between currencies
  convertAmount: async (data: ConvertAmountRequest): Promise<ConvertAmountResponse> => {
    const response = await api.post('/currency/convert', data)
    return response.data
  },

  // Set manual exchange rate
  setManualRate: async (from: string, to: string, rate: number): Promise<ExchangeRate> => {
    const response = await api.post('/currency/rates', { from, to, rate })
    return response.data
  },

  // Get supported currencies
  getSupportedCurrencies: async (): Promise<SupportedCurrency[]> => {
    const response = await api.get('/currency/supported')
    return response.data
  },

  // Update rates from external API
  updateRatesFromAPI: async (): Promise<{ success: boolean; updatedCount: number }> => {
    const response = await api.post('/currency/update')
    return response.data
  },
}

export default currencyService
