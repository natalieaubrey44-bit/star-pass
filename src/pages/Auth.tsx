import React, { useState } from 'react';
import { getRememberMePreference, setRememberMePreference, supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, UserPlus, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(getRememberMePreference());
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const allowedDomains = new Set([
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
  ]);

  const isAllowedEmail = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const atIndex = normalized.lastIndexOf('@');
    if (atIndex === -1) return false;
    const domain = normalized.slice(atIndex + 1);
    if (!domain) return false;
    if (allowedDomains.has(domain)) return true;
    if (domain.endsWith('.edu')) return true;
    return false;
  };

  const isValidEmailFormat = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isStrongPassword = (value: string) => {
    if (value.length < 8) return false;
    if (!/[A-Z]/.test(value)) return false;
    if (!/[a-z]/.test(value)) return false;
    if (!/[0-9]/.test(value)) return false;
    if (!/[^A-Za-z0-9]/.test(value)) return false;
    return true;
  };

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const showPasswordChecks = !isLogin && password.length > 0;
  const showEmailError = !isLogin && email.length > 0;
  const emailIsValid = isValidEmailFormat(email) && isAllowedEmail(email);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      setRememberMePreference(rememberMe);
      if (isLogin) {
        if (!email.includes('@')) {
          toast.error('Please sign in with your email address.');
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        localStorage.removeItem("starpass_pending_verification");
        toast.success('Successfully logged in!');
        navigate('/dashboard');
        return;
      }

      if (!username.trim()) {
        toast.error('Please enter a username.');
        return;
      }

      if (!emailIsValid) {
        toast.error(`Email address "${email}" is invalid.`);
        return;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }

      if (!isStrongPassword(password)) {
        toast.error('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            username: username.trim(),
          },
        },
      });
      if (error) throw error;

      const isVerified = Boolean(
        data.user?.email_confirmed_at || data.user?.confirmed_at,
      );

      if (!data.session || !isVerified) {
        localStorage.setItem("starpass_pending_verification", email);
        toast.success('Registration successful! Check your email to verify your account.');
        navigate('/');
        return;
      }

      localStorage.removeItem("starpass_pending_verification");
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6 pt-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-8 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-black/5"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 font-medium">
            {isLogin ? 'Sign in to manage your cards' : 'Join StarPass Studio today'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-900 ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none text-gray-900"
                  required
                />
              </div>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-900 ml-1">
              {isLogin ? 'Email or Username' : 'Email'}
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type={isLogin ? 'text' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isLogin ? 'you@example.com or username' : 'you@example.com'}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none text-gray-900"
                required
              />
            </div>
            {showEmailError && !emailIsValid && (
              <p className="text-xs text-red-500 font-medium ml-1">
                Email address "{email}" is invalid.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-900 ml-1">
              {isLogin ? 'Password' : 'New Password'}
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none text-gray-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {showPasswordChecks && (
              <div className="text-xs font-medium ml-1 space-y-1">
                <p className={passwordChecks.length ? 'text-emerald-600' : 'text-gray-400'}>
                  At least 8 characters
                </p>
                <p className={passwordChecks.upper ? 'text-emerald-600' : 'text-gray-400'}>
                  Includes an uppercase letter
                </p>
                <p className={passwordChecks.lower ? 'text-emerald-600' : 'text-gray-400'}>
                  Includes a lowercase letter
                </p>
                <p className={passwordChecks.number ? 'text-emerald-600' : 'text-gray-400'}>
                  Includes a number
                </p>
                <p className={passwordChecks.symbol ? 'text-emerald-600' : 'text-gray-400'}>
                  Includes a symbol
                </p>
              </div>
            )}
          </div>
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-900 ml-1">
                New Password Again
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none text-gray-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-xs text-red-500 font-medium ml-1">
                  Passwords do not match.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-gray-600 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  setRememberMe(e.target.checked);
                  setRememberMePreference(e.target.checked);
                }}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Remember me
            </label>
          </div>

          <Button type="submit" className="w-full py-4 rounded-2xl text-lg mt-2" isLoading={loading}>
            {isLogin ? (
              <>Sign In <LogIn className="ml-2 w-5 h-5" /></>
            ) : (
              <>Register <UserPlus className="ml-2 w-5 h-5" /></>
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-bold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};