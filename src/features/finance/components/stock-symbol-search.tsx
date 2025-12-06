import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Search, X, TrendingUp, Building2, Landmark, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
    type StockSymbol,
    saudiStocks,
    saudiReits,
    saudiFunds,
    searchSaudiSecurities,
    saudiSectors
} from '../data/saudi-stocks'

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

interface StockSymbolSearchProps {
    value: string
    onChange: (symbol: string) => void
    onSelectStock?: (stock: StockSymbol) => void
    placeholder?: string
    className?: string
}

// International assets for non-Saudi investments
const internationalAssets = [
    // US Tech Giants
    { symbol: 'AAPL', yahooSymbol: 'AAPL', nameAr: 'أبل', nameEn: 'Apple Inc.', sector: 'Technology', sectorAr: 'التقنية', type: 'stock' as const },
    { symbol: 'GOOGL', yahooSymbol: 'GOOGL', nameAr: 'جوجل', nameEn: 'Alphabet Inc.', sector: 'Technology', sectorAr: 'التقنية', type: 'stock' as const },
    { symbol: 'MSFT', yahooSymbol: 'MSFT', nameAr: 'مايكروسوفت', nameEn: 'Microsoft Corp.', sector: 'Technology', sectorAr: 'التقنية', type: 'stock' as const },
    { symbol: 'AMZN', yahooSymbol: 'AMZN', nameAr: 'أمازون', nameEn: 'Amazon.com Inc.', sector: 'Technology', sectorAr: 'التقنية', type: 'stock' as const },
    { symbol: 'TSLA', yahooSymbol: 'TSLA', nameAr: 'تسلا', nameEn: 'Tesla Inc.', sector: 'Technology', sectorAr: 'التقنية', type: 'stock' as const },
    { symbol: 'META', yahooSymbol: 'META', nameAr: 'ميتا', nameEn: 'Meta Platforms', sector: 'Technology', sectorAr: 'التقنية', type: 'stock' as const },
    { symbol: 'NVDA', yahooSymbol: 'NVDA', nameAr: 'نفيديا', nameEn: 'NVIDIA Corp.', sector: 'Technology', sectorAr: 'التقنية', type: 'stock' as const },

    // Forex
    { symbol: 'EUR/USD', yahooSymbol: 'EURUSD=X', nameAr: 'اليورو/الدولار', nameEn: 'EUR/USD', sector: 'Forex', sectorAr: 'العملات', type: 'stock' as const },
    { symbol: 'GBP/USD', yahooSymbol: 'GBPUSD=X', nameAr: 'الجنيه/الدولار', nameEn: 'GBP/USD', sector: 'Forex', sectorAr: 'العملات', type: 'stock' as const },
    { symbol: 'USD/JPY', yahooSymbol: 'USDJPY=X', nameAr: 'الدولار/الين', nameEn: 'USD/JPY', sector: 'Forex', sectorAr: 'العملات', type: 'stock' as const },
    { symbol: 'USD/SAR', yahooSymbol: 'SAR=X', nameAr: 'الدولار/الريال', nameEn: 'USD/SAR', sector: 'Forex', sectorAr: 'العملات', type: 'stock' as const },

    // Crypto
    { symbol: 'BTC', yahooSymbol: 'BTC-USD', nameAr: 'بيتكوين', nameEn: 'Bitcoin', sector: 'Crypto', sectorAr: 'العملات الرقمية', type: 'stock' as const },
    { symbol: 'ETH', yahooSymbol: 'ETH-USD', nameAr: 'إيثيريوم', nameEn: 'Ethereum', sector: 'Crypto', sectorAr: 'العملات الرقمية', type: 'stock' as const },
    { symbol: 'XRP', yahooSymbol: 'XRP-USD', nameAr: 'ريبل', nameEn: 'Ripple', sector: 'Crypto', sectorAr: 'العملات الرقمية', type: 'stock' as const },

    // Commodities
    { symbol: 'GOLD', yahooSymbol: 'GC=F', nameAr: 'الذهب', nameEn: 'Gold Futures', sector: 'Commodities', sectorAr: 'السلع', type: 'stock' as const },
    { symbol: 'SILVER', yahooSymbol: 'SI=F', nameAr: 'الفضة', nameEn: 'Silver Futures', sector: 'Commodities', sectorAr: 'السلع', type: 'stock' as const },
    { symbol: 'OIL', yahooSymbol: 'CL=F', nameAr: 'النفط', nameEn: 'Crude Oil Futures', sector: 'Commodities', sectorAr: 'السلع', type: 'stock' as const },
]

export function StockSymbolSearch({
    value,
    onChange,
    onSelectStock,
    placeholder = 'البحث عن رمز السهم...',
    className
}: StockSymbolSearchProps) {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState(value)
    const [activeMarket, setActiveMarket] = useState<'saudi' | 'international'>('saudi')
    const [activeSector, setActiveSector] = useState('all')
    const [isSearching, setIsSearching] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Debounce the search query
    const debouncedQuery = useDebounce(inputValue, 150)

    // Sync external value changes to internal state
    useEffect(() => {
        if (value !== inputValue && !open) {
            setInputValue(value)
        }
    }, [value])

    // Memoized filtered results
    const filteredResults = useMemo(() => {
        setIsSearching(false)
        if (activeMarket === 'saudi') {
            return searchSaudiSecurities(debouncedQuery, activeSector)
        } else {
            let results = internationalAssets
            if (activeSector && activeSector !== 'all') {
                results = results.filter(s => s.sector === activeSector)
            }
            if (debouncedQuery) {
                const normalizedQuery = debouncedQuery.toLowerCase()
                results = results.filter(s =>
                    s.symbol.toLowerCase().includes(normalizedQuery) ||
                    s.nameAr.includes(debouncedQuery) ||
                    s.nameEn.toLowerCase().includes(normalizedQuery)
                )
            }
            return results
        }
    }, [debouncedQuery, activeMarket, activeSector])

    const handleSelect = useCallback((stock: StockSymbol) => {
        setInputValue(stock.symbol)
        onChange(stock.symbol)
        onSelectStock?.(stock)
        setOpen(false)
    }, [onChange, onSelectStock])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.toUpperCase()
        setInputValue(newValue)
        setIsSearching(true)
        if (!open) setOpen(true)
    }, [open])

    // Update parent only when debounced value changes
    useEffect(() => {
        if (debouncedQuery !== value) {
            onChange(debouncedQuery)
        }
    }, [debouncedQuery])

    const handleClear = useCallback(() => {
        setInputValue('')
        onChange('')
        inputRef.current?.focus()
    }, [onChange])

    const getTypeIcon = (type: StockSymbol['type']) => {
        switch (type) {
            case 'reit':
                return <Building2 className="h-4 w-4 text-emerald-500" />
            case 'etf':
                return <Landmark className="h-4 w-4 text-blue-500" />
            default:
                return <TrendingUp className="h-4 w-4 text-navy" />
        }
    }

    const internationalSectors = [
        { id: 'all', labelAr: 'الكل', labelEn: 'All' },
        { id: 'Technology', labelAr: 'التقنية', labelEn: 'Technology' },
        { id: 'Forex', labelAr: 'العملات', labelEn: 'Forex' },
        { id: 'Crypto', labelAr: 'العملات الرقمية', labelEn: 'Crypto' },
        { id: 'Commodities', labelAr: 'السلع', labelEn: 'Commodities' },
    ]

    const currentSectors = activeMarket === 'saudi' ? saudiSectors : internationalSectors

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className={cn("relative", className)}>
                    {isSearching ? (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none animate-spin" />
                    ) : (
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    )}
                    <Input
                        ref={inputRef}
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={() => setOpen(true)}
                        className="pr-10 pl-10 rounded-xl h-12 text-lg font-bold"
                    />
                    {inputValue && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6"
                            onClick={handleClear}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-[400px] p-0"
                align="start"
                side="bottom"
                sideOffset={4}
            >
                {/* Market Tabs */}
                <div className="p-3 border-b">
                    <Tabs value={activeMarket} onValueChange={(v) => {
                        setActiveMarket(v as 'saudi' | 'international')
                        setActiveSector('all')
                    }}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="saudi" className="gap-2">
                                <span className="text-xl">🇸🇦</span>
                                السوق السعودي
                            </TabsTrigger>
                            <TabsTrigger value="international" className="gap-2">
                                <span className="text-xl">🌍</span>
                                الأسواق العالمية
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Sector Filter */}
                <div className="p-3 border-b">
                    <ScrollArea className="w-full" dir="rtl">
                        <div className="flex gap-2 pb-2">
                            {currentSectors.slice(0, 8).map((sector) => (
                                <Badge
                                    key={sector.id}
                                    variant={activeSector === sector.id ? 'default' : 'outline'}
                                    className={cn(
                                        "cursor-pointer whitespace-nowrap",
                                        activeSector === sector.id
                                            ? "bg-navy hover:bg-navy/90"
                                            : "hover:bg-navy/10"
                                    )}
                                    onClick={() => setActiveSector(sector.id)}
                                >
                                    {sector.labelAr}
                                </Badge>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Results */}
                <ScrollArea className="h-[300px]">
                    {filteredResults.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Search className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p>لم يتم العثور على نتائج</p>
                            <p className="text-sm mt-1">جرب البحث برمز أو اسم مختلف</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {filteredResults.map((stock) => (
                                <button
                                    key={stock.symbol}
                                    onClick={() => handleSelect(stock)}
                                    className="w-full p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3 text-right"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center">
                                        {getTypeIcon(stock.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-navy">{stock.symbol}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {stock.sectorAr}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {stock.nameAr}
                                        </p>
                                    </div>
                                    {stock.yahooSymbol && (
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {stock.yahooSymbol}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Quick Stats */}
                <div className="p-3 border-t bg-muted/30">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                            {activeMarket === 'saudi' ? (
                                <>
                                    {saudiStocks.length} سهم • {saudiReits.length} ريت • {saudiFunds.length} صندوق
                                </>
                            ) : (
                                <>
                                    أسهم عالمية • عملات • عملات رقمية • سلع
                                </>
                            )}
                        </span>
                        <span>
                            {filteredResults.length} نتيجة
                        </span>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
