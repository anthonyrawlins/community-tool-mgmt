/**
 * Validation utilities for forms and user input
 * Focused on accessibility and clear error messages for aging users
 */

/**
 * Validate email address
 */
export function validateEmail(email: string): {
  isValid: boolean;
  message?: string;
} {
  if (!email || email.trim() === "") {
    return { isValid: false, message: "Email address is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { 
      isValid: false, 
      message: "Please enter a valid email address (e.g., name@example.com)" 
    };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message?: string;
  strength?: "weak" | "medium" | "strong";
} {
  if (!password || password.length === 0) {
    return { isValid: false, message: "Password is required" };
  }

  if (password.length < 8) {
    return { 
      isValid: false, 
      message: "Password must be at least 8 characters long",
      strength: "weak"
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  if (criteriaMet < 2) {
    return {
      isValid: false,
      message: "Password must contain at least 2 of: uppercase letters, lowercase letters, numbers, or special characters",
      strength: "weak"
    };
  }

  const strength = criteriaMet >= 3 ? "strong" : "medium";
  return { isValid: true, strength };
}

/**
 * Validate Australian phone number
 */
export function validatePhone(phone: string): {
  isValid: boolean;
  message?: string;
} {
  if (!phone || phone.trim() === "") {
    return { isValid: true }; // Phone is optional
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Australian phone numbers are typically 10 digits (mobile) or 8-10 digits (landline)
  if (cleaned.length < 8 || cleaned.length > 10) {
    return { 
      isValid: false, 
      message: "Please enter a valid Australian phone number" 
    };
  }

  // Mobile numbers start with 04
  if (cleaned.length === 10 && !cleaned.startsWith("04")) {
    return { 
      isValid: false, 
      message: "Mobile numbers should start with 04" 
    };
  }

  return { isValid: true };
}

/**
 * Validate Australian postcode
 */
export function validatePostcode(postcode: string): {
  isValid: boolean;
  message?: string;
} {
  if (!postcode || postcode.trim() === "") {
    return { isValid: false, message: "Postcode is required" };
  }

  // Australian postcodes are 4 digits
  const postcodeRegex = /^\d{4}$/;
  if (!postcodeRegex.test(postcode)) {
    return { 
      isValid: false, 
      message: "Please enter a valid 4-digit Australian postcode" 
    };
  }

  return { isValid: true };
}

/**
 * Validate required text field
 */
export function validateRequired(value: string, fieldName: string): {
  isValid: boolean;
  message?: string;
} {
  if (!value || value.trim() === "") {
    return { 
      isValid: false, 
      message: `${fieldName} is required` 
    };
  }

  return { isValid: true };
}

/**
 * Validate text length
 */
export function validateLength(
  value: string, 
  min: number, 
  max: number, 
  fieldName: string
): {
  isValid: boolean;
  message?: string;
} {
  if (value.length < min) {
    return { 
      isValid: false, 
      message: `${fieldName} must be at least ${min} characters long` 
    };
  }

  if (value.length > max) {
    return { 
      isValid: false, 
      message: `${fieldName} must be no more than ${max} characters long` 
    };
  }

  return { isValid: true };
}

/**
 * Validate date is not in the past
 */
export function validateFutureDate(date: Date | string, fieldName: string): {
  isValid: boolean;
  message?: string;
} {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  if (dateObj < today) {
    return { 
      isValid: false, 
      message: `${fieldName} cannot be in the past` 
    };
  }

  return { isValid: true };
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: Date | string, 
  endDate: Date | string
): {
  isValid: boolean;
  message?: string;
} {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (start >= end) {
    return { 
      isValid: false, 
      message: "End date must be after start date" 
    };
  }

  return { isValid: true };
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeBytes: number
): {
  isValid: boolean;
  message?: string;
} {
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: `File type not allowed. Please upload: ${allowedTypes.join(", ")}` 
    };
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
    return { 
      isValid: false, 
      message: `File size too large. Maximum size is ${maxSizeMB}MB` 
    };
  }

  return { isValid: true };
}