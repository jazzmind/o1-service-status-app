import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, 'status'));
    const services = [];
    querySnapshot.forEach((doc) => {
      services.push({ name: doc.name, ...doc.data() });
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching service status:', error);
    return NextResponse.json({ error: 'Failed to fetch service status.' }, { status: 500 });
  }
}