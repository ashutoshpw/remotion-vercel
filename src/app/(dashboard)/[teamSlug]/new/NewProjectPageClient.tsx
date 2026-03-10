"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectIllustration } from "../../../../components/dashboard/illustrations";
import { Breadcrumbs } from "../../../../components/dashboard/Breadcrumbs";

interface NewProjectPageClientProps {
  teamId: string;
  teamName: string;
  teamSlug: string;
}

export const NewProjectPageClient: React.FC<NewProjectPageClientProps> = ({
  teamId,
  teamName,
  teamSlug,
}) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create project");
      }

      const { project } = await response.json();
      router.push(`/${teamSlug}/${project.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <Breadcrumbs
        items={[
          { label: teamName, href: `/${teamSlug}` },
          { label: "New project" },
        ]}
      />

      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 text-muted-foreground">
            <ProjectIllustration className="w-full h-full" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Create a project
          </h1>
          <p className="text-muted-foreground mt-2">
            Projects contain your videos, assets, and render settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="My Awesome Video"
              disabled={isLoading}
              autoFocus
              className="w-full px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-focused-border-color disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of your project"
              disabled={isLoading}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-focused-border-color disabled:opacity-50 resize-none"
            />
          </div>

          {error && <p className="text-sm text-geist-error">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-geist border border-unfocused-border-color hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="flex-1 border-foreground border rounded-geist bg-foreground text-background px-4 py-2 font-medium text-sm hover:bg-background hover:text-foreground hover:border-focused-border-color disabled:bg-button-disabled-color disabled:text-disabled-text-color disabled:border-unfocused-border-color disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
