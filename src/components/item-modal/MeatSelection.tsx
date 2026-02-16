import React from 'react';
import { meatTypes } from '../../data/menuItems';

interface MeatSelectionProps {
    selectedMeatType: string;
    onSelect: (meatType: string) => void;
}

export const MeatSelection: React.FC<MeatSelectionProps> = ({ selectedMeatType, onSelect }) => {
    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3">Fleischauswahl *</h3>
            <div className="space-y-2">
                {meatTypes.map((meatType) => (
                    <label
                        key={meatType}
                        className={`flex items-center space-x-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${selectedMeatType === meatType
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                            }`}
                    >
                        <input
                            type="radio"
                            name="meatType"
                            value={meatType}
                            checked={selectedMeatType === meatType}
                            onChange={(e) => onSelect(e.target.value)}
                            className="text-orange-500 focus:ring-orange-500 w-4 h-4"
                        />
                        <span className="font-medium">{meatType}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};
