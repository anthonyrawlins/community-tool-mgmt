/**
 * Accessibility utilities for aging users and screen readers
 */

/**
 * Generate unique IDs for form elements and ARIA labels
 */
export function generateId(prefix: string = "element"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Announce messages to screen readers
 */
export function announceToScreenReader(message: string): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Announce urgent messages to screen readers
 */
export function announceUrgentToScreenReader(message: string): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "assertive");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus management for keyboard navigation
 */
export function focusElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.focus();
  }
}

/**
 * Trap focus within a modal or dialog
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
    
    if (e.key === "Escape") {
      // Allow parent component to handle escape
      const escapeEvent = new CustomEvent("modal-escape");
      container.dispatchEvent(escapeEvent);
    }
  }

  container.addEventListener("keydown", handleKeyDown);
  firstElement?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia("(prefers-contrast: high)").matches;
}

/**
 * Get readable text color based on background
 */
export function getContrastingTextColor(backgroundColor: string): string {
  // Simple contrast checker - in production, use a proper color contrast library
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

/**
 * Format text for screen readers (expand abbreviations, etc.)
 */
export function formatForScreenReader(text: string): string {
  return text
    .replace(/\$/g, "dollars")
    .replace(/%/g, "percent")
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/-/g, "dash")
    .replace(/\//g, "slash")
    .replace(/@/g, "at");
}

/**
 * Create accessible error message element
 */
export function createErrorMessage(message: string, inputId?: string): HTMLElement {
  const errorElement = document.createElement("div");
  errorElement.className = "text-destructive text-sm mt-1";
  errorElement.setAttribute("role", "alert");
  errorElement.setAttribute("aria-live", "polite");
  
  if (inputId) {
    const errorId = `${inputId}-error`;
    errorElement.id = errorId;
  }
  
  errorElement.textContent = message;
  return errorElement;
}

/**
 * Scroll element into view with reduced motion consideration
 */
export function scrollIntoView(element: HTMLElement, options?: ScrollIntoViewOptions): void {
  const scrollOptions: ScrollIntoViewOptions = {
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "center",
    ...options,
  };
  
  element.scrollIntoView(scrollOptions);
}

/**
 * Check if touch device (for larger touch targets)
 */
export function isTouchDevice(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/**
 * Get appropriate button size class based on device
 */
export function getButtonSizeClass(): string {
  return isTouchDevice() ? "min-h-[44px] min-w-[44px]" : "min-h-[36px] min-w-[36px]";
}

/**
 * Format heading for proper semantic structure
 */
export function getHeadingLevel(level: number): "h1" | "h2" | "h3" | "h4" | "h5" | "h6" {
  const clampedLevel = Math.max(1, Math.min(6, level));
  return `h${clampedLevel}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

/**
 * Generate descriptive alt text for tool images
 */
export function generateToolAltText(toolName: string, condition?: string): string {
  const baseText = `Photo of ${toolName}`;
  return condition ? `${baseText} in ${condition} condition` : baseText;
}

/**
 * Create accessible loading state announcement
 */
export function announceLoadingState(isLoading: boolean, context?: string): void {
  const message = isLoading 
    ? `Loading ${context || "content"}...` 
    : `${context || "Content"} loaded successfully`;
  
  announceToScreenReader(message);
}