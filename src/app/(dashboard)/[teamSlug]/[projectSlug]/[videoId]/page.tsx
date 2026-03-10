import { redirect, notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "@/lib/server-session";
import { getDb } from "@/lib/db";
import {
  project,
  projectAsset,
  team,
  video,
  teamAiSettings,
} from "@/db/schema";
import { VideoPageClient } from "./VideoPageClient";
import type { VideoDetails } from "@/types/schema";

interface PageProps {
  params: Promise<{ teamSlug: string; projectSlug: string; videoId: string }>;
}

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
}

async function getVideoDetails(
  teamSlug: string,
  projectSlug: string,
  videoId: string,
  userId: string,
): Promise<{
  video: VideoDetails;
  assets: Asset[];
  isAiConfigured: boolean;
} | null> {
  const db = getDb();

  // First verify team/project access
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

  // Fetch video with asset
  const [videoRecord] = await db
    .select({
      id: video.id,
      projectId: video.projectId,
      title: video.title,
      status: video.status,
      renderUrl: video.renderUrl,
      size: video.size,
      inputProps: video.inputProps,
      errorMessage: video.errorMessage,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      assetId: projectAsset.id,
      assetName: projectAsset.name,
      assetUrl: projectAsset.url,
    })
    .from(video)
    .leftJoin(projectAsset, eq(video.assetId, projectAsset.id))
    .where(and(eq(video.id, videoId), eq(video.projectId, projectRecord.id)))
    .limit(1);

  if (!videoRecord) {
    return null;
  }

  // Fetch all project assets
  const projectAssets = await db
    .select({
      id: projectAsset.id,
      name: projectAsset.name,
      url: projectAsset.url,
      type: projectAsset.type,
    })
    .from(projectAsset)
    .where(eq(projectAsset.projectId, projectRecord.id));

  // Check if AI is configured for the team
  const [aiSettings] = await db
    .select({ id: teamAiSettings.id })
    .from(teamAiSettings)
    .where(eq(teamAiSettings.teamId, projectRecord.team.id))
    .limit(1);

  const videoDetails: VideoDetails = {
    id: videoRecord.id,
    projectId: videoRecord.projectId,
    title: videoRecord.title,
    status: videoRecord.status,
    renderUrl: videoRecord.renderUrl,
    size: videoRecord.size,
    inputProps: videoRecord.inputProps as Record<string, unknown>,
    errorMessage: videoRecord.errorMessage,
    createdAt: videoRecord.createdAt.toISOString(),
    updatedAt: videoRecord.updatedAt.toISOString(),
    project: {
      id: projectRecord.id,
      name: projectRecord.name,
      slug: projectRecord.slug,
      team: {
        id: projectRecord.team.id,
        name: projectRecord.team.name,
        slug: projectRecord.team.slug,
      },
    },
    asset:
      videoRecord.assetId && videoRecord.assetName && videoRecord.assetUrl
        ? {
            id: videoRecord.assetId,
            name: videoRecord.assetName,
            url: videoRecord.assetUrl,
          }
        : null,
  };

  return {
    video: videoDetails,
    assets: projectAssets,
    isAiConfigured: !!aiSettings,
  };
}

export default async function VideoPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const { teamSlug, projectSlug, videoId } = await params;
  const data = await getVideoDetails(
    teamSlug,
    projectSlug,
    videoId,
    session.user.id,
  );

  if (!data) {
    notFound();
  }

  return (
    <VideoPageClient
      video={data.video}
      assets={data.assets}
      isAiConfigured={data.isAiConfigured}
    />
  );
}
