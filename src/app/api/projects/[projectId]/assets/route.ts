import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { ZodError } from "zod";
import { project, projectAsset, team } from "../../../../../db/schema";
import { getDb } from "../../../../../lib/db";
import { getRequestSession } from "../../../../../lib/session";
import { AssetRequest } from "../../../../../../types/schema";

export async function POST(
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
    const payload = AssetRequest.parse(await request.json());
    const [projectRecord] = await db
      .select({ id: project.id })
      .from(project)
      .innerJoin(team, eq(project.teamId, team.id))
      .where(and(eq(project.id, projectId), eq(team.ownerId, session.user.id)))
      .limit(1);

    if (!projectRecord) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const [asset] = await db
      .insert(projectAsset)
      .values({
        projectId,
        name: payload.name,
        url: payload.url,
      })
      .returning();

    return NextResponse.json(
      {
        asset: {
          ...asset,
          createdAt: asset.createdAt.toISOString(),
          updatedAt: asset.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const status = error instanceof ZodError ? 400 : 503;
    return NextResponse.json({ message: (error as Error).message }, { status });
  }
}
