"use client"
import { useAuthContext } from '@/app/providers'
import { SidebarTrigger } from '@/components/ui/sidebar'
import Image from 'next/image'
import React from 'react'

function AppHeader() {
    const {user} = useAuthContext();
    return (
        <div className ='p-3 flex justify-between items-center'>
            <SidebarTrigger/>
            <Image src={user?.photoURL ||'/default-avatar.png'} alt='user'
                width={40} height={40} className ='rounded-full'/>
        </div>
    )
}

export default AppHeader
