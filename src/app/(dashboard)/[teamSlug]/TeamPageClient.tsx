"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EmptyState } from "../../../components/dashboard/EmptyState";
import { ProjectIllustration } from "../../../components/dashboard/illustrations";
import { Breadcrumbs } from "../../../components/dashboard/Breadcrumbs";
import type { ProjectSummary, TeamSummary } from "../../../../types/schema";

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

interface TeamPageClientProps {
  team: TeamSummary;
  projects: ProjectSummary[];
}

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
          icon={<ProjectIllustration className="w-12 h-12" />}
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
    <div className="p-6 md:p-8">
      <Breadcrumbs items={[{ label: team.name, href: `/${teamSlug}` }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
        <Link
          href={`/${teamSlug}/new`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-geist border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          New project
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/${teamSlug}/${project.slug}`}
            className="group block p-4 border border-unfocused-border-color rounded-geist hover:border-focused-border-color transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-geist bg-muted flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
                <FolderIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>
                    {project._count.videos} video
                    {project._count.videos !== 1 ? "s" : ""}
                  </span>
                  <span>
                    {project._count.assets} asset
                    {project._count.assets !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
