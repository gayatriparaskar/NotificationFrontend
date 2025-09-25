import React from 'react';

const WhatsAppBadge = ({ count, className = "" }) => {
  if (count === 0) {
    return (
      <span className={`absolute -top-1 -right-1 bg-gray-400 text-white text-xs rounded-full h-2 w-2 ${className}`}></span>
    );
  }

  return (
    <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold animate-pulse shadow-lg px-1 ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default WhatsAppBadge;
