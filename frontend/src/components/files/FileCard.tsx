import { FileData } from '../../hooks/useFiles';
import { formatBytes, formatDate } from '../../lib/utils';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '../ui/context-menu';
import { FileDown, Edit2, FolderInput, Star, StarOff, Share2, Trash2, FileIcon, Image, FileText, Video, Music, FileArchive } from 'lucide-react';

export function getIconForMimeType(mimeType: string) {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.startsWith('text/') || mimeType === 'application/pdf') return FileText;
    if (mimeType === 'application/zip' || mimeType === 'application/x-rar-compressed') return FileArchive;
    return FileIcon;
}

interface FileCardProps {
    file: FileData;
    onRename: () => void;
    onMove: () => void;
    onShare: () => void;
    onDelete: () => void;
    onToggleStar: () => void;
    onPreview: () => void;
}

export function FileCard({
    file,
    onRename,
    onMove,
    onShare,
    onDelete,
    onToggleStar,
    onPreview,
}: FileCardProps) {
    const Icon = getIconForMimeType(file.mime_type);

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div
                    onDoubleClick={onPreview}
                    className="group flex flex-col p-4 border border-border rounded-xl bg-surface hover:bg-hover transition-colors cursor-pointer relative"
                >
                    {file.is_starred && (
                        <Star className="absolute top-3 right-3 h-4 w-4 text-accent fill-accent" />
                    )}

                    <div className="flex-1 flex items-center justify-center p-6 bg-background rounded-lg mb-3">
                        <Icon className="h-12 w-12 text-text-muted group-hover:text-accent transition-colors" strokeWidth={1.5} />
                    </div>

                    <div className="space-y-1 overflow-hidden">
                        <h4 className="text-sm font-medium text-text-primary truncate" title={file.original_name}>
                            {file.original_name}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-text-secondary font-mono">
                            <span>{formatBytes(file.size, 0)}</span>
                            <span>{formatDate(file.updated_at)}</span>
                        </div>
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
                <ContextMenuItem onClick={onPreview}>
                    <FileIcon className="mr-2 h-4 w-4" />
                    Open
                </ContextMenuItem>
                <ContextMenuItem onClick={() => window.open(`/api/files/${file.id}/download`, '_blank')}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onRename}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Rename
                </ContextMenuItem>
                <ContextMenuItem onClick={onMove}>
                    <FolderInput className="mr-2 h-4 w-4" />
                    Move to...
                </ContextMenuItem>
                <ContextMenuItem onClick={onToggleStar}>
                    {file.is_starred ? (
                        <><StarOff className="mr-2 h-4 w-4" /> Unstar</>
                    ) : (
                        <><Star className="mr-2 h-4 w-4" /> Star</>
                    )}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onDelete} className="text-danger focus:text-danger focus:bg-danger/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
