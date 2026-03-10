"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Player } from "@remotion/player";
import { Main } from "@/remotion/MyComp/Main";
import {
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "@/types/constants";
import { RenderControls } from "@/components/RenderControls";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { AssetManager } from "@/components/dashboard/AssetManager";
import type { ProjectAssetRecord } from "@/types/schema";

interface ProjectData {
  id: string;
  name: string;
  slug: string;
  team: {
    id: string;
    name: string;
    slug: string;
  };
  assets: ProjectAssetRecord[];
}

interface NewVideoClientProps {
  project: ProjectData;
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const SectionHeader: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="flex items-start justify-between gap-4 mb-4">
    <div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const NewVideoClient: React.FC<NewVideoClientProps> = ({ project }) => {
  const router = useRouter();
  const [text, setText] = useState<string>("Hello, World!");
  const [assets, setAssets] = useState<ProjectAssetRecord[]>(project.assets);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    project.assets[0]?.id ?? null,
  );
  const [assetsExpanded, setAssetsExpanded] = useState(true);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
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

  const handleRendered = useCallback(
    (videoId: string) => {
      // Navigate to the new video page
      router.push(`/${project.team.slug}/${project.slug}/${videoId}`);
    },
    [router, project.team.slug, project.slug],
  );

  const handleAssetsChange = useCallback((newAssets: ProjectAssetRecord[]) => {
    setAssets(newAssets);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <Breadcrumbs
        items={[
          { label: project.team.name, href: `/${project.team.slug}` },
          {
            label: project.name,
            href: `/${project.team.slug}/${project.slug}`,
          },
          {
            label: "New Video",
            href: `/${project.team.slug}/${project.slug}/new`,
          },
        ]}
      />

      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Create New Video
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your video and render it
        </p>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr,360px]">
        {/* Left Column - Preview & Controls */}
        <div className="space-y-8">
          {/* Preview Section */}
          <section>
            <SectionHeader
              title="Preview"
              description="Live preview of your video composition"
            />
            <div className="border border-unfocused-border-color rounded-geist overflow-hidden bg-black shadow-lg">
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
          </section>

          {/* Render Settings Section */}
          <section>
            <SectionHeader
              title="Render Settings"
              description="Configure and render your video"
            />
            <RenderControls
              text={text}
              setText={setText}
              inputProps={inputProps}
              projectId={project.id}
              assetId={selectedAssetId}
              projectName={project.name}
              onRendered={handleRendered}
            />
          </section>
        </div>

        {/* Right Column - Collapsible Asset Manager */}
        <aside className="xl:border-l xl:border-unfocused-border-color xl:pl-8">
          <div className="sticky top-6">
            {/* Collapsible Header */}
            <button
              onClick={() => setAssetsExpanded(!assetsExpanded)}
              className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-geist border border-unfocused-border-color hover:border-focused-border-color transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Assets</span>
                <span className="text-xs text-muted-foreground">
                  ({assets.length})
                </span>
              </div>
              {assetsExpanded ? (
                <ChevronUpIcon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* Collapsible Content */}
            {assetsExpanded && (
              <div className="mt-4">
                <AssetManager
                  projectId={project.id}
                  assets={assets}
                  selectedAssetId={selectedAssetId}
                  onSelectAsset={setSelectedAssetId}
                  onAssetsChange={handleAssetsChange}
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
