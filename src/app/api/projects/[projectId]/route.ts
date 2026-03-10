import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getRequestSession } from "../../../../lib/session";
import { type ProjectDetails } from "../../../../../types/schema";

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
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        team: {
          ownerId: session.user.id,
        },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        assets: {
          select: {
            id: true,
            name: true,
            url: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        videos: {
          select: {
            id: true,
            title: true,
            status: true,
            renderUrl: true,
            size: true,
            errorMessage: true,
            createdAt: true,
            asset: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: serializeProjectDetails(project) });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 503 },
    );
  }
}
