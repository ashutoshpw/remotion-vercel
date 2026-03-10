"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { SidebarMobile } from "../../components/dashboard/SidebarMobile";
import { TeamSummary, ProjectSummary } from "@/types/schema";

// Reserved paths that are not project slugs
const RESERVED_PATHS = ["new", "settings", "members"];

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  teams: TeamSummary[];
  currentTeam: TeamSummary | null;
  projects: ProjectSummary[];
  currentProject: ProjectSummary | null;
}

export const DashboardLayoutClient: React.FC<DashboardLayoutClientProps> = ({
  children,
  teams,
  currentTeam,
  projects,
  currentProject: initialCurrentProject,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Derive current project from pathname on the client side
  // This ensures the sidebar updates during client-side navigation
  const currentProject = useMemo(() => {
    if (!currentTeam || !pathname) return initialCurrentProject;

    // Parse pathname: /{teamSlug}/{projectSlug}/...
    const pathParts = pathname.split("/").filter(Boolean);

    // Check if we have a project slug (second segment, not reserved)
    if (pathParts.length >= 2 && pathParts[0] === currentTeam.slug) {
      const projectSlug = pathParts[1];
      if (!RESERVED_PATHS.includes(projectSlug)) {
        // Find the project in our list
        const project = projects.find((p) => p.slug === projectSlug);
        if (project) return project;
      }
    }

    return null;
  }, [pathname, currentTeam, projects, initialCurrentProject]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      setSidebarCollapsed(stored === "true");
    }
  }, []);

  const handleToggleCollapse = () => {
    const newValue = !sidebarCollapsed;
    setSidebarCollapsed(newValue);
    localStorage.setItem("sidebar-collapsed", String(newValue));
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          teams={teams}
          currentTeam={currentTeam}
          projects={projects}
          currentProject={currentProject}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* Mobile Sidebar */}
      <SidebarMobile
        teams={teams}
        currentTeam={currentTeam}
        projects={projects}
        currentProject={currentProject}
        isOpen={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
};
