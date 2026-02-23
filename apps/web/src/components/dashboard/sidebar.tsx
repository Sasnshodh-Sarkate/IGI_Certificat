'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Plus,
    LogOut,
    ShieldCheck,
    Database,
    User,
    Key,
    ChevronRight,
    UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from 'react';

interface SidebarProps {
    userName: string;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}

export function Sidebar({ userName, isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const [showAccountOptions, setShowAccountOptions] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const handleNavClick = (href: string) => {
        router.push(href);
        if (setIsOpen) setIsOpen(false); // Close sidebar on mobile after navigation
    };

    const navItems = [
        {
            label: 'Management',
            icon: LayoutDashboard,
            href: '/dashboard',
            active: pathname === '/dashboard'
        },
        {
            label: 'Label Generation',
            icon: Plus,
            href: '/dashboard/labels',
            active: pathname === '/dashboard/labels'
        }
    ];

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-40 shadow-xl h-full transition-transform duration-300 lg:translate-x-0 lg:static lg:z-20",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="p-6">
                <div className="flex items-center justify-between gap-3 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <ShieldCheck className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight uppercase">IGI Admin</h1>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsOpen?.(false)}
                        className="lg:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.href}
                            onClick={() => handleNavClick(item.href)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left cursor-pointer",
                                item.active
                                    ? "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20"
                                    : "text-slate-400 hover:bg-slate-800"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}

                </nav>
            </div>

            <div className="mt-auto p-4 border-t border-slate-800">
                <Popover onOpenChange={(open) => !open && setShowAccountOptions(false)}>
                    <PopoverTrigger asChild>
                        <button className="w-full p-3 mb-4 rounded-xl bg-slate-800/50 flex items-center gap-3 hover:bg-slate-800 transition-colors text-left group cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-indigo-50/20 flex items-center justify-center text-indigo-400 font-bold group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                {userName.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-xs font-bold truncate text-white">{userName || 'User'}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Administrator</p>
                            </div>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2 bg-slate-900 border-slate-800 text-slate-200 shadow-2xl rounded-xl side-right ml-2" side="right" align="end">
                        <div className="space-y-1">
                            {!showAccountOptions ? (
                                <button
                                    onClick={() => setShowAccountOptions(true)}
                                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                                >
                                    <div className="flex items-center gap-2">
                                        <UserCircle className="w-4 h-4 text-indigo-400" />
                                        Account Settings
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                </button>
                            ) : (
                                <>
                                    <div className="px-3 py-1 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Account Settings
                                    </div>
                                    <button
                                        onClick={() => {
                                            router.push('/dashboard/settings');
                                            setIsOpen?.(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 transition-colors text-sm font-medium"
                                    >
                                        <Key className="w-4 h-4" />
                                        Change Password
                                    </button>
                                    <button
                                        onClick={() => setShowAccountOptions(false)}
                                        className="w-full mt-1 text-[10px] text-slate-500 hover:text-slate-300 text-center py-1"
                                    >
                                        Back to menu
                                    </button>
                                </>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-400/10 gap-3 px-4 font-bold"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
