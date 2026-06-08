'use client';

import { useEffect, useState } from 'react';
import { listenOrders } from '@/controllers/orderController';
import { Loader2, Package, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Order {
    orderId: string;
    total: number;
    status: string;
    customerDetails: any;
    createdAt: any;
}

const ORDERS_PER_PAGE = 10;

function formatDate(timestamp: any) {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(date);
}

function getStatusStyle(status: string) {
    switch (status?.toLowerCase()) {
        case 'success':
        case 'settlement':
        case 'capture':
        case 'paid':
        case 'completed':
            return 'bg-emerald-100 text-emerald-700';
        case 'pending':
            return 'bg-amber-100 text-amber-700';
        case 'shipped':
            return 'bg-blue-100 text-blue-700';
        case 'deny':
        case 'cancel':
        case 'expire':
        case 'failure':
        case 'cancelled':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const unsubscribe = listenOrders((ordersData) => {
            setOrders(ordersData as Order[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredOrders = orders.filter(order =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerDetails?.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ORDERS_PER_PAGE,
        currentPage * ORDERS_PER_PAGE
    );

    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pesanan Masuk</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola semua pesanan pelanggan dari satu tempat.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Cari Order ID atau pelanggan..."
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Order ID</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tanggal</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Pelanggan</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Total</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        {searchQuery ? 'Pesanan tidak ditemukan.' : 'Belum ada pesanan masuk.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <tr key={order.orderId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-slate-400 shrink-0" />
                                                <span className="font-semibold text-slate-900">{order.orderId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">
                                                    {order.customerDetails?.first_name || 'Tanpa Nama'}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {order.customerDetails?.email || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            Rp {order.total?.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase ${getStatusStyle(order.status)}`}>
                                                {order.status === 'paid' ? 'Lunas' : order.status === 'pending' ? 'Menunggu' : order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Halaman {currentPage} dari {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${currentPage === pageNum ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:text-amber-500 hover:border-amber-500'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
