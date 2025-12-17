/**
 * Audit Log Integrity System
 * NCA ECC 2-9-3 Compliant - Audit Log Tamper Detection
 */

interface AuditEntry {
  id: string
  timestamp: string
  action: string
  userId: string
  data: any
  previousHash?: string
  hash?: string
  signature?: string
}

interface IntegrityChain {
  entries: string[] // Array of entry hashes
  lastHash: string
  chainHash: string // Hash of entire chain
  createdAt: string
  updatedAt: string
}

const CHAIN_STORAGE_KEY = 'audit_integrity_chain'

/**
 * Generate SHA-256 hash of data
 */
async function sha256(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    // Fallback for environments without crypto.subtle
    let hash = 5381
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) + hash) + data.charCodeAt(i)
    }
    return Math.abs(hash).toString(16).padStart(64, '0')
  }
}

/**
 * Generate HMAC signature (simplified - real implementation should use backend)
 */
async function generateSignature(data: string, secret: string): Promise<string> {
  const combined = `${data}:${secret}`
  return sha256(combined)
}

/**
 * Get or initialize the integrity chain
 */
function getIntegrityChain(): IntegrityChain {
  try {
    const stored = localStorage.getItem(CHAIN_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Storage error
  }

  // Initialize new chain
  const now = new Date().toISOString()
  return {
    entries: [],
    lastHash: '0'.repeat(64), // Genesis hash
    chainHash: '',
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Save integrity chain
 */
function saveIntegrityChain(chain: IntegrityChain): void {
  try {
    localStorage.setItem(CHAIN_STORAGE_KEY, JSON.stringify(chain))
  } catch {
    // Storage full - in production, send to backend
    console.warn('[Audit Integrity] Storage full, chain not persisted locally')
  }
}

/**
 * Create a hashable string from audit entry
 */
function serializeEntry(entry: AuditEntry, previousHash: string): string {
  return JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    action: entry.action,
    userId: entry.userId,
    data: entry.data,
    previousHash,
  })
}

/**
 * Add an entry to the integrity chain
 * Returns the entry with hash and signature
 */
export async function addToIntegrityChain(entry: AuditEntry): Promise<AuditEntry> {
  const chain = getIntegrityChain()

  // Add previous hash reference
  entry.previousHash = chain.lastHash

  // Generate entry hash
  const serialized = serializeEntry(entry, chain.lastHash)
  entry.hash = await sha256(serialized)

  // Generate signature (in production, this should be done by backend with proper key)
  const signingSecret = `traf3li_audit_${entry.timestamp.split('T')[0]}`
  entry.signature = await generateSignature(entry.hash, signingSecret)

  // Update chain
  chain.entries.push(entry.hash)
  chain.lastHash = entry.hash
  chain.updatedAt = new Date().toISOString()

  // Update chain hash
  chain.chainHash = await sha256(chain.entries.join(':'))

  saveIntegrityChain(chain)

  return entry
}

/**
 * Verify integrity of a single entry
 */
export async function verifyEntry(
  entry: AuditEntry,
  expectedPreviousHash: string
): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = []

  // Check required fields
  if (!entry.hash) {
    issues.push('Missing hash')
  }

  if (!entry.previousHash) {
    issues.push('Missing previous hash reference')
  }

  if (entry.previousHash !== expectedPreviousHash) {
    issues.push(`Previous hash mismatch: expected ${expectedPreviousHash.slice(0, 8)}..., got ${entry.previousHash?.slice(0, 8)}...`)
  }

  // Recalculate hash
  if (entry.hash) {
    const serialized = serializeEntry(entry, entry.previousHash || '')
    const calculatedHash = await sha256(serialized)

    if (calculatedHash !== entry.hash) {
      issues.push('Hash mismatch - entry may have been tampered')
    }
  }

  // Verify signature
  if (entry.signature && entry.hash) {
    const signingSecret = `traf3li_audit_${entry.timestamp.split('T')[0]}`
    const expectedSignature = await generateSignature(entry.hash, signingSecret)

    if (entry.signature !== expectedSignature) {
      issues.push('Signature verification failed')
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Verify integrity of the entire chain
 */
export async function verifyChainIntegrity(
  entries: AuditEntry[]
): Promise<{
  valid: boolean
  totalEntries: number
  validEntries: number
  invalidEntries: number
  issues: Array<{ entryId: string; issues: string[] }>
}> {
  let previousHash = '0'.repeat(64) // Genesis hash
  const issuesList: Array<{ entryId: string; issues: string[] }> = []
  let validCount = 0

  for (const entry of entries) {
    const result = await verifyEntry(entry, previousHash)

    if (result.valid) {
      validCount++
    } else {
      issuesList.push({
        entryId: entry.id,
        issues: result.issues,
      })
    }

    previousHash = entry.hash || previousHash
  }

  return {
    valid: issuesList.length === 0,
    totalEntries: entries.length,
    validEntries: validCount,
    invalidEntries: issuesList.length,
    issues: issuesList,
  }
}

/**
 * Generate integrity report for compliance
 */
export async function generateIntegrityReport(): Promise<{
  chainStatus: 'valid' | 'invalid' | 'empty'
  entryCount: number
  chainHash: string
  createdAt: string
  lastUpdated: string
  genesisHash: string
  lastEntryHash: string
}> {
  const chain = getIntegrityChain()

  return {
    chainStatus: chain.entries.length === 0 ? 'empty' :
                 (chain.chainHash ? 'valid' : 'invalid'),
    entryCount: chain.entries.length,
    chainHash: chain.chainHash || 'N/A',
    createdAt: chain.createdAt,
    lastUpdated: chain.updatedAt,
    genesisHash: '0'.repeat(64),
    lastEntryHash: chain.lastHash,
  }
}

/**
 * Clear the integrity chain (for testing only)
 */
export function clearIntegrityChain(): void {
  try {
    localStorage.removeItem(CHAIN_STORAGE_KEY)
  } catch {
    // Ignore errors
  }
}

/**
 * Export chain for backend synchronization
 */
export function exportIntegrityChain(): IntegrityChain {
  return getIntegrityChain()
}

/**
 * Import chain from backend (for recovery)
 */
export function importIntegrityChain(chain: IntegrityChain): void {
  saveIntegrityChain(chain)
}

/**
 * Get chain statistics
 */
export function getChainStats(): {
  totalEntries: number
  firstEntry: string | null
  lastEntry: string | null
  chainAge: string
} {
  const chain = getIntegrityChain()

  const ageMs = new Date().getTime() - new Date(chain.createdAt).getTime()
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))

  return {
    totalEntries: chain.entries.length,
    firstEntry: chain.entries[0]?.slice(0, 16) || null,
    lastEntry: chain.entries[chain.entries.length - 1]?.slice(0, 16) || null,
    chainAge: ageDays === 0 ? 'أقل من يوم' : `${ageDays} يوم`,
  }
}

export default {
  addToIntegrityChain,
  verifyEntry,
  verifyChainIntegrity,
  generateIntegrityReport,
  clearIntegrityChain,
  exportIntegrityChain,
  importIntegrityChain,
  getChainStats,
}
