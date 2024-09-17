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
import services from '@/config/services.json'; // Assuming services is an array of service objects

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');

  if (mode === 'inject') {
    return injectTestData();
  } else if (mode === 'delete') {
    return deleteTestData();
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
  try {
    // Define test downtime events
    const testDowntimeEvents = [];
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setFullYear(now.getFullYear() - 1);

    // Example: Create downtime events in each window

    for (const service of services) {
    
        const down = {
            isTestData: true,
            name: service.name,
            status: "down",
            timestamp: Timestamp.fromDate(new Date(twelveMonthsAgo.getTime() + 86400000)),
            location: service.location,
            region: service.region,
        };

        const up = {
            isTestData: true,
            name: service.name,
            status: "up",
            timestamp: Timestamp.fromDate(new Date(twelveMonthsAgo.getTime() + 172800000)),
            location: service.location,
            region: service.region,
        };
        // Create downtime events at specific intervals
        testDowntimeEvents.push(down);
        testDowntimeEvents.push(up);

        down.timestamp = Timestamp.fromDate(new Date(sixMonthsAgo.getTime() + 86400000));
        up.timestamp = Timestamp.fromDate(new Date(sixMonthsAgo.getTime() + 172800000));
        testDowntimeEvents.push(down);
        testDowntimeEvents.push(up);

        down.timestamp = Timestamp.fromDate(new Date(threeMonthsAgo.getTime() + 86400000));
        up.timestamp = Timestamp.fromDate(new Date(threeMonthsAgo.getTime() + 172800000));
        testDowntimeEvents.push(down);
        testDowntimeEvents.push(up);
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

async function deleteTestData() {
  try {
    // Delete test downtime events
    const downtimeCollection = collection(db, 'statusChanges');
    const testDataQuery = query(downtimeCollection, where('isTestData', '==', true));
    const testDataSnapshot = await getDocs(testDataQuery);

    for (const docSnap of testDataSnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }

    const downtimeCollection2 = collection(db, 'status');
    const testDataQuery2 = query(downtimeCollection2, where('isTestData', '==', true));
    const testDataSnapshot2 = await getDocs(testDataQuery2);

    for (const docSnap of testDataSnapshot2.docs) {
      await deleteDoc(docSnap.ref);
    }

    return NextResponse.json({ message: 'Test data deleted successfully.' });
  } catch (error) {
    console.error('Error deleting test data:', error);
    return NextResponse.json({ error: 'Failed to delete test data.' }, { status: 500 });
  }
}