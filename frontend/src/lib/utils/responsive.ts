/**
 * Responsive Utilities - Helper functions for responsive design
 * 
 * Provides utilities for handling responsive breakpoints and layouts
 */

// ============================================================================
// BREAKPOINT HELPERS
// ============================================================================

/**
 * Breakpoint values (matching Tailwind defaults)
 */
export const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

/**
 * Check if current viewport matches breakpoint
 * Note: This is for client-side use only (use in useEffect or event handlers)
 */
export function useBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
    if (typeof window === 'undefined') return false;
    
    const width = window.innerWidth;
    return width >= breakpoints[breakpoint];
}

/**
 * Get responsive grid columns class
 */
export function getGridColumns(cols: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
}): string {
    const classes: string[] = [];
    
    if (cols.mobile) classes.push(`grid-cols-${cols.mobile}`);
    if (cols.tablet) classes.push(`md:grid-cols-${cols.tablet}`);
    if (cols.desktop) classes.push(`lg:grid-cols-${cols.desktop}`);
    
    return classes.join(' ');
}

/**
 * Get responsive spacing class
 */
export function getResponsiveSpacing(
    mobile: string,
    tablet?: string,
    desktop?: string
): string {
    const classes = [mobile];
    if (tablet) classes.push(`md:${tablet}`);
    if (desktop) classes.push(`lg:${desktop}`);
    return classes.join(' ');
}

// ============================================================================
// CONTAINER HELPERS
// ============================================================================

/**
 * Standard container classes
 */
export const containers = {
    // Full width container
    full: 'w-full',
    
    // Constrained container with max-width
    constrained: 'container mx-auto px-4 sm:px-6 lg:px-8',
    
    // Narrow container for forms/content
    narrow: 'container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl',
    
    // Wide container for dashboards
    wide: 'container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl',
} as const;

// ============================================================================
// RESPONSIVE TEXT HELPERS
// ============================================================================

/**
 * Get responsive text size classes
 */
export function getResponsiveText(
    mobile: string,
    tablet?: string,
    desktop?: string
): string {
    const classes = [mobile];
    if (tablet) classes.push(`md:${tablet}`);
    if (desktop) classes.push(`lg:${desktop}`);
    return classes.join(' ');
}

// ============================================================================
// RESPONSIVE VISIBILITY
// ============================================================================

/**
 * Show/hide based on breakpoint
 */
export const visibility = {
    // Show only on mobile
    mobileOnly: 'block md:hidden',
    
    // Show only on tablet and up
    tabletUp: 'hidden md:block',
    
    // Show only on desktop and up
    desktopUp: 'hidden lg:block',
    
    // Hide on mobile
    hideMobile: 'hidden md:block',
    
    // Hide on desktop
    hideDesktop: 'block lg:hidden',
} as const;

