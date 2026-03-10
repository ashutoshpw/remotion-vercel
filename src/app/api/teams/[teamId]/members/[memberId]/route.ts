import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { ZodError } from "zod";
import { team, teamMember, user } from "@/db/schema";
import { getDb } from "@/lib/db";
import { getRequestSession } from "@/lib/session";
import { TeamMemberUpdateRequest, TeamMemberRecord } from "@/types/schema";

// PATCH /api/teams/[teamId]/members/[memberId] - Update member role
export async function PATCH(
  request: Request,
  context: { params: Promise<{ teamId: string; memberId: string }> },
) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { teamId, memberId } = await context.params;

  try {
    const db = getDb();

    // Get team and check if user is owner (only owners can change roles)
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

    // Only owner can change roles
    if (teamData.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Only the team owner can change member roles" },
        { status: 403 },
      );
    }

    // Get the member to update
    const [existingMember] = await db
      .select({
        id: teamMember.id,
        userId: teamMember.userId,
      })
      .from(teamMember)
      .where(and(eq(teamMember.id, memberId), eq(teamMember.teamId, teamId)))
      .limit(1);

    if (!existingMember) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 },
      );
    }

    const payload = TeamMemberUpdateRequest.parse(await request.json());

    // Update the member role
    const [updatedMember] = await db
      .update(teamMember)
      .set({
        role: payload.role,
        updatedAt: new Date(),
      })
      .where(eq(teamMember.id, memberId))
      .returning({
        id: teamMember.id,
        userId: teamMember.userId,
        role: teamMember.role,
        joinedAt: teamMember.joinedAt,
        createdAt: teamMember.createdAt,
      });

    // Get user info
    const [userData] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, updatedMember.userId))
      .limit(1);

    const memberRecord: TeamMemberRecord = {
      id: updatedMember.id,
      userId: updatedMember.userId,
      role: updatedMember.role,
      joinedAt: updatedMember.joinedAt?.toISOString() ?? null,
      createdAt: updatedMember.createdAt.toISOString(),
      user: userData,
    };

    return NextResponse.json({ member: memberRecord });
  } catch (error) {
    const status = error instanceof ZodError ? 400 : 503;
    return NextResponse.json({ message: (error as Error).message }, { status });
  }
}

// DELETE /api/teams/[teamId]/members/[memberId] - Remove a member
export async function DELETE(
  request: Request,
  context: { params: Promise<{ teamId: string; memberId: string }> },
) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { teamId, memberId } = await context.params;

  try {
    const db = getDb();

    // Get team
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

    // Get the member to remove
    const [targetMember] = await db
      .select({
        id: teamMember.id,
        userId: teamMember.userId,
        role: teamMember.role,
      })
      .from(teamMember)
      .where(and(eq(teamMember.id, memberId), eq(teamMember.teamId, teamId)))
      .limit(1);

    if (!targetMember) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 },
      );
    }

    // Check permissions
    // - Owner can remove anyone
    // - Admin can remove non-admins
    // - Members can only remove themselves
    let canRemove = false;

    if (isOwner) {
      canRemove = true;
    } else if (targetMember.userId === session.user.id) {
      // Users can always leave a team (remove themselves)
      canRemove = true;
    } else {
      // Check if current user is an admin
      const [currentMembership] = await db
        .select({ role: teamMember.role })
        .from(teamMember)
        .where(
          and(
            eq(teamMember.teamId, teamId),
            eq(teamMember.userId, session.user.id),
          ),
        )
        .limit(1);

      // Admins can remove members (but not other admins)
      if (
        currentMembership?.role === "admin" &&
        targetMember.role === "member"
      ) {
        canRemove = true;
      }
    }

    if (!canRemove) {
      return NextResponse.json(
        { message: "You don't have permission to remove this member" },
        { status: 403 },
      );
    }

    // Remove the member
    await db.delete(teamMember).where(eq(teamMember.id, memberId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 503 },
    );
  }
}
