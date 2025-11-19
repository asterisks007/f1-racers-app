import './App.css'
import DriverList from './components/DriverList'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>F1 Racers</h1>
      </header>
      <main className="app-main">
        <DriverList />
      </main>
    </div>
  )
}

export default App
