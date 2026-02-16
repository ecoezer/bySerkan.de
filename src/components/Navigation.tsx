import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuSection } from '../types';

interface NavigationProps {
  sections?: MenuSection[];
}

const Navigation = ({ sections = [] }: NavigationProps) => {
  const [activeSection, setActiveSection] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set initial active section
  useEffect(() => {
    if (sections.length > 0 && !activeSection) {
      setActiveSection(sections[0].id);
    }
  }, [sections]);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check scroll position and update arrow visibility
  const updateArrowVisibility = () => {
    const container = scrollContainerRef.current;
    if (!container) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    // Add a small buffer (5px) to account for rounding errors and ensure we only show arrows when actually needed
    const isScrollable = scrollWidth > clientWidth + 5;

    // Only show arrows if content actually overflows and scrolling is needed
    if (!isScrollable) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      return;
    }

    // Show left arrow only if we can scroll left (not at the beginning)
    setShowLeftArrow(scrollLeft > 10);
    // Show right arrow only if we can scroll right (not at the end)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Update arrow visibility on scroll and resize
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => updateArrowVisibility();
    const handleResize = () => {
      setTimeout(updateArrowVisibility, 100);
    };

    // Also listen for content changes that might affect scrollability
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateArrowVisibility, 50);
    });

    resizeObserver.observe(container);

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Initial check
    setTimeout(updateArrowVisibility, 100);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0.1 }
    );

    const sections = document.querySelectorAll('div[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.6;
    const currentScroll = container.scrollLeft;
    const targetScroll = direction === 'left'
      ? Math.max(0, currentScroll - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, currentScroll + scrollAmount);

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  const handleItemClick = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full sticky top-0 z-50 bg-white border-b border-gray-100 lg:pr-80">
      <div className="max-w-7xl mx-auto px-4 lg:pr-0 lg:max-w-none">
        <div className="flex items-center h-16">

          {/* Left Arrow */}
          {showLeftArrow && (
            <div className="flex-shrink-0 pr-2">
              <button
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Nach links scrollen"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <div
            ref={scrollContainerRef}
            className="flex items-center justify-start gap-3 overflow-x-auto scrollbar-hide flex-1 px-2 py-1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            {sections.map((section) => {
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => handleItemClick(section.id)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-base font-bold transition-all duration-300 whitespace-nowrap ${isActive
                    ? 'bg-gray-900 text-white shadow-md transform scale-105'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                    }`}
                  style={{
                    scrollSnapAlign: 'start'
                  }}
                >
                  {section.title}
                </button>
              );
            })}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <div className="flex-shrink-0 pl-2">
              <button
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Nach rechts scrollen"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Navigation;