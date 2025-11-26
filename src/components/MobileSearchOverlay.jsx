import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import './MobileSearchOverlay.css';

const MobileSearchOverlay = ({ open, onClose, onSearchChange }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          background: 'linear-gradient(135deg, #0a0a0a 0%, #15151e 50%, #0a0a0a 100%)',
        }
      }}
    >
      <div className="mobile-search-header">
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
          sx={{ color: '#ffffff' }}
        >
          <CloseIcon />
        </IconButton>
        <h2>Search Drivers</h2>
      </div>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          variant="outlined"
          placeholder="Search drivers..."
          value={searchValue}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#999' }} />
              </InputAdornment>
            ),
            sx: {
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%)',
              color: '#ffffff',
              fontSize: '1.2rem',
              '& input': {
                color: '#ffffff',
              },
              '& input::placeholder': {
                color: '#999',
                opacity: 1,
              },
            }
          }}
          sx={{
            marginTop: '1rem',
            '& .MuiOutlinedInput-root': {
              '&:hover': {
                '& > fieldset': {
                  borderColor: '#e10600',
                }
              },
              '&.Mui-focused': {
                boxShadow: '0 0 0 3px rgba(225, 6, 0, 0.2)',
              }
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MobileSearchOverlay;
