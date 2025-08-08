import React, { useEffect, useState } from 'react';
import './PriorityBar.scss';

interface PriorityBarProps {
  value: number; // integer value representing priority level
  max?: number; // maximum level to normalize, default 4
}

const getColorClass = (value: number) => {
  if (value <= 1) return 'bg-warning';
  if (value === 2) return 'bg-orange';
  return 'bg-danger';
};

const PriorityBar: React.FC<PriorityBarProps> = ({ value, max = 4 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress((value / max) * 100), 100);
    return () => clearTimeout(timer);
  }, [value, max]);

  return (
    <div className="priority-progress progress">
      <div
        className={`progress-bar ${getColorClass(value)}`}
        role="progressbar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default PriorityBar;
