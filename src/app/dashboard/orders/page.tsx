'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';

// Mendefinisikan tipe data agar typescript tidak error
interface Order {
    orderId: string;
    total: number;
    status: string;
    customerDetails: any;
    createdAt: any;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // INILAH KUNCINYA: onSnapshot akan memantau Firestore secara real-time
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Order)
            }));
            setOrders(ordersData);
            setLoading(false);
        });

        // Membersihkan listener ketika admin pindah halaman
        return () => unsubscribe();
    }, []);

    // Fungsi untuk merubah status manual melalui Dropdown Select
    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: newStatus });
            toast.success(`Status pesanan ${orderId} berhasil diperbarui`);
        } catch (error) {
            console.error("Gagal update status manual:", error);
            toast.error("Gagal memperbarui status pesanan");
        }
    };

    // Fungsi format tanggal agar rapi
    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-2 md:p-0">
            {/* Header Sesuai UI Anda */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pesanan Masuk</h1>
                <p className="text-sm text-slate-500 mt-1">Kelola semua pesanan pelanggan dari satu tempat.</p>
            </div>

            {/* Container Tabel Sesuai UI Anda */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
                                <th className="px-6 py-4 whitespace-nowrap">Tanggal</th>
                                <th className="px-6 py-4 whitespace-nowrap">Pelanggan</th>
                                <th className="px-6 py-4 whitespace-nowrap">Total</th>
                                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 whitespace-nowrap">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Belum ada pesanan masuk.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.orderId} className="hover:bg-slate-50 transition-colors">
                                        {/* Kolom Order ID */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-slate-400" />
                                                <span className="font-semibold text-slate-900">{order.orderId}</span>
                                            </div>
                                        </td>
                                        
                                        {/* Kolom Tanggal */}
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            {formatDate(order.createdAt)}
                                        </td>

                                        {/* Kolom Pelanggan (Nama & Email) */}
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

                                        {/* Kolom Total */}
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            Rp {order.total?.toLocaleString('id-ID')}
                                        </td>

                                        {/* Kolom Status (Menggunakan komponen Badge Anda) */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge 
                                                variant={order.status === 'paid' ? 'default' : order.status === 'pending' ? 'secondary' : 'outline'}
                                                className={`
                                                    ${order.status === 'paid' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none' : ''}
                                                    ${order.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-none' : ''}
                                                `}
                                            >
                                                {order.status === 'paid' ? 'Paid' : order.status === 'pending' ? 'Pending' : order.status}
                                            </Badge>
                                        </td>

                                        {/* Kolom Aksi (Menggunakan komponen Select shadcn Anda) */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Select 
                                                defaultValue={order.status} 
                                                onValueChange={(value) => handleUpdateStatus(order.orderId, value)}
                                            >
                                                <SelectTrigger className="w-[130px] h-8 text-xs font-medium">
                                                    <SelectValue placeholder="Ubah Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="paid">Paid</SelectItem>
                                                    <SelectItem value="shipped">Shipped</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
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