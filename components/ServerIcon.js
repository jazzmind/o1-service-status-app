'use client';

import React from 'react';
import { Marker } from 'react-simple-maps';
import { useRouter } from 'next/navigation';

const ServerIcon = ({ coordinates, name, location, services, onMouseEnter, onMouseLeave }) => {
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
  if (averageResponseTime > 1000 && status !== 'red') {
    status = 'yellow';
  }

  return (
    <>
      <Marker coordinates={coordinates}>
        <circle
          r={10}
          fill={status}
          stroke="#fff"
          strokeWidth={2}
          onClick={() => router.push(`/${name.toLowerCase().replace(' ', '-')}/${location.toLowerCase().replace(' ', '-')}`)}
          className="cursor-pointer animate-pulse"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      </Marker>
    </>
  );
};

export default ServerIcon;