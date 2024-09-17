// app/[region]/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const ServerDetailPage = () => {
  const params = useParams();
  const region = params.region.replace('-', ' ');
  const location = params.location.replace('-', ' ');
  const [historyData, setHistoryData] = useState(null);
  const [status, setStatus] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const [calculationsCorrect, setCalculationsCorrect] = useState(false);

  useEffect(() => {
    // fetch current service status
    const fetchServiceStatus = async () => {
      const res = await fetch(`/api/service-status?region=${encodeURIComponent(region)}`);
      const data = await res.json();
      // data is in the format { services: [{ name: 'Service1', status: 'up' }, ...] }
      // we want status[serviceName] = serviceStatus
      const serviceStatus = {};
      data.services.forEach(service => {
        serviceStatus[service.name] = service.status;
      });
      setStatus(serviceStatus);
    }

    // Fetch uptime statistics
    const fetchHistoryData = async () => {
      const res = await fetch(`/api/service-history?region=${encodeURIComponent(region)}`);
      const data = await res.json();
      setHistoryData(data);
      verifyCalculations(data);
    };

    // Check if test mode is active
    const checkTestMode = async () => {
      const res = await fetch('/api/test-data?mode=check');
      const data = await res.json();
      setTestMode(data.testMode);
    };

    const verifyCalculations = (data) => {
      if (testMode && data) {
        // Expected uptime percentages based on test data
        // Each downtime event is 1 day duration
        const totalDurations = {
          threeMonth: (Date.now() - new Date().setMonth(new Date().getMonth() - 3)),
          sixMonth: (Date.now() - new Date().setMonth(new Date().getMonth() - 6)),
          twelveMonth: (Date.now() - new Date().setFullYear(new Date().getFullYear() - 1)),
        };
        const expectedDowntime = 86400000; // 1 day in milliseconds
        const expectedUptimes = {};
  
        Object.keys(totalDurations).forEach((window) => {
          const uptimePercentage =
            ((totalDurations[window] - expectedDowntime) / totalDurations[window]) * 100;
          expectedUptimes[window] = uptimePercentage.toFixed(2);
        });
  
        // Verify calculations for each service
        let correct = true;
        Object.values(data.uptimeStats).forEach((stats) => {
          Object.keys(expectedUptimes).forEach((window) => {
            if (stats[window] !== expectedUptimes[window]) {
              correct = false;
            }
          });
        });
  
        setCalculationsCorrect(correct);
      }
    };

    fetchServiceStatus();
    fetchHistoryData();
    checkTestMode();
  }, [region, location, testMode]);

  const router = useRouter();

  return (
    
    <main className="min-h-screen bg-black text-white p-4">
      <div className='flex items-start'>
        <div className='flex-1'>
          <h1 className="text-3xl mb-4">Server Details - {region}</h1>
          <h3 className="text-2xl mb-4">Location: {location}</h3>
        </div>
        <button onClick={() => router.push('/')} className="p-3 bg-green-800 text-white rounded">
          &laquo; Back
        </button>
      </div>
      <hr />

      {historyData ? (
        <>
          <div className="mb-8">
            <h2 className="text-2xl">Overall Uptime Statistics</h2>
            <p>3 Month Uptime: {historyData.overallUptime.threeMonth}%</p>
            <p>6 Month Uptime: {historyData.overallUptime.sixMonth}%</p>
            <p>12 Month Uptime: {historyData.overallUptime.twelveMonth}%</p>
          </div>

          <div>
            <h2 className="text-2xl mb-4">Service Uptime Statistics</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="border-b-2 border-gray-600 p-2">Service</th>
                  <th className="border-b-2 border-gray-600 p-2">Status</th>
                  <th className="border-b-2 border-gray-600 p-2">3 Months</th>
                  <th className="border-b-2 border-gray-600 p-2">6 Months</th>
                  <th className="border-b-2 border-gray-600 p-2">12 Months</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(historyData.uptimeStats).map(
                  ([serviceName, stats]) => (
                    <tr key={serviceName}>
                      <td className="border-b border-gray-700 p-2">{serviceName}</td>
                      
                      <td className={`border-b border-gray-700 p-2 ${status[serviceName] === 'down' ? 'text-red-500' : 'text-green-500'}`}>{status[serviceName]}</td>
                      <td className="border-b border-gray-700 p-2">{stats.threeMonth}%</td>
                      <td className="border-b border-gray-700 p-2">{stats.sixMonth}%</td>
                      <td className="border-b border-gray-700 p-2">{stats.twelveMonth}%</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Test Mode Indicator */}
          {testMode && (
            <div className="mt-4">
              {calculationsCorrect ? (
                <span className="text-green-500">✔ Calculations are correct.</span>
              ) : (
                <span className="text-red-500">✘ Calculations are incorrect.</span>
              )}
            </div>
          )}
        </>
      ) : (
        <p>Loading data...</p>
      )}
    </main>
  );
};

export default ServerDetailPage;