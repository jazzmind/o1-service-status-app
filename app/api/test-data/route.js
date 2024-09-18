// app/api/test-data/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');

  if (mode === 'inject') {
    return injectTestData();
  } else if (mode === 'delete') {
    return deleteData(true);
  } else if (mode === 'clear') {
    return deleteData(false);
  } else if (mode === 'check') {
    // Check if test data exists
    const downtimeCollection = collection(db, 'statusChanges');
    const testDataQuery = query(downtimeCollection, where('isTestData', '==', true));
    const testDataSnapshot = await getDocs(testDataQuery);
  
    const testModeActive = !testDataSnapshot.empty;
  
    return NextResponse.json({ testMode: testModeActive });
  } else {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  }
  
}

async function injectTestData() {
  // get services from environment variable or config file
  let services = [];
  const envServices = process.env.SERVICES;
  if (envServices) {
    services = JSON.parse(envServices);
  }
  try {
    // Define test downtime events
    const testDowntimeEvents = [];
    const now = new Date();
    const threeMonthsAgo = now.getMonth() - 3 < 0 ? new Date(now.getFullYear() - 1, now.getMonth() + 9, now.getDate()) : new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const sixMonthsAgo = now.getMonth() - 6 < 0 ? new Date(now.getFullYear() - 1, now.getMonth() + 6, now.getDate()) : new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    console.log('threeMonthsAgo:', threeMonthsAgo, 'sixMonthsAgo:', sixMonthsAgo, 'twelveMonthsAgo:', twelveMonthsAgo);
    // Example: Create downtime events in each window

    for (const service of services) {
    
        const down = {
            isTestData: true,
            name: service.name,
            status: "down",
            timestamp: Timestamp.fromDate(new Date(twelveMonthsAgo.getTime() + 86400000)),
            responseTime: Math.floor(Math.random() * 1300) + 100,
            location: service.location,
            region: service.region,
        };
        // responseTime is a random number between 100 and 1000
        const up = {
            isTestData: true,
            name: service.name,
            status: "up",
            timestamp: Timestamp.fromDate(new Date(twelveMonthsAgo.getTime() + 172800000)),
            responseTime: Math.floor(Math.random() * 1300) + 100,
            location: service.location,
            region: service.region,
        };
        // Create downtime events at specific intervals
        testDowntimeEvents.push(down);
        testDowntimeEvents.push(up);
        const down2 = { ...down };
        const up2 = { ...up };
        down2.timestamp = Timestamp.fromDate(new Date(sixMonthsAgo.getTime() + 86400000));
        up2.timestamp = Timestamp.fromDate(new Date(sixMonthsAgo.getTime() + 172800000));

        testDowntimeEvents.push(down2);
        testDowntimeEvents.push(up2);

        const down3 = { ...down2 };
        const up3 = { ...up2 };
        down3.timestamp = Timestamp.fromDate(new Date(threeMonthsAgo.getTime() + 86400000));
        up3.timestamp = Timestamp.fromDate(new Date(threeMonthsAgo.getTime() + 172800000));

        testDowntimeEvents.push(down3);
        testDowntimeEvents.push(up3);
    }

    // Add test downtime events to the database
    const downtimeCollection = collection(db, 'statusChanges');
    for (const event of testDowntimeEvents) {
      await addDoc(downtimeCollection, event);
    }

    return NextResponse.json({ message: 'Test data injected successfully.' });
  } catch (error) {
    console.error('Error injecting test data:', error);
    return NextResponse.json({ error: 'Failed to inject test data.' }, { status: 500 });
  }
}

async function deleteData(testData = false) {
  try {
    // Delete test downtime events
    const changesCollection = collection(db, 'statusChanges');
    let dataQuery = null;
    let dataSnapshot = null;
    
    if (testData) {
        dataQuery = query(changesCollection, where('isTestData', '==', true));
    } else {
        dataQuery = query(changesCollection);
    }
    dataSnapshot = await getDocs(dataQuery);

    for (const docSnap of dataSnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }

    return NextResponse.json({ message: 'Data deleted successfully.' });
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json({ error: 'Failed to delete data.' }, { status: 500 });
  }
}
