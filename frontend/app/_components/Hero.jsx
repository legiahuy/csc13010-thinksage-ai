'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthContext } from '../providers';
import { useState } from 'react';

function Hero() {
  const { user } = useAuthContext;
  const [showMessage, setShowMessage] = useState(false);

  const handleCreateClick = (e) => {
    e.preventDefault();
    setShowMessage(true);

    setTimeout(() => setShowMessage(false), 5000);
  };

  return (
    <div className="p-10 flex flex-col items-center justify-center mt-24">
      <h2 className="font-bold text-4xl text-center md:text-5xl lg:text-6xl">
        Generate science AI videos from simple text prompts
      </h2>
      <p className="mt-2 text-md text-center text-gray-500 md:text-xl lg:text-2xl">
        🤖 Prompt your topic and our Al video generator writes the script, adds visuals generated
        with AI, adds voiceovers, subtitles, music, etc. ⚡ Create publish-worthy videos for you!
      </p>
      <div className="mt-7 gap-8 flex">
        <Button size="lg" variant="secondary">
          Explore
        </Button>

        {user ? (
          <Link href={'/create-new-video'}>
            <Button size="lg">Create now</Button>
          </Link>
        ) : (
          <Link href={'/'}>
            <Button size="lg" onClick={handleCreateClick}>
              Create now
            </Button>
          </Link>
        )}
      </div>
      {showMessage && (
        <div className="mt-5 text-sm text-red-500 animate-in">
          Please log in before creating videos!
        </div>
      )}
    </div>
  );
}

export default Hero;
