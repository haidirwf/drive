import { useEffect } from 'react';
import { useUploadStore } from '../../store/uploadStore';
import { Progress } from '../ui/progress';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export function UploadQueue() {
    const { queue, removeItem, clearDone } = useUploadStore();

    const activeItems = queue.filter(item => item.status !== 'done' && item.status !== 'error').length;
    const showQueue = queue.length > 0;

    useEffect(() => {
        if (showQueue && activeItems === 0) {
            const timer = setTimeout(() => {
                clearDone();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showQueue, activeItems, clearDone]);

    if (!showQueue) return null;

    return (
        <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50 flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-border bg-background">
                <h3 className="text-sm font-semibold">
                    {activeItems > 0 ? `Uploading ${activeItems} items...` : 'Upload complete'}
                </h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => queue.forEach(q => removeItem(q.id))}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="max-h-64 overflow-y-auto p-2 space-y-2">
                {queue.map((item) => (
                    <div key={item.id} className="flex flex-col gap-1 p-2 rounded bg-background border border-border text-sm">
                        <div className="flex items-center justify-between gap-2">
                            <span className="truncate flex-1 text-text-primary">{item.file.name}</span>

                            <div className="flex items-center gap-1 flex-shrink-0">
                                {item.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
                                {item.status === 'processing' && <span className="text-xs text-text-muted">Processing...</span>}
                                {item.status === 'done' && <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />}
                                {item.status === 'error' && <AlertCircle className="h-4 w-4 text-danger" />}
                            </div>
                        </div>

                        {(item.status === 'uploading' || item.progress > 0) && item.status !== 'error' && (
                            <Progress value={item.progress} className={cn("h-1.5", item.status === 'done' && "opacity-50")} />
                        )}

                        {item.status === 'error' && (
                            <span className="text-xs text-danger block truncate">{item.error || 'Upload failed'}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
