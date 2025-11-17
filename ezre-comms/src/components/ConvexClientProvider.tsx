'use client'

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState, useEffect } from "react";

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (url && url !== 'https://placeholder.convex.cloud') {
      setClient(new ConvexReactClient(url));
    } else {
      // If no Convex URL, still render children (UI will work, just no data)
      console.warn('NEXT_PUBLIC_CONVEX_URL not set. UI will display but data features require Convex setup.');
    }
  }, []);

  // If no client, just render children (for viewing UI)
  if (!client) {
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

