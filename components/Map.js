'use client';

import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import ServerIcon from './ServerIcon';

const geoUrl = '/world.json';

const serverLocations = [
  {
    name: 'EUK',
    coordinates: [-0.1276, 51.5074],
    location: 'London',
  },
  {
    name: 'USA',
    coordinates: [-80.4549, 38.5976],
    location: 'West Virginia',
  },
  {
    name: 'AUS',
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
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState({ name: '', location: '', services: [] });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const handleMouseEnter = (server, event) => {
    const { clientX: x, clientY: y } = event;
    setTooltipContent({
      name: server.name,
      location: server.location,
      services: services.filter((s) => s.location === server.location),
    });
    setTooltipPosition({ x, y });
    setTooltipVisible(true);
  };
  
  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  useEffect(() => {
    fetch('/api/service-status')
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services);
      })
      .catch((error) => console.error('Error fetching service status:', error));
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
              fill="transparent"
              stroke="#9CF"
              className='glow'
              />)
            }
          </Geographies>
          {serverLocations.map((server) => (
            <ServerIcon
              key={server.name}
              coordinates={server.coordinates}
              name={server.name}
              location={server.location}
              services={services.filter((s) => s.location === server.location)}
              onMouseEnter={(event) => handleMouseEnter(server, event)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
      </ComposableMap>
      {tooltipVisible && (
        <div
          className="custom-tooltip bg-gray-800 text-white p-2 rounded"
          style={{ top: tooltipPosition.y, left: tooltipPosition.x }}
        >
          <strong>{tooltipContent.name} - {tooltipContent.location}</strong>
          <ul>
            {tooltipContent.services.map((service, index) => (
              <li key={index}>
                {service.name}: {service.status} ({service.responseTime}ms)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Map;