"use client";

import { z } from "zod";
import { COMP_NAME, CompositionProps } from "@/types/constants";
import { useRendering } from "../helpers/use-rendering";
import { Button } from "./Button";
import { ProgressBar } from "./ProgressBar";

const Input: React.FC<{
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}> = ({ text, setText, disabled }) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor="video-title"
        className="block text-sm font-medium text-foreground"
      >
        Video Title
      </label>
      <input
        id="video-title"
        type="text"
        autoComplete="off"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder="Enter title for your video..."
        className="w-full px-3 py-2 text-sm rounded-geist border border-unfocused-border-color bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-focused-border-color transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export const RenderControls: React.FC<{
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  inputProps: z.infer<typeof CompositionProps>;
  projectId: string | null;
  assetId: string | null;
  projectName: string | null;
  onRendered?: (videoId: string) => Promise<void> | void;
}> = ({
  text,
  setText,
  inputProps,
  projectId,
  assetId,
  projectName,
  onRendered,
}) => {
  const { renderMedia, state, undo, cancel } = useRendering(
    COMP_NAME,
    projectId,
    assetId,
    inputProps,
    onRendered,
  );

  const disabled = state.status === "invoking" || !projectId;
  const isRendering = state.status === "invoking";
  const isDone = state.status === "done";
  const hasError = state.status === "error";
  const isCancelled = state.status === "cancelled";

  return (
    <div className="border border-unfocused-border-color rounded-geist bg-background overflow-hidden">
      {/* Input Section */}
      {!isDone && (
        <div className="p-4 space-y-4">
          <Input disabled={disabled} setText={setText} text={text} />

          <p className="text-sm text-muted-foreground">
            {projectName
              ? `Video will be saved to "${projectName}"`
              : "Create a project to start rendering."}
          </p>

          <div className="flex justify-end">
            <Button
              disabled={disabled}
              loading={isRendering}
              onClick={renderMedia}
            >
              {projectId ? "Render Video" : "Create a project first"}
            </Button>
          </div>
        </div>
      )}

      {/* Progress Section */}
      {isRendering && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                {state.phase}
              </p>
              {state.subtitle && (
                <p className="text-xs text-muted-foreground">
                  {state.subtitle}
                </p>
              )}
            </div>
            <span className="text-sm font-medium text-foreground tabular-nums">
              {Math.round(state.progress * 100)}%
            </span>
          </div>
          <ProgressBar progress={state.progress} />
          <div className="flex justify-end">
            <Button secondary onClick={cancel}>
              <svg
                className="w-4 h-4 mr-2"
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
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Cancelled State */}
      {isCancelled && (
        <div className="mx-4 mb-4 p-3 rounded-geist bg-muted border border-unfocused-border-color">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-muted-foreground shrink-0"
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
              <p className="text-sm text-muted-foreground">Render cancelled</p>
            </div>
            <Button secondary onClick={undo}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="mx-4 mb-4 p-3 rounded-geist bg-geist-error/10 border border-geist-error/20">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-geist-error shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-geist-error">{state.error.message}</p>
          </div>
        </div>
      )}

      {/* Done State */}
      {isDone && (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-geist-success">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">Render complete!</span>
          </div>

          <ProgressBar progress={1} />

          <div className="flex items-center justify-end gap-2">
            <Button secondary onClick={undo}>
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H3"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 6l-4 4 4 4"
                />
              </svg>
            </Button>
            <a href={state.url} download>
              <Button>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
                <span className="ml-2 text-xs opacity-70">
                  {formatBytes(state.size)}
                </span>
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
