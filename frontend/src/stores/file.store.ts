'use client';

import { create } from 'zustand';
import type { SharedFile, FileStats } from '@/types';

interface FileStore {
    // State
    files: SharedFile[];
    stats: FileStats | null;
    isLoading: boolean;
    error: string | null;
    uploadProgress: number;

    // Actions
    setFiles: (files: SharedFile[]) => void;
    setStats: (stats: FileStats | null) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setUploadProgress: (progress: number) => void;
    addFile: (file: SharedFile) => void;
    removeFile: (fileId: number) => void;
    clearFiles: () => void;
    clearError: () => void;
}

export const useFileStore = create<FileStore>((set) => ({
    // Initial state
    files: [],
    stats: null,
    isLoading: false,
    error: null,
    uploadProgress: 0,

    // Actions
    setFiles: (files) => set({ files }),
    setStats: (stats) => set({ stats }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setUploadProgress: (progress) => set({ uploadProgress: progress }),
    addFile: (file) =>
        set((state) => ({
            files: [file, ...state.files],
        })),
    removeFile: (fileId) =>
        set((state) => ({
            files: state.files.filter((f) => f.id !== fileId),
        })),
    clearFiles: () => set({ files: [] }),
    clearError: () => set({ error: null }),
}));
