Certainly! Let's work together to build your server status tracking app using Next.js 13 with the `app` directory (the latest at the time of writing), Tailwind CSS for styling, and Firebase for the backend. We'll structure the app to follow best practices, ensure it's well-documented, and make it visually appealing.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Setting Up the Project](#setting-up-the-project)
4. [Backend Implementation](#backend-implementation)
   - [/api/check-services](#apicheck-services)
   - [/api/service-status](#apiservice-status)
   - [/api/service-history](#apiservice-history)
5. [Frontend Implementation](#frontend-implementation)
   - [Main Page (World Map)](#main-page-world-map)
   - [Server Detail Page](#server-detail-page)
6. [Styling with Tailwind CSS](#styling-with-tailwind-css)
7. [Deployment Instructions](#deployment-instructions)
8. [Conclusion](#conclusion)

---

## Project Overview

We'll create a server status tracking app that checks various web services every 5 minutes, stores their status in Firebase Firestore, and displays the status on a visually appealing world map. Users can click on server icons to view detailed historical data and uptime statistics.

---

## Folder Structure

Here's the recommended folder structure for a Next.js 13 project using the `app` directory:

```
your-project/
├── app/
│   ├── api/
│   │   ├── check-services/route.js
│   │   ├── service-status/route.js
│   │   └── service-history/route.js
│   ├── globals.css
│   ├── layout.js
│   ├── page.js
│   └── [region]/
│       └── page.js
├── components/
│   ├── Map.js
│   ├── ServerIcon.js
│   └── StatsCard.js
├── lib/
│   └── firebase.js
├── public/
│   └── images/
├── .env.local
├── next.config.js
├── package.json
└── tailwind.config.js
```

- `app/`: Contains all the Next.js pages and API routes.
- `components/`: Reusable React components.
- `lib/`: Utility libraries (e.g., Firebase configuration).
- `public/`: Static assets like images.
- `.env.local`: Environment variables (not checked into source control).

---

## Setting Up the Project

1. **Initialize the Next.js Project**

   ```bash
   npx create-next-app@latest your-project
   cd your-project
   ```

2. **Install Dependencies**

   ```bash
   npm install firebase tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Configure Tailwind CSS**

   Update `tailwind.config.js`:

   ```js
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     content: [
       './app/**/*.{js,ts,jsx,tsx}',
       './components/**/*.{js,ts,jsx,tsx}',
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   };
   ```

4. **Set Up Firebase**

   Install Firebase:

   ```bash
   npm install firebase
   ```

   Create `lib/firebase.js`:

   ```js
   // lib/firebase.js
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: process.env.FIREBASE_API_KEY,
     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
     projectId: process.env.FIREBASE_PROJECT_ID,
     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.FIREBASE_APP_ID,
   };

   const app = initializeApp(firebaseConfig);
   const db = getFirestore(app);

   export { db };
   ```

5. **Set Up Environment Variables**

   Create a `.env.local` file at the root:

   ```bash
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

   **Note:** Replace the placeholders with your actual Firebase credentials.

---

## Backend Implementation

### /api/check-services

This endpoint checks the status of predefined services and stores the results in Firestore.

```js
// app/api/check-services/route.js
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
      const serviceRef = doc(db, 'services', service.name);
      const docSnap = await getDoc(serviceRef);

      if (docSnap.exists()) {
        await updateDoc(serviceRef, {
          status,
          responseTime: Number(responseTime),
          lastChecked: new Date(),
        });
      } else {
        await addDoc(collection(db, 'services'), {
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
```

**Explanation:**

- We loop through each service, make a fetch request, and determine if the service is up or down based on the expected response.
- We store the status, response time, and last checked time in Firestore.
- We also handle updating existing records or creating new ones.

### /api/service-status

This endpoint retrieves the current status of each service.

```js
// app/api/service-status/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, 'services'));
    const services = [];
    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching service status:', error);
    return NextResponse.json({ error: 'Failed to fetch service status.' }, { status: 500 });
  }
}
```

**Explanation:**

- Fetches all documents from the `services` collection in Firestore.
- Returns the list of services with their current status.

### /api/service-history

This endpoint retrieves historical downtime records for each service, combining sequential downtime records.

```js
// app/api/service-history/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const serviceName = searchParams.get('service');
  const startDate = new Date(searchParams.get('startDate'));
  const endDate = new Date(searchParams.get('endDate'));

  try {
    const q = query(
      collection(db, 'downtimeRecords'),
      where('service', '==', serviceName),
      where('startTime', '>=', startDate),
      where('endTime', '<=', endDate)
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
```

**Explanation:**

- Accepts query parameters for `service`, `startDate`, and `endDate`.
- Fetches downtime records for the specified service and date range.
- Combines sequential downtime records into single records with combined duration.

---

## Frontend Implementation

### Main Page (World Map)

We'll use a world map component with server icons. We'll use an open-source React map library like `react-simple-maps`.

1. **Install Dependencies**

   ```bash
   npm install react-simple-maps d3-geo
   ```

2. **Create the Map Component**

```js
// components/Map.js
'use client';

import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import ServerIcon from './ServerIcon';

const geoUrl =
  'https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json';

const serverLocations = [
  {
    name: 'London',
    coordinates: [-0.1276, 51.5074],
    location: 'London',
  },
  {
    name: 'West Virginia',
    coordinates: [-80.4549, 38.5976],
    location: 'West Virginia',
  },
  {
    name: 'Sydney',
    coordinates: [151.2093, -33.8688],
    location: 'Sydney',
  },
  {
    name: 'Global',
    coordinates: [-30.0, 0.0],
    location: 'Atlantic Ocean',
  },
];

const Map = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch('/api/service-status')
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services);
      });
  }, []);

  return (
    <div className="w-full h-full">
      <ComposableMap projectionConfig={{ scale: 200 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo} />)
          }
        </Geographies>
        {serverLocations.map((server) => (
          <ServerIcon
            key={server.name}
            coordinates={server.coordinates}
            location={server.location}
            services={services.filter((s) => s.location === server.location)}
          />
        ))}
      </ComposableMap>
    </div>
  );
};

export default Map;
```

**Explanation:**

- Uses `react-simple-maps` to render a world map.
- Defines server locations with coordinates.
- Fetches service statuses from the API.
- Renders `ServerIcon` components at specified coordinates.

3. **Create the ServerIcon Component**

```js
// components/ServerIcon.js
'use client';

import React from 'react';
import { Marker } from 'react-simple-maps';
import { useRouter } from 'next/navigation';

const ServerIcon = ({ coordinates, location, services }) => {
  const router = useRouter();

  // Determine status color
  let status = 'green';
  let averageResponseTime = 0;
  services.forEach((service) => {
    if (service.status !== 'up') {
      status = 'red';
    }
    averageResponseTime += service.responseTime;
  });
  averageResponseTime = averageResponseTime / services.length;
  if (averageResponseTime > 1000) {
    status = 'yellow';
  }

  return (
    <Marker coordinates={coordinates}>
      <circle
        r={10}
        fill={status}
        stroke="#fff"
        strokeWidth={2}
        onClick={() => router.push(`/${location.toLowerCase().replace(' ', '-')}`)}
        className="cursor-pointer animate-pulse"
      />
    </Marker>
  );
};

export default ServerIcon;
```

**Explanation:**

- Uses the `Marker` component to place a clickable circle on the map.
- Determines the status color based on service status and response time.
- Navigates to the server detail page on click.

4. **Create the Main Page**

```js
// app/page.js
import Map from '@/components/Map';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <h1 className="text-center text-3xl py-4">Server Status Map</h1>
      <div className="w-full h-[80vh]">
        <Map />
      </div>
      <div className="flex justify-around py-4">
        {/* Add StatsCard components here */}
      </div>
    </main>
  );
}
```

**Explanation:**

- Sets up the main page with a title and the `Map` component.
- Placeholder for average uptime statistics.

5. **Create the StatsCard Component**

```js
// components/StatsCard.js
import React from 'react';

const StatsCard = ({ title, stats }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-md">
      <h2 className="text-xl mb-2">{title}</h2>
      <p>3 Month Uptime: {stats.threeMonth}%</p>
      <p>6 Month Uptime: {stats.sixMonth}%</p>
      <p>12 Month Uptime: {stats.twelveMonth}%</p>
    </div>
  );
};

export default StatsCard;
```

**Explanation:**

- Displays uptime statistics.
- You can fetch and pass the actual stats from the backend.

### Server Detail Page

Create dynamic routes for each server location.

1. **Create the Server Detail Page**

```js
// app/[region]/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const ServerDetailPage = () => {
  const params = useParams();
  const region = params.region.replace('-', ' ');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Fetch service history
    const fetchHistory = async () => {
      const res = await fetch(
        `/api/service-history?service=${region}&startDate=2023-01-01&endDate=2023-12-31`
      );
      const data = await res.json();
      setHistory(data.history);
    };

    // Fetch uptime statistics
    const fetchStats = async () => {
      // Implement the logic to fetch and calculate uptime statistics
      setStats({
        threeMonth: 99.9,
        sixMonth: 99.8,
        twelveMonth: 99.7,
      });
    };

    fetchHistory();
    fetchStats();
  }, [region]);

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl mb-4">Server Details - {region}</h1>
      <div className="mb-8">
        <h2 className="text-2xl">Uptime Statistics</h2>
        <p>3 Month Uptime: {stats.threeMonth}%</p>
        <p>6 Month Uptime: {stats.sixMonth}%</p>
        <p>12 Month Uptime: {stats.twelveMonth}%</p>
      </div>
      <div>
        <h2 className="text-2xl mb-4">Historical Downtime Events</h2>
        {history.length > 0 ? (
          <ul>
            {history.map((event, index) => (
              <li key={index}>
                {new Date(event.startTime.seconds * 1000).toLocaleString()} -{' '}
                {new Date(event.endTime.seconds * 1000).toLocaleString()} (Duration:{' '}
                {((event.endTime.seconds - event.startTime.seconds) / 60).toFixed(2)} minutes)
              </li>
            ))}
          </ul>
        ) : (
          <p>No downtime events recorded.</p>
        )}
      </div>
    </main>
  );
};

export default ServerDetailPage;
```

**Explanation:**

- Retrieves the region from the URL.
- Fetches service history and uptime statistics.
- Displays historical downtime events and uptime statistics.

---

## Styling with Tailwind CSS

We'll use Tailwind CSS to style the app to look like the NORAD map in the "Wargames" movie.

- **Background:** Use a dark background (`bg-black`) to mimic the control room ambiance.
- **Text:** Use bright, contrasting colors like green (`text-green-500`) for statuses.
- **Animations:** Use `animate-pulse` for pulsing server icons.
- **Fonts:** Choose a monospaced font to give a terminal-like feel.

Update `app/globals.css` to include custom fonts and styles:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply font-mono;
}
```

---

## Deployment Instructions

1. **Push Code to GitHub**

   Ensure your code is in a GitHub repository.

2. **Set Up Vercel Account**

   - Sign up at [Vercel](https://vercel.com/) if you haven't already.
   - Import your GitHub repository into Vercel.

3. **Set Environment Variables on Vercel**

   - Go to your project settings in Vercel.
   - Under "Environment Variables," add the same variables from your `.env.local` file.

4. **Configure Firebase**

   - Ensure your Firebase project allows connections from Vercel's domains.
   - Update Firebase Firestore rules if necessary to allow read/write access.

5. **Deploy**

   - Trigger a deployment in Vercel.
   - Vercel will build and deploy your Next.js app.

---

## Conclusion

We've built a server status tracking app with:

- **Backend API Endpoints:**
  - `/api/check-services`: Checks service statuses and stores them in Firestore.
  - `/api/service-status`: Retrieves current service statuses.
  - `/api/service-history`: Retrieves historical downtime events.

- **Frontend Components:**
  - **World Map:** Displays server statuses with clickable icons.
  - **Server Detail Page:** Shows historical data and uptime statistics.

- **Styling:** Tailwind CSS is used to create a visually appealing interface inspired by the NORAD map.

- **Deployment:** Instructions provided for deploying to Vercel.

---

## Additional Notes

- **Best Practices:**
  - Used Next.js 13 with the `app` directory for the latest features.
  - Separated components for reusability and clarity.
  - Read Firebase credentials from environment variables for security.
  - Included comments and explanations for better understanding.

- **Enhancements:**
  - Implement caching or state management with React Context or Redux if needed.
  - Add authentication if you want to restrict access to certain endpoints.
  - Improve error handling and loading states on the frontend.

- **Open Source Considerations:**
  - Include a `README.md` with project description and setup instructions.
  - Add a license file (e.g., MIT License) to define usage terms.
  - Ensure all third-party libraries are properly licensed for open-source use.

---

Feel free to customize and extend this foundation to meet your specific needs. Let me know if you need further assistance or have any questions!