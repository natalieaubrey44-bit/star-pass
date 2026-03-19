/**
 * AuthConfirm.tsx — Handles the email confirmation redirect from Supabase.
 * Supabase appends a token to the URL hash after the user clicks the
 * confirmation link. This page processes that token, confirms the session,
 * and redirects the user to the dashboard on success or back to login on failure.
 *
 * Route: /auth/confirm
 * Add this route to App.tsx:
 *   <Route path="/auth/confirm" element={<AuthConfirm />} />
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const AuthConfirm: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        // Supabase puts the token in the URL hash as:
        // /auth/confirm#access_token=...&type=signup
        // getSession() automatically picks it up from the hash
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {
          // Session established — email is confirmed
          localStorage.removeItem("starpass_pending_verification");
          setStatus("success");
          toast.success("Email confirmed! Welcome to StarPass Studio.");

          // Give the user a moment to see the success screen
          setTimeout(() => navigate("/dashboard"), 2000);
          return;
        }

        // No session yet — try exchanging the token from the hash manually
        // This handles the case where getSession() doesn't auto-process the hash
        const hashParams = new URLSearchParams(
          window.location.hash.replace("#", "?")
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (accessToken && (type === "signup" || type === "email_change")) {
          const { error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken ?? "",
          });

          if (setError) throw setError;

          localStorage.removeItem("starpass_pending_verification");
          setStatus("success");
          toast.success("Email confirmed! Welcome to StarPass Studio.");
          setTimeout(() => navigate("/dashboard"), 2000);
          return;
        }

        // No token found at all
        throw new Error("No confirmation token found. The link may have expired.");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Email confirmation failed.";
        setErrorMessage(message);
        setStatus("error");
        toast.error(message);

        // Redirect back to login after a short delay
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleConfirmation();
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
                Confirming your email...
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
                Email Confirmed!
              </h2>
              <p className="text-gray-500 font-medium text-sm">
                Redirecting you to your dashboard...
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
                Confirmation Failed
              </h2>
              <p className="text-gray-500 font-medium text-sm">
                {errorMessage}
              </p>
              <p className="text-xs text-gray-400">
                Redirecting you back to login...
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};