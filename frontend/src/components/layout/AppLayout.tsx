import { Outlet, useParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { UploadQueue } from '../upload/UploadQueue';

export function AppLayout() {
    const { folderId } = useParams<{ folderId?: string }>();
    const currentFolderId = folderId ? parseInt(folderId, 10) : null;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar currentFolderId={currentFolderId} />

            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Outlet />
            </main>

            <UploadQueue />
        </div>
    );
}
