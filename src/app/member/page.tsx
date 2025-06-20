import { MainLayout } from "@/components/layout/MainLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Portal",
  description: "Access your member dashboard, view current bookings, and manage your tool library account.",
};

export default function MemberPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Member Portal</h1>
          <p className="text-xl text-muted-foreground">
            Access your dashboard, manage bookings, and view your account information.
          </p>
        </div>

        {/* Login Required Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            Login Required
          </h2>
          <p className="text-blue-800 mb-4">
            Please log in to access your member dashboard and view your bookings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Log In to Your Account
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary bg-background rounded-md font-medium hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Don&apos;t have an account? Join Now
            </a>
          </div>
        </div>

        {/* Member Dashboard Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Current Bookings</h3>
            <p className="text-muted-foreground mb-4">
              View and manage your active tool reservations and due dates.
            </p>
            <div className="text-sm text-muted-foreground">
              Available after login
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Booking History</h3>
            <p className="text-muted-foreground mb-4">
              Review your past tool borrowing history and returns.
            </p>
            <div className="text-sm text-muted-foreground">
              Available after login
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
            <p className="text-muted-foreground mb-4">
              Update your profile information and membership preferences.
            </p>
            <div className="text-sm text-muted-foreground">
              Available after login
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Membership Status</h3>
            <p className="text-muted-foreground mb-4">
              Check your membership level, expiry date, and renewal options.
            </p>
            <div className="text-sm text-muted-foreground">
              Available after login
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Payment History</h3>
            <p className="text-muted-foreground mb-4">
              View your membership payments and any outstanding fees.
            </p>
            <div className="text-sm text-muted-foreground">
              Available after login
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <p className="text-muted-foreground mb-4">
              Reserve tools, extend bookings, and contact support.
            </p>
            <div className="text-sm text-muted-foreground">
              Available after login
            </div>
          </div>
        </div>

        {/* Help and Support */}
        <div className="mt-12 bg-muted/50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Contact Support</h3>
              <p className="text-muted-foreground mb-4">
                Our friendly team is here to help with any questions about your membership or bookings.
              </p>
              <a
                href="/contact"
                className="text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                Get Support →
              </a>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Frequently Asked Questions</h3>
              <p className="text-muted-foreground mb-4">
                Find answers to common questions about tool borrowing, membership, and policies.
              </p>
              <a
                href="/faq"
                className="text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                View FAQ →
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}