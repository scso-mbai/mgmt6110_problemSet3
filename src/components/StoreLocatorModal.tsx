import React, { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Train,
  Bus,
  Accessibility,
  Clock,
  Phone,
  ExternalLink,
  ShieldCheck,
  Star,
  Search,
  Building2,
  Compass,
} from 'lucide-react';
import { HOBBY_STORES_DIRECTORY } from '../data';
import { calculateHaversineDistanceKm, formatStoreDistance, DEFAULT_SINGAPORE_COORDS } from '../utils/geo';

interface StoreLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords: { latitude: number; longitude: number } | null;
  baseLocationName?: string | null;
}

export const StoreLocatorModal: React.FC<StoreLocatorModalProps> = ({
  isOpen,
  onClose,
  userCoords,
  baseLocationName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('All');

  // Active coordinates: browser geolocation coords or Singapore Central reference
  const activeCoords = userCoords || DEFAULT_SINGAPORE_COORDS;
  const isLiveGps = !!userCoords;

  // Compute live Haversine distances for all hobby stores
  const storesWithDistance = useMemo(() => {
    const storeList = Object.values(HOBBY_STORES_DIRECTORY).map((store) => {
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

    // Default sort by closest distance
    return storeList.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [activeCoords]);

  // Neighborhoods list
  const neighborhoods = useMemo(() => {
    const set = new Set(storesWithDistance.map((s) => s.neighborhood));
    return ['All', ...Array.from(set)];
  }, [storesWithDistance]);

  // Filtered stores
  const filteredStores = useMemo(() => {
    return storesWithDistance.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.publicTransit.nearestMrt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesNeighborhood =
        selectedNeighborhood === 'All' || store.neighborhood === selectedNeighborhood;

      return matchesSearch && matchesNeighborhood;
    });
  }, [storesWithDistance, searchQuery, selectedNeighborhood]);

  if (!isOpen) return null;

  return (
    <div
      id="store-locator-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-locator-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/70 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 id="store-locator-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Singapore Hobby Store Locator
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
              <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Calculated straight-line distances via Haversine formula from{' '}
                <strong className="text-slate-200">
                  {isLiveGps
                    ? `${baseLocationName || 'Live GPS'} (${activeCoords.latitude.toFixed(4)}, ${activeCoords.longitude.toFixed(4)})`
                    : 'City Hall Reference (Central Singapore)'}
                </strong>
              </span>
            </p>
          </div>

          <button
            id="close-store-locator-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Close store locator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="store-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store name, MRT station, or area..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {neighborhoods.map((nh) => (
              <button
                key={nh}
                onClick={() => setSelectedNeighborhood(nh)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedNeighborhood === nh
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {nh}
              </button>
            ))}
          </div>
        </div>

        {/* Stores List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5 divide-y divide-slate-800/60">
          {filteredStores.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold">No hobby stores match your search.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedNeighborhood('All');
                }}
                className="mt-2 text-xs text-amber-400 underline font-medium"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredStores.map((store, index) => (
              <article
                key={store.id}
                id={`locator-store-${store.id}`}
                className={`pt-3.5 first:pt-0 rounded-xl transition ${
                  index === 0 ? 'bg-amber-500/5 p-3 border border-amber-500/20' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Store info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        {store.name}
                      </h3>
                      {store.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.5 rounded-md">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Store</span>
                        </span>
                      )}
                      {index === 0 && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-md">
                          Closest to You
                        </span>
                      )}
                    </div>

                    {/* Address & Neighborhood */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>
                        {store.location}{' '}
                        <strong className="text-amber-400 font-semibold">({store.neighborhood})</strong>
                      </span>
                    </div>

                    {/* Coordinates & Rating */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        GPS: {store.latitude.toFixed(4)}° N, {store.longitude.toFixed(4)}° E
                      </span>
                      <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{store.sellerRating.toFixed(1)}</span>
                        <span className="text-slate-500">({store.ratingCount})</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{store.openingHours}</span>
                      </span>
                    </div>
                  </div>

                  {/* Distance badge & directions button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-950/80 border border-sky-800/80 text-sky-300 font-black text-sm">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{store.formattedDistance}</span>
                      </div>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        {store.distanceKm.toFixed(2)} km straight-line
                      </span>
                    </div>

                    <a
                      id={`navigate-store-${store.id}`}
                      href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition border border-slate-700 active:scale-95"
                    >
                      <Navigation className="w-3 h-3 text-amber-400" />
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 ml-0.5" />
                    </a>
                  </div>
                </div>

                {/* Public-Transport Accessibility Card */}
                <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    <Train className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Public-Transport Accessibility</span>
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
                        <span className="font-semibold text-slate-200">Bus Services: </span>
                        <span>{store.publicTransit.busServices}</span>
                      </div>
                    </div>
                  </div>

                  {/* Accessibility & Step-free access */}
                  <div className="pt-1 border-t border-slate-800/80 flex items-start gap-1.5 text-slate-400 text-[11px]">
                    <Accessibility className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-300 font-semibold">Step-Free & Wheelchair: </strong>
                      <span>{store.publicTransit.accessibilitySummary}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">
            {filteredStores.length} hobby stores available across Singapore
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
