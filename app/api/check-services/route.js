import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export async function GET() {
  // get services from environment variable or config file
  let services = [];
  const envServices = process.env.SERVICES;
  if (envServices) {
    services = JSON.parse(envServices);
  }
  let output = [];
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
        output.push({ name: service.name, url, status: 'down', response: response.text(), error: error.message });
        console.error(`Error fetching ${service.name} with URL ${service.url}`);
      }
      output.push({ name: service.name, url, status, responseTime, response: response.text()});
      // first retrieve the most recent status record for this service - just get a single record
      const statusCollectionRef = collection(db, 'statusChanges');
      const statusQuery = query(
        statusCollectionRef,
        where('name', '==', service.name),
        orderBy('timestamp', 'desc'),
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
          url: service.url,
          status: status,
          responseTime: Number(responseTime),
          timestamp: new Date(),
          location: service.location,
          region: service.region,
        });
      }
    
    }

    return NextResponse.json({ message: 'Services checked successfully.', response: output });
  } catch (error) {
    console.error('Error checking services:', error);
    return NextResponse.json({ error: 'Failed to check services.', response: output }, { status: 500 });
  }
}