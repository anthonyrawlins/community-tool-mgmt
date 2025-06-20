/**
 * Utility functions for formatting data for display
 * Optimized for accessibility and aging users
 */

/**
 * Format currency for Australian dollars
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

/**
 * Format date for display with full month names for clarity
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);
}

/**
 * Format phone number for Australian format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format as (XX) XXXX XXXX for mobile or (XX) XXXX XXXX for landline
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }
  
  // Return original if not standard format
  return phone;
}

/**
 * Format membership type for display
 */
export function formatMembershipType(type: string): string {
  switch (type.toLowerCase()) {
    case "basic":
      return "Basic Membership";
    case "premium":
      return "Premium Membership";
    default:
      return type;
  }
}

/**
 * Format tool condition for display with color coding
 */
export function formatToolCondition(condition: string): {
  label: string;
  className: string;
} {
  switch (condition.toLowerCase()) {
    case "excellent":
      return { label: "Excellent", className: "text-green-700 bg-green-50" };
    case "good":
      return { label: "Good", className: "text-blue-700 bg-blue-50" };
    case "fair":
      return { label: "Fair", className: "text-yellow-700 bg-yellow-50" };
    case "needs-repair":
      return { label: "Needs Repair", className: "text-red-700 bg-red-50" };
    default:
      return { label: condition, className: "text-gray-700 bg-gray-50" };
  }
}

/**
 * Format booking status for display
 */
export function formatBookingStatus(status: string): {
  label: string;
  className: string;
} {
  switch (status.toLowerCase()) {
    case "pending":
      return { label: "Pending", className: "text-yellow-700 bg-yellow-50" };
    case "confirmed":
      return { label: "Confirmed", className: "text-blue-700 bg-blue-50" };
    case "active":
      return { label: "Active", className: "text-green-700 bg-green-50" };
    case "returned":
      return { label: "Returned", className: "text-gray-700 bg-gray-50" };
    case "overdue":
      return { label: "Overdue", className: "text-red-700 bg-red-50" };
    case "cancelled":
      return { label: "Cancelled", className: "text-red-700 bg-red-50" };
    default:
      return { label: status, className: "text-gray-700 bg-gray-50" };
  }
}

/**
 * Truncate text with ellipsis for consistent display
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Generate initials from name for avatar display
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate membership expiry status
 */
export function getMembershipStatus(expiryDate: Date | string): {
  status: "active" | "expiring" | "expired";
  daysRemaining: number;
  message: string;
} {
  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "expired",
      daysRemaining: 0,
      message: "Membership has expired"
    };
  } else if (diffDays <= 30) {
    return {
      status: "expiring",
      daysRemaining: diffDays,
      message: `Membership expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`
    };
  } else {
    return {
      status: "active",
      daysRemaining: diffDays,
      message: "Membership is active"
    };
  }
}