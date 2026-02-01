'use client';

import {
    DollarSign,
    TrendingUp,
    ShoppingBag,
    Users,
    ArrowRight,
    Loader2,
    Calendar,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import RevenueChart from '@/components/dashboard/RevenueChart';

interface Order {
    id: string;
    orderId: string;
    total: number;
    status: string;
    createdAt: any;
    customerDetails: {
        first_name: string;
        email: string;
    };
    items: any[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        activeUsers: 0
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [allOrders, setAllOrders] = useState<Order[]>([]); // New state for chart data
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // 1. Listen for Orders (Total Revenue, Total Orders Count, and Chart Data)
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc')); // Ordered for logic if needed
        const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
            let revenue = 0;
            const ordersData: Order[] = [];

            snapshot.forEach(doc => {
                const data = doc.data() as Order;
                ordersData.push({ id: doc.id, ...data });

                // Calculate Revenue (only for successful/paid orders)
                if (['success', 'settlement', 'capture', 'completed'].includes(data.status?.toLowerCase())) {
                    revenue += data.total || 0;
                }
            });

            setStats(prev => ({
                ...prev,
                totalRevenue: revenue,
                totalOrders: snapshot.size
            }));
            setAllOrders(ordersData); // Update chart data
        });

        // 2. Listen for Recent Orders (Limit 5)
        const recentOrdersQuery = query(
            collection(db, 'orders'),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        const unsubscribeRecent = onSnapshot(recentOrdersQuery, (snapshot) => {
            const recent = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setRecentOrders(recent);
            setLoading(false); // Data is ready
        });

        // 3. Listen for Users Count
        const usersQuery = query(collection(db, 'users'));
        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            setStats(prev => ({
                ...prev,
                activeUsers: snapshot.size
            }));
        });

        return () => {
            unsubscribeOrders();
            unsubscribeRecent();
            unsubscribeUsers();
        };
    }, []);

    // Helper for currency format
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Helper for date format
    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        // Handle Firebase Timestamp
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Helper for status badge color
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'success':
            case 'settlement':
            case 'capture':
            case 'completed':
                return 'bg-emerald-100 text-emerald-700';
            case 'pending':
                return 'bg-amber-100 text-amber-700';
            case 'deny':
            case 'cancel':
            case 'expire':
            case 'failure':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-8">
            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Live
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Total Sales</p>
                    {loading ? (
                        <Skeleton className="h-8 w-32 mt-1" />
                    ) : (
                        <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
                            {formatCurrency(stats.totalRevenue)}
                        </h3>
                    )}
                    <p className="text-slate-400 text-xs mt-2 font-medium">Accumulated revenue</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Live
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                    {loading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                        <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
                            {stats.totalOrders}
                        </h3>
                    )}
                    <p className="text-slate-400 text-xs mt-2 font-medium">All time orders</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Live
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Registered Users</p>
                    {loading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                        <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
                            {stats.activeUsers}
                        </h3>
                    )}
                    <p className="text-slate-400 text-xs mt-2 font-medium">Total registered accounts</p>
                </div>
            </div>

            {/* Main Chart Section - Now Dynamic */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
                    <div className="flex gap-2">
                        <span className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">
                            Last 6 Months
                        </span>
                    </div>
                </div>
                <div className="p-6">
                    {/* Pass real orders data to chart */}
                    <RevenueChart orders={allOrders} />
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
                    <Link href="/dashboard/orders">
                        <button className="text-amber-600 text-sm font-bold hover:text-amber-700 flex items-center gap-1 group transition-colors">
                            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Order ID</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                // Loading Skeleton Rows
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><div className="flex gap-2"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-32" /></div></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                                    </tr>
                                ))
                            ) : recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm font-medium">
                                        No recent orders found.
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">#{order.orderId || order.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                                                    {order.customerDetails?.first_name?.slice(0, 2) || <User className="w-4 h-4" />}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">
                                                    {order.customerDetails?.first_name || 'Guest User'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-900">
                                            {formatCurrency(order.total || 0)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(order.status)} uppercase`}>
                                                {order.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href="/dashboard/orders">
                                                <button className="text-slate-400 hover:text-amber-600 text-sm font-bold transition-colors">
                                                    Details
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
