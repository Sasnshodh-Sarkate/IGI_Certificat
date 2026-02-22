'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (!token) {
            router.push('/login');
            return;
        }

        if (userStr) {
            const user = JSON.parse(userStr);
            setUserName(user.username || user.email);
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Toaster position="top-right" richColors />
            <Sidebar userName={userName} />
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
