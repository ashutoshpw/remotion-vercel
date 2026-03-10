"use client";

import React, { useState, useCallback, useRef } from "react";
import type { ProjectAssetRecord } from "@/types/schema";

interface AssetManagerProps {
  projectId: string;
  assets: ProjectAssetRecord[];
  selectedAssetId: string | null;
  onSelectAsset: (assetId: string | null) => void;
  onAssetsChange: (assets: ProjectAssetRecord[]) => void;
}

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

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
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export const AssetManager: React.FC<AssetManagerProps> = ({
  projectId,
  assets,
  selectedAssetId,
  onSelectAsset,
  onAssetsChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);
      setUploadProgress("Uploading...");

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Upload failed");
        }

        onAssetsChange([...assets, data.asset]);
        setUploadProgress(null);
      } catch (err) {
        setError((err as Error).message);
        setUploadProgress(null);
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, assets, onAssetsChange],
  );

  const handleDelete = useCallback(
    async (assetId: string) => {
      setDeletingId(assetId);
      setError(null);

      try {
        const response = await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assetId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Delete failed");
        }

        const newAssets = assets.filter((a) => a.id !== assetId);
        onAssetsChange(newAssets);

        if (selectedAssetId === assetId) {
          onSelectAsset(null);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setDeletingId(null);
      }
    },
    [assets, selectedAssetId, onAssetsChange, onSelectAsset],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUpload(file);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleUpload(file);
      } else {
        setError("Please drop an image file");
      }
    },
    [handleUpload],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Assets</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {assets.length === 0
              ? "Upload images for your videos"
              : `${assets.length} ${assets.length === 1 ? "asset" : "assets"}`}
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative rounded-geist p-6 text-center cursor-pointer transition-all duration-200
          border-2 border-dashed
          ${
            isDragging
              ? "border-geist-success bg-geist-success/5 scale-[1.02]"
              : "border-unfocused-border-color hover:border-focused-border-color hover:bg-muted/50"
          }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        <div className="space-y-3">
          {isUploading ? (
            <Spinner className="w-8 h-8 mx-auto text-geist-success" />
          ) : (
            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
              <UploadIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}

          {uploadProgress ? (
            <p className="text-sm font-medium text-foreground">
              {uploadProgress}
            </p>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop image here or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPEG, GIF, WebP, SVG (max 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-geist bg-geist-error/10 border border-geist-error/20">
          <p className="text-sm text-geist-error">{error}</p>
        </div>
      )}

      {/* Asset List */}
      {assets.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Select logo for video
          </div>
          <div className="space-y-2">
            {assets.map((asset) => {
              const isSelected = selectedAssetId === asset.id;
              const isDeleting = deletingId === asset.id;

              return (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset.id)}
                  className={`
                    group flex items-center gap-3 p-3 rounded-geist cursor-pointer
                    transition-all duration-150
                    border
                    ${
                      isSelected
                        ? "border-geist-success bg-geist-success/5 shadow-sm"
                        : "border-unfocused-border-color hover:border-focused-border-color hover:bg-muted/50"
                    }
                  `}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-geist bg-muted overflow-hidden shrink-0 border border-unfocused-border-color">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {asset.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-medium text-geist-success">
                        <CheckIcon className="w-3.5 h-3.5" />
                        Selected
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset.id);
                      }}
                      disabled={isDeleting}
                      className="p-1.5 rounded-geist text-muted-foreground hover:text-geist-error hover:bg-geist-error/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      title="Delete asset"
                    >
                      {isDeleting ? (
                        <Spinner className="w-4 h-4" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear Selection */}
      {assets.length > 0 && selectedAssetId && (
        <button
          onClick={() => onSelectAsset(null)}
          className="w-full text-sm text-muted-foreground hover:text-foreground py-2 px-4 rounded-geist border border-dashed border-unfocused-border-color hover:border-focused-border-color transition-colors"
        >
          Clear selection (no logo)
        </button>
      )}

      {/* Empty State */}
      {assets.length === 0 && (
        <div className="text-center py-4">
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mt-2">
            No assets uploaded yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Upload an image to use as a logo in your videos
          </p>
        </div>
      )}
    </div>
  );
};
