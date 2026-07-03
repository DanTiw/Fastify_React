import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { logout } from '../auth/authActions';
import { Button } from './Button';

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">User Management</h1>
          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-sm text-gray-600 sm:inline">
                {user.firstName} {user.lastName} · <span className="font-medium">{user.role}</span>
              </span>
            )}
            <Button variant="secondary" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
