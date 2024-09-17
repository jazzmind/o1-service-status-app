// app/page.js
'use client';

import React, { useEffect, useState } from 'react';
import Map from '@/components/Map';
import StatsCard from '@/components/StatsCard';

export default function Home() {
  const [globalStats, setGlobalStats] = useState({
    threeMonth: 'Loading...',
    sixMonth: 'Loading...',
    twelveMonth: 'Loading...',
  });

  useEffect(() => {
    // Fetch the global uptime statistics from an API endpoint or calculate them
    const fetchGlobalStats = async () => {
      // Replace with actual API call
      // For demonstration, we're using static values
      setGlobalStats({
        threeMonth: 99.95,
        sixMonth: 99.9,
        twelveMonth: 99.85,
      });
    };

    fetchGlobalStats();
  }, []);

  return (
    <main className="relative min-h-screen">
      <h1 className="text-center text-3xl py-4 text-green-500">Server Status Map</h1>
      <div className="w-full h-[80vh]">
        <Map />
      </div>
      <div className="fixed bottom-1/4 py-4 ms-10 text-green-500">
        <StatsCard title="Global Uptime" stats={globalStats} />
      </div>
    </main>
  );
}