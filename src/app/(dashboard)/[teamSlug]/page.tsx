import { redirect, notFound } from "next/navigation";
import { count, desc, eq, sql } from "drizzle-orm";
import { getServerSession } from "@/lib/server-session";
import { getDb } from "@/lib/db";
import { project, projectAsset, team, video } from "@/db/schema";
import { TeamPageClient } from "./TeamPageClient";
import type { ProjectSummary, TeamSummary } from "@/types/schema";

interface PageProps {
  params: Promise<{ teamSlug: string }>;
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
      ownerId: team.ownerId,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      projectCount: sql<number>`coalesce(${projectCounts.count}, 0)`,
    })
    .from(team)
    .leftJoin(projectCounts, eq(projectCounts.teamId, team.id))
    .where(eq(team.slug, slug))
    .limit(1);

  if (!record || record.ownerId !== userId) {
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

export default async function TeamPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const { teamSlug } = await params;
  const teamData = await getTeamBySlug(teamSlug, session.user.id);

  if (!teamData) {
    notFound();
  }

  const projects = await getProjects(teamData.id);

  return <TeamPageClient team={teamData} projects={projects} />;
}
