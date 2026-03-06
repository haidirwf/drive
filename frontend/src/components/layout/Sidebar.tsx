import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    FolderCode,
    FolderOpen,
    Clock,
    Star,
    Settings as SettingsIcon,
    Upload,
    Menu,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatBytes, cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useUpload } from '../../hooks/useUpload';

export function Sidebar({ currentFolderId }: { currentFolderId?: number | null }) {
    const navigate = useNavigate();
    const { uploadFiles } = useUpload(currentFolderId || null);

    const { data: stats } = useQuery({
        queryKey: ['storageStats'],
        queryFn: async () => {
            const res = await api.get('/storage/stats');
            return res.data;
        },
        refetchInterval: 30000,
    });

    const usedBytes = stats?.used_bytes || 0;
    const totalBytes = stats?.total_bytes || 100 * 1024 * 1024 * 1024;
    const usagePercent = Math.min((usedBytes / totalBytes) * 100, 100);

    const handleUploadClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e: any) => {
            if (e.target.files?.length) {
                uploadFiles(e.target.files);
            }
        };
        input.click();
    };

    const NavItems = () => (
        <div className="flex flex-col gap-1 w-full">
            <NavLink
                to="/files"
                className={({ isActive }) =>
                    cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 space-transition hover:bg-hover text-sm font-medium",
                        isActive ? "bg-active text-text-primary" : "text-text-secondary"
                    )
                }
            >
                <FolderOpen className="h-4 w-4" />
                All Files
            </NavLink>
            <NavLink
                to="/recent"
                className={({ isActive }) =>
                    cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-hover text-sm font-medium",
                        isActive ? "bg-active text-text-primary" : "text-text-secondary"
                    )
                }
            >
                <Clock className="h-4 w-4" />
                Recent
            </NavLink>
            <NavLink
                to="/starred"
                className={({ isActive }) =>
                    cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-hover text-sm font-medium",
                        isActive ? "bg-active text-text-primary" : "text-text-secondary"
                    )
                }
            >
                <Star className="h-4 w-4" />
                Starred
            </NavLink>
        </div>
    );

    const BottomItems = () => (
        <div className="mt-auto flex flex-col gap-4">
            <div className="px-3">
                <div className="flex justify-between text-xs text-text-secondary mb-2 font-mono">
                    <span>{formatBytes(usedBytes)}</span>
                    <span>{formatBytes(totalBytes)}</span>
                </div>
                <Progress value={usagePercent} className="h-1.5" />
            </div>

            <div className="flex flex-col gap-1">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-hover text-sm font-medium",
                            isActive ? "bg-active text-text-primary" : "text-text-secondary"
                        )
                    }
                >
                    <SettingsIcon className="h-4 w-4" />
                    Settings
                </NavLink>
            </div>
        </div>
    );

    const Actions = () => (
        <div className="flex flex-col gap-2 mb-6">
            <Button onClick={handleUploadClick} className="w-full justify-start gap-2 bg-accent text-text-inverse hover:brightness-110">
                <Upload className="h-4 w-4" />
                Upload Files
            </Button>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface px-4 py-6 h-screen sticky top-0">
                <div className="flex items-center gap-2 px-2 mb-8 cursor-pointer" onClick={() => navigate('/files')}>
                    <FolderCode className="h-6 w-6 text-accent" />
                    <span className="text-xl font-bold tracking-tight">DriveX</span>
                </div>

                <Actions />
                <NavItems />
                <BottomItems />
            </aside>

            {/* Mobile Topbar & Sheet */}
            <div className="lg:hidden flex items-center justify-between border-b border-border bg-background px-4 py-3 sticky top-0 z-30">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/files')}>
                    <FolderCode className="h-5 w-5 text-accent" />
                    <span className="text-lg font-bold tracking-tight">DriveX</span>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-6 flex flex-col bg-surface">
                        <div className="flex items-center gap-2 px-2 mb-8 cursor-pointer" onClick={() => navigate('/files')}>
                            <FolderCode className="h-6 w-6 text-accent" />
                            <span className="text-xl font-bold tracking-tight">DriveX</span>
                        </div>
                        <Actions />
                        <NavItems />
                        <BottomItems />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
