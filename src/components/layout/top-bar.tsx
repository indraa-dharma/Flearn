"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, HelpCircle, LogOut, LogIn, Bot, Upload, Calendar, Globe, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/auth/login-modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getAllSessions } from "@/lib/chat-storage";
import { useNotifications } from "@/lib/notification-context";
import { HelpModal } from "@/components/help-modal";
import { useLanguage, langOptions } from "@/lib/language-context";

const iconMap: Record<string, React.ElementType> = {
  upload: Upload,
  ai: Bot,
  calendar: Calendar,
  info: Bell,
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, isLoggedIn, logout, setShowLoginModal } = useAuth();
  const router = useRouter();
  
  // Destructure with default values in case context provider is not available in some tests
  const notificationCtx = useNotifications() || {};
  const notifications = notificationCtx.notifications || [];
  const unreadCount = notificationCtx.unreadCount || 0;
  const markAllAsRead = notificationCtx.markAllAsRead || (() => {});

  // Dropdown states
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const { language, setLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<{ docs: any[]; sessions: any[] }>({ docs: [], sessions: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Refs for outside click
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (code: any) => {
    setLanguage(code);
    setShowLangMenu(false);
  };

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowSearchDropdown(false);
        setShowNotif(false);
        setShowProfileDropdown(false);
        setShowLangMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Search logic
  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearch.trim()) {
        setSearchResults({ docs: [], sessions: [] });
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      try {
        // Fetch docs
        let docs = [];
        try {
          const res = await fetch(`/api/documents?q=${encodeURIComponent(debouncedSearch)}`);
          if (res.ok) {
            const data = await res.json();
            const allDocs = Array.isArray(data) ? data : (data.documents || []);
            const lowerTerm = debouncedSearch.toLowerCase();
            docs = allDocs.filter((d: any) => 
              d.title?.toLowerCase().includes(lowerTerm) || 
              d.name?.toLowerCase().includes(lowerTerm) ||
              d.course?.toLowerCase().includes(lowerTerm) ||
              d.subject?.toLowerCase().includes(lowerTerm)
            );
          }
        } catch (e) {
          console.error("Failed to fetch documents", e);
        }

        // Fetch sessions
        const allSessions = getAllSessions();
        const lowerTerm = debouncedSearch.toLowerCase();
        const matchedSessions = allSessions.filter((s: any) => {
          const labelMatch = s.label?.toLowerCase().includes(lowerTerm);
          const messagesMatch = s.messages?.some((m: any) => m.content?.toLowerCase().includes(lowerTerm));
          return labelMatch || messagesMatch;
        });

        setSearchResults({ docs, sessions: matchedSessions });
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedSearch]);

  const handleSearchFocus = () => {
    if (searchTerm.trim()) {
      setShowSearchDropdown(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim()) {
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  };

  const navigateToSession = (sessionId: string) => {
    setShowSearchDropdown(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("flearn-active-session", sessionId);
    }
    router.push(`/chat`); 
  };

  const navigateToDoc = (docId: string) => {
    setShowSearchDropdown(false);
    router.push(`/chat?sourceId=${docId}`);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[var(--topbar-height)] items-center justify-between border-b border-border bg-card/90 backdrop-blur-lg px-4 sm:px-6 gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="icon-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent transition-colors cursor-pointer lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        {/* Search */}
        <div ref={searchRef} className="relative w-full max-w-md flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            placeholder={t.app.search}
            className="w-full h-9 rounded-xl border border-border bg-accent/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all"
          />
          
          {showSearchDropdown && (searchTerm.trim() !== "") && (
            <div className="absolute left-0 top-full mt-2 w-full max-h-96 overflow-y-auto rounded-2xl border border-border bg-card shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 z-50 py-2">
              {isSearching ? (
                <div className="p-4 text-sm text-muted-foreground text-center">Searching...</div>
              ) : (
                <>
                  {searchResults.docs.length === 0 && searchResults.sessions.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">{t.app.noResults}</div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.docs.length > 0 && (
                        <div>
                          <h4 className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.app.documents}</h4>
                          {searchResults.docs.map((doc: any, i: number) => (
                            <div 
                              key={doc.id || i}
                              onClick={() => navigateToDoc(doc.id)}
                              className="px-3 py-1.5 hover:bg-accent/50 cursor-pointer flex flex-col"
                            >
                              <span className="text-sm font-medium text-foreground">{doc.name || doc.title || "Untitled Document"}</span>
                              <span className="text-[10px] text-muted-foreground">{doc.type || "Document"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {searchResults.sessions.length > 0 && (
                        <div>
                          <h4 className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.app.chatSessions}</h4>
                          {searchResults.sessions.map((session: any) => (
                            <div 
                              key={session.id}
                              onClick={() => navigateToSession(session.id)}
                              className="px-3 py-1.5 hover:bg-accent/50 cursor-pointer flex flex-col"
                            >
                              <span className="text-sm font-medium text-foreground">{session.label || "Unnamed Session"}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {session.messages?.length || 0} messages
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          <div ref={langMenuRef} className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="icon-btn relative flex h-9 px-2 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent transition-colors cursor-pointer gap-1.5"
              title="Switch Language"
            >
              <Globe className="h-[18px] w-[18px]" />
              <span className="text-xs font-bold">{langOptions.find((l) => l.code === language)?.flag || language.toUpperCase()}</span>
            </button>
            
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-border bg-card shadow-xl py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                {langOptions.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => changeLanguage(opt.code)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-all duration-150 cursor-pointer hover:bg-accent/60 ${
                      language === opt.code
                        ? "text-primary dark:text-blue-400 font-bold"
                        : "text-foreground font-medium"
                    }`}
                  >
                    <span className="text-base">{opt.flag}</span>
                    <span>{opt.label}</span>
                    {language === opt.code && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary dark:bg-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative hidden md:block" ref={notifRef}>
            <button 
              onClick={() => setShowNotif(!showNotif)}
              className="icon-btn relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger border-2 border-card" />
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-card shadow-xl py-3 animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                <div className="px-4 pb-2 border-b border-border mb-2 flex justify-between items-center">
                  <h3 className="font-bold text-sm">{t.app.notifications}</h3>
                  {notifications.length > 0 && (
                    <span 
                      onClick={markAllAsRead}
                      className="text-[10px] text-muted-foreground cursor-pointer hover:text-primary font-semibold"
                    >
                      {t.app.markRead}
                    </span>
                  )}
                </div>
                <div className="px-2 space-y-1 max-h-[60vh] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif: any) => {
                      const Icon = iconMap[notif.icon] || Bell;
                      return (
                        <div key={notif.id} className={`flex gap-3 p-2 rounded-xl hover:bg-accent/50 cursor-pointer transition-colors ${!notif.read ? 'bg-accent/20' : ''}`}>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            notif.color === "blue" 
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : notif.color === "amber"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                              : "bg-primary/10 text-primary"
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{notif.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notif.description || notif.desc}</p>
                            <p className="text-[10px] text-primary mt-1">{notif.time || "Just now"}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-xs font-medium text-muted-foreground">{t.app.noNotifications}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowHelp(true)}
            className="icon-btn hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>

          <div className="mx-1 h-5 w-px bg-border" />

          {isLoggedIn && user ? (
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-2xl hover:bg-accent/50 transition-all"
              >
                <Avatar size="sm" className="ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                  {user.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={user.avatar} alt={user.name || "Avatar"} className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary to-sky text-white text-xs font-bold">
                      {user.name ? user.name.split(" ").map((n) => n[0]).join("") : "AC"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold leading-tight text-foreground">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground">{user.role}</p>
                </div>
              </div>

              {/* Simple Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-card shadow-xl py-2 animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                  <div className="px-4 py-2 border-b border-border mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email || "alex.chen@stanford.edu"}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-danger hover:bg-danger-light dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> {t.app.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => setShowLoginModal(true)}
              className="h-9 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-primary to-sky text-white text-xs font-bold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all gap-1.5"
            >
              <LogIn className="h-3.5 w-3.5" /> {t.app.signIn}
            </Button>
          )}
        </div>
      </header>

      {/* Render Modals */}
      <LoginModal />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}
