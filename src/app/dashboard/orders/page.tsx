'use client';

import { useEffect, useState } from 'react';
import { listenOrders } from '@/controllers/orderController';
import { Loader2, Package, Search, ChevronLeft, ChevronRight, X, User, MapPin, Phone, Mail, Truck, Receipt } from 'lucide-react';

interface OrderItem {
    id?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface Order {
    id?: string;
    orderId: string;
    total: number;
    status: string;
    customerDetails: any;
    items?: OrderItem[];
    shippingMethod?: string;
    shippingCost?: number;
    createdAt: any;
}

const ORDERS_PER_PAGE = 10;

const SHIPPING_LABELS: Record<string, string> = {
    regular: 'Regular',
    express: 'Express',
    sameday: 'Same Day',
};

function formatDate(timestamp: any) {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(date);
}

function getStatusLabel(status: string) {
    switch (status?.toLowerCase()) {
        case 'paid': return 'Lunas';
        case 'pending': return 'Menunggu';
        case 'shipped': return 'Dikirim';
        case 'completed': return 'Selesai';
        case 'cancelled': return 'Dibatalkan';
        case 'denied': return 'Ditolak';
        case 'expired': return 'Kadaluarsa';
        case 'failed': return 'Gagal';
        default: return status || '-';
    }
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
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
                                    <tr
                                        key={order.orderId}
                                        onClick={() => setSelectedOrder(order)}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
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
                                                {getStatusLabel(order.status)}
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

            {selectedOrder && (
                <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
    const items = order.items || [];
    const itemsSubtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    const shipping = order.customerDetails?.shipping_address;
    // Pajak tidak disimpan terpisah; turunkan dari selisih total agar rincian konsisten.
    const tax = Math.max(0, (order.total || 0) - itemsSubtotal - (order.shippingCost || 0));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200">
                    <div>
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-bold text-slate-900">{order.orderId}</h2>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase ${getStatusStyle(order.status)}`}>
                            {getStatusLabel(order.status)}
                        </span>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                            aria-label="Tutup"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-6 py-5 space-y-6">
                    {/* Customer */}
                    <section>
                        <h3 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                            <User className="w-4 h-4" /> Pelanggan
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-slate-700">
                                <User className="w-4 h-4 text-slate-400 shrink-0" />
                                {order.customerDetails?.first_name || 'Tanpa Nama'}
                            </div>
                            <div className="flex items-center gap-2 text-slate-700">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                {order.customerDetails?.email || '-'}
                            </div>
                            <div className="flex items-center gap-2 text-slate-700">
                                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                {order.customerDetails?.phone || '-'}
                            </div>
                        </div>
                    </section>

                    {/* Shipping address */}
                    {shipping && (
                        <section>
                            <h3 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                                <MapPin className="w-4 h-4" /> Alamat Pengiriman
                            </h3>
                            <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-4">
                                <p className="font-medium text-slate-900">{shipping.first_name}</p>
                                <p>{shipping.phone}</p>
                                <p>{shipping.address}</p>
                                <p>{[shipping.city, shipping.postal_code].filter(Boolean).join(', ')}</p>
                                {order.shippingMethod && (
                                    <p className="flex items-center gap-1.5 mt-2 text-slate-500">
                                        <Truck className="w-4 h-4" />
                                        {SHIPPING_LABELS[order.shippingMethod] || order.shippingMethod}
                                    </p>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Items */}
                    <section>
                        <h3 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                            <Receipt className="w-4 h-4" /> Item Pesanan
                        </h3>
                        {items.length === 0 ? (
                            <p className="text-sm text-slate-500">Tidak ada detail item.</p>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, idx) => (
                                    <div key={item.id || idx} className="flex items-center gap-3">
                                        {item.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                <Package className="w-5 h-5 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {item.quantity} × Rp {item.price?.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                                            Rp {((item.price || 0) * (item.quantity || 0)).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Totals */}
                    <section className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span>Rp {itemsSubtotal.toLocaleString('id-ID')}</span>
                        </div>
                        {typeof order.shippingCost === 'number' && (
                            <div className="flex justify-between text-slate-600">
                                <span>Ongkos Kirim</span>
                                <span>Rp {order.shippingCost.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        {tax > 0 && (
                            <div className="flex justify-between text-slate-600">
                                <span>Pajak (11%)</span>
                                <span>Rp {tax.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                            <span>Total</span>
                            <span>Rp {order.total?.toLocaleString('id-ID')}</span>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
