'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const ServerDetailPage = () => {
  const params = useParams();
  const region = params.region.replace('-', ' ');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const router = useRouter();

  useEffect(() => {
    // Fetch service history
    const fetchHistory = async () => {
      // endDate is today in YYYY-MM-DD format
      const today = new Date();
      const endDate = today.toISOString().split('T')[0];
      // startDate is 1 year ago
      const yearago = new Date(today);
      yearago.setFullYear(today.getFullYear() - 1);
      const startDate = yearago.toISOString().split('T')[0];

      const res = await fetch(
        `/api/service-history?location=${region}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      setHistory(data.history);
    };

    // Fetch uptime statistics
    const fetchStats = async () => {
      // Implement the logic to fetch and calculate uptime statistics
      setStats({
        threeMonth: 99.9,
        sixMonth: 99.8,
        twelveMonth: 99.7,
      });
    };

    fetchHistory();
    fetchStats();
  }, [region]);

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl mb-4">Server Details - {region}
      <button onClick={() => router.push('/')} className="float-end mt-4 p-2 bg-green-800 text-white rounded">
        &laquo;Back
      </button>

      </h1>
      <div className="mb-8">
        <h2 className="text-2xl">Uptime Statistics</h2>
        <p>3 Month Uptime: {stats.threeMonth}%</p>
        <p>6 Month Uptime: {stats.sixMonth}%</p>
        <p>12 Month Uptime: {stats.twelveMonth}%</p>
      </div>
      <div>
        <h2 className="text-2xl mb-4">Historical Downtime Events</h2>
        {history.length > 0 ? (
          <ul>
            {history.map((event, index) => (
              <li key={index}>
                {new Date(event.startTime.seconds * 1000).toLocaleString()} -{' '}
                {new Date(event.endTime.seconds * 1000).toLocaleString()} (Duration:{' '}
                {((event.endTime.seconds - event.startTime.seconds) / 60).toFixed(2)} minutes)
              </li>
            ))}
          </ul>
        ) : (
          <p>No downtime events recorded.</p>
        )}
      </div>
    </main>
  );
};

export default ServerDetailPage;