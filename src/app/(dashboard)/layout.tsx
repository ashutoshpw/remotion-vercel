import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { getServerSession } from "../../lib/server-session";
import { getDb } from "../../lib/db";
import { project, projectAsset, team, video } from "../../db/schema";
import { DashboardLayoutClient } from "./DashboardLayoutClient";
import type { TeamSummary, ProjectSummary } from "@/types/schema";

// Force dynamic rendering for all dashboard pages
export const dynamic = "force-dynamic";

// Reserved paths that are not team slugs
const RESERVED_PATHS = ["dashboard", "new", "settings", "api"];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

async function getTeams(userId: string): Promise<TeamSummary[]> {
  const db = getDb();
  const projectCounts = db
    .select({
      teamId: project.teamId,
      count: count(project.id).as("count"),
    })
    .from(project)
    .groupBy(project.teamId)
    .as("project_counts");

  const teams = await db
    .select({
      id: team.id,
      name: team.name,
      slug: team.slug,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      projectCount: sql<number>`coalesce(${projectCounts.count}, 0)`,
    })
    .from(team)
    .leftJoin(projectCounts, eq(projectCounts.teamId, team.id))
    .where(eq(team.ownerId, userId))
    .orderBy(desc(team.updatedAt));

  return teams.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    _count: { projects: Number(t.projectCount) },
  }));
}

async function getTeamBySlug(
  slug: string,
  userId: string,
): Promise<TeamSummary | null> {
  const db = getDb();
  const projectCounts = db
    .select({
      teamId: project.teamId,
      count: count(project.id).as("count"),
    })
    .from(project)
    .groupBy(project.teamId)
    .as("project_counts");

  const [record] = await db
    .select({
      id: team.id,
      name: team.name,
      slug: team.slug,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      projectCount: sql<number>`coalesce(${projectCounts.count}, 0)`,
    })
    .from(team)
    .leftJoin(projectCounts, eq(projectCounts.teamId, team.id))
    .where(eq(team.slug, slug))
    .limit(1);

  if (!record || (await getTeamOwner(record.id)) !== userId) {
    return null;
  }

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    _count: { projects: Number(record.projectCount) },
  };
}

async function getTeamOwner(teamId: string): Promise<string | null> {
  const db = getDb();
  const [record] = await db
    .select({ ownerId: team.ownerId })
    .from(team)
    .where(eq(team.id, teamId))
    .limit(1);
  return record?.ownerId ?? null;
}

async function getProjects(teamId: string): Promise<ProjectSummary[]> {
  const db = getDb();
  const assetCounts = db
    .select({
      projectId: projectAsset.projectId,
      count: count(projectAsset.id).as("asset_count"),
    })
    .from(projectAsset)
    .groupBy(projectAsset.projectId)
    .as("asset_counts");
  const videoCounts = db
    .select({
      projectId: video.projectId,
      count: count(video.id).as("video_count"),
    })
    .from(video)
    .groupBy(video.projectId)
    .as("video_counts");

  const projects = await db
    .select({
      id: project.id,
      teamId: project.teamId,
      name: project.name,
      slug: project.slug,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      assetCount: sql<number>`coalesce(${assetCounts.count}, 0)`,
      videoCount: sql<number>`coalesce(${videoCounts.count}, 0)`,
    })
    .from(project)
    .leftJoin(assetCounts, eq(assetCounts.projectId, project.id))
    .leftJoin(videoCounts, eq(videoCounts.projectId, project.id))
    .where(eq(project.teamId, teamId))
    .orderBy(desc(project.updatedAt));

  return projects.map((p) => ({
    id: p.id,
    teamId: p.teamId,
    name: p.name,
    slug: p.slug,
    description: p.description,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    _count: {
      assets: Number(p.assetCount),
      videos: Number(p.videoCount),
    },
  }));
}

async function getProjectBySlug(
  teamId: string,
  slug: string,
): Promise<ProjectSummary | null> {
  const db = getDb();
  const assetCounts = db
    .select({
      projectId: projectAsset.projectId,
      count: count(projectAsset.id).as("asset_count"),
    })
    .from(projectAsset)
    .groupBy(projectAsset.projectId)
    .as("asset_counts");
  const videoCounts = db
    .select({
      projectId: video.projectId,
      count: count(video.id).as("video_count"),
    })
    .from(video)
    .groupBy(video.projectId)
    .as("video_counts");

  const [record] = await db
    .select({
      id: project.id,
      teamId: project.teamId,
      name: project.name,
      slug: project.slug,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      assetCount: sql<number>`coalesce(${assetCounts.count}, 0)`,
      videoCount: sql<number>`coalesce(${videoCounts.count}, 0)`,
    })
    .from(project)
    .leftJoin(assetCounts, eq(assetCounts.projectId, project.id))
    .leftJoin(videoCounts, eq(videoCounts.projectId, project.id))
    .where(and(eq(project.teamId, teamId), eq(project.slug, slug)))
    .limit(1);

  if (!record) return null;

  return {
    id: record.id,
    teamId: record.teamId,
    name: record.name,
    slug: record.slug,
    description: record.description,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    _count: {
      assets: Number(record.assetCount),
      videos: Number(record.videoCount),
    },
  };
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  // Parse URL to extract teamSlug and projectSlug
  // Route group layouts don't receive params from nested dynamic segments
  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";

  // Try to extract from referer or use a fallback approach
  let teamSlug: string | undefined;
  let projectSlug: string | undefined;

  // Parse pathname like /my-team or /my-team/my-project
  const pathParts = pathname.split("/").filter(Boolean);
  if (pathParts.length > 0 && !RESERVED_PATHS.includes(pathParts[0])) {
    teamSlug = pathParts[0];
    if (pathParts.length > 1 && !RESERVED_PATHS.includes(pathParts[1])) {
      projectSlug = pathParts[1];
    }
  }

  const userId = session.user.id;

  // Fetch teams
  const teams = await getTeams(userId);

  // Determine current team
  let currentTeam: TeamSummary | null = null;
  if (teamSlug) {
    currentTeam = await getTeamBySlug(teamSlug, userId);
    if (!currentTeam) {
      redirect("/dashboard");
    }
  }

  // Fetch projects for current team
  let projects: ProjectSummary[] = [];
  let currentProject: ProjectSummary | null = null;
  if (currentTeam) {
    projects = await getProjects(currentTeam.id);
    if (projectSlug) {
      currentProject = await getProjectBySlug(currentTeam.id, projectSlug);
      if (!currentProject) {
        redirect(`/${currentTeam.slug}`);
      }
    }
  }

  return (
    <DashboardLayoutClient
      teams={teams}
      currentTeam={currentTeam}
      projects={projects}
      currentProject={currentProject}
    >
      {children}
    </DashboardLayoutClient>
  );
}
