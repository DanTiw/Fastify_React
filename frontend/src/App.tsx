import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { bootstrapAuth } from './auth/authActions';
import { useAuth } from './auth/useAuth';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoginPage } from './auth/LoginPage';
import { UsersPage } from './users/UsersPage';
import { Layout } from './components/Layout';
import { Spinner } from './components/Spinner';
import { Toaster } from './components/Toaster';

export default function App() {
  const [ready, setReady] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    bootstrapAuth().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading…" />
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/users" replace /> : <LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/users"
            element={
              <Layout>
                <UsersPage />
              </Layout>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/users" replace />} />
      </Routes>
    </>
  );
}
