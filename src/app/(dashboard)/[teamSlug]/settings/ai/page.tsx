import { redirect, notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "@/lib/server-session";
import { getDb } from "@/lib/db";
import { team, teamMember, teamAiSettings } from "@/db/schema";
import { AISettingsClient } from "./AISettingsClient";

interface PageProps {
  params: Promise<{ teamSlug: string }>;
}

export default async function AISettingsPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const { teamSlug } = await params;
  const db = getDb();

  // Fetch team data
  const [teamData] = await db
    .select()
    .from(team)
    .where(eq(team.slug, teamSlug))
    .limit(1);

  if (!teamData) {
    notFound();
  }

  // Check if user is owner or admin
  const isOwner = teamData.ownerId === session.user.id;

  const [membership] = await db
    .select()
    .from(teamMember)
    .where(
      and(
        eq(teamMember.teamId, teamData.id),
        eq(teamMember.userId, session.user.id),
      ),
    )
    .limit(1);

  const isAdmin = membership?.role === "admin";

  if (!isOwner && !isAdmin) {
    notFound();
  }

  // Fetch existing AI settings
  const [settings] = await db
    .select({
      id: teamAiSettings.id,
      provider: teamAiSettings.provider,
      model: teamAiSettings.model,
      isActive: teamAiSettings.isActive,
    })
    .from(teamAiSettings)
    .where(eq(teamAiSettings.teamId, teamData.id))
    .limit(1);

  return (
    <AISettingsClient
      team={{ id: teamData.id, name: teamData.name, slug: teamData.slug }}
      existingSettings={settings || null}
      isOwner={isOwner}
    />
  );
}
