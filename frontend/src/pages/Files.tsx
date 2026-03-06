import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useFiles, FileData } from '../hooks/useFiles';
import { useFolders } from '../hooks/useFolders';
import { useUpload } from '../hooks/useUpload';
import { FileGrid } from '../components/files/FileGrid';
import { FileList } from '../components/files/FileList';
import { ShareDialog } from '../components/files/ShareDialog';
import { MoveDialog } from '../components/files/MoveDialog';
import { PreviewModal } from '../components/files/PreviewModal';
import { FolderDialog } from '../components/files/FolderDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { LayoutGrid, List, Search, SlidersHorizontal, FolderPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbList } from '../components/ui/breadcrumb';

export default function Files() {
    const { folderId } = useParams<{ folderId?: string }>();
    const currentFolderId = folderId ? parseInt(folderId, 10) : null;

    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        return (localStorage.getItem('drivex_view') as 'grid' | 'list') || 'grid';
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sort, setSort] = useState('original_name');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');

    // Dialog States
    const [shareFile, setShareFile] = useState<FileData | null>(null);
    const [moveFile, setMoveFile] = useState<FileData | null>(null);
    const [previewFile, setPreviewFile] = useState<FileData | null>(null);

    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState<any | null>(null);

    useEffect(() => {
        localStorage.setItem('drivex_view', viewMode);
    }, [viewMode]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { files, isLoading: isLoadingFiles, deleteFile, updateFile } = useFiles(currentFolderId, debouncedSearch, sort, order);
    const { folders, path, isLoading: isLoadingFolders, deleteFolder } = useFolders(currentFolderId);
    const { uploadFiles } = useUpload(currentFolderId);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            uploadFiles(acceptedFiles);
        }
    }, [uploadFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

    const handleSort = (newSort: string) => {
        if (sort === newSort) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setSort(newSort);
            setOrder('asc');
        }
    };

    const handleAction = async (file: FileData, action: string) => {
        switch (action) {
            case 'preview':
                setPreviewFile(file);
                break;
            case 'share':
                setShareFile(file);
                break;
            case 'move':
                setMoveFile(file);
                break;
            case 'delete':
                if (window.confirm('Are you sure you want to delete this file?')) {
                    await deleteFile(file.id);
                }
                break;
            case 'rename':
                const newName = window.prompt('Enter new name:', file.original_name);
                if (newName && newName !== file.original_name) {
                    await updateFile({ id: file.id, data: { original_name: newName } });
                }
                break;
            case 'star':
                await updateFile({ id: file.id, data: { is_starred: !file.is_starred } });
                break;
        }
    };

    const handleFolderAction = async (e: React.MouseEvent, folder: any, action: string) => {
        e.preventDefault();
        e.stopPropagation();
        switch (action) {
            case 'rename':
                setEditingFolder(folder);
                setIsFolderDialogOpen(true);
                break;
            case 'delete':
                if (window.confirm(`Are you sure you want to delete the folder "${folder.name}" and all its contents?`)) {
                    await deleteFolder(folder.id);
                }
                break;
        }
    };

    return (
        <div {...getRootProps()} className={cn("flex flex-col h-full", isDragActive && "bg-active bg-opacity-50 transition-colors")}>
            <input {...getInputProps()} />

            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4 flex-shrink-0">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/files">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        {path.map((segment) => (
                            <div key={segment.id} className="flex items-center gap-2">
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={`/files/${segment.id}`}>{segment.name}</BreadcrumbLink>
                                </BreadcrumbItem>
                            </div>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center gap-2">
                    <div className="relative w-64 hidden sm:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted" />
                        <Input
                            type="text"
                            placeholder="Search files..."
                            className="pl-9 h-9 bg-surface border-border focus-visible:ring-1"
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9">
                                <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSort('original_name')}>Name</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSort('size')}>Size</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSort('created_at')}>Date</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        className="h-9 w-9 p-0 lg:w-auto lg:px-4"
                        onClick={() => {
                            setEditingFolder(null);
                            setIsFolderDialogOpen(true);
                        }}
                    >
                        <FolderPlus className="h-4 w-4 lg:mr-2" />
                        <span className="hidden lg:inline">New Folder</span>
                    </Button>

                    <div className="flex p-0.5 border border-border rounded-md bg-surface">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-sm", viewMode === 'list' && "bg-background shadow-sm")}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-sm", viewMode === 'grid' && "bg-background shadow-sm")}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 bg-background">
                {isDragActive && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-accent m-4 pt-16 rounded-xl">
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-surface rounded-full">
                                <FolderPlus className="h-10 w-10 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-text-primary">Drop files to upload</h3>
                            <p className="text-sm text-text-secondary w-96 text-center">
                                Files will be uploaded directly to this folder.
                            </p>
                        </div>
                    </div>
                )}

                {(isLoadingFiles || isLoadingFolders) ? (
                    <div className="flex items-center justify-center h-full text-text-muted">Loading...</div>
                ) : (files.length === 0 && folders.length === 0 && !searchQuery) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="p-4 bg-surface rounded-full mb-4">
                            <FolderPlus className="h-8 w-8 text-text-muted" />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight text-text-primary mb-1">This folder is empty</h3>
                        <p className="text-sm text-text-secondary max-w-sm">
                            Drag and drop files here, or use the "Upload Files" button on the left to get started.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {folders.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-text-secondary mb-3">Folders</h3>
                                {/* Simplified folder grid for now */}
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {folders.map(folder => (
                                        <a key={folder.id} href={`/files/${folder.id}`} className="flex items-center gap-2 p-3 border border-border rounded-lg bg-surface hover:bg-hover transition-colors cursor-pointer group">
                                            <FolderPlus className="h-5 w-5 text-text-secondary group-hover:text-accent transition-colors" />
                                            <span className="text-sm truncate font-medium text-text-primary">{folder.name}</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <SlidersHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                                                        e.preventDefault();
                                                        handleFolderAction(e, folder, 'rename');
                                                    }}>Rename</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-danger" onClick={(e: React.MouseEvent) => {
                                                        e.preventDefault();
                                                        handleFolderAction(e, folder, 'delete');
                                                    }}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {files.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-text-secondary mb-3">Files</h3>
                                {viewMode === 'grid' ? (
                                    <FileGrid
                                        files={files}
                                        onRename={(f) => handleAction(f, 'rename')}
                                        onMove={(f) => handleAction(f, 'move')}
                                        onShare={(f) => handleAction(f, 'share')}
                                        onDelete={(f) => handleAction(f, 'delete')}
                                        onToggleStar={(f) => handleAction(f, 'star')}
                                        onPreview={(f) => handleAction(f, 'preview')}
                                    />
                                ) : (
                                    <FileList
                                        files={files}
                                        onRename={(f) => handleAction(f, 'rename')}
                                        onMove={(f) => handleAction(f, 'move')}
                                        onShare={(f) => handleAction(f, 'share')}
                                        onDelete={(f) => handleAction(f, 'delete')}
                                        onToggleStar={(f) => handleAction(f, 'star')}
                                        onPreview={(f) => handleAction(f, 'preview')}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ShareDialog file={shareFile} onClose={() => setShareFile(null)} />
            <MoveDialog file={moveFile} onClose={() => setMoveFile(null)} />
            <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
            <FolderDialog
                isOpen={isFolderDialogOpen}
                onClose={() => setIsFolderDialogOpen(false)}
                folder={editingFolder}
                parentId={currentFolderId}
            />
        </div>
    );
}
