import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Star,
  Layers,
  ArrowUpDown,
  Navigation,
  DollarSign,
  Package,
  ShieldCheck,
  Building2,
  Info,
  ExternalLink,
  ShoppingCart,
  Train,
  Bus,
  Accessibility,
} from 'lucide-react';
import { TradingCard, CardStoreInventory, SortStoreOption } from '../types';
import { CardArt } from './CardArt';
import { USER_CURRENT_LOCATION } from '../data';
import { calculateHaversineDistanceKm, formatStoreDistance, DEFAULT_SINGAPORE_COORDS } from '../utils/geo';

interface CardDetailScreenProps {
  card: TradingCard;
  onBack: () => void;
  onAddToCart?: (card: TradingCard, store: CardStoreInventory) => void;
  onNavigateCart?: () => void;
  baseLocation?: string | null;
  userCoords?: { latitude: number; longitude: number } | null;
}

export const CardDetailScreen: React.FC<CardDetailScreenProps> = ({
  card,
  onBack,
  onAddToCart,
  onNavigateCart,
  baseLocation,
  userCoords,
}) => {
  const [storeSortBy, setStoreSortBy] = useState<SortStoreOption>('distance');
  const [selectedStoreNotice, setSelectedStoreNotice] = useState<string | null>(null);

  // Active coordinates: browser geolocation or Singapore central reference point
  const activeCoords = userCoords || DEFAULT_SINGAPORE_COORDS;
  const isLiveGps = !!userCoords;

  // Recalculate distanceKm using Haversine formula from user's live coordinates
  const storesWithDistance = useMemo(() => {
    return card.stores.map((store) => {
      const distanceKm = calculateHaversineDistanceKm(
        activeCoords.latitude,
        activeCoords.longitude,
        store.latitude,
        store.longitude
      );

      return {
        ...store,
        distanceKm,
        formattedDistance: formatStoreDistance(distanceKm),
      };
    });
  }, [card.stores, activeCoords]);

  // Calculate comparison highlights
  const comparisonStats = useMemo(() => {
    if (!storesWithDistance || storesWithDistance.length === 0) {
      return {
        minPrice: card.marketPrice,
        minDistance: 0,
        minDistanceFormatted: '0 m away',
        maxQuantity: 0,
        lowestPriceStore: '',
        closestStore: '',
      };
    }

    const minPriceStore = [...storesWithDistance].sort((a, b) => a.price - b.price)[0];
    const closestStore = [...storesWithDistance].sort((a, b) => a.distanceKm - b.distanceKm)[0];
    const maxQtyStore = [...storesWithDistance].sort((a, b) => b.quantity - a.quantity)[0];

    return {
      minPrice: minPriceStore.price,
      minDistance: closestStore.distanceKm,
      minDistanceFormatted: closestStore.formattedDistance,
      maxQuantity: maxQtyStore.quantity,
      lowestPriceStore: minPriceStore.storeName,
      closestStore: closestStore.storeName,
    };
  }, [storesWithDistance, card.marketPrice]);

  // Sort store listings according to user preference
  const sortedStores = useMemo(() => {
    return [...storesWithDistance].sort((a, b) => {
      if (storeSortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (storeSortBy === 'price') return a.price - b.price;
      if (storeSortBy === 'quantity') return b.quantity - a.quantity;
      return 0;
    });
  }, [storesWithDistance, storeSortBy]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-4 pb-24 sm:py-6 text-slate-100">
      {/* Top Mobile-Friendly Return Button */}
      <div className="mb-4 flex items-center justify-between">
        <button
          id="detail-back-button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition font-semibold text-sm shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Back to Singles</span>
        </button>

        <span className="text-xs font-mono text-slate-400">
          Card #{card.cardNumber}
        </span>
      </div>

      {/* SECTION 1: Thorough Display of Selected Card */}
      <section
        id="card-thorough-display"
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-8"
        aria-label="Thorough card display"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Card Artwork & Cost Column */}
          <div className="md:col-span-5 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
            <div className="w-full max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-900">
              <CardArt
                artId={card.artId}
                inkColor={card.inkColor}
                name={card.name}
                className="aspect-[4/3]"
              />

              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300">
                  {card.setName}
                </span>
                <span className="font-mono text-slate-400">
                  {card.cardNumber}
                </span>
              </div>
            </div>

            {/* Quick Card Stats Pill below image */}
            <div className="mt-4 w-full max-w-[280px] sm:max-w-[320px] grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                <span className="text-[10px] uppercase text-slate-400 block">Ink Cost</span>
                <strong className="text-base font-black text-amber-400">{card.cost}</strong>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                <span className="text-[10px] uppercase text-slate-400 block">Rarity</span>
                <strong className="text-xs font-bold text-slate-200 block truncate">{card.rarity}</strong>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                <span className="text-[10px] uppercase text-slate-400 block">Ink Color</span>
                <strong className="text-xs font-bold text-slate-200 block truncate">{card.inkColor}</strong>
              </div>
            </div>
          </div>

          {/* Card Details & Rules Text Column */}
          <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {card.inkColor} Ink
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                  {card.cardType}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                  {card.rarity}
                </span>
              </div>

              {/* Title and Subtitle */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {card.name}
              </h2>
              <p className="text-base text-slate-400 italic mb-4">
                {card.subtitle}
              </p>

              {/* Combat Stats (if character) */}
              {card.strength !== undefined && (
                <div className="inline-flex items-center gap-4 py-2 px-3.5 rounded-xl bg-slate-950 border border-slate-800 mb-5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">Strength:</span>
                    <span className="text-base font-black text-white">{card.strength}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-800" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">Willpower:</span>
                    <span className="text-base font-black text-white">{card.willpower}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-800" />
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <span className="text-xs font-medium">Lore:</span>
                    <span className="text-base font-black">{card.lore} ◊</span>
                  </div>
                </div>
              )}

              {/* Card Ability Description */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  {card.abilityName}
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {card.abilityText}
                </p>
              </div>

              {/* Flavor Text */}
              <p className="text-xs text-slate-400 italic border-l-2 border-amber-500/60 pl-3 py-0.5 mb-5">
                {card.flavorText}
              </p>
            </div>

            {/* Market Reference & Overall Stock Summary (Large phone arm's length readability) */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-4 rounded-xl">
              <div>
                <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                  TCG Market Benchmark
                </span>
                <div className="text-3xl font-black text-amber-400 leading-tight">
                  ${card.marketPrice.toFixed(2)}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Total Singapore Stock
                </span>
                <div className="text-base font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1 rounded-lg">
                  {card.totalQuantity} copies across {card.stores.length} stores
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notice Banner when clicking on a store or adding to cart */}
      {selectedStoreNotice && (
        <div
          id="store-interaction-toast"
          className="mb-6 p-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 flex items-center justify-between gap-3 animate-in fade-in"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{selectedStoreNotice}</span>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateCart && (
              <button
                onClick={onNavigateCart}
                className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded-lg transition"
              >
                View Cart
              </button>
            )}
            <button
              onClick={() => setSelectedStoreNotice(null)}
              className="text-xs font-bold text-amber-300 hover:text-white px-2 py-1 bg-amber-500/30 rounded-lg"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: Stores Comparison Section (Distance, Price, and Quantity) */}
      <section id="stores-comparison-section" aria-label="Store inventory and comparison">
        {/* Section Heading & User Base Reference */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Building2 className="w-6 h-6 text-amber-400" />
                <span>Store Availability & Price Comparison</span>
              </h3>
              <p className="text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Distances measured from your reference point:{' '}
                  <strong className="text-slate-100">
                    {baseLocation ? `${baseLocation}, Singapore` : USER_CURRENT_LOCATION}
                  </strong>
                </span>
              </p>
            </div>

            {/* Quick Highlight Cards */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 text-emerald-300 border border-emerald-800">
                Low: ${comparisonStats.minPrice.toFixed(2)}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-950/70 text-sky-300 border border-sky-800">
                Nearest: {comparisonStats.minDistanceFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Comparison Sorting Controls Bar */}
        <div className="mb-4 p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Compare Stores By:
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="sort-store-distance"
              onClick={() => setStoreSortBy('distance')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-bold border transition ${
                storeSortBy === 'distance'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Closest Distance</span>
            </button>

            <button
              id="sort-store-price"
              onClick={() => setStoreSortBy('price')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-bold border transition ${
                storeSortBy === 'price'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Lowest Price</span>
            </button>

            <button
              id="sort-store-quantity"
              onClick={() => setStoreSortBy('quantity')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-bold border transition ${
                storeSortBy === 'quantity'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Highest Stock</span>
            </button>
          </div>
        </div>

        {/* Stores List with Distance, Price, and Stock Comparison */}
        <div className="space-y-3.5">
          {sortedStores.map((store, index) => {
            const isLowestPrice = store.price === comparisonStats.minPrice;
            const isClosest = store.distanceKm === comparisonStats.minDistance;
            const priceDifference = store.price - card.marketPrice;

            return (
              <article
                key={store.storeId}
                id={`store-listing-${store.storeId}`}
                className={`p-4 sm:p-5 rounded-2xl bg-slate-900 border transition shadow-sm hover:shadow-md ${
                  isLowestPrice
                    ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : isClosest
                    ? 'border-sky-500/60 ring-1 ring-sky-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Store Name, Location, Rating */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        {store.storeName}
                      </h4>
                      {store.verifiedSeller && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Store</span>
                        </span>
                      )}
                      {isLowestPrice && (
                        <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                          ★ Best Price
                        </span>
                      )}
                      {isClosest && (
                        <span className="text-[11px] font-bold text-sky-300 bg-sky-500/20 border border-sky-500/40 px-2 py-0.5 rounded-full">
                          ★ Nearest Location
                        </span>
                      )}
                    </div>

                    {/* Physical Location */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>
                        {store.location}{' '}
                        <span className="text-amber-400 font-semibold">
                          ({store.neighborhood})
                        </span>
                      </span>
                    </div>

                    {/* Condition & Rating Details */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                      <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{store.sellerRating.toFixed(1)}</span>
                        <span className="text-slate-500">({store.ratingCount} reviews)</span>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-slate-300">
                        Condition: <strong className="text-white">{store.condition}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Comparison Data Columns: Distance, Quantity, Selling Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    {/* Distance from user */}
                    <div className="text-left sm:text-right min-w-[85px]">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Distance
                      </span>
                      <div className="flex items-center sm:justify-end gap-1 mt-0.5">
                        <Navigation className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span
                          className={`text-sm sm:text-base font-extrabold ${
                            isClosest ? 'text-sky-300 font-black' : 'text-slate-200'
                          }`}
                        >
                          {store.formattedDistance}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {isLiveGps ? 'from your location' : 'from City Hall'}
                      </span>
                    </div>

                    {/* Available Quantity */}
                    <div className="text-center sm:text-right min-w-[75px]">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        In Stock
                      </span>
                      <div className="mt-0.5 inline-flex items-center gap-1 text-sm sm:text-base font-extrabold text-emerald-400">
                        <Package className="w-3.5 h-3.5" />
                        <span>{store.quantity}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">available</span>
                    </div>

                    {/* Store Selling Price */}
                    <div className="text-right min-w-[95px]">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Store Price
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-amber-400 leading-tight">
                        ${store.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] font-semibold">
                        {priceDifference < 0 ? (
                          <span className="text-emerald-400">
                            -${Math.abs(priceDifference).toFixed(2)} vs mkt
                          </span>
                        ) : priceDifference > 0 ? (
                          <span className="text-rose-400">
                            +${priceDifference.toFixed(2)} vs mkt
                          </span>
                        ) : (
                          <span className="text-slate-400">At market avg</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Public-Transport Accessibility Block */}
                <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-slate-300">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-emerald-400">
                      <Train className="w-3.5 h-3.5" />
                      <span>Public-Transport Accessibility</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      GPS: {store.latitude.toFixed(4)}° N, {store.longitude.toFixed(4)}° E
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                    {/* Nearest MRT */}
                    <div className="flex items-start gap-1.5">
                      <Train className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">Nearest MRT: </span>
                        <span>{store.publicTransit.nearestMrt}</span>
                        <span className="block text-[11px] text-sky-300 font-medium">
                          {store.publicTransit.mrtDistance}
                        </span>
                      </div>
                    </div>

                    {/* Bus Services */}
                    <div className="flex items-start gap-1.5">
                      <Bus className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">Bus Lines: </span>
                        <span>{store.publicTransit.busServices}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step-Free / Barrier-Free Accessibility */}
                  <div className="pt-1.5 border-t border-slate-800/70 flex items-start gap-1.5 text-slate-400 text-[11px]">
                    <Accessibility className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-300 font-medium">Accessibility: </strong>
                      <span>{store.publicTransit.accessibilitySummary}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom interactive action row for this store */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span>In-store pickup & local courier delivery supported</span>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <a
                      id={`store-contact-btn-${store.storeId}`}
                      href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition flex items-center gap-1 active:scale-95"
                    >
                      <Navigation className="w-3 h-3 text-amber-400" />
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 ml-0.5" />
                    </a>

                    <button
                      id={`store-reserve-btn-${store.storeId}`}
                      onClick={() =>
                        setSelectedStoreNotice(
                          `Reserved 1x ${card.name} at ${store.storeName} for $${store.price.toFixed(
                            2
                          )} (${store.quantity} remaining in stock).`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition flex items-center gap-1 border border-slate-700"
                    >
                      <span>Hold</span>
                    </button>

                    <button
                      id={`store-add-cart-btn-${store.storeId}`}
                      onClick={() => {
                        if (onAddToCart) {
                          onAddToCart(card, store);
                          setSelectedStoreNotice(
                            `Added 1x ${card.name} from ${store.storeName} ($${store.price.toFixed(
                              2
                            )}) to your shopping cart!`
                          );
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Bottom Mobile Floating Navigation Bar */}
      <div className="mt-10 pt-4 border-t border-slate-800 flex items-center justify-center">
        <button
          id="bottom-back-home-btn"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 active:scale-95 shadow-lg border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Back to Singles</span>
        </button>
      </div>
    </main>
  );
};
