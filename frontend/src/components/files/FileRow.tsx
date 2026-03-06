import { FileData } from '../../hooks/useFiles';
import { formatBytes, formatDate } from '../../lib/utils';
import { getIconForMimeType } from './FileCard';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '../ui/context-menu';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { FileDown, Edit2, FolderInput, Star, StarOff, Share2, Trash2, MoreHorizontal } from 'lucide-react';
import { TableRow, TableCell } from '../ui/table';

interface FileRowProps {
    file: FileData;
    onRename: () => void;
    onMove: () => void;
    onShare: () => void;
    onDelete: () => void;
    onToggleStar: () => void;
    onPreview: () => void;
}

export function FileRow({
    file,
    onRename,
    onMove,
    onShare,
    onDelete,
    onToggleStar,
    onPreview,
}: FileRowProps) {
    const Icon = getIconForMimeType(file.mime_type);

    const ActionMenu = () => (
        <>
            <DropdownMenuItem onClick={onPreview}>Open</DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/api/files/${file.id}/download`, '_blank')}>Download</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={onMove}>Move to...</DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleStar}>
                {file.is_starred ? 'Unstar' : 'Star'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onShare}>Share</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-danger focus:text-danger focus:bg-danger/10">
                Delete
            </DropdownMenuItem>
        </>
    );

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <TableRow
                    className="hover:bg-hover transition-colors cursor-pointer group"
                    onDoubleClick={onPreview}
                >
                    <TableCell className="font-medium p-3">
                        <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-text-muted group-hover:text-accent transition-colors" />
                            <span className="truncate max-w-[200px] sm:max-w-xs">{file.original_name}</span>
                            {file.is_starred && <Star className="h-3 w-3 text-accent fill-accent" />}
                        </div>
                    </TableCell>
                    <TableCell className="p-3 text-text-secondary font-mono text-xs">{formatBytes(file.size, 0)}</TableCell>
                    <TableCell className="p-3 text-text-secondary hidden md:table-cell text-xs">{file.extension?.toUpperCase() || 'FILE'}</TableCell>
                    <TableCell className="p-3 text-text-secondary hidden sm:table-cell font-mono text-xs">{formatDate(file.updated_at)}</TableCell>
                    <TableCell className="p-3 text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <ActionMenu />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            </ContextMenuTrigger>

            <ContextMenuContent className="w-48">
                <ContextMenuItem onClick={onPreview}><Icon className="mr-2 h-4 w-4" /> Open</ContextMenuItem>
                <ContextMenuItem onClick={() => window.open(`/api/files/${file.id}/download`, '_blank')}><FileDown className="mr-2 h-4 w-4" /> Download</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onRename}><Edit2 className="mr-2 h-4 w-4" /> Rename</ContextMenuItem>
                <ContextMenuItem onClick={onMove}><FolderInput className="mr-2 h-4 w-4" /> Move to...</ContextMenuItem>
                <ContextMenuItem onClick={onToggleStar}>
                    {file.is_starred ? <><StarOff className="mr-2 h-4 w-4" /> Unstar</> : <><Star className="mr-2 h-4 w-4" /> Star</>}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onShare}><Share2 className="mr-2 h-4 w-4" /> Share</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onDelete} className="text-danger focus:text-danger focus:bg-danger/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
