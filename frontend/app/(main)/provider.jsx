import React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from './_components/AppSidebar'
import AppHeader from './_components/AppHeader'

function DashboardProvider({ children }){
    return(
        <SidebarProvider>
            <AppSidebar />
            <div>
                <AppHeader/>
                {children}</div>
        </SidebarProvider>
    )
}

export default DashboardProvider