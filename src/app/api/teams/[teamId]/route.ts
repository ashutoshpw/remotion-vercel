import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z, ZodError } from "zod";
import { team } from "../../../../db/schema";
import { getDb } from "../../../../lib/db";
import { getRequestSession } from "../../../../lib/session";
import { makeUniqueSlug } from "../../../../lib/slugify";
import type { TeamSummary } from "../../../../../types/schema";

const UpdateTeamRequest = z.object({
  name: z.string().trim().min(2).max(60),
});

const serializeTeam = (t: {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}): Omit<TeamSummary, "_count"> => ({
  id: t.id,
  name: t.name,
  slug: t.slug,
  createdAt: t.createdAt.toISOString(),
  updatedAt: t.updatedAt.toISOString(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ teamId: string }> },
) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await context.params;

  try {
    const db = getDb();

    // Verify ownership
    const [existingTeam] = await db
      .select({ id: team.id, slug: team.slug })
      .from(team)
      .where(and(eq(team.id, teamId), eq(team.ownerId, session.user.id)))
      .limit(1);

    if (!existingTeam) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const payload = UpdateTeamRequest.parse(await request.json());

    // Generate new slug if name changed
    const newSlug = await makeUniqueSlug(payload.name, async (candidate) => {
      if (candidate === existingTeam.slug) return false;
      const [match] = await db
        .select({ id: team.id })
        .from(team)
        .where(eq(team.slug, candidate))
        .limit(1);
      return Boolean(match);
    });

    const [updatedTeam] = await db
      .update(team)
      .set({
        name: payload.name,
        slug: newSlug,
        updatedAt: new Date(),
      })
      .where(eq(team.id, teamId))
      .returning({
        id: team.id,
        name: team.name,
        slug: team.slug,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      });

    return NextResponse.json({ team: serializeTeam(updatedTeam) });
  } catch (error) {
    const status = error instanceof ZodError ? 400 : 503;
    return NextResponse.json({ message: (error as Error).message }, { status });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ teamId: string }> },
) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await context.params;

  try {
    const db = getDb();

    // Verify ownership
    const [existingTeam] = await db
      .select({ id: team.id })
      .from(team)
      .where(and(eq(team.id, teamId), eq(team.ownerId, session.user.id)))
      .limit(1);

    if (!existingTeam) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Delete team (cascades to projects, assets, videos)
    await db.delete(team).where(eq(team.id, teamId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 503 },
    );
  }
}
