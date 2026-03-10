"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { VideoIllustration } from "@/components/dashboard/illustrations";
import type { ProjectDetails } from "@/types/schema";

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

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

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

const VideoCard: React.FC<{
  video: ProjectDetails["videos"][number];
  teamSlug: string;
  projectSlug: string;
}> = ({ video, teamSlug, projectSlug }) => {
  const statusConfig = {
    rendering: {
      badge: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-geist-warning/10 text-geist-warning border border-geist-warning/20">
          <span className="w-1.5 h-1.5 rounded-full bg-geist-warning animate-pulse" />
          Rendering
        </span>
      ),
    },
    ready: {
      badge: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-geist-success/10 text-geist-success border border-geist-success/20">
          <svg
            className="w-3 h-3"
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
    },
    failed: {
      badge: (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-geist-error/10 text-geist-error border border-geist-error/20"
          title={video.errorMessage ?? "Render failed"}
        >
          <svg
            className="w-3 h-3"
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
    },
  };

  return (
    <Link
      href={`/${teamSlug}/${projectSlug}/${video.id}`}
      className="group block border border-unfocused-border-color rounded-geist hover:border-focused-border-color transition-colors overflow-hidden"
    >
      {/* Video Thumbnail / Preview Area */}
      <div className="relative aspect-video bg-muted flex items-center justify-center">
        {video.status === "ready" && video.renderUrl ? (
          <>
            <video
              src={video.renderUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <PlayIcon className="w-6 h-6 text-black ml-1" />
              </div>
            </div>
          </>
        ) : video.status === "rendering" ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="w-10 h-10 border-2 border-geist-warning border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Rendering...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <svg
              className="w-10 h-10 opacity-50"
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
            <span className="text-sm">Failed to render</span>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">
              {video.title}
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
              <span>{formatDate(video.createdAt)}</span>
              {video.size && <span>{formatBytes(video.size)}</span>}
              {video.asset && (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                    />
                  </svg>
                  {video.asset.name}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {statusConfig[video.status]?.badge}
            {video.status === "ready" && video.renderUrl && (
              <a
                href={video.renderUrl}
                download
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-geist border border-unfocused-border-color hover:bg-muted hover:border-focused-border-color transition-colors"
                title="Download video"
              >
                <DownloadIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

interface ProjectPageClientProps {
  project: ProjectDetails;
}

export const ProjectPageClient: React.FC<ProjectPageClientProps> = ({
  project,
}) => {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <Breadcrumbs
        items={[
          { label: project.team.name, href: `/${project.team.slug}` },
          {
            label: project.name,
            href: `/${project.team.slug}/${project.slug}`,
          },
        ]}
      />

      {/* Header */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Videos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {project.videos.length} video
            {project.videos.length !== 1 ? "s" : ""} in this project
          </p>
        </div>
        <Link
          href={`/${project.team.slug}/${project.slug}/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-geist text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <PlusIcon className="w-4 h-4" />
          New Video
        </Link>
      </div>

      {/* Videos Grid */}
      <div className="mt-8">
        {project.videos.length === 0 ? (
          <EmptyState
            icon={<VideoIllustration className="w-12 h-12" />}
            title="No videos yet"
            description="Create your first video to get started with rendering."
            action={{
              label: "Create Video",
              href: `/${project.team.slug}/${project.slug}/new`,
            }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {project.videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                teamSlug={project.team.slug}
                projectSlug={project.slug}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
