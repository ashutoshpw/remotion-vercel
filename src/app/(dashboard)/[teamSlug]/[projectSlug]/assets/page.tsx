import { redirect, notFound } from "next/navigation";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { getServerSession } from "@/lib/server-session";
import { getDb } from "@/lib/db";
import { project, projectAsset, team, video } from "@/db/schema";
import { AssetsPageClient } from "./AssetsPageClient";
import type { AssetWithUsage } from "@/types/schema";

interface PageProps {
  params: Promise<{ teamSlug: string; projectSlug: string }>;
}

interface ProjectData {
  id: string;
  name: string;
  slug: string;
  team: {
    id: string;
    name: string;
    slug: string;
  };
  assets: AssetWithUsage[];
}

async function getProjectAssets(
  teamSlug: string,
  projectSlug: string,
  userId: string,
): Promise<ProjectData | null> {
  const db = getDb();

  const [projectRecord] = await db
    .select({
      id: project.id,
      name: project.name,
      slug: project.slug,
      team: {
        id: team.id,
        name: team.name,
        slug: team.slug,
        ownerId: team.ownerId,
      },
    })
    .from(project)
    .innerJoin(team, eq(project.teamId, team.id))
    .where(and(eq(team.slug, teamSlug), eq(project.slug, projectSlug)))
    .limit(1);

  if (!projectRecord || projectRecord.team.ownerId !== userId) {
    return null;
  }

  // Fetch assets with video usage count
  const videoCounts = db
    .select({
      assetId: video.assetId,
      count: count(video.id).as("video_count"),
    })
    .from(video)
    .where(eq(video.projectId, projectRecord.id))
    .groupBy(video.assetId)
    .as("video_counts");

  const assets = await db
    .select({
      id: projectAsset.id,
      name: projectAsset.name,
      url: projectAsset.url,
      createdAt: projectAsset.createdAt,
      videoCount: sql<number>`coalesce(${videoCounts.count}, 0)`,
    })
    .from(projectAsset)
    .leftJoin(videoCounts, eq(videoCounts.assetId, projectAsset.id))
    .where(eq(projectAsset.projectId, projectRecord.id))
    .orderBy(desc(projectAsset.createdAt));

  return {
    id: projectRecord.id,
    name: projectRecord.name,
    slug: projectRecord.slug,
    team: {
      id: projectRecord.team.id,
      name: projectRecord.team.name,
      slug: projectRecord.team.slug,
    },
    assets: assets.map((a) => ({
      id: a.id,
      name: a.name,
      url: a.url,
      createdAt: a.createdAt.toISOString(),
      _count: {
        videos: Number(a.videoCount),
      },
    })),
  };
}

export default async function AssetsPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const { teamSlug, projectSlug } = await params;
  const projectData = await getProjectAssets(
    teamSlug,
    projectSlug,
    session.user.id,
  );

  if (!projectData) {
    notFound();
  }

  return <AssetsPageClient project={projectData} />;
}
