'use client';
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Authentication from '@/app/_components/Authentication';
import { useAuthContext } from '../providers';
import Link from 'next/link';

function Header() {
  const { user } = useAuthContext();

  return (
    <div className="p-4 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src={'/logo.svg'} width={30} height={30} alt="logo" />
        <h2 className="text-2xl font-bold"> ThinkSage AI</h2>
      </div>
      <div>
        {!user ? (
          <Authentication>
            <Button>Get started</Button>
          </Authentication>
        ) : (
          <div className="flex gap-3 items-center">
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
              {user?.pictureURL
              && <Image src={user?.pictureURL}
              alt="userImage"
              width={35}
              height={35}
              className="rounded-full"
            />}
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
