// User and Member types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Address;
  membershipStatus: MembershipStatus;
  membershipType: MembershipType;
  membershipExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export type MembershipStatus = "active" | "expired" | "suspended" | "pending";
export type MembershipType = "basic" | "premium";

// Tool types
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  condition: ToolCondition;
  availabilityStatus: AvailabilityStatus;
  imageUrl?: string;
  acquisitionDate: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  replacementCost: number;
  isRestricted: boolean; // For premium-only tools
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ToolCategory = 
  | "hand-tools" 
  | "power-tools" 
  | "garden-tools" 
  | "measuring-tools" 
  | "cleaning-equipment" 
  | "automotive" 
  | "electronics"
  | "safety-equipment"
  | "other";

export type ToolCondition = "excellent" | "good" | "fair" | "needs-repair";
export type AvailabilityStatus = "available" | "on-loan" | "maintenance" | "lost";

// Booking types
export interface Booking {
  id: string;
  userId: string;
  toolId: string;
  bookingDate: Date;
  startDate: Date;
  endDate: Date;
  actualReturnDate?: Date;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = "pending" | "confirmed" | "active" | "returned" | "overdue" | "cancelled";

// Payment types
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  paymentDate: Date;
  description: string;
}

export type PaymentType = "membership" | "late-fee" | "damage-fee" | "replacement-fee";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address: Address;
  membershipType: MembershipType;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}