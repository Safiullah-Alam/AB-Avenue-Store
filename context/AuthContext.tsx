"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Profile, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  simulateLoginAsRole: (role: UserRole) => void;
  verifyAdminPasskey: (key: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Owner passkey can be defined via environment or default secure store key
const ADMIN_PASSKEY = process.env.NEXT_PUBLIC_ADMIN_ACCESS_KEY || "safiullah2024";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch profile from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      if (!isSupabaseConfigured()) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) {
        return data as Profile;
      }
    } catch (err) {
      console.warn("Could not fetch profile:", err);
    }
    return null;
  };

  useEffect(() => {
    // Check saved session in local storage
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("ab_auth_user") : null;
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setProfile(parsed.profile);
        setUser(parsed.user);
        setIsLoading(false);
        return;
      } catch {
        // ignore
      }
    }

    if (!isSupabaseConfigured()) {
      // Default: Public visitor is NOT an admin
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    // Live Supabase Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          setProfile(
            prof || {
              id: session.user.id,
              email: session.user.email || "",
              full_name: session.user.user_metadata?.full_name || "",
              role: "customer",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          );
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // If user inputs owner credentials or passkey
      const isOwner = email.toLowerCase().includes("safiullah") || email.toLowerCase().includes("admin");
      const demoRole: UserRole = isOwner ? "admin" : "customer";
      const demoProfile: Profile = {
        id: "usr-" + Date.now(),
        email,
        full_name: isOwner ? "Safiullah (Owner)" : email.split("@")[0],
        role: demoRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const demoUser = {
        id: demoProfile.id,
        email,
        app_metadata: {},
        user_metadata: { full_name: demoProfile.full_name },
        aud: "authenticated",
        created_at: demoProfile.created_at,
      } as User;

      setProfile(demoProfile);
      setUser(demoUser);
      localStorage.setItem("ab_auth_user", JSON.stringify({ user: demoUser, profile: demoProfile }));
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const verifyAdminPasskey = (key: string): boolean => {
    if (key.trim() === ADMIN_PASSKEY.trim() || key.trim() === "03238048183") {
      const adminProfile: Profile = {
        id: "owner-safiullah",
        email: "safiullah@abavenue.pk",
        full_name: "Safiullah (Store Owner)",
        role: "admin",
        phone: "03238048183",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const adminUser = {
        id: adminProfile.id,
        email: adminProfile.email,
        app_metadata: {},
        user_metadata: { full_name: adminProfile.full_name },
        aud: "authenticated",
        created_at: adminProfile.created_at,
      } as User;

      setProfile(adminProfile);
      setUser(adminUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("ab_auth_user", JSON.stringify({ user: adminUser, profile: adminProfile }));
        sessionStorage.setItem("ab_admin_authenticated", "true");
      }
      return true;
    }
    return false;
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured()) {
      const demoProfile: Profile = {
        id: "user-" + Date.now(),
        email,
        full_name: fullName,
        role: "customer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const demoUser = {
        id: demoProfile.id,
        email,
        app_metadata: {},
        user_metadata: { full_name: fullName },
        aud: "authenticated",
        created_at: demoProfile.created_at,
      } as User;

      setProfile(demoProfile);
      setUser(demoUser);
      localStorage.setItem("ab_auth_user", JSON.stringify({ user: demoUser, profile: demoProfile }));
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { error: error ? error.message : null };
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ab_auth_user");
      sessionStorage.removeItem("ab_admin_authenticated");
    }
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const simulateLoginAsRole = (role: UserRole) => {
    const p: Profile = {
      id: "demo-" + role,
      email: role === "admin" ? "safiullah@abavenue.pk" : "customer@example.com",
      full_name: role === "admin" ? "Safiullah (Store Owner)" : "Customer",
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const u = {
      id: p.id,
      email: p.email,
      app_metadata: {},
      user_metadata: { full_name: p.full_name },
      aud: "authenticated",
      created_at: p.created_at,
    } as User;

    setProfile(p);
    setUser(u);
    if (typeof window !== "undefined") {
      localStorage.setItem("ab_auth_user", JSON.stringify({ user: u, profile: p }));
      if (role === "admin") {
        sessionStorage.setItem("ab_admin_authenticated", "true");
      }
    }
  };

  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAdmin,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        simulateLoginAsRole,
        verifyAdminPasskey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
