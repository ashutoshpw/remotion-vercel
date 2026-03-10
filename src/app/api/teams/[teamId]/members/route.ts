import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { ZodError } from "zod";
import { team, teamMember, user } from "@/db/schema";
import { getDb } from "@/lib/db";
import { getRequestSession } from "@/lib/session";
import { TeamMemberInviteRequest, TeamMemberRecord } from "@/types/schema";

const serializeMember = (m: {
  id: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}): TeamMemberRecord => ({
  id: m.id,
  userId: m.userId,
  role: m.role,
  joinedAt: m.joinedAt?.toISOString() ?? null,
  createdAt: m.createdAt.toISOString(),
  user: m.user,
});

// GET /api/teams/[teamId]/members - List all team members
export async function GET(
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

    // Check if user is a member of this team (or owner)
    const [teamData] = await db
      .select({
        id: team.id,
        ownerId: team.ownerId,
      })
      .from(team)
      .where(eq(team.id, teamId))
      .limit(1);

    if (!teamData) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const isOwner = teamData.ownerId === session.user.id;

    // Check if user is a member
    if (!isOwner) {
      const [membership] = await db
        .select({ id: teamMember.id })
        .from(teamMember)
        .where(
          and(
            eq(teamMember.teamId, teamId),
            eq(teamMember.userId, session.user.id),
          ),
        )
        .limit(1);

      if (!membership) {
        return NextResponse.json(
          { message: "Team not found" },
          { status: 404 },
        );
      }
    }

    // Get all members with user info
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
      .where(eq(teamMember.teamId, teamId))
      .orderBy(teamMember.createdAt);

    // Also include the owner as a virtual "member" with owner role
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

    const ownerMember: TeamMemberRecord = {
      id: `owner-${teamData.ownerId}`,
      userId: teamData.ownerId,
      role: "owner",
      joinedAt: null,
      createdAt: new Date().toISOString(),
      user: ownerData,
    };

    return NextResponse.json({
      members: [ownerMember, ...members.map(serializeMember)],
    });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 503 },
    );
  }
}

// POST /api/teams/[teamId]/members - Add a new member by email
export async function POST(
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

    // Get team and check permissions
    const [teamData] = await db
      .select({
        id: team.id,
        ownerId: team.ownerId,
      })
      .from(team)
      .where(eq(team.id, teamId))
      .limit(1);

    if (!teamData) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const isOwner = teamData.ownerId === session.user.id;

    // Check if user is an admin (owners and admins can add members)
    let canInvite = isOwner;
    if (!isOwner) {
      const [membership] = await db
        .select({ role: teamMember.role })
        .from(teamMember)
        .where(
          and(
            eq(teamMember.teamId, teamId),
            eq(teamMember.userId, session.user.id),
          ),
        )
        .limit(1);

      canInvite = membership?.role === "admin";
    }

    if (!canInvite) {
      return NextResponse.json(
        { message: "You don't have permission to add members" },
        { status: 403 },
      );
    }

    const payload = TeamMemberInviteRequest.parse(await request.json());

    // Find user by email
    const [targetUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.email, payload.email.toLowerCase()))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json(
        { message: "No user found with that email address" },
        { status: 404 },
      );
    }

    // Check if user is already the owner
    if (targetUser.id === teamData.ownerId) {
      return NextResponse.json(
        { message: "This user is already the team owner" },
        { status: 400 },
      );
    }

    // Check if user is already a member
    const [existingMember] = await db
      .select({ id: teamMember.id })
      .from(teamMember)
      .where(
        and(
          eq(teamMember.teamId, teamId),
          eq(teamMember.userId, targetUser.id),
        ),
      )
      .limit(1);

    if (existingMember) {
      return NextResponse.json(
        { message: "User is already a member of this team" },
        { status: 400 },
      );
    }

    // Add the member
    const now = new Date();
    const [newMember] = await db
      .insert(teamMember)
      .values({
        teamId,
        userId: targetUser.id,
        role: payload.role,
        invitedBy: session.user.id,
        joinedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: teamMember.id,
        userId: teamMember.userId,
        role: teamMember.role,
        joinedAt: teamMember.joinedAt,
        createdAt: teamMember.createdAt,
      });

    const memberRecord: TeamMemberRecord = {
      id: newMember.id,
      userId: newMember.userId,
      role: newMember.role,
      joinedAt: newMember.joinedAt?.toISOString() ?? null,
      createdAt: newMember.createdAt.toISOString(),
      user: targetUser,
    };

    return NextResponse.json({ member: memberRecord }, { status: 201 });
  } catch (error) {
    const status = error instanceof ZodError ? 400 : 503;
    return NextResponse.json({ message: (error as Error).message }, { status });
  }
}
