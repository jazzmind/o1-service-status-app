import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// get the most recent records for each service
export async function GET(request) {
  let services = process.env.SERVICES ? JSON.parse(process.env.SERVICES) : [];
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region');
  if (region) {
    services = services.filter(service => service.region && service.region.toLowerCase() === region.toLowerCase());
  }
  let response = [];
  try {
    for (const service of services) {
      const statusCollectionRef = collection(db, 'statusChanges');
      const statusQuery = query(statusCollectionRef, 
        where('name', '==', service.name), 
        orderBy('timestamp', 'desc'), 
        limit(1));
      const querySnapshot = await getDocs(statusQuery);
      querySnapshot.forEach((doc) => {
        response.push({ name: doc.name, ...doc.data() });
      });
    }
    return NextResponse.json({ services: response  });
  } catch (error) {
    console.error('Error fetching service status:', error);
    return NextResponse.json({ error: 'Failed to fetch service status.' }, { status: 500 });
  }
}