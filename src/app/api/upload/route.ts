import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { project, projectAsset, team } from "@/db/schema";
import { getDb } from "@/lib/db";
import { getRequestSession } from "@/lib/session";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export async function POST(request: Request) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { message: "No projectId provided" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File size exceeds 10MB limit" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Allowed: PNG, JPEG, GIF, WebP, SVG" },
        { status: 400 },
      );
    }

    const db = getDb();

    // Verify user owns the project
    const [projectRecord] = await db
      .select({ id: project.id })
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

    // Upload to Vercel Blob
    const blob = await put(`assets/${projectId}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Save to database
    const [asset] = await db
      .insert(projectAsset)
      .values({
        projectId,
        name: file.name,
        url: blob.url,
      })
      .returning();

    return NextResponse.json(
      {
        asset: {
          id: asset.id,
          name: asset.name,
          url: asset.url,
          createdAt: asset.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { assetId } = await request.json();

    if (!assetId) {
      return NextResponse.json(
        { message: "No assetId provided" },
        { status: 400 },
      );
    }

    const db = getDb();

    // Verify user owns the asset via project -> team
    const [assetRecord] = await db
      .select({
        id: projectAsset.id,
        url: projectAsset.url,
      })
      .from(projectAsset)
      .innerJoin(project, eq(projectAsset.projectId, project.id))
      .innerJoin(team, eq(project.teamId, team.id))
      .where(
        and(eq(projectAsset.id, assetId), eq(team.ownerId, session.user.id)),
      )
      .limit(1);

    if (!assetRecord) {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 });
    }

    // Delete from Vercel Blob
    try {
      await del(assetRecord.url);
    } catch {
      // Blob might already be deleted, continue
    }

    // Delete from database
    await db.delete(projectAsset).where(eq(projectAsset.id, assetId));

    return NextResponse.json({ message: "Asset deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 },
    );
  }
}
