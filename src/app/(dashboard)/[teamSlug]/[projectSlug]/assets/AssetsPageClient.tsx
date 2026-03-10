"use client";

import React, { useState, useCallback } from "react";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { AssetWithUsage } from "@/types/schema";

interface ProjectData {
  id: string;
  name: string;
  slug: string;
  team: {
    id: string;
    name: string;
    slug: string;
  };
  assets: AssetWithUsage[];
}

interface AssetsPageClientProps {
  project: ProjectData;
}

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
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

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const AssetsPageClient: React.FC<AssetsPageClientProps> = ({
  project,
}) => {
  const [assets, setAssets] = useState<AssetWithUsage[]>(project.assets);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetWithUsage | null>(
    null,
  );

  const handleUpload = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return;

      setUploading(true);

      try {
        for (const file of Array.from(files)) {
          if (!file.type.startsWith("image/")) continue;

          const formData = new FormData();
          formData.append("file", file);
          formData.append("projectId", project.id);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const newAsset = await response.json();
          setAssets((prev) => [
            { ...newAsset, _count: { videos: 0 } },
            ...prev,
          ]);
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload file");
      } finally {
        setUploading(false);
      }
    },
    [project.id],
  );

  const handleDelete = useCallback(async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    try {
      const response = await fetch(`/api/upload?assetId=${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      setSelectedAsset(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete asset");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleUpload(e.dataTransfer.files);
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <Breadcrumbs
        items={[
          { label: project.team.name, href: `/${project.team.slug}` },
          {
            label: project.name,
            href: `/${project.team.slug}/${project.slug}`,
          },
          {
            label: "Assets",
            href: `/${project.team.slug}/${project.slug}/assets`,
          },
        ]}
      />

      {/* Header */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Assets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {assets.length} asset{assets.length !== 1 ? "s" : ""} in this
            project
          </p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-geist text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
          <UploadIcon className="w-4 h-4" />
          Upload
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </label>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,320px]">
        {/* Assets Grid */}
        <div>
          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`mb-6 border-2 border-dashed rounded-geist p-8 text-center transition-colors ${
              dragOver
                ? "border-foreground bg-muted"
                : "border-unfocused-border-color hover:border-focused-border-color"
            }`}
          >
            <UploadIcon className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {uploading
                ? "Uploading..."
                : "Drag and drop images here, or click Upload"}
            </p>
          </div>

          {/* Assets */}
          {assets.length === 0 ? (
            <EmptyState
              icon={<ImageIcon className="w-12 h-12" />}
              title="No assets yet"
              description="Upload images to use in your video compositions."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`group relative aspect-square rounded-geist overflow-hidden border transition-colors text-left ${
                    selectedAsset?.id === asset.id
                      ? "border-foreground ring-2 ring-foreground/20"
                      : "border-unfocused-border-color hover:border-focused-border-color"
                  }`}
                >
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-sm text-white font-medium truncate">
                      {asset.name}
                    </p>
                    {asset._count.videos > 0 && (
                      <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                        <VideoIcon className="w-3 h-3" />
                        Used in {asset._count.videos} video
                        {asset._count.videos !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Asset Details Sidebar */}
        <div className="lg:border-l lg:border-unfocused-border-color lg:pl-8">
          {selectedAsset ? (
            <div className="sticky top-6 space-y-4">
              <div className="aspect-square rounded-geist overflow-hidden border border-unfocused-border-color">
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium text-foreground truncate">
                  {selectedAsset.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Added {formatDate(selectedAsset.createdAt)}
                </p>
              </div>

              {selectedAsset._count.videos > 0 && (
                <div className="p-3 bg-muted/50 rounded-geist">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <VideoIcon className="w-4 h-4" />
                    Used in {selectedAsset._count.videos} video
                    {selectedAsset._count.videos !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <a
                  href={selectedAsset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm border border-unfocused-border-color rounded-geist hover:bg-muted transition-colors"
                >
                  Open
                </a>
                <button
                  onClick={() => handleDelete(selectedAsset.id)}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm border border-geist-error/30 text-geist-error rounded-geist hover:bg-geist-error/10 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="sticky top-6 flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 opacity-50 mb-3" />
              <p className="text-sm">Select an asset to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
