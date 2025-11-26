import { useState, useEffect } from 'react'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import './App.css'
import DriverList from './components/DriverList'
import SearchBox from './components/SearchBox'
import MobileSearchOverlay from './components/MobileSearchOverlay'

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleMobileSearchOpen = () => {
    setMobileSearchOpen(true);
  };

  const handleMobileSearchClose = () => {
    setMobileSearchOpen(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>F1 Racers</h1>
        {isMobile ? (
          <IconButton
            onClick={handleMobileSearchOpen}
            sx={{
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <SearchIcon />
          </IconButton>
        ) : (
          <SearchBox onSearchChange={handleSearchChange} />
        )}
      </header>
      <main className="app-main">
        <DriverList searchQuery={searchQuery} />
      </main>
      <MobileSearchOverlay
        open={mobileSearchOpen}
        onClose={handleMobileSearchClose}
        onSearchChange={handleSearchChange}
      />
    </div>
  )
}

export default App
