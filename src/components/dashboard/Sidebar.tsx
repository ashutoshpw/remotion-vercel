"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TeamSwitcher } from "./TeamSwitcher";
import { NavUser } from "./NavUser";
import { TeamSummary, ProjectSummary } from "@/types/schema";

const FolderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

interface SidebarProps {
  teams: TeamSummary[];
  currentTeam: TeamSummary | null;
  projects?: ProjectSummary[];
  currentProject?: ProjectSummary | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  teams,
  currentTeam,
  projects = [],
  currentProject = null,
  collapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isActivePrefix = (path: string) => {
    return pathname.startsWith(path);
  };

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-geist text-sm transition-colors ${
      active
        ? "bg-muted font-medium text-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  // Collapsed sidebar
  if (collapsed) {
    return (
      <aside className="sidebar collapsed h-screen border-r border-unfocused-border-color bg-background flex flex-col">
        {/* Team Switcher */}
        <div className="p-2 border-b border-unfocused-border-color">
          <TeamSwitcher
            teams={teams}
            currentTeam={currentTeam}
            collapsed={true}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {currentTeam && !currentProject && (
            <>
              <Link
                href={`/${currentTeam.slug}`}
                className={`flex items-center justify-center w-10 h-10 rounded-geist transition-colors ${
                  isActive(`/${currentTeam.slug}`)
                    ? "bg-muted"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title="Projects"
              >
                <FolderIcon className="w-5 h-5" />
              </Link>
              <Link
                href={`/${currentTeam.slug}/members`}
                className={`flex items-center justify-center w-10 h-10 rounded-geist transition-colors ${
                  isActive(`/${currentTeam.slug}/members`)
                    ? "bg-muted"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title="Members"
              >
                <UsersIcon className="w-5 h-5" />
              </Link>
              <Link
                href={`/${currentTeam.slug}/settings`}
                className={`flex items-center justify-center w-10 h-10 rounded-geist transition-colors ${
                  isActive(`/${currentTeam.slug}/settings`)
                    ? "bg-muted"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title="Team Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </Link>
              <Link
                href={`/${currentTeam.slug}/settings/ai`}
                className={`flex items-center justify-center w-10 h-10 rounded-geist transition-colors ${
                  isActive(`/${currentTeam.slug}/settings/ai`)
                    ? "bg-muted"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title="AI Settings"
              >
                <SparklesIcon className="w-5 h-5" />
              </Link>
            </>
          )}

          {currentTeam && currentProject && (
            <>
              <Link
                href={`/${currentTeam.slug}`}
                className="flex items-center justify-center w-10 h-10 rounded-geist text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title={`Back to ${currentTeam.name}`}
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div className="my-2 border-t border-unfocused-border-color" />
              <Link
                href={`/${currentTeam.slug}/${currentProject.slug}`}
                className={`flex items-center justify-center w-10 h-10 rounded-geist transition-colors ${
                  isActive(`/${currentTeam.slug}/${currentProject.slug}`)
                    ? "bg-muted"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title="Videos"
              >
                <VideoIcon className="w-5 h-5" />
              </Link>
              <Link
                href={`/${currentTeam.slug}/${currentProject.slug}/assets`}
                className={`flex items-center justify-center w-10 h-10 rounded-geist transition-colors ${
                  isActive(`/${currentTeam.slug}/${currentProject.slug}/assets`)
                    ? "bg-muted"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title="Assets"
              >
                <ImageIcon className="w-5 h-5" />
              </Link>
              <Link
                href={`/${currentTeam.slug}/${currentProject.slug}/settings`}
                className={`flex items-center justify-center w-10 h-10 rounded-geist transition-colors ${
                  isActive(
                    `/${currentTeam.slug}/${currentProject.slug}/settings`,
                  )
                    ? "bg-muted"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title="Project Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </Link>
            </>
          )}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-unfocused-border-color">
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-10 h-10 rounded-geist text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Expand sidebar"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* User Menu */}
        <div className="p-2 border-t border-unfocused-border-color">
          <NavUser collapsed={true} />
        </div>
      </aside>
    );
  }

  // Expanded sidebar
  return (
    <aside className="sidebar h-screen border-r border-unfocused-border-color bg-background flex flex-col">
      {/* Team Switcher */}
      <div className="p-3 border-b border-unfocused-border-color">
        <TeamSwitcher teams={teams} currentTeam={currentTeam} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {currentTeam && !currentProject && (
          <>
            {/* Team-scoped navigation */}
            <div className="space-y-1">
              <Link
                href={`/${currentTeam.slug}`}
                className={navItemClass(isActive(`/${currentTeam.slug}`))}
              >
                <FolderIcon className="w-4 h-4 shrink-0" />
                <span>Projects</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {currentTeam._count.projects}
                </span>
              </Link>
              <Link
                href={`/${currentTeam.slug}/members`}
                className={navItemClass(
                  isActivePrefix(`/${currentTeam.slug}/members`),
                )}
              >
                <UsersIcon className="w-4 h-4 shrink-0" />
                <span>Members</span>
              </Link>
              <Link
                href={`/${currentTeam.slug}/settings`}
                className={navItemClass(
                  isActive(`/${currentTeam.slug}/settings`),
                )}
              >
                <SettingsIcon className="w-4 h-4 shrink-0" />
                <span>Settings</span>
              </Link>
              <Link
                href={`/${currentTeam.slug}/settings/ai`}
                className={navItemClass(
                  isActive(`/${currentTeam.slug}/settings/ai`),
                )}
              >
                <SparklesIcon className="w-4 h-4 shrink-0" />
                <span>AI Settings</span>
              </Link>
            </div>

            {/* Quick access to projects */}
            {projects.length > 0 && (
              <div className="mt-6">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
                  Recent Projects
                </div>
                <div className="space-y-1">
                  {projects.slice(0, 5).map((project) => (
                    <Link
                      key={project.id}
                      href={`/${currentTeam.slug}/${project.slug}`}
                      className={navItemClass(false)}
                    >
                      <FolderIcon className="w-4 h-4 shrink-0 opacity-60" />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {currentTeam && currentProject && (
          <>
            {/* Back to team */}
            <Link href={`/${currentTeam.slug}`} className={navItemClass(false)}>
              <ArrowLeftIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">Back to {currentTeam.name}</span>
            </Link>

            <div className="my-4 border-t border-unfocused-border-color" />

            {/* Project name header */}
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
              {currentProject.name}
            </div>

            {/* Project-scoped navigation */}
            <div className="space-y-1">
              <Link
                href={`/${currentTeam.slug}/${currentProject.slug}`}
                className={navItemClass(
                  isActive(`/${currentTeam.slug}/${currentProject.slug}`),
                )}
              >
                <VideoIcon className="w-4 h-4 shrink-0" />
                <span>Videos</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {currentProject._count.videos}
                </span>
              </Link>
              <Link
                href={`/${currentTeam.slug}/${currentProject.slug}/assets`}
                className={navItemClass(
                  isActivePrefix(
                    `/${currentTeam.slug}/${currentProject.slug}/assets`,
                  ),
                )}
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span>Assets</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {currentProject._count.assets}
                </span>
              </Link>
              <Link
                href={`/${currentTeam.slug}/${currentProject.slug}/settings`}
                className={navItemClass(
                  isActive(
                    `/${currentTeam.slug}/${currentProject.slug}/settings`,
                  ),
                )}
              >
                <SettingsIcon className="w-4 h-4 shrink-0" />
                <span>Settings</span>
              </Link>
            </div>
          </>
        )}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-2 border-t border-unfocused-border-color">
        <button onClick={onToggleCollapse} className={navItemClass(false)}>
          <ChevronLeftIcon className="w-4 h-4 shrink-0" />
          <span>Collapse</span>
        </button>
      </div>

      {/* User Menu */}
      <div className="p-3 border-t border-unfocused-border-color">
        <NavUser />
      </div>
    </aside>
  );
};
