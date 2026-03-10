import { redirect, notFound } from "next/navigation";
import { count, eq, sql } from "drizzle-orm";
import { getServerSession } from "../../../../lib/server-session";
import { getDb } from "../../../../lib/db";
import { project, team } from "../../../../db/schema";
import { TeamSettingsClient } from "./TeamSettingsClient";
import type { TeamSummary } from "../../../../../types/schema";

interface PageProps {
  params: Promise<{ teamSlug: string }>;
}

export default async function TeamSettingsPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const { teamSlug } = await params;
  const db = getDb();

  const projectCounts = db
    .select({
      teamId: project.teamId,
      count: count(project.id).as("count"),
    })
    .from(project)
    .groupBy(project.teamId)
    .as("project_counts");

  const [teamData] = await db
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
    .where(eq(team.slug, teamSlug))
    .limit(1);

  if (!teamData || teamData.ownerId !== session.user.id) {
    notFound();
  }

  const teamSummary: TeamSummary = {
    id: teamData.id,
    name: teamData.name,
    slug: teamData.slug,
    createdAt: teamData.createdAt.toISOString(),
    updatedAt: teamData.updatedAt.toISOString(),
    _count: { projects: Number(teamData.projectCount) },
  };

  return <TeamSettingsClient team={teamSummary} />;
}
