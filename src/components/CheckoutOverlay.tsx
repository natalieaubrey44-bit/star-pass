/**
 * CheckoutOverlay.tsx â€” Modal flow: shipping â†’ payment â†’ success.
 * Resets stage and locks body scroll when open. Production: wire payment to real gateway and clear cart on success.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Truck,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { US_LOCATIONS } from "../lib/us-locations";
import { onlyDigits, onlyAddress, cn } from "../lib/utils";
import { Button } from "./ui/Button";
import { LocationSelect } from "./LocationSelect";

import { isEmailVerified } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import type { CartItem } from "../types";
import { toast } from "sonner";

interface CheckoutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  totalPrice: number;
  itemCount: number;
  cartItems: CartItem[];
  onSuccess: () => void;
}

export const CheckoutOverlay = ({
  isOpen,
  onClose,
  totalPrice,
  itemCount,
  cartItems,
  onSuccess,
}: CheckoutOverlayProps) => {
  const [stage, setStage] = useState<"shipping" | "payment" | "success">(
    "shipping",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const isVerified = isEmailVerified(user);

  React.useEffect(() => {
    if (isOpen) {
      setStage("shipping");
      setError(null);
      // Scroll Lock
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  const [shippingData, setShippingData] = useState({
    houseBuilding: "",
    street: "",
    areaDistrict: "",
    city: "",
    stateProvince: "",
    postalZip: "",
    country: "United States",
  });
  const [selectedPayment, setSelectedPayment] = useState<string>("credit");

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStage("payment");
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please sign in to complete your purchase.");
      return;
    }

    if (!isVerified) {
      const message = "Please verify your email to complete your purchase.";
      toast.error(message);
      setError(message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Always decline at this step - no DB write, cart preserved
    await new Promise((resolve) => setTimeout(resolve, 800));

    const paymentError =
      "Payment could not be processed. Error code: TRANSACTION_DECLINED_4021";
    setError(paymentError);
    toast.error(paymentError);
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-4xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {stage !== "shipping" && stage !== "success" ? (
                  <button
                    onClick={() => setStage("shipping")}
                    title="Go back to shipping details"
                    className="p-2 -ml-2 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    title="Close checkout"
                    className="p-2 -ml-2 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-indigo-600 shadow-indigo-100">
                    {stage === "shipping" ? (
                      <Truck className="text-white w-5 h-5" />
                    ) : stage === "payment" ? (
                      <CreditCard className="text-white w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="text-white w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h2
                      id="checkout-title"
                      className="text-xl font-bold text-gray-900"
                    >
                      {stage === "shipping"
                        ? "Shipping Details"
                        : stage === "payment"
                          ? "Payment Method"
                          : "Success!"}
                    </h2>
                    <p className="text-gray-500 text-xs font-medium">
                      Finalizing order for {itemCount}{" "}
                      {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                title="Close checkout"
                className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {stage === "shipping" && (
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                        House / Building
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="House #12"
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-sm"
                        value={shippingData.houseBuilding}
                        onChange={(e) =>
                          setShippingData({
                            ...shippingData,
                            houseBuilding: onlyAddress(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                        Street Name
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Main Street"
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-sm"
                        value={shippingData.street}
                        onChange={(e) =>
                          setShippingData({
                            ...shippingData,
                            street: onlyAddress(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                        Area / District
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Downtown"
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-sm"
                        value={shippingData.areaDistrict}
                        onChange={(e) =>
                          setShippingData({
                            ...shippingData,
                            areaDistrict: onlyAddress(e.target.value),
                          })
                        }
                      />
                    </div>
                    <LocationSelect
                      compact
                      selectedState={shippingData.stateProvince}
                      selectedCity={shippingData.city}
                      onStateChange={(s) =>
                        setShippingData((prev) => ({
                          ...prev,
                          stateProvince: s,
                          city: "",
                        }))
                      }
                      onCityChange={(c) =>
                        setShippingData((prev) => ({ ...prev, city: c }))
                      }
                      className="col-span-2"
                    />
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                        Postal / ZIP Code
                      </label>
                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="90210"
                        maxLength={10}
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-sm"
                        value={shippingData.postalZip}
                        onChange={(e) =>
                          setShippingData({
                            ...shippingData,
                            postalZip: onlyDigits(e.target.value, 10),
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={Object.values(shippingData).some((v) => v === "")}
                    className="w-full"
                  >
                    Continue to Payment{" "}
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              )}

              {stage === "payment" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600">
                      Select Payment Method
                    </label>
                    <div className="relative">
                      <select
                        title="Select Payment Method"
                        value={selectedPayment}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-gray-700 text-sm"
                      >
                        <option value="credit">
                          Credit / Debit Card (Visa, MC, AMEX)
                        </option>
                        <option value="gift">
                          Gift Card (StarPass Studio Credit)
                        </option>
                        <option value="paypal">PayPal (Secure Checkout)</option>
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                    </div>
                  </div>

                <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 flex items-center gap-4">
                  <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0" />
                  <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                    Your payment is secured with industry-standard 256-bit
                    encryption.
                  </p>
                </div>

                <Button
                  onClick={handlePayment}
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  Continue Payment - ${totalPrice}.00
                </Button>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}
              </div>
            )}

              {stage === "success" && (
                <div className="text-center py-8 space-y-6 relative overflow-hidden">
                  {/* Subtle Confetti/Particles */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 0, x: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: [-20, -100 - Math.random() * 100],
                        x: [
                          (Math.random() - 0.5) * 200,
                          (Math.random() - 0.5) * 400,
                        ],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeOut",
                      }}
                      className={cn(
                        "absolute left-1/2 top-1/2 w-2 h-2 rounded-full pointer-events-none",
                        i % 3 === 0
                          ? "bg-indigo-400"
                          : i % 3 === 1
                            ? "bg-purple-400"
                            : "bg-emerald-400",
                      )}
                    />
                  ))}

                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto relative z-10">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-3xl font-bold text-gray-900">
                      Order Placed!
                    </h3>
                    <p className="text-gray-500 font-medium tracking-tight">
                      Your physical Fan Cards will be shipped within 48 hours to{" "}
                      {shippingData.city}.
                    </p>
                  </div>
                  <Button
                    onClick={onClose}
                    variant="primary"
                    size="lg"
                    pill
                    className="w-full relative z-10"
                  >
                    Finish
                  </Button>
                </div>
              )}
            </div>

            {/* Summary Footer */}
            {stage !== "success" && (
              <div className="bg-gray-50 p-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Order Total
                  </p>
                  <p className="text-2xl font-black text-gray-900">
                    ${totalPrice}.00
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] font-bold">
                    Standard Shipping
                  </p>
                  <p className="text-indigo-600 text-sm font-bold">
                    Included Free
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
