"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TeamSwitcher } from "./TeamSwitcher";
import { NavUser } from "./NavUser";
import { TeamSummary, ProjectSummary } from "../../../types/schema";

const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

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

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-geist text-sm transition-colors ${
      active
        ? "bg-muted font-medium"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

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
          {currentTeam && (
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
                <HomeIcon className="w-5 h-5" />
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

  return (
    <aside className="sidebar h-screen border-r border-unfocused-border-color bg-background flex flex-col">
      {/* Team Switcher */}
      <div className="p-3 border-b border-unfocused-border-color">
        <TeamSwitcher teams={teams} currentTeam={currentTeam} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {currentTeam && (
          <>
            {/* Main Navigation */}
            <div className="space-y-1 mb-6">
              <Link
                href={`/${currentTeam.slug}`}
                className={navItemClass(isActive(`/${currentTeam.slug}`))}
              >
                <HomeIcon className="w-4 h-4 shrink-0" />
                <span>Overview</span>
              </Link>
              <Link
                href={`/${currentTeam.slug}/settings`}
                className={navItemClass(
                  isActive(`/${currentTeam.slug}/settings`),
                )}
              >
                <SettingsIcon className="w-4 h-4 shrink-0" />
                <span>Team Settings</span>
              </Link>
            </div>

            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Projects
                </span>
                <Link
                  href={`/${currentTeam.slug}/new`}
                  className="p-1 rounded-geist text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="New project"
                >
                  <PlusIcon className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-1">
                {projects.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-3 py-2">
                    No projects yet
                  </p>
                ) : (
                  projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/${currentTeam.slug}/${project.slug}`}
                      className={navItemClass(
                        currentProject?.id === project.id ||
                          pathname.startsWith(
                            `/${currentTeam.slug}/${project.slug}`,
                          ),
                      )}
                    >
                      <FolderIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{project.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {project._count.videos}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Current Project Navigation */}
            {currentProject && (
              <div className="mt-6">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
                  {currentProject.name}
                </div>
                <div className="space-y-1">
                  <Link
                    href={`/${currentTeam.slug}/${currentProject.slug}`}
                    className={navItemClass(
                      isActive(`/${currentTeam.slug}/${currentProject.slug}`),
                    )}
                  >
                    <VideoIcon className="w-4 h-4 shrink-0" />
                    <span>Editor</span>
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
                    <span>Project Settings</span>
                  </Link>
                </div>
              </div>
            )}
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
