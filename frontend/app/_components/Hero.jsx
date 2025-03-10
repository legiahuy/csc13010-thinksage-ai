import React from 'react';
import { Button } from '@/components/ui/button';

function Hero() {
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
        <Button size="lg">Create now</Button>
      </div>
    </div>
  );
}

export default Hero;
