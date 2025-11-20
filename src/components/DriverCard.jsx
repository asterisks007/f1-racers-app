import { useState, useRef } from 'react';
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
    currentStanding,
    imageUrl
  } = driver;

  const [imageError, setImageError] = useState(false);
  const cardRef = useRef(null);
  const placeholderImage = '/driver-placeholder.svg';

  const handleImageError = () => {
    setImageError(true);
  };

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    
    // Small delay to allow expansion animation to start
    setTimeout(() => {
      try {
        const card = cardRef.current;
        if (!card) return;
        
        const viewportHeight = window.innerHeight;
        const gridContainer = card.parentElement;
        if (!gridContainer) return;
        
        // Get all cards in the grid
        const allCards = Array.from(gridContainer.children);
        const cardIndex = allCards.indexOf(card);
        if (cardIndex === -1) return;
        
        // Calculate which row this card is in
        const cardsPerRow = window.innerWidth > 1400 ? 4 : 
                           window.innerWidth > 1024 ? 3 : 
                           window.innerWidth > 768 ? 2 : 1;
        const rowIndex = Math.floor(cardIndex / cardsPerRow);
        
        // Get all cards in the same row
        const rowStartIndex = rowIndex * cardsPerRow;
        const rowEndIndex = Math.min(rowStartIndex + cardsPerRow - 1, allCards.length - 1);
        const firstCardInRow = allCards[rowStartIndex];
        
        if (!firstCardInRow) return;
        
        // Get the bounding rectangle for the first card in row
        const firstCardRect = firstCardInRow.getBoundingClientRect();
        
        // Calculate the row's dimensions (accounting for expanded height)
        const expandedHeight = 420; // Slightly more than min-height to account for content
        const rowTop = firstCardRect.top;
        const rowBottom = rowTop + expandedHeight;
        
        // Get header height (sticky header)
        const header = document.querySelector('.app-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const availableViewportTop = headerHeight + 10; // Minimal padding
        const availableViewportBottom = viewportHeight - 10; // Minimal padding
        
        // Determine if scrolling is needed
        const needsScroll = rowTop < availableViewportTop || rowBottom > availableViewportBottom;
        
        if (needsScroll) {
          // Calculate optimal scroll position to show the row
          const targetScrollY = window.scrollY + rowTop - availableViewportTop;
          window.scrollTo({
            top: Math.max(0, targetScrollY),
            behavior: 'smooth'
          });
        }
      } catch (error) {
        // Silently fail if there's any error - don't break the hover
        console.error('Scroll adjustment error:', error);
      }
    }, 150); // Slightly longer delay for more reliable expansion
  };

  return (
    <div 
      className="driver-card" 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
    >
      {/* Compact View - Always Visible */}
      <div className="driver-compact-view">
        <div className="driver-image-container">
          <img 
            src={imageError || !imageUrl ? placeholderImage : imageUrl}
            alt={`${name} portrait`}
            className="driver-image"
            onError={handleImageError}
          />
        </div>
        <h2 className="driver-name">{name}</h2>
        <div className="standings-wrapper">
          <StandingsDisplay position={currentStanding} />
        </div>
      </div>

      {/* Expanded View - Visible on Hover */}
      <div className="driver-expanded-view">
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
    </div>
  );
};

export default DriverCard;
