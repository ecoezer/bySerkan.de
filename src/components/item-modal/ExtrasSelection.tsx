import React from 'react';
import { pizzaExtras } from '../../data/menuItems';

interface ExtrasSelectionProps {
    selectedExtras: string[];
    onToggle: (extra: string) => void;
}

export const ExtrasSelection: React.FC<ExtrasSelectionProps> = ({ selectedExtras, onToggle }) => {
    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3">
                Extras (+1,00€ pro Extra)
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {pizzaExtras.map((extra) => (
                    <label
                        key={extra}
                        className={`flex items-center space-x-2 p-1.5 rounded-lg border cursor-pointer transition-all text-sm ${selectedExtras.includes(extra)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                            }`}
                    >
                        <input
                            type="checkbox"
                            checked={selectedExtras.includes(extra)}
                            onChange={() => onToggle(extra)}
                            className="text-orange-500 focus:ring-orange-500 w-4 h-4"
                        />
                        <span>{extra}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};
