'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!userProfile || userProfile.role !== 'admin') {
        router.push('/');
      }
    }
  }, [userProfile, loading, router]);

  if (loading || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}