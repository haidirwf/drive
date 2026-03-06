import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { FileData } from '../../hooks/useFiles';
import { formatDate } from '../../lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Copy, Link2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareLink {
    id: number;
    token: string;
    expires_at: string | null;
    download_count: number;
}

interface ShareDialogProps {
    file: FileData | null;
    onClose: () => void;
}

export function ShareDialog({ file, onClose }: ShareDialogProps) {
    const queryClient = useQueryClient();
    const [expiresInDays, setExpiresInDays] = useState<string>('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { data: links = [] } = useQuery<ShareLink[]>({
        queryKey: ['shareLinks', file?.id],
        queryFn: async () => {
            if (!file) return [];
            const res = await api.get(`/files/${file.id}/shares`);
            return res.data;
        },
        enabled: !!file,
    });

    const createShareMutation = useMutation({
        mutationFn: async () => {
            const payload: any = {};
            if (expiresInDays) payload.expires_in_days = parseInt(expiresInDays, 10);
            if (password) payload.password = password;

            const res = await api.post(`/files/${file!.id}/share`, payload);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['shareLinks', file?.id] });
            setExpiresInDays('');
            setPassword('');
            handleCopy(data.url);
            toast.success('Share link generated and copied to clipboard');
        }
    });

    const revokeMutation = useMutation({
        mutationFn: async (token: string) => {
            await api.delete(`/share/${token}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shareLinks', file?.id] });
            toast.success('Share link revoked');
        }
    });

    const handleGenerate = async () => {
        setLoading(true);
        await createShareMutation.mutateAsync();
        setLoading(false);
    };

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('Copied to clipboard');
    };

    if (!file) return null;

    return (
        <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-surface">
                <DialogHeader>
                    <DialogTitle>Share File: {file.original_name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="expires">Expires in (days) - optional</Label>
                        <Input
                            id="expires"
                            type="number"
                            min="1"
                            placeholder="e.g. 7"
                            value={expiresInDays}
                            onChange={(e) => setExpiresInDays(e.target.value)}
                            className="bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password protect - optional</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Leave blank for public access"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-background"
                        />
                    </div>

                    <Button
                        className="w-full bg-accent text-text-inverse hover:brightness-110"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        <Link2 className="mr-2 h-4 w-4" />
                        Generate Link
                    </Button>
                </div>

                {links.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-text-secondary">Active Links</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {links.map((link) => (
                                <div key={link.id} className="flex flex-col gap-2 p-3 border border-border rounded-md bg-background">
                                    <div className="flex items-center justify-between pointer-events-none">
                                        <span className="text-xs font-mono truncate mr-2 select-all cursor-text pointer-events-auto">
                                            {window.location.origin}/share/{link.token}
                                        </span>
                                        <div className="flex gap-1 pointer-events-auto">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(`${window.location.origin}/share/${link.token}`)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-danger hover:text-danger hover:bg-danger/10" onClick={() => revokeMutation.mutate(link.token)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-text-muted mt-1 uppercase">
                                        <span>{link.download_count} Downloads</span>
                                        <span>{link.expires_at ? `Expires: ${formatDate(link.expires_at)}` : 'No expiry'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
