import type { User } from "@supabase/supabase-js";

export const isEmailVerified = (user: User | null | undefined) => {
  if (!user) return false;
  const typedUser = user as User & {
    email_confirmed_at?: string | null;
    confirmed_at?: string | null;
  };
  return Boolean(typedUser.email_confirmed_at || typedUser.confirmed_at);
};
