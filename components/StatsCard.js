import React from 'react';

const StatsCard = ({ title, stats }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-md">
      <h2 className="text-xl mb-2">{title}</h2>
      <div className="text-white">
        <p>3 Month Uptime: {stats.threeMonth}%</p>
        <p>6 Month Uptime: {stats.sixMonth}%</p>
        <p>12 Month Uptime: {stats.twelveMonth}%</p>
      </div>
    </div>
  );
};

export default StatsCard;