/**
 * Circuit Breaker Pattern Implementation
 *
 * Gold Standard: Prevents cascading failures by stopping requests
 * after too many failures. Used by Netflix Hystrix, resilience4j, etc.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests are rejected immediately
 * - HALF_OPEN: Testing if service recovered, allow limited requests
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

interface CircuitBreakerOptions {
  /** Number of failures before opening the circuit */
  failureThreshold: number
  /** Time in ms before attempting to close the circuit */
  resetTimeout: number
  /** Number of successful requests needed to close from half-open */
  successThreshold: number
  /** Time window in ms to count failures */
  failureWindow: number
}

interface CircuitBreakerState {
  state: CircuitState
  failures: number[]
  successes: number
  lastFailureTime: number
  openedAt: number
}

// Per-endpoint circuit breakers
const circuits = new Map<string, CircuitBreakerState>()

// Default options - Optimized for faster recovery
const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5, // Open after 5 failures
  resetTimeout: 15 * 1000, // Try again after 15 seconds (was 30s - faster recovery)
  successThreshold: 2, // Need 2 successes to close
  failureWindow: 60 * 1000, // Count failures in 1 minute window
}

/**
 * Get or create circuit breaker state for an endpoint
 */
const getCircuit = (endpoint: string): CircuitBreakerState => {
  let circuit = circuits.get(endpoint)
  if (!circuit) {
    circuit = {
      state: 'CLOSED',
      failures: [],
      successes: 0,
      lastFailureTime: 0,
      openedAt: 0,
    }
    circuits.set(endpoint, circuit)
  }
  return circuit
}

/**
 * Extract endpoint identifier from URL
 * Groups similar endpoints together (e.g., /api/v1/users/123 -> /api/v1/users)
 */
export const getEndpointKey = (url: string): string => {
  // Remove query params
  const [path] = url.split('?')

  // Replace UUIDs and numeric IDs with placeholder
  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/[0-9a-f]{24}/gi, '/:id') // MongoDB ObjectId
    .replace(/\/\d+/g, '/:id')
}

/**
 * Check if a request should be allowed
 */
export const shouldAllowRequest = (
  url: string,
  options: Partial<CircuitBreakerOptions> = {}
): { allowed: boolean; state: CircuitState; retryAfter?: number } => {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const endpoint = getEndpointKey(url)
  const circuit = getCircuit(endpoint)
  const now = Date.now()

  // Clean up old failures outside the window
  circuit.failures = circuit.failures.filter(
    (timestamp) => now - timestamp < opts.failureWindow
  )

  switch (circuit.state) {
    case 'CLOSED':
      return { allowed: true, state: 'CLOSED' }

    case 'OPEN': {
      // Check if we should transition to half-open
      const timeSinceOpen = now - circuit.openedAt
      if (timeSinceOpen >= opts.resetTimeout) {
        circuit.state = 'HALF_OPEN'
        circuit.successes = 0
        return { allowed: true, state: 'HALF_OPEN' }
      }
      // Still open - return retry-after time
      const retryAfter = Math.ceil((opts.resetTimeout - timeSinceOpen) / 1000)
      return { allowed: false, state: 'OPEN', retryAfter }
    }

    case 'HALF_OPEN':
      // Allow limited requests in half-open state
      return { allowed: true, state: 'HALF_OPEN' }

    default:
      return { allowed: true, state: 'CLOSED' }
  }
}

/**
 * Record a successful request
 */
export const recordSuccess = (
  url: string,
  options: Partial<CircuitBreakerOptions> = {}
): void => {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const endpoint = getEndpointKey(url)
  const circuit = getCircuit(endpoint)

  if (circuit.state === 'HALF_OPEN') {
    circuit.successes++
    if (circuit.successes >= opts.successThreshold) {
      // Close the circuit
      circuit.state = 'CLOSED'
      circuit.failures = []
      circuit.successes = 0
    }
  }
}

/**
 * Record a failed request
 */
export const recordFailure = (
  url: string,
  options: Partial<CircuitBreakerOptions> = {}
): void => {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const endpoint = getEndpointKey(url)
  const circuit = getCircuit(endpoint)
  const now = Date.now()

  circuit.failures.push(now)
  circuit.lastFailureTime = now

  // Clean up old failures
  circuit.failures = circuit.failures.filter(
    (timestamp) => now - timestamp < opts.failureWindow
  )

  if (circuit.state === 'HALF_OPEN') {
    // Immediately open on failure in half-open state
    circuit.state = 'OPEN'
    circuit.openedAt = now
    circuit.successes = 0
  } else if (circuit.state === 'CLOSED') {
    // Check if we should open the circuit
    if (circuit.failures.length >= opts.failureThreshold) {
      circuit.state = 'OPEN'
      circuit.openedAt = now
    }
  }
}

/**
 * Get circuit breaker status for an endpoint
 */
export const getCircuitStatus = (url: string): {
  state: CircuitState
  failures: number
  lastFailure: number | null
} => {
  const endpoint = getEndpointKey(url)
  const circuit = getCircuit(endpoint)

  return {
    state: circuit.state,
    failures: circuit.failures.length,
    lastFailure: circuit.lastFailureTime || null,
  }
}

/**
 * Reset circuit breaker for an endpoint
 */
export const resetCircuit = (url: string): void => {
  const endpoint = getEndpointKey(url)
  circuits.delete(endpoint)
}

/**
 * Reset all circuit breakers
 */
export const resetAllCircuits = (): void => {
  circuits.clear()
}

/**
 * Get all open circuits (for monitoring/debugging)
 */
export const getOpenCircuits = (): string[] => {
  const open: string[] = []
  circuits.forEach((circuit, endpoint) => {
    if (circuit.state === 'OPEN') {
      open.push(endpoint)
    }
  })
  return open
}
