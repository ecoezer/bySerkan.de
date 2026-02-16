import React, { useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuItem } from '../types';
import { usePopularItems } from '../hooks/usePopularItems';

interface PopularItemsSectionProps {
    onItemClick: (item: MenuItem) => void;
}

const PopularItemsSection: React.FC<PopularItemsSectionProps> = ({ onItemClick }) => {
    const { popularItems, loading } = usePopularItems();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading || popularItems.length === 0) return null;

    return (
        <section className="mt-8 mb-12 relative group">
            <div className="flex items-center justify-between px-4 mb-4">
                <h2 className="text-2xl font-extrabold text-gray-900">Beliebt</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                        aria-label="Nach links scrollen"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                        aria-label="Nach rechts scrollen"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-4 px-4 pb-8 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            >
                {popularItems.map((item) => {
                    const minPrice = (item.sizes && item.sizes.length > 0) ? Math.min(...item.sizes.map(s => s.price)) : item.price;

                    let categoryLabel = 'Gericht';
                    if (item.isPizza || item.isWunschPizza) categoryLabel = 'Pizza';
                    else if (item.isPasta) categoryLabel = 'Pasta';
                    else if (item.name.toLowerCase().includes('döner') || item.name.toLowerCase().includes('drehspieß')) categoryLabel = 'Dönergerichte';
                    else if (item.name.toLowerCase().includes('schnitzel')) categoryLabel = 'Schnitzel';
                    else if (item.name.toLowerCase().includes('burger')) categoryLabel = 'Burger';

                    return (
                        <div
                            key={item.id}
                            onClick={() => onItemClick(item)}
                            className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-w-[280px] w-[280px] flex flex-col justify-between border border-gray-100 cursor-pointer snap-start"
                        >
                            <div>
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{categoryLabel}</span>
                                <h3 className="text-lg font-bold text-gray-900 mt-1 leading-tight line-clamp-2 min-h-[3.5rem]">{item.name}</h3>
                                {item.description && (
                                    <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                                )}
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex flex-col">
                                    {item.sizes && <span className="text-xs text-gray-400">ab</span>}
                                    <span className="text-lg font-bold text-gray-900">{minPrice.toFixed(2).replace('.', ',')} €</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onItemClick(item);
                                    }}
                                    className="w-10 h-10 rounded-full bg-white border border-gray-200 text-orange-500 shadow-sm flex items-center justify-center hover:bg-orange-50 hover:border-orange-200 hover:scale-105 transition-all"
                                >
                                    <Plus className="w-5 h-5 stroke-[2.5]" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default PopularItemsSection;
