"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Player } from "@remotion/player";
import { Main } from "../../../../remotion/MyComp/Main";
import {
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../../../../types/constants";
import { RenderControls } from "../../../../components/RenderControls";
import { Breadcrumbs } from "../../../../components/dashboard/Breadcrumbs";
import { EmptyState } from "../../../../components/dashboard/EmptyState";
import { VideoIllustration } from "../../../../components/dashboard/illustrations";
import type { ProjectDetails } from "../../../../../types/schema";

interface ProjectPageClientProps {
  project: ProjectDetails;
}

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ProjectPageClient: React.FC<ProjectPageClientProps> = ({
  project,
}) => {
  const [text, setText] = useState<string>("Hello, World!");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    project.assets[0]?.id ?? null,
  );

  const selectedAsset = useMemo(
    () => project.assets.find((a) => a.id === selectedAssetId) ?? null,
    [project.assets, selectedAssetId],
  );

  const inputProps = useMemo(
    () => ({
      title: text,
      projectName: project.name,
      assetName: selectedAsset?.name,
      assetUrl: selectedAsset?.url,
    }),
    [text, project.name, selectedAsset?.name, selectedAsset?.url],
  );

  const handleRendered = useCallback(async () => {
    // Refresh the page to get updated videos list
    window.location.reload();
  }, []);

  return (
    <div className="p-6 md:p-8">
      <Breadcrumbs
        items={[
          { label: project.team.name, href: `/${project.team.slug}` },
          {
            label: project.name,
            href: `/${project.team.slug}/${project.slug}`,
          },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Left Column - Preview & Controls */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-4">Preview</h2>
          <div className="border border-unfocused-border-color rounded-geist overflow-hidden bg-black">
            <Player
              component={Main}
              inputProps={inputProps}
              durationInFrames={DURATION_IN_FRAMES}
              fps={VIDEO_FPS}
              compositionHeight={VIDEO_HEIGHT}
              compositionWidth={VIDEO_WIDTH}
              style={{ width: "100%" }}
              controls
              autoPlay
              loop
            />
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-foreground mb-3">
              Render Settings
            </h3>
            <RenderControls
              text={text}
              setText={setText}
              inputProps={inputProps}
              projectId={project.id}
              assetId={selectedAssetId}
              projectName={project.name}
              onRendered={handleRendered}
            />
          </div>

          {/* Asset Selection */}
          {project.assets.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Logo Asset
              </h3>
              <select
                value={selectedAssetId ?? ""}
                onChange={(e) => setSelectedAssetId(e.target.value || null)}
                className="w-full px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground focus:outline-none focus:border-focused-border-color"
              >
                <option value="">No logo</option>
                {project.assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Column - Videos List */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-4">
            Rendered Videos
          </h2>

          {project.videos.length === 0 ? (
            <EmptyState
              icon={<VideoIllustration className="w-12 h-12" />}
              title="No videos yet"
              description="Render your first video using the controls on the left."
            />
          ) : (
            <div className="space-y-3">
              {project.videos.map((video) => (
                <div
                  key={video.id}
                  className="border border-unfocused-border-color rounded-geist p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {video.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{formatDate(video.createdAt)}</span>
                        {video.size && <span>{formatBytes(video.size)}</span>}
                        {video.asset && <span>{video.asset.name}</span>}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {video.status === "rendering" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-geist-warning/10 text-geist-warning">
                          <span className="w-1.5 h-1.5 rounded-full bg-geist-warning animate-pulse" />
                          Rendering
                        </span>
                      )}
                      {video.status === "ready" && video.renderUrl && (
                        <a
                          href={video.renderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-geist border border-unfocused-border-color hover:bg-muted transition-colors"
                        >
                          Download
                        </a>
                      )}
                      {video.status === "failed" && (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-geist-error/10 text-geist-error"
                          title={video.errorMessage ?? "Render failed"}
                        >
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
