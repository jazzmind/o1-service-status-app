// app/api/service-history/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';

export async function GET(request) {
  // get services from environment variable or config file
  let services = [];
  const envServices = process.env.SERVICES;
  if (envServices) {
    services = JSON.parse(envServices);
  }
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region');

  // Calculate date ranges for 3, 6, and 12 months
  const endDate = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(endDate.getMonth() - 3);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(endDate.getMonth() - 6);
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(endDate.getFullYear() - 1);

  let filteredServices = services; // Default to all services
  if (region) {
    // Filter services based on the region
    filteredServices = services.filter(
      (service) =>
        service.region && service.region.toLowerCase() === region.toLowerCase()
    );
  } 

  try {
    // Prepare time windows
    const timeWindows = [
      { label: 'threeMonth', startDate: Timestamp.fromDate(threeMonthsAgo) },
      { label: 'sixMonth', startDate: Timestamp.fromDate(sixMonthsAgo) },
      { label: 'twelveMonth', startDate: Timestamp.fromDate(twelveMonthsAgo) },
    ];

    // Initialize uptime statistics
    const uptimeStats = {};
    const overallUptime = {
      threeMonth: 0,
      sixMonth: 0,
      twelveMonth: 0,
    };

    for (const service of filteredServices) {
      uptimeStats[service.name] = {};

      // Fetch status changes for this service over the last 12 months
      const statusChangesQuery = query(
        collection(db, 'statusChanges'),
        where('name', '==', service.name),
        where('timestamp', '>=', twelveMonthsAgo),
        orderBy('timestamp', 'asc')
      );
      const statusChangesSnapshot = await getDocs(statusChangesQuery);

      // Extract status changes
      const statusChanges = [];
      statusChangesSnapshot.forEach((doc) => {
        statusChanges.push(doc.data());
      });

      // Process each time window
      for (const window of timeWindows) {
        const windowStart = window.startDate.toDate();
        const totalDuration = endDate - windowStart;
        let downtimeDuration = 0;

        let lastStatus = 'up';
        let lastTimestamp = windowStart;

        // Filter status changes within the time window
        const windowStatusChanges = statusChanges.filter(
          (change) =>
            change.timestamp.toDate() >= windowStart &&
            change.timestamp.toDate() <= endDate
        );

        // Add a virtual status change at the window start if necessary
        if (
          statusChanges.length > 0 &&
          statusChanges[0].timestamp.toDate() > windowStart
        ) {
          // Fetch the last known status before the window
          const preWindowStatusQuery = query(
            collection(db, 'statusChanges'),
            where('name', '==', service.name),
            where('timestamp', '<', windowStart),
            orderBy('timestamp', 'desc'),
            limit(1)
          );
          const preWindowStatusSnapshot = await getDocs(preWindowStatusQuery);
          if (!preWindowStatusSnapshot.empty) {
            lastStatus = preWindowStatusSnapshot.docs[0].data().status;
          }
        }

        // Process status changes
        for (const change of windowStatusChanges) {
          const changeTime = change.timestamp.toDate();

          if (lastStatus === 'down') {
            downtimeDuration += changeTime - lastTimestamp;
          }

          lastStatus = change.status;
          lastTimestamp = changeTime;
        }

        // Handle time from last status change to end of window
        if (lastStatus === 'down') {
          downtimeDuration += endDate - lastTimestamp;
        }

        const uptimePercentage =
          ((totalDuration - downtimeDuration) / totalDuration) * 100;
        uptimeStats[service.name][window.label] = uptimePercentage.toFixed(2);
      }
    }

    // Calculate overall average uptimes for the region
    const numServices = filteredServices.length;

    timeWindows.forEach((window) => {
      let totalUptime = 0;
      filteredServices.forEach((service) => {
        totalUptime += parseFloat(uptimeStats[service.name][window.label]);
      });
      overallUptime[window.label] = (totalUptime / numServices).toFixed(2);
    });

    return NextResponse.json({
      uptimeStats,
      overallUptime,
    });
  } catch (error) {
    console.error('Error fetching service history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service history.' },
      { status: 500 }
    );
  }
}