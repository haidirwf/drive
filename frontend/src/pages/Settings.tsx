import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { api } from '../lib/api';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';

export default function Settings() {
    const logout = useAuthStore((state) => state.logout);
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Fetch current user info if needed
        api.get('/auth/me').then(res => {
            setUsername(res.data.username || 'Admin');
        }).catch(console.error);
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) { }
        logout();
    };

    return (
        <div className="flex-1 overflow-auto p-6 lg:p-10 bg-background max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                <SettingsIcon className="h-6 w-6 text-accent" />
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">Settings</h1>
            </div>

            <div className="space-y-8">
                <section className="p-6 border border-border rounded-xl bg-surface shadow-sm">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Account Profile</h2>
                    <div className="flex flex-col gap-4 max-w-md">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                disabled
                                className="bg-background opacity-70"
                            />
                            <p className="text-xs text-text-muted mt-1">Managed via environment variables.</p>
                        </div>
                    </div>
                </section>

                <section className="p-6 border border-danger/20 rounded-xl bg-surface shadow-sm">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Session Management</h2>
                    <p className="text-sm text-text-secondary mb-4">
                        Sign out of your DriveX account on this device. You will need your credentials to sign back in.
                    </p>
                    <Button variant="outline" onClick={handleLogout} className="border-danger text-danger hover:bg-danger/10 hover:text-danger">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </section>
            </div>
        </div>
    );
}
