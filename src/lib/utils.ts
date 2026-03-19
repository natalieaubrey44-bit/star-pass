/**
 * cn — Merges Tailwind class names and resolves conflicts (tailwind-merge + clsx).
 * Use for conditional or composed className props.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Restrict input to digits only; optional max length (e.g. 5 or 10 for US ZIP). */
export function onlyDigits(value: string, maxLength = 10): string {
  const digits = value.replace(/\D/g, "").slice(0, maxLength);
  return digits;
}

/** Restrict input to letters, spaces, hyphens, apostrophes (for names). */
export function onlyName(value: string, maxLength = 120): string {
  return value.replace(/[^A-Za-z\s\-'.]/g, "").slice(0, maxLength);
}

/** Restrict input to typical address chars: letters, digits, spaces, # - . , */
export function onlyAddress(value: string, maxLength = 200): string {
  return value.replace(/[^A-Za-z0-9\s#\-.,]/g, "").slice(0, maxLength);
}
