import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, onFocus, onBlur }) => {
  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Suche"
          className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-full text-gray-700 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all duration-200 bg-white text-base"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            aria-label="Suche löschen"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {searchQuery && (
        <div className="absolute top-full left-4 mt-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 z-50">
          Suche nach: <span className="font-semibold text-orange-600">"{searchQuery}"</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;