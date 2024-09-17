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