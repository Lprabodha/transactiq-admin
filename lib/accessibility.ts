/**
 * Accessibility Utilities
 * 
 * Helper functions and utilities to ensure WCAG 2.1 AA compliance
 * and improve accessibility across the application.
 */

/**
 * Generates accessible ARIA labels for data visualizations
 * @param type - Type of chart or visualization
 * @param data - Data being visualized
 * @returns ARIA label string
 */
export function generateChartAriaLabel(
  type: 'bar' | 'line' | 'pie' | 'area',
  data: any[]
): string {
  const count = data.length
  return `${type} chart showing ${count} data points`
}

/**
 * Generates screen reader announcements for dynamic content updates
 * @param message - Message to announce
 * @param priority - Priority level (polite or assertive)
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Checks if an element is keyboard focusable
 * @param element - DOM element to check
 * @returns True if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false
  if (element.hasAttribute('disabled')) return false
  if (element.getAttribute('aria-hidden') === 'true') return false
  
  const style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden') return false
  
  return true
}

/**
 * Traps focus within a container (useful for modals/dialogs)
 * @param container - Container element
 * @returns Cleanup function
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable?.focus()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable?.focus()
      }
    }
  }
  
  container.addEventListener('keydown', handleKeyDown)
  firstFocusable?.focus()
  
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Calculates contrast ratio between two colors
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 * @returns Contrast ratio
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Checks if color combination meets WCAG AA standards
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param level - WCAG level ('AA' or 'AAA')
 * @param size - Text size category
 * @returns True if combination passes
 */
export function meetsWCAG(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = calculateContrastRatio(foreground, background)
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7
  }
  
  return size === 'large' ? ratio >= 3 : ratio >= 4.5
}

/**
 * Formats number for screen readers
 * @param value - Number to format
 * @param type - Type of number
 * @returns Formatted string for screen readers
 */
export function formatNumberForScreenReader(
  value: number,
  type: 'currency' | 'percentage' | 'count' = 'count'
): string {
  switch (type) {
    case 'currency':
      return `${value} dollars`
    case 'percentage':
      return `${value} percent`
    case 'count':
      return value === 1 ? '1 item' : `${value} items`
    default:
      return String(value)
  }
}

/**
 * Creates accessible table caption
 * @param title - Table title
 * @param rowCount - Number of rows
 * @param columnCount - Number of columns
 * @returns Caption text
 */
export function createTableCaption(
  title: string,
  rowCount: number,
  columnCount: number
): string {
  return `${title}. Table with ${rowCount} rows and ${columnCount} columns`
}

/**
 * Keyboard navigation helper
 * Handles arrow key navigation in lists/grids
 */
export class KeyboardNavigationManager {
  private items: HTMLElement[]
  private currentIndex: number = 0
  
  constructor(container: HTMLElement, itemSelector: string) {
    this.items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector))
  }
  
  handleKeyDown(e: KeyboardEvent): void {
    const { key } = e
    
    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        this.focusNext()
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        this.focusPrevious()
        break
      case 'Home':
        e.preventDefault()
        this.focusFirst()
        break
      case 'End':
        e.preventDefault()
        this.focusLast()
        break
    }
  }
  
  private focusNext(): void {
    this.currentIndex = (this.currentIndex + 1) % this.items.length
    this.items[this.currentIndex]?.focus()
  }
  
  private focusPrevious(): void {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length
    this.items[this.currentIndex]?.focus()
  }
  
  private focusFirst(): void {
    this.currentIndex = 0
    this.items[0]?.focus()
  }
  
  private focusLast(): void {
    this.currentIndex = this.items.length - 1
    this.items[this.currentIndex]?.focus()
  }
}

/**
 * Generates unique ID for accessibility attributes
 * @param prefix - Optional prefix
 * @returns Unique ID string
 */
let idCounter = 0
export function generateA11yId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}`
}

/**
 * Skip to main content link handler
 * Improves keyboard navigation by allowing users to skip navigation
 */
export function setupSkipToContent(): void {
  const skipLink = document.querySelector<HTMLAnchorElement>('[href="#main-content"]')
  const mainContent = document.querySelector<HTMLElement>('#main-content')
  
  if (!skipLink || !mainContent) return
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault()
    mainContent.tabIndex = -1
    mainContent.focus()
    mainContent.addEventListener('blur', () => {
      mainContent.removeAttribute('tabindex')
    }, { once: true })
  })
}

