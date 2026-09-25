import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Layers,
} from 'lucide-react';
import { CartItem } from '../types';
import { CardArt } from './CardArt';

interface CartScreenProps {
  cartItems: CartItem[];
  onUpdateQuantity: (cardId: string, storeId: string, delta: number) => void;
  onRemoveItem: (cardId: string, storeId: string) => void;
  onClearCart: () => void;
  onNavigateHome: () => void;
  onSelectCard: (cardId: string) => void;
}

interface StoreGroup {
  storeName: string;
  location: string;
  neighborhood: string;
  items: CartItem[];
}

export const CartScreen: React.FC<CartScreenProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateHome,
  onSelectCard,
}) => {
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);

  // Group cart items by storeId
  const itemsByStore: Record<string, StoreGroup> = {};
  for (const item of cartItems) {
    if (!itemsByStore[item.storeId]) {
      itemsByStore[item.storeId] = {
        storeName: item.storeName,
        location: item.storeLocation,
        neighborhood: item.storeNeighborhood,
        items: [],
      };
    }
    itemsByStore[item.storeId].items.push(item);
  }

  const storeGroups: [string, StoreGroup][] = Object.entries(itemsByStore);

  // Overall grand total and total count
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCheckoutAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    setCheckoutCompleted(true);
  };

  if (checkoutCompleted) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 text-slate-100 animate-in fade-in">
        <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Order Confirmed!</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Your single card reservations have been dispatched to the {storeGroups.length}{' '}
            {storeGroups.length === 1 ? 'store' : 'stores'}. You can collect your cards in person or arrange local courier pickup.
          </p>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left max-w-md mx-auto text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Total Cards Reserved:</span>
              <strong className="text-white">{totalItemCount}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Stores Involved:</span>
              <strong className="text-white">{storeGroups.length}</strong>
            </div>
            <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800 font-medium">
              <span className="text-slate-200">Total Paid / Due at Pickup:</span>
              <strong className="text-amber-400 text-base">${totalCheckoutAmount.toFixed(2)}</strong>
            </div>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="checkout-return-catalog-btn"
              onClick={() => {
                onClearCart();
                onNavigateHome();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-4 pb-24 sm:py-6 text-slate-100">
      {/* Top Header & Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          id="cart-back-btn"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition font-semibold text-sm shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Back to Singles</span>
        </button>

        {cartItems.length > 0 && (
          <button
            id="clear-cart-btn"
            onClick={onClearCart}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/60 hover:bg-rose-950/70 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* Screen Title */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <ShoppingBag className="w-7 h-7 text-amber-400" />
          <span>Shopping Cart</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Review your chosen cards categorized by local vendor and calculate your checkout total.
        </p>
      </div>

      {/* Empty State */}
      {cartItems.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <ShoppingBag className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">Your Shopping Cart is Empty</h3>
          <p className="text-sm text-slate-400 mt-1.5 max-w-md mx-auto">
            You currently have 0 cards in your cart. Browse the catalog, compare store prices and distances, and add cards to your cart.
          </p>
          <button
            id="empty-cart-browse-btn"
            onClick={onNavigateHome}
            className="mt-6 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-md active:scale-95"
          >
            Browse Available Singles
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Store Categorized Groups */}
          <div className="space-y-6">
            {storeGroups.map(([storeId, group]) => {
              const storeSubtotal = group.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );
              const storeQuantity = group.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              );

              return (
                <section
                  key={storeId}
                  id={`cart-store-group-${storeId}`}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md"
                  aria-label={`Items from ${group.storeName}`}
                >
                  {/* Store Header */}
                  <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <h3 className="font-bold text-base text-white">
                          {group.storeName}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Vendor</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{group.location} ({group.neighborhood})</span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Store Subtotal ({storeQuantity} {storeQuantity === 1 ? 'card' : 'cards'})
                      </span>
                      <span className="text-lg font-black text-amber-400">
                        ${storeSubtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* List of cards from this store */}
                  <div className="divide-y divide-slate-800/70">
                    {group.items.map((item) => {
                      const itemTotal = item.price * item.quantity;

                      return (
                        <div
                          key={`${item.cardId}-${item.storeId}`}
                          id={`cart-item-${item.cardId}-${item.storeId}`}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition"
                        >
                          {/* Card details with visual artwork */}
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <div
                              onClick={() => onSelectCard(item.cardId)}
                              className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-700 cursor-pointer hover:border-amber-400 transition"
                            >
                              <CardArt
                                artId={item.artId}
                                inkColor={item.inkColor}
                                name={item.cardName}
                                className="w-full h-full"
                              />
                            </div>

                            <div className="min-w-0">
                              <h4
                                onClick={() => onSelectCard(item.cardId)}
                                className="font-bold text-sm text-white hover:text-amber-400 cursor-pointer truncate"
                              >
                                {item.cardName}
                              </h4>
                              <p className="text-xs text-slate-400 italic truncate">
                                {item.cardSubtitle}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                <span className="text-amber-300 font-medium">#{item.cardNumber}</span>
                                <span>•</span>
                                <span className="text-slate-300">{item.condition}</span>
                                <span>•</span>
                                <span>${item.price.toFixed(2)} each</span>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls & Line Total */}
                          <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/50">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-slate-700 rounded-lg bg-slate-950 overflow-hidden">
                                <button
                                  id={`qty-minus-${item.cardId}-${item.storeId}`}
                                  onClick={() => onUpdateQuantity(item.cardId, item.storeId, -1)}
                                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-40"
                                  disabled={item.quantity <= 1}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-3 text-xs font-bold text-white min-w-[28px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  id={`qty-plus-${item.cardId}-${item.storeId}`}
                                  onClick={() => onUpdateQuantity(item.cardId, item.storeId, 1)}
                                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-40"
                                  disabled={item.quantity >= item.availableStock}
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                id={`remove-item-${item.cardId}-${item.storeId}`}
                                onClick={() => onRemoveItem(item.cardId, item.storeId)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                                aria-label="Remove item from cart"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Item Line Total (large & readable at arm's length) */}
                            <div className="text-right min-w-[75px]">
                              <span className="text-base sm:text-lg font-black text-amber-400">
                                ${itemTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Checkout Total & Summary Card */}
          <section
            id="cart-checkout-summary"
            className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4"
            aria-label="Order Checkout Summary"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-semibold text-slate-300">Total Items in Cart</span>
              <span className="text-sm font-bold text-white">
                {totalItemCount} {totalItemCount === 1 ? 'card' : 'cards'} ({storeGroups.length}{' '}
                {storeGroups.length === 1 ? 'store' : 'stores'})
              </span>
            </div>

            {/* Total Breakdown by Store */}
            <div className="space-y-1.5 text-xs text-slate-400">
              {storeGroups.map(([storeId, group]) => {
                const subtotal = group.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );
                return (
                  <div key={storeId} className="flex justify-between">
                    <span>{group.storeName} ({group.items.length} titles)</span>
                    <span className="text-slate-200 font-mono">${subtotal.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Total Due upon Checking Out */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Upon Checking Out
                </span>
                <span className="text-xs text-slate-500">Includes all vendor items</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight leading-tight">
                ${totalCheckoutAmount.toFixed(2)}
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                id="proceed-checkout-btn"
                onClick={handleCheckout}
                className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base transition flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
              >
                <CreditCard className="w-5 h-5" />
                <span>Check Out (${totalCheckoutAmount.toFixed(2)})</span>
              </button>

              <button
                id="continue-shopping-btn"
                onClick={onNavigateHome}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition text-center"
              >
                Continue Shopping
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
