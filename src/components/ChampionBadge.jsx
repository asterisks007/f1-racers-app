import './ChampionBadge.css';

const ChampionBadge = ({ championshipYears }) => {
  if (!championshipYears || championshipYears.length === 0) {
    return null;
  }

  const yearsDisplay = championshipYears.join(', ');
  const championCount = championshipYears.length;

  return (
    <div className="champion-badge">
      <span className="champion-icon">🏆</span>
      <div className="champion-info">
        <span className="champion-title">
          {championCount}x World Champion
        </span>
        <span className="champion-years">{yearsDisplay}</span>
      </div>
    </div>
  );
};

export default ChampionBadge;
