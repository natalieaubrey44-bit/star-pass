/**
 * CardTemplate.tsx — Renders the printable card layout (800×1000) for capture via html-to-image.
 * Used both in Generator (off-screen for PNG export) and for preview. Tier drives accent colors.
 */
import React from "react";
import { cn } from "../lib/utils";
import { ShieldCheck, Star, MapPin } from "lucide-react";
import type { CardFormData, Tier, TemplateRecord } from "../types";

interface CardTemplateProps {
  formData: CardFormData;
  template: TemplateRecord | null;
  selectedTier: Tier | null;
}

export const CardTemplate = ({
  formData,
  template,
  selectedTier,
}: CardTemplateProps) => {
  if (!template) return null;

  // Tier specific accent colors
  const tierConfig: Record<string, { color: string; badgeGlow: string }> = {
    Silver: { color: "#94a3b8", badgeGlow: "shadow-slate-400/20" },
    Diamond: { color: "#818cf8", badgeGlow: "shadow-indigo-500/30" },
    Platinum: { color: "#fbbf24", badgeGlow: "shadow-yellow-500/40" },
  };

  const currentTierStyle = tierConfig[selectedTier?.name] || tierConfig.Silver;
  const celebrityName = template.name || "Celebrity";

  return (
    <div
      id="star-card-capture"
      className="relative overflow-hidden bg-[#050505]"
      style={{
        width: "800px",
        height: "1000px",
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(10deg); }
          100% { transform: translateX(200%) rotate(10deg); }
        }
        .shimmer-badge::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right,
            transparent 20%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 80%
          );
          animation: shimmer 4s infinite linear;
          pointer-events: none;
        }
      `}</style>

      {/* 1. Subtle Accent Glow (Near invisible for true minimalist feel) */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${currentTierStyle.color}15 0%, transparent 70%)`,
        }}
      />

      {/* 2. Top Header - Name Only (Scaled down) */}
      <div className="absolute top-12 w-full flex flex-col items-center z-30">
        <h1 className="text-5xl font-black text-white px-10 leading-tight text-center tracking-tighter">
          {formData.cardFor || "Your Name"}
        </h1>
      </div>

      {/* 3. Verified Badge - Top Right (Scaled up for better visibility) */}
      <div className="absolute top-8 right-8 z-40 scale-90 origin-top-right overflow-hidden rounded-2xl">
        <div className="shimmer-badge bg-white/5 backdrop-blur-3xl border border-white/10 p-5 flex flex-col items-center gap-1.5">
          <ShieldCheck
            className="w-12 h-12"
            style={{ color: currentTierStyle.color }}
          />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">
            Verified
          </span>
          <span
            className="text-[11px] font-black uppercase tracking-[0.2em]"
            style={{ color: currentTierStyle.color }}
          >
            Fan Member
          </span>
        </div>
      </div>

      {/* 3.5 Template Badge (Custom Image Badge from JSON) */}
      {template.badge && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: `${template.badge.x}px`,
            top: `${template.badge.y}px`,
            width: `${template.badge.w}px`,
            height: `${template.badge.h}px`,
          }}
        >
          <img
            src={template.badge.path}
            alt="Elite Badge"
            className="w-full h-full object-contain"
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* 4. Main Photo Area (Reduced to 260x260 Square) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-40 w-[280px] h-[280px] rounded-[32px] border-4 z-10 overflow-hidden shadow-2xl"
        style={{
          borderColor: `${currentTierStyle.color}44`,
          backgroundColor: "#000",
        }}
      >
        {/* User Photo */}
        {formData.photoUrl && (
          <img
            src={formData.photoUrl}
            alt="User"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Celebrity Inset Photo (Scaled down proportional) */}
        <div
          className="absolute bottom-2 right-2 w-16 h-20 rounded-xl border border-white/20 overflow-hidden shadow-2xl z-20 bg-black"
          style={{ borderColor: `${currentTierStyle.color}88` }}
        >
          <img
            src={template.path}
            alt="Celebrity"
            className="w-full h-full object-cover contrast-125"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* 5. Content Area (Aggressive reduction in font sizing and spacing) */}
      <div className="absolute top-[460px] w-full flex flex-col items-center text-center space-y-6 z-20">
        {/* Celebrity Name Label */}
        <div className="space-y-1">
          <span className="text-white text-5xl font-black tracking-tighter">
            {celebrityName}
          </span>
          <p
            className="text-xl font-bold uppercase tracking-[0.3em] opacity-60"
            style={{ color: currentTierStyle.color }}
          >
            Universal Fan Legend
          </p>
        </div>

        {/* Location (Smaller, cleaner) */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-full whitespace-nowrap">
          <MapPin className="w-4 h-4 text-white/40" />
          <span className="text-white/80 text-base font-bold">
            {formData.location || "Fan Location"}
          </span>
        </div>

        {/* Tier Pill (Slimmer) */}
        <div
          className={cn(
            "px-10 py-3 rounded-full font-black text-xl tracking-[0.2em] uppercase flex items-center gap-3 transition-opacity duration-500",
            currentTierStyle.badgeGlow,
          )}
          style={{ backgroundColor: currentTierStyle.color, color: "#000" }}
        >
          <Star className="w-5 h-5 fill-current" />
          {selectedTier?.name} Member
          <Star className="w-5 h-5 fill-current" />
        </div>

        {/* Member ID Box (Compact) */}
        <div className="w-[440px]">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden text-center group">
            <div
              className="absolute top-0 left-0 w-full h-0.5 opacity-40"
              style={{ backgroundColor: currentTierStyle.color }}
            />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 block">
              Official Registration ID
            </span>
            <span className="text-3xl font-mono font-black text-white tracking-widest leading-none">
              {formData.memberId?.split("-")[0] || "SP"}-
              <span style={{ color: currentTierStyle.color }}>
                {formData.memberId?.split("-")[1] || "XXXXXX"}
              </span>
              -{formData.memberId?.split("-")[2] || "0000"}
            </span>
          </div>
        </div>

        {/* Footer Info (Highly scaled down, spacious footer) */}
        <div className="w-[600px] flex justify-between items-center px-6 pt-8 border-t border-white/10">
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
              Joined
            </span>
            <span className="text-xl font-black text-white">
              {formData.memberSince || "MAR 15, 2026"}
            </span>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
              Expires
            </span>
            <span className="text-xl font-black text-white">
              {formData.validUntil || "MAR 15, 2027"}
            </span>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Accent */}
      <div
        className="absolute bottom-0 left-0 w-full h-px opacity-20"
        style={{
          background: `linear-gradient(90deg, transparent, ${currentTierStyle.color}, transparent)`,
        }}
      />
    </div>
  );
};
