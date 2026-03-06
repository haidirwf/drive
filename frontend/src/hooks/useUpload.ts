import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../lib/api';
import { useUploadStore, UploadItem } from '../store/uploadStore';

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

export function useUpload(currentFolderId: number | null) {
    const queryClient = useQueryClient();
    const { addItems, updateProgress, updateStatus } = useUploadStore();

    const processUpload = async (item: UploadItem) => {
        updateStatus(item.id, 'uploading');

        try {
            if (item.file.size < 10 * 1024 * 1024) {
                // Direct upload for < 10MB
                const formData = new FormData();
                formData.append('file', item.file);
                if (currentFolderId) {
                    formData.append('folder_id', currentFolderId.toString());
                }

                await api.post('/upload/direct', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || item.file.size));
                        updateProgress(item.id, percentCompleted);
                    }
                });

            } else {
                // Chunked upload
                const totalChunks = Math.ceil(item.file.size / CHUNK_SIZE);

                // 1. Init
                const initRes = await api.post('/upload/init', {
                    filename: item.file.name,
                    size: item.file.size,
                    mime_type: item.file.type || 'application/octet-stream',
                    folder_id: currentFolderId,
                    total_chunks: totalChunks
                });

                const uploadId = initRes.data.upload_id;

                // 2. Upload chunks (sequential for simplicity, could be concurrent)
                for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                    const start = chunkIndex * CHUNK_SIZE;
                    const end = Math.min(start + CHUNK_SIZE, item.file.size);
                    const chunk = item.file.slice(start, end);

                    const formData = new FormData();
                    formData.append('upload_id', uploadId);
                    formData.append('chunk_index', chunkIndex.toString());
                    formData.append('chunk', chunk, item.file.name);

                    await api.post('/upload/chunk', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    const percentCompleted = Math.round(((chunkIndex + 1) / totalChunks) * 100);
                    updateProgress(item.id, percentCompleted);
                }

                // 3. Complete
                updateStatus(item.id, 'processing');
                await api.post('/upload/complete', { upload_id: uploadId });
            }

            updateStatus(item.id, 'done');
            updateProgress(item.id, 100);

            // Invalidate queries to refresh file list
            queryClient.invalidateQueries({ queryKey: ['files'] });
            queryClient.invalidateQueries({ queryKey: ['storageStats'] });

        } catch (error: any) {
            console.error("Upload error", error);
            updateStatus(item.id, 'error', error.response?.data?.error || 'Upload failed');
        }
    };

    const uploadFiles = useCallback((files: FileList | File[]) => {
        const newItems: UploadItem[] = Array.from(files).map((file) => ({
            id: uuidv4(),
            file,
            progress: 0,
            status: 'uploading'
        }));

        addItems(newItems);

        // Process each
        newItems.forEach(item => {
            processUpload(item);
        });
    }, [currentFolderId, addItems]);

    return { uploadFiles };
}
