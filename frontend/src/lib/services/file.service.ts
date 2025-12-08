import axios from 'axios';
import type { SharedFile, GetSessionFilesResponse, FileStats } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * File Service - Handles all file sharing-related API calls
 * Includes uploading, downloading, and managing files in sessions
 */
export const fileService = {
    // Upload a file to a session
    async uploadFile(
        sessionId: number,
        file: File,
        description?: string,
        isPublic?: boolean
    ): Promise<SharedFile> {
        const formData = new FormData();
        formData.append('file', file);
        if (description) formData.append('description', description);
        if (isPublic !== undefined) formData.append('is_public', isPublic.toString());

        const response = await axios.post(
            `${API_BASE}/sessions/${sessionId}/files/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data;
    },

    // Get all files for a session
    async getSessionFiles(sessionId: number): Promise<GetSessionFilesResponse> {
        const response = await axios.get(`${API_BASE}/sessions/${sessionId}/files`);
        return response.data.data;
    },

    // Get a single file
    async getFile(fileId: number): Promise<SharedFile> {
        const response = await axios.get(`${API_BASE}/files/${fileId}`);
        return response.data.data;
    },

    // Delete a file
    async deleteFile(fileId: number): Promise<void> {
        await axios.delete(`${API_BASE}/files/${fileId}`);
    },

    // Get file statistics for a session
    async getSessionFileStats(sessionId: number): Promise<FileStats> {
        const response = await axios.get(`${API_BASE}/sessions/${sessionId}/files/stats`);
        return response.data.data;
    },

    // Download a file
    async downloadFile(fileUrl: string, fileName: string): Promise<void> {
        const response = await axios.get(fileUrl, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    // Format file size for display
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },

    // Get file icon based on type
    getFileIcon(fileType: string): string {
        const type = fileType.toLowerCase();
        if (type.includes('pdf')) return '📄';
        if (type.includes('image')) return '🖼️';
        if (type.includes('video')) return '🎥';
        if (type.includes('audio')) return '🎵';
        if (type.includes('word') || type.includes('document')) return '📝';
        if (type.includes('sheet') || type.includes('excel')) return '📊';
        if (type.includes('presentation') || type.includes('powerpoint')) return '📽️';
        if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return '📦';
        return '📎';
    },
};
