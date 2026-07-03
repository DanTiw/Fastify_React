import { useState } from 'react';
import { useUsers } from './useUsers';
import { useAuth } from '../auth/useAuth';
import { useDebounce } from '../lib/useDebounce';
import { api, ApiError } from '../lib/api';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from '../lib/notificationStore';
import type { User } from '../types';

export function UsersPage() {
  const { isAdmin, user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const { data, loading, error, reload } = useUsers(page, search);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await api.delete(`/users/${deleting.id}`);
      toast.success(`Deleted ${deleting.email}`);
      setDeleting(null);
      reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Delete failed');
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email…"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:max-w-xs"
        />
        {isAdmin && <Button onClick={() => setCreating(true)}>Add user</Button>}
      </div>

      {loading && <Spinner label="Loading users…" />}
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {data && !loading && (
        <>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={u.isActive ? 'text-green-600' : 'text-gray-400'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setEditing(u)} className="text-blue-600 hover:underline">
                          Edit
                        </button>
                        {u.id !== currentUser?.id && (
                          <button onClick={() => setDeleting(u)} className="ml-3 text-red-600 hover:underline">
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              {data.total} user{data.total === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span>
                Page {data.page} of {totalPages}
              </span>
              <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {creating && (
        <CreateUserModal
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            reload();
          }}
        />
      )}
      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete user"
          message={`Delete ${deleting.email}? This permanently removes the account and cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
