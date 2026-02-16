import React from 'react';
import { PizzaSize } from '../../types';

interface SizeSelectionProps {
    sizes: PizzaSize[];
    selectedSize?: PizzaSize;
    onSelect: (size: PizzaSize) => void;
}

export const SizeSelection: React.FC<SizeSelectionProps> = ({ sizes, selectedSize, onSelect }) => {
    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3">Größe wählen *</h3>
            <div className="space-y-2">
                {sizes.map((size) => (
                    <label
                        key={size.name}
                        className={`flex items-center justify-between p-2 rounded-lg border-2 cursor-pointer transition-all ${selectedSize?.name === size.name
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="size"
                                value={size.name}
                                checked={selectedSize?.name === size.name}
                                onChange={() => onSelect(size)}
                                className="text-orange-500 focus:ring-orange-500 w-4 h-4"
                            />
                            <div>
                                <div className="font-medium">{size.name}</div>
                                {size.description && (
                                    <div className="text-sm text-gray-600">{size.description}</div>
                                )}
                            </div>
                        </div>
                        <div className="font-bold text-orange-600">
                            {size.price.toFixed(2).replace('.', ',')} €
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
};
