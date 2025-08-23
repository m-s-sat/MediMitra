import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface TimeAgoProps {
  // Accepts both string and Date objects
  timestamp: string | Date; 
}

const TimeAgo: React.FC<TimeAgoProps> = ({ timestamp }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!timestamp) {
        setTimeAgo('never');
        return;
    };

    const date = new Date(timestamp);
    
    // Function to update the time ago string
    const update = () => {
        setTimeAgo(formatDistanceToNow(date, { addSuffix: true, includeSeconds: true }));
    };
    
    // Set the initial value immediately
    update();

    // Dynamically set the update interval
    const secondsElapsed = (new Date().getTime() - date.getTime()) / 1000;

    // Update every second if it's less than a minute ago, otherwise every minute
    const intervalDuration = secondsElapsed < 60 ? 1000 : 60000;

    const intervalId = setInterval(update, intervalDuration);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [timestamp]);

  return <span>{timeAgo}</span>;
};

export default TimeAgo;