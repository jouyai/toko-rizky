'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import AdminGuard from '@/components/auth/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, User, Calendar } from 'lucide-react';

interface Order {
  id: string;
  orderId: string;
  total: number;
  status: string;
  createdAt: any;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  customerDetails: {
    first_name: string;
    email: string;
    phone: string;
    shipping_address: {
        address: string;
    };
    billing_address?: {
        address: string;
    };
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Ambil semua order, urutkan dari yang terbaru
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];

        setOrders(ordersData);
      } catch (error) {
        console.error("Gagal mengambil data pesanan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Rekap Pesanan Masuk</h1>
        
        <div className="grid gap-6">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500">Belum ada pesanan masuk.</p>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="overflow-hidden border-l-4 border-l-indigo-500 shadow-md">
                <CardHeader className="bg-gray-50/50 pb-4 border-b">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle className="text-lg font-mono text-indigo-700 flex items-center gap-2">
                         #{order.orderId}
                      </CardTitle>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {order.createdAt?.seconds 
                            ? new Date(order.createdAt.seconds * 1000).toLocaleString('id-ID')
                            : 'Tanggal tidak tersedia'}
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      order.status === 'success' || order.status === 'settlement' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : order.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-6 grid md:grid-cols-2 gap-8">
                  
                  {/* BAGIAN 1: SIAPA YANG BELI (Customer Info) */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" /> Data Pembeli
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Nama:</span>
                            <span className="font-medium text-gray-900">{order.customerDetails?.first_name || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Email:</span>
                            <span className="font-medium text-gray-900">{order.customerDetails?.email || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">No. HP:</span>
                            <span className="font-medium text-gray-900">{order.customerDetails?.phone || '-'}</span>
                        </div>
                        <div className="pt-1">
                            <span className="block text-gray-500 mb-1">Alamat Pengiriman:</span>
                            <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded">
                                {order.customerDetails?.shipping_address?.address || order.customerDetails?.billing_address?.address || '-'}
                            </p>
                        </div>
                    </div>
                  </div>

                  {/* BAGIAN 2: PRODUK APA (Items Info) */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" /> Detail Produk
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {order.items?.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                                <div>
                                    <p className="font-semibold text-gray-800">{item.name}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}x</p>
                                </div>
                                <p className="font-mono text-gray-700">
                                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                </p>
                            </div>
                        ))}
                        
                        <div className="border-t border-gray-300 pt-3 flex justify-between items-center mt-2">
                            <span className="font-bold text-gray-700">Total Transaksi</span>
                            <span className="font-bold text-indigo-600 text-lg">
                                Rp {order.total?.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminGuard>
  );
}