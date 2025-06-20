import { MainLayout } from "@/components/layout/MainLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tool Catalog",
  description: "Browse our extensive collection of tools available for borrowing. Find hand tools, power tools, garden equipment and more.",
};

export default function CatalogPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Tool Catalog</h1>
          <p className="text-xl text-muted-foreground">
            Browse our extensive collection of tools available for borrowing.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Find the Right Tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Search Tools
              </label>
              <input
                type="text"
                id="search"
                name="search"
                placeholder="Enter tool name or keyword..."
                className="w-full px-4 py-3 border border-border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-4 py-3 border border-border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="hand-tools">Hand Tools</option>
                <option value="power-tools">Power Tools</option>
                <option value="garden-tools">Garden Tools</option>
                <option value="measuring-tools">Measuring Tools</option>
                <option value="cleaning-equipment">Cleaning Equipment</option>
                <option value="automotive">Automotive</option>
                <option value="electronics">Electronics</option>
                <option value="safety-equipment">Safety Equipment</option>
              </select>
            </div>
            <div>
              <label htmlFor="availability" className="block text-sm font-medium mb-2">
                Availability
              </label>
              <select
                id="availability"
                name="availability"
                className="w-full px-4 py-3 border border-border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">All Tools</option>
                <option value="available">Available Now</option>
                <option value="premium">Premium Members Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tools Grid Placeholder */}
        <div className="text-center py-16">
          <div className="bg-muted/30 rounded-lg p-12">
            <h3 className="text-2xl font-semibold mb-4">Tool Catalog Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              We&apos;re currently setting up our tool inventory system. This page will display 
              our complete catalog of available tools with search and filtering capabilities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div className="bg-background border border-border rounded-lg p-6">
                <h4 className="font-semibold mb-2">Hand Tools</h4>
                <p className="text-sm text-muted-foreground">
                  Hammers, screwdrivers, wrenches, pliers, and more essential hand tools.
                </p>
              </div>
              <div className="bg-background border border-border rounded-lg p-6">
                <h4 className="font-semibold mb-2">Power Tools</h4>
                <p className="text-sm text-muted-foreground">
                  Drills, saws, sanders, grinders, and other electric tools.
                </p>
              </div>
              <div className="bg-background border border-border rounded-lg p-6">
                <h4 className="font-semibold mb-2">Garden Tools</h4>
                <p className="text-sm text-muted-foreground">
                  Lawnmowers, trimmers, pruning tools, and garden equipment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}