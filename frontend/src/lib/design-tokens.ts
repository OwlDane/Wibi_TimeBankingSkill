/**
 * Design Tokens - Centralized design system values
 * 
 * This file contains all design tokens for spacing, colors, typography,
 * shadows, transitions, and breakpoints used throughout the application.
 * 
 * Usage:
 *   import { spacing, colors, breakpoints } from '@/lib/design-tokens'
 */

// ============================================================================
// SPACING SCALE
// ============================================================================
/**
 * Spacing scale based on 4px base unit
 * Used for padding, margin, gap, etc.
 */
export const spacing = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    base: '1rem',     // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '2.5rem',  // 40px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
    '5xl': '6rem',    // 96px
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================
/**
 * Responsive breakpoints for mobile-first design
 * These match Tailwind's default breakpoints
 */
export const breakpoints = {
    sm: '640px',   // Small devices (landscape phones)
    md: '768px',   // Medium devices (tablets)
    lg: '1024px',  // Large devices (desktops)
    xl: '1280px',  // Extra large devices
    '2xl': '1536px', // 2X large devices
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================
/**
 * Typography scale for consistent text sizing
 */
export const typography = {
    xs: {
        fontSize: '0.75rem',    // 12px
        lineHeight: '1rem',     // 16px
    },
    sm: {
        fontSize: '0.875rem',   // 14px
        lineHeight: '1.25rem',   // 20px
    },
    base: {
        fontSize: '1rem',       // 16px
        lineHeight: '1.5rem',   // 24px
    },
    lg: {
        fontSize: '1.125rem',   // 18px
        lineHeight: '1.75rem',   // 28px
    },
    xl: {
        fontSize: '1.25rem',   // 20px
        lineHeight: '1.75rem',  // 28px
    },
    '2xl': {
        fontSize: '1.5rem',    // 24px
        lineHeight: '2rem',     // 32px
    },
    '3xl': {
        fontSize: '1.875rem',  // 30px
        lineHeight: '2.25rem',  // 36px
    },
    '4xl': {
        fontSize: '2.25rem',   // 36px
        lineHeight: '2.5rem',  // 40px
    },
    '5xl': {
        fontSize: '3rem',      // 48px
        lineHeight: '1',       // 48px
    },
} as const;

// ============================================================================
// TRANSITIONS & ANIMATIONS
// ============================================================================
/**
 * Standard transition durations and easing functions
 */
export const transitions = {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
    easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
} as const;

// ============================================================================
// SHADOWS
// ============================================================================
/**
 * Elevation shadows for depth hierarchy
 */
export const shadows = {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
/**
 * Border radius scale for consistent rounded corners
 */
export const radius = {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================
/**
 * Z-index scale for layering elements
 */
export const zIndex = {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
} as const;

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================
/**
 * Animation durations for consistent timing
 */
export const animations = {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
} as const;

// ============================================================================
// EXPORT ALL TOKENS
// ============================================================================
export const designTokens = {
    spacing,
    breakpoints,
    typography,
    transitions,
    shadows,
    radius,
    zIndex,
    animations,
} as const;

export default designTokens;

