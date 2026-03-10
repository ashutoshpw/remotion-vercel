import { redirect, notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getServerSession } from "../../../../../lib/server-session";
import { getDb } from "../../../../../lib/db";
import { project, projectAsset, team, video } from "../../../../../db/schema";
import { ProjectSettingsClient } from "./ProjectSettingsClient";
import type { ProjectDetails } from "../../../../../../types/schema";

interface PageProps {
  params: Promise<{ teamSlug: string; projectSlug: string }>;
}

async function getProjectDetails(
  teamSlug: string,
  projectSlug: string,
  userId: string,
): Promise<ProjectDetails | null> {
  const db = getDb();

  const [projectRecord] = await db
    .select({
      id: project.id,
      teamId: project.teamId,
      name: project.name,
      slug: project.slug,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
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

  const assets = await db
    .select({
      id: projectAsset.id,
      name: projectAsset.name,
      url: projectAsset.url,
      createdAt: projectAsset.createdAt,
    })
    .from(projectAsset)
    .where(eq(projectAsset.projectId, projectRecord.id))
    .orderBy(desc(projectAsset.createdAt));

  const videos = await db
    .select({
      id: video.id,
      title: video.title,
      status: video.status,
      renderUrl: video.renderUrl,
      size: video.size,
      errorMessage: video.errorMessage,
      createdAt: video.createdAt,
      assetId: projectAsset.id,
      assetName: projectAsset.name,
    })
    .from(video)
    .leftJoin(projectAsset, eq(video.assetId, projectAsset.id))
    .where(eq(video.projectId, projectRecord.id))
    .orderBy(desc(video.createdAt));

  return {
    id: projectRecord.id,
    teamId: projectRecord.teamId,
    name: projectRecord.name,
    slug: projectRecord.slug,
    description: projectRecord.description,
    createdAt: projectRecord.createdAt.toISOString(),
    updatedAt: projectRecord.updatedAt.toISOString(),
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
    })),
    videos: videos.map((v) => ({
      id: v.id,
      title: v.title,
      status: v.status,
      renderUrl: v.renderUrl,
      size: v.size,
      errorMessage: v.errorMessage,
      createdAt: v.createdAt.toISOString(),
      asset:
        v.assetId && v.assetName ? { id: v.assetId, name: v.assetName } : null,
    })),
  };
}

export default async function ProjectSettingsPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const { teamSlug, projectSlug } = await params;
  const projectDetails = await getProjectDetails(
    teamSlug,
    projectSlug,
    session.user.id,
  );

  if (!projectDetails) {
    notFound();
  }

  return <ProjectSettingsClient project={projectDetails} />;
}
