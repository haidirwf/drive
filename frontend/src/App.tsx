import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import Login from './pages/Login';

// Components for routes
import { AppLayout } from './components/layout/AppLayout';
import Files from './pages/Files';
import SharePage from './pages/SharePage';
import Settings from './pages/Settings';

const Recent = () => <div className="p-4"><h1 className="text-2xl font-bold">Recent</h1></div>;
const Starred = () => <div className="p-4"><h1 className="text-2xl font-bold">Starred</h1></div>;


function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'a' || e.key === 'A') {
        navigate('/files');
      } else if (e.key === 'r' || e.key === 'R') {
        navigate('/recent');
      } else if (e.key === 's' || e.key === 'S') {
        navigate('/starred');
      } else if (e.key === 'u' || e.key === 'U') {
        const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
        if (fileInput) fileInput.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/share/:token" element={<SharePage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/files" element={<Files />} />
          <Route path="/files/:folderId" element={<Files />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/starred" element={<Starred />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/files" replace />} />
    </Routes>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
