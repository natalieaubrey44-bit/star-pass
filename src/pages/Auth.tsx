/**
 * Auth.tsx — Passwordless OTP authentication.
 * Screen 1: User enters their email address.
 * Screen 2: User enters the 6-digit OTP sent to their inbox.
 *
 * First-time users are created automatically by Supabase on first OTP verify.
 * Returning users get the same UUID back — purchase history is always intact.
 *
 * Supabase methods used:
 *   signInWithOtp({ email })              — sends the 6-digit code
 *   verifyOtp({ email, token, type })     — validates the code and creates session
 */
import React, { useState, useRef, useEffect } from "react";
import {
  getRememberMePreference,
  setRememberMePreference,
  supabase,
} from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Screen = "email" | "otp";

const OTP_LENGTH = 6;

export const Auth: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rememberMe, setRememberMe] = useState(getRememberMePreference());
  const navigate = useNavigate();

  // Refs for each OTP digit input box
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ── Screen 1: Send OTP ────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      setRememberMePreference(rememberMe);

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          // Creates the user automatically on first sign-in.
          // No emailRedirectTo needed — code is verified in-app.
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setEmail(trimmed);
      setScreen("otp");
      setResendCooldown(60);
      toast.success("Code sent! Check your inbox.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send code.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Screen 2: Verify OTP ─────────────────────────────────────────────────
  const handleVerifyOtp = async (code: string) => {
    if (code.length !== OTP_LENGTH) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (error) throw error;

      localStorage.removeItem("starpass_pending_verification");
      toast.success("Welcome to StarPass Studio!");
      navigate("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid or expired code.";
      toast.error(message);
      // Clear boxes and refocus first input on error
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;

      setOtp(Array(OTP_LENGTH).fill(""));
      setResendCooldown(60);
      toast.success("New code sent!");
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to resend code.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP digit input handlers ──────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next box after entry
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 slots are filled
    // Check the array directly — "123456".includes("") is always true in JS
    const fullCode = newOtp.join("");
    if (newOtp.every((d) => d !== "")) {
      handleVerifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[nextIndex]?.focus();

    if (pasted.length === OTP_LENGTH) {
      handleVerifyOtp(pasted);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6">
      <AnimatePresence mode="wait">

        {/* Screen 1 — Email entry */}
        {screen === "email" && (
          <motion.div
            key="email-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-black/5"
          >
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                Welcome
              </h2>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Enter your email and we'll send a 6-digit code to sign in or
                create your account. No password needed.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none text-gray-900 font-medium"
                    required
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-600 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => {
                    setRememberMe(e.target.checked);
                    setRememberMePreference(e.target.checked);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Keep me signed in
              </label>

              <Button
                type="submit"
                className="w-full py-4 rounded-2xl text-lg"
                isLoading={loading}
              >
                Send Code <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400 font-medium leading-relaxed px-4">
              A fresh 6-digit code is sent to your inbox every time you sign
              in. Your account and purchase history are always tied to your
              email address.
            </p>
          </motion.div>
        )}

        {/* Screen 2 — OTP entry */}
        {screen === "otp" && (
          <motion.div
            key="otp-screen"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-black/5"
          >
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                Check your inbox
              </h2>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                We sent a 6-digit code to{" "}
                <span className="font-bold text-gray-900">{email}</span>.
                <br />
                Enter it below — it expires in 10 minutes.
              </p>
            </div>

            {/* 6 digit input boxes */}
            <div
              className="flex justify-center gap-3 mb-8"
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={`otp-box-${index}`}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  autoFocus={index === 0}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={loading}
                  aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                  className="w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                />
              ))}
            </div>

            {/* Confirm button + verifying spinner */}
            <Button
              onClick={() => handleVerifyOtp(otp.join(""))}
              disabled={otp.some((d) => d === "") || loading}
              isLoading={loading}
              className="w-full mb-6"
            >
              Confirm Code
            </Button>

            {/* Resend + change email */}
            <div className="flex flex-col items-center gap-3 mt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Resend code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setScreen("email");
                  setOtp(Array(OTP_LENGTH).fill(""));
                }}
                className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
              >
                Use a different email
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};