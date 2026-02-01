'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import AdminGuard from '@/components/auth/AdminGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Search,
  Filter,
  Eye,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  ShoppingBag
} from 'lucide-react';

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
    image?: string;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    // Real-time listener for orders
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerDetails?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      settlement: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      deny: 'bg-red-100 text-red-800 border-red-200',
      cancel: 'bg-red-100 text-red-800 border-red-200',
      expire: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    const style = statusStyles[status] || 'bg-slate-100 text-slate-800 border-slate-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${style}`}>
        {status}
      </span>
    );
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.seconds) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <AdminGuard>
      <div className="mx-auto p-6 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orders</h1>
            <p className="text-slate-500 font-medium">Monitor and manage customer transactions</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
          {/* Status Filters */}
          <div className="flex p-1 bg-slate-100 rounded-xl overflow-hidden self-start sm:self-auto">
            {['all', 'pending', 'settlement', 'expire'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${statusFilter === status
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search Order ID or Customer..."
              className="pl-10 bg-white border-slate-200 rounded-xl focus-visible:ring-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin w-6 h-6 mx-auto text-amber-500" /></td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <ShoppingBag className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-medium text-slate-900">No orders found</p>
                        <p className="text-sm">Try adjusting your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-sm font-medium text-slate-600">
                        #{order.orderId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{order.customerDetails?.first_name || 'Guest'}</span>
                          <span className="text-xs text-slate-400 truncate max-w-[150px]">{order.customerDetails?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">
                        Rp {order.total?.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="w-4 h-4 mr-2" /> Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* --- ORDER DETAILS DIALOG --- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-1">Order Details</h2>
              <p className="text-slate-400 font-mono text-sm">#{selectedOrder?.orderId}</p>
            </div>
            <div>
              {selectedOrder && getStatusBadge(selectedOrder.status)}
            </div>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">

            {/* Customer Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> Customer
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedOrder?.customerDetails?.first_name}</p>
                      <p className="text-xs text-slate-500">Customer Name</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-slate-900 truncate">{selectedOrder?.customerDetails?.email}</p>
                      <p className="text-xs text-slate-500">Email Address</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{selectedOrder?.customerDetails?.phone}</p>
                      <p className="text-xs text-slate-500">Phone Number</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Shipping
                </h3>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                    <MapPin className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed">
                      {selectedOrder?.customerDetails?.shipping_address?.address ||
                        selectedOrder?.customerDetails?.billing_address?.address ||
                        'Address not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" /> Items Ordered
              </h3>
              <div className="border border-slate-100 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-left">Item</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">Qty</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Price</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder?.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-center">x{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-right">
                          {item.price.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">
                          {(item.price * item.quantity).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-full sm:w-1/2 space-y-3">
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-base font-black text-slate-900">Total Amount</span>
                    <span className="text-xl font-black text-amber-600">
                      Rp {selectedOrder?.total?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <Button variant="outline" onClick={() => setDetailsOpen(false)} className="w-full sm:w-auto min-w-[100px] rounded-xl font-bold">Close Details</Button>
          </div>
        </DialogContent>
      </Dialog>

    </AdminGuard>
  );
}