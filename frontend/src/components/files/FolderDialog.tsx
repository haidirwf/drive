import { useState, useEffect } from 'react';
import { useFolders, FolderData } from '../../hooks/useFolders';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface FolderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    folder: FolderData | null; // if null, creating. If set, renaming.
    parentId: number | null; // where to create
}

export function FolderDialog({ isOpen, onClose, folder, parentId }: FolderDialogProps) {
    const [name, setName] = useState('');
    const { createFolder, renameFolder } = useFolders(parentId);

    useEffect(() => {
        if (folder) {
            setName(folder.name);
        } else {
            setName('');
        }
    }, [folder, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            if (folder) {
                await renameFolder({ id: folder.id, name });
            } else {
                await createFolder(name);
            }
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-surface">
                <DialogHeader>
                    <DialogTitle>{folder ? 'Rename Folder' : 'New Folder'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="folderName">Name</Label>
                        <Input
                            id="folderName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Documents"
                            autoFocus
                            className="bg-background"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={!name.trim()} className="bg-accent text-text-inverse hover:brightness-110">
                            {folder ? 'Save' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
