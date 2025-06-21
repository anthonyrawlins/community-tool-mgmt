'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MemberLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/member', icon: '📊' },
  { name: 'Current Loans', href: '/member/loans', icon: '📦' },
  { name: 'Reservations', href: '/member/reservations', icon: '📅' },
  { name: 'Payment History', href: '/member/payments', icon: '💳' },
  { name: 'Profile', href: '/member/profile', icon: '👤' },
];

export function MemberLayout({ children }: MemberLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Member Portal</h2>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}