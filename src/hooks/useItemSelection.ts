import { useState, useCallback } from 'react';
import { MenuItem, PizzaSize } from '../types';
import type { ItemSelections } from '../store/cart.store';
import {
    meatTypes, sideDishOptions, pastaTypes, saladExclusionOptions
} from '../data/menuItems';
import {
    isDrehspiessTeller,
    isExcludedFromMeatSauceStep,
    getAvailableSauces,
    shouldShowLimitedSauces
} from '../utils/menuHelper';

interface UseItemSelectionProps {
    item: MenuItem;
    onAddToOrder: (
        menuItem: MenuItem,
        selections?: ItemSelections,
    ) => void;
    onClose: () => void;
}

export const useItemSelection = ({ item, onAddToOrder, onClose }: UseItemSelectionProps) => {
    const [selectedSize, setSelectedSize] = useState<PizzaSize | undefined>(
        item.sizes ? item.sizes[0] : undefined
    );
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
    const [selectedPastaType, setSelectedPastaType] = useState<string>(
        item.isPasta && typeof pastaTypes !== 'undefined' ? (pastaTypes as string[])[0] : ''
    );
    const [selectedSauce, setSelectedSauce] = useState<string>('');
    const [selectedMeatType, setSelectedMeatType] = useState<string>(
        item.isMeatSelection ? meatTypes[0] : ''
    );
    const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
    const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);
    const [selectedSideDish, setSelectedSideDish] = useState<string>(
        (isDrehspiessTeller(item) || item.hasSideDishSelection) ? sideDishOptions[0] : ''
    );
    const [selectedDrink, setSelectedDrink] = useState<string>('');
    const [currentStep, setCurrentStep] = useState<'meat' | 'sauce' | 'exclusions' | 'sidedish' | 'complete'>('meat');
    const [showAllSauces, setShowAllSauces] = useState(false);
    const [showAllExclusions, setShowAllExclusions] = useState(false);

    const handleIngredientToggle = useCallback((ingredient: string) => {
        setSelectedIngredients(prev => {
            if (prev.includes(ingredient)) {
                return prev.filter(i => i !== ingredient);
            } else if (prev.length < 4) {
                return [...prev, ingredient];
            }
            return prev;
        });
    }, []);

    const handleExtraToggle = useCallback((extra: string) => {
        setSelectedExtras(prev =>
            prev.includes(extra)
                ? prev.filter(e => e !== extra)
                : [...prev, extra]
        );
    }, []);

    const handleExclusionToggle = useCallback((exclusion: string) => {
        setSelectedExclusions(prev => {
            const isBareSalad = exclusion === 'Ohne Beilagen bzw. Salate';

            if (isBareSalad) {
                if (prev.includes(exclusion)) {
                    return prev.filter(e => e !== exclusion);
                } else {
                    return [exclusion];
                }
            } else {
                if (prev.includes('Ohne Beilagen bzw. Salate')) {
                    return [exclusion];
                }

                return prev.includes(exclusion)
                    ? prev.filter(e => e !== exclusion)
                    : [...prev, exclusion];
            }
        });
    }, []);

    const handleSauceToggle = useCallback((sauce: string) => {
        setSelectedSauces(prev => {
            if (sauce === 'ohne Soße') {
                return prev.includes(sauce) ? [] : ['ohne Soße'];
            }

            const withoutOhneSose = prev.filter(s => s !== 'ohne Soße');

            return withoutOhneSose.includes(sauce)
                ? withoutOhneSose.filter(s => s !== sauce)
                : [...withoutOhneSose, sauce];
        });
    }, []);

    const calculatePrice = useCallback(() => {
        const basePrice = selectedSize ? selectedSize.price : item.price;
        const extrasPrice = selectedExtras.length * 1.00;
        return basePrice + extrasPrice;
    }, [item.price, selectedSize, selectedExtras]);

    const handleAddToCart = useCallback(() => {
        // For meat selection items that are NOT pizzas or croques, check if we need to go to sauce selection step
        if (item.isMeatSelection && !item.isPizza && !isExcludedFromMeatSauceStep(item) && currentStep === 'meat') {
            setCurrentStep('sauce');
            return;
        }

        // For meat selection items, check if we need to go to exclusions step
        if (item.isMeatSelection && !item.isPizza && !isExcludedFromMeatSauceStep(item) && currentStep === 'sauce') {
            setCurrentStep('exclusions');
            return;
        }

        // For item #4 (Drehspieß Teller), check if we need to go to side dish selection step
        if (isDrehspiessTeller(item) && item.isMeatSelection && currentStep === 'exclusions') {
            setCurrentStep('sidedish');
            return;
        }

        const finalSauce = item.isMeatSelection && selectedMeatType
            ? `${selectedMeatType}${selectedSauces.length > 0 ? ` - ${selectedSauces.join(', ')}` : ''}`
            : (item.isMultipleSauceSelection || selectedSauces.length > 0 ? selectedSauces.join(', ') : selectedSauce) || undefined;

        onAddToOrder(
            item,
            {
                selectedSize,
                selectedIngredients,
                selectedExtras,
                selectedPastaType: selectedPastaType || undefined,
                selectedSauce: finalSauce,
                selectedExclusions,
                selectedSideDish: selectedSideDish || undefined,
                selectedDrink: selectedDrink || undefined,
            }
        );
        onClose();
    }, [item, selectedSize, selectedIngredients, selectedExtras, selectedPastaType, selectedSauce, selectedSauces, selectedMeatType, selectedExclusions, selectedSideDish, selectedDrink, onAddToOrder, onClose, currentStep]);

    const getSauceOptions = useCallback(() => {
        return getAvailableSauces(item);
    }, [item]);

    const getVisibleSauceOptions = useCallback(() => {
        const allSauces = getSauceOptions();
        if (shouldShowLimitedSauces(item, currentStep)) {
            return showAllSauces ? allSauces : allSauces.slice(0, 3);
        }
        return allSauces;
    }, [getSauceOptions, item, currentStep, showAllSauces]);

    const getVisibleExclusionOptions = useCallback(() => {
        if (item.isMeatSelection && currentStep === 'exclusions') {
            return showAllExclusions ? saladExclusionOptions : saladExclusionOptions.slice(0, 3);
        }
        return saladExclusionOptions;
    }, [item.isMeatSelection, currentStep, showAllExclusions]);

    const handleBackToMeat = useCallback(() => {
        setCurrentStep('meat');
        setSelectedSauce(''); // Reset sauce selection when going back
    }, []);

    const handleBackToSauce = useCallback(() => {
        setCurrentStep('sauce');
        setSelectedExclusions([]); // Reset exclusions when going back
    }, []);

    const handleBackToExclusions = useCallback(() => {
        setCurrentStep('exclusions');
        setSelectedSideDish(sideDishOptions[0]); // Reset side dish when going back
    }, []);

    const getModalTitle = useCallback(() => {
        if (item.isMeatSelection && !item.isPizza && !isExcludedFromMeatSauceStep(item)) {
            if (currentStep === 'meat') {
                return 'Schritt 1: Fleischauswahl';
            } else if (currentStep === 'sauce') {
                return 'Schritt 2: Soßen wählen (mehrere möglich)';
            } else if (currentStep === 'exclusions') {
                return 'Schritt 3: Salat anpassen (mehrere möglich)';
            } else if (currentStep === 'sidedish') {
                return 'Schritt 4: Beilage wählen';
            }
        }
        return `Nr. ${item.number} ${item.name}`;
    }, [item, currentStep]);

    const getButtonText = useCallback(() => {
        if (item.isMeatSelection && !item.isPizza && !isExcludedFromMeatSauceStep(item) && currentStep === 'meat') {
            return 'Weiter zur Soßenauswahl';
        } else if (item.isMeatSelection && !item.isPizza && !isExcludedFromMeatSauceStep(item) && currentStep === 'sauce') {
            return 'Weiter zur Salat-Anpassung';
        } else if (isDrehspiessTeller(item) && item.isMeatSelection && currentStep === 'exclusions') {
            return 'Weiter zur Beilagenauswahl';
        }
        return `Hinzufügen - ${calculatePrice().toFixed(2).replace('.', ',')} €`;
    }, [item, currentStep, calculatePrice]);

    return {
        selectedSize, setSelectedSize,
        selectedIngredients, setSelectedIngredients,
        selectedExtras, setSelectedExtras,
        selectedPastaType, setSelectedPastaType,
        selectedSauce, setSelectedSauce,
        selectedMeatType, setSelectedMeatType,
        selectedSauces, setSelectedSauces,
        selectedExclusions, setSelectedExclusions,
        selectedSideDish, setSelectedSideDish,
        selectedDrink, setSelectedDrink,
        currentStep, setCurrentStep,
        showAllSauces, setShowAllSauces,
        showAllExclusions, setShowAllExclusions,
        handleIngredientToggle,
        handleExtraToggle,
        handleExclusionToggle,
        handleSauceToggle,
        calculatePrice,
        handleAddToCart,
        getSauceOptions,
        getVisibleSauceOptions,
        getVisibleExclusionOptions,
        handleBackToMeat,
        handleBackToSauce,
        handleBackToExclusions,
        getModalTitle,
        getButtonText
    };
};
