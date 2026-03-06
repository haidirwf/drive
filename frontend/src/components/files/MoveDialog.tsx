import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { FileData } from '../../hooks/useFiles';
import { FolderData } from '../../hooks/useFolders';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { FolderCode, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface MoveDialogProps {
    file: FileData | null;
    onClose: () => void;
}

export function MoveDialog({ file, onClose }: MoveDialogProps) {
    const queryClient = useQueryClient();
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [currentViewId, setCurrentViewId] = useState<number | null>(null);

    const { data: viewFolders = [] } = useQuery<FolderData[]>({
        queryKey: ['folders', currentViewId],
        queryFn: async () => {
            const url = currentViewId ? `/folders?parent_id=${currentViewId}` : '/folders';
            const res = await api.get(url);
            return res.data;
        },
        enabled: !!file,
    });

    const { data: breadcrumbs = [] } = useQuery({
        queryKey: ['folderPath', currentViewId],
        queryFn: async () => {
            if (!currentViewId) return [];
            const res = await api.get(`/folders/${currentViewId}/path`);
            return res.data;
        },
        enabled: !!currentViewId,
    });

    const moveMutation = useMutation({
        mutationFn: async () => {
            const res = await api.patch(`/files/${file!.id}`, { folder_id: selectedFolderId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
            toast.success('File moved successfully');
            onClose();
        },
        onError: () => {
            toast.error('Failed to move file');
        }
    });

    if (!file) return null;

    return (
        <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-surface">
                <DialogHeader>
                    <DialogTitle>Move {file.original_name}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col h-[60vh] md:h-96 border border-border rounded-md overflow-hidden bg-background">
                    <div className="flex items-center gap-2 p-2 px-3 border-b border-border bg-surface text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <button
                            className={cn("hover:text-accent font-medium transition-colors", currentViewId === null ? "text-text-primary" : "text-text-secondary")}
                            onClick={() => setCurrentViewId(null)}
                        >
                            Home
                        </button>
                        {breadcrumbs.map((crumb: any) => (
                            <div key={crumb.id} className="flex items-center gap-2 text-text-secondary">
                                <ChevronRight className="h-4 w-4" />
                                <button
                                    className={cn("hover:text-accent font-medium transition-colors", currentViewId === crumb.id ? "text-text-primary" : "")}
                                    onClick={() => setCurrentViewId(crumb.id)}
                                >
                                    {crumb.name}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        <div
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors group",
                                selectedFolderId === currentViewId ? "bg-active" : "hover:bg-hover"
                            )}
                            onClick={() => setSelectedFolderId(currentViewId)}
                        >
                            <FolderCode className="h-5 w-5 text-text-muted group-hover:text-accent" />
                            <span className="text-sm font-medium flex-1">Move here</span>
                            {selectedFolderId === currentViewId && <Check className="h-4 w-4 text-accent" />}
                        </div>

                        <div className="h-px bg-border my-2 mx-1" />

                        {viewFolders.length === 0 ? (
                            <p className="text-xs text-text-muted text-center py-4">No folders found</p>
                        ) : (
                            viewFolders.map((folder) => (
                                <div
                                    key={folder.id}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors group",
                                        selectedFolderId === folder.id ? "bg-active" : "hover:bg-hover"
                                    )}
                                    onClick={() => setSelectedFolderId(folder.id)}
                                    onDoubleClick={() => setCurrentViewId(folder.id)}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <FolderCode className="h-5 w-5 text-text-secondary group-hover:text-accent" />
                                        <span className="text-sm text-text-primary truncate">{folder.name}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {selectedFolderId === folder.id && <Check className="h-4 w-4 text-accent" />}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentViewId(folder.id);
                                            }}
                                        >
                                            <ChevronRight className="h-4 w-4 text-text-secondary" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose} className="border-border hover:bg-hover hover:text-text-primary">Cancel</Button>
                    <Button
                        className="bg-accent text-text-inverse hover:brightness-110"
                        onClick={() => moveMutation.mutate()}
                        disabled={moveMutation.isPending}
                    >
                        {moveMutation.isPending ? 'Moving...' : 'Move Here'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
