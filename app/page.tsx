// app/page.js
'use client';

import React, { useEffect, useState } from 'react';
import Map from '@/components/Map';
import StatsCard from '@/components/StatsCard';

export default function Home() {
  const [testMode, setTestMode] = useState(false);
  const [loadingTestData, setLoadingTestData] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const testModeEnabled = process.env.NEXT_PUBLIC_TEST_MODE == "1";
  const retro = process.env.NEXT_PUBLIC_RETRO_LOOK == "1" ?? false;
  const [globalStats, setGlobalStats] = useState({
    threeMonth: 'Loading...',
    sixMonth: 'Loading...',
    twelveMonth: 'Loading...',
  });

  useEffect(() => {
    // Check if test mode is active
    const checkTestMode = async () => {
      if (!testModeEnabled) return;
      setLoadingTestData(true);
      const res = await fetch('/api/test-data?mode=check');
      const data = await res.json();
      setTestMode(data.testMode);
      setLoadingTestData(false);
    };

    // Fetch the global uptime statistics from an API endpoint or calculate them
    const fetchGlobalStats = async () => {
      const res = await fetch('/api/service-history');
      const data = await res.json();
      setGlobalStats(data.overallUptime);
    };

    checkTestMode();
    fetchGlobalStats();
  }, [testModeEnabled]);

  const toggleTestMode = async () => {
    if (!testModeEnabled) return;
    setLoadingTestData(true);
    if (!testMode) {
      // Inject test data
      await fetch('/api/test-data?mode=inject');
      setTestMode(true);
    } else {
      // Delete test data
      await fetch('/api/test-data?mode=delete');
      setTestMode(false);
    }
    setLoadingTestData(false);
  };

  const clearData = async () => {
    if (!testModeEnabled) return;
    setClearingData(true);
    await fetch('/api/test-data?mode=clear');
    setClearingData(false);
  };

  return (
    <main className={retro ? "relative min-h-screen crt" : "relative min-h-screen"}>
      <h1 className="text-center text-3xl py-4 text-green-500">Server Status Map</h1>
      <div className="w-full h-[80vh] crt-content">
        <Map />
      </div>
      <div className="fixed bottom-1/4 py-4 ms-10 text-green-500">
        <StatsCard title="Global Uptime" stats={globalStats} />
      </div>
      {testModeEnabled && (
      <div className="flex justify-center">
        <button
          onClick={toggleTestMode}
          className="bg-green-500 text-black px-4 py-2 rounded-md"
          disabled={loadingTestData}
        >
          {loadingTestData ? 'Processing...' : testMode ? 'Disable Test Mode' : 'Enable Test Mode'}
        </button>
        <button
          onClick={clearData}
          className="ms-3 bg-green-500 text-black px-4 py-2 rounded-md"
          disabled={clearingData}
        >
          {clearingData ? 'Processing...' :  'Clear All Data'}
        </button>
      </div>
      )}
    </main>
  );
}