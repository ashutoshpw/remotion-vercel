"use client";

import React, { useState, useRef, useEffect } from "react";
import { authClient } from "../../lib/auth-client";
import { ThemeToggle } from "./ThemeToggle";

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogOutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

interface NavUserProps {
  collapsed?: boolean;
}

export const NavUser: React.FC<NavUserProps> = ({ collapsed = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sessionState = authClient.useSession();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const user = sessionState.data?.user;

  const handleSignOut = async () => {
    await authClient.signOut();
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (collapsed) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium hover:bg-accent transition-colors"
        >
          {user?.name ? (
            getInitials(user.name)
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
        </button>
        {isOpen && (
          <div className="absolute left-full ml-2 bottom-0 w-56 bg-background border border-unfocused-border-color rounded-geist shadow-lg z-50 py-1">
            {user && (
              <div className="px-3 py-2 border-b border-unfocused-border-color">
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-muted-foreground">
                  {user.email}
                </div>
              </div>
            )}
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <div className="border-t border-unfocused-border-color" />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-destructive"
            >
              <LogOutIcon className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-2 rounded-geist hover:bg-muted transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
          {user?.name ? (
            getInitials(user.name)
          ) : (
            <UserIcon className="w-4 h-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {user?.name ?? "User"}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 bottom-full mb-1 bg-background border border-unfocused-border-color rounded-geist shadow-lg z-50 py-1">
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <div className="border-t border-unfocused-border-color" />
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-destructive"
          >
            <LogOutIcon className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};
