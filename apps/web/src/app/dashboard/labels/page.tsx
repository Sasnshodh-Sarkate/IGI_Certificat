"use client";

import { useState } from 'react';
import React from "react";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileUp, FileText, RefreshCw, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Header } from '@/components/dashboard/header';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export default function LabelsPage({ onMenuClick }: { onMenuClick?: () => void }) {
    const [uploading, setUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [currentJob, setCurrentJob] = useState<{ id: string, status: string, downloadUrl?: string } | null>(null);

    interface JobStatusResponse {
        id: string;
        state: 'completed' | 'failed' | 'active' | 'waiting' | 'delayed';
        progress: number;
        result?: {
            fileName: string;
            downloadUrl: string;
        };
        failedReason?: string;
    }

    const checkJobStatus = async (jobId: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/labels/status/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json() as JobStatusResponse;

                // Map BullMQ state to our status
                const status = data.state === 'completed' ? 'COMPLETED' :
                    data.state === 'failed' ? 'FAILED' : 'PROCESSING';

                if (status === 'COMPLETED' && data.result) {
                    const downloadUrl = `${API_URL}${data.result.downloadUrl}`;
                    setCurrentJob({
                        id: jobId,
                        status: 'COMPLETED',
                        downloadUrl: downloadUrl
                    });
                    toast.success('Labels generated! Downloading...', { id: 'label-gen' });

                    // Trigger automatic download with Authentication
                    try {
                        const dlRes = await fetch(downloadUrl, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (dlRes.ok) {
                            const blob = await dlRes.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = data.result.fileName || 'labels.pdf';
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        } else {
                            toast.error('Failed to download generated file');
                        }
                    } catch (err) {
                        console.error('Download error:', err);
                        toast.error('Error downloading file');
                    }
                } else if (status === 'FAILED') {
                    setCurrentJob({ id: jobId, status: 'FAILED' });
                    toast.error(`Generation failed: ${data.failedReason || 'Unknown error'}`, { id: 'label-gen' });
                } else {
                    // Still processing
                    setCurrentJob({ id: jobId, status: 'PROCESSING' });
                    // Continue polling
                    setTimeout(() => checkJobStatus(jobId), 2000);
                }
            }
        } catch (error: unknown) {
            console.error('Error checking status:', error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        // Reset current job
        setCurrentJob(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/labels/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                toast.success('File uploaded. Processing started...', { id: 'label-gen' });
                setIsDialogOpen(false);

                // Start polling
                if (data.jobId) {
                    setCurrentJob({ id: data.jobId, status: 'PROCESSING' });
                    checkJobStatus(data.jobId);
                }
            } else {
                toast.error('Failed to upload file');
            }
        } catch (error: unknown) {
            toast.error('Error uploading file');
        } finally {
            setUploading(false);
            e.target.value = ''; // Clear the input field
        }
    };

    return (
        <>
            <Header
                title="Label Generator"
                subtitle="Generate and print stock labels from Excel"
                onMenuClick={onMenuClick}
            />

            <div className="p-4 md:p-8 space-y-8 w-full max-w-2xl mx-auto flex-1 flex flex-col items-center justify-center">
                <Card className="p-6 md:p-10 border-slate-200 shadow-xl shadow-slate-200/40 bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col items-center justify-center text-center space-y-6 w-full">
                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0 text-indigo-500">
                        <FileText className="w-10 h-10" />
                    </div>

                    {currentJob ? (
                        <div className="space-y-6 w-full animate-in fade-in zoom-in duration-300">
                            <div className="flex flex-col items-center gap-4">
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500",
                                    currentJob.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600" :
                                        currentJob.status === 'FAILED' ? "bg-red-50 text-red-600" :
                                            "bg-indigo-50 text-indigo-600 animate-pulse"
                                )}>
                                    {currentJob.status === 'COMPLETED' ? <CheckCircle2 className="w-8 h-8" /> :
                                        currentJob.status === 'FAILED' ? <AlertCircle className="w-8 h-8" /> :
                                            <RefreshCw className="w-8 h-8 animate-spin" />}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                        {currentJob.status === 'COMPLETED' ? 'Generation Complete' :
                                            currentJob.status === 'FAILED' ? 'Processing Failed' :
                                                'Generating Labels...'}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Job ID: #{currentJob.id}
                                    </p>
                                </div>
                            </div>

                            {currentJob.status === 'FAILED' && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-8 py-6 gap-3 rounded-2xl transition-all w-full"
                                    onClick={() => setCurrentJob(null)}
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Try Again
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Stock Label Generation</h2>
                            <p className="text-slate-500 font-medium max-w-sm text-sm">
                                Upload your stock spreadsheet to automatically generate printable QR-coded labels (64mm x 34mm).
                            </p>
                        </div>
                    )}

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-6 gap-3 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 text-base border-none h-auto">
                                <FileUp className="w-5 h-5" />
                                Upload Spreadsheet
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
                                        <DialogTitle className="text-xl font-black tracking-tight leading-none uppercase">Label Factory</DialogTitle>
                                        <DialogDescription className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em] opacity-70">Stock Processing Module</DialogDescription>
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
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
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

                    <div className="pt-8 border-t border-slate-100 w-full grid grid-cols-3 gap-8">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Excel Support</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                <RefreshCw className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto QR Gen</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                <Database className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Details</span>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}
