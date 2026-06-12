'use client';

import {
    DollarSign,
    ShoppingBag,
    Users,
    Package,
    ArrowRight,
    ArrowUpRight,
    ArrowDownRight,
    User,
    AlertTriangle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { listenOrders, listenRecentOrders } from '@/controllers/orderController';
import { listenProducts, Product } from '@/controllers/productController';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import RevenueChart from '@/components/dashboard/RevenueChart';

const PAID_STATUSES = ['success', 'settlement', 'capture', 'completed', 'paid'];
const FAILED_STATUSES = ['deny', 'cancel', 'expire', 'failure', 'cancelled', 'denied', 'expired', 'failed'];

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
    minimumFractionDigits: 0,
});

function formatCurrency(amount: number) {
    return currencyFormat.format(amount);
}

function formatDate(timestamp: any) {
    if (!timestamp) return '-';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
}

function getStatusColor(status: string) {
    const s = status?.toLowerCase();
    if (PAID_STATUSES.includes(s)) return 'bg-emerald-100 text-emerald-700';
    if (s === 'pending') return 'bg-amber-100 text-amber-700';
    if (FAILED_STATUSES.includes(s)) return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700';
}

// Persentase perubahan bulan ini vs bulan lalu.
function pctChange(current: number, previous: number): number | null {
    if (previous === 0) return current === 0 ? 0 : null; // null = "baru" (tak ada pembanding)
    return ((current - previous) / previous) * 100;
}

interface KpiCardProps {
    icon: React.ReactNode;
    iconClass: string;
    label: string;
    value: string;
    delta?: number | null;
    sub?: React.ReactNode;
    loading: boolean;
}

function KpiCard({ icon, iconClass, label, value, delta, sub, loading }: KpiCardProps) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl w-fit ${iconClass}`}>{icon}</div>
                {delta !== undefined && !loading && (
                    delta === null ? (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Baru</span>
                    ) : (
                        <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full ${delta >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                            {delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(delta).toFixed(0)}%
                        </span>
                    )
                )}
            </div>
            <p className="text-slate-500 text-sm font-medium mt-4">{label}</p>
            {loading ? (
                <Skeleton className="h-8 w-28 mt-1" />
            ) : (
                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
            )}
            {sub && !loading && <div className="mt-2 text-xs text-slate-400 font-medium">{sub}</div>}
        </div>
    );
}

export default function DashboardPage() {
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [usersCount, setUsersCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeOrders = listenOrders((ordersData) => {
            setAllOrders(ordersData as Order[]);
        });

        const unsubscribeRecent = listenRecentOrders(5, (recent) => {
            setRecentOrders(recent as Order[]);
            setLoading(false);
        });

        const unsubscribeProducts = listenProducts((data) => setProducts(data));

        const usersQuery = query(collection(db, 'users'));
        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => setUsersCount(snapshot.size));

        return () => {
            unsubscribeOrders();
            unsubscribeRecent();
            unsubscribeProducts();
            unsubscribeUsers();
        };
    }, []);

    // Hitung metrik & tren dari data asli.
    const metrics = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        let totalRevenue = 0;
        let revThisMonth = 0;
        let revLastMonth = 0;
        let ordThisMonth = 0;
        let ordLastMonth = 0;
        const statusCount = { paid: 0, pending: 0, failed: 0 };

        for (const order of allOrders) {
            const s = order.status?.toLowerCase();
            const isPaid = PAID_STATUSES.includes(s);
            const date = toDate(order.createdAt);
            const inThisMonth = date && date.getMonth() === thisMonth && date.getFullYear() === thisYear;
            const inLastMonth = date && date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;

            if (isPaid) {
                totalRevenue += order.total || 0;
                if (inThisMonth) revThisMonth += order.total || 0;
                if (inLastMonth) revLastMonth += order.total || 0;
            }
            if (inThisMonth) ordThisMonth++;
            if (inLastMonth) ordLastMonth++;

            if (isPaid) statusCount.paid++;
            else if (s === 'pending') statusCount.pending++;
            else if (FAILED_STATUSES.includes(s)) statusCount.failed++;
        }

        const lowStock = products.filter((p) => (p.stock ?? 0) < 5);
        const pendingCount = statusCount.pending;
        const statusTotal = statusCount.paid + statusCount.pending + statusCount.failed || 1;

        return {
            totalRevenue,
            totalOrders: allOrders.length,
            totalProducts: products.length,
            usersCount,
            revenueDelta: pctChange(revThisMonth, revLastMonth),
            ordersDelta: pctChange(ordThisMonth, ordLastMonth),
            statusCount,
            statusTotal,
            lowStock,
            pendingCount,
        };
    }, [allOrders, products, usersCount]);

    const statusBars = [
        { label: 'Lunas', value: metrics.statusCount.paid, color: 'bg-emerald-500', text: 'text-emerald-700' },
        { label: 'Menunggu', value: metrics.statusCount.pending, color: 'bg-amber-500', text: 'text-amber-700' },
        { label: 'Gagal / Batal', value: metrics.statusCount.failed, color: 'bg-red-500', text: 'text-red-600' },
    ];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                <KpiCard
                    loading={loading}
                    icon={<DollarSign className="w-5 h-5" />}
                    iconClass="bg-emerald-50 text-emerald-600"
                    label="Total Pendapatan"
                    value={formatCurrency(metrics.totalRevenue)}
                    delta={metrics.revenueDelta}
                    sub="vs bulan lalu"
                />
                <KpiCard
                    loading={loading}
                    icon={<ShoppingBag className="w-5 h-5" />}
                    iconClass="bg-blue-50 text-blue-600"
                    label="Total Pesanan"
                    value={String(metrics.totalOrders)}
                    delta={metrics.ordersDelta}
                    sub="vs bulan lalu"
                />
                <KpiCard
                    loading={loading}
                    icon={<Package className="w-5 h-5" />}
                    iconClass="bg-amber-50 text-amber-600"
                    label="Produk"
                    value={String(metrics.totalProducts)}
                    sub={
                        metrics.lowStock.length > 0 ? (
                            <span className="text-amber-600 font-semibold">{metrics.lowStock.length} stok menipis</span>
                        ) : (
                            'Stok aman'
                        )
                    }
                />
                <KpiCard
                    loading={loading}
                    icon={<Users className="w-5 h-5" />}
                    iconClass="bg-purple-50 text-purple-600"
                    label="Pelanggan"
                    value={String(metrics.usersCount)}
                    sub="Total terdaftar"
                />
            </div>

            {/* Chart + Status breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Status Pesanan</h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Distribusi seluruh pesanan</p>
                    </div>
                    <div className="p-6 space-y-5">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                        ) : (
                            statusBars.map((bar) => {
                                const pct = Math.round((bar.value / metrics.statusTotal) * 100);
                                return (
                                    <div key={bar.label}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-sm font-semibold text-slate-600">{bar.label}</span>
                                            <span className={`text-sm font-bold ${bar.text}`}>{bar.value}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders + Low stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
                                    <th className="px-6 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest">Order ID</th>
                                    <th className="px-6 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest">Pelanggan</th>
                                    <th className="px-6 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest hidden sm:table-cell">Tanggal</th>
                                    <th className="px-6 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest">Total</th>
                                    <th className="px-6 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                            <td className="px-6 py-4"><div className="flex gap-2"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-28" /></div></td>
                                            <td className="px-6 py-4 hidden sm:table-cell"><Skeleton className="h-4 w-24" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded" /></td>
                                        </tr>
                                    ))
                                ) : recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-slate-500 text-sm font-medium">
                                            Belum ada pesanan.
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
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
                                            <td className="px-6 py-4 text-sm text-slate-500 font-medium hidden sm:table-cell">
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
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Widget */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> Stok Menipis
                        </h3>
                        <Link href="/dashboard/products" className="text-amber-600 text-sm font-bold hover:text-amber-700 transition-colors">
                            Kelola
                        </Link>
                    </div>
                    <div className="p-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full mb-2" />)
                        ) : metrics.lowStock.length === 0 ? (
                            <div className="py-10 text-center text-sm text-slate-400 font-medium">
                                Semua stok aman 👍
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {metrics.lowStock.slice(0, 6).map((p) => (
                                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 bg-cover bg-center shrink-0 border border-slate-100" style={{ backgroundImage: `url('${p.image || '/placeholder.jpg'}')` }} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                                            <p className="text-xs text-slate-400">{p.category || 'Produk'}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${(p.stock ?? 0) === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {(p.stock ?? 0) === 0 ? 'Habis' : `Sisa ${p.stock}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
