import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z, ZodError } from "zod";
import { project, projectAsset, team, video } from "../../../../db/schema";
import { getDb } from "../../../../lib/db";
import { getRequestSession } from "../../../../lib/session";
import { makeUniqueSlug } from "../../../../lib/slugify";
import { type ProjectDetails } from "../../../../../types/schema";

const UpdateProjectRequest = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(200).nullable().optional(),
});

const serializeProjectDetails = (project: {
  id: string;
  teamId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  team: {
    id: string;
    name: string;
    slug: string;
  };
  assets: {
    id: string;
    name: string;
    url: string;
    createdAt: Date;
  }[];
  videos: {
    id: string;
    title: string;
    status: "rendering" | "ready" | "failed";
    renderUrl: string | null;
    size: number | null;
    errorMessage: string | null;
    createdAt: Date;
    asset: {
      id: string;
      name: string;
    } | null;
  }[];
}): ProjectDetails => ({
  ...project,
  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString(),
  assets: project.assets.map((asset) => ({
    ...asset,
    createdAt: asset.createdAt.toISOString(),
  })),
  videos: project.videos.map((video) => ({
    ...video,
    createdAt: video.createdAt.toISOString(),
  })),
});

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  try {
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
        },
      })
      .from(project)
      .innerJoin(team, eq(project.teamId, team.id))
      .where(and(eq(project.id, projectId), eq(team.ownerId, session.user.id)))
      .limit(1);

    if (!projectRecord) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    const assets = await db
      .select({
        id: projectAsset.id,
        name: projectAsset.name,
        url: projectAsset.url,
        createdAt: projectAsset.createdAt,
      })
      .from(projectAsset)
      .where(eq(projectAsset.projectId, projectId))
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
      .where(eq(video.projectId, projectId))
      .orderBy(desc(video.createdAt));

    return NextResponse.json({
      project: serializeProjectDetails({
        ...projectRecord,
        assets,
        videos: videos.map((currentVideo) => ({
          id: currentVideo.id,
          title: currentVideo.title,
          status: currentVideo.status,
          renderUrl: currentVideo.renderUrl,
          size: currentVideo.size,
          errorMessage: currentVideo.errorMessage,
          createdAt: currentVideo.createdAt,
          asset:
            currentVideo.assetId && currentVideo.assetName
              ? {
                  id: currentVideo.assetId,
                  name: currentVideo.assetName,
                }
              : null,
        })),
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 503 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  try {
    const db = getDb();

    // Verify ownership
    const [existingProject] = await db
      .select({
        id: project.id,
        teamId: project.teamId,
        slug: project.slug,
      })
      .from(project)
      .innerJoin(team, eq(project.teamId, team.id))
      .where(and(eq(project.id, projectId), eq(team.ownerId, session.user.id)))
      .limit(1);

    if (!existingProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    const payload = UpdateProjectRequest.parse(await request.json());

    const updates: {
      name?: string;
      slug?: string;
      description?: string | null;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if (payload.name !== undefined) {
      updates.name = payload.name;
      updates.slug = await makeUniqueSlug(payload.name, async (candidate) => {
        if (candidate === existingProject.slug) return false;
        const [match] = await db
          .select({ id: project.id })
          .from(project)
          .where(
            and(
              eq(project.teamId, existingProject.teamId),
              eq(project.slug, candidate),
            ),
          )
          .limit(1);
        return Boolean(match);
      });
    }

    if (payload.description !== undefined) {
      updates.description = payload.description;
    }

    const [updatedProject] = await db
      .update(project)
      .set(updates)
      .where(eq(project.id, projectId))
      .returning({
        id: project.id,
        teamId: project.teamId,
        name: project.name,
        slug: project.slug,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });

    return NextResponse.json({
      project: {
        ...updatedProject,
        createdAt: updatedProject.createdAt.toISOString(),
        updatedAt: updatedProject.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    const status = error instanceof ZodError ? 400 : 503;
    return NextResponse.json({ message: (error as Error).message }, { status });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  try {
    const db = getDb();

    // Verify ownership
    const [existingProject] = await db
      .select({ id: project.id })
      .from(project)
      .innerJoin(team, eq(project.teamId, team.id))
      .where(and(eq(project.id, projectId), eq(team.ownerId, session.user.id)))
      .limit(1);

    if (!existingProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    // Delete project (cascades to assets, videos)
    await db.delete(project).where(eq(project.id, projectId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 503 },
    );
  }
}
