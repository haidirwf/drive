import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatBytes } from '../lib/utils';
import { getIconForMimeType } from '../components/files/FileCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Download, FileWarning, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function SharePage() {
    const { token } = useParams<{ token?: string }>();
    const [password, setPassword] = useState('');
    const [downloading, setDownloading] = useState(false);

    // Check link validity and metadata
    const { data: fileInfo, isError, isLoading } = useQuery({
        queryKey: ['publicShare', token],
        queryFn: async () => {
            const res = await api.get(`/share/${token}`);
            return res.data;
        },
        retry: false
    });

    const handleDownload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setDownloading(true);
        try {
            const res = await api.get(`/share/${token}/download`, {
                headers: password ? { 'X-Share-Password': password } : {},
                responseType: 'blob'
            });

            // trigger download
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileInfo.original_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (err: any) {
            if (err.response?.status === 403) {
                toast.error('Invalid password');
            } else if (err.response?.status === 410) {
                toast.error('Link has expired');
            } else {
                toast.error('Download failed');
            }
        } finally {
            setDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <p className="text-text-muted">Loading...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="p-8 border border-border rounded-xl bg-surface flex flex-col items-center max-w-sm text-center">
                    <FileWarning className="h-12 w-12 text-danger mb-4" />
                    <h2 className="text-lg font-bold text-text-primary">Link Unavailable</h2>
                    <p className="text-text-secondary mt-2 text-sm">
                        This link may have expired or been revoked by the owner.
                    </p>
                </div>
            </div>
        );
    }

    const Icon = getIconForMimeType(fileInfo?.mime_type || '');

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
                <div className="flex flex-col items-center mb-8 text-center text-text-primary">
                    <Icon className="h-16 w-16 mb-4 text-accent" strokeWidth={1} />
                    <h1 className="text-xl font-bold truncate w-full" title={fileInfo?.original_name}>
                        {fileInfo?.original_name}
                    </h1>
                    <p className="text-sm text-text-secondary mt-1 tracking-wide font-mono">
                        {formatBytes(fileInfo?.size || 0, 1)}
                    </p>
                </div>

                <form onSubmit={handleDownload} className="space-y-4">
                    {fileInfo?.has_password && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2 text-sm text-text-muted">
                                <Lock className="h-4 w-4" />
                                <span>Protected File</span>
                            </div>
                            <Input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-background text-center"
                            />
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-accent text-text-inverse hover:brightness-110" disabled={downloading}>
                        {downloading ? 'Downloading...' : (
                            <>
                                <Download className="mr-2 h-4 w-4" /> Download File
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
