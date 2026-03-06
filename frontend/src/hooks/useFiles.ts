import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface FileData {
    id: number;
    original_name: string;
    size: number;
    mime_type: string;
    extension: string | null;
    is_starred: boolean;
    updated_at: string;
}

export function useFiles(folderId: number | null, search: string = '', sort = 'original_name', order = 'asc') {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery<FileData[]>({
        queryKey: ['files', folderId, search, sort, order],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (folderId) params.append('folder_id', folderId.toString());
            if (search) params.append('search', search);
            params.append('sort', sort);
            params.append('order', order);

            const res = await api.get(`/files?${params.toString()}`);
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/files/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
            queryClient.invalidateQueries({ queryKey: ['storageStats'] });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number, data: Partial<FileData> }) => {
            const res = await api.patch(`/files/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
            queryClient.invalidateQueries({ queryKey: ['starredFiles'] });
        }
    });

    return {
        files: data || [],
        isLoading,
        error,
        deleteFile: deleteMutation.mutateAsync,
        updateFile: updateMutation.mutateAsync,
    };
}

export function useStarredFiles() {
    const { data, isLoading } = useQuery<FileData[]>({
        queryKey: ['starredFiles'],
        queryFn: async () => {
            const res = await api.get('/files/starred');
            return res.data;
        },
    });
    return { files: data || [], isLoading };
}

export function useRecentFiles() {
    const { data, isLoading } = useQuery<FileData[]>({
        queryKey: ['recentFiles'],
        queryFn: async () => {
            const res = await api.get('/files/recent');
            return res.data;
        },
    });
    return { files: data || [], isLoading };
}
