'use client';
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './_components/AppSidebar';
import AppHeader from './_components/AppHeader';
import { useAuthContext } from '../providers';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PropTypes from 'prop-types';

function DashboardProvider({ children }) {
  const { user } = useAuthContext();
  const router = useRouter();
  useEffect(() => {
    if (user === null) {
      console.log('User not authenticated, redirecting to home');
      router.replace('/');
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full">
        <AppHeader />
        <div className="p-10">{children}</div>
      </div>
    </SidebarProvider>
  );
}

DashboardProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardProvider;
