/**
 * Hero.tsx — Landing hero: headline, CTA, and card preview. Uses external placeholder images (picsum).
 * Production: replace picsum URLs with own assets or CDN.
 */
import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "./ui/Button";

export const Hero = ({ onStart }: { onStart: () => void }) => (
  <section className="pt-24 md:pt-32 pb-12 md:pb-24 px-4 sm:px-6 overflow-hidden">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center lg:text-left relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-100"
        >
          <Sparkles className="w-3.5 h-3.5" />
          New: HD Templates Available
        </motion.div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.1] mb-5">
          Your Official <br />
          <span className="text-indigo-600 relative">
            Digital Fan
            <svg
              className="absolute -bottom-1 left-0 w-full h-2 text-indigo-200/60 -z-10"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 25 0, 50 5 T 100 5"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
              />
            </svg>
          </span>{" "}
          <br />
          Pass.
        </h1>
        <p className="text-sm md:text-lg text-gray-500 mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
          Design a shareable, HD fan card in under a minute.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
          <Button
            onClick={onStart}
            size="lg"
            pill
            className="w-full sm:w-auto"
          >
            Create Your Card <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4 px-2">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
                >
                  {/* TODO: Replace with self-hosted images at end of project */}
                  <img
                    src={`https://picsum.photos/seed/user${i}/100/100`}
                    alt="User"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">500k+ Fans</p>
              <p className="text-xs text-gray-400 font-medium">
                Already joined
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
        className="relative px-4 sm:px-0 lg:ml-auto"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50 -z-10" />

        <div className="aspect-4/5 w-full max-w-[400px] mx-auto bg-white p-3 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] relative group">
          <div className="w-full h-full rounded-[36px] overflow-hidden relative">
            {/* TODO: Replace with self-hosted images at end of project */}
            <img
              src="https://picsum.photos/seed/fancard/800/1000"
              alt="Fan Card Preview"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
              <div className="text-white">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-3">
                  Official Member
                </p>
                <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                  Alex <br /> Johnson
                </h3>
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 -right-4 md:-bottom-12 md:-right-12 p-6 rounded-3xl shadow-2xl flex items-center gap-5 border border-black/5 backdrop-blur-sm bg-white/90"
          >
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <CheckCircle className="text-emerald-500 w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">Verified HD</p>
              <p className="text-sm text-gray-500 font-medium">
                Ready to download
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);
