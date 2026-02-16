import React from 'react';
import { sideDishOptions } from '../../data/menuItems';

interface SideDishSelectionProps {
    selectedSideDish: string;
    onSelect: (sideDish: string) => void;
}

export const SideDishSelection: React.FC<SideDishSelectionProps> = ({ selectedSideDish, onSelect }) => {
    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3">Beilage wählen *</h3>
            <div className="space-y-2">
                {sideDishOptions.map((sideDish) => (
                    <label
                        key={sideDish}
                        className={`flex items-center space-x-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${selectedSideDish === sideDish
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                            }`}
                    >
                        <input
                            type="radio"
                            name="sideDish"
                            value={sideDish}
                            checked={selectedSideDish === sideDish}
                            onChange={(e) => onSelect(e.target.value)}
                            className="text-orange-500 focus:ring-orange-500 w-4 h-4"
                        />
                        <span className="font-medium">{sideDish}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};
