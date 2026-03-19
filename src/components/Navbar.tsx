import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ShoppingCart } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = ({
  onStart,
  onHome,
  cartCount,
  onCartClick,
}: {
  onStart: () => void;
  onHome: () => void;
  cartCount: number;
  onCartClick: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link 
          to="/"
          onClick={() => {
            onHome();
            navigate("/");
          }}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Star className="text-white w-6 h-6 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">StarPass <span className="text-indigo-600">Studio</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a
            href="/#how-it-works"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="hover:text-indigo-600 transition-colors"
          >
            How it Works
          </a>
          {user && (
            <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onCartClick}
            className="relative p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Button
                onClick={() => signOut()}
                variant="ghost"
                size="sm"
              >
                Logout
              </Button>
              <Button
                onClick={() => {
                  onHome();
                  onStart();
                }}
                variant="primary"
                size="sm"
                pill
              >
                Create Card
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Button
                onClick={() => {
                  onHome();
                  onStart();
                }}
                variant="primary"
                size="sm"
                pill
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={cn(
                  "w-full h-0.5 bg-current transition-all",
                  isOpen && "rotate-45 translate-y-2",
                )}
              />
              <span
                className={cn(
                  "w-full h-0.5 bg-current transition-all",
                  isOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "w-full h-0.5 bg-current transition-all",
                  isOpen && "-rotate-45 -translate-y-2",
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-black/5 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <a
                href="/#how-it-works"
                onClick={() => setIsOpen(false)}
                className="block text-lg font-medium text-gray-600"
              >
                How it Works
              </a>
              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-gray-600"
                >
                  Dashboard
                </Link>
              )}
              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="block text-lg font-medium text-red-600"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-indigo-600"
                >
                  Sign In
                </Link>
              )}
              <Button
                onClick={() => {
                  setIsOpen(false);
                  onHome();
                  onStart();
                }}
                className="w-full"
                pill
              >
                {user ? 'Create Card' : 'Get Started'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
