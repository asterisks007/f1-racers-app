import './StandingsDisplay.css';

const StandingsDisplay = ({ position }) => {
  const formatPosition = (pos) => {
    if (pos === 0) return 'N/A';
    
    const suffix = ['th', 'st', 'nd', 'rd'];
    const value = pos % 100;
    
    return pos + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
  };

  return (
    <div className="standings-display">
      <span className="standings-label">Standing:</span>
      <span className="standings-position">{formatPosition(position)}</span>
    </div>
  );
};

export default StandingsDisplay;
