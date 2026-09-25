import React from 'react';
import { MapPin, Sparkles, ShoppingCart, Compass } from 'lucide-react';
import { BaseLocationStatus } from '../types';

interface NavbarProps {
  currentScreen: 'home' | 'detail' | 'cart';
  onNavigateHome: () => void;
  onNavigateCart: () => void;
  onOpenStoreLocator?: () => void;
  cartItemCount: number;
  selectedCardName?: string;
  baseLocation: string | null;
  baseStatus: BaseLocationStatus;
  baseSentence: string;
  onRetryLocation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigateHome,
  onNavigateCart,
  onOpenStoreLocator,
  cartItemCount,
  selectedCardName,
  baseLocation,
  baseStatus,
  baseSentence,
  onRetryLocation,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Web App Logo & Brand Header */}
        <button
          id="nav-brand-logo-btn"
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg p-0.5 transition hover:opacity-90 active:scale-95"
          aria-label="TCG Singles Exchange Home"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-900/40 shrink-0">
            <Sparkles className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white leading-tight">
                TCG Singles Exchange
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SG Hub
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden xs:block">Verified Vendors & Affordable Singles</p>
          </div>
        </button>

        {/* Right Top Bar Area: Store Locator + Your Base + Shopping Cart */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Store Locator Button */}
          {onOpenStoreLocator && (
            <button
              id="nav-store-locator-btn"
              onClick={onOpenStoreLocator}
              className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold transition active:scale-95"
              title="Open Singapore Hobby Store Locator"
              aria-label="Open Singapore Hobby Store Locator"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Stores</span>
            </button>
          )}

          {/* User Current Location Indicator */}
          <div
            id="user-base-indicator"
            className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/90 border border-slate-700/80 rounded-full py-1.5 px-2.5 sm:px-3 whitespace-nowrap shadow-inner"
            title={baseStatus === 'success' && baseLocation ? `Your Base: ${baseLocation}` : baseSentence}
          >
            <MapPin
              className={`w-3.5 h-3.5 shrink-0 ${
                baseStatus === 'success'
                  ? 'text-emerald-400'
                  : baseStatus === 'loading'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            />
            <span className="hidden sm:inline text-slate-400 font-medium">Your Base:</span>
            <span
              id="user-base-value"
              className={`font-semibold truncate max-w-[90px] sm:max-w-none ${
                baseStatus === 'success'
                  ? 'text-slate-200'
                  : baseStatus === 'loading'
                  ? 'text-amber-300'
                  : 'text-rose-300'
              }`}
            >
              {baseStatus === 'success' && baseLocation ? baseLocation : baseSentence}
            </span>
          </div>

          {/* Shopping Cart UI Element */}
          <button
            id="nav-shopping-cart-button"
            onClick={onNavigateCart}
            className={`relative flex items-center gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:px-3 rounded-full border transition active:scale-95 touch-manipulation focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              currentScreen === 'cart'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                : 'bg-slate-800/90 text-slate-200 border-slate-700/80 hover:bg-slate-700 hover:text-white'
            }`}
            aria-label={`Shopping cart with ${cartItemCount} items`}
          >
            <ShoppingCart
              className={`w-4 h-4 ${
                currentScreen === 'cart' ? 'text-slate-950' : 'text-amber-400'
              }`}
            />
            <span className="hidden sm:inline text-xs font-semibold">Cart</span>
            <span
              id="nav-cart-count-badge"
              className={`inline-flex items-center justify-center text-xs font-bold px-1.5 py-0.5 min-w-[20px] h-5 rounded-full ${
                currentScreen === 'cart'
                  ? 'bg-slate-950 text-amber-300'
                  : cartItemCount > 0
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {cartItemCount}
            </span>
          </button>
        </div>
      </div>

      {/* Informative status banner for loading/empty/refused/unreachable states (no spinner, pure sentence) */}
      {baseStatus !== 'success' && (
        <div
          id="location-status-banner"
          className="bg-slate-950/95 border-t border-slate-800/90 px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2"
        >
          <span className="font-semibold text-slate-400">Your Base Status:</span>
          <span id="base-status-sentence" className="text-slate-200">
            {baseSentence}
          </span>
          {onRetryLocation && baseStatus !== 'loading' && (
            <button
              onClick={onRetryLocation}
              className="ml-2 underline text-amber-400 hover:text-amber-300 text-[11px] font-medium"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </header>
  );
};
