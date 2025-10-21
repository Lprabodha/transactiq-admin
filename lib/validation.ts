/**
 * Validation Utilities
 * 
 * Provides comprehensive input validation and sanitization functions
 * to ensure data integrity and security across the application.
 */

/**
 * Validates an email address format
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates a transaction ID format
 * @param transactionId - Transaction ID to validate
 * @returns True if transaction ID is valid
 */
export function isValidTransactionId(transactionId: string): boolean {
  return /^[A-Za-z0-9_-]{6,50}$/.test(transactionId)
}

/**
 * Validates currency code (ISO 4217)
 * @param currency - Currency code to validate
 * @returns True if currency code is valid
 */
export function isValidCurrency(currency: string): boolean {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR']
  return validCurrencies.includes(currency.toUpperCase())
}

/**
 * Validates an amount (must be positive number)
 * @param amount - Amount to validate
 * @returns True if amount is valid
 */
export function isValidAmount(amount: number): boolean {
  return typeof amount === 'number' && amount > 0 && isFinite(amount)
}

/**
 * Sanitizes string input to prevent XSS attacks
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validates date string format
 * @param dateString - Date string to validate
 * @returns True if date is valid
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Validates risk score (0-100)
 * @param score - Risk score to validate
 * @returns True if score is valid
 */
export function isValidRiskScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100
}

/**
 * Validates pagination parameters
 * @param limit - Number of items per page
 * @param skip - Number of items to skip
 * @returns Validation result
 */
export function validatePagination(limit?: number, skip?: number): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (limit !== undefined) {
    if (typeof limit !== 'number' || limit < 1 || limit > 1000) {
      errors.push('Limit must be between 1 and 1000')
    }
  }

  if (skip !== undefined) {
    if (typeof skip !== 'number' || skip < 0) {
      errors.push('Skip must be a non-negative number')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates search query
 * @param query - Search query string
 * @returns True if query is valid
 */
export function isValidSearchQuery(query: string): boolean {
  return query.length >= 1 && query.length <= 200
}

/**
 * Rate limiting helper - simple in-memory implementation
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  /**
   * Check if request is allowed for given identifier
   * @param identifier - Unique identifier (e.g., IP address)
   * @returns True if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    
    return true
  }

  /**
   * Reset rate limit for identifier
   * @param identifier - Unique identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier)
  }

  /**
   * Clean up old entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now()
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < this.windowMs)
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
  }
}

/**
 * Validates transaction data before submission
 * @param data - Transaction data to validate
 * @returns Validation result with errors
 */
export function validateTransactionData(data: any): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  if (!data.transaction_id || !isValidTransactionId(data.transaction_id)) {
    errors.transaction_id = 'Invalid transaction ID format'
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Invalid email address'
  }

  if (!isValidAmount(data.amount)) {
    errors.amount = 'Amount must be a positive number'
  }

  if (!data.currency || !isValidCurrency(data.currency)) {
    errors.currency = 'Invalid or unsupported currency code'
  }

  if (!data.gateway || data.gateway.trim().length === 0) {
    errors.gateway = 'Gateway is required'
  }

  if (data.risk_score !== undefined && !isValidRiskScore(data.risk_score)) {
    errors.risk_score = 'Risk score must be between 0 and 100'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

