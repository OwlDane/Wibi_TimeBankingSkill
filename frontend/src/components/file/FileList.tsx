'use client';

import { useState, useEffect } from 'react';
import { fileService } from '@/lib/services/file.service';
import { useFileStore } from '@/stores/file.store';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { Download, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SharedFile } from '@/types';

interface FileListProps {
    sessionId: number;
}

export function FileList({ sessionId }: FileListProps) {
    const { files, setFiles, removeFile, isLoading, setIsLoading } = useFileStore();
    const { user } = useAuthStore();
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetchFiles();
    }, [sessionId]);

    const fetchFiles = async () => {
        try {
            setIsLoading(true);
            const response = await fileService.getSessionFiles(sessionId);
            setFiles(response.files);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to load files';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (file: SharedFile) => {
        try {
            await fileService.downloadFile(file.file_url, file.file_name);
            toast.success('File downloaded');
        } catch (error) {
            toast.error('Failed to download file');
        }
    };

    const handleDelete = async (fileId: number) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            setDeletingId(fileId);
            await fileService.deleteFile(fileId);
            removeFile(fileId);
            toast.success('File deleted');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete file';
            toast.error(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No files shared yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {files.map((file) => (
                <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-lg">{fileService.getFileIcon(file.file_type)}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.file_name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{fileService.formatFileSize(file.file_size)}</span>
                                {file.uploader && <span>by {file.uploader.full_name}</span>}
                                {file.is_public && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">Public</span>}
                            </div>
                            {file.description && (
                                <p className="text-xs text-muted-foreground mt-1">{file.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(file)}
                            title="Download file"
                        >
                            <Download className="h-4 w-4" />
                        </Button>

                        {user?.id === file.uploader_id && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(file.id)}
                                disabled={deletingId === file.id}
                                title="Delete file"
                            >
                                {deletingId === file.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
