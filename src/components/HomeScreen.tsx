import React, { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, ChevronRight, Store, Layers } from 'lucide-react';
import { TradingCard, InkColor, Rarity, CardType } from '../types';
import { CardArt } from './CardArt';

interface HomeScreenProps {
  cards: TradingCard[];
  onSelectCard: (cardId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ cards, onSelectCard }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInk, setSelectedInk] = useState<string>('All');
  const [selectedRarity, setSelectedRarity] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'market_asc' | 'market_desc' | 'quantity_desc' | 'name'>('market_desc');
  const [showFilters, setShowFilters] = useState(false);

  // Ink badges styling helper
  const getInkBadgeClasses = (ink: InkColor) => {
    switch (ink) {
      case 'Amethyst':
        return 'bg-purple-900/60 text-purple-200 border-purple-600/50';
      case 'Ruby':
        return 'bg-red-900/60 text-red-200 border-red-600/50';
      case 'Sapphire':
        return 'bg-sky-900/60 text-sky-200 border-sky-600/50';
      case 'Emerald':
        return 'bg-emerald-900/60 text-emerald-200 border-emerald-600/50';
      case 'Steel':
        return 'bg-slate-700/60 text-slate-200 border-slate-500/50';
      case 'Amber':
      default:
        return 'bg-amber-900/60 text-amber-200 border-amber-600/50';
    }
  };

  const getRarityBadgeClasses = (rarity: Rarity) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/50';
      case 'Super Rare':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/50';
      case 'Rare':
        return 'bg-sky-500/20 text-sky-300 border-sky-400/50';
      case 'Uncommon':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        const matchesSearch =
          card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.abilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.abilityText.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesInk = selectedInk === 'All' || card.inkColor === selectedInk;
        const matchesRarity = selectedRarity === 'All' || card.rarity === selectedRarity;
        const matchesType = selectedType === 'All' || card.cardType === selectedType;

        return matchesSearch && matchesInk && matchesRarity && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'market_desc') return b.marketPrice - a.marketPrice;
        if (sortBy === 'market_asc') return a.marketPrice - b.marketPrice;
        if (sortBy === 'quantity_desc') return b.totalQuantity - a.totalQuantity;
        return a.name.localeCompare(b.name);
      });
  }, [cards, searchQuery, selectedInk, selectedRarity, selectedType, sortBy]);

  const activeFiltersCount =
    (selectedInk !== 'All' ? 1 : 0) +
    (selectedRarity !== 'All' ? 1 : 0) +
    (selectedType !== 'All' ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedInk('All');
    setSelectedRarity('All');
    setSelectedType('All');
    setSortBy('market_desc');
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-4 pb-20 sm:py-6 sm:pb-24">
      {/* Intro Banner for Arm's Length Mobile Readability */}
      <section className="mb-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Single Cards Catalog
            </h2>
            <p className="text-sm text-slate-300 mt-0.5">
              Browse authentic single trading cards available from verified hobby shops in Singapore.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded-xl px-3 py-2 w-fit">
            <Store className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Click any card image to compare local store prices & distances</span>
          </div>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="mb-6 space-y-3" aria-label="Search and filter options">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            id="card-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by card name, subtitle, or ability..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition shadow-inner"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action controls: Filter Toggle & Sort Select */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            id="toggle-filters-btn"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${
              showFilters || activeFiltersCount > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <label htmlFor="sort-cards-select" className="sr-only">
              Sort cards
            </label>
            <select
              id="sort-cards-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="market_desc">Price: High to Low</option>
              <option value="market_asc">Price: Low to High</option>
              <option value="quantity_desc">Available Stock: Most First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div
            id="filter-panel"
            className="p-4 bg-slate-900/95 border border-slate-700 rounded-2xl space-y-4 animate-in fade-in duration-200"
          >
            {/* Ink Color Filter */}
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Ink Color
              </span>
              <div className="flex flex-wrap gap-2">
                {['All', 'Amber', 'Amethyst', 'Emerald', 'Ruby', 'Sapphire', 'Steel'].map((ink) => (
                  <button
                    key={ink}
                    id={`filter-ink-${ink.toLowerCase()}`}
                    onClick={() => setSelectedInk(ink)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      selectedInk === ink
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {ink}
                  </button>
                ))}
              </div>
            </div>

            {/* Rarity Filter */}
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Rarity
              </span>
              <div className="flex flex-wrap gap-2">
                {['All', 'Common', 'Uncommon', 'Rare', 'Super Rare', 'Legendary'].map((rarity) => (
                  <button
                    key={rarity}
                    id={`filter-rarity-${rarity.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setSelectedRarity(rarity)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      selectedRarity === rarity
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {rarity}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Type Filter */}
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Card Type
              </span>
              <div className="flex flex-wrap gap-2">
                {['All', 'Character', 'Item', 'Action'].map((type) => (
                  <button
                    key={type}
                    id={`filter-type-${type.toLowerCase()}`}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      selectedType === type
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Action */}
            {activeFiltersCount > 0 && (
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  id="reset-filters-btn"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between text-xs font-medium text-slate-400">
        <span>
          Showing <strong className="text-slate-200">{filteredCards.length}</strong> single cards
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-amber-400">Filtered results</span>
        )}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div className="text-center py-16 px-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">No trading cards matched your criteria</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing some filters to view available cards.
          </p>
          <button
            id="empty-reset-btn"
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-amber-400 transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Card List / Grid */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        aria-label="List of trading cards"
      >
        {filteredCards.map((card) => (
          <article
            key={card.id}
            id={`card-item-${card.id}`}
            className="group relative bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl overflow-hidden transition-all duration-200 shadow-md hover:shadow-xl flex flex-col"
          >
            {/* Card Image Area (Explicitly clickable as requested by prompt) */}
            <div
              className="relative cursor-pointer overflow-hidden bg-slate-950"
              onClick={() => onSelectCard(card.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCard(card.id);
                }
              }}
              aria-label={`View store comparison and details for ${card.name}`}
            >
              <CardArt
                artId={card.artId}
                inkColor={card.inkColor}
                name={card.name}
                className="transition-transform duration-300 group-hover:scale-[1.02]"
              />

              {/* Ink Cost Circle on Top Left */}
              <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-slate-950/90 border border-amber-400/80 shadow-lg flex items-center justify-center font-black text-sm text-amber-300">
                {card.cost}
              </div>

              {/* Card Set & Number Badge on Top Right */}
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-[11px] font-mono text-slate-300">
                #{card.cardNumber}
              </div>

              {/* Click prompt overlay on hover / tap */}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  Compare Stores <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card Meta & Stats Body */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                {/* Ink Color, Rarity & Type Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getInkBadgeClasses(
                      card.inkColor
                    )}`}
                  >
                    {card.inkColor}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getRarityBadgeClasses(
                      card.rarity
                    )}`}
                  >
                    {card.rarity}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {card.cardType}
                  </span>
                </div>

                {/* Card Title & Subtitle */}
                <h3
                  onClick={() => onSelectCard(card.id)}
                  className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-400 transition-colors cursor-pointer leading-snug"
                >
                  {card.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium mb-3 italic">
                  {card.subtitle}
                </p>

                {/* Card stats if character */}
                {card.strength !== undefined && (
                  <div className="flex items-center gap-3 py-1.5 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-3 text-xs">
                    <div className="flex items-center gap-1 text-slate-300">
                      <span className="text-slate-400">Strength:</span>
                      <strong className="text-white font-bold">{card.strength}</strong>
                    </div>
                    <div className="w-px h-3 bg-slate-700" />
                    <div className="flex items-center gap-1 text-slate-300">
                      <span className="text-slate-400">Willpower:</span>
                      <strong className="text-white font-bold">{card.willpower}</strong>
                    </div>
                    <div className="w-px h-3 bg-slate-700" />
                    <div className="flex items-center gap-1 text-amber-300">
                      <span>Lore:</span>
                      <strong className="font-black text-amber-300">{card.lore} ◊</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Market Price & Quantity Section (Large & Readable for phone arm's length) */}
              <div className="pt-3 border-t border-slate-800 flex items-end justify-between gap-2 mt-2">
                <div>
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Current Market Price
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight leading-tight">
                    ${card.marketPrice.toFixed(2)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Available Quantity
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 font-bold text-sm">
                    <span>{card.totalQuantity} in stock</span>
                  </div>
                </div>
              </div>

              {/* View Store Inventory Button */}
              <button
                id={`view-card-btn-${card.id}`}
                onClick={() => onSelectCard(card.id)}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-100 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 group-hover:bg-amber-500 group-hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-400 active:scale-[0.98]"
              >
                <Store className="w-4 h-4" />
                <span>Compare {card.stores.length} Local Stores</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};
