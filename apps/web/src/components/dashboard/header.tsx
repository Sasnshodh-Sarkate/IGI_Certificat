'use client';

import { RefreshCw, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
    title: string;
    subtitle: string;
    onRefresh?: () => void;
    refreshing?: boolean;
    onMenuClick?: () => void;
    actions?: React.ReactNode;
}

export function Header({ title, subtitle, onRefresh, refreshing, onMenuClick, actions }: HeaderProps) {
    return (
        <header className="h-20 bg-white border-b py-5 border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm w-full">
            <div className="flex items-center gap-4">
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-slate-500 hover:text-indigo-600 lg:hidden"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                )}
                <div className="flex flex-col">
                    <h2 className="text-sm md:text-lg font-bold text-slate-800 leading-tight truncate max-w-[150px] md:max-w-none">{title}</h2>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium truncate max-w-[150px] md:max-w-none">{subtitle}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                {onRefresh && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-slate-600 border-slate-200 flex gap-2 font-bold h-9 md:h-10 px-3 md:px-4"
                        onClick={onRefresh}
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5 md:w-4 md:h-4", refreshing && "animate-spin")} />
                        <span className="hidden sm:inline">Sync Data</span>
                    </Button>
                )}
                {actions}
            </div>
        </header>
    );
}
