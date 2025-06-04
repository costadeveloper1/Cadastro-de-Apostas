import React from 'react';

const StatsCard = ({ title, value, icon, color = 'text-yellow-400', textSize = 'text-sm', valueSize = 'text-xl' }) => {
  return (
    <div className="bg-green-400 p-3 rounded-lg shadow-md flex items-center space-x-3">
      <div className={`p-2 rounded-full bg-green-300 ${color}`}>
        {icon} 
      </div>
      <div>
        <p className={`font-medium text-green-700 ${textSize}`}>{title}</p>
        <p className={`font-bold text-green-800 ${valueSize}`}>{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
