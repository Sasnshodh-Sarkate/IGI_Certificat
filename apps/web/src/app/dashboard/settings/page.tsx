/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Lock, Loader2, ShieldCheck, Key } from 'lucide-react';

import { Header } from '@/components/dashboard/header';

export default function SettingsPage({ onMenuClick }: { onMenuClick?: () => void }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://127.0.0.1:3001/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to change password');
            }

            toast.success('Password changed successfully! Redirecting to login...');

            // Clear local storage and redirect after a short delay
            setTimeout(() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                router.replace('/login');
            }, 2000);

            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                title="Account Settings"
                subtitle="Manage your account security and preferences"
                onMenuClick={onMenuClick}
            />

            <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 w-full flex-1">
                <div className="grid gap-6 md:gap-8">
                    <Card className="border-slate-200 shadow-xl shadow-slate-200/40 bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 md:p-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 shadow-inner shrink-0">
                                    <Key className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <CardTitle className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Change Password</CardTitle>
                                    <CardDescription className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Update credentials</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <form onSubmit={handleChangePassword}>
                            <CardContent className="p-6 md:p-8 space-y-6">
                                <div className="space-y-5 max-w-md">
                                    <div className="space-y-2">
                                        <Label htmlFor="old-password" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Current Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="old-password"
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl text-slate-900"
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                disabled={loading}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new-password" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="new-password"
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl text-slate-900"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                disabled={loading}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl text-slate-900"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={loading}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 md:p-8">
                                <Button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 border-none"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Updating...
                                        </div>
                                    ) : (
                                        'Update Password'
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}

