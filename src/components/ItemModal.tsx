import React from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { MenuItem } from '../types';
import type { ItemSelections } from '../store/cart.store';
import { pastaTypes, beerTypes, drinks, saladExclusionOptions } from '../data/menuItems';
import { useItemSelection } from '../hooks/useItemSelection';
import { StepIndicator } from './item-modal/StepIndicator';
import { SizeSelection } from './item-modal/SizeSelection';
import { IngredientSelection } from './item-modal/IngredientSelection';
import { ExtrasSelection } from './item-modal/ExtrasSelection';
import { MeatSelection } from './item-modal/MeatSelection';
import { SauceSelection } from './item-modal/SauceSelection';
import { SideDishSelection } from './item-modal/SideDishSelection';

interface ItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToOrder: (
    menuItem: MenuItem,
    selections?: ItemSelections,
  ) => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ item, isOpen, onClose, onAddToOrder }) => {
  const {
    selectedSize, setSelectedSize,
    selectedIngredients,
    selectedExtras,
    selectedPastaType, setSelectedPastaType,
    selectedSauce, setSelectedSauce,
    selectedMeatType, setSelectedMeatType,
    selectedSauces,
    selectedExclusions,
    selectedSideDish, setSelectedSideDish,
    selectedDrink, setSelectedDrink,
    currentStep,
    showAllSauces, setShowAllSauces,
    showAllExclusions, setShowAllExclusions,
    handleIngredientToggle,
    handleExtraToggle,
    handleExclusionToggle,
    handleSauceToggle,
    handleAddToCart,
    getVisibleSauceOptions,
    getSauceOptions,
    getVisibleExclusionOptions,
    handleBackToMeat,
    handleBackToSauce,
    handleBackToExclusions,
    getModalTitle,
    getButtonText
  } = useItemSelection({ item, onAddToOrder, onClose });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-orange-500 text-white p-4 rounded-t-xl flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold">{getModalTitle()}</h2>
            {currentStep === 'meat' && item.description && (
              <p className="text-sm opacity-90 mt-1">{item.description}</p>
            )}
            {currentStep === 'sauce' && (
              <p className="text-sm opacity-90 mt-1">
                {selectedMeatType} - Nr. {item.number} {item.name}
              </p>
            )}
            {currentStep === 'exclusions' && (
              <p className="text-sm opacity-90 mt-1">
                {selectedMeatType} mit {selectedSauces.length > 0 ? selectedSauces.join(', ') : 'ohne Soße'} - Nr. {item.number} {item.name}
              </p>
            )}
            {currentStep === 'sidedish' && (
              <p className="text-sm opacity-90 mt-1">
                {selectedMeatType} mit {selectedSauces.length > 0 ? selectedSauces.join(', ') : 'ohne Soße'} - Nr. {item.number} {item.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {item.isMeatSelection && !item.isPizza && ![61].includes(item.number) && (currentStep === 'sauce' || currentStep === 'exclusions' || currentStep === 'sidedish') && (
              <button
                onClick={currentStep === 'sauce' ? handleBackToMeat : currentStep === 'exclusions' ? handleBackToSauce : handleBackToExclusions}
                className="p-2 hover:bg-orange-600 rounded-full transition-colors"
                title={currentStep === 'sauce' ? "Zurück zur Fleischauswahl" : currentStep === 'exclusions' ? "Zurück zur Soßenauswahl" : "Zurück zur Salat-Anpassung"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-orange-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Step indicator */}
          {item.isMeatSelection && !item.isPizza && ![61].includes(item.number) && (
            <StepIndicator currentStep={currentStep} itemNumber={item.number} />
          )}

          {/* Size Selection */}
          {item.sizes && (!item.isMeatSelection || (currentStep !== 'sauce' && currentStep !== 'exclusions')) && (
            <SizeSelection
              sizes={item.sizes}
              selectedSize={selectedSize}
              onSelect={setSelectedSize}
            />
          )}

          {/* Wunsch Pizza Ingredients */}
          {item.isWunschPizza && (!item.isMeatSelection || (currentStep !== 'sauce' && currentStep !== 'exclusions')) && (
            <IngredientSelection
              selectedIngredients={selectedIngredients}
              onToggle={handleIngredientToggle}
            />
          )}

          {/* Pizza Extras */}
          {(item.isPizza || item.isWunschPizza) && (!item.isMeatSelection || (currentStep !== 'sauce' && currentStep !== 'exclusions')) && (
            <ExtrasSelection
              selectedExtras={selectedExtras}
              onToggle={handleExtraToggle}
            />
          )}

          {/* Pasta Type Selection */}
          {item.isPasta && (!item.isMeatSelection || (currentStep !== 'sauce' && currentStep !== 'exclusions')) && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Nudelsorte wählen *</h3>
              <div className="space-y-2">
                {pastaTypes?.map((pastaType) => (
                  <label
                    key={pastaType}
                    className={`flex items-center space-x-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${selectedPastaType === pastaType
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="pastaType"
                      value={pastaType}
                      checked={selectedPastaType === pastaType}
                      onChange={(e) => setSelectedPastaType(e.target.value)}
                      className="text-orange-500 focus:ring-orange-500 w-4 h-4"
                    />
                    <span className="font-medium">{pastaType}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Meat Selection */}
          {item.isMeatSelection && currentStep === 'meat' && (
            <MeatSelection
              selectedMeatType={selectedMeatType}
              onSelect={setSelectedMeatType}
            />
          )}

          {/* Drink Selection */}
          {[14, 15, 16].includes(item.number) && (currentStep !== 'sauce' && currentStep !== 'exclusions') && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Getränk wählen *</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {drinks.map((drink) => (
                  <label
                    key={drink.id}
                    className={`flex items-center justify-between p-2 rounded-lg border-2 cursor-pointer transition-all ${selectedDrink === drink.name
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="drink"
                        value={drink.name}
                        checked={selectedDrink === drink.name}
                        onChange={(e) => setSelectedDrink(e.target.value)}
                        className="text-orange-500 focus:ring-orange-500 w-4 h-4"
                      />
                      <div>
                        <div className="font-medium">{drink.name}</div>
                        {drink.description && (
                          <div className="text-sm text-gray-600">{drink.description}</div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sauce Selection */}
          {((item.isSpezialitaet && ![81, 82, 562, 563, 564, 565, 566].includes(item.id) && !item.isMeatSelection) ||
            (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) ||
            (item.isMeatSelection && currentStep === 'sauce')) && (
              <SauceSelection
                item={item}
                currentStep={currentStep}
                selectedSauce={selectedSauce}
                selectedSauces={selectedSauces}
                visibleSauceOptions={getVisibleSauceOptions()}
                allSauceOptions={getSauceOptions()}
                showAllSauces={showAllSauces}
                onSingleSelect={setSelectedSauce}
                onMultiToggle={handleSauceToggle}
                onToggleShowAll={() => setShowAllSauces(!showAllSauces)}
              />
            )}

          {/* Beer Selection */}
          {item.isBeerSelection && (!item.isMeatSelection || (currentStep !== 'sauce' && currentStep !== 'exclusions')) && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Bier wählen *</h3>
              <div className="space-y-2">
                {beerTypes.map((beer) => (
                  <label
                    key={beer}
                    className={`flex items-center space-x-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${selectedSauce === beer
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="beer"
                      value={beer}
                      checked={selectedSauce === beer}
                      onChange={(e) => setSelectedSauce(e.target.value)}
                      className="text-orange-500 focus:ring-orange-500 w-4 h-4"
                    />
                    <span className="font-medium">{beer}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Salad Exclusions */}
          {item.isMeatSelection && currentStep === 'exclusions' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Salat anpassen (mehrere möglich, optional)</h3>
              <p className="text-sm text-gray-600 mb-4">Wählen Sie aus, was Sie nicht in Ihrem Salat möchten:</p>
              <div className="space-y-2">
                {getVisibleExclusionOptions().map((exclusion) => {
                  const isBareSalad = exclusion === 'Ohne Beilagen bzw. Salate';
                  const isSelected = selectedExclusions.includes(exclusion);
                  const isDisabled = selectedExclusions.includes('Ohne Beilagen bzw. Salate') && !isBareSalad;

                  return (
                    <label
                      key={exclusion}
                      className={`flex items-center space-x-2 p-2 rounded-lg border-2 transition-all ${isDisabled
                        ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                        : isSelected
                          ? 'border-orange-500 bg-orange-50 cursor-pointer'
                          : 'border-gray-200 hover:border-orange-300 cursor-pointer'
                        } ${isBareSalad ? 'font-semibold bg-blue-50 border-blue-200' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleExclusionToggle(exclusion)}
                        disabled={isDisabled}
                        className="text-orange-500 focus:ring-orange-500 w-4 h-4"
                      />
                      <span className="font-medium">{exclusion}</span>
                    </label>
                  );
                })}
              </div>

              {/* Show More/Less Button for Exclusions */}
              {item.isMeatSelection && currentStep === 'exclusions' && saladExclusionOptions.length > 3 && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllExclusions(!showAllExclusions)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    {showAllExclusions ? (
                      <>
                        <span>Weniger anzeigen</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Mehr anzeigen ({saladExclusionOptions.length - 3} weitere)</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Side Dish Selection */}
          {((item.hasSideDishSelection && !item.isMeatSelection) || (item.number === 4 && item.isMeatSelection && currentStep === 'sidedish')) && (
            <SideDishSelection
              selectedSideDish={selectedSideDish}
              onSelect={setSelectedSideDish}
            />
          )}

          {/* Add to Cart Button */}
          <div className="sticky bottom-0 bg-white p-4 border-t shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-20 mt-auto">
            {item.isMeatSelection && !item.isPizza && ![61].includes(item.number) && (currentStep === 'sauce' || currentStep === 'exclusions' || currentStep === 'sidedish') ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={currentStep === 'sauce' ? handleBackToMeat : currentStep === 'exclusions' ? handleBackToSauce : handleBackToExclusions}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors border border-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Zurück
                </button>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {currentStep === 'sauce' || (currentStep === 'exclusions' && item.number === 4) ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Weiter
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Hinzufügen
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {item.isMeatSelection && !item.isPizza && ![61].includes(item.number) && currentStep === 'meat' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {getButtonText()}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    {getButtonText()}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;