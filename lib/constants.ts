/**
 * Design System Constants
 * 
 * Centralized design tokens, configuration values, and constants
 * used throughout the application for consistency.
 */

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  name: 'TransactIQ',
  description: 'AI-Powered Fraud Detection & Payment Intelligence Platform',
  version: '1.3.0',
  author: 'TransactIQ Team',
  supportEmail: 'support@transactiq.com',
  docsUrl: 'https://docs.transactiq.com',
  statusUrl: 'https://status.transactiq.com',
} as const

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseURL: '/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 1000,
  defaultSkip: 0,
} as const

/**
 * Chart Colors
 * Consistent color palette for data visualization
 */
export const CHART_COLORS = {
  primary: '#10b981', // Emerald/Green
  secondary: '#3b82f6', // Blue
  success: '#10b981', // Green
  warning: '#f59e0b', // Amber
  danger: '#ef4444', // Red
  info: '#06b6d4', // Cyan
  light: '#6ee7b7', // Light Green
  muted: '#6b7280', // Gray
  purple: '#8b5cf6', // Violet
  pink: '#ec4899', // Pink
} as const

export const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.info,
  CHART_COLORS.purple,
] as const

/**
 * Risk Levels and Thresholds
 */
export const RISK_LEVELS = {
  low: {
    label: 'Low Risk',
    threshold: { min: 0, max: 30 },
    color: CHART_COLORS.success,
    variant: 'default' as const,
  },
  medium: {
    label: 'Medium Risk',
    threshold: { min: 30, max: 70 },
    color: CHART_COLORS.warning,
    variant: 'secondary' as const,
  },
  high: {
    label: 'High Risk',
    threshold: { min: 70, max: 100 },
    color: CHART_COLORS.danger,
    variant: 'destructive' as const,
  },
} as const

/**
 * Get risk level based on score
 * @param score - Risk score (0-100)
 * @returns Risk level configuration
 */
export function getRiskLevel(score: number) {
  if (score < RISK_LEVELS.low.threshold.max) return RISK_LEVELS.low
  if (score < RISK_LEVELS.medium.threshold.max) return RISK_LEVELS.medium
  return RISK_LEVELS.high
}

/**
 * Transaction Statuses
 */
export const TRANSACTION_STATUS = {
  completed: {
    label: 'Completed',
    color: CHART_COLORS.success,
    variant: 'default' as const,
  },
  succeeded: {
    label: 'Succeeded',
    color: CHART_COLORS.success,
    variant: 'default' as const,
  },
  pending: {
    label: 'Pending',
    color: CHART_COLORS.warning,
    variant: 'secondary' as const,
  },
  failed: {
    label: 'Failed',
    color: CHART_COLORS.danger,
    variant: 'destructive' as const,
  },
  canceled: {
    label: 'Canceled',
    color: CHART_COLORS.muted,
    variant: 'outline' as const,
  },
} as const

/**
 * Priority Levels
 */
export const PRIORITY_LEVELS = {
  low: {
    label: 'Low',
    variant: 'secondary' as const,
    color: CHART_COLORS.info,
  },
  medium: {
    label: 'Medium',
    variant: 'default' as const,
    color: CHART_COLORS.warning,
  },
  high: {
    label: 'High',
    variant: 'destructive' as const,
    color: CHART_COLORS.danger,
  },
  critical: {
    label: 'Critical',
    variant: 'destructive' as const,
    color: CHART_COLORS.danger,
  },
} as const

/**
 * Supported Currencies
 */
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
] as const

/**
 * Payment Gateways
 */
export const PAYMENT_GATEWAYS = [
  { id: 'stripe', name: 'Stripe', logo: '/gateways/stripe.svg' },
  { id: 'solidgate', name: 'SolidGate', logo: '/gateways/solidgate.svg' },
  { id: 'paypal', name: 'PayPal', logo: '/gateways/paypal.svg' },
  { id: 'square', name: 'Square', logo: '/gateways/square.svg' },
] as const

/**
 * Date Ranges for Filtering
 */
export const DATE_RANGES = {
  today: {
    label: 'Today',
    getDates: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return { start: today, end: tomorrow }
    },
  },
  last7days: {
    label: 'Last 7 Days',
    getDates: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return { start, end }
    },
  },
  last30days: {
    label: 'Last 30 Days',
    getDates: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      return { start, end }
    },
  },
  last90days: {
    label: 'Last 90 Days',
    getDates: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 90)
      return { start, end }
    },
  },
  thisMonth: {
    label: 'This Month',
    getDates: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      return { start, end }
    },
  },
  lastMonth: {
    label: 'Last Month',
    getDates: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      return { start, end }
    },
  },
} as const

/**
 * Toast Notification Durations (in milliseconds)
 */
export const TOAST_DURATION = {
  short: 3000,
  medium: 5000,
  long: 7000,
  critical: 10000,
} as const

/**
 * Animation Durations
 */
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const

/**
 * Breakpoints (matches Tailwind)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * Z-Index Layers
 */
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const

/**
 * Feature Flags
 * Enable/disable features during development
 */
export const FEATURES = {
  enableAdvancedAnalytics: true,
  enableExportFeatures: true,
  enableNotifications: true,
  enableDarkMode: false, // Coming soon
  enableMultiLanguage: false, // Coming soon
} as const

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  generic: 'An unexpected error occurred. Please try again.',
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  serverError: 'Server error. Our team has been notified.',
} as const

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  transactionMarkedSafe: 'Transaction marked as safe successfully',
  transactionMarkedFraud: 'Transaction marked as fraudulent successfully',
  dataExported: 'Data exported successfully',
  settingsSaved: 'Settings saved successfully',
  userBlocked: 'User blocked successfully',
  refundProcessed: 'Refund processed successfully',
} as const

