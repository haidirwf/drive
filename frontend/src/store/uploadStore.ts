import { create } from 'zustand';

export type UploadStatus = 'uploading' | 'processing' | 'done' | 'error';

export interface UploadItem {
    id: string; // unique local ID
    file: File;
    progress: number;
    status: UploadStatus;
    error?: string;
}

interface UploadState {
    queue: UploadItem[];
    addItems: (items: UploadItem[]) => void;
    updateProgress: (id: string, progress: number) => void;
    updateStatus: (id: string, status: UploadStatus, error?: string) => void;
    removeItem: (id: string) => void;
    clearDone: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
    queue: [],
    addItems: (items) => set((state) => ({ queue: [...state.queue, ...items] })),
    updateProgress: (id, progress) => set((state) => ({
        queue: state.queue.map(item => item.id === id ? { ...item, progress } : item)
    })),
    updateStatus: (id, status, error) => set((state) => ({
        queue: state.queue.map(item => item.id === id ? { ...item, status, error } : item)
    })),
    removeItem: (id) => set((state) => ({
        queue: state.queue.filter(item => item.id !== id)
    })),
    clearDone: () => set((state) => ({
        queue: state.queue.filter(item => item.status !== 'done')
    })),
}));
