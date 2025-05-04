'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Authentication from '@/app/_components/Authentication';
import { useAuthContext } from '../providers';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

function Header() {
  const { user, signOut } = useAuthContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    signOut();
    setShowDropdown(false);
  };

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
            {user?.pictureURL && (
              <div className="relative" ref={dropdownRef}>
                <div className="cursor-pointer" onClick={() => setShowDropdown(!showDropdown)}>
                  <Image
                    src={user?.pictureURL}
                    alt="userImage"
                    width={35}
                    height={35}
                    className="rounded-full"
                  />
                </div>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 text-sm border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium">{user?.name || 'User'}</p>
                      <p className="text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
