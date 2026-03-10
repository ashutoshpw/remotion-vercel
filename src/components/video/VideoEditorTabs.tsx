"use client";

import React, { useState } from "react";
import { VideoChat } from "./VideoChat";
import { VideoAssetPicker } from "./VideoAssetPicker";
import { VideoSettingsPanel } from "./VideoSettingsPanel";
import type { CompositionPropsType } from "@/types/constants";

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface VideoEditorTabsProps {
  videoId: string;
  props: CompositionPropsType;
  onPropsChange: (props: Partial<CompositionPropsType>) => void;
  assets: Asset[];
  selectedAssetId: string | null;
  onAssetSelect: (assetId: string | null) => void;
  isAiConfigured: boolean;
}

type TabId = "chat" | "assets" | "settings";

const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
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
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
    />
  </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
    />
  </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
    />
  </svg>
);

const tabs: {
  id: TabId;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: "chat", label: "Chat", icon: ChatIcon },
  { id: "assets", label: "Assets", icon: ImageIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export const VideoEditorTabs: React.FC<VideoEditorTabsProps> = ({
  videoId,
  props,
  onPropsChange,
  assets,
  selectedAssetId,
  onAssetSelect,
  isAiConfigured,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("chat");

  return (
    <div className="h-full flex flex-col bg-background border border-unfocused-border-color rounded-geist overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-unfocused-border-color shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const showAiBadge = tab.id === "chat" && isAiConfigured;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                isActive
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {showAiBadge && (
                <SparklesIcon className="w-3 h-3 text-geist-success" />
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" && (
          <VideoChat
            videoId={videoId}
            currentProps={props}
            onPropsChange={onPropsChange}
            onAssetSelect={(assetId) => onAssetSelect(assetId)}
            isAiConfigured={isAiConfigured}
          />
        )}
        {activeTab === "assets" && (
          <VideoAssetPicker
            assets={assets}
            selectedAssetId={selectedAssetId}
            onAssetSelect={onAssetSelect}
          />
        )}
        {activeTab === "settings" && (
          <VideoSettingsPanel props={props} onPropsChange={onPropsChange} />
        )}
      </div>
    </div>
  );
};
