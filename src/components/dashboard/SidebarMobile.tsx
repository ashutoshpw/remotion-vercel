"use client";

import React, { useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { TeamSummary, ProjectSummary } from "../../../types/schema";

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface SidebarMobileProps {
  teams: TeamSummary[];
  currentTeam: TeamSummary | null;
  projects?: ProjectSummary[];
  currentProject?: ProjectSummary | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SidebarMobile: React.FC<SidebarMobileProps> = ({
  teams,
  currentTeam,
  projects = [],
  currentProject = null,
  isOpen,
  onOpenChange,
}) => {
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => onOpenChange(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-geist bg-background border border-unfocused-border-color hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <MenuIcon className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 sidebar-overlay"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-geist text-muted-foreground hover:bg-muted hover:text-foreground transition-colors z-10"
          aria-label="Close menu"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* Sidebar Content */}
        <div
          onClick={(e) => {
            // Close drawer when clicking a link
            if ((e.target as HTMLElement).closest("a")) {
              handleClose();
            }
          }}
        >
          <Sidebar
            teams={teams}
            currentTeam={currentTeam}
            projects={projects}
            currentProject={currentProject}
          />
        </div>
      </div>
    </>
  );
};

export const MobileMenuButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => (
  <button
    onClick={onClick}
    className="md:hidden p-2 rounded-geist hover:bg-muted transition-colors"
    aria-label="Open menu"
  >
    <MenuIcon className="w-5 h-5" />
  </button>
);
