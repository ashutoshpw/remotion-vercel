"use client";

import React from "react";
import type { CompositionPropsType } from "@/types/constants";

interface VideoSettingsPanelProps {
  props: CompositionPropsType;
  onPropsChange: (props: Partial<CompositionPropsType>) => void;
}

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
    />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
    />
  </svg>
);

export const VideoSettingsPanel: React.FC<VideoSettingsPanelProps> = ({
  props,
  onPropsChange,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-unfocused-border-color">
        <h3 className="text-sm font-medium text-foreground">Video Settings</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Manually adjust video properties
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Content Section */}
        <section>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Content
          </h4>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={props.title}
                onChange={(e) => onPropsChange({ title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground focus:outline-none focus:border-focused-border-color"
                maxLength={80}
              />
            </div>
            <div>
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                value={props.projectName}
                onChange={(e) => onPropsChange({ projectName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground focus:outline-none focus:border-focused-border-color"
                maxLength={80}
              />
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Theme
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => onPropsChange({ theme: "light" })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm border rounded-geist transition-colors ${
                props.theme === "light"
                  ? "border-foreground bg-foreground text-background"
                  : "border-unfocused-border-color hover:border-focused-border-color"
              }`}
            >
              <SunIcon className="w-4 h-4" />
              Light
            </button>
            <button
              onClick={() => onPropsChange({ theme: "dark" })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm border rounded-geist transition-colors ${
                props.theme === "dark"
                  ? "border-foreground bg-foreground text-background"
                  : "border-unfocused-border-color hover:border-focused-border-color"
              }`}
            >
              <MoonIcon className="w-4 h-4" />
              Dark
            </button>
          </div>
        </section>

        {/* Colors Section */}
        <section>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Custom Colors
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label
                htmlFor="bgColor"
                className="text-sm text-foreground w-24 shrink-0"
              >
                Background
              </label>
              <input
                id="bgColor"
                type="color"
                value={
                  props.backgroundColor ||
                  (props.theme === "dark" ? "#0A0A0A" : "#FFFFFF")
                }
                onChange={(e) =>
                  onPropsChange({ backgroundColor: e.target.value })
                }
                className="w-10 h-10 rounded border border-unfocused-border-color cursor-pointer"
              />
              <input
                type="text"
                value={props.backgroundColor || ""}
                onChange={(e) =>
                  onPropsChange({
                    backgroundColor: e.target.value || undefined,
                  })
                }
                placeholder="Theme default"
                className="flex-1 px-2 py-1.5 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground focus:outline-none focus:border-focused-border-color"
              />
            </div>
            <div className="flex items-center gap-3">
              <label
                htmlFor="primaryColor"
                className="text-sm text-foreground w-24 shrink-0"
              >
                Primary
              </label>
              <input
                id="primaryColor"
                type="color"
                value={
                  props.primaryColor ||
                  (props.theme === "dark" ? "#FFFFFF" : "#000000")
                }
                onChange={(e) =>
                  onPropsChange({ primaryColor: e.target.value })
                }
                className="w-10 h-10 rounded border border-unfocused-border-color cursor-pointer"
              />
              <input
                type="text"
                value={props.primaryColor || ""}
                onChange={(e) =>
                  onPropsChange({ primaryColor: e.target.value || undefined })
                }
                placeholder="Theme default"
                className="flex-1 px-2 py-1.5 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground focus:outline-none focus:border-focused-border-color"
              />
            </div>
            <div className="flex items-center gap-3">
              <label
                htmlFor="accentColor"
                className="text-sm text-foreground w-24 shrink-0"
              >
                Accent
              </label>
              <input
                id="accentColor"
                type="color"
                value={
                  props.accentColor ||
                  (props.theme === "dark" ? "#AAAAAA" : "#555555")
                }
                onChange={(e) => onPropsChange({ accentColor: e.target.value })}
                className="w-10 h-10 rounded border border-unfocused-border-color cursor-pointer"
              />
              <input
                type="text"
                value={props.accentColor || ""}
                onChange={(e) =>
                  onPropsChange({ accentColor: e.target.value || undefined })
                }
                placeholder="Theme default"
                className="flex-1 px-2 py-1.5 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground focus:outline-none focus:border-focused-border-color"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Leave empty to use theme defaults
          </p>
        </section>

        {/* Typography Section */}
        <section>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Typography
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Title Size
              </label>
              <div className="flex gap-2">
                {(["small", "medium", "large"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => onPropsChange({ titleFontSize: size })}
                    className={`flex-1 px-3 py-2 text-sm border rounded-geist capitalize transition-colors ${
                      props.titleFontSize === size
                        ? "border-foreground bg-foreground text-background"
                        : "border-unfocused-border-color hover:border-focused-border-color"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Text Alignment
              </label>
              <div className="flex gap-2">
                {(["left", "center"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => onPropsChange({ textAlign: align })}
                    className={`flex-1 px-3 py-2 text-sm border rounded-geist capitalize transition-colors ${
                      props.textAlign === align
                        ? "border-foreground bg-foreground text-background"
                        : "border-unfocused-border-color hover:border-focused-border-color"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Animation Section */}
        <section>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Animation
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Animation Speed
              </label>
              <div className="flex gap-2">
                {(["slow", "normal", "fast"] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => onPropsChange({ animationSpeed: speed })}
                    className={`flex-1 px-3 py-2 text-sm border rounded-geist capitalize transition-colors ${
                      props.animationSpeed === speed
                        ? "border-foreground bg-foreground text-background"
                        : "border-unfocused-border-color hover:border-focused-border-color"
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Show Logo Animation
              </label>
              <button
                onClick={() => onPropsChange({ showLogo: !props.showLogo })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  props.showLogo ? "bg-geist-success" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    props.showLogo ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
