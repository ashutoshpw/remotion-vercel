"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import type { ProjectDetails } from "@/types/schema";

interface ProjectSettingsClientProps {
  project: ProjectDetails;
}

export const ProjectSettingsClient: React.FC<ProjectSettingsClientProps> = ({
  project,
}) => {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
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
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update project");
      }

      const { project: updatedProject } = await response.json();
      setSuccess("Project updated successfully");

      // If slug changed, redirect to new URL
      if (updatedProject.slug !== project.slug) {
        router.push(`/${project.team.slug}/${updatedProject.slug}/settings`);
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
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete project");
      }

      router.push(`/${project.team.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const hasChanges =
    name !== project.name || description !== (project.description ?? "");

  return (
    <div className="p-6 md:p-8">
      <Breadcrumbs
        items={[
          { label: project.team.name, href: `/${project.team.slug}` },
          {
            label: project.name,
            href: `/${project.team.slug}/${project.slug}`,
          },
          { label: "Settings" },
        ]}
      />

      <h1 className="text-2xl font-semibold text-foreground mt-6 mb-8">
        Project Settings
      </h1>

      {/* General Settings */}
      <section className="mb-12">
        <h2 className="text-lg font-medium text-foreground mb-4">General</h2>
        <div className="border border-unfocused-border-color rounded-geist p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                htmlFor="project-name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Project name
              </label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                className="w-full max-w-md px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground focus:outline-none focus:border-focused-border-color disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="project-description"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Description
              </label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
                rows={3}
                className="w-full max-w-md px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground focus:outline-none focus:border-focused-border-color disabled:opacity-50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project URL
              </label>
              <div className="text-sm text-muted-foreground">
                /{project.team.slug}/{project.slug}
              </div>
            </div>

            {error && <p className="text-sm text-geist-error">{error}</p>}
            {success && <p className="text-sm text-geist-success">{success}</p>}

            <button
              type="submit"
              disabled={!name.trim() || !hasChanges || isSaving}
              className="px-4 py-2 text-sm font-medium rounded-geist border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground disabled:bg-button-disabled-color disabled:text-disabled-text-color disabled:border-unfocused-border-color disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-12">
        <h2 className="text-lg font-medium text-foreground mb-4">Statistics</h2>
        <div className="border border-unfocused-border-color rounded-geist p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="text-2xl font-semibold text-foreground">
                {project.videos.length}
              </div>
              <div className="text-sm text-muted-foreground">Videos</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">
                {project.assets.length}
              </div>
              <div className="text-sm text-muted-foreground">Assets</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">Created</div>
            </div>
          </div>
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
              <h3 className="font-medium text-foreground">Delete project</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete this project and all of its assets and
                videos. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 text-sm font-medium rounded-geist bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity shrink-0 ml-4"
            >
              Delete project
            </button>
          </div>
        </div>
      </section>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete project"
        description={`This will permanently delete "${project.name}" and all its assets and videos. This action cannot be undone.`}
        confirmText={project.name}
        isLoading={isDeleting}
      />
    </div>
  );
};
