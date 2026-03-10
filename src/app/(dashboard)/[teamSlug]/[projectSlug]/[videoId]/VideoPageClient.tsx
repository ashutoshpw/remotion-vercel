"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
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
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { VideoEditorTabs } from "@/components/video/VideoEditorTabs";
import type { VideoDetails } from "@/types/schema";

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface VideoPageClientProps {
  video: VideoDetails;
  assets: Asset[];
  isAiConfigured: boolean;
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
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
    />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
);

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
    />
  </svg>
);

export const VideoPageClient: React.FC<VideoPageClientProps> = ({
  video,
  assets,
  isAiConfigured,
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(video.status !== "ready");

  // Parse initial props from video.inputProps
  const initialProps = useMemo(() => {
    const stored = video.inputProps as Partial<CompositionPropsType>;
    return {
      ...defaultMyCompProps,
      ...stored,
    };
  }, [video.inputProps]);

  // Editable props state
  const [editableProps, setEditableProps] =
    useState<CompositionPropsType>(initialProps);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    video.asset?.id ?? null,
  );

  // Get selected asset info
  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
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
      setEditableProps((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const handleAssetSelect = useCallback((assetId: string | null) => {
    setSelectedAssetId(assetId);
  }, []);

  const statusConfig = {
    rendering: {
      badge: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-geist-warning/10 text-geist-warning border border-geist-warning/20">
          <span className="w-2 h-2 rounded-full bg-geist-warning animate-pulse" />
          Rendering
        </span>
      ),
      description: "Your video is currently being rendered...",
    },
    ready: {
      badge: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-geist-success/10 text-geist-success border border-geist-success/20">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Ready
        </span>
      ),
      description: "Your video is ready to download and share.",
    },
    failed: {
      badge: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-geist-error/10 text-geist-error border border-geist-error/20">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Failed
        </span>
      ),
      description:
        video.errorMessage || "There was an error rendering your video.",
    },
  };

  const handleCopyUrl = async () => {
    if (video.renderUrl) {
      await navigator.clipboard.writeText(video.renderUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      router.push(`/${video.project.team.slug}/${video.project.slug}`);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete video");
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <Breadcrumbs
        items={[
          {
            label: video.project.team.name,
            href: `/${video.project.team.slug}`,
          },
          {
            label: video.project.name,
            href: `/${video.project.team.slug}/${video.project.slug}`,
          },
          {
            label: video.title,
            href: `/${video.project.team.slug}/${video.project.slug}/${video.id}`,
          },
        ]}
      />

      {/* Header */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {video.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            {statusConfig[video.status].badge}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${video.project.team.slug}/${video.project.slug}/new`}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-unfocused-border-color rounded-geist hover:bg-muted transition-colors"
          >
            <RefreshIcon className="w-4 h-4" />
            Re-render
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-geist-error/30 text-geist-error rounded-geist hover:bg-geist-error/10 transition-colors disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[380px,1fr]">
        {/* Left Panel - Editor Tabs */}
        <div className="h-[600px] lg:h-[calc(100vh-280px)] min-h-[500px]">
          <VideoEditorTabs
            videoId={video.id}
            props={editableProps}
            onPropsChange={handlePropsChange}
            assets={assets}
            selectedAssetId={selectedAssetId}
            onAssetSelect={handleAssetSelect}
            isAiConfigured={isAiConfigured}
          />
        </div>

        {/* Right Panel - Video Preview / Player */}
        <div className="space-y-4">
          {/* Toggle between preview and rendered video */}
          {video.status === "ready" && video.renderUrl && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className={`px-3 py-1.5 text-sm rounded-geist transition-colors ${
                  !showPreview
                    ? "bg-foreground text-background"
                    : "border border-unfocused-border-color hover:border-focused-border-color"
                }`}
              >
                Rendered Video
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className={`px-3 py-1.5 text-sm rounded-geist transition-colors ${
                  showPreview
                    ? "bg-foreground text-background"
                    : "border border-unfocused-border-color hover:border-focused-border-color"
                }`}
              >
                <PlayIcon className="w-4 h-4 inline mr-1.5" />
                Live Preview
              </button>
            </div>
          )}

          {/* Video Display */}
          <div className="relative aspect-video bg-black rounded-geist overflow-hidden border border-unfocused-border-color">
            {showPreview || video.status !== "ready" ? (
              /* Live Preview with Remotion Player */
              video.status === "rendering" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm">Rendering in progress...</p>
                  <p className="text-xs text-white/60 mt-2">
                    You can edit below and re-render when ready
                  </p>
                </div>
              ) : video.status === "failed" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <svg
                    className="w-12 h-12 opacity-50 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm">Render failed</p>
                </div>
              ) : (
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
              )
            ) : (
              /* Rendered Video */
              <video
                src={video.renderUrl!}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            )}
          </div>

          {/* Action Buttons for Ready Videos */}
          {video.status === "ready" && video.renderUrl && !showPreview && (
            <div className="flex items-center gap-3">
              <a
                href={video.renderUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-geist text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <DownloadIcon className="w-4 h-4" />
                Download
                {video.size && (
                  <span className="opacity-70">
                    ({formatBytes(video.size)})
                  </span>
                )}
              </a>
              <button
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-2 px-4 py-2 border border-unfocused-border-color rounded-geist text-sm hover:bg-muted transition-colors"
              >
                <CopyIcon className="w-4 h-4" />
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
          )}

          {/* Metadata */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Status Card */}
            <div className="border border-unfocused-border-color rounded-geist p-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Status
              </h3>
              <p className="text-sm text-foreground">
                {statusConfig[video.status].description}
              </p>
            </div>

            {/* Details Card */}
            <div className="border border-unfocused-border-color rounded-geist p-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Details
              </h3>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="text-foreground">
                    {formatDate(video.createdAt)}
                  </dd>
                </div>
                {video.size && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">File Size</dt>
                    <dd className="text-foreground">
                      {formatBytes(video.size)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
