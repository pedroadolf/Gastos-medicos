'use client';

import { useSession } from 'next-auth/react';
import { Role } from '@/components/sidebar/sidebar.config';

/**
 * Hook to easily access user role within client components.
 */
export function useUserRole() {
  const { data: session, status } = useSession();

  const role = (session?.user as any)?.role as Role || 'asegurado';
  const loading = status === 'loading';

  return { 
    role, 
    loading,
    user: session?.user,
    isAuthenticated: status === 'authenticated'
  };
}
