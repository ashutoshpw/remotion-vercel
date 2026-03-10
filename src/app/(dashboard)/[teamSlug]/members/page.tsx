import { redirect, notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "@/lib/server-session";
import { getDb } from "@/lib/db";
import { team, teamMember, user } from "@/db/schema";
import { MembersPageClient } from "./MembersPageClient";
import type { TeamMemberRecord } from "@/types/schema";

interface PageProps {
  params: Promise<{ teamSlug: string }>;
}

async function getTeamWithMembers(
  slug: string,
  userId: string,
): Promise<{
  team: { id: string; name: string; slug: string; ownerId: string };
  members: TeamMemberRecord[];
  currentUserRole: "owner" | "admin" | "member";
} | null> {
  const db = getDb();

  // Get team
  const [teamData] = await db
    .select({
      id: team.id,
      name: team.name,
      slug: team.slug,
      ownerId: team.ownerId,
    })
    .from(team)
    .where(eq(team.slug, slug))
    .limit(1);

  if (!teamData) {
    return null;
  }

  const isOwner = teamData.ownerId === userId;

  // Check if user is a member (if not owner)
  let currentUserRole: "owner" | "admin" | "member" = isOwner
    ? "owner"
    : "member";
  if (!isOwner) {
    const [membership] = await db
      .select({ role: teamMember.role })
      .from(teamMember)
      .where(
        and(eq(teamMember.teamId, teamData.id), eq(teamMember.userId, userId)),
      )
      .limit(1);

    if (!membership) {
      return null; // User not part of this team
    }
    currentUserRole = membership.role;
  }

  // Get all members
  const members = await db
    .select({
      id: teamMember.id,
      userId: teamMember.userId,
      role: teamMember.role,
      joinedAt: teamMember.joinedAt,
      createdAt: teamMember.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(teamMember)
    .innerJoin(user, eq(teamMember.userId, user.id))
    .where(eq(teamMember.teamId, teamData.id))
    .orderBy(teamMember.createdAt);

  // Get owner info
  const [ownerData] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, teamData.ownerId))
    .limit(1);

  // Create owner as first member
  const ownerMember: TeamMemberRecord = {
    id: `owner-${teamData.ownerId}`,
    userId: teamData.ownerId,
    role: "owner",
    joinedAt: null,
    createdAt: new Date().toISOString(),
    user: ownerData,
  };

  // Serialize other members
  const serializedMembers: TeamMemberRecord[] = members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    joinedAt: m.joinedAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
    user: m.user,
  }));

  return {
    team: teamData,
    members: [ownerMember, ...serializedMembers],
    currentUserRole,
  };
}

export default async function MembersPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const { teamSlug } = await params;
  const data = await getTeamWithMembers(teamSlug, session.user.id);

  if (!data) {
    notFound();
  }

  return (
    <MembersPageClient
      team={data.team}
      members={data.members}
      currentUserId={session.user.id}
      currentUserRole={data.currentUserRole}
    />
  );
}
