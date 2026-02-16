import React, { useState, useCallback } from 'react';
import { Plus, ChefHat, Clock, Star } from 'lucide-react';
import { MenuItem } from '../types';
import type { ItemSelections } from '../store/cart.store';
import ItemModal from './ItemModal';
import { isConfigurableItem } from '../utils/menuHelper';

interface MenuSectionProps {
  title: string;
  description?: string;
  subTitle?: string;
  items: MenuItem[];
  bgColor?: string;
  onAddToOrder: (
    menuItem: MenuItem,
    selections?: ItemSelections,
  ) => void;
}


const MenuSection: React.FC<MenuSectionProps> = ({ title, description, subTitle, items, bgColor = 'bg-orange-500', onAddToOrder }) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const today = new Date().getDay();

  const handleItemClick = useCallback((item: MenuItem) => {
    const needsConfig = isConfigurableItem(item);

    if (needsConfig) {
      setSelectedItem(item);
    } else {
      onAddToOrder(item);
    }
  }, [onAddToOrder]);

  const closeModal = useCallback(() => setSelectedItem(null), []);

  if (!items.length) return null;

  return (
    <section className={`mb-8 ${title === 'Fleischgerichte' ? 'mt-8' : ''}`}>
      <header className={`${bgColor} text-white p-2 rounded-t-xl`}>
        <div className="flex items-center gap-2 mb-1">
          <ChefHat className="w-5 h-5" />
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        {description && <p className="text-sm opacity-90 leading-relaxed mt-0.5">{description}</p>}
        {subTitle && <p className="text-sm opacity-80 mt-0.5 italic">{subTitle}</p>}
      </header>

      <div className="bg-white rounded-b-xl shadow-lg overflow-hidden border border-gray-100">
        {items.map((item, i) => {
          const isRippchenSpecial = item.id === 84 && today === 3;
          const isSchnitzelSpecial = [546, 547, 548, 549].includes(item.id) && today === 4;
          const hasSizes = item.sizes && item.sizes.length > 0;
          const minPrice = item.sizes ? Math.min(...item.sizes.map(s => s.price)) : item.price;

          return (
            <div
              key={`${item.id}-${i}`}
              className="p-6 hover:bg-white bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 flex justify-between items-center border-b last:border-0 border-gray-100"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex justify-center items-center font-bold">
                  {item.number}
                </span>
                <div>
                  <h3 className={`text-lg font-bold ${isRippchenSpecial || isSchnitzelSpecial ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.name}
                  </h3>
                  {item.description && <p className="text-gray-600 mt-1">{item.description}</p>}
                  {item.allergens && <p className="text-xs text-gray-500 mt-2"><strong>Allergene:</strong> <span className="italic">{item.allergens}</span></p>}

                  <div className="flex flex-wrap gap-2 mt-3">
                    {isRippchenSpecial && <Badge color="red" icon={<Star className="w-3 h-3" />} text="🔥 RIPPCHEN-TAG SPEZIAL" />}
                    {isSchnitzelSpecial && <Badge color="red" icon={<Star className="w-3 h-3" />} text="🔥 SCHNITZEL-TAG SPEZIAL" />}
                    {hasSizes && <Badge color="blue" icon={<Star className="w-3 h-3" />} text="Größen verfügbar" />}
                    {item.isWunschPizza && <Badge color="purple" icon={<ChefHat className="w-3 h-3" />} text="4 Zutaten wählbar" />}
                    {(item.isPizza || item.isWunschPizza) && <Badge color="green" icon={<Plus className="w-3 h-3" />} text="Extras verfügbar" />}
                    {item.isPasta && <Badge color="yellow" icon={<Clock className="w-3 h-3" />} text="Nudelsorte wählbar" />}
                    {item.isMeatSelection && <Badge color="red" icon={<ChefHat className="w-3 h-3" />} text="Fleischauswahl" />}
                    {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(item.number) || (item.isSpezialitaet && ![81, 82].includes(item.id) && !item.isMeatSelection && !(item.id >= 568 && item.id <= 573))) && <Badge color="red" icon={<ChefHat className="w-3 h-3" />} text="Soße wählbar" />}
                    {item.id >= 568 && item.id <= 573 && item.isSpezialitaet && <Badge color="indigo" icon={<ChefHat className="w-3 h-3" />} text="Dressing wählbar" />}
                    {item.isBeerSelection && <Badge color="amber" icon={<ChefHat className="w-3 h-3" />} text="Bier wählbar" />}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <div className="text-right">
                  {hasSizes ? (
                    <>
                      <div className="text-sm text-gray-600">ab</div>
                      <div className="text-xl font-bold text-orange-600">{minPrice.toFixed(2).replace('.', ',')} €</div>
                    </>
                  ) : (
                    <PriceDisplay item={item} specialRippchen={isRippchenSpecial} specialSchnitzel={isSchnitzelSpecial} />
                  )}
                </div>

                <button
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition transform hover:scale-105 text-sm font-medium shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Hinzufügen
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={closeModal}
          onAddToOrder={onAddToOrder}
        />
      )}
    </section>
  );
};

interface BadgeProps {
  color: 'red' | 'blue' | 'green' | 'purple' | 'yellow' | 'indigo' | 'amber';
  icon: React.ReactNode;
  text: string;
}

const Badge: React.FC<BadgeProps> = ({ color, icon, text }) => {
  const colors = {
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    amber: 'bg-amber-100 text-amber-800'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${colors[color]}`}>
      {icon} {text}
    </span>
  );
};

const PriceDisplay: React.FC<{ item: MenuItem; specialRippchen: boolean; specialSchnitzel: boolean }> = ({ item, specialRippchen, specialSchnitzel }) => {
  if (specialRippchen || specialSchnitzel) {
    const oldPrice = specialRippchen ? 14.90 : 12.90;
    return (
      <>
        <div className="text-sm text-gray-500 line-through">{oldPrice.toFixed(2).replace('.', ',')} €</div>
        <div className="text-red-600 font-extrabold animate-pulse">{item.price.toFixed(2).replace('.', ',')} €</div>
      </>
    );
  }
  return <div>{item.price.toFixed(2).replace('.', ',')} €</div>;
};

export default MenuSection;
