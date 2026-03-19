/**
 * CartOverlay.tsx — Slide-out cart panel with item list, subtotal, and checkout CTA.
 * Composes CheckoutOverlay for payment flow. Cart items are typed for consistency.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingCart, Trash2, ArrowRight, Wallet, Image as ImageIcon } from "lucide-react";
import { CheckoutOverlay } from "./CheckoutOverlay";
import templatesData from "../../templates.json";
import type { CartItem, TemplatesPayload } from "../types";

const templates = (templatesData as TemplatesPayload).templates;
const templatePathById = new Map(templates.map((template) => [template.id, template.path]));

interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const CartOverlay = ({ isOpen, onClose, cart, onRemove, onClear }: CartOverlayProps) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const total = cart.reduce((sum, item) => sum + parseInt(item.tier.price, 10), 0);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                    <p className="text-xs text-gray-500 font-medium">{cart.length} {cart.length === 1 ? 'Item' : 'Items'} Ready</p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  title="Close Cart"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10 text-gray-300" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Your cart is empty</p>
                      <p className="text-sm">Start creating your first StarPass!</p>
                    </div>
                  </div>
                ) : (
                  cart.map((item) => {
                    const fallbackSrc = templatePathById.get(item.formData?.templateId ?? "") ?? "";
                    const imageSrc = item.previewUrl || fallbackSrc;

                    return (
                      <div key={item.id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex gap-4 group">
                        <div className="w-20 h-24 bg-gray-200 rounded-xl overflow-hidden shrink-0 border border-black/5 shadow-inner flex items-center justify-center">
                          {imageSrc ? (
                            <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">{item.tier.name} Tier</p>
                            <h3 className="font-bold text-gray-900 truncate">{item.formData.cardFor}</h3>
                            <p className="text-xs text-gray-500 font-medium">Fan of {item.celebrityName}</p>
                          </div>
                          <button 
                            onClick={() => onRemove(item.id)}
                            title="Remove item"
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="mt-3 font-black text-gray-900">${item.tier.price}.00</p>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Subtotal</p>
                      <p className="text-3xl font-black text-gray-900">${total}.00</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400">Shipping</p>
                      <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Included Free</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Wallet className="w-4 h-4 text-gray-400" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Secure Multi-Payment Gateway</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CheckoutOverlay 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        totalPrice={total}
        itemCount={cart.length}
        cartItems={cart}
        onSuccess={() => {
          onClear();
          setIsCheckoutOpen(false);
        }}
      />
    </>
  );
};
