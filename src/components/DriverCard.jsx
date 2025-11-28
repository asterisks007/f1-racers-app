import { useState, useRef, useEffect } from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import StandingsDisplay from './StandingsDisplay';
import ChampionBadge from './ChampionBadge';
import { isLowEndDevice } from '../utils/deviceDetection';
import { getDriverImage, getTeamCarImage } from '../services/imageService';
import './DriverCard.css';

const DriverCard = ({ driver }) => {
  const {
    id,
    name,
    nationality,
    team,
    teamId,
    currentYear,
    isWorldChampion,
    championshipYears,
    currentStanding,
    imageUrl
  } = driver;

  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [isInView, setIsInView] = useState(false);
  const [optimizedImageUrl, setOptimizedImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [carImageError, setCarImageError] = useState(false);
  const [optimizedCarImageUrl, setOptimizedCarImageUrl] = useState(null);
  const [carImageLoading, setCarImageLoading] = useState(false);
  const [carImageSrc, setCarImageSrc] = useState(null);
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const carImageRef = useRef(null);
  const placeholderImage = '/driver-placeholder.svg';
  const reducedAnimations = isLowEndDevice();

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!imageRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading slightly before image enters viewport
      }
    );

    observer.observe(imageRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Fetch and optimize driver image when component mounts
  useEffect(() => {
    const fetchOptimizedImage = async () => {
      if (!id || !name) return;
      
      setImageLoading(true);
      
      try {
        const optimizedUrl = await getDriverImage(id, name);
        
        if (optimizedUrl) {
          setOptimizedImageUrl(optimizedUrl);
        } else {
          // If no image from Wikimedia, fall back to provided imageUrl or placeholder
          setOptimizedImageUrl(imageUrl || null);
        }
      } catch (error) {
        console.error(`Error fetching optimized image for ${name}:`, error);
        setOptimizedImageUrl(imageUrl || null);
      } finally {
        setImageLoading(false);
      }
    };
    
    fetchOptimizedImage();
  }, [id, name, imageUrl]);

  // Fetch and optimize team car image when component mounts
  useEffect(() => {
    const fetchOptimizedCarImage = async () => {
      if (!teamId || !team || !currentYear) return;
      
      setCarImageLoading(true);
      
      try {
        const optimizedUrl = await getTeamCarImage(teamId, team, currentYear);
        
        if (optimizedUrl) {
          setOptimizedCarImageUrl(optimizedUrl);
        } else {
          // No car image available - graceful degradation
          setOptimizedCarImageUrl(null);
        }
      } catch (error) {
        console.error(`Error fetching team car image for ${team} ${currentYear}:`, error);
        setOptimizedCarImageUrl(null);
      } finally {
        setCarImageLoading(false);
      }
    };
    
    fetchOptimizedCarImage();
  }, [teamId, team, currentYear]);

  // Load driver image when in view
  useEffect(() => {
    if (isInView && optimizedImageUrl && !imageError) {
      setImageSrc(optimizedImageUrl);
    } else if (isInView && !optimizedImageUrl && !imageLoading) {
      // If no optimized image and not loading, use placeholder
      setImageSrc(placeholderImage);
    }
  }, [isInView, optimizedImageUrl, imageError, imageLoading]);

  // Load car image when in view
  useEffect(() => {
    if (isInView && optimizedCarImageUrl && !carImageError) {
      setCarImageSrc(optimizedCarImageUrl);
    }
  }, [isInView, optimizedCarImageUrl, carImageError]);

  const handleImageError = () => {
    setImageError(true);
    setImageSrc(placeholderImage);
  };

  const handleCarImageError = () => {
    setCarImageError(true);
    setCarImageSrc(null);
  };

  const handleTouchStart = (e) => {
    // Prevent default to avoid unwanted gestures
    e.stopPropagation();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Toggle expanded state on tap
    setIsExpanded(prev => !prev);
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
    <ButtonBase
      component="div"
      sx={{
        width: '100%',
        display: 'block',
        textAlign: 'inherit',
        borderRadius: '12px',
      }}
      TouchRippleProps={{
        style: {
          color: '#e10600',
        }
      }}
    >
      <div 
        className={`driver-card ${isExpanded ? 'expanded' : ''} ${reducedAnimations ? 'reduced-motion' : ''}`}
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Compact View - Always Visible */}
        <div className="driver-compact-view">
        <div className="driver-image-container" ref={imageRef}>
          {imageLoading && !imageSrc ? (
            <div className="image-loading-placeholder">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <img 
              src={imageSrc || placeholderImage}
              alt={`${name} portrait`}
              className="driver-image"
              onError={handleImageError}
              loading="lazy"
            />
          )}
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

        {/* Team Car Image */}
        {optimizedCarImageUrl && (
          <div className="team-car-container" ref={carImageRef}>
            {carImageLoading && !carImageSrc ? (
              <div className="car-image-loading-placeholder">
                <div className="loading-spinner"></div>
              </div>
            ) : carImageSrc ? (
              <img 
                src={carImageSrc}
                alt={`${team} ${currentYear} F1 car`}
                className="team-car-image"
                onError={handleCarImageError}
                loading="lazy"
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
    </ButtonBase>
  );
};

export default DriverCard;
