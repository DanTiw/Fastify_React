import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Paginated, User } from '../types';

const PAGE_SIZE = 10;

export function useUsers(page: number, search: string) {
  const [data, setData] = useState<Paginated<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (search) params.set('search', search);
      setData(await api.get<Paginated<User>>(`/users?${params.toString()}`));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
