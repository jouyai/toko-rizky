'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getStoreSettings, saveStoreSettings } from '@/controllers/settingsController';

export default function SettingsPage() {
    const [storeName, setStoreName] = useState('Toko Rizky');
    const [adminEmail, setAdminEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getStoreSettings()
            .then((settings) => {
                if (settings) {
                    setStoreName(settings.storeName ?? 'Toko Rizky');
                    setAdminEmail(settings.adminEmail ?? '');
                }
            })
            .catch((err) => console.error('Gagal memuat pengaturan:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveStoreSettings({ storeName: storeName.trim(), adminEmail: adminEmail.trim() });
            toast.success('Pengaturan berhasil disimpan.');
        } catch (err) {
            console.error(err);
            toast.error('Gagal menyimpan pengaturan.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
                <p className="text-slate-500 font-medium">Kelola informasi toko Anda</p>
            </div>

            <Card className="shadow-sm border-slate-100 rounded-2xl">
                <CardHeader>
                    <CardTitle>Pengaturan Umum</CardTitle>
                    <CardDescription>Informasi dasar toko yang ditampilkan di dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
                            <Loader2 className="w-4 h-4 animate-spin" /> Memuat pengaturan...
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="store-name">Nama Toko</Label>
                                <Input
                                    id="store-name"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    className="max-w-md"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-email">Email Admin</Label>
                                <Input
                                    id="admin-email"
                                    type="email"
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    placeholder="admin@tokorizky.com"
                                    className="max-w-md"
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button
                    className="bg-slate-900 hover:bg-slate-800 text-white"
                    onClick={handleSave}
                    disabled={loading || saving}
                >
                    {saving ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                        </span>
                    ) : (
                        'Simpan Perubahan'
                    )}
                </Button>
            </div>
        </div>
    );
}
