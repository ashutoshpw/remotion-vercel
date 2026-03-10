import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "../../../lib/prisma";
import { getRequestSession } from "../../../lib/session";
import { makeUniqueSlug } from "../../../lib/slugify";
import { ProjectRequest, type ProjectSummary } from "../../../../types/schema";

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
  return prisma.team.findFirst({
    where: {
      id: teamId,
      ownerId: userId,
    },
  });
};

export async function GET(request: Request) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json({ message: "teamId is required" }, { status: 400 });
  }

  try {
    const team = await getAccessibleTeam(teamId, session.user.id);
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const projects = await prisma.project.findMany({
      where: { teamId },
      include: { _count: { select: { assets: true, videos: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ projects: projects.map(serializeProject) });
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
    const team = await getAccessibleTeam(payload.teamId, session.user.id);

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const slug = await makeUniqueSlug(payload.name, async (candidate) => {
      const project = await prisma.project.findUnique({
        where: {
          teamId_slug: {
            teamId: payload.teamId,
            slug: candidate,
          },
        },
      });
      return Boolean(project);
    });

    const project = await prisma.project.create({
      data: {
        teamId: payload.teamId,
        name: payload.name,
        slug,
        description: payload.description ?? null,
      },
      include: { _count: { select: { assets: true, videos: true } } },
    });

    return NextResponse.json({ project: serializeProject(project) }, { status: 201 });
  } catch (error) {
    const status = error instanceof ZodError ? 400 : 503;
    return NextResponse.json({ message: (error as Error).message }, { status });
  }
}
