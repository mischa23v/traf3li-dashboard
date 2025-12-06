/**
 * Saudi Stock Exchange (Tadawul) Stock Data
 * Format: XXXX.SR (4-digit number + .SR suffix for Yahoo Finance)
 *
 * This data can be fetched from backend API using yahoo-finance2
 * Reference: https://finance.yahoo.com/quote/%5ETASI.SR/components/
 */

export type StockSymbol = {
    symbol: string
    yahooSymbol: string // For Yahoo Finance API
    nameAr: string
    nameEn: string
    sector: string
    sectorAr: string
    type: 'stock' | 'etf' | 'reit' | 'sukuk'
}

// Major Saudi Stocks - Top 50 by market cap
export const saudiStocks: StockSymbol[] = [
    // Banking Sector
    { symbol: '1120', yahooSymbol: '1120.SR', nameAr: 'مصرف الراجحي', nameEn: 'Al Rajhi Bank', sector: 'Banking', sectorAr: 'البنوك', type: 'stock' },
    { symbol: '1180', yahooSymbol: '1180.SR', nameAr: 'بنك الأهلي', nameEn: 'Saudi National Bank', sector: 'Banking', sectorAr: 'البنوك', type: 'stock' },
    { symbol: '1150', yahooSymbol: '1150.SR', nameAr: 'بنك الإنماء', nameEn: 'Alinma Bank', sector: 'Banking', sectorAr: 'البنوك', type: 'stock' },
    { symbol: '1050', yahooSymbol: '1050.SR', nameAr: 'بنك الجزيرة', nameEn: 'Bank AlJazira', sector: 'Banking', sectorAr: 'البنوك', type: 'stock' },
    { symbol: '1020', yahooSymbol: '1020.SR', nameAr: 'بنك الرياض', nameEn: 'Riyad Bank', sector: 'Banking', sectorAr: 'البنوك', type: 'stock' },
    { symbol: '1030', yahooSymbol: '1030.SR', nameAr: 'البنك السعودي الفرنسي', nameEn: 'Banque Saudi Fransi', sector: 'Banking', sectorAr: 'البنوك', type: 'stock' },
    { symbol: '1010', yahooSymbol: '1010.SR', nameAr: 'البنك السعودي البريطاني', nameEn: 'SABB', sector: 'Banking', sectorAr: 'البنوك', type: 'stock' },
    { symbol: '1060', yahooSymbol: '1060.SR', nameAr: 'البنك العربي الوطني', nameEn: 'Arab National Bank', sector: 'Banking', sectorAr: 'البنوك', type: 'stock' },

    // Petrochemicals & Energy
    { symbol: '2010', yahooSymbol: '2010.SR', nameAr: 'سابك', nameEn: 'SABIC', sector: 'Petrochemicals', sectorAr: 'البتروكيماويات', type: 'stock' },
    { symbol: '2330', yahooSymbol: '2330.SR', nameAr: 'المتقدمة', nameEn: 'Advanced Petrochemical', sector: 'Petrochemicals', sectorAr: 'البتروكيماويات', type: 'stock' },
    { symbol: '2310', yahooSymbol: '2310.SR', nameAr: 'سبكيم', nameEn: 'SIPCHEM', sector: 'Petrochemicals', sectorAr: 'البتروكيماويات', type: 'stock' },
    { symbol: '2290', yahooSymbol: '2290.SR', nameAr: 'ينساب', nameEn: 'Yanbu National Petrochemical', sector: 'Petrochemicals', sectorAr: 'البتروكيماويات', type: 'stock' },
    { symbol: '2380', yahooSymbol: '2380.SR', nameAr: 'بترو رابغ', nameEn: 'Petro Rabigh', sector: 'Petrochemicals', sectorAr: 'البتروكيماويات', type: 'stock' },
    { symbol: '2222', yahooSymbol: '2222.SR', nameAr: 'أرامكو السعودية', nameEn: 'Saudi Aramco', sector: 'Energy', sectorAr: 'الطاقة', type: 'stock' },

    // Telecommunications
    { symbol: '7010', yahooSymbol: '7010.SR', nameAr: 'الاتصالات السعودية', nameEn: 'STC', sector: 'Telecom', sectorAr: 'الاتصالات', type: 'stock' },
    { symbol: '7020', yahooSymbol: '7020.SR', nameAr: 'اتحاد اتصالات', nameEn: 'Mobily', sector: 'Telecom', sectorAr: 'الاتصالات', type: 'stock' },
    { symbol: '7030', yahooSymbol: '7030.SR', nameAr: 'زين السعودية', nameEn: 'Zain KSA', sector: 'Telecom', sectorAr: 'الاتصالات', type: 'stock' },

    // Retail & Consumer
    { symbol: '4190', yahooSymbol: '4190.SR', nameAr: 'جرير', nameEn: 'Jarir Marketing', sector: 'Retail', sectorAr: 'التجزئة', type: 'stock' },
    { symbol: '4003', yahooSymbol: '4003.SR', nameAr: 'إكسترا', nameEn: 'Extra', sector: 'Retail', sectorAr: 'التجزئة', type: 'stock' },
    { symbol: '4240', yahooSymbol: '4240.SR', nameAr: 'الحكير', nameEn: 'Al Hokair', sector: 'Retail', sectorAr: 'التجزئة', type: 'stock' },
    { symbol: '4001', yahooSymbol: '4001.SR', nameAr: 'عبدالله العثيم', nameEn: 'Abdullah Al Othaim', sector: 'Retail', sectorAr: 'التجزئة', type: 'stock' },
    { symbol: '4002', yahooSymbol: '4002.SR', nameAr: 'المواساة', nameEn: 'Mouwasat Medical', sector: 'Healthcare', sectorAr: 'الرعاية الصحية', type: 'stock' },

    // Real Estate & Construction
    { symbol: '4300', yahooSymbol: '4300.SR', nameAr: 'دار الأركان', nameEn: 'Dar Al Arkan', sector: 'Real Estate', sectorAr: 'العقارات', type: 'stock' },
    { symbol: '4310', yahooSymbol: '4310.SR', nameAr: 'المعذر', nameEn: 'Maabar', sector: 'Real Estate', sectorAr: 'العقارات', type: 'stock' },
    { symbol: '4250', yahooSymbol: '4250.SR', nameAr: 'جبل عمر', nameEn: 'Jabal Omar', sector: 'Real Estate', sectorAr: 'العقارات', type: 'stock' },
    { symbol: '2360', yahooSymbol: '2360.SR', nameAr: 'الشرقية للتنمية', nameEn: 'SHARQIA', sector: 'Real Estate', sectorAr: 'العقارات', type: 'stock' },

    // Food & Beverages
    { symbol: '2280', yahooSymbol: '2280.SR', nameAr: 'المراعي', nameEn: 'Almarai', sector: 'Food', sectorAr: 'الأغذية', type: 'stock' },
    { symbol: '6010', yahooSymbol: '6010.SR', nameAr: 'نادك', nameEn: 'NADEC', sector: 'Food', sectorAr: 'الأغذية', type: 'stock' },
    { symbol: '2270', yahooSymbol: '2270.SR', nameAr: 'صافولا', nameEn: 'Savola', sector: 'Food', sectorAr: 'الأغذية', type: 'stock' },

    // Insurance
    { symbol: '8010', yahooSymbol: '8010.SR', nameAr: 'التعاونية', nameEn: 'Tawuniya', sector: 'Insurance', sectorAr: 'التأمين', type: 'stock' },
    { symbol: '8200', yahooSymbol: '8200.SR', nameAr: 'الدرع العربي', nameEn: 'Arabian Shield', sector: 'Insurance', sectorAr: 'التأمين', type: 'stock' },
    { symbol: '8030', yahooSymbol: '8030.SR', nameAr: 'ميدغلف', nameEn: 'MedGulf', sector: 'Insurance', sectorAr: 'التأمين', type: 'stock' },

    // Healthcare
    { symbol: '4005', yahooSymbol: '4005.SR', nameAr: 'رعاية', nameEn: 'Care', sector: 'Healthcare', sectorAr: 'الرعاية الصحية', type: 'stock' },
    { symbol: '4004', yahooSymbol: '4004.SR', nameAr: 'دله الصحية', nameEn: 'Dallah Healthcare', sector: 'Healthcare', sectorAr: 'الرعاية الصحية', type: 'stock' },
    { symbol: '4007', yahooSymbol: '4007.SR', nameAr: 'المتوسطية', nameEn: 'Middle East Healthcare', sector: 'Healthcare', sectorAr: 'الرعاية الصحية', type: 'stock' },

    // Utilities
    { symbol: '5110', yahooSymbol: '5110.SR', nameAr: 'الكهرباء', nameEn: 'Saudi Electricity', sector: 'Utilities', sectorAr: 'المرافق العامة', type: 'stock' },
    { symbol: '2082', yahooSymbol: '2082.SR', nameAr: 'أكوا باور', nameEn: 'ACWA Power', sector: 'Utilities', sectorAr: 'المرافق العامة', type: 'stock' },

    // Industrial
    { symbol: '3010', yahooSymbol: '3010.SR', nameAr: 'أسمنت العربية', nameEn: 'Arabian Cement', sector: 'Industrial', sectorAr: 'الصناعة', type: 'stock' },
    { symbol: '3020', yahooSymbol: '3020.SR', nameAr: 'اليمامة للأسمنت', nameEn: 'Yamama Cement', sector: 'Industrial', sectorAr: 'الصناعة', type: 'stock' },
    { symbol: '3030', yahooSymbol: '3030.SR', nameAr: 'أسمنت السعودية', nameEn: 'Saudi Cement', sector: 'Industrial', sectorAr: 'الصناعة', type: 'stock' },
    { symbol: '1211', yahooSymbol: '1211.SR', nameAr: 'معادن', nameEn: 'Maaden', sector: 'Industrial', sectorAr: 'الصناعة', type: 'stock' },

    // Transportation
    { symbol: '4031', yahooSymbol: '4031.SR', nameAr: 'الخطوط السعودية للتموين', nameEn: 'Saudi Airlines Catering', sector: 'Transportation', sectorAr: 'النقل', type: 'stock' },
    { symbol: '4261', yahooSymbol: '4261.SR', nameAr: 'ذيب', nameEn: 'Theeb Rent a Car', sector: 'Transportation', sectorAr: 'النقل', type: 'stock' },
    { symbol: '4260', yahooSymbol: '4260.SR', nameAr: 'بدجت السعودية', nameEn: 'Budget Saudi', sector: 'Transportation', sectorAr: 'النقل', type: 'stock' },

    // Technology & Media
    { symbol: '1111', yahooSymbol: '1111.SR', nameAr: 'مجموعة تداول', nameEn: 'Tadawul Group', sector: 'Financial Services', sectorAr: 'الخدمات المالية', type: 'stock' },
    { symbol: '7200', yahooSymbol: '7200.SR', nameAr: 'الحاسب العربي', nameEn: 'Solutions', sector: 'Technology', sectorAr: 'التقنية', type: 'stock' },
    { symbol: '4270', yahooSymbol: '4270.SR', nameAr: 'العربية للتعهدات الفنية', nameEn: 'Arabian Contracting', sector: 'Industrial', sectorAr: 'الصناعة', type: 'stock' },

    // Entertainment
    { symbol: '1820', yahooSymbol: '1820.SR', nameAr: 'مجموعة المسلم', nameEn: 'Al Mosallam Group', sector: 'Consumer Services', sectorAr: 'خدمات المستهلكين', type: 'stock' },
]

// Saudi Mutual Funds
export const saudiFunds: StockSymbol[] = [
    { symbol: 'RJHI-EQTY', yahooSymbol: '', nameAr: 'صندوق الراجحي للأسهم السعودية', nameEn: 'Al Rajhi Saudi Equity Fund', sector: 'Equity', sectorAr: 'صناديق الأسهم', type: 'etf' },
    { symbol: 'RNBF-EQTY', yahooSymbol: '', nameAr: 'صندوق الرياض للأسهم السعودية', nameEn: 'Riyad Saudi Equity Fund', sector: 'Equity', sectorAr: 'صناديق الأسهم', type: 'etf' },
    { symbol: 'FALCOM-30', yahooSymbol: '9001.SR', nameAr: 'صندوق فالكم 30', nameEn: 'FALCOM 30 ETF', sector: 'Equity', sectorAr: 'صناديق الأسهم', type: 'etf' },
    { symbol: 'HSBC-ASTR', yahooSymbol: '', nameAr: 'صندوق إتش إس بي سي أسترا', nameEn: 'HSBC Astra Fund', sector: 'Equity', sectorAr: 'صناديق الأسهم', type: 'etf' },
]

// Saudi REITs
export const saudiReits: StockSymbol[] = [
    { symbol: '4330', yahooSymbol: '4330.SR', nameAr: 'الرياض ريت', nameEn: 'Riyad REIT', sector: 'REIT', sectorAr: 'صناديق الريت', type: 'reit' },
    { symbol: '4331', yahooSymbol: '4331.SR', nameAr: 'الجزيرة ريت', nameEn: 'Aljazira Mawten REIT', sector: 'REIT', sectorAr: 'صناديق الريت', type: 'reit' },
    { symbol: '4332', yahooSymbol: '4332.SR', nameAr: 'جدوى ريت الحرمين', nameEn: 'Jadwa REIT Al Haramain', sector: 'REIT', sectorAr: 'صناديق الريت', type: 'reit' },
    { symbol: '4334', yahooSymbol: '4334.SR', nameAr: 'سدكو كابيتال ريت', nameEn: 'SEDCO Capital REIT', sector: 'REIT', sectorAr: 'صناديق الريت', type: 'reit' },
    { symbol: '4335', yahooSymbol: '4335.SR', nameAr: 'مشاركة ريت', nameEn: 'Musharaka REIT', sector: 'REIT', sectorAr: 'صناديق الريت', type: 'reit' },
    { symbol: '4336', yahooSymbol: '4336.SR', nameAr: 'ملكية ريت', nameEn: 'Mulkia REIT', sector: 'REIT', sectorAr: 'صناديق الريت', type: 'reit' },
    { symbol: '4337', yahooSymbol: '4337.SR', nameAr: 'سيكو السعودية ريت', nameEn: 'SICO Saudi REIT', sector: 'REIT', sectorAr: 'صناديق الريت', type: 'reit' },
    { symbol: '4338', yahooSymbol: '4338.SR', nameAr: 'الأهلي ريت', nameEn: 'Alandalus REIT', sector: 'REIT', sectorAr: 'صناديق الريت', type: 'reit' },
    { symbol: '4339', yahooSymbol: '4339.SR', nameAr: 'دراية ريت', nameEn: 'Derayah REIT', sector: 'REIT', sectorAr: 'صناديق الريت', type: 'reit' },
    { symbol: '4340', yahooSymbol: '4340.SR', nameAr: 'الراجحي ريت', nameEn: 'Al Rajhi REIT', sector: 'REIT', sectorAr: 'صناديق الريت', type: 'reit' },
]

// All Saudi securities combined
export const allSaudiSecurities: StockSymbol[] = [
    ...saudiStocks,
    ...saudiFunds,
    ...saudiReits,
]

// Indices
export const saudiIndices = [
    { symbol: '^TASI', yahooSymbol: '^TASI.SR', nameAr: 'مؤشر السوق الرئيسي', nameEn: 'TASI - Tadawul All Share Index' },
    { symbol: '^TSBI', yahooSymbol: '^TSBI.SR', nameAr: 'مؤشر الصكوك والسندات', nameEn: 'TSBI - Tadawul Sukuk & Bonds Index' },
]

// Sector mapping for filtering
export const saudiSectors = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All' },
    { id: 'Banking', labelAr: 'البنوك', labelEn: 'Banking' },
    { id: 'Petrochemicals', labelAr: 'البتروكيماويات', labelEn: 'Petrochemicals' },
    { id: 'Energy', labelAr: 'الطاقة', labelEn: 'Energy' },
    { id: 'Telecom', labelAr: 'الاتصالات', labelEn: 'Telecommunications' },
    { id: 'Retail', labelAr: 'التجزئة', labelEn: 'Retail' },
    { id: 'Real Estate', labelAr: 'العقارات', labelEn: 'Real Estate' },
    { id: 'Food', labelAr: 'الأغذية', labelEn: 'Food & Beverages' },
    { id: 'Insurance', labelAr: 'التأمين', labelEn: 'Insurance' },
    { id: 'Healthcare', labelAr: 'الرعاية الصحية', labelEn: 'Healthcare' },
    { id: 'Utilities', labelAr: 'المرافق العامة', labelEn: 'Utilities' },
    { id: 'Industrial', labelAr: 'الصناعة', labelEn: 'Industrial' },
    { id: 'Transportation', labelAr: 'النقل', labelEn: 'Transportation' },
    { id: 'Technology', labelAr: 'التقنية', labelEn: 'Technology' },
    { id: 'Financial Services', labelAr: 'الخدمات المالية', labelEn: 'Financial Services' },
    { id: 'REIT', labelAr: 'صناديق الريت', labelEn: 'REITs' },
    { id: 'Equity', labelAr: 'صناديق الأسهم', labelEn: 'Equity Funds' },
]

// Search function
export function searchSaudiSecurities(query: string, sector?: string): StockSymbol[] {
    const normalizedQuery = query.toLowerCase().trim()

    let results = allSaudiSecurities

    // Filter by sector if provided
    if (sector && sector !== 'all') {
        results = results.filter(s => s.sector === sector)
    }

    // Filter by query
    if (normalizedQuery) {
        results = results.filter(s =>
            s.symbol.toLowerCase().includes(normalizedQuery) ||
            s.nameAr.includes(query) ||
            s.nameEn.toLowerCase().includes(normalizedQuery) ||
            s.yahooSymbol.toLowerCase().includes(normalizedQuery)
        )
    }

    return results
}
