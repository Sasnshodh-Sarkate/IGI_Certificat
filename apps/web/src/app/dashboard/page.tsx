'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
    FileUp,
    FileText,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Database,
    BarChart3,
    Download,
    WifiOff,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Header } from '@/components/dashboard/header';

interface CertificateJob {
    id: number;
    fileName: string;
    createdAt: string;
    totalStones: number;
    successCount: number;
    failedCount: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    generatedFilePath?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export default function DashboardPage() {
    const [jobs, setJobs] = useState<CertificateJob[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<number | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchJobs = useCallback(async (showToast = false) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch(`${API_URL}/certificates/jobs`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                router.push('/login');
                return;
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch jobs (${res.status})`);
            }

            const data = await res.json();
            setJobs(Array.isArray(data) ? data : []);
            setFetchError(null);
            if (showToast) toast.success('Records updated');
        } catch (error: any) {
            console.error('Failed to fetch jobs:', error);
            setFetchError(error.message || 'Connection lost. Please check your internet or server status.');
            if (showToast) toast.error('Failed to refresh data');
        } finally {
            setLoadingJobs(false);
        }
    }, [router]);

    useEffect(() => {
        fetchJobs();
        // Auto refresh every 30 seconds to watch progress (less aggressive than 10s)
        const interval = setInterval(() => fetchJobs(false), 30000);
        return () => clearInterval(interval);
    }, [fetchJobs]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic client-side validation
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!validExtensions.includes(fileExtension)) {
            toast.error('Invalid file type. Please upload Excel or CSV.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File too large. Max size is 10MB.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/certificates/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (res.ok) {
                toast.success('File uploaded successfully. Processing started.');
                setIsDialogOpen(false);
                fetchJobs();
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || 'Failed to upload file');
            }
        } catch (error: any) {
            toast.error('Network error during upload');
            console.error(error);
        } finally {
            setUploading(false);
            if (e.target) e.target.value = ''; // Clear the input field
        }
    };

    const handleDownload = async (jobId: number, fileName: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/certificates/jobs/${jobId}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `verified_${fileName}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Report downloaded successfully');
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || 'Failed to download report');
                fetchJobs();
            }
        } catch (error) {
            toast.error('Network error during download');
            console.error(error);
        }
    };

    const handleOpenFile = async (jobId: number, fileName: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/certificates/jobs/${jobId}/open`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                toast.success('Opening file...');
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || 'Failed to open file');
            }
        } catch (error) {
            toast.error('Network error while opening file');
            console.error(error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return (
                    <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 font-black text-[10px] tracking-widest shadow-none ring-1 ring-emerald-500/20">
                        COMPLETED
                    </Badge>
                );
            case 'PROCESSING':
                return (
                    <Badge className="bg-indigo-50 text-indigo-600 border-none px-4 py-1.5 font-black text-[10px] tracking-widest animate-pulse shadow-none ring-1 ring-indigo-500/20">
                        SYNCING
                    </Badge>
                );
            case 'FAILED':
                return (
                    <Badge className="bg-red-50 text-red-600 border-none px-4 py-1.5 font-black text-[10px] tracking-widest shadow-none ring-1 ring-red-500/20">
                        ABORTED
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-slate-50 text-slate-500 border-none px-4 py-1.5 font-black text-[10px] tracking-widest shadow-none ring-1 ring-slate-400/20">
                        QUEUED
                    </Badge>
                );
        }
    };

    const handleDeleteJob = async () => {
        if (!jobToDelete) return;

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/certificates/jobs/${jobToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                toast.success('Job deleted successfully');
                setJobs(prev => prev.filter(job => job.id !== jobToDelete));
                setIsDeleteDialogOpen(false);
                setJobToDelete(null);
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || 'Failed to delete job');
            }
        } catch (error) {
            toast.error('Network error during deletion');
            console.error(error);
        }
    };

    if (loadingJobs && !isMounted) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Initialising Console...</p>
                </div>
            </div>
        );
    }

    if (fetchError && jobs.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
                <Card className="max-w-md w-full p-10 text-center space-y-6 border-none shadow-2xl rounded-[2rem]">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50">
                        <WifiOff className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-slate-900 uppercase">Connection Error</h2>
                        <p className="text-slate-500 text-sm font-medium">{fetchError}</p>
                    </div>
                    <Button
                        onClick={() => { setLoadingJobs(true); fetchJobs(true); }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl border-none"
                    >
                        Retry Connection
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                title="Certificate Console"
                subtitle="Manage and process diamond certificates"
                onRefresh={() => fetchJobs(true)}
                refreshing={loadingJobs}
                actions={
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 gap-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 h-10 border-none">
                                <FileUp className="w-4.5 h-4.5" />
                                Upload File
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
                            <div className="bg-slate-900 px-8 py-10 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-2xl" />
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-600/30 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-xl backdrop-blur-sm">
                                        <FileUp className="w-7 h-7 text-indigo-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <DialogTitle className="text-xl font-black tracking-tight leading-none uppercase">Source Registry</DialogTitle>
                                        <DialogDescription className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em] opacity-70">Excel Data Ingestion System</DialogDescription>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-white space-y-6">
                                <div
                                    className={cn(
                                        "flex flex-col items-center justify-center w-full h-56 border-3 border-dashed rounded-[1.5rem] cursor-pointer transition-all duration-300 relative group",
                                        uploading ? "bg-slate-50 border-slate-200 pointer-events-none" : "bg-slate-50/50 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30"
                                    )}
                                >
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                    <div className="flex flex-col items-center gap-4 text-center">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 ring-1 ring-slate-100">
                                            {uploading ? <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /> : <FileText className="w-8 h-8 text-indigo-500" />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-800 tracking-tight uppercase">
                                                {uploading ? 'Processing File...' : 'Drop your spreadsheet here'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest underline underline-offset-4 decoration-slate-200">
                                                or click to browse local files
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                        <Database className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 tracking-tight">
                                        System accepts <span className="text-indigo-600">.xlsx, .xls and .csv</span> formats. Max file size: 10MB per upload.
                                    </p>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                }
            />

            <div className="p-8 space-y-8 flex-1">
                <Card className="border-slate-200 shadow-xl shadow-slate-200/40 bg-white rounded-2xl overflow-hidden">
                    <Table containerClassName="max-h-[calc(100vh-250px)] overflow-y-auto">
                        <TableHeader className="bg-slate-50/50 sticky top-0 z-20">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="sticky top-0 z-10 bg-slate-50 font-bold text-slate-500 text-[10px] uppercase tracking-widest h-12 pl-10 w-[30%] text-left shadow-[0_1px_rgba(0,0,0,0.05)]">Registry Item</TableHead>
                                <TableHead className="sticky top-0 z-10 bg-slate-50 font-bold text-slate-500 text-[10px] uppercase tracking-widest h-12 px-6 w-[15%] text-left shadow-[0_1px_rgba(0,0,0,0.05)]">Submitted On</TableHead>
                                <TableHead className="sticky top-0 z-10 bg-slate-50 font-bold text-slate-500 text-[10px] uppercase tracking-widest h-12 px-6 w-[10%] text-left shadow-[0_1px_rgba(0,0,0,0.05)]">Stones</TableHead>
                                <TableHead className="sticky top-0 z-10 bg-slate-50 font-bold text-slate-500 text-[10px] uppercase tracking-widest h-12 px-6 w-[15%] text-left shadow-[0_1px_rgba(0,0,0,0.05)]">Detailed Report</TableHead>
                                <TableHead className="sticky top-0 z-10 bg-slate-50 font-bold text-slate-500 text-[10px] uppercase tracking-widest h-12 px-6 w-[15%] text-center shadow-[0_1px_rgba(0,0,0,0.05)]">Status</TableHead>
                                <TableHead className="sticky top-0 z-10 bg-slate-50 font-bold text-slate-500 text-[10px] uppercase tracking-widest h-12 px-6 w-[15%] text-center shadow-[0_1px_rgba(0,0,0,0.05)]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.length === 0 ? (
                                <TableRow key="empty-state">
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-slate-50 rounded-full">
                                                <Database className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold text-sm italic">
                                                {fetchError ? 'Unable to load records' : 'No records found. Click "Upload File" to begin.'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                jobs.map((job) => (
                                    <TableRow key={job.id} className="hover:bg-indigo-50/20 transition-all border-slate-50 group h-20">
                                        <TableCell className="font-bold text-slate-900 pl-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                                    <FileText className="w-4.5 h-4.5 text-indigo-500" />
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="truncate max-w-[280px] text-sm tracking-tight">{job.fileName || 'Unnamed File'}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: #{job.id.toString().padStart(4, '0')}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 font-bold text-xs px-6 italic">
                                            {isMounted && job.createdAt ? new Date(job.createdAt).toLocaleDateString(undefined, {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            }) : '...'}
                                        </TableCell>
                                        <TableCell className="px-6 text-left">
                                            <span className="font-black text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                                                {job.totalStones || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 text-left">
                                            <HoverCard openDelay={100} closeDelay={100}>
                                                <HoverCardTrigger asChild>
                                                    <div className="inline-flex items-center h-10 px-3 gap-3 text-slate-600 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-xl group/btn transition-all cursor-pointer shadow-none hover:shadow-sm">
                                                        <BarChart3 className="w-4 h-4 text-slate-400 group-hover/btn:text-indigo-500" />
                                                        <div className="flex flex-col items-start leading-none gap-0.5">
                                                            <span className="text-[10px] font-black uppercase tracking-widest">History</span>
                                                            <span className="text-[9px] font-bold text-slate-400 tracking-tight">{(job.successCount || 0) + (job.failedCount || 0)} / {job.totalStones || 0} DONE</span>
                                                        </div>
                                                    </div>
                                                </HoverCardTrigger>
                                                <HoverCardContent side="top" className="w-64 p-5 rounded-2xl border-slate-100 shadow-2xl bg-white/95 backdrop-blur-sm">
                                                    <div className="pb-2 border-b border-slate-100 mb-4">
                                                        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Registry Analytics</p>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/30">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-700">Successful</span>
                                                            </div>
                                                            <span className="text-base font-black text-emerald-700">{job.successCount || 0}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100/30">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-700">Failed Records</span>
                                                            </div>
                                                            <span className="text-base font-black text-red-700">{job.failedCount || 0}</span>
                                                        </div>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <div className="flex justify-center">
                                                {getStatusBadge(job.status)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                {job.generatedFilePath ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-3 gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-bold transition-all"
                                                        onClick={() => handleOpenFile(job.id, job.fileName)}
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        Open File
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={job.status !== 'COMPLETED' || (job.successCount || 0) === 0}
                                                        className="h-9 px-3 gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-bold transition-all"
                                                        onClick={() => handleDownload(job.id, job.fileName)}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    onClick={() => {
                                                        setJobToDelete(job.id);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    title="Delete Job"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
                    <div className="bg-red-500 px-8 py-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="relative z-10 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 shadow-xl backdrop-blur-md">
                                <Trash2 className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-xl font-black tracking-tight leading-none uppercase">Delete Registry Item</DialogTitle>
                                <DialogDescription className="text-xs text-red-100 font-bold uppercase tracking-widest opacity-90 mt-2">This action is permanent</DialogDescription>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 bg-white text-center space-y-6">
                        <p className="text-slate-500 text-sm font-bold tracking-tight">
                            Are you sure you want to delete this record? All associated files and data will be permanently removed from the system.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                                onClick={() => setIsDeleteDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1 h-12 rounded-xl font-bold"
                                onClick={handleDeleteJob}
                            >
                                Confirm Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
