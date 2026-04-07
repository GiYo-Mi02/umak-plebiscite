import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Vote from './pages/Vote';
import Admin from './pages/Admin';
import AdminColleges from './pages/AdminColleges';

const Compare = lazy(() => import('./pages/Compare'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/compare"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen bg-white text-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <p className="font-interface text-sm text-zinc-600">Loading document viewer...</p>
                    </div>
                  </div>
                }
              >
                <Compare />
              </Suspense>
            }
          />
          <Route path="/vote" element={<Vote />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/colleges" element={<AdminColleges />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
