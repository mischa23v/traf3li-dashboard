#!/usr/bin/env npx tsx
/**
 * Centralization Gap Scanner
 *
 * This script scans the entire codebase to find patterns that should be
 * centralized but were missed during the migration.
 *
 * Run with: npx tsx scripts/scan-centralization-gaps.ts
 * Or: npm run scan:gaps (after adding to package.json)
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface GapReport {
  category: string
  description: string
  files: { path: string; count: number; examples: string[] }[]
  priority: 'high' | 'medium' | 'low'
  totalCount: number
}

const SRC_DIR = path.join(process.cwd(), 'src')
const REPORTS: GapReport[] = []

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function grep(pattern: string, options: { glob?: string; exclude?: string[] } = {}): string[] {
  const excludeArgs = (options.exclude || [])
    .map(e => `--glob '!${e}'`)
    .join(' ')

  const globArg = options.glob ? `--glob '${options.glob}'` : ''

  try {
    const cmd = `rg -l "${pattern}" ${SRC_DIR} ${globArg} ${excludeArgs} 2>/dev/null || true`
    const result = execSync(cmd, { encoding: 'utf-8' })
    return result.trim().split('\n').filter(Boolean)
  } catch {
    return []
  }
}

function grepWithContext(pattern: string, file: string, contextLines = 0): string[] {
  try {
    const contextArg = contextLines > 0 ? `-C ${contextLines}` : ''
    const cmd = `rg "${pattern}" "${file}" ${contextArg} --no-heading 2>/dev/null || true`
    const result = execSync(cmd, { encoding: 'utf-8' })
    return result.trim().split('\n').filter(Boolean).slice(0, 5) // Max 5 examples
  } catch {
    return []
  }
}

function countMatches(pattern: string, file: string): number {
  try {
    const cmd = `rg -c "${pattern}" "${file}" 2>/dev/null || echo "0"`
    const result = execSync(cmd, { encoding: 'utf-8' })
    return parseInt(result.trim().split(':').pop() || '0', 10)
  } catch {
    return 0
  }
}

// =============================================================================
// SCAN FUNCTIONS
// =============================================================================

function scanIsArabicTernaries() {
  log('cyan', '\n🔍 Scanning for remaining isArabic ternaries...')

  // Pattern for UI text ternaries (not date/number formatting or DB field access)
  const pattern = "isArabic \\? ['\"]"
  const files = grep(pattern, {
    glob: '*.{ts,tsx}',
    exclude: ['*.test.*', '*.spec.*', 'node_modules/**', '*.d.ts']
  })

  const fileResults: GapReport['files'] = []

  for (const file of files) {
    const count = countMatches(pattern, file)
    if (count > 0) {
      const examples = grepWithContext(pattern, file)
      // Filter out acceptable patterns
      const filteredExamples = examples.filter(ex =>
        !ex.includes('ar-SA') &&
        !ex.includes('en-US') &&
        !ex.includes('.nameAr') &&
        !ex.includes('.titleAr') &&
        !ex.includes('.labelAr') &&
        !ex.includes('locale:') &&
        !ex.includes('ar : undefined') &&
        !ex.includes('ar : enUS')
      )

      if (filteredExamples.length > 0) {
        fileResults.push({
          path: file.replace(SRC_DIR, 'src'),
          count,
          examples: filteredExamples
        })
      }
    }
  }

  if (fileResults.length > 0) {
    REPORTS.push({
      category: 'i18n: isArabic Ternaries',
      description: 'Files with isArabic ternaries that should use t() function',
      files: fileResults.sort((a, b) => b.count - a.count),
      priority: 'high',
      totalCount: fileResults.reduce((sum, f) => sum + f.count, 0)
    })
  }
}

function scanHardcodedRoutes() {
  log('cyan', '\n🔍 Scanning for hardcoded route strings...')

  const routePatterns = [
    "'/dashboard/",
    '"/dashboard/',
    "to='/dashboard",
    'to="/dashboard',
    "href='/dashboard",
    'href="/dashboard',
    "navigate\\('/dashboard",
    'navigate\\("/dashboard',
  ]

  const fileResults: GapReport['files'] = []

  for (const pattern of routePatterns) {
    const files = grep(pattern, {
      glob: '*.{ts,tsx}',
      exclude: ['routes.ts', '*.test.*', 'node_modules/**']
    })

    for (const file of files) {
      const count = countMatches(pattern, file)
      if (count > 0) {
        const examples = grepWithContext(pattern, file)
        // Filter out route definitions and params usage
        const filteredExamples = examples.filter(ex =>
          !ex.includes('from:') && // TanStack Router params
          !ex.includes('ROUTES.') && // Already using constants
          !ex.includes('// Route:') // Comments
        )

        if (filteredExamples.length > 0) {
          const existing = fileResults.find(f => f.path === file.replace(SRC_DIR, 'src'))
          if (existing) {
            existing.count += count
            existing.examples.push(...filteredExamples.slice(0, 2))
          } else {
            fileResults.push({
              path: file.replace(SRC_DIR, 'src'),
              count,
              examples: filteredExamples.slice(0, 3)
            })
          }
        }
      }
    }
  }

  if (fileResults.length > 0) {
    REPORTS.push({
      category: 'Routes: Hardcoded Paths',
      description: 'Files with hardcoded route strings that should use ROUTES constants',
      files: fileResults.sort((a, b) => b.count - a.count),
      priority: 'high',
      totalCount: fileResults.reduce((sum, f) => sum + f.count, 0)
    })
  }
}

function scanHardcodedCacheTimes() {
  log('cyan', '\n🔍 Scanning for hardcoded cache times...')

  // Common cache time patterns in milliseconds
  const patterns = [
    'staleTime: [0-9]',
    'gcTime: [0-9]',
    'cacheTime: [0-9]',
    '\\* 60 \\* 1000', // Minutes to ms
    '\\* 1000 \\* 60', // Also minutes to ms
  ]

  const fileResults: GapReport['files'] = []

  for (const pattern of patterns) {
    const files = grep(pattern, {
      glob: '*.{ts,tsx}',
      exclude: ['cache.ts', '*.test.*', 'node_modules/**']
    })

    for (const file of files) {
      const count = countMatches(pattern, file)
      if (count > 0) {
        const examples = grepWithContext(pattern, file)
        // Filter out files already using CACHE_TIMES
        const filteredExamples = examples.filter(ex =>
          !ex.includes('CACHE_TIMES')
        )

        if (filteredExamples.length > 0) {
          fileResults.push({
            path: file.replace(SRC_DIR, 'src'),
            count,
            examples: filteredExamples.slice(0, 3)
          })
        }
      }
    }
  }

  if (fileResults.length > 0) {
    REPORTS.push({
      category: 'Config: Hardcoded Cache Times',
      description: 'Files with hardcoded cache times that should use CACHE_TIMES',
      files: fileResults.sort((a, b) => b.count - a.count),
      priority: 'medium',
      totalCount: fileResults.reduce((sum, f) => sum + f.count, 0)
    })
  }
}

function scanDirectQueryInvalidation() {
  log('cyan', '\n🔍 Scanning for direct query invalidation...')

  const pattern = 'queryClient\\.invalidateQueries'
  const files = grep(pattern, {
    glob: '*.{ts,tsx}',
    exclude: ['cache-invalidation.ts', 'query-keys.ts', '*.test.*', 'node_modules/**']
  })

  const fileResults: GapReport['files'] = []

  for (const file of files) {
    const count = countMatches(pattern, file)
    if (count > 0) {
      const examples = grepWithContext(pattern, file)
      // Filter out files using centralized invalidation
      const filteredExamples = examples.filter(ex =>
        !ex.includes('invalidateCache') &&
        !ex.includes('QueryKeys.')
      )

      if (filteredExamples.length > 0) {
        fileResults.push({
          path: file.replace(SRC_DIR, 'src'),
          count,
          examples: filteredExamples.slice(0, 3)
        })
      }
    }
  }

  if (fileResults.length > 0) {
    REPORTS.push({
      category: 'Cache: Direct Invalidation',
      description: 'Files with direct queryClient.invalidateQueries that should use invalidateCache',
      files: fileResults.sort((a, b) => b.count - a.count),
      priority: 'medium',
      totalCount: fileResults.reduce((sum, f) => sum + f.count, 0)
    })
  }
}

function scanHardcodedQueryKeys() {
  log('cyan', '\n🔍 Scanning for hardcoded query keys...')

  const patterns = [
    "queryKey: \\['",
    'queryKey: \\["',
    "\\['tasks'",
    "\\['invoices'",
    "\\['cases'",
    "\\['employees'",
    "\\['clients'",
  ]

  const fileResults: GapReport['files'] = []

  for (const pattern of patterns) {
    const files = grep(pattern, {
      glob: '*.{ts,tsx}',
      exclude: ['query-keys.ts', '*.test.*', 'node_modules/**']
    })

    for (const file of files) {
      const count = countMatches(pattern, file)
      if (count > 0) {
        const examples = grepWithContext(pattern, file)
        // Filter out files using QueryKeys
        const filteredExamples = examples.filter(ex =>
          !ex.includes('QueryKeys.')
        )

        if (filteredExamples.length > 0) {
          const existing = fileResults.find(f => f.path === file.replace(SRC_DIR, 'src'))
          if (!existing) {
            fileResults.push({
              path: file.replace(SRC_DIR, 'src'),
              count,
              examples: filteredExamples.slice(0, 3)
            })
          }
        }
      }
    }
  }

  if (fileResults.length > 0) {
    REPORTS.push({
      category: 'Cache: Hardcoded Query Keys',
      description: 'Files with hardcoded query keys that should use QueryKeys factory',
      files: fileResults.sort((a, b) => b.count - a.count),
      priority: 'medium',
      totalCount: fileResults.reduce((sum, f) => sum + f.count, 0)
    })
  }
}

function scanMagicNumbers() {
  log('cyan', '\n🔍 Scanning for magic numbers...')

  const patterns = [
    '0\\.15', // VAT rate
    'pageSize: [0-9]',
    'limit: [0-9]',
    'MAX_.*= [0-9]',
    'MIN_.*= [0-9]',
  ]

  const fileResults: GapReport['files'] = []

  for (const pattern of patterns) {
    const files = grep(pattern, {
      glob: '*.{ts,tsx}',
      exclude: ['*.config.*', 'config/**', '*.test.*', 'node_modules/**']
    })

    for (const file of files) {
      const count = countMatches(pattern, file)
      if (count > 0) {
        const examples = grepWithContext(pattern, file)
        // Filter out config imports
        const filteredExamples = examples.filter(ex =>
          !ex.includes('TAX_CONFIG') &&
          !ex.includes('PAGINATION') &&
          !ex.includes('FILE_LIMITS') &&
          !ex.includes('CANVAS') &&
          !ex.includes('import')
        )

        if (filteredExamples.length > 0) {
          fileResults.push({
            path: file.replace(SRC_DIR, 'src'),
            count,
            examples: filteredExamples.slice(0, 3)
          })
        }
      }
    }
  }

  if (fileResults.length > 0) {
    REPORTS.push({
      category: 'Config: Magic Numbers',
      description: 'Files with magic numbers that could be centralized in config',
      files: fileResults.sort((a, b) => b.count - a.count),
      priority: 'low',
      totalCount: fileResults.reduce((sum, f) => sum + f.count, 0)
    })
  }
}

function scanDuplicateSchemas() {
  log('cyan', '\n🔍 Scanning for duplicate Zod schemas...')

  const patterns = [
    'z\\.string\\(\\)\\.email\\(',
    'z\\.string\\(\\)\\.min\\(10\\)', // Phone patterns
    'z\\.string\\(\\)\\.regex\\(.*/^05', // Saudi phone
    'z\\.string\\(\\)\\.regex\\(.*/^SA', // IBAN
  ]

  const fileResults: GapReport['files'] = []

  for (const pattern of patterns) {
    const files = grep(pattern, {
      glob: '*.{ts,tsx}',
      exclude: ['shared-schemas.ts', '*.test.*', 'node_modules/**']
    })

    for (const file of files) {
      const count = countMatches(pattern, file)
      if (count > 0) {
        const examples = grepWithContext(pattern, file)
        // Filter out files using shared schemas
        const filteredExamples = examples.filter(ex =>
          !ex.includes('fieldSchemas') &&
          !ex.includes('compositeSchemas') &&
          !ex.includes('import.*shared-schemas')
        )

        if (filteredExamples.length > 0) {
          fileResults.push({
            path: file.replace(SRC_DIR, 'src'),
            count,
            examples: filteredExamples.slice(0, 3)
          })
        }
      }
    }
  }

  if (fileResults.length > 0) {
    REPORTS.push({
      category: 'Schemas: Duplicate Validation',
      description: 'Files with duplicate Zod schemas that could use shared-schemas',
      files: fileResults.sort((a, b) => b.count - a.count),
      priority: 'low',
      totalCount: fileResults.reduce((sum, f) => sum + f.count, 0)
    })
  }
}

function scanHardcodedApiEndpoints() {
  log('cyan', '\n🔍 Scanning for hardcoded API endpoints...')

  const patterns = [
    "'/api/",
    '"/api/',
    '`/api/',
  ]

  const fileResults: GapReport['files'] = []

  for (const pattern of patterns) {
    const files = grep(pattern, {
      glob: '*.{ts,tsx}',
      exclude: ['*.test.*', 'node_modules/**', 'api-client.ts']
    })

    for (const file of files) {
      const count = countMatches(pattern, file)
      if (count > 0) {
        const examples = grepWithContext(pattern, file)
        fileResults.push({
          path: file.replace(SRC_DIR, 'src'),
          count,
          examples: examples.slice(0, 3)
        })
      }
    }
  }

  if (fileResults.length > 0) {
    REPORTS.push({
      category: 'API: Hardcoded Endpoints',
      description: 'Files with hardcoded API endpoints that could be centralized',
      files: fileResults.sort((a, b) => b.count - a.count),
      priority: 'low',
      totalCount: fileResults.reduce((sum, f) => sum + f.count, 0)
    })
  }
}

function scanMissingErrorBoundaries() {
  log('cyan', '\n🔍 Scanning for routes without error boundaries...')

  const routesDir = path.join(SRC_DIR, 'routes/_authenticated')

  if (!fs.existsSync(routesDir)) {
    return
  }

  const routeFiles = fs.readdirSync(routesDir)
    .filter(f => f.endsWith('.tsx') && f.startsWith('dashboard.'))

  const missingBoundaries: string[] = []

  for (const routeFile of routeFiles) {
    const filePath = path.join(routesDir, routeFile)
    const content = fs.readFileSync(filePath, 'utf-8')

    if (!content.includes('ErrorBoundary') && !content.includes('errorComponent')) {
      missingBoundaries.push(routeFile)
    }
  }

  if (missingBoundaries.length > 0) {
    REPORTS.push({
      category: 'Error Boundaries: Missing',
      description: 'Route files without error boundaries',
      files: missingBoundaries.map(f => ({
        path: `src/routes/_authenticated/${f}`,
        count: 1,
        examples: []
      })),
      priority: 'medium',
      totalCount: missingBoundaries.length
    })
  }
}

function scanConsoleStatements() {
  log('cyan', '\n🔍 Scanning for console statements...')

  const pattern = 'console\\.(log|warn|error|debug|info)\\('
  const files = grep(pattern, {
    glob: '*.{ts,tsx}',
    exclude: ['*.test.*', 'node_modules/**', 'scripts/**']
  })

  const fileResults: GapReport['files'] = []

  for (const file of files) {
    const count = countMatches(pattern, file)
    if (count > 0) {
      const examples = grepWithContext(pattern, file)
      fileResults.push({
        path: file.replace(SRC_DIR, 'src'),
        count,
        examples: examples.slice(0, 2)
      })
    }
  }

  if (fileResults.length > 0) {
    REPORTS.push({
      category: 'Debug: Console Statements',
      description: 'Files with console statements that should be removed or use proper logging',
      files: fileResults.sort((a, b) => b.count - a.count).slice(0, 20), // Top 20
      priority: 'low',
      totalCount: fileResults.reduce((sum, f) => sum + f.count, 0)
    })
  }
}

function scanTodoComments() {
  log('cyan', '\n🔍 Scanning for TODO/FIXME comments...')

  const pattern = '(TODO|FIXME|HACK|XXX):'
  const files = grep(pattern, {
    glob: '*.{ts,tsx}',
    exclude: ['*.test.*', 'node_modules/**']
  })

  const fileResults: GapReport['files'] = []

  for (const file of files) {
    const count = countMatches(pattern, file)
    if (count > 0) {
      const examples = grepWithContext(pattern, file)
      fileResults.push({
        path: file.replace(SRC_DIR, 'src'),
        count,
        examples: examples.slice(0, 2)
      })
    }
  }

  if (fileResults.length > 0) {
    REPORTS.push({
      category: 'Code Quality: TODO Comments',
      description: 'Files with TODO/FIXME comments that may need attention',
      files: fileResults.sort((a, b) => b.count - a.count).slice(0, 15),
      priority: 'low',
      totalCount: fileResults.reduce((sum, f) => sum + f.count, 0)
    })
  }
}

// =============================================================================
// REPORT GENERATION
// =============================================================================

function generateReport() {
  log('bold', '\n' + '='.repeat(80))
  log('bold', '📊 CENTRALIZATION GAP SCAN REPORT')
  log('bold', '='.repeat(80))

  const highPriority = REPORTS.filter(r => r.priority === 'high')
  const mediumPriority = REPORTS.filter(r => r.priority === 'medium')
  const lowPriority = REPORTS.filter(r => r.priority === 'low')

  // Summary
  log('yellow', '\n📈 SUMMARY')
  log('reset', '-'.repeat(40))
  console.log(`  🔴 High Priority Issues:   ${highPriority.length} categories, ${highPriority.reduce((s, r) => s + r.totalCount, 0)} total occurrences`)
  console.log(`  🟡 Medium Priority Issues: ${mediumPriority.length} categories, ${mediumPriority.reduce((s, r) => s + r.totalCount, 0)} total occurrences`)
  console.log(`  🟢 Low Priority Issues:    ${lowPriority.length} categories, ${lowPriority.reduce((s, r) => s + r.totalCount, 0)} total occurrences`)

  // Detailed reports
  for (const report of REPORTS) {
    const priorityColor = report.priority === 'high' ? 'red' : report.priority === 'medium' ? 'yellow' : 'green'
    const priorityEmoji = report.priority === 'high' ? '🔴' : report.priority === 'medium' ? '🟡' : '🟢'

    log('bold', `\n${priorityEmoji} ${report.category}`)
    log('reset', '-'.repeat(60))
    console.log(`  ${report.description}`)
    console.log(`  Total occurrences: ${report.totalCount}`)
    console.log(`  Files affected: ${report.files.length}`)

    if (report.files.length > 0) {
      console.log('\n  Top files:')
      for (const file of report.files.slice(0, 10)) {
        console.log(`    ${file.path} (${file.count} occurrences)`)
        for (const example of file.examples.slice(0, 2)) {
          console.log(`      → ${example.trim().slice(0, 80)}...`)
        }
      }

      if (report.files.length > 10) {
        console.log(`    ... and ${report.files.length - 10} more files`)
      }
    }
  }

  // Write JSON report
  const reportPath = path.join(process.cwd(), 'centralization-gaps-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(REPORTS, null, 2))
  log('green', `\n✅ Detailed JSON report saved to: ${reportPath}`)

  // Recommendations
  log('magenta', '\n💡 RECOMMENDATIONS')
  log('reset', '-'.repeat(60))

  if (highPriority.length > 0) {
    console.log('  1. Address HIGH priority issues first:')
    for (const r of highPriority) {
      console.log(`     - ${r.category}: ${r.totalCount} occurrences in ${r.files.length} files`)
    }
  }

  if (mediumPriority.length > 0) {
    console.log('  2. Then tackle MEDIUM priority issues:')
    for (const r of mediumPriority) {
      console.log(`     - ${r.category}: ${r.totalCount} occurrences in ${r.files.length} files`)
    }
  }

  console.log('\n  To fix these issues, run agents in batches:')
  console.log('     npx tsx scripts/scan-centralization-gaps.ts | grep "high\\|medium"')
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  log('bold', '🔍 Starting Centralization Gap Scan...')
  log('reset', `Scanning directory: ${SRC_DIR}\n`)

  // Run all scans
  scanIsArabicTernaries()
  scanHardcodedRoutes()
  scanHardcodedCacheTimes()
  scanDirectQueryInvalidation()
  scanHardcodedQueryKeys()
  scanMagicNumbers()
  scanDuplicateSchemas()
  scanHardcodedApiEndpoints()
  scanMissingErrorBoundaries()
  scanConsoleStatements()
  scanTodoComments()

  // Generate report
  generateReport()
}

main().catch(console.error)
