import StandingsDisplay from './StandingsDisplay';
import ChampionBadge from './ChampionBadge';
import './DriverCard.css';

const DriverCard = ({ driver }) => {
  const {
    name,
    nationality,
    team,
    isWorldChampion,
    championshipYears,
    currentStanding
  } = driver;

  return (
    <div className="driver-card">
      <div className="driver-header">
        <h2 className="driver-name">{name}</h2>
        <StandingsDisplay position={currentStanding} />
      </div>
      
      <div className="driver-details">
        <p className="driver-info">
          <span className="info-label">Nationality:</span>
          <span className="info-value">{nationality}</span>
        </p>
        <p className="driver-info">
          <span className="info-label">Team:</span>
          <span className="info-value">{team}</span>
        </p>
      </div>

      {isWorldChampion && (
        <ChampionBadge championshipYears={championshipYears} />
      )}
    </div>
  );
};

export default DriverCard;
