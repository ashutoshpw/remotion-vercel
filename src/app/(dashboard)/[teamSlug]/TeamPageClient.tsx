"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ProjectIllustration } from "@/components/dashboard/illustrations";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import type { ProjectSummary, TeamSummary } from "@/types/schema";

const FolderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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
    strokeWidth="1.5"
  >
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

interface TeamPageClientProps {
  team: TeamSummary;
  projects: ProjectSummary[];
}

const ProjectCard: React.FC<{
  project: ProjectSummary;
  teamSlug: string;
}> = ({ project, teamSlug }) => {
  return (
    <Link
      href={`/${teamSlug}/${project.slug}`}
      className="group block border border-unfocused-border-color rounded-geist hover:border-focused-border-color hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Card Header with Icon */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-geist bg-gradient-to-br from-muted to-accent flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FolderIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-geist-success transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {project.description}
              </p>
            )}
          </div>
          <ArrowRightIcon className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-4 py-3 bg-muted/30 border-t border-unfocused-border-color">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <VideoIcon className="w-3.5 h-3.5" />
            {project._count.videos} video
            {project._count.videos !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            {project._count.assets} asset
            {project._count.assets !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
};

export const TeamPageClient: React.FC<TeamPageClientProps> = ({
  team,
  projects,
}) => {
  const params = useParams();
  const teamSlug = params.teamSlug as string;

  if (projects.length === 0) {
    return (
      <div className="p-6 md:p-8">
        <Breadcrumbs items={[{ label: team.name, href: `/${teamSlug}` }]} />
        <EmptyState
          icon={<ProjectIllustration className="w-16 h-16" />}
          title="No projects yet"
          description="Create your first project to start rendering videos."
          action={{
            label: "Create project",
            href: `/${teamSlug}/new`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: team.name, href: `/${teamSlug}` }]} />

      <div className="flex items-center justify-between mt-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""} in{" "}
            {team.name}
          </p>
        </div>
        <Link
          href={`/${teamSlug}/new`}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-geist bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          New Project
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} teamSlug={teamSlug} />
        ))}
      </div>
    </div>
  );
};
