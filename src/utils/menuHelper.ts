import { MenuItem } from '../types';
import { sauceTypes, saladSauceTypes, pommesSauceTypes } from '../data/menuItems';

/**
 * Determines if a menu item requires a configuration modal/dialog.
 * Copied from legacy logic in MenuSection and HomePage.
 */
export function isConfigurableItem(item: MenuItem): boolean {
    return !!(
        (item.sizes && item.sizes.length > 0) ||
        item.isWunschPizza ||
        item.isPizza ||
        item.isPasta ||
        item.isBeerSelection ||
        item.isMeatSelection ||
        (item.isSpezialitaet && ![81, 82].includes(item.id) && !item.isMeatSelection) ||
        (item.id >= 568 && item.id <= 573 && item.isSpezialitaet)
    );
}

/**
 * Checks if the item is "Drehspieß Teller" (Number 4) which has special side dish logic.
 */
export function isDrehspiessTeller(item: MenuItem): boolean {
    return item.number === 4;
}

/**
 * Checks if the item is a meat dish that skips the sauce step or has specific behavior.
 * Item 61 seems to be exempted from standard meat selection flows in the original code.
 */
export function isExcludedFromMeatSauceStep(item: MenuItem): boolean {
    return item.number === 61;
}

/**
 * Checks if the item requires salad sauce options (Specialty salads).
 */
export function isSaladSauceItem(item: MenuItem): boolean {
    return item.id >= 568 && item.id <= 573 && !!item.isSpezialitaet;
}

/**
 * Helper to determine which sauce options to show for a given item.
 */
export function getAvailableSauces(item: MenuItem): readonly string[] {
    if (isSaladSauceItem(item)) {
        return saladSauceTypes;
    }
    if (item.number === 17) {
        return pommesSauceTypes;
    }
    if ([11, 12, 13, 14, 15].includes(item.number)) {
        return (sauceTypes as readonly string[])
            .filter(sauce => !['Tzatziki', 'Kräutersoße', 'Curry Sauce'].includes(sauce))
            .concat(['Burger Sauce'])
            .sort();
    }
    return sauceTypes;
}

/**
 * helper to check if we should show limited sauce options (first 3) or all.
 */
export function shouldShowLimitedSauces(item: MenuItem, currentStep: string): boolean {
    return (item.isMeatSelection && currentStep === 'sauce') ||
        !!item.isMultipleSauceSelection ||
        [6, 7, 8, 10, 11, 12, 14, 15, 16, 17, 18].includes(item.number);
}
