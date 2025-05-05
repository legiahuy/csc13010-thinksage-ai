'use client';
import React, { useEffect } from 'react';
import GeneratedVideosList from './_components/GeneratedVideosList';
import { useAuthContext } from '@/app/providers';
import { useRouter } from 'next/navigation';

function ManageVideos() {
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Show nothing while checking auth
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div>
      <h2 className="font-bold text-3xl">Manage Generated Videos</h2>
      <GeneratedVideosList />
    </div>
  );
}

export default ManageVideos;
