import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const AuthContext = createContext<any>(null);
import { auth, firestore } from "@/integrations/firebase/client";
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
    try {
      // Fetch profile from Firestore directly
      const profileDoc = await getDoc(doc(firestore, "profiles", userId));
      const profileData = profileDoc.exists() ? { id: profileDoc.id, ...profileDoc.data() } as Profile : null;
      
      // Fetch roles from Firestore
      const rolesQuery = query(collection(firestore, "roles"), where("user_id", "==", userId));
      const rolesSnap = await getDocs(rolesQuery);
      const roleList: AppRole[] = rolesSnap.docs.map(doc => doc.data().role as AppRole);
      
      setState((s) => ({
        ...s,
        profile: profileData,
        roles: roleList,
        isAdmin: roleList.includes("admin"),
      }));
    } catch (error) {
      console.error("Error fetching profile:", error);
      setState((s) => ({ ...s, profile: null, roles: [], isAdmin: false }));
    }
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
        created_at: new Date().toISOString(),
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
