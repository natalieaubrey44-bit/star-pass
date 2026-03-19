/**
 * Generator.tsx — Multi-step card builder: tier + photo → details + location → review & add to cart.
 * Uses an off-screen CardTemplate + html-to-image for preview capture. Avoids arbitrary delays where possible.
 */
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle,
  Upload,
  Loader2,
  ChevronDown,
  ShoppingCart,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn, onlyName } from "../lib/utils";
import templatesData from "../../templates.json";
import { CardTemplate } from "./CardTemplate";
import * as htmlToImage from "html-to-image";
import { US_LOCATIONS } from "../lib/us-locations";
import type {
  Tier,
  TemplateRecord,
  CardFormData,
  CartItem,
  TemplatesPayload,
} from "../types";
import { Button } from "./ui/Button";
import { LocationSelect } from "./LocationSelect";
import { TIERS, DEFAULT_TIER } from "../lib/constants";

const INITIAL_FORM: CardFormData = {
  templateId: "",
  cardFor: "",
  location: "",
  photoUrl: "",
  previewUrl: "",
  memberId: "",
  memberSince: "",
  validUntil: "",
  alignment: "center",
};

interface GeneratorProps {
  selectedTier: Tier | null;
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const Generator = ({
  selectedTier: initialTier,
  onBack,
  onAddToCart,
}: GeneratorProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState<Tier>(
    initialTier ?? DEFAULT_TIER,
  );
  const [availableTemplates, setAvailableTemplates] = useState<
    TemplateRecord[]
  >([]);

  const [formData, setFormData] = useState<CardFormData>({ ...INITIAL_FORM });

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);

  const templates = (templatesData as TemplatesPayload).templates;

  useEffect(() => {
    setAvailableTemplates(templates);
    if (templates.length > 0 && !formData.templateId) {
      setFormData((prev) => ({ ...prev, templateId: templates[0].id }));
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData((prev) => ({ ...prev, photoUrl: result }));
      setStep(2);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  /** Production: use crypto.randomUUID() for stable, non-guessable IDs. */
  const generateRandomMemberId = () => {
    return (
      "SC-" +
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8).toUpperCase()
        : Math.random().toString(36).substring(2, 10).toUpperCase()) +
      "-" +
      Math.floor(1000 + Math.random() * 9000)
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const generatePreview = async () => {
    if (
      !formData.cardFor ||
      !selectedState ||
      !selectedCity ||
      !formData.photoUrl
    )
      return;

    setLoading(true);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );

    try {
      const memberId = generateRandomMemberId();
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);

      const memberSince = formatDate(today);
      const validUntil = formatDate(nextYear);
      const location = `${selectedCity}, ${selectedState}`;

      setFormData((prev) => ({
        ...prev,
        memberId,
        memberSince,
        validUntil,
        location,
      }));

      // Let React commit the state update
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      if (templateRef.current) {
        // Wait for all images inside the template to finish loading
        const images = templateRef.current.querySelectorAll("img");
        await Promise.all(
          Array.from(images).map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete && img.naturalWidth > 0) {
                  resolve();
                } else {
                  img.onload = () => resolve();
                  img.onerror = () => resolve(); // don't block capture on broken images
                }
              }),
          ),
        );

        // Use html-to-image to capture the div
        const dataUrl = await htmlToImage.toPng(templateRef.current, {
          pixelRatio: 2,
          quality: 1,
          cacheBust: true,
        });

        setFormData((prev) => ({ ...prev, previewUrl: dataUrl }));
        setStep(3);
      }
    } catch (err) {
      console.error("Preview generation failed:", err);
      // Production: replace with toast or inline error state instead of alert()
      setFormData((prev) => ({ ...prev, previewUrl: "" }));
      setStep(2);
      toast.error("Failed to generate preview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate =
    templates.find((t) => t.id === formData.templateId) ?? templates[0];

  const handleAddToCartClick = () => {
    const cartItem: CartItem = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      formData: { ...formData },
      tier: { ...currentTier },
      celebrityName: selectedTemplate.name,
      previewUrl: formData.previewUrl,
    };
    onAddToCart(cartItem);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Hidden container for image capture */}
      <div className="fixed -left-500 top-0 pointer-events-none">
        <div ref={templateRef}>
          <CardTemplate
            formData={formData}
            template={selectedTemplate}
            selectedTier={currentTier}
          />
        </div>
      </div>

      <div className="bg-white rounded-4xl border border-black/5 shadow-2xl overflow-hidden">
        <div className="bg-gray-50 px-8 py-6 border-b border-black/5 flex justify-between items-center">
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={
                  step === i
                    ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }
                    : { scale: 1, opacity: 1 }
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors duration-500",
                  step >= i ? "bg-indigo-600" : "bg-gray-200",
                )}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Step {step} of 3
          </span>
        </div>

        <div className="p-5 md:p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-gray-900">
                    Start Your Card
                  </h2>
                  <p className="text-gray-500 font-medium">
                    Select your tier and setup your member photo.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-6">
                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          Pricing Plan
                        </label>
                        <div className="relative">
                          <select
                            title="Select Pricing Plan"
                            value={currentTier.name}
                            onChange={(e) => {
                              const tier = TIERS.find(
                                (t) => t.name === e.target.value,
                              );
                              if (tier) setCurrentTier(tier);
                            }}
                            className="w-full appearance-none bg-white border border-gray-200 px-6 py-4 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-gray-700"
                          >
                            {TIERS.map((t) => (
                              <option key={t.name} value={t.name}>
                                {t.name} Tier - ${t.price}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-gray-900">
                            {currentTier.name} Perks
                          </p>
                          <p className="text-xs text-gray-500">
                            Official Membership Status
                          </p>
                        </div>
                        <CheckCircle className="text-green-500 w-5 h-5" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() =>
                          formData.photoUrl
                            ? setStep(2)
                            : fileInputRef.current?.click()
                        }
                        className="w-full"
                      >
                        {formData.photoUrl
                          ? "Continue to Details"
                          : "Next Step"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={onBack}>
                        Return to Home
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                      Member Photo
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-gray-200 rounded-4xl overflow-hidden flex flex-col items-center justify-center relative hover:border-indigo-600 transition-all cursor-pointer group bg-gray-50/50"
                    >
                      <input
                        type="file"
                        title="Upload Member Photo"
                        placeholder="Upload Member Photo"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                      {formData.photoUrl ? (
                        <img
                          src={formData.photoUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-6">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                            {loading ? (
                              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            ) : (
                              <Upload className="w-8 h-8 text-gray-300" />
                            )}
                          </div>
                          <p className="font-bold text-gray-900">
                            Upload Photo
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG or JPG preferred
                          </p>
                        </div>
                      )}
                      {formData.photoUrl && (
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to change
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-gray-900">
                    Card Personalization
                  </h2>
                  <p className="text-gray-500 font-medium">
                    Customize how your official card looks.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-5">
                    <div className="grid gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">
                          Star Celebrity
                        </label>
                        <div className="relative">
                          <select
                            title="Select Star Celebrity"
                            value={formData.templateId}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                templateId: e.target.value,
                              }))
                            }
                            className="w-full appearance-none bg-white border border-gray-200 px-5 py-3.5 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-gray-700"
                          >
                            {availableTemplates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none w-4 h-4" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            value={formData.cardFor}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                cardFor: onlyName(e.target.value),
                              }))
                            }
                            placeholder="Full Name"
                            className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold placeholder:text-gray-300"
                          />
                        </div>
                        <LocationSelect
                          selectedState={selectedState}
                          selectedCity={selectedCity}
                          onStateChange={setSelectedState}
                          onCityChange={setSelectedCity}
                          className="sm:col-span-2"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <Button
                        onClick={generatePreview}
                        disabled={
                          !formData.cardFor || !selectedState || !selectedCity
                        }
                        isLoading={loading}
                        size="lg"
                        className="w-full"
                      >
                        Generate Preview
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setStep(1)}
                        className="w-full"
                      >
                        Return to Step 1
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">
                      Instant Preview
                    </label>
                    <div className="bg-indigo-50/50 p-8 rounded-4xl border border-indigo-100/50 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <ImageIcon className="w-8 h-8 text-indigo-200" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900">
                          Preview Locked
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-50">
                          Complete the details to generate your high-resolution
                          preview.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-bold">Review Your Card</h2>
                  <p className="text-gray-500">
                    Your official {currentTier.name} card is ready.
                  </p>
                </div>

                <div className="max-w-sm mx-auto aspect-4/5 rounded-4xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                  <img
                    src={formData.previewUrl}
                    alt="Final Card"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold">Member Price</p>
                      <p className="text-sm text-indigo-600 font-medium">
                        ${currentTier.price}.00 Unit
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddToCartClick}
                    isLoading={loading}
                    className="px-8"
                  >
                    Add to Cart
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setStep(2)}
                    className="w-full"
                  >
                    Edit Details
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onBack}>
                    Return to Homepage
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
