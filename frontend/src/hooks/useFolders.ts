import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface FolderData {
    id: number;
    name: string;
    path: string;
    parent_id: number | null;
    updated_at: string;
}

export interface BreadcrumbData {
    id: number;
    name: string;
}

export function useFolders(parentId: number | null) {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery<FolderData[]>({
        queryKey: ['folders', parentId],
        queryFn: async () => {
            const url = parentId ? `/folders?parent_id=${parentId}` : '/folders';
            const res = await api.get(url);
            return res.data;
        },
    });

    const pathQuery = useQuery<BreadcrumbData[]>({
        queryKey: ['folderPath', parentId],
        queryFn: async () => {
            if (!parentId) return [];
            const res = await api.get(`/folders/${parentId}/path`);
            return res.data;
        },
        enabled: !!parentId,
    });

    const createMutation = useMutation({
        mutationFn: async (name: string) => {
            const res = await api.post('/folders', { name, parent_id: parentId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders'] });
        }
    });

    const renameMutation = useMutation({
        mutationFn: async ({ id, name }: { id: number, name: string }) => {
            const res = await api.patch(`/folders/${id}`, { name });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders'] });
            queryClient.invalidateQueries({ queryKey: ['folderPath'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/folders/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders'] });
            queryClient.invalidateQueries({ queryKey: ['files'] });
            queryClient.invalidateQueries({ queryKey: ['storageStats'] });
        }
    });

    return {
        folders: data || [],
        path: pathQuery.data || [],
        isLoading,
        isPathLoading: pathQuery.isLoading,
        error,
        createFolder: createMutation.mutateAsync,
        renameFolder: renameMutation.mutateAsync,
        deleteFolder: deleteMutation.mutateAsync,
    };
}
