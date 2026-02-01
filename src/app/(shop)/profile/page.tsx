'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import Link from 'next/link';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Loader2,
  Pencil,
  Package,
  User,
  MapPin,
  CreditCard,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

type OrderStatus = 'success' | 'pending' | 'shipped' | 'failed';
type FilterStatus = 'all' | OrderStatus;

const statusConfig = {
  success: { label: 'Berhasil', bg: 'bg-green-100', text: 'text-green-700' },
  shipped: { label: 'Dikirim', bg: 'bg-blue-100', text: 'text-blue-700' },
  pending: { label: 'Menunggu', bg: 'bg-amber-100', text: 'text-amber-700' },
  failed: { label: 'Gagal', bg: 'bg-red-100', text: 'text-red-700' },
};

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  // State for edit profile
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for order history
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'payment'>('orders');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Fill edit form with current name
  useEffect(() => {
    if (userProfile?.name) {
      setNewName(userProfile.name);
    } else if (user?.displayName) {
      setNewName(user.displayName);
    }
  }, [userProfile, user]);

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );

          const querySnapshot = await getDocs(q);
          const orderData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setOrders(orderData);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoadingOrders(false);
        }
      }
    };

    fetchOrders();
  }, [user]);

  // Update profile function
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: newName,
      });

      await updateProfile(user, {
        displayName: newName,
      });

      setOpen(false);
    } catch (err: any) {
      console.error(err);
      setError('Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  if (!user) return null;

  return (
    <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Side Navigation */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white border border-slate-100 rounded-xl p-4 sticky top-24 shadow-sm">
            <div className="mb-6 px-3">
              <h1 className="text-lg font-bold uppercase tracking-tight">Akun Saya</h1>
              <p className="text-slate-500 text-xs truncate">{user.email}</p>
            </div>
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${activeTab === 'profile'
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Profil</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${activeTab === 'orders'
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Pesanan</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${activeTab === 'addresses'
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium">Alamat</span>
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${activeTab === 'payment'
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-sm font-medium">Pembayaran</span>
              </button>
              <div className="my-2 border-t border-slate-100"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-all text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 min-w-0">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <>
              {/* Page Heading */}
              <div className="mb-8">
                <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-2 uppercase">Riwayat Pesanan</h2>
                <p className="text-slate-500 text-sm">Lacak dan kelola pembelian Anda.</p>
              </div>

              {/* Filters & Search */}
              <div className="bg-white border border-slate-100 rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex gap-2 flex-wrap">
                    {(['all', 'success', 'pending', 'shipped'] as FilterStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${filterStatus === status
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-amber-500 hover:text-amber-500'
                          }`}
                      >
                        {status === 'all' ? 'Semua' : statusConfig[status]?.label || status}
                      </button>
                    ))}
                  </div>
                  <div className="w-full md:w-72">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Cari Order ID..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order List */}
              {loadingOrders ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <Loader2 className="animate-spin h-10 w-10 text-slate-400 mx-auto mb-4" />
                    <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Memuat pesanan...</p>
                  </div>
                </div>
              ) : paginatedOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Belum ada pesanan</p>
                  <Link href="/product">
                    <button className="mt-4 px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-500 transition-colors">
                      Mulai Belanja
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {paginatedOrders.map((order) => {
                    const status = order.status as OrderStatus;
                    const config = statusConfig[status] || statusConfig.pending;
                    const firstItem = order.items?.[0];

                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex gap-4 items-center">
                            <div
                              className="h-16 w-16 bg-slate-100 rounded-lg flex-shrink-0 bg-cover bg-center border border-slate-100"
                              style={{ backgroundImage: `url('${firstItem?.image || '/placeholder.jpg'}')` }}
                            />
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold text-slate-900">Order #{order.id.slice(-8).toUpperCase()}</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                                  {config.label}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500">
                                {order.createdAt?.seconds
                                  ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                  })
                                  : 'Tanggal tidak tersedia'} • {order.items?.length || 0} item
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10">
                            <div className="text-right">
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Total</p>
                              <p className="text-base font-bold text-amber-600">
                                Rp {order.total?.toLocaleString('id-ID')}
                              </p>
                            </div>
                            <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                              <Eye className="w-4 h-4" />
                              Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${currentPage === page
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 text-slate-600 hover:text-amber-500 hover:border-amber-500'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-2 uppercase">Profil Saya</h2>
                  <p className="text-slate-500 text-sm">Kelola informasi profil Anda.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-sm hover:shadow-md">
                      <Pencil className="w-4 h-4" />
                      Edit Profil
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
                    <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400 via-slate-900 to-slate-900"></div>
                      <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black text-white uppercase tracking-tight mb-2">Edit Profil</DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Perbarui informasi profil Anda untuk pengalaman belanja yang lebih baik.
                        </DialogDescription>
                      </DialogHeader>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="p-8 bg-white">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-slate-700 ml-1">
                            Nama Lengkap
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                            <input
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="w-full pl-12 pr-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-400 text-sm hover:border-slate-300"
                              placeholder="Nama Lengkap Anda"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-slate-700 ml-1">
                            Email
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none flex items-center justify-center font-bold">@</div>
                            <input
                              value={user.email || ''}
                              disabled
                              className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-500 cursor-not-allowed text-sm font-medium"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-200 px-2 py-1 rounded">Read Only</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          <p className="text-red-600 text-sm font-medium">{error}</p>
                        </div>
                      )}

                      <DialogFooter className="mt-8 gap-3 sm:gap-0">
                        <div className="flex w-full gap-3">
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="flex-1 px-5 py-3.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-50 hover:border-slate-300 transition-all"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] px-5 py-3.5 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-amber-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="animate-spin h-4 w-4" />
                                Menyimpan...
                              </>
                            ) : (
                              'Simpan Perubahan'
                            )}
                          </button>
                        </div>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-slate-100 bg-slate-50 p-4 rounded-lg">
                    <strong className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                      Nama Lengkap
                    </strong>
                    <span className="text-lg font-medium text-slate-800">
                      {userProfile?.name || user.displayName || 'Belum ada nama'}
                    </span>
                  </div>
                  <div className="border border-slate-100 bg-slate-50 p-4 rounded-lg">
                    <strong className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                      Email
                    </strong>
                    <span className="text-lg text-slate-800">{user.email}</span>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-2 uppercase">Alamat Saya</h2>
                <p className="text-slate-500 text-sm">Kelola alamat pengiriman Anda.</p>
              </div>
              <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Fitur alamat akan segera tersedia</p>
              </div>
            </>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-2 uppercase">Metode Pembayaran</h2>
                <p className="text-slate-500 text-sm">Kelola metode pembayaran Anda.</p>
              </div>
              <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
                <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Fitur pembayaran akan segera tersedia</p>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}