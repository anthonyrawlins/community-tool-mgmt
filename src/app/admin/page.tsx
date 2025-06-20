import { MainLayout } from "@/components/layout/MainLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administrative dashboard for managing tool library operations, members, and bookings.",
};

export default function AdminPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Manage tool library operations, members, and bookings.
          </p>
        </div>

        {/* Admin Access Required */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            Administrator Access Required
          </h2>
          <p className="text-yellow-800 mb-4">
            This area is restricted to authorized administrators only. Please log in with your admin credentials.
          </p>
          <a
            href="/admin/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Admin Login
          </a>
        </div>

        {/* Admin Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Member Management</h3>
            <p className="text-muted-foreground mb-4">
              View, add, edit, and manage member accounts and membership status.
            </p>
            <div className="text-sm text-muted-foreground">
              Admin access required
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Tool Inventory</h3>
            <p className="text-muted-foreground mb-4">
              Add, edit, and manage tool catalog, availability, and maintenance schedules.
            </p>
            <div className="text-sm text-muted-foreground">
              Admin access required
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Booking Management</h3>
            <p className="text-muted-foreground mb-4">
              View, approve, modify, and track all tool bookings and returns.
            </p>
            <div className="text-sm text-muted-foreground">
              Admin access required
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Financial Reports</h3>
            <p className="text-muted-foreground mb-4">
              View membership payments, outstanding fees, and financial analytics.
            </p>
            <div className="text-sm text-muted-foreground">
              Admin access required
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">System Settings</h3>
            <p className="text-muted-foreground mb-4">
              Configure application settings, policies, and user permissions.
            </p>
            <div className="text-sm text-muted-foreground">
              Admin access required
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Analytics & Reports</h3>
            <p className="text-muted-foreground mb-4">
              View usage statistics, popular tools, and operational metrics.
            </p>
            <div className="text-sm text-muted-foreground">
              Admin access required
            </div>
          </div>
        </div>

        {/* Quick Stats Preview */}
        <div className="mt-12 bg-muted/50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">---</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">---</div>
              <div className="text-sm text-muted-foreground">Active Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">---</div>
              <div className="text-sm text-muted-foreground">Tools Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">---</div>
              <div className="text-sm text-muted-foreground">Overdue Returns</div>
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-4">
            Statistics will be displayed after admin authentication
          </p>
        </div>
      </div>
    </MainLayout>
  );
}