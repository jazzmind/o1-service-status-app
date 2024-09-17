import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const startDate = new Date(searchParams.get('startDate'));
  const endDate = new Date(searchParams.get('endDate'));

  try {
    const q = query(
      collection(db, 'status'),
      where('location', '==', location),
      where('lastChecked', '>=', startDate),
      where('lastChecked', '<=', endDate)
    );

    const querySnapshot = await getDocs(q);
    const records = [];

    querySnapshot.forEach((doc) => {
      records.push(doc.data());
    });

    // Combine sequential downtime records
    const combinedRecords = combineDowntimeRecords(records);

    return NextResponse.json({ history: combinedRecords });
  } catch (error) {
    console.error('Error fetching service history:', error);
    return NextResponse.json({ error: 'Failed to fetch service history.' }, { status: 500 });
  }
}

// Helper function to combine sequential downtime records
function combineDowntimeRecords(records) {
  if (records.length === 0) return [];

  // Sort records by startTime
  records.sort((a, b) => a.startTime - b.startTime);

  const combined = [];
  let prevRecord = records[0];

  for (let i = 1; i < records.length; i++) {
    const currentRecord = records[i];
    if (prevRecord.endTime >= currentRecord.startTime) {
      // Extend the endTime
      prevRecord.endTime = currentRecord.endTime;
    } else {
      combined.push(prevRecord);
      prevRecord = currentRecord;
    }
  }
  combined.push(prevRecord);
  return combined;
}