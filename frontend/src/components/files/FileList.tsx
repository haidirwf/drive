import { FileData } from '../../hooks/useFiles';
import { FileRow } from './FileRow';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table';

interface FileListProps {
    files: FileData[];
    onRename: (file: FileData) => void;
    onMove: (file: FileData) => void;
    onShare: (file: FileData) => void;
    onDelete: (file: FileData) => void;
    onToggleStar: (file: FileData) => void;
    onPreview: (file: FileData) => void;
}

export function FileList({
    files,
    onRename,
    onMove,
    onShare,
    onDelete,
    onToggleStar,
    onPreview,
}: FileListProps) {
    return (
        <div className="rounded-md border border-border bg-surface overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%] sm:w-[50%]">Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead className="hidden md:table-cell">Type</TableHead>
                        <TableHead className="hidden sm:table-cell">Modified</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {files.map(file => (
                        <FileRow
                            key={file.id}
                            file={file}
                            onRename={() => onRename(file)}
                            onMove={() => onMove(file)}
                            onShare={() => onShare(file)}
                            onDelete={() => onDelete(file)}
                            onToggleStar={() => onToggleStar(file)}
                            onPreview={() => onPreview(file)}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
