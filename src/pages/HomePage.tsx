import { useState, useEffect, useMemo, useCallback } from 'react';

import MenuSection from '../components/MenuSection';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import OrderForm from '../components/OrderForm';
import SearchBar from '../components/SearchBar';
import PopularItemsSection from '../components/PopularItemsSection';
import { useCartStore } from '../store/cart.store';
import type { ItemSelections } from '../store/cart.store';
import { ShoppingCart, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useMenuData } from '../hooks/useMenuData';
import { Notification } from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { StoreClosedModal } from '../components/StoreClosedModal';
import { MenuItem, PizzaSize } from '../types';
import ItemModal from '../components/ItemModal';
import { isConfigurableItem } from '../utils/menuHelper';

import { useStoreStatus } from '../hooks/useStoreStatus';

const SCROLL_CONFIG = {
  DELAY: 100,
  NAVBAR_HEIGHT: 140,
  MOBILE_OFFSET: 120,
  DESKTOP_OFFSET: 50,
  ANIMATION_DURATION: 1500,
  MOBILE_BREAKPOINT: 1024
};

const BUTTON_CLASSES = {
  whatsapp: 'bg-gradient-to-r from-green-400 to-teal-400 text-white py-2 px-2 group shadow-lg',
  cart: 'fixed top-2 right-2 hover:scale-105 transition-transform duration-200 drop-shadow-lg border-2 border-white/80 rounded-xl p-1 bg-white/10 backdrop-blur-sm cursor-pointer z-50',
  scrollButton: 'fixed right-2 bottom-20 w-10 h-10 bg-orange-500 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-40 border-2 border-white/50 hover:scale-110'
};

function HomePage() {
  const { sections: menuSections, loading, error } = useMenuData();
  const items = useCartStore(state => state.items);
  const addItem = useCartStore(state => state.addItem);


  const [selectedPopularItem, setSelectedPopularItem] = useState<MenuItem | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < SCROLL_CONFIG.MOBILE_BREAKPOINT);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Use centralized store status hook
  const { storeStatus } = useStoreStatus();

  const { notification, clearNotification } = useNotification();
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [pendingItem, setPendingItem] = useState<{
    item: MenuItem;
    size?: PizzaSize;
    ingredients?: string[];
    extras?: string[];
    pastaType?: string;
    sauce?: string;
    exclusions?: string[];
    sideDish?: string;
    drink?: string;
  } | null>(null);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < SCROLL_CONFIG.MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollButtons(window.pageYOffset > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItemsCount = useCartStore(state => state.totalItems());

  const triggerCartAnimation = useCallback(() => {
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 1000);
  }, []);


  const memoizedAddItem = useCallback((
    menuItem: MenuItem,
    selections: ItemSelections = {}
  ) => {
    if (!storeStatus.isOpen) {
      setPendingItem({
        item: menuItem,
        size: selections.selectedSize,
        ingredients: selections.selectedIngredients,
        extras: selections.selectedExtras,
        pastaType: selections.selectedPastaType,
        sauce: selections.selectedSauce,
        exclusions: selections.selectedExclusions,
        sideDish: selections.selectedSideDish,
        drink: selections.selectedDrink,
      });
      setShowClosedModal(true);
      return;
    }
    addItem(menuItem, selections);
    setSearchQuery('');
    triggerCartAnimation();
  }, [addItem, triggerCartAnimation, storeStatus]);


  const handleItemSelect = useCallback((item: MenuItem) => {
    if (!storeStatus.isOpen) {
      setPendingItem({ item });
      setShowClosedModal(true);
      return;
    }

    // Check if item needs configuration (using central helper)
    const needsConfig = isConfigurableItem(item);

    if (needsConfig) {
      setSelectedPopularItem(item);
    } else {
      memoizedAddItem(item);
    }
  }, [storeStatus.isOpen, memoizedAddItem]);


  const toggleMobileCart = useCallback(() => setShowMobileCart(prev => !prev), []);
  const closeMobileCart = useCallback(() => setShowMobileCart(false), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMobileCart && isMobile) {
        const cartElement = document.getElementById('mobile-cart-sidebar');
        const buttonElement = document.getElementById('mobile-cart-button');
        if (
          cartElement &&
          buttonElement &&
          event.target instanceof Node &&
          !cartElement.contains(event.target) &&
          !buttonElement.contains(event.target)
        ) setShowMobileCart(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileCart, isMobile]);

  const filterItems = useCallback((itemsArr: MenuItem[]) => {
    if (!searchQuery.trim()) return itemsArr;
    const query = searchQuery.toLowerCase();
    return itemsArr.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.number && item.number.toString().includes(query))
    );
  }, [searchQuery]);

  const hasSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return true;
    // Collect all items from all sections for search
    const allItems = menuSections.flatMap(section => section.items);
    return filterItems(allItems).length > 0;
  }, [searchQuery, filterItems, menuSections]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Speisekarte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg">
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-dvh bg-gray-50'>
      <div className='fixed top-0 left-0 right-0 z-50 bg-white shadow-sm'>
        <div className="bg-white py-3">
          <div className="mx-auto px-4 lg:pr-80 flex items-center gap-4">
            {!isSearchFocused && (
              <div className="flex items-center gap-3 transition-all duration-300 pr-4">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className={`${isMobile ? 'h-8' : 'h-10'} w-auto object-contain`}
                />
              </div>
            )}
            <div className={`flex-1 transition-all duration-300 ${isSearchFocused ? 'w-full' : ''}`}>
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200) /* Small delay to allow click handlers */}
              />
            </div>
          </div>
        </div>
        <Navigation sections={menuSections} />
      </div>

      <div className='hidden lg:block fixed top-0 right-0 w-80 h-full bg-white shadow-xl z-50 overflow-y-auto'>
        <OrderForm />
      </div>


      <div className='pt-32 lg:pr-80'>

        <main className='container mx-auto px-6 py-6 max-w-5xl'>

          {/* Search Result Handling */}
          {searchQuery.trim() && !hasSearchResults && (
            <div className="text-center py-12 text-gray-500">
              Keine Ergebnisse für "<span className="font-medium text-orange-600">{searchQuery}</span>"
              <button onClick={() => setSearchQuery('')} className="text-orange-500 hover:text-orange-600 underline ml-2">Suche zurücksetzen</button>
            </div>
          )}

          {/* Popular Items Section (Only show when not searching) */}
          {!searchQuery.trim() && (
            <PopularItemsSection
              onItemClick={handleItemSelect}
            />
          )}

          {hasSearchResults && menuSections.map(section => {
            const filtered = filterItems(section.items);
            if (searchQuery.trim() && filtered.length === 0) return null;
            return (
              <div key={section.id} id={section.id} className='scroll-mt-32'>
                <MenuSection
                  title={section.title}
                  description={section.description}
                  items={filtered}
                  bgColor='bg-orange-500'
                  onAddToOrder={memoizedAddItem}
                />
              </div>
            );
          })}
        </main>
        <Footer />
      </div>

      {showScrollButtons && (
        <div className="fixed right-2 bottom-20 flex flex-col gap-2 z-40">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={BUTTON_CLASSES.scrollButton}>
            <ChevronUp className="w-5 h-5" />
          </button>
          <button onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })} className={BUTTON_CLASSES.scrollButton}>
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      )}

      {isMobile && totalItemsCount > 0 && (
        <button id="mobile-cart-button" onClick={toggleMobileCart}
          className={`fixed bottom-4 left-4 right-4 backdrop-blur-xl text-gray-800 py-4 px-6 rounded-full flex items-center justify-center z-50 border border-white/50 hover:bg-white/10 transition-all duration-300`}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.18)'
          }}>
          <div className="relative flex-shrink-0">
            <div className={`w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center ${cartAnimation ? 'animate-cart-mobile-pulse' : ''}`}>
              <ShoppingCart className={`w-5 h-5 ${cartAnimation ? 'animate-cart-shake' : ''}`} />
            </div>
            {totalItemsCount > 0 && (
              <span className={`absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold`}>
                {totalItemsCount}
              </span>
            )}
          </div>
          <span className="font-bold text-lg ml-3">
            Warenkorb ansehen ({items.reduce((sum, item) => {
              const basePrice = item.selectedSize ? item.selectedSize.price : item.menuItem.price;
              const extrasPrice = (item.selectedExtras?.length || 0) * 1.00;
              return sum + ((basePrice + extrasPrice) * item.quantity);
            }, 0).toFixed(2).replace('.', ',')} €)
          </span>
        </button>
      )}

      {isMobile && showMobileCart && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMobileCart} />
          <div id="mobile-cart-sidebar"
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl z-50 max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b bg-orange-500 text-white rounded-t-xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Warenkorb ({totalItemsCount})
              </h2>
              <button onClick={closeMobileCart}
                className="p-2 hover:bg-orange-600 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <OrderForm
                onCloseMobileCart={closeMobileCart}
                hideTitle={true}
              />
            </div>
          </div>
        </>
      )}

      {/* Popular Item Modal */}
      {selectedPopularItem && (
        <ItemModal
          item={selectedPopularItem}
          isOpen={!!selectedPopularItem}
          onClose={() => setSelectedPopularItem(null)}
          onAddToOrder={memoizedAddItem}
        />
      )}

      <StoreClosedModal
        isOpen={showClosedModal}
        onClose={() => {
          setShowClosedModal(false);
          setPendingItem(null);
        }}
        onPreOrder={() => {
          setShowClosedModal(false);
          if (pendingItem) {
            // If it was just an item selection (needs config), open the modal for it
            const item = pendingItem.item;
            const needsConfig = isConfigurableItem(item);

            if (needsConfig && !pendingItem.size && !pendingItem.ingredients) {
              setSelectedPopularItem(item);
            } else {
              // Directly add if it's already configured or doesn't need config
              addItem(
                item,
                {
                  selectedSize: pendingItem.size,
                  selectedIngredients: pendingItem.ingredients,
                  selectedExtras: pendingItem.extras,
                  selectedPastaType: pendingItem.pastaType,
                  selectedSauce: pendingItem.sauce,
                  selectedExclusions: pendingItem.exclusions,
                  selectedSideDish: pendingItem.sideDish,
                  selectedDrink: pendingItem.drink,
                }
              );
              triggerCartAnimation();
              if (isMobile) setShowMobileCart(true);
            }
            setPendingItem(null);
          }
        }}
        nextOpenTime={storeStatus.nextOpen}
        nextDeliveryTime={storeStatus.nextDeliveryOpen}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
    </div>
  );
}

export default HomePage;
