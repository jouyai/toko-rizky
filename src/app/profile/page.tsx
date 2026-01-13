'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/firebase';
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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Pencil, Package, ShoppingBag } from 'lucide-react';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  // --- STATE UNTUK EDIT PROFILE ---
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- STATE UNTUK RIWAYAT PESANAN ---
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Redirect jika belum login
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Mengisi form edit dengan nama saat ini
  useEffect(() => {
    if (userProfile?.name) {
      setNewName(userProfile.name);
    } else if (user?.displayName) {
      setNewName(user.displayName);
    }
  }, [userProfile, user]);

  // Fetch Riwayat Pesanan dari Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          // Query orders milik user yang sedang login, diurutkan dari yang terbaru
          // CATATAN: Jika muncul error "The query requires an index", buka link di console untuk membuat index Firestore.
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

  // Fungsi Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      // 1. Update data di Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: newName,
      });

      // 2. Update Firebase Auth Profile
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

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      {/* Container Utama dengan Glass Effect */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-lg p-8 max-w-2xl w-full">
        
        {/* --- HEADER PROFILE --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Profil Pengguna
          </h1>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-white/50 hover:bg-white/80 backdrop-blur-sm border-indigo-100 text-indigo-700">
                <Pencil className="h-4 w-4" />
                Edit Profil
              </Button>
            </DialogTrigger>
            
            {/* Modal Glassmorphism */}
            <DialogContent className="sm:max-w-[425px] bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-indigo-700">Edit Profil</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Ubah informasi profil Anda di sini.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleUpdateProfile}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right text-gray-700 font-medium">
                      Nama
                    </Label>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="col-span-3 bg-white/50 border-gray-200 focus:bg-white transition-all"
                      placeholder="Nama Lengkap Anda"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right text-gray-700 font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="col-span-3 bg-gray-100/50 cursor-not-allowed border-gray-200 text-gray-500"
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded border border-red-100">{error}</p>}

                <DialogFooter>
                  <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- DETAIL PROFILE --- */}
        <div className="space-y-4 text-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-100 bg-white/50 p-4 rounded-lg">
              <strong className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Nama Lengkap</strong>
              <span className="text-lg font-medium text-gray-800">
                {userProfile?.name || user.displayName || 'Belum ada nama'}
              </span>
            </div>
            
            <div className="border border-gray-100 bg-white/50 p-4 rounded-lg">
              <strong className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Email</strong>
              <span className="text-lg text-gray-800">{user.email}</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="border border-gray-100 bg-white/50 p-4 rounded-lg flex-1">
                <strong className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Role</strong>
                <span className="capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {userProfile?.role || 'User'}
                </span>
            </div>
             <div className="border border-gray-100 bg-white/50 p-4 rounded-lg flex-1 overflow-hidden">
                <strong className="block text-xs text-gray-500 uppercase tracking-wide mb-1">User ID</strong>
                <span className="text-xs font-mono text-gray-400 block truncate" title={user.uid}>{user.uid}</span>
            </div>
          </div>
        </div>

        {/* --- RIWAYAT PESANAN SECTION --- */}
        <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                Riwayat Pesanan
            </h2>
            
            {loadingOrders ? (
                <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-2" />
                    <p className="text-sm text-gray-500">Memuat pesanan...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">Belum ada riwayat pesanan.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 bg-white/60 hover:bg-white transition-colors shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-3 gap-2">
                                <div>
                                    <span className="font-mono text-xs text-gray-400 block mb-1">ID: {order.id}</span>
                                    <div className="text-xs text-gray-500">
                                        {/* Mengamankan render jika createdAt belum tersedia atau bukan timestamp */}
                                        {order.createdAt?.seconds 
                                            ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                              })
                                            : 'Tanggal tidak tersedia'}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white w-fit ${
                                    order.status === 'success' ? 'bg-green-500 shadow-green-200 shadow-md' : 
                                    order.status === 'pending' ? 'bg-yellow-500 shadow-yellow-200 shadow-md' : 'bg-red-500 shadow-red-200 shadow-md'
                                }`}>
                                    {order.status === 'success' ? 'Berhasil' : order.status === 'pending' ? 'Menunggu Pembayaran' : 'Gagal'}
                                </span>
                            </div>
                            
                            <div className="border-t border-gray-100 my-2 pt-2">
                                {order.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm text-gray-700 py-1">
                                        <span>{item.name} <span className="text-gray-400 text-xs">x{item.quantity}</span></span>
                                        {/* Handle jika harga ada atau tidak */}
                                        <span className="font-medium">Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-600">Total Belanja</span>
                                <span className="font-bold text-indigo-600 text-lg">
                                    Rp {order.total?.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}