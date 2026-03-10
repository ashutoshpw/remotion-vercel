import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "@/lib/server-session";
import { getDb } from "@/lib/db";
import { team, teamAiSettings, teamMember } from "@/db/schema";
import { encrypt } from "@/lib/encryption";

interface RouteContext {
  params: Promise<{ teamId: string }>;
}

// GET: Fetch team AI settings
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;
    const db = getDb();

    // Verify user has access to team
    const membership = await db
      .select()
      .from(teamMember)
      .where(
        and(
          eq(teamMember.teamId, teamId),
          eq(teamMember.userId, session.user.id),
        ),
      )
      .limit(1);

    const teamData = await db
      .select()
      .from(team)
      .where(eq(team.id, teamId))
      .limit(1);

    const isOwner = teamData[0]?.ownerId === session.user.id;
    const isMember = membership.length > 0;

    if (!isOwner && !isMember) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    // Fetch AI settings
    const settings = await db
      .select()
      .from(teamAiSettings)
      .where(eq(teamAiSettings.teamId, teamId))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json({ settings: null });
    }

    // Return settings without the actual API key (just indicate if one exists)
    const { apiKey, ...settingsData } = settings[0];
    return NextResponse.json({
      settings: {
        ...settingsData,
        hasApiKey: !!apiKey,
      },
    });
  } catch (error) {
    console.error("Error fetching AI settings:", error);
    return NextResponse.json(
      { message: "Failed to fetch AI settings" },
      { status: 500 },
    );
  }
}

// POST: Create or update AI settings
export async function POST(req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;
    const db = getDb();

    // Only owner or admin can modify AI settings
    const membership = await db
      .select()
      .from(teamMember)
      .where(
        and(
          eq(teamMember.teamId, teamId),
          eq(teamMember.userId, session.user.id),
        ),
      )
      .limit(1);

    const teamData = await db
      .select()
      .from(team)
      .where(eq(team.id, teamId))
      .limit(1);

    const isOwner = teamData[0]?.ownerId === session.user.id;
    const isAdmin = membership[0]?.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "Only owners and admins can modify AI settings" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { provider, apiKey, model } = body;

    if (!provider || !model) {
      return NextResponse.json(
        { message: "Provider and model are required" },
        { status: 400 },
      );
    }

    // Check if settings already exist
    const existingSettings = await db
      .select()
      .from(teamAiSettings)
      .where(eq(teamAiSettings.teamId, teamId))
      .limit(1);

    let encryptedApiKey: string;
    if (apiKey) {
      encryptedApiKey = encrypt(apiKey);
    } else if (existingSettings.length > 0) {
      // Keep existing API key if not provided
      encryptedApiKey = existingSettings[0].apiKey;
    } else {
      return NextResponse.json(
        { message: "API key is required for new settings" },
        { status: 400 },
      );
    }

    if (existingSettings.length > 0) {
      // Update existing
      await db
        .update(teamAiSettings)
        .set({
          provider,
          apiKey: encryptedApiKey,
          model,
          updatedAt: new Date(),
        })
        .where(eq(teamAiSettings.id, existingSettings[0].id));

      return NextResponse.json({
        message: "AI settings updated",
        settings: {
          id: existingSettings[0].id,
          provider,
          model,
          hasApiKey: true,
        },
      });
    } else {
      // Create new
      const [newSettings] = await db
        .insert(teamAiSettings)
        .values({
          teamId,
          provider,
          apiKey: encryptedApiKey,
          model,
        })
        .returning();

      return NextResponse.json({
        message: "AI settings created",
        settings: {
          id: newSettings.id,
          provider,
          model,
          hasApiKey: true,
        },
      });
    }
  } catch (error) {
    console.error("Error saving AI settings:", error);
    return NextResponse.json(
      { message: "Failed to save AI settings" },
      { status: 500 },
    );
  }
}

// DELETE: Remove AI settings
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;
    const db = getDb();

    // Only owner can delete AI settings
    const teamData = await db
      .select()
      .from(team)
      .where(eq(team.id, teamId))
      .limit(1);

    if (teamData[0]?.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Only team owner can delete AI settings" },
        { status: 403 },
      );
    }

    await db.delete(teamAiSettings).where(eq(teamAiSettings.teamId, teamId));

    return NextResponse.json({ message: "AI settings deleted" });
  } catch (error) {
    console.error("Error deleting AI settings:", error);
    return NextResponse.json(
      { message: "Failed to delete AI settings" },
      { status: 500 },
    );
  }
}
