import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';

const services = [
  {
    name: 'Global Login API',
    url: 'https://login-api.practera.com/stack',
    expectedResponse: { message: 'Stack not found' },
    type: 'json',
    location: 'Atlantic Ocean',
  },
  {
    name: 'Global Login App',
    url: 'https://login.practera.com',
    expectedResponse: 200,
    type: 'http_status',
    location: 'Atlantic Ocean',
  },
  {
    name: 'USA Admin API',
    url: 'https://usa.practera.com/api/health?appkey=1234',
    expectedResponseKey: 'status',
    expectedResponseValue: 'success',
    type: 'json_key',
    location: 'West Virginia',
  },
  {
    name: 'USA Admin Web App',
    url: 'https://usa.practera.com/lti/providers/request',
    expectedResponseText: 'Missing consumer key',
    type: 'text',
    location: 'West Virginia',
  },
  // Add more services as needed
];

export async function GET() {
  try {
    for (const service of services) {
      const response = await fetch(service.url);
      let status = 'down';
      let responseTime = response.headers.get('x-response-time') || 0;

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

      // Store or update the status in Firestore
      const serviceRef = doc(db, 'status', service.name);
      const docSnap = await getDoc(serviceRef);

      if (docSnap.exists()) {
        await updateDoc(serviceRef, {
          status,
          responseTime: Number(responseTime),
          lastChecked: new Date(),
        });
      } else {
        await addDoc(collection(db, 'status'), {
          name: service.name,
          url: service.url,
          status,
          responseTime: Number(responseTime),
          lastChecked: new Date(),
          location: service.location,
        });
      }
    }

    return NextResponse.json({ message: 'Services checked successfully.' });
  } catch (error) {
    console.error('Error checking services:', error);
    return NextResponse.json({ error: 'Failed to check services.' }, { status: 500 });
  }
}