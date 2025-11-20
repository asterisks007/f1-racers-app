import { useState } from 'react'
import './App.css'
import DriverList from './components/DriverList'
import SearchBox from './components/SearchBox'

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>F1 Racers</h1>
        <SearchBox onSearchChange={handleSearchChange} />
      </header>
      <main className="app-main">
        <DriverList searchQuery={searchQuery} />
      </main>
    </div>
  )
}

export default App
