import { 
  ApiResponse, 
  Tool, 
  ToolCategory, 
  ToolsResponse, 
  ToolFilters,
  UserProfile,
  Loan,
  LoansResponse,
  Reservation,
  ReservationsResponse,
  PaymentsResponse,
  DashboardData,
  ReservationForm,
  AvailabilityResponse,
  ActivityItem,
  PaymentSessionResponse,
  MaintenanceRecord,
  PaginationInfo,
  ProfileUpdateForm,
  AdminDashboardStats,
  AdminUser,
  AdminLoan,
  AdminReservation,
  AdminPayment,
  ToolForm,
  CategoryForm,
  MembershipApprovalForm,
  LoanCheckoutForm,
  LoanCheckinForm,
  SystemSettings,
  RevenueReport,
  UtilizationReport,
  MemberAnalytics,
  TableFilters,
  TableSort,
  BulkAction
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class ApiClient {
  private static baseUrl = API_BASE_URL;

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get token from localStorage if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Network error');
    }

    return response.json();
  }

  // Tool-related API calls
  static async getTools(filters: ToolFilters = {}, page = 1, limit = 20): Promise<ApiResponse<ToolsResponse>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.status) params.append('status', filters.status);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.available !== undefined) params.append('available', filters.available.toString());
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/tools?${queryString}` : '/tools';
    
    return this.request<ApiResponse<ToolsResponse>>(endpoint);
  }

  static async getToolById(id: string): Promise<ApiResponse<{ tool: Tool }>> {
    return this.request<ApiResponse<{ tool: Tool }>>(`/tools/${id}`);
  }

  static async getCategories(): Promise<ApiResponse<{ categories: ToolCategory[] }>> {
    return this.request<ApiResponse<{ categories: ToolCategory[] }>>('/tools/categories');
  }

  static async checkToolAvailability(
    toolId: string, 
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<AvailabilityResponse>> {
    const params = new URLSearchParams({ startDate, endDate });
    return this.request<ApiResponse<AvailabilityResponse>>(`/tools/${toolId}/availability?${params}`);
  }

  // User Profile API calls
  static async getUserProfile(): Promise<ApiResponse<{ user: UserProfile }>> {
    return this.request<ApiResponse<{ user: UserProfile }>>('/users/profile');
  }

  static async updateUserProfile(data: ProfileUpdateForm): Promise<ApiResponse<{ user: UserProfile }>> {
    return this.request<ApiResponse<{ user: UserProfile }>>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Dashboard API calls
  static async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return this.request<ApiResponse<DashboardData>>('/member/dashboard');
  }

  // Loans API calls
  static async getLoans(page = 1, limit = 10): Promise<ApiResponse<LoansResponse>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/loans?${queryString}` : '/loans';
    
    return this.request<ApiResponse<LoansResponse>>(endpoint);
  }

  static async getLoanById(id: string): Promise<ApiResponse<{ loan: Loan }>> {
    return this.request<ApiResponse<{ loan: Loan }>>(`/loans/${id}`);
  }

  static async renewLoan(id: string): Promise<ApiResponse<{ loan: Loan }>> {
    return this.request<ApiResponse<{ loan: Loan }>>(`/loans/${id}/renew`, {
      method: 'PUT',
    });
  }

  // Reservations API calls
  static async getReservations(page = 1, limit = 10): Promise<ApiResponse<ReservationsResponse>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/reservations?${queryString}` : '/reservations';
    
    return this.request<ApiResponse<ReservationsResponse>>(endpoint);
  }

  static async createReservation(data: ReservationForm): Promise<ApiResponse<{ reservation: Reservation }>> {
    return this.request<ApiResponse<{ reservation: Reservation }>>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateReservation(id: string, data: Partial<ReservationForm>): Promise<ApiResponse<{ reservation: Reservation }>> {
    return this.request<ApiResponse<{ reservation: Reservation }>>(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async cancelReservation(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/reservations/${id}`, {
      method: 'DELETE',
    });
  }

  // Payments API calls
  static async getPayments(page = 1, limit = 10): Promise<ApiResponse<PaymentsResponse>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/payments?${queryString}` : '/payments';
    
    return this.request<ApiResponse<PaymentsResponse>>(endpoint);
  }

  static async createPaymentSession(amount: number, type: string, description: string): Promise<ApiResponse<PaymentSessionResponse>> {
    return this.request<ApiResponse<PaymentSessionResponse>>('/payments/create-session', {
      method: 'POST',
      body: JSON.stringify({ amount, type, description }),
    });
  }

  // Quick search for tools (for reservation form)
  static async searchTools(query: string, limit = 5): Promise<ApiResponse<{ tools: Tool[] }>> {
    const params = new URLSearchParams();
    params.append('search', query);
    params.append('limit', limit.toString());
    params.append('available', 'true');
    
    return this.request<ApiResponse<{ tools: Tool[] }>>(`/tools?${params}`);
  }

  // Admin Dashboard API calls
  static async getAdminDashboard(): Promise<ApiResponse<{ stats: AdminDashboardStats }>> {
    return this.request<ApiResponse<{ stats: AdminDashboardStats }>>('/admin/dashboard');
  }

  // Admin Activity Feed
  static async getAdminActivity(limit = 50, offset = 0): Promise<ApiResponse<{ activities: ActivityItem[] }>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return this.request<ApiResponse<{ activities: ActivityItem[] }>>(`/admin/activity?${params}`);
  }

  // Send overdue reminders
  static async sendOverdueReminders(): Promise<ApiResponse<{ count: number }>> {
    return this.request<ApiResponse<{ count: number }>>('/admin/reminders/overdue', {
      method: 'POST',
    });
  }

  // Admin User Management
  static async getAdminUsers(): Promise<ApiResponse<{ users: AdminUser[] }>> {
    return this.request<ApiResponse<{ users: AdminUser[] }>>('/admin/users');
  }

  static async updateUserRole(userId: string, role: string): Promise<ApiResponse<{ user: AdminUser }>> {
    return this.request<ApiResponse<{ user: AdminUser }>>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  static async suspendUser(userId: string, reason: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/users/${userId}/suspend`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  static async reactivateUser(userId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/users/${userId}/reactivate`, {
      method: 'PUT',
    });
  }

  // Admin Tool Management
  static async createTool(data: ToolForm): Promise<ApiResponse<{ tool: Tool }>> {
    return this.request<ApiResponse<{ tool: Tool }>>('/tools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateTool(id: string, data: Partial<ToolForm>): Promise<ApiResponse<{ tool: Tool }>> {
    return this.request<ApiResponse<{ tool: Tool }>>(`/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteTool(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/tools/${id}`, {
      method: 'DELETE',
    });
  }

  static async bulkUpdateTools(action: BulkAction): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>('/admin/tools/bulk', {
      method: 'PUT',
      body: JSON.stringify(action),
    });
  }

  // Advanced Tool Search and Filtering
  static async getToolsAdvanced(filters: ToolFilters = {}, sort?: TableSort, page = 1, limit = 20): Promise<ApiResponse<ToolsResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.order);
    }
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/tools?${queryString}` : '/tools';
    
    return this.request<ApiResponse<ToolsResponse>>(endpoint);
  }

  // Tool Maintenance Management
  static async getToolMaintenance(toolId: string): Promise<ApiResponse<{ records: MaintenanceRecord[] }>> {
    return this.request<ApiResponse<{ records: MaintenanceRecord[] }>>(`/tools/${toolId}/maintenance`);
  }

  static async addMaintenanceRecord(toolId: string, data: Partial<MaintenanceRecord>): Promise<ApiResponse<{ record: MaintenanceRecord }>> {
    return this.request<ApiResponse<{ record: MaintenanceRecord }>>(`/tools/${toolId}/maintenance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateMaintenanceRecord(toolId: string, recordId: string, data: Partial<MaintenanceRecord>): Promise<ApiResponse<{ record: MaintenanceRecord }>> {
    return this.request<ApiResponse<{ record: MaintenanceRecord }>>(`/tools/${toolId}/maintenance/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Tool Analytics and Reports
  static async getToolAnalytics(startDate?: string, endDate?: string): Promise<ApiResponse<{ success: boolean }>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/tools/analytics?${params}`);
  }

  static async getToolUtilization(period: string = '30d'): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/tools/utilization?period=${period}`);
  }

  // Admin Category Management
  static async createCategory(data: CategoryForm): Promise<ApiResponse<{ category: ToolCategory }>> {
    return this.request<ApiResponse<{ category: ToolCategory }>>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateCategory(id: string, data: Partial<CategoryForm>): Promise<ApiResponse<{ category: ToolCategory }>> {
    return this.request<ApiResponse<{ category: ToolCategory }>>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteCategory(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Loan Management
  static async getAdminLoans(filters?: TableFilters, sort?: TableSort, page = 1, limit = 20): Promise<ApiResponse<{ loans: AdminLoan[], pagination: PaginationInfo }>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.order);
    }
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/loans?${queryString}` : '/admin/loans';
    
    return this.request<ApiResponse<{ loans: AdminLoan[], pagination: PaginationInfo }>>(endpoint);
  }

  static async checkoutLoan(data: LoanCheckoutForm): Promise<ApiResponse<{ loan: AdminLoan }>> {
    return this.request<ApiResponse<{ loan: AdminLoan }>>('/admin/loans/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async checkinLoan(data: LoanCheckinForm): Promise<ApiResponse<{ loan: AdminLoan }>> {
    return this.request<ApiResponse<{ loan: AdminLoan }>>('/admin/loans/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async processOverdueLoans(): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>('/admin/loans/process-overdue', {
      method: 'POST',
    });
  }

  // Admin Reservation Management
  static async getAdminReservations(filters?: TableFilters, sort?: TableSort, page = 1, limit = 20): Promise<ApiResponse<{ reservations: AdminReservation[], pagination: PaginationInfo }>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.order);
    }
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/reservations?${queryString}` : '/admin/reservations';
    
    return this.request<ApiResponse<{ reservations: AdminReservation[], pagination: PaginationInfo }>>(endpoint);
  }

  static async approveReservation(id: string): Promise<ApiResponse<{ reservation: AdminReservation }>> {
    return this.request<ApiResponse<{ reservation: AdminReservation }>>(`/admin/reservations/${id}/approve`, {
      method: 'PUT',
    });
  }

  static async denyReservation(id: string, reason: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/reservations/${id}/deny`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Admin Payment Management
  static async getAdminPayments(filters?: TableFilters, sort?: TableSort, page = 1, limit = 20): Promise<ApiResponse<{ payments: AdminPayment[], pagination: PaginationInfo }>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.order);
    }
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/payments?${queryString}` : '/admin/payments';
    
    return this.request<ApiResponse<{ payments: AdminPayment[], pagination: PaginationInfo }>>(endpoint);
  }

  static async processRefund(paymentId: string, amount?: number): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Admin Membership Management
  static async getPendingMemberships(): Promise<ApiResponse<{ users: AdminUser[] }>> {
    return this.request<ApiResponse<{ users: AdminUser[] }>>('/admin/memberships/pending');
  }

  static async approveMembership(data: MembershipApprovalForm): Promise<ApiResponse<{ user: AdminUser }>> {
    return this.request<ApiResponse<{ user: AdminUser }>>('/admin/memberships/approve', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async renewMembership(userId: string, tier: string, period: number): Promise<ApiResponse<{ user: AdminUser }>> {
    return this.request<ApiResponse<{ user: AdminUser }>>(`/admin/memberships/${userId}/renew`, {
      method: 'PUT',
      body: JSON.stringify({ tier, period }),
    });
  }

  // Admin Reports
  static async getRevenueReport(startDate: string, endDate: string): Promise<ApiResponse<{ report: RevenueReport }>> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    
    return this.request<ApiResponse<{ report: RevenueReport }>>(`/admin/reports/revenue?${params}`);
  }

  static async getUtilizationReport(startDate: string, endDate: string): Promise<ApiResponse<{ report: UtilizationReport }>> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    
    return this.request<ApiResponse<{ report: UtilizationReport }>>(`/admin/reports/utilization?${params}`);
  }

  static async getMemberAnalytics(startDate: string, endDate: string): Promise<ApiResponse<{ report: MemberAnalytics }>> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    
    return this.request<ApiResponse<{ report: MemberAnalytics }>>(`/admin/reports/members?${params}`);
  }

  static async exportReport(type: string, format: string, startDate?: string, endDate?: string): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('type', type);
    params.append('format', format);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const url = `${this.baseUrl}/admin/reports/export?${params}`;
    
    const headers: Record<string, string> = {};

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }

  // Admin Settings
  static async getSystemSettings(): Promise<ApiResponse<{ settings: SystemSettings }>> {
    return this.request<ApiResponse<{ settings: SystemSettings }>>('/admin/settings');
  }

  static async updateSystemSettings(data: Partial<SystemSettings>): Promise<ApiResponse<{ settings: SystemSettings }>> {
    return this.request<ApiResponse<{ settings: SystemSettings }>>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // File Upload
  static async uploadFile(file: File, type: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const headers: Record<string, string> = {};

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}/admin/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  // Import/Export Tools
  static async importTools(file: File): Promise<ApiResponse<{ imported: number, errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}/admin/tools/import`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Import failed' }));
      throw new Error(error.message || 'Import failed');
    }

    return response.json();
  }

  static async exportTools(format: string = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    const url = `${this.baseUrl}/admin/tools/export?${params}`;
    
    const headers: Record<string, string> = {};

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }
}