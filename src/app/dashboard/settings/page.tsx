'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
                <p className="text-slate-500 font-medium">Manage your dashboard preferences</p>
            </div>

            <Card className="shadow-sm border-slate-100 rounded-2xl">
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Configure general dashboard information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="store-name">Store Name</Label>
                        <Input id="store-name" defaultValue="Toko Rizky" className="max-w-md" disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-email">Admin Email</Label>
                        <Input id="admin-email" defaultValue="admin@tokorizky.com" className="max-w-md" disabled />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-100 rounded-2xl">
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="space-y-0.5">
                            <Label className="text-base font-bold">Email Notifications</Label>
                            <p className="text-sm text-slate-500">Receive daily summary emails</p>
                        </div>
                        <span className="text-xs text-slate-400 px-3 py-1 bg-slate-200 rounded-full font-medium">Coming Soon</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="space-y-0.5">
                            <Label className="text-base font-bold">Order Alerts</Label>
                            <p className="text-sm text-slate-500">Get notified when new orders arrive</p>
                        </div>
                        <span className="text-xs text-slate-400 px-3 py-1 bg-slate-200 rounded-full font-medium">Coming Soon</span>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white" onClick={() => toast.info('Settings feature coming soon.')}>Save Changes</Button>
            </div>
        </div>
    );
}
