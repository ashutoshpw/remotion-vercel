"use client";

import React from "react";

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface VideoAssetPickerProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onAssetSelect: (assetId: string | null) => void;
}

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
    />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

export const VideoAssetPicker: React.FC<VideoAssetPickerProps> = ({
  assets,
  selectedAssetId,
  onAssetSelect,
}) => {
  if (assets.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Assets</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Upload assets in the project Assets page to use them in your videos.
        </p>
        <a
          href="../assets"
          className="text-sm text-foreground underline hover:no-underline"
        >
          Go to Assets
        </a>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-unfocused-border-color">
        <h3 className="text-sm font-medium text-foreground">Project Assets</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Select an asset to display in your video
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* None option */}
        <button
          onClick={() => onAssetSelect(null)}
          className={`w-full mb-4 p-3 border rounded-geist transition-colors text-left ${
            selectedAssetId === null
              ? "border-foreground bg-muted"
              : "border-unfocused-border-color hover:border-focused-border-color"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
              <span className="text-lg text-muted-foreground">-</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">No asset</p>
              <p className="text-xs text-muted-foreground">Display text only</p>
            </div>
            {selectedAssetId === null && (
              <CheckIcon className="w-5 h-5 text-geist-success" />
            )}
          </div>
        </button>

        {/* Asset grid */}
        <div className="grid grid-cols-2 gap-3">
          {assets.map((asset) => {
            const isSelected = selectedAssetId === asset.id;
            return (
              <button
                key={asset.id}
                onClick={() => onAssetSelect(asset.id)}
                className={`relative group overflow-hidden rounded-geist border transition-all ${
                  isSelected
                    ? "border-foreground ring-2 ring-foreground/20"
                    : "border-unfocused-border-color hover:border-focused-border-color"
                }`}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-muted relative">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Selected overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-geist-success flex items-center justify-center">
                        <CheckIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                  {/* Hover overlay */}
                  {!isSelected && (
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
                  )}
                </div>
                {/* Name */}
                <div className="p-2 bg-background">
                  <p className="text-xs text-foreground truncate">
                    {asset.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
