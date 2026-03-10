"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Player } from "@remotion/player";
import { Main } from "@/remotion/MyComp/Main";
import {
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  defaultMyCompProps,
} from "@/types/constants";
import type { CompositionPropsType } from "@/types/constants";
import { RenderControls } from "@/components/RenderControls";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { VideoEditorTabs } from "@/components/video/VideoEditorTabs";
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
  isAiConfigured: boolean;
}

interface NewVideoClientProps {
  project: ProjectData;
}

const PanelLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  </svg>
);

const PanelLeftCloseIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
    <path d="m16 15-3-3 3-3" />
  </svg>
);

export const NewVideoClient: React.FC<NewVideoClientProps> = ({ project }) => {
  const router = useRouter();
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // Separate title state for RenderControls compatibility
  const [title, setTitle] = useState<string>(defaultMyCompProps.title);

  // Editable props state - starting with defaults
  const [editableProps, setEditableProps] = useState<CompositionPropsType>({
    ...defaultMyCompProps,
    projectName: project.name,
  });

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    project.assets[0]?.id ?? null,
  );

  // Sync title changes to editableProps
  useEffect(() => {
    setEditableProps((prev) => ({ ...prev, title }));
  }, [title]);

  // Get selected asset info
  const selectedAsset = useMemo(
    () => project.assets.find((a) => a.id === selectedAssetId) ?? null,
    [project.assets, selectedAssetId],
  );

  // Combined props for the player (with asset info)
  const playerProps = useMemo(
    () => ({
      ...editableProps,
      assetName: selectedAsset?.name,
      assetUrl: selectedAsset?.url,
    }),
    [editableProps, selectedAsset],
  );

  const handlePropsChange = useCallback(
    (updates: Partial<CompositionPropsType>) => {
      // If title is being updated, also update the title state
      if (updates.title !== undefined) {
        setTitle(updates.title);
      }
      setEditableProps((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const handleAssetSelect = useCallback((assetId: string | null) => {
    setSelectedAssetId(assetId);
  }, []);

  const handleRendered = useCallback(
    (videoId: string) => {
      router.push(`/${project.team.slug}/${project.slug}/${videoId}`);
    },
    [router, project.team.slug, project.slug],
  );

  // Convert assets to the format expected by VideoEditorTabs
  const assetsForTabs = useMemo(
    () =>
      project.assets.map((a) => ({
        id: a.id,
        name: a.name,
        url: a.url,
        type: "image",
      })),
    [project.assets],
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="shrink-0 p-4 md:p-6 border-b border-unfocused-border-color">
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
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Create New Video
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configure your video and render it
            </p>
          </div>
          <button
            onClick={() => setPanelCollapsed(!panelCollapsed)}
            className="p-2 rounded-geist border border-unfocused-border-color hover:border-focused-border-color hover:bg-muted transition-colors"
            title={panelCollapsed ? "Show panel" : "Hide panel"}
          >
            {panelCollapsed ? (
              <PanelLeftIcon className="w-5 h-5" />
            ) : (
              <PanelLeftCloseIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor Tabs */}
        <div
          className={`shrink-0 border-r border-unfocused-border-color transition-all duration-300 overflow-hidden ${
            panelCollapsed ? "w-0 border-r-0" : "w-full lg:w-[380px]"
          }`}
        >
          <div className="h-full w-[380px]">
            <VideoEditorTabs
              videoId="new"
              props={editableProps}
              onPropsChange={handlePropsChange}
              assets={assetsForTabs}
              selectedAssetId={selectedAssetId}
              onAssetSelect={handleAssetSelect}
              isAiConfigured={project.isAiConfigured}
            />
          </div>
        </div>

        {/* Right Panel - Video Preview & Render Controls */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
            {/* Video Preview */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Preview
              </h2>
              <div className="border border-unfocused-border-color rounded-geist overflow-hidden bg-black shadow-lg">
                <Player
                  component={Main}
                  inputProps={playerProps}
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
            </div>

            {/* Render Controls */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Render
              </h2>
              <RenderControls
                text={title}
                setText={setTitle}
                inputProps={playerProps}
                projectId={project.id}
                assetId={selectedAssetId}
                projectName={project.name}
                onRendered={handleRendered}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
