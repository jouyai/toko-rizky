'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/AuthContext';
import { User, Mail } from 'lucide-react';

export default function ProfilePage() {
    const { user, userProfile } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 shadow-sm border-slate-100 rounded-2xl overflow-hidden">
                    <div className="h-32 bg-amber-500 relative">
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-400">
                                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="pt-12 pb-6 px-6 text-center">
                        <h2 className="text-xl font-bold text-slate-900">{userProfile?.name || 'Admin User'}</h2>
                        <p className="text-slate-500 text-sm">{user?.email}</p>
                        <div className="mt-4 inline-flex px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">
                            {userProfile?.role === 'admin' ? 'Administrator' : (userProfile?.role || 'Admin')}
                        </div>
                    </div>
                </Card>

                <Card className="md:col-span-2 shadow-sm border-slate-100 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                                <div className="flex items-center gap-2 text-slate-700 font-medium p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <User className="w-4 h-4 text-slate-400" />
                                    {userProfile?.name || 'Not set'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                <div className="flex items-center gap-2 text-slate-700 font-medium p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    {user?.email}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
