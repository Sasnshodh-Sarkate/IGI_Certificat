/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authState, setAuthState] = useState({
        userName: '',
        loading: true
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (!token) {
            router.push('/login');
            return;
        }

        let name = '';
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                name = user.username || user.email;
            } catch (e) {
                console.error('Failed to parse user data' , e);
            }
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuthState({
            userName: name,
            loading: false
        });
    }, [router]);

    if (authState.loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Toaster position="top-right" richColors />

            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar
                userName={authState.userName}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">

                <div className="flex-1 flex flex-col">

                    {React.cloneElement(children as React.ReactElement<any>, { onMenuClick: () => setIsSidebarOpen(true) })}
                </div>
            </main>
        </div>
    );
}
