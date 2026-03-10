"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import type { TeamMemberRecord, TeamMemberRole } from "@/types/schema";

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const roleColors: Record<TeamMemberRole, string> = {
  owner: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  member: "bg-gray-100 text-gray-800",
};

const roleLabels: Record<TeamMemberRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

interface MembersPageClientProps {
  team: { id: string; name: string; slug: string; ownerId: string };
  members: TeamMemberRecord[];
  currentUserId: string;
  currentUserRole: TeamMemberRole;
}

const MemberAvatar: React.FC<{
  user: TeamMemberRecord["user"];
  size?: "sm" | "md";
}> = ({ user, size = "md" }) => {
  const sizeClasses = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name}
        className={`${sizeClasses} rounded-full object-cover`}
      />
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${sizeClasses} rounded-full bg-gradient-to-br from-muted to-accent flex items-center justify-center font-medium text-muted-foreground`}
    >
      {initials}
    </div>
  );
};

const RoleDropdown: React.FC<{
  memberId: string;
  currentRole: TeamMemberRole;
  teamId: string;
  onRoleChange: (memberId: string, newRole: "admin" | "member") => void;
  disabled: boolean;
}> = ({ memberId, currentRole, onRoleChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (currentRole === "owner" || disabled) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[currentRole]}`}
      >
        {roleLabels[currentRole]}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[currentRole]} hover:opacity-80 transition-opacity`}
      >
        {roleLabels[currentRole]}
        <ChevronDownIcon className="w-3 h-3" />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-32 bg-background border border-unfocused-border-color rounded-geist shadow-lg z-20">
            {(["admin", "member"] as const).map((role) => (
              <button
                key={role}
                onClick={() => {
                  onRoleChange(memberId, role);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-geist last:rounded-b-geist ${
                  currentRole === role ? "bg-muted font-medium" : ""
                }`}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const MembersPageClient: React.FC<MembersPageClientProps> = ({
  team,
  members: initialMembers,
  currentUserId,
  currentUserRole,
}) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [members, setMembers] = useState(initialMembers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"admin" | "member">(
    "member",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManageMembers =
    currentUserRole === "owner" || currentUserRole === "admin";
  const canChangeRoles = currentUserRole === "owner";

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/teams/${team.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: newMemberRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add member");
      }

      setMembers([...members, data.member]);
      setEmail("");
      setNewMemberRole("member");
      setShowAddForm(false);
      startTransition(() => router.refresh());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (
    memberId: string,
    newRole: "admin" | "member",
  ) => {
    try {
      const res = await fetch(`/api/teams/${team.id}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update role");
      }

      setMembers(
        members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      );
      startTransition(() => router.refresh());
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (
      !confirm(`Are you sure you want to remove ${memberName} from the team?`)
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/teams/${team.id}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to remove member");
      }

      setMembers(members.filter((m) => m.id !== memberId));
      startTransition(() => router.refresh());
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const canRemoveMember = (member: TeamMemberRecord): boolean => {
    // Can't remove owner
    if (member.role === "owner") return false;
    // Owner can remove anyone
    if (currentUserRole === "owner") return true;
    // Users can remove themselves
    if (member.userId === currentUserId) return true;
    // Admins can remove members (not other admins)
    if (currentUserRole === "admin" && member.role === "member") return true;
    return false;
  };

  return (
    <div className="p-6 md:p-8 max-w-[900px] mx-auto">
      <Breadcrumbs
        items={[
          { label: team.name, href: `/${team.slug}` },
          { label: "Members", href: `/${team.slug}/members` },
        ]}
      />

      <div className="flex items-center justify-between mt-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            {members.length} member{members.length !== 1 ? "s" : ""} in{" "}
            {team.name}
          </p>
        </div>
        {canManageMembers && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-geist bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-geist text-red-700 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAddMember}
          className="mb-6 p-4 border border-unfocused-border-color rounded-geist bg-muted/30"
        >
          <h3 className="font-medium text-foreground mb-4">Add New Member</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background focus:outline-none focus:border-focused-border-color"
              required
            />
            <select
              value={newMemberRole}
              onChange={(e) =>
                setNewMemberRole(e.target.value as "admin" | "member")
              }
              className="px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background focus:outline-none focus:border-focused-border-color"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="px-4 py-2 text-sm font-medium rounded-geist bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEmail("");
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium rounded-geist border border-unfocused-border-color hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            The user must already have an account to be added to the team.
          </p>
        </form>
      )}

      <div className="border border-unfocused-border-color rounded-geist overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-unfocused-border-color">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                Member
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                Role
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-unfocused-border-color">
            {members.map((member) => (
              <tr
                key={member.id}
                className={`hover:bg-muted/30 transition-colors ${
                  member.userId === currentUserId ? "bg-muted/20" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <MemberAvatar user={member.user} />
                    <div>
                      <p className="font-medium text-foreground">
                        {member.user.name}
                        {member.userId === currentUserId && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RoleDropdown
                    memberId={member.id}
                    currentRole={member.role}
                    teamId={team.id}
                    onRoleChange={handleRoleChange}
                    disabled={!canChangeRoles || member.role === "owner"}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  {canRemoveMember(member) && (
                    <button
                      onClick={() =>
                        handleRemoveMember(member.id, member.user.name)
                      }
                      className="inline-flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                      title={
                        member.userId === currentUserId
                          ? "Leave team"
                          : "Remove member"
                      }
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {member.userId === currentUserId ? "Leave" : "Remove"}
                      </span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-4 bg-muted/30 rounded-geist">
        <h3 className="font-medium text-foreground mb-2">Role Permissions</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            <span
              className={`inline-block w-16 ${roleColors.owner} px-1.5 py-0.5 rounded text-xs font-medium mr-2`}
            >
              Owner
            </span>
            Full access: manage team, members, projects, and billing
          </li>
          <li>
            <span
              className={`inline-block w-16 ${roleColors.admin} px-1.5 py-0.5 rounded text-xs font-medium mr-2`}
            >
              Admin
            </span>
            Manage projects, videos, assets, and invite members
          </li>
          <li>
            <span
              className={`inline-block w-16 ${roleColors.member} px-1.5 py-0.5 rounded text-xs font-medium mr-2`}
            >
              Member
            </span>
            Create and edit videos and assets
          </li>
        </ul>
      </div>
    </div>
  );
};
