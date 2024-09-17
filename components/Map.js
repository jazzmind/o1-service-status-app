'use client';

import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import ServerIcon from './ServerIcon';

const geoUrl = '/world.json';

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
      <ComposableMap projectionConfig={{ scale: 200, center: [10, -0] }}
      style={{ width: '100%', height: '100%' }}
>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => <Geography 
            key={geo.rsmKey} 
            geography={geo} 
            fill="#000"
            stroke="#9CF"
            className='glow'
            />)
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