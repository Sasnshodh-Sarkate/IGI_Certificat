'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
    title: string;
    subtitle: string;
    onRefresh?: () => void;
    refreshing?: boolean;
    actions?: React.ReactNode;
}

export function Header({ title, subtitle, onRefresh, refreshing, actions }: HeaderProps) {
    return (
        <header className="h-20 bg-white border-b py-5 border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm w-full">
            <div className="flex flex-col">
                <h2 className="text-lg font-bold text-slate-800 leading-tight">{title}</h2>
                <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
            </div>

            <div className="flex items-center gap-3">
                {onRefresh && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-slate-600 border-slate-200 flex gap-2 font-bold h-10 px-4"
                        onClick={onRefresh}
                    >
                        <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                        Sync Data
                    </Button>
                )}
                {actions}
            </div>
        </header>
    );
}
