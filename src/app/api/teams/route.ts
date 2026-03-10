import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "../../../lib/prisma";
import { getRequestSession } from "../../../lib/session";
import { createBaseSlug, makeUniqueSlug } from "../../../lib/slugify";
import { TeamRequest, type TeamSummary } from "../../../../types/schema";

const serializeTeam = (team: {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { projects: number };
}): TeamSummary => ({
  ...team,
  createdAt: team.createdAt.toISOString(),
  updatedAt: team.updatedAt.toISOString(),
});

export async function GET(request: Request) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const teams = await prisma.team.findMany({
      where: { ownerId: session.user.id },
      include: { _count: { select: { projects: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ teams: teams.map(serializeTeam) });
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
    const payload = TeamRequest.parse(await request.json());
    const slug = await makeUniqueSlug(
      payload.slug ?? payload.name,
      async (candidate) => {
        const match = await prisma.team.findUnique({ where: { slug: candidate } });
        return Boolean(match);
      },
    );

    const team = await prisma.team.create({
      data: {
        name: payload.name,
        slug: createBaseSlug(slug, "workspace"),
        ownerId: session.user.id,
      },
      include: { _count: { select: { projects: true } } },
    });

    return NextResponse.json({ team: serializeTeam(team) }, { status: 201 });
  } catch (error) {
    const status = error instanceof ZodError ? 400 : 503;
    return NextResponse.json({ message: (error as Error).message }, { status });
  }
}
