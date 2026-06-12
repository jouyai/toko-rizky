'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/lib/AuthContext';
import { logoutUser } from '@/controllers/authController';
import { listenOrders } from '@/controllers/orderController';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Bell,
  ShoppingBag,
  Menu,
  Home,
  User
} from 'lucide-react';
import AdminGuard from '@/components/auth/AdminGuard';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
];

const pageTitle: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/products': 'Products',
  '/dashboard/orders': 'Orders',
  '/dashboard/profile': 'Profile',
  '/dashboard/settings': 'Settings',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const { user, userProfile } = useAuth();

  const roleLabel = userProfile?.role === 'admin' ? 'Administrator' : (userProfile?.role || 'Admin');

  useEffect(() => {
    const unsubscribe = listenOrders((orders) => {
      const pending = orders.filter((o: any) => o.status?.toLowerCase() === 'pending').length;
      setPendingCount(pending);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = '/';
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Sidebar Navigation */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center gap-3 px-2 py-4 mb-6">
              <div className="bg-amber-500 flex items-center justify-center rounded-lg w-10 h-10 text-white shadow-lg shadow-amber-500/20">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-slate-900 text-base font-bold leading-none">Toko Rizky</h1>
                <p className="text-slate-500 text-xs mt-1 font-medium">Admin Panel</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                      ? 'bg-amber-50 text-amber-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
              <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <Settings className="w-5 h-5 text-slate-400" />
                <span className="text-sm">Settings</span>
              </Link>

              {/* Back to Homepage Button */}
              <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                <Home className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium">Kembali ke Homepage</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-200">
          {/* Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-900">{pageTitle[pathname] || 'Dashboard'}</h2>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/orders"
                  title={pendingCount > 0 ? `${pendingCount} pesanan menunggu` : 'Tidak ada pesanan menunggu'}
                  className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors relative inline-flex"
                >
                  <Bell className="w-5 h-5" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* User Profile Dropdown */}
              <div className="pl-4 border-l border-slate-200">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-3 outline-none">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-slate-900 leading-none">
                        {userProfile?.name || user?.email?.split('@')[0] || 'Admin'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{roleLabel}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden relative">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                          {user?.email?.charAt(0).toUpperCase() || 'A'}
                        </div>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-100 shadow-xl rounded-2xl p-2">
                    <DropdownMenuLabel className="font-bold text-slate-900 px-3 py-2">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-100 my-1" />

                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="flex items-center w-full focus:bg-slate-50 focus:text-amber-600 font-medium text-slate-600 rounded-lg cursor-pointer px-3 py-2">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center w-full focus:bg-slate-50 focus:text-amber-600 font-medium text-slate-600 rounded-lg cursor-pointer px-3 py-2">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-slate-100 my-1" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-600 focus:bg-red-50 font-medium rounded-lg cursor-pointer px-3 py-2">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}