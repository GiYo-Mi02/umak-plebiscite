import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Vote from './pages/Vote';
import Admin from './pages/Admin';

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
                  <div className="min-h-screen bg-navy-900 text-parchment flex items-center justify-center">
                    Loading comparison view...
                  </div>
                }
              >
                <Compare />
              </Suspense>
            }
          />
          <Route path="/vote" element={<Vote />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
