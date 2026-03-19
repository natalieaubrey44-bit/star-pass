/**
 * AuthConfirm.tsx — Safety-net route for /auth/confirm.
 *
 * With passwordless OTP, verification happens directly in Auth.tsx
 * via verifyOtp(). This page is kept as a fallback in case any old
 * email confirmation links (from the previous password-based flow)
 * are still floating around in inboxes. It attempts to pick up a
 * Supabase session from the URL hash and redirects accordingly.
 *
 * Route: /auth/confirm (registered in App.tsx)
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Status = "loading" | "success" | "error";

export const AuthConfirm: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handle = async () => {
      try {
        // Check if Supabase already picked up a session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          localStorage.removeItem("starpass_pending_verification");
          setStatus("success");
          toast.success("Signed in successfully!");
          setTimeout(() => navigate("/dashboard"), 1800);
          return;
        }

        // Try to exchange token from URL hash manually (legacy link flow)
        const hash = new URLSearchParams(
          window.location.hash.replace("#", "?")
        );
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (accessToken) {
          const { error: setErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken ?? "",
          });
          if (setErr) throw setErr;

          localStorage.removeItem("starpass_pending_verification");
          setStatus("success");
          toast.success("Signed in successfully!");
          setTimeout(() => navigate("/dashboard"), 1800);
          return;
        }

        // No session and no token — redirect to login
        throw new Error(
          "This link has expired or is invalid. Please sign in again."
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
        setErrorMessage(message);
        setStatus("error");
        toast.error(message);
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handle();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white p-10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-black/5 text-center space-y-6"
      >
        {status === "loading" && (
          <>
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Signing you in...
              </h2>
              <p className="text-gray-500 font-medium text-sm">
                Please wait a moment.
              </p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Signed in!
              </h2>
              <p className="text-gray-500 font-medium text-sm">
                Redirecting to your dashboard...
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Link Expired
              </h2>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                {errorMessage}
              </p>
              <p className="text-xs text-gray-400">
                Redirecting you back to sign in...
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};