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
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-orange-500 w-6 h-6 transition-transform group-hover:scale-110" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Gericht oder Nummer suchen..."
          className="w-full pl-16 pr-6 py-4 border border-gray-200 rounded-full shadow-sm text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all duration-300 bg-white hover:shadow-md text-lg"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            aria-label="Suche löschen"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {searchQuery && (
        <div className="absolute top-full left-6 mt-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          Suche nach: <span className="font-semibold text-orange-600">"{searchQuery}"</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;