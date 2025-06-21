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
  brand?: string;
  model?: string;
  barcode?: string;
  serialNumber?: string;
  category: ToolCategory;
  condition: ToolCondition;
  status: ToolStatus;
  imageUrl?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  location?: string;
  isActive: boolean;
  membershipRequired?: MembershipType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToolCategory {
  id: string;
  name: string;
  description?: string;
  parent?: {
    id: string;
    name: string;
  };
  children?: ToolCategory[];
  _count?: {
    tools: number;
  };
}

export type ToolCondition = "EXCELLENT" | "GOOD" | "FAIR" | "NEEDS_REPAIR";
export type ToolStatus = "AVAILABLE" | "ON_LOAN" | "MAINTENANCE" | "LOST" | "RETIRED";

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

export interface ToolsResponse {
  tools: Tool[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ToolFilters {
  categoryId?: string;
  status?: ToolStatus;
  condition?: ToolCondition;
  available?: boolean;
  search?: string;
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

// Member Dashboard specific types
export interface Member {
  id: string;
  membershipNumber: string;
  tier: MembershipType;
  isActive: boolean;
  expiresAt: Date;
  maxLoans: number;
  maxReservations: number;
}

export interface UserProfile extends User {
  address: string;
  suburb: string;
  postcode: string;
  state: string;
  role: UserRole;
  member?: Member;
}

export type UserRole = "MEMBER" | "VOLUNTEER" | "ADMIN";

// Loan types (extending existing Booking)
export interface Loan {
  id: string;
  userId: string;
  toolId: string;
  tool: {
    id: string;
    name: string;
    brand?: string;
    model?: string;
    imageUrl?: string;
    instructions?: string;
    safetyNotes?: string;
  };
  loanedAt: Date;
  dueDate: Date;
  returnedAt?: Date;
  status: LoanStatus;
  conditionOut: ToolCondition;
  conditionIn?: ToolCondition;
  notes?: string;
  lateFees?: number;
  damageFees?: number;
  checkedOutBy: string;
  checkedInBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type LoanStatus = "ACTIVE" | "RETURNED" | "OVERDUE";

// Reservation types
export interface Reservation {
  id: string;
  userId: string;
  toolId: string;
  tool: {
    id: string;
    name: string;
    brand?: string;
    model?: string;
    imageUrl?: string;
  };
  startDate: Date;
  endDate: Date;
  status: ReservationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

// Enhanced Payment types for dashboard
export interface PaymentRecord {
  id: string;
  userId: string;
  type: PaymentType;
  amount: number;
  gstAmount?: number;
  totalAmount: number;
  description: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard stats
export interface DashboardStats {
  activeLoans: number;
  overdueLoans: number;
  activeReservations: number;
  totalLoansThisMonth: number;
  outstandingFees: number;
  membershipExpiresIn?: number; // days
}

// Dashboard summary data
export interface DashboardData {
  user: UserProfile;
  stats: DashboardStats;
  recentLoans: Loan[];
  upcomingReservations: Reservation[];
  outstandingPayments: PaymentRecord[];
}

// API Response types for member dashboard
export interface LoansResponse {
  loans: Loan[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ReservationsResponse {
  reservations: Reservation[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaymentsResponse {
  payments: PaymentRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types for member actions
export interface ReservationForm {
  toolId: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface ProfileUpdateForm {
  firstName: string;
  lastName: string;
  phone?: string;
  address: string;
  suburb: string;
  postcode: string;
  state: string;
}

// Admin-specific types
export interface AdminDashboardStats {
  users: {
    total: number;
    activeMembers: number;
  };
  tools: {
    total: number;
    available: number;
    checkedOut: number;
  };
  loans: {
    active: number;
    overdue: number;
  };
  reservations: {
    pending: number;
  };
  revenue: {
    thisMonth: number;
  };
}

export interface AdminUser extends User {
  member?: {
    membershipNumber: string;
    tier: MembershipType;
    isActive: boolean;
    expiresAt: Date;
  };
  _count?: {
    loans: number;
    reservations: number;
  };
}

export interface AdminLoan extends Loan {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tool: {
    id: string;
    name: string;
    brand?: string;
    model?: string;
  };
}

export interface AdminReservation extends Reservation {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tool: {
    id: string;
    name: string;
    brand?: string;
    model?: string;
  };
}

export interface AdminPayment extends PaymentRecord {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Tool management forms
export interface ToolForm {
  name: string;
  description: string;
  brand?: string;
  model?: string;
  barcode?: string;
  serialNumber?: string;
  categoryId: string;
  condition: ToolCondition;
  status: ToolStatus;
  imageUrl?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  location?: string;
  membershipRequired?: MembershipType;
}

export interface CategoryForm {
  name: string;
  description?: string;
  parentId?: string;
}

// Member management forms
export interface MembershipApprovalForm {
  userId: string;
  approved: boolean;
  tier: MembershipType;
  notes?: string;
}

// Loan processing forms
export interface LoanCheckoutForm {
  userId: string;
  toolId: string;
  dueDate: string;
  conditionOut: ToolCondition;
  notes?: string;
}

export interface LoanCheckinForm {
  loanId: string;
  conditionIn: ToolCondition;
  notes?: string;
  damageFees?: number;
  lateFees?: number;
}

// System settings types
export interface SystemSettings {
  libraryName: string;
  address: Address;
  phone: string;
  email: string;
  loanPeriods: {
    basic: number; // days
    premium: number; // days
  };
  lateFees: {
    dailyRate: number;
    maxFee: number;
  };
  gstRate: number;
  reservationLimits: {
    basic: number;
    premium: number;
  };
  loanLimits: {
    basic: number;
    premium: number;
  };
}

// Report types
export interface RevenueReport {
  period: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  gstCollected: number;
  paymentBreakdown: {
    membership: number;
    lateFees: number;
    damageFees: number;
    replacementFees: number;
  };
  monthlyData?: Array<{
    month: string;
    revenue: number;
    gst: number;
  }>;
}

export interface UtilizationReport {
  period: {
    start: Date;
    end: Date;
  };
  topTools: Array<{
    tool: Tool;
    loanCount: number;
    revenue: number;
  }>;
  leastUsedTools: Array<{
    tool: Tool;
    loanCount: number;
    lastLoan?: Date;
  }>;
  categoryStats: Array<{
    category: ToolCategory;
    toolCount: number;
    loanCount: number;
    utilization: number;
  }>;
}

export interface MemberAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  newMembers: number;
  renewals: number;
  cancellations: number;
  retentionRate: number;
  membershipBreakdown: {
    basic: number;
    premium: number;
  };
  monthlyStats?: Array<{
    month: string;
    new: number;
    renewals: number;
    cancellations: number;
  }>;
}

// Table filter and sort types
export interface TableFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  [key: string]: any;
}

export interface TableSort {
  field: string;
  order: 'asc' | 'desc';
}

export interface BulkAction {
  action: string;
  selectedIds: string[];
  data?: any;
}