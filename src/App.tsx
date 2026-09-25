import React, { useState, useEffect, useCallback } from 'react';
import { CARDS_DATA } from './data';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { CardDetailScreen } from './components/CardDetailScreen';
import { CartScreen } from './components/CartScreen';
import { StoreLocatorModal } from './components/StoreLocatorModal';
import { CartItem, TradingCard, CardStoreInventory, BaseLocationStatus } from './types';
import { findNearestSingaporeArea } from './utils/geo';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'detail' | 'cart'>('home');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // User coordinates from browser's Geolocation API
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState(false);

  // Live location states: loading, empty, refused, unreachable, success
  const [baseLocation, setBaseLocation] = useState<string | null>(null);
  const [baseStatus, setBaseStatus] = useState<BaseLocationStatus>('loading');
  const [baseSentence, setBaseSentence] = useState<string>('Loading...');

  // Fetch live base location using browser's built-in Geolocation API
  const fetchBaseLocation = useCallback(async () => {
    setBaseStatus('loading');
    setBaseSentence('Loading...');

    // 7. Detect whether the application is running inside an iframe using: window.self !== window.top
    let isInsideIframe = false;
    try {
      isInsideIframe = window.self !== window.top;
    } catch {
      isInsideIframe = true;
    }

    if (isInsideIframe) {
      console.log('App is running inside an iframe. Geolocation may be restricted by the parent page\'s Permissions Policy.');
    }

    // 2. Before requesting location, log these diagnostics to the console:
    //    - window.isSecureContext
    //    - window.location.origin
    //    - whether navigator.geolocation exists
    const isSecureContext = typeof window !== 'undefined' ? window.isSecureContext : undefined;
    const locationOrigin = typeof window !== 'undefined' ? window.location?.origin : undefined;
    const hasGeolocation = Boolean(typeof navigator !== 'undefined' && 'geolocation' in navigator);

    console.log('Geolocation Diagnostic - window.isSecureContext:', isSecureContext);
    console.log('Geolocation Diagnostic - window.location.origin:', locationOrigin);
    console.log('Geolocation Diagnostic - navigator.geolocation exists:', hasGeolocation);

    // 3. Query the browser's geolocation permission using: navigator.permissions.query({ name: "geolocation" })
    //    Log whether the returned state is: granted, prompt, denied
    if (typeof navigator !== 'undefined' && navigator.permissions && typeof navigator.permissions.query === 'function') {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        console.log('Geolocation permission state:', permissionStatus.state);
      } catch (permError) {
        console.warn('Could not query navigator.permissions for geolocation:', permError);
      }
    }

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setBaseLocation(null);
      setBaseStatus('refused');
      setBaseSentence('Location access is unavailable or has been blocked.');
      return;
    }

    // 1. Inspect how navigator.geolocation.getCurrentPosition() is called
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords || {};

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
          setBaseLocation(null);
          setBaseStatus('empty');
          setBaseSentence('Location Empty');
          return;
        }

        // Store user coordinates for local Haversine distance calculations
        setUserCoords({ latitude, longitude });

        // Attempt serverless function to resolve area name
        try {
          const response = await fetch(`/api/location?lat=${latitude}&lon=${longitude}`);
          const contentType = response.headers.get('content-type') || '';

          if (contentType.includes('application/json') && response.ok) {
            const data = await response.json();
            const areaName = data?.area || data?.name;
            if (areaName && typeof areaName === 'string' && areaName.trim() !== '') {
              setBaseLocation(areaName.trim());
              setBaseStatus('success');
              setBaseSentence(areaName.trim());
              return;
            }
          }
        } catch (apiError) {
          console.warn('API location resolution error:', apiError);
        }

        // Resolve area locally from valid browser coordinates
        const fallbackArea = findNearestSingaporeArea(latitude, longitude);
        setBaseLocation(fallbackArea);
        setBaseStatus('success');
        setBaseSentence(fallbackArea);
      },
      (error: GeolocationPositionError) => {
        // 4. When navigator.geolocation.getCurrentPosition() fails, log complete error information:
        //    - error.code
        //    - error.message
        console.error('navigator.geolocation.getCurrentPosition() failed with error:', {
          code: error.code,
          message: error.message,
        });
        console.log('error.code:', error.code);
        console.log('error.message:', error.message);

        // 5. Distinguish between these GeolocationPositionError codes:
        //    1 = PERMISSION_DENIED
        //    2 = POSITION_UNAVAILABLE
        //    3 = TIMEOUT
        // 6. Do not display every geolocation failure as "Location access refused."
        //    Display:
        //    PERMISSION_DENIED: Location access is unavailable or has been blocked.
        //    POSITION_UNAVAILABLE: Your current location could not be determined.
        //    TIMEOUT: Determining your location took too long. Please try again.
        if (error.code === 1 /* PERMISSION_DENIED */) {
          console.log('Geolocation failure code 1: PERMISSION_DENIED');
          setBaseLocation(null);
          setBaseStatus('refused');
          setBaseSentence('Location access is unavailable or has been blocked.');
        } else if (error.code === 2 /* POSITION_UNAVAILABLE */) {
          console.log('Geolocation failure code 2: POSITION_UNAVAILABLE');
          setBaseLocation(null);
          setBaseStatus('unreachable');
          setBaseSentence('Your current location could not be determined.');
        } else if (error.code === 3 /* TIMEOUT */) {
          console.log('Geolocation failure code 3: TIMEOUT');
          setBaseLocation(null);
          setBaseStatus('unreachable');
          setBaseSentence('Determining your location took too long. Please try again.');
        } else {
          console.log(`Geolocation failure unknown code: ${error.code}`);
          setBaseLocation(null);
          setBaseStatus('unreachable');
          setBaseSentence('Your current location could not be determined.');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    fetchBaseLocation();
  }, [fetchBaseLocation]);

  // Scroll to top when switching between screens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentScreen, selectedCardId]);

  const handleSelectCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setCurrentScreen('detail');
  };

  const handleNavigateHome = () => {
    setCurrentScreen('home');
    setSelectedCardId(null);
  };

  const handleNavigateCart = () => {
    setCurrentScreen('cart');
  };

  const handleAddToCart = (card: TradingCard, store: CardStoreInventory) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.cardId === card.id && item.storeId === store.storeId
      );

      if (existingIndex > -1) {
        return prevItems.map((item, idx) => {
          if (idx === existingIndex) {
            const nextQty = Math.min(item.availableStock, item.quantity + 1);
            return { ...item, quantity: nextQty };
          }
          return item;
        });
      }

      const newItem: CartItem = {
        cardId: card.id,
        cardName: card.name,
        cardSubtitle: card.subtitle,
        cardNumber: card.cardNumber,
        inkColor: card.inkColor,
        rarity: card.rarity,
        artId: card.artId,
        storeId: store.storeId,
        storeName: store.storeName,
        storeLocation: store.location,
        storeNeighborhood: store.neighborhood,
        price: store.price,
        quantity: 1,
        availableStock: store.quantity,
        condition: store.condition,
      };

      return [...prevItems, newItem];
    });
  };

  const handleUpdateQuantity = (cardId: string, storeId: string, delta: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.cardId === cardId && item.storeId === storeId) {
          const nextQty = Math.max(1, Math.min(item.availableStock, item.quantity + delta));
          return { ...item, quantity: nextQty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (cardId: string, storeId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.cardId === cardId && item.storeId === storeId))
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const selectedCard = CARDS_DATA.find((c) => c.id === selectedCardId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Persistent Navigation Header */}
      <Navbar
        currentScreen={currentScreen}
        onNavigateHome={handleNavigateHome}
        onNavigateCart={handleNavigateCart}
        onOpenStoreLocator={() => setIsStoreLocatorOpen(true)}
        cartItemCount={totalCartCount}
        selectedCardName={selectedCard?.name}
        baseLocation={baseLocation}
        baseStatus={baseStatus}
        baseSentence={baseSentence}
        onRetryLocation={fetchBaseLocation}
      />

      {/* Main Content Area: Screen 1, Screen 2, or Screen 3 */}
      <div className="flex-1">
        {currentScreen === 'cart' ? (
          <CartScreen
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onNavigateHome={handleNavigateHome}
            onSelectCard={handleSelectCard}
          />
        ) : currentScreen === 'detail' && selectedCard ? (
          <CardDetailScreen
            card={selectedCard}
            onBack={handleNavigateHome}
            onAddToCart={handleAddToCart}
            onNavigateCart={handleNavigateCart}
            baseLocation={baseLocation}
            userCoords={userCoords}
          />
        ) : (
          <HomeScreen
            cards={CARDS_DATA}
            onSelectCard={handleSelectCard}
          />
        )}
      </div>

      {/* Singapore Hobby Store Locator Modal */}
      <StoreLocatorModal
        isOpen={isStoreLocatorOpen}
        onClose={() => setIsStoreLocatorOpen(false)}
        userCoords={userCoords}
        baseLocationName={baseLocation}
      />

      {/* Footer with context reminder */}
      <footer id="app-footer" className="py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p>© 2026 TCG Singles Exchange · Singapore Hobby Collective</p>
            <p className="text-slate-500 mt-0.5">
              Compare verified store stock, distances, and prices without reloading
            </p>
          </div>
          <div className="text-slate-400 text-xs sm:text-right">
            <span>Live area provided by </span>
            <span id="geolocation-api-badge" className="text-slate-300 font-medium">
              Browser Geolocation API
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

