import { FileData } from '../../hooks/useFiles';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { ExternalLink, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { getIconForMimeType } from './FileCard';

interface PreviewModalProps {
    file: FileData | null;
    onClose: () => void;
}

export function PreviewModal({ file, onClose }: PreviewModalProps) {
    if (!file) return null;

    const isImage = file.mime_type.startsWith('image/');
    const isVideo = file.mime_type.startsWith('video/');
    const isAudio = file.mime_type.startsWith('audio/');
    const isPdf = file.mime_type === 'application/pdf';

    const previewUrl = `/api/files/${file.id}/preview`;
    const downloadUrl = `/api/files/${file.id}/download`;

    const Icon = getIconForMimeType(file.mime_type);

    return (
        <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0 gap-0 bg-surface border-border overflow-hidden">
                <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between shrink-0">
                    <DialogTitle className="text-lg font-medium text-text-primary truncate max-w-[60%]">
                        {file.original_name}
                    </DialogTitle>
                    <div className="flex items-center gap-2 pr-8">
                        <Button variant="ghost" size="icon" onClick={() => window.open(previewUrl, '_blank')} title="Open in new tab">
                            <ExternalLink className="h-4 w-4 text-text-secondary hover:text-text-primary transition-colors" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => window.open(downloadUrl, '_blank')} title="Download">
                            <Download className="h-4 w-4 text-text-secondary hover:text-text-primary transition-colors" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-background flex items-center justify-center overflow-hidden min-h-0 relative">
                    {isImage ? (
                        <img
                            src={previewUrl}
                            alt={file.original_name}
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : isVideo ? (
                        <video
                            src={previewUrl}
                            controls
                            className="max-w-full max-h-full outline-none"
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : isAudio ? (
                        <div className="flex flex-col items-center gap-6 p-8 w-full max-w-md">
                            <Icon className="h-24 w-24 text-accent drop-shadow-md" strokeWidth={1} />
                            <audio
                                src={previewUrl}
                                controls
                                className="w-full"
                            >
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    ) : isPdf ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-0"
                            title={file.original_name}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-text-secondary">
                            <Icon className="h-20 w-20 text-text-muted" strokeWidth={1} />
                            <p className="text-lg font-medium">No preview available</p>
                            <Button onClick={() => window.open(downloadUrl, '_blank')} className="mt-2 bg-accent text-text-inverse hover:brightness-110">
                                <Download className="mr-2 h-4 w-4" />
                                Download to view
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
