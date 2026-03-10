"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { TeamSummary } from "@/types/schema";

const ChevronIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

interface TeamSwitcherProps {
  teams: TeamSummary[];
  currentTeam: TeamSummary | null;
  collapsed?: boolean;
}

export const TeamSwitcher: React.FC<TeamSwitcherProps> = ({
  teams,
  currentTeam,
  collapsed = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          className="w-10 h-10 rounded-geist bg-foreground text-background flex items-center justify-center font-medium text-sm hover:opacity-90 transition-opacity"
        >
          {currentTeam ? getInitials(currentTeam.name) : "?"}
        </button>
        {isOpen && (
          <div className="absolute left-full ml-2 top-0 w-56 bg-background border border-unfocused-border-color rounded-geist shadow-lg z-50 py-1">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Teams
            </div>
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/${team.slug}`}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  currentTeam?.id === team.id ? "bg-muted font-medium" : ""
                }`}
              >
                {team.name}
              </Link>
            ))}
            <div className="border-t border-unfocused-border-color my-1" />
            <Link
              href="/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-muted-foreground"
            >
              <PlusIcon className="w-4 h-4" />
              Create team
            </Link>
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
        <div className="w-8 h-8 rounded-geist bg-foreground text-background flex items-center justify-center font-medium text-xs shrink-0">
          {currentTeam ? getInitials(currentTeam.name) : "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {currentTeam?.name ?? "Select team"}
          </div>
          {currentTeam && (
            <div className="text-xs text-muted-foreground truncate">
              {currentTeam._count.projects} project
              {currentTeam._count.projects !== 1 ? "s" : ""}
            </div>
          )}
        </div>
        <ChevronIcon
          className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-background border border-unfocused-border-color rounded-geist shadow-lg z-50 py-1">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Teams
          </div>
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/${team.slug}`}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-sm hover:bg-muted transition-colors ${
                currentTeam?.id === team.id ? "bg-muted font-medium" : ""
              }`}
            >
              <div className="font-medium">{team.name}</div>
              <div className="text-xs text-muted-foreground">/{team.slug}</div>
            </Link>
          ))}
          <div className="border-t border-unfocused-border-color my-1" />
          <Link
            href="/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-muted-foreground"
          >
            <PlusIcon className="w-4 h-4" />
            Create team
          </Link>
        </div>
      )}
    </div>
  );
};
