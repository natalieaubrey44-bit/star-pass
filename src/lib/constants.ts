import { Tier } from "../types";

export const TIERS: Tier[] = [
  {
    name: "Silver",
    price: "500",
    desc: "High-Resolution PNG, Premium Template, Social Media Ready",
    color: "bg-slate-50",
    accent: "bg-slate-200",
    textColor: "text-slate-600",
    border: "border-slate-200",
    shadow: "hover:shadow-slate-200/50",
  },
  {
    name: "Diamond",
    price: "1000",
    desc: "Silver perks + Custom Text Alignment, Early Bird Entry, Digital Fan Badge",
    color: "bg-indigo-600",
    accent: "bg-indigo-500",
    textColor: "text-white",
    border: "border-indigo-500",
    featured: true,
    shadow: "shadow-2xl shadow-indigo-200 hover:shadow-indigo-300",
  },
  {
    name: "Platinum",
    price: "3000",
    desc: "Diamond perks + Backstage Access, Meet & Greet, 1-on-1 Q&A",
    color: "bg-zinc-900",
    accent: "bg-zinc-800",
    textColor: "text-white",
    border: "border-zinc-800",
    shadow: "hover:shadow-zinc-400/30",
  },
];

export const DEFAULT_TIER = TIERS[0];
