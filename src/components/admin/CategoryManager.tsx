'use client';

import React, { useState, useEffect } from 'react';
import { ToolCategory, CategoryForm } from '@/types';

interface CategoryManagerProps {
  categories: ToolCategory[];
  onCategoryCreate: (data: CategoryForm) => Promise<void>;
  onCategoryUpdate: (id: string, data: CategoryForm) => Promise<void>;
  onCategoryDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export function CategoryManager({
  categories,
  onCategoryCreate,
  onCategoryUpdate,
  onCategoryDelete,
  loading
}: CategoryManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ToolCategory | null>(null);
  const [formData, setFormData] = useState<CategoryForm>({
    name: '',
    description: '',
    parentId: ''
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);

  // Build hierarchical structure
  const buildCategoryTree = (categories: ToolCategory[]) => {
    const categoryMap = new Map<string, ToolCategory & { children: ToolCategory[] }>();
    const rootCategories: (ToolCategory & { children: ToolCategory[] })[] = [];

    // Initialize all categories with empty children arrays
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Build the tree structure
    categories.forEach(cat => {
      const categoryWithChildren = categoryMap.get(cat.id)!;
      if (cat.parent) {
        const parent = categoryMap.get(cat.parent.id);
        if (parent) {
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories.sort((a, b) => a.name.localeCompare(b.name));
  };

  const categoryTree = buildCategoryTree(categories);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await onCategoryUpdate(editingCategory.id, formData);
      } else {
        await onCategoryCreate(formData);
      }
      
      handleCancel();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleEdit = (category: ToolCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parent?.id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const hasChildren = categories.some(c => c.parent?.id === categoryId);
    const toolCount = category._count?.tools || 0;

    let confirmMessage = 'Are you sure you want to delete this category?';
    if (hasChildren) {
      confirmMessage += ' This will also delete all subcategories.';
    }
    if (toolCount > 0) {
      confirmMessage += ` This category contains ${toolCount} tool${toolCount > 1 ? 's' : ''}.`;
    }
    confirmMessage += ' This action cannot be undone.';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await onCategoryDelete(categoryId);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', parentId: '' });
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategory(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetCategoryId: string | null) => {
    e.preventDefault();
    
    if (!draggedCategory || draggedCategory === targetCategoryId) {
      setDraggedCategory(null);
      return;
    }

    const draggedCat = categories.find(c => c.id === draggedCategory);
    if (!draggedCat) return;

    // Prevent dropping a category into its own descendant
    const isDescendant = (categoryId: string, potentialAncestorId: string): boolean => {
      const category = categories.find(c => c.id === categoryId);
      if (!category || !category.parent) return false;
      if (category.parent.id === potentialAncestorId) return true;
      return isDescendant(category.parent.id, potentialAncestorId);
    };

    if (targetCategoryId && isDescendant(targetCategoryId, draggedCategory)) {
      alert('Cannot move a category into its own subcategory');
      setDraggedCategory(null);
      return;
    }

    try {
      await onCategoryUpdate(draggedCategory, {
        name: draggedCat.name,
        description: draggedCat.description || '',
        parentId: targetCategoryId || ''
      });
    } catch (error) {
      console.error('Failed to move category:', error);
    }

    setDraggedCategory(null);
  };

  const renderCategory = (category: ToolCategory & { children: ToolCategory[] }, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children.length > 0;
    const toolCount = category._count?.tools || 0;

    return (
      <div key={category.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div
          className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2 bg-white hover:bg-gray-50 transition-colors ${
            draggedCategory === category.id ? 'opacity-50' : ''
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, category.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, category.id)}
        >
          <div className="flex items-center flex-1">
            <div className="flex items-center space-x-2">
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{toolCount} tool{toolCount !== 1 ? 's' : ''}</span>
              {hasChildren && (
                <span>{category.children.length} subcategor{category.children.length !== 1 ? 'ies' : 'y'}</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(category)}
                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded transition-colors"
                title="Edit category"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button
                onClick={() => handleDelete(category.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete category"
                disabled={toolCount > 0 || hasChildren}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <div className="cursor-move p-2 text-gray-400 hover:text-gray-600" title="Drag to reorder">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4 space-y-2">
            {category.children
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(child => renderCategory({ ...child, children: [] }, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const parentCategoryOptions = categories
    .filter(cat => !cat.parent && (!editingCategory || cat.id !== editingCategory.id))
    .map(cat => ({ label: cat.name, value: cat.id }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Category Hierarchy</h2>
          <p className="text-sm text-gray-600">Organize categories with drag-and-drop reordering</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Drop zone for root level */}
      <div
        className="min-h-12 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 hover:border-gray-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
      >
        Drop here to make a root category
      </div>

      {/* Category Tree */}
      <div className="space-y-2">
        {categoryTree.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">No categories yet</p>
            <p className="text-gray-600 mb-4">Create your first category to organize your tools</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create First Category
            </button>
          </div>
        ) : (
          categoryTree.map(category => renderCategory(category))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Power Tools"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Optional description of this category"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Root Category</option>
                    {parentCategoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Leave blank to create a root category
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}