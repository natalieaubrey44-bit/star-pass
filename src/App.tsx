/**
 * App.tsx — Root layout and state for StarCard.
 * Manages: generator visibility, selected tier, cart (with localStorage persistence), cart overlay.
 * Non–industry practices addressed: typed state, safe localStorage parse, single source of tier data.
 */
import React, { useState, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "./lib/utils";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Generator } from "./components/Generator";
import { CartOverlay } from "./components/CartOverlay";
import { Button } from "./components/ui/Button";
import { PageSection } from "./components/PageSection";
import type { Tier, CartItem, CartItemStored } from "./types";
import { useAuth } from "./context/AuthContext";
import { Auth } from "./pages/Auth";
import { AuthConfirm } from "./pages/AuthConfirm";
import { Dashboard } from "./pages/Dashboard";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { CheckCircle, Download, Image as ImageIcon, User, Star } from "lucide-react";
import { TIERS } from "./lib/constants";


const CART_STORAGE_KEY = "star_pass_cart";

const stripCartForStorage = (items: CartItem[]): CartItemStored[] =>
  items.map((item) => {
    const { previewUrl, formData, ...rest } = item;
    const { previewUrl: _previewUrl, ...restForm } = formData;
    return { ...rest, formData: restForm };
  });

/** Safe read of cart from localStorage; invalid JSON or wrong shape falls back to [] */
function readCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const stored = item as CartItemStored;
        const formData =
          stored.formData && typeof stored.formData === "object"
            ? stored.formData
            : ({} as CartItemStored["formData"]);

        return {
          ...(stored as Omit<CartItem, "formData" | "previewUrl">),
          formData: {
            ...formData,
            previewUrl: "",
          },
          previewUrl: "",
        } as CartItem;
      });
  } catch {
    return [];
  }
}


/** Protected Route wrapper */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [cart, setCart] = useState<CartItem[]>(readCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stripCartForStorage(cart)));
    } catch {
      // Ignore storage errors (quota, private mode) to avoid breaking the UI.
    }
  }, [cart]);

  const handleStart = useCallback((tierIndex: number = 1) => {
    if (!user) {
      toast.error("Please sign in to create a StarPass");
      navigate("/login");
      return;
    }

    if (window.location.pathname !== "/") {
      navigate("/");
    }

    setSelectedTier(TIERS[tierIndex] ?? TIERS[1]);
    setShowGenerator(true);
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-600">
      <Toaster position="top-center" richColors />
      <Navbar
        onStart={() => handleStart(1)}
        onHome={() => {
          setShowGenerator(false);
          setIsCartOpen(false);
        }}
        cartCount={cart.length}
        onCartClick={() => setIsCartOpen(true)}
      />

      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          !showGenerator ? (
            <>
              <Hero onStart={() => handleStart(1)} />
              {/* ... PageSections ... */}
                  <PageSection
                    id="how-it-works"
                    title="How It Works"
                    subtitle="Three simple steps to your official fan status."
                    background="bg-white border-y border-black/5"
                  >
                    <div className="grid md:grid-cols-3 gap-8">
                      {[
                        {
                          icon: ImageIcon,
                          title: "Choose Style",
                          desc: "Select from our premium celebrity-inspired templates.",
                          color: "bg-indigo-50 text-indigo-600"
                        },
                        {
                          icon: User,
                          title: "Personalize",
                          desc: "Upload your photo and enter your name for the card.",
                          color: "bg-purple-50 text-purple-600"
                        },
                        {
                          icon: Download,
                          title: "Download HD",
                          desc: "Get your high-resolution card ready for sharing.",
                          color: "bg-emerald-50 text-emerald-600"
                        },
                      ].map((step, i) => (
                        <div key={step.title} className="bg-gray-50/50 p-8 rounded-4xl text-center space-y-4 group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-300 border border-transparent hover:border-black/5">
                          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110", step.color)}>
                            <step.icon className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold">{step.title}</h3>
                          <p className="text-gray-500 leading-relaxed text-sm">
                            {step.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </PageSection>

                  <PageSection
                    id="pricing"
                    title="Choose Your Tier"
                    subtitle="Select the level of fan status you want to achieve. Each tier offers unique benefits and premium quality."
                    background="bg-gray-50/50"
                  >
                    <div className="grid md:grid-cols-3 gap-8 items-stretch">
                      {/* --- Silver Tier --- */}
                      <motion.div
                        whileHover={{ y: -8 }}
                        className="rounded-[28px] p-6 border-2 flex flex-col space-y-4 relative overflow-hidden transition-all duration-500 border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-200/50"
                      >
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50">
                            <Star className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-display font-bold text-gray-900">
                              Silver
                            </h3>
                            <p className="text-sm text-gray-500">
                              Premium Fan
                            </p>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-display font-bold text-gray-900">
                            $500
                          </span>
                        </div>

                        <div className="h-px w-full bg-gray-100" />

                        <ul className="space-y-5 grow text-gray-600">
                          <li className="flex items-center gap-4">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-indigo-50">
                              <CheckCircle className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="text-base font-medium">Early Ticket Access</span>
                          </li>
                          <li className="flex items-center gap-4">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-indigo-50">
                              <CheckCircle className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="text-base font-medium">Limited Edition Merchandise</span>
                          </li>
                          <li className="flex items-center gap-4">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-indigo-50">
                              <CheckCircle className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="text-base font-medium">Virtual Q&A</span>
                          </li>
                        </ul>

                        <Button
                          onClick={() => handleStart(0)}
                          className="w-full py-4 text-lg"
                          variant="primary"
                        >
                          Choose Silver
                        </Button>
                      </motion.div>

                        {/* --- Diamond Tier (Featured) --- */}
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          className="rounded-[28px] p-6 border-2 flex flex-col space-y-4 relative overflow-hidden transition-all duration-500 border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:shadow-indigo-300"
                        >
                          <div className="absolute top-6 right-6 bg-white text-indigo-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                            Most Popular
                          </div>

                          <div className="space-y-2">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500">
                              <Star className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-display font-bold text-white">
                                Diamond
                              </h3>
                              <p className="text-sm text-indigo-100">
                                VIP Fan
                              </p>
                            </div>
                          </div>

                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-display font-bold text-white">
                              $1000
                            </span>
                          </div>

                          <div className="h-px w-full bg-white/20" />

                          <ul className="space-y-5 grow text-indigo-50">
                            <li className="flex items-center gap-4">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-white/20">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-base font-medium">Priority Seating</span>
                            </li>
                            <li className="flex items-center gap-4">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-white/20">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-base font-medium">Signed Merchandise</span>
                            </li>
                            <li className="flex items-center gap-4">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-white/20">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-base font-medium">VIP Event Access</span>
                            </li>
                            <li className="flex items-center gap-4">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-white/20">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-base font-medium">Backstage Pass</span>
                            </li>
                          </ul>

                        <Button
                          onClick={() => handleStart(1)}
                          className="w-full py-4 text-lg"
                          variant="secondary"
                        >
                          Choose Diamond
                        </Button>
                      </motion.div>

                        {/* --- Platinum Tier --- */}
                        <motion.div
                          whileHover={{ y: -8 }}
                          className="rounded-[28px] p-6 border-2 flex flex-col space-y-4 relative overflow-hidden transition-all duration-500 border-zinc-800 bg-white hover:shadow-lg hover:shadow-zinc-400/30"
                        >
                          <div className="space-y-2">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50">
                              <Star className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-display font-bold text-gray-900">
                                Platinum
                              </h3>
                              <p className="text-sm text-gray-500">
                                Inner Circle
                              </p>
                            </div>
                          </div>

                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-display font-bold text-gray-900">
                              $3000
                            </span>
                          </div>

                          <div className="h-px w-full bg-gray-100" />

                          <ul className="space-y-5 grow text-gray-600">
                            <li className="flex items-center gap-4">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-indigo-50">
                                <CheckCircle className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="text-base font-medium">Meet & Greets</span>
                            </li>
                            <li className="flex items-center gap-4">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-indigo-50">
                                <CheckCircle className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="text-base font-medium">Private Event Access</span>
                            </li>
                            <li className="flex items-center gap-4">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-indigo-50">
                                <CheckCircle className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="text-base font-medium">Photo Op Access</span>
                            </li>
                            <li className="flex items-center gap-4">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-indigo-50">
                                <CheckCircle className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="text-base font-medium">Exclusive Private Meetups</span>
                            </li>
                            <li className="flex items-center gap-4">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-indigo-50">
                                <CheckCircle className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="text-base font-medium">One on One Q&A</span>
                            </li>
                          </ul>

                        <Button
                          onClick={() => handleStart(2)}
                          className="w-full py-4 text-lg"
                          variant="primary"
                        >
                          Choose Platinum
                        </Button>
                      </motion.div>
                    </div>
                  </PageSection>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-20"
                >
                  <Generator
                    selectedTier={selectedTier}
                    onBack={() => setShowGenerator(false)}
                    onAddToCart={(item: CartItem) => {
                      setCart((prev) => [...prev, item]);
                      setShowGenerator(false);
                      setIsCartOpen(true);
                    }}
                  />
                </motion.div>
              )
            } />
          </Routes>

      <CartOverlay 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        onRemove={(id: string) => setCart((prev) => prev.filter((item) => item.id !== id))}
        onClear={() => setCart([])}
      />

      <footer className="py-12 border-t border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <button 
            onClick={() => {
              setShowGenerator(false);
              navigate("/");
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Star className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">StarPass <span className="text-indigo-600">Studio</span></span>
          </button>
          <p className="text-xs text-gray-400">
            © 2026 StarPass Studio Inc. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-black transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}