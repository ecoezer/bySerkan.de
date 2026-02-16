import React from 'react';
import { MenuItem } from '../../types';

interface SauceSelectionProps {
    item: MenuItem;
    currentStep: string;
    selectedSauce: string;
    selectedSauces: string[];
    visibleSauceOptions: readonly string[];
    allSauceOptions: readonly string[];
    showAllSauces: boolean;
    onSingleSelect: (sauce: string) => void;
    onMultiToggle: (sauce: string) => void;
    onToggleShowAll: () => void;
}

export const SauceSelection: React.FC<SauceSelectionProps> = ({
    item,
    currentStep,
    selectedSauce,
    selectedSauces,
    visibleSauceOptions,
    allSauceOptions,
    showAllSauces,
    onSingleSelect,
    onMultiToggle,
    onToggleShowAll
}) => {
    const isMultiSelect = (item.isMeatSelection && currentStep === 'sauce') ||
        item.isMultipleSauceSelection ||
        [11, 12, 14, 15, 16, 17, 18].includes(item.number);

    const headingText = (item.id >= 568 && item.id <= 573)
        ? 'Dressing wählen'
        : isMultiSelect
            ? 'Soßen wählen (mehrere möglich)'
            : 'Soße wählen';

    const isRequired = !item.isMeatSelection && !item.isMultipleSauceSelection &&
        ![11, 12, 14, 15, 16, 17, 18].includes(item.number) &&
        ((item.isSpezialitaet && ![81, 82].includes(item.id)) || (item.id >= 568 && item.id <= 573));

    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3">
                {headingText}{isRequired ? ' *' : ''}
            </h3>

            {isMultiSelect ? (
                <div className="space-y-2">
                    {visibleSauceOptions.map((sauce) => (
                        <label
                            key={sauce}
                            className={`flex items-center space-x-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${selectedSauces.includes(sauce)
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedSauces.includes(sauce)}
                                onChange={() => onMultiToggle(sauce)}
                                className="text-orange-500 focus:ring-orange-500 w-4 h-4"
                            />
                            <span className="font-medium">{sauce}</span>
                        </label>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {visibleSauceOptions.map((sauce) => (
                        <label
                            key={sauce}
                            className={`flex items-center space-x-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${selectedSauce === sauce
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="sauce"
                                value={sauce}
                                checked={selectedSauce === sauce}
                                onChange={(e) => onSingleSelect(e.target.value)}
                                className="text-orange-500 focus:ring-orange-500 w-4 h-4"
                            />
                            <span className="font-medium">{sauce}</span>
                        </label>
                    ))}
                </div>
            )}

            {isMultiSelect && allSauceOptions.length > 3 && (
                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={onToggleShowAll}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                        {showAllSauces ? (
                            <>
                                <span>Weniger anzeigen</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </>
                        ) : (
                            <>
                                <span>Mehr anzeigen ({allSauceOptions.length - 3} weitere)</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
