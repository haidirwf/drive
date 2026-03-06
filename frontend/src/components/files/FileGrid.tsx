import { FileData } from '../../hooks/useFiles';
import { FileCard } from './FileCard';

interface FileGridProps {
    files: FileData[];
    onRename: (file: FileData) => void;
    onMove: (file: FileData) => void;
    onShare: (file: FileData) => void;
    onDelete: (file: FileData) => void;
    onToggleStar: (file: FileData) => void;
    onPreview: (file: FileData) => void;
}

export function FileGrid({
    files,
    onRename,
    onMove,
    onShare,
    onDelete,
    onToggleStar,
    onPreview,
}: FileGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {files.map(file => (
                <FileCard
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
        </div>
    );
}
