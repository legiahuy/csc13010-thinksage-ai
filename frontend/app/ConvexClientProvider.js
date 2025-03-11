'use client';
import React from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import Provider from './providers';

function ConvexClientProvider({ children }) {
  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  return (
    <div>
      <ConvexProvider client={convex}>
        <Provider>{children}</Provider>
      </ConvexProvider>
    </div>
  );
}

export default ConvexClientProvider;
