'use client';

import AdminGuard from '@/components/auth/AdminGuard';

// Layout ini akan membungkus semua halaman di dalam folder /dashboard
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Terapkan AdminGuard di sini
    <AdminGuard>
      {/* Semua halaman anak (seperti /dashboard/products) 
        akan dirender di dalam {children} ini HANYA jika 
        pengguna adalah seorang admin.
      */}
      {children}
    </AdminGuard>
  );
}