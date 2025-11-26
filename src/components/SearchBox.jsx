import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import './SearchBox.css';

const SearchBox = ({ onSearchChange }) => {
  return (
    <div className="search-box">
      <TextField
        variant="outlined"
        placeholder="Search drivers..."
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#999' }} />
            </InputAdornment>
          ),
          sx: {
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%)',
            color: '#ffffff',
            minHeight: '44px',
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
          width: { xs: '100%', sm: '300px' },
          minWidth: '200px',
          '& .MuiOutlinedInput-root': {
            '&:hover': {
              '& > fieldset': {
                borderColor: '#e10600',
              }
            },
            '&.Mui-focused': {
              transform: 'translateY(-2px)',
              boxShadow: '0 0 0 3px rgba(225, 6, 0, 0.2), 0 4px 16px rgba(225, 6, 0, 0.3)',
            }
          }
        }}
      />
    </div>
  );
};

export default SearchBox;
