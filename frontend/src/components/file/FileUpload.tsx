'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { fileService } from '@/lib/services/file.service';
import { useFileStore } from '@/stores/file.store';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';

interface FileUploadProps {
    sessionId: number;
    onUploadSuccess?: () => void;
}

export function FileUpload({ sessionId, onUploadSuccess }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const { addFile, setError } = useFileStore();

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            toast.error('File size exceeds 50MB limit');
            return;
        }

        try {
            setIsUploading(true);
            const uploadedFile = await fileService.uploadFile(
                sessionId,
                file,
                description,
                isPublic
            );
            addFile(uploadedFile);
            setDescription('');
            setIsPublic(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            toast.success('File uploaded successfully!');
            onUploadSuccess?.();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to upload file';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors">
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground">Max 50MB</p>
                        </>
                    )}
                </button>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="text-sm font-medium">Description (optional)</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description for this file..."
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isUploading}
                    />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        disabled={isUploading}
                        className="rounded border-border"
                    />
                    <span className="text-sm font-medium">Make this file public</span>
                </label>
            </div>
        </div>
    );
}
