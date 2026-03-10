import { useCallback, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { CompositionProps } from "../../types/constants";
import { SSEMessage } from "../../types/schema";

export type State =
  | {
      status: "init";
    }
  | {
      status: "invoking";
      phase: string;
      progress: number;
      subtitle: string | null;
    }
  | {
      status: "cancelled";
    }
  | {
      status: "error";
      error: Error;
    }
  | {
      url: string;
      size: number;
      videoId: string;
      status: "done";
    };

export const useRendering = (
  id: string,
  projectId: string | null,
  assetId: string | null,
  inputProps: z.infer<typeof CompositionProps>,
  onRendered?: (videoId: string) => Promise<void> | void,
) => {
  const [state, setState] = useState<State>({
    status: "init",
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const renderMedia = useCallback(async () => {
    if (!projectId) {
      setState({
        status: "error",
        error: new Error("Create or select a project before rendering."),
      });
      return;
    }

    // Create new abort controller for this render
    abortControllerRef.current = new AbortController();

    setState({
      status: "invoking",
      phase: "Starting...",
      progress: 0,
      subtitle: null,
    });

    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id,
          projectId,
          assetId: assetId ?? undefined,
          inputProps,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        let message = "Failed to start render";
        try {
          const data = (await response.json()) as { message?: string };
          if (data.message) {
            message = data.message;
          }
        } catch {
          // Ignore JSON parsing errors and keep the fallback message.
        }
        throw new Error(message);
      }

      if (!response.body) {
        throw new Error("Render stream was not available.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const json = line.slice(6);
          const message = JSON.parse(json) as SSEMessage;

          switch (message.type) {
            case "phase":
              setState((prev) => {
                if (prev.status !== "invoking") return prev;
                return {
                  ...prev,
                  phase: message.phase,
                  progress: message.progress,
                  subtitle: message.subtitle ?? null,
                };
              });
              break;
            case "done":
              setState({
                status: "done",
                url: message.url,
                size: message.size,
                videoId: message.videoId,
              });
              await onRendered?.(message.videoId);
              break;
            case "error":
              setState({
                status: "error",
                error: new Error(message.message),
              });
              break;
            default:
              message satisfies never;
              break;
          }
        }
      }
    } catch (err) {
      // Handle abort separately
      if (err instanceof Error && err.name === "AbortError") {
        setState({ status: "cancelled" });
        return;
      }
      setState({
        status: "error",
        error: err as Error,
      });
    } finally {
      abortControllerRef.current = null;
    }
  }, [assetId, id, inputProps, onRendered, projectId]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const undo = useCallback(() => {
    setState({ status: "init" });
  }, []);

  return useMemo(() => {
    return {
      renderMedia,
      state,
      undo,
      cancel,
    };
  }, [renderMedia, state, undo, cancel]);
};
