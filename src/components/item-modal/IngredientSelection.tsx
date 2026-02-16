import React from 'react';
import { wunschPizzaIngredients } from '../../data/menuItems';

interface IngredientSelectionProps {
    selectedIngredients: string[];
    onToggle: (ingredient: string) => void;
}

export const IngredientSelection: React.FC<IngredientSelectionProps> = ({ selectedIngredients, onToggle }) => {
    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3">
                Zutaten wählen ({selectedIngredients.length}/4) *
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto ingredients-scroll">
                {wunschPizzaIngredients.map((ingredient) => (
                    <label
                        key={ingredient.name}
                        className={`flex items-center space-x-2 p-1.5 rounded-lg border cursor-pointer transition-all text-sm ${selectedIngredients.includes(ingredient.name)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                            } ${!selectedIngredients.includes(ingredient.name) && selectedIngredients.length >= 4
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                    >
                        <input
                            type="checkbox"
                            checked={selectedIngredients.includes(ingredient.name)}
                            onChange={() => onToggle(ingredient.name)}
                            disabled={!selectedIngredients.includes(ingredient.name) && selectedIngredients.length >= 4}
                            className="text-orange-500 focus:ring-orange-500 w-4 h-4"
                        />
                        <div className="flex flex-col">
                            <span>{ingredient.name}</span>
                            <span className="text-xs text-gray-500">+{ingredient.price.toFixed(2)}€</span>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
};
