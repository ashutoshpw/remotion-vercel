import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/server-session";
import { getDb } from "@/lib/db";
import { video, project, team } from "@/db/schema";

interface RouteParams {
  params: Promise<{ videoId: string }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { videoId } = await params;

  const db = getDb();

  // Fetch video with project and team to verify ownership
  const [videoRecord] = await db
    .select({
      id: video.id,
      projectId: video.projectId,
      teamOwnerId: team.ownerId,
    })
    .from(video)
    .innerJoin(project, eq(video.projectId, project.id))
    .innerJoin(team, eq(project.teamId, team.id))
    .where(eq(video.id, videoId))
    .limit(1);

  if (!videoRecord) {
    return NextResponse.json({ message: "Video not found" }, { status: 404 });
  }

  if (videoRecord.teamOwnerId !== session.user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Delete the video
  await db.delete(video).where(eq(video.id, videoId));

  return NextResponse.json({ success: true });
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { videoId } = await params;

  const db = getDb();

  const [videoRecord] = await db
    .select({
      id: video.id,
      title: video.title,
      status: video.status,
      renderUrl: video.renderUrl,
      size: video.size,
      errorMessage: video.errorMessage,
      createdAt: video.createdAt,
      teamOwnerId: team.ownerId,
    })
    .from(video)
    .innerJoin(project, eq(video.projectId, project.id))
    .innerJoin(team, eq(project.teamId, team.id))
    .where(eq(video.id, videoId))
    .limit(1);

  if (!videoRecord) {
    return NextResponse.json({ message: "Video not found" }, { status: 404 });
  }

  if (videoRecord.teamOwnerId !== session.user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: videoRecord.id,
    title: videoRecord.title,
    status: videoRecord.status,
    renderUrl: videoRecord.renderUrl,
    size: videoRecord.size,
    errorMessage: videoRecord.errorMessage,
    createdAt: videoRecord.createdAt.toISOString(),
  });
}
