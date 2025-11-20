import './SearchBox.css';

const SearchBox = ({ onSearchChange }) => {
  return (
    <div className="search-box">
      <input
        type="text"
        className="search-input"
        placeholder="Search drivers..."
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBox;
