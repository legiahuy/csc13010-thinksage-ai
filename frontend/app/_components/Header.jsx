import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

function Header() {
  return (
    <div className="p-4 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src={'/logo.svg'} width={30} height={30} alt="logo" />
        <h2 className="text-2xl font-bold"> ThinkSage AI</h2>
      </div>
      <div>
        <Button>Get started</Button>
      </div>
    </div>
  );
}

export default Header;
