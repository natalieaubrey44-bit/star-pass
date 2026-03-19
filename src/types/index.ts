/**
 * Shared domain types for StarPass Studio.
 * Centralizing types here avoids `any` and keeps contracts consistent across components.
 */

/** Tier option shown in pricing and generator */
export interface Tier {
  name: string;
  price: string;
  desc?: string;
  color?: string;
  accent?: string;
  textColor?: string;
  border?: string;
  shadow?: string;
  featured?: boolean;
}

/** Template definition from templates.json (minimal shape used by UI) */
export interface TemplateRecord {
  id: string;
  name: string;
  tier?: string;
  path: string;
  badge?: { path: string; x: number; y: number; w: number; h: number };
  [key: string]: unknown;
}

/** Form state for the card generator (step 1–3) */
export interface CardFormData {
  templateId: string;
  cardFor: string;
  location: string;
  photoUrl: string;
  previewUrl: string;
  memberId: string;
  memberSince: string;
  validUntil: string;
  alignment: string;
}

/** Single cart line item (in-memory) */
export interface CartItem {
  id: string;
  formData: CardFormData;
  tier: Tier;
  celebrityName: string;
  previewUrl?: string;
}

/** Lightweight cart payload stored in localStorage (no base64 previews). */
export type CardFormDataStored = Omit<CardFormData, "previewUrl">;
export type CartItemStored = Omit<CartItem, "previewUrl" | "formData"> & {
  formData: CardFormDataStored;
};

/** Shape of templates.json */
export interface TemplatesPayload {
  templates: TemplateRecord[];
}
