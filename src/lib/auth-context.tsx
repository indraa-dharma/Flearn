"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { currentUser as initialUser } from "@/lib/mock-data";

interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  role: string;
  avatar: string;
  university: string;
  year: string;
  major: string;
  target?: string;
  courses: string[];
}

interface EmailNotification {
  to: string;
  subject: string;
  message: string;
  time: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isCalendarConnected: boolean;
  calendarEmail: string | null;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  authView: "login" | "register";
  setAuthView: (view: "login" | "register") => void;
  lastEmailNotification: EmailNotification | null;
  clearEmailNotification: () => void;
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithProvider: (provider: "google" | "github" | "apple") => Promise<{ success: boolean; providerName: string; email: string }>;
  logout: () => Promise<void>;
  connectGoogleCalendar: () => Promise<boolean>;
  disconnectGoogleCalendar: () => Promise<boolean>;
  updateProfile: (updatedFields: Partial<UserProfile>) => void;
  profileVersion: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean>(false);
  const [calendarEmail, setCalendarEmail] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [lastEmailNotification, setLastEmailNotification] = useState<EmailNotification | null>(null);
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    // Fetch actual calendar connection status
    const checkCalendarStatus = async () => {
      try {
        const res = await fetch("/api/calendar/status");
        if (res.ok) {
          const data = await res.json();
          setIsCalendarConnected(data.connected);
          if (data.connected && data.email) {
            setCalendarEmail(data.email);
          }
        }
      } catch (error) {
        console.error("Failed to check calendar status", error);
      }
    };

    if (status === "loading") {
      setIsLoading(true);
      return;
    }
    if (status === "authenticated" && session?.user) {
      setIsLoggedIn(true);
      const sessionUser = session.user;
      // Load persisted profile from DB (source of truth) — fallback to localStorage/session
      (async () => {
        let dbProfile: any = null;
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            if (data.isLoggedIn && data.user) dbProfile = data.user;
          }
        } catch (e) {
          console.error("Failed to load profile from DB", e);
        }
        const localData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("flearn-user-profile") || "{}") : {};
        const merged = {
          ...initialUser,
          ...localData,
          ...(dbProfile || {}),
          name: dbProfile?.name || (localData.name !== undefined && localData.name !== "" ? localData.name : (sessionUser.name || initialUser.name)),
          email: dbProfile?.email || localData.email || sessionUser.email || (initialUser as any).email || "",
          avatar: dbProfile?.image || (localData.avatar !== undefined ? localData.avatar : (sessionUser.image || initialUser.avatar)),
          id: (sessionUser as any).id,
          role: dbProfile?.role || localData.role || "",
          target: dbProfile?.target || (localData as any).target || "",
        };
        setUser(merged);
      })();
      // Check real calendar connection
      checkCalendarStatus();
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setIsCalendarConnected(false);
    }
    
    setIsLoading(false);
  }, [session, status]);

  const login = async (email: string, password?: string) => {
    return false;
  };

  const loginWithProvider = async (provider: "google" | "github" | "apple") => {
    return { success: false, providerName: provider, email: "" };
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      setIsLoggedIn(false);
      setUser(null);
      setLastEmailNotification(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    // Redirect to our dedicated calendar OAuth route.
    // This does NOT call signIn() — the user's login session stays intact.
    if (typeof window !== "undefined") {
      window.location.href = "/api/calendar/auth";
    }
    return true;
  };

  const disconnectGoogleCalendar = async () => {
    // Ideally we should delete the Account from DB, but for now we just mock disconnect
    // You would implement a DELETE /api/calendar/status route for real
    setIsCalendarConnected(false);
    setCalendarEmail(null);
    return true;
  };

  const updateProfile = (updatedFields: Partial<UserProfile>) => {
    if (user) {
      const newUser = { ...user, ...updatedFields };
      setUser(newUser);
      setProfileVersion((v) => v + 1);
      localStorage.setItem("flearn-user-profile", JSON.stringify({
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        university: newUser.university,
        major: newUser.major,
        target: (newUser as any).target,
        courses: newUser.courses
      }));
    }
  };

  const clearEmailNotification = () => {
    setLastEmailNotification(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        isCalendarConnected,
        calendarEmail,
        showLoginModal,
        setShowLoginModal,
        authView,
        setAuthView,
        lastEmailNotification,
        clearEmailNotification,
        login,
        loginWithProvider,
        logout,
        connectGoogleCalendar,
        disconnectGoogleCalendar,
        updateProfile,
        profileVersion,
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
