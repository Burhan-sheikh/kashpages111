import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  plan: string;
}

type AppRole = "admin" | "moderator" | "user";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, displayName: string, username: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    roles: [],
    loading: true,
    isAdmin: false,
  });

  const fetchProfile = async (userId: string) => {
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const roleList = (roles || []).map((r) => r.role as AppRole);
    setState((s) => ({
      ...s,
      profile: profile as Profile | null,
      roles: roleList,
      isAdmin: roleList.includes("admin"),
    }));
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setState((s) => ({ ...s, user: session?.user ?? null, session, loading: false }));
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setState((s) => ({ ...s, profile: null, roles: [], isAdmin: false }));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((s) => ({ ...s, user: session?.user ?? null, session, loading: false }));
      if (session?.user) fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName, username: username.toLowerCase().replace(/[^a-z0-9_]/g, "_") },
      },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
