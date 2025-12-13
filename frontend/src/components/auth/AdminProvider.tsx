'use client';

import { useEffect } from 'react';
import { useAdminStore } from '@/stores/admin.store';

interface AdminProviderProps {
  children: React.ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const { loadAdmin } = useAdminStore();

  useEffect(() => {
    // Load admin from localStorage on mount
    console.log('🔐 AdminProvider: Loading admin from localStorage...');
    loadAdmin();
  }, []);

  return <>{children}</>;
}
