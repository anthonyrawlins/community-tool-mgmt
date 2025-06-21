'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface AdminPageLayoutProps {
  children: React.ReactNode;
}

export default function AdminPageLayout({ children }: AdminPageLayoutProps) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}