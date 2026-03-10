import { redirect, notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getServerSession } from "@/lib/server-session";
import { getDb } from "@/lib/db";
import { project, projectAsset, team } from "@/db/schema";
import { NewVideoClient } from "./NewVideoClient";
import type { ProjectAssetRecord } from "@/types/schema";

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
  assets: ProjectAssetRecord[];
}

async function getProjectData(
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
    })),
  };
}

export default async function NewVideoPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const { teamSlug, projectSlug } = await params;
  const projectData = await getProjectData(
    teamSlug,
    projectSlug,
    session.user.id,
  );

  if (!projectData) {
    notFound();
  }

  return <NewVideoClient project={projectData} />;
}
