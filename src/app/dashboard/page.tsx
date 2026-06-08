'use client';

import {
    DollarSign,
    ShoppingBag,
    Users,
    ArrowRight,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { listenOrders, listenRecentOrders } from '@/controllers/orderController';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import RevenueChart from '@/components/dashboard/RevenueChart';

const PAID_STATUSES = ['success', 'settlement', 'capture', 'completed', 'paid'];

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

const currencyFormat = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
});

function formatCurrency(amount: number) {
    return currencyFormat.format(amount);
}

function formatDate(timestamp: any) {
    if (!timestamp) return '-';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusColor(status: string) {
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
}

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        activeUsers: 0
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        const unsubscribeOrders = listenOrders((ordersData) => {
            let revenue = 0;
            const ordersList = ordersData as Order[];

            ordersList.forEach(order => {
                if (PAID_STATUSES.includes(order.status?.toLowerCase())) {
                    revenue += order.total || 0;
                }
            });

            setStats(prev => ({
                ...prev,
                totalRevenue: revenue,
                totalOrders: ordersList.length
            }));
            setAllOrders(ordersList);
        });

        const unsubscribeRecent = listenRecentOrders(5, (recent) => {
            setRecentOrders(recent as Order[]);
            setLoading(false);
        });

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

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 w-fit mb-4">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Total Pendapatan</p>
                    {loading ? (
                        <Skeleton className="h-8 w-32 mt-1" />
                    ) : (
                        <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
                            {formatCurrency(stats.totalRevenue)}
                        </h3>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600 w-fit mb-4">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Total Pesanan</p>
                    {loading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                        <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
                            {stats.totalOrders}
                        </h3>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600 w-fit mb-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Pengguna Terdaftar</p>
                    {loading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                        <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
                            {stats.activeUsers}
                        </h3>
                    )}
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Grafik Pendapatan</h3>
                    <span className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">
                        6 Bulan Terakhir
                    </span>
                </div>
                <div className="p-6">
                    <RevenueChart orders={allOrders} />
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Pesanan Terbaru</h3>
                    <Link href="/dashboard/orders" className="text-amber-600 text-sm font-bold hover:text-amber-700 flex items-center gap-1 group transition-colors">
                        Lihat Semua <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Order ID</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Pelanggan</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tanggal</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Total</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
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
                                        Belum ada pesanan.
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
                                                    {order.customerDetails?.first_name || 'Guest'}
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
                                            <Link href="/dashboard/orders" className="text-slate-400 hover:text-amber-600 text-sm font-bold transition-colors">
                                                Detail
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
