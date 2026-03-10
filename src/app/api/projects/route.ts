import { NextResponse } from "next/server";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { ZodError } from "zod";
import { project, projectAsset, team, video } from "@/db/schema";
import { getDb } from "@/lib/db";
import { getRequestSession } from "@/lib/session";
import { makeUniqueSlug } from "@/lib/slugify";
import { ProjectRequest, type ProjectSummary } from "@/types/schema";

const serializeProject = (project: {
  id: string;
  teamId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { assets: number; videos: number };
}): ProjectSummary => ({
  ...project,
  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString(),
});

const getAccessibleTeam = async (teamId: string, userId: string) => {
  const db = getDb();
  const [record] = await db
    .select({ id: team.id })
    .from(team)
    .where(and(eq(team.id, teamId), eq(team.ownerId, userId)))
    .limit(1);
  return record ?? null;
};

export async function GET(request: Request) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json(
      { message: "teamId is required" },
      { status: 400 },
    );
  }

  try {
    const team = await getAccessibleTeam(teamId, session.user.id);
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

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

    return NextResponse.json({
      projects: projects.map((currentProject) =>
        serializeProject({
          id: currentProject.id,
          teamId: currentProject.teamId,
          name: currentProject.name,
          slug: currentProject.slug,
          description: currentProject.description,
          createdAt: currentProject.createdAt,
          updatedAt: currentProject.updatedAt,
          _count: {
            assets: Number(currentProject.assetCount),
            videos: Number(currentProject.videoCount),
          },
        }),
      ),
    });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = ProjectRequest.parse(await request.json());
    const db = getDb();
    const team = await getAccessibleTeam(payload.teamId, session.user.id);

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const slug = await makeUniqueSlug(payload.name, async (candidate) => {
      const [existingProject] = await db
        .select({ id: project.id })
        .from(project)
        .where(
          and(eq(project.teamId, payload.teamId), eq(project.slug, candidate)),
        )
        .limit(1);
      return Boolean(existingProject);
    });

    const [createdProject] = await db
      .insert(project)
      .values({
        teamId: payload.teamId,
        name: payload.name,
        slug,
        description: payload.description ?? null,
      })
      .returning({
        id: project.id,
        teamId: project.teamId,
        name: project.name,
        slug: project.slug,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });

    return NextResponse.json(
      {
        project: serializeProject({
          ...createdProject,
          _count: {
            assets: 0,
            videos: 0,
          },
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    const status = error instanceof ZodError ? 400 : 503;
    return NextResponse.json({ message: (error as Error).message }, { status });
  }
}
