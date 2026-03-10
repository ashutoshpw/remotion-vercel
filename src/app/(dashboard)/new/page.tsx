"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TeamIllustration } from "@/components/dashboard/illustrations";

export default function NewTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create team");
      }

      const { team } = await response.json();
      router.push(`/${team.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 text-muted-foreground">
            <TeamIllustration className="w-full h-full" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Create your team
          </h1>
          <p className="text-muted-foreground mt-2">
            Teams help you organize projects and collaborate with others.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Acme Inc."
              disabled={isLoading}
              autoFocus
              className="w-full px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-focused-border-color disabled:opacity-50"
            />
          </div>

          {error && <p className="text-sm text-geist-error">{error}</p>}

          <div className="w-full">
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="w-full border-foreground border rounded-geist bg-foreground text-background px-geist-half font-geist h-10 font-medium transition-all duration-150 ease-in-out inline-flex items-center justify-center text-sm hover:bg-background hover:text-foreground hover:border-focused-border-color disabled:bg-button-disabled-color disabled:text-disabled-text-color disabled:border-unfocused-border-color disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
