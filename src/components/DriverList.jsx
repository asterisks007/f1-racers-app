import { useState, useEffect } from 'react';
import { getDrivers, searchDrivers } from '../services/driverService';
import DriverCard from './DriverCard';
import './DriverList.css';

const DriverList = ({ searchQuery = '' }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDrivers();
        setDrivers(data);
      } catch (err) {
        setError('Failed to load driver data. Please try again later.');
        console.error('Error fetching drivers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  if (loading) {
    return <div className="loading-message">Loading drivers...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!drivers || drivers.length === 0) {
    return <div className="no-data-message">No driver data available.</div>;
  }

  // Filter drivers based on search query
  const filteredDrivers = searchDrivers(drivers, searchQuery);

  if (filteredDrivers.length === 0) {
    return <div className="no-data-message">No drivers found matching your search.</div>;
  }

  return (
    <div className="driver-list">
      {filteredDrivers.map((driver) => {
        // Handle missing or incomplete driver data gracefully
        if (!driver || !driver.id) {
          return null;
        }
        
        return <DriverCard key={driver.id} driver={driver} />;
      })}
    </div>
  );
};

export default DriverList;
