'use client';

import { useState } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { SearchFilters } from "@/components/catalog/SearchFilters";
import { ToolCard } from "@/components/catalog/ToolCard";
import { ToolGridSkeleton } from "@/components/catalog/ToolCardSkeleton";
import { ToolDetailModal } from "@/components/catalog/ToolDetailModal";
import { useCatalog } from "@/hooks/useCatalog";

export default function CatalogPage() {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [modalOriginElement, setModalOriginElement] = useState<HTMLElement | null>(null);
  const {
    tools,
    categories,
    loading,
    loadingMore,
    error,
    hasMore,
    filters,
    updateFilters,
    clearFilters,
    loadMoreRef,
    pagination
  } = useCatalog();

  const handleOpenDetail = (toolId: string, originElement: HTMLElement) => {
    setSelectedToolId(toolId);
    setModalOriginElement(originElement);
  };

  const handleCloseDetail = () => {
    setSelectedToolId(null);
    setModalOriginElement(null);
  };

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-12">
              <h3 className="text-2xl font-semibold mb-4 text-red-800">Error Loading Tools</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Tool Catalog</h1>
          <p className="text-xl text-gray-600">
            Browse our extensive collection of tools available for borrowing.
          </p>
          {pagination.total > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing {tools.length} of {pagination.total} tools
            </p>
          )}
        </div>

        {/* Search and Filters */}
        <SearchFilters
          categories={categories}
          filters={filters}
          onFiltersChange={updateFilters}
          onClear={clearFilters}
        />

        {/* Loading State */}
        {loading && <ToolGridSkeleton count={12} />}

        {/* No Results */}
        {!loading && tools.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-50 rounded-lg p-12">
              <h3 className="text-2xl font-semibold mb-4">No Tools Found</h3>
              <p className="text-gray-600 mb-6">
                {Object.values(filters).some(Boolean)
                  ? "Try adjusting your search criteria or filters."
                  : "We're currently setting up our tool inventory system."}
              </p>
              {Object.values(filters).some(Boolean) && (
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tools Grid */}
        {!loading && tools.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onOpenDetail={handleOpenDetail} />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {loadingMore && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading more tools...</span>
                </div>
              )}
              {!hasMore && tools.length > 0 && (
                <p className="text-gray-500">You've reached the end of our catalog!</p>
              )}
            </div>
          </>
        )}

        {/* Tool Detail Modal */}
        {selectedToolId && (
          <ToolDetailModal
            toolId={selectedToolId}
            isOpen={!!selectedToolId}
            onClose={handleCloseDetail}
            originElement={modalOriginElement}
          />
        )}
      </div>
    </MainLayout>
  );
}