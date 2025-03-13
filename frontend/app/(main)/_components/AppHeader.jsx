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
            {user?.pictureURL
              && <Image src={user?.pictureURL}
              alt="userImage"
              width={35}
              height={35}
              className="rounded-full"
            />}
        </div>
    )
}

export default AppHeader
