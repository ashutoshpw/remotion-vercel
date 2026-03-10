import { NextResponse } from "next/server";
import { count, desc, eq, sql } from "drizzle-orm";
import { ZodError } from "zod";
import { project, team } from "../../../db/schema";
import { getDb } from "../../../lib/db";
import { getRequestSession } from "../../../lib/session";
import { makeUniqueSlug } from "../../../lib/slugify";
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
    const db = getDb();
    const projectCounts = db
      .select({
        teamId: project.teamId,
        count: count(project.id).as("count"),
      })
      .from(project)
      .groupBy(project.teamId)
      .as("project_counts");

    const teams = await db
      .select({
        id: team.id,
        name: team.name,
        slug: team.slug,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        projectCount: sql<number>`coalesce(${projectCounts.count}, 0)`,
      })
      .from(team)
      .leftJoin(projectCounts, eq(projectCounts.teamId, team.id))
      .where(eq(team.ownerId, session.user.id))
      .orderBy(desc(team.updatedAt));

    return NextResponse.json({
      teams: teams.map((currentTeam) =>
        serializeTeam({
          id: currentTeam.id,
          name: currentTeam.name,
          slug: currentTeam.slug,
          createdAt: currentTeam.createdAt,
          updatedAt: currentTeam.updatedAt,
          _count: {
            projects: Number(currentTeam.projectCount),
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
    const payload = TeamRequest.parse(await request.json());
    const db = getDb();
    const slug = await makeUniqueSlug(
      payload.slug ?? payload.name,
      async (candidate) => {
        const [match] = await db
          .select({ id: team.id })
          .from(team)
          .where(eq(team.slug, candidate))
          .limit(1);
        return Boolean(match);
      },
    );

    const [createdTeam] = await db
      .insert(team)
      .values({
        name: payload.name,
        slug,
        ownerId: session.user.id,
      })
      .returning({
        id: team.id,
        name: team.name,
        slug: team.slug,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      });

    return NextResponse.json(
      {
        team: serializeTeam({
          ...createdTeam,
          _count: {
            projects: 0,
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
