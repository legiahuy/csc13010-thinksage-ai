"use client"
import React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from './_components/AppSidebar'
import AppHeader from './_components/AppHeader'
import { useAuthContext } from '../providers'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function DashboardProvider({ children }){

    const {user} = useAuthContext();
    const router = useRouter();
    useEffect(()=> {
        user && CheckedUserAuthenticated();
    }, [user]);

    const CheckedUserAuthenticated = () =>{
        if (!user) {
            router.replace('/');
        }
    }

    return(
        <SidebarProvider>
            <AppSidebar />
            <div className ='w-full'>
                <AppHeader/>
                {children}</div>
        </SidebarProvider>
    )
}

export default DashboardProvider