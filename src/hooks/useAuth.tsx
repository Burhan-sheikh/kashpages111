import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const AuthContext = createContext<any>(null);
import { auth } from "@/integrations/firebase/client";
import type { User as FirebaseUser } from "firebase/auth";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  plan: string;
}

type AppRole = "admin" | "moderator" | "user";


interface AuthState {
  user: FirebaseUser | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    roles: [],
    loading: true,
    isAdmin: false,
  });

  const fetchProfile = async (userId: string) => {
    // Fetch profile
    const profileRes = await fetch(`http://localhost:3001/api/profile?uid=${userId}`);
    const profileData = profileRes.ok ? await profileRes.json() : null;
    // Fetch roles
    const rolesRes = await fetch(`http://localhost:3001/api/roles?uid=${userId}`);
    const roleList = rolesRes.ok ? await rolesRes.json() : [];
    setState((s) => ({
      ...s,
      profile: profileData,
      roles: roleList,
      isAdmin: roleList.includes("admin"),
    }));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setState((s) => ({ ...s, user: firebaseUser, loading: false }));
      if (firebaseUser) {
        fetchProfile(firebaseUser.uid);
      } else {
        setState((s) => ({ ...s, profile: null, roles: [], isAdmin: false }));
      }
    });
    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(firestore, "profiles", user.uid), {
        id: user.uid,
        user_id: user.uid,
        username: username.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        avatar_url: null,
        bio: null,
        plan: "free",
      });
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to create account" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Login failed" };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
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
