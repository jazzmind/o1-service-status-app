import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import services from '@/config/services.json'; // Assuming services is an array of service objects

export async function GET() {
  try {
    for (const service of services) {
      let response = null;
      let responseTime = 0;
      let status = 'down';
      try {
        const startTime = Date.now();
        response = await fetch(service.url);
        const endTime = Date.now();
        responseTime = endTime - startTime;
   
        switch (service.type) {
          case 'json':
            const data = await response.json();
            if (JSON.stringify(data) === JSON.stringify(service.expectedResponse)) {
              status = 'up';
            }
            break;
          case 'http_status':
            if (response.status === service.expectedResponse) {
              status = 'up';
            }
            break;
          case 'json_key':
            const jsonData = await response.json();
            if (jsonData[service.expectedResponseKey] === service.expectedResponseValue) {
              status = 'up';
            }
            break;
          case 'text':
            const textData = await response.text();
            if (textData.includes(service.expectedResponseText)) {
              status = 'up';
            }
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${service.name} with URL ${service.url}`);
      }
      console.log(`Service: ${service.name}, Status: ${status}, Response Time: ${responseTime}ms`);
      // first retrieve the most recent status record for this service - just get a single record
      const statusCollectionRef = collection(db, 'status');
      const statusQuery = query(
        statusCollectionRef,
        where('name', '==', service.name),
        orderBy('lastChecked', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(statusQuery);
      let mostRecentStatus = null;

      querySnapshot.forEach((doc) => {
        mostRecentStatus = doc.data();
      });

      let previousStatus = 'unknown';
      if (mostRecentStatus) {
        previousStatus = mostRecentStatus.status;
      }

      if (status !== previousStatus) {
        // Status has changed, record the change
        await addDoc(collection(db, 'statusChanges'), {
          name: service.name,
          status: status,
          timestamp: new Date(),
          location: service.location,
          region: service.region,
        });
      }

      // now store the status in the status collection
      await addDoc(collection(db, 'status'), {
        name: service.name,
        url: service.url,
        status: status,
        responseTime: Number(responseTime),
        lastChecked: new Date(),
        location: service.location,
        region: service.region,
      });
    
    }

    return NextResponse.json({ message: 'Services checked successfully.' });
  } catch (error) {
    console.error('Error checking services:', error);
    return NextResponse.json({ error: 'Failed to check services.' }, { status: 500 });
  }
}