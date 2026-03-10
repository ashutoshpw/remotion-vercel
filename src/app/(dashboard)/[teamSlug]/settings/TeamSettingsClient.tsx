"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "../../../../components/dashboard/Breadcrumbs";
import { DeleteConfirmDialog } from "../../../../components/dashboard/DeleteConfirmDialog";
import type { TeamSummary } from "../../../../../types/schema";

interface TeamSettingsClientProps {
  team: TeamSummary;
}

export const TeamSettingsClient: React.FC<TeamSettingsClientProps> = ({
  team,
}) => {
  const router = useRouter();
  const [name, setName] = useState(team.name);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update team");
      }

      const { team: updatedTeam } = await response.json();
      setSuccess("Team updated successfully");

      // If slug changed, redirect to new URL
      if (updatedTeam.slug !== team.slug) {
        router.push(`/${updatedTeam.slug}/settings`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete team");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <Breadcrumbs
        items={[
          { label: team.name, href: `/${team.slug}` },
          { label: "Settings" },
        ]}
      />

      <h1 className="text-2xl font-semibold text-foreground mt-6 mb-8">
        Team Settings
      </h1>

      {/* General Settings */}
      <section className="mb-12">
        <h2 className="text-lg font-medium text-foreground mb-4">General</h2>
        <div className="border border-unfocused-border-color rounded-geist p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                htmlFor="team-name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Team name
              </label>
              <input
                id="team-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                className="w-full max-w-md px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground focus:outline-none focus:border-focused-border-color disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Team URL
              </label>
              <div className="text-sm text-muted-foreground">/{team.slug}</div>
            </div>

            {error && <p className="text-sm text-geist-error">{error}</p>}
            {success && <p className="text-sm text-geist-success">{success}</p>}

            <button
              type="submit"
              disabled={!name.trim() || name === team.name || isSaving}
              className="px-4 py-2 text-sm font-medium rounded-geist border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground disabled:bg-button-disabled-color disabled:text-disabled-text-color disabled:border-unfocused-border-color disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-lg font-medium text-destructive mb-4">
          Danger Zone
        </h2>
        <div className="border border-destructive/30 rounded-geist p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Delete team</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete this team and all of its projects, assets,
                and videos. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 text-sm font-medium rounded-geist bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity shrink-0 ml-4"
            >
              Delete team
            </button>
          </div>
        </div>
      </section>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete team"
        description={`This will permanently delete "${team.name}" and all its projects, assets, and videos. This action cannot be undone.`}
        confirmText={team.name}
        isLoading={isDeleting}
      />
    </div>
  );
};
