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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Assets</h3>
        <span className="text-xs text-muted-foreground">
          {assets.length} {assets.length === 1 ? "file" : "files"}
        </span>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-geist p-4 text-center cursor-pointer
          transition-colors duration-150
          ${
            isDragging
              ? "border-geist-success bg-geist-success/5"
              : "border-unfocused-border-color hover:border-focused-border-color"
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
        <div className="space-y-1">
          <svg
            className="w-6 h-6 mx-auto text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {uploadProgress ? (
            <p className="text-sm text-muted-foreground">{uploadProgress}</p>
          ) : (
            <>
              <p className="text-sm text-foreground">
                Drop image here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPEG, GIF, WebP, SVG up to 10MB
              </p>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-geist-error">{error}</p>}

      {/* Asset List */}
      {assets.length > 0 && (
        <div className="space-y-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className={`
                flex items-center gap-3 p-2 rounded-geist border cursor-pointer
                transition-colors duration-150
                ${
                  selectedAssetId === asset.id
                    ? "border-geist-success bg-geist-success/5"
                    : "border-unfocused-border-color hover:border-focused-border-color"
                }
              `}
              onClick={() => onSelectAsset(asset.id)}
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
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
                <p className="text-xs text-muted-foreground">
                  {new Date(asset.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {selectedAssetId === asset.id && (
                  <span className="text-xs text-geist-success font-medium px-2">
                    Selected
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(asset.id);
                  }}
                  disabled={deletingId === asset.id}
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-geist-error transition-colors disabled:opacity-50"
                  title="Delete asset"
                >
                  {deletingId === asset.id ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
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
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Logo Option */}
      {assets.length > 0 && selectedAssetId && (
        <button
          onClick={() => onSelectAsset(null)}
          className="w-full text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
        >
          Clear selection (no logo)
        </button>
      )}
    </div>
  );
};
