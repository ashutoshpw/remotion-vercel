"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { CompositionPropsType } from "@/types/constants";

interface VideoChatProps {
  videoId: string;
  currentProps: CompositionPropsType;
  onPropsChange: (props: Partial<CompositionPropsType>) => void;
  onAssetSelect?: (assetId: string) => void;
  isAiConfigured: boolean;
}

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
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

const LoadingDots: React.FC = () => (
  <span className="inline-flex items-center gap-1">
    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
  </span>
);

// Tool result display component
const ToolCallBadge: React.FC<{
  toolName: string;
  state: string;
}> = ({ toolName, state }) => {
  const toolLabels: Record<string, string> = {
    "tool-updateTitle": "Updated title",
    "tool-updateProjectName": "Updated project name",
    "tool-setTheme": "Changed theme",
    "tool-setColors": "Set colors",
    "tool-setTypography": "Changed typography",
    "tool-toggleLogo": "Toggled logo",
    "tool-setAnimationSpeed": "Set animation speed",
    "tool-selectAsset": "Selected asset",
    "tool-listAssets": "Listed assets",
    "tool-getCurrentProps": "Got current props",
  };

  const isPending = state === "input-streaming" || state === "input-available";
  const isSuccess = state === "output-available";
  const isError = state === "output-error";

  const statusStyles = isPending
    ? "bg-geist-warning/10 text-geist-warning border-geist-warning/20"
    : isSuccess
      ? "bg-geist-success/10 text-geist-success border-geist-success/20"
      : isError
        ? "bg-geist-error/10 text-geist-error border-geist-error/20"
        : "bg-muted text-muted-foreground border-unfocused-border-color";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full border ${statusStyles}`}
    >
      {isPending && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {isSuccess && (
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
      )}
      {isError && (
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
      )}
      {toolLabels[toolName] || toolName.replace("tool-", "")}
    </span>
  );
};

export const VideoChat: React.FC<VideoChatProps> = ({
  videoId,
  currentProps,
  onPropsChange,
  onAssetSelect,
  isAiConfigured,
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const propsRef = useRef({ onPropsChange, onAssetSelect });
  propsRef.current = { onPropsChange, onAssetSelect };

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat/video",
      body: { videoId },
    }),
    onToolCall: async ({ toolCall }) => {
      const { onPropsChange, onAssetSelect } = propsRef.current;
      const toolName = toolCall.toolName;
      const args = toolCall.input as Record<string, unknown>;

      switch (toolName) {
        case "updateTitle":
          onPropsChange({ title: args.title as string });
          break;
        case "updateProjectName":
          onPropsChange({ projectName: args.projectName as string });
          break;
        case "setTheme":
          onPropsChange({ theme: args.theme as "light" | "dark" });
          break;
        case "setColors": {
          const updates: Partial<CompositionPropsType> = {};
          if (args.backgroundColor)
            updates.backgroundColor = args.backgroundColor as string;
          if (args.primaryColor)
            updates.primaryColor = args.primaryColor as string;
          if (args.accentColor)
            updates.accentColor = args.accentColor as string;
          onPropsChange(updates);
          break;
        }
        case "setTypography": {
          const updates: Partial<CompositionPropsType> = {};
          if (args.titleFontSize)
            updates.titleFontSize = args.titleFontSize as
              | "small"
              | "medium"
              | "large";
          if (args.textAlign)
            updates.textAlign = args.textAlign as "left" | "center";
          onPropsChange(updates);
          break;
        }
        case "toggleLogo":
          onPropsChange({ showLogo: args.showLogo as boolean });
          break;
        case "setAnimationSpeed":
          onPropsChange({
            animationSpeed: args.animationSpeed as "slow" | "normal" | "fast",
          });
          break;
        case "selectAsset":
          if (onAssetSelect) {
            onAssetSelect(args.assetId as string);
          }
          break;
      }
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage({
      parts: [{ type: "text", text: input }],
    });
    setInput("");
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isAiConfigured) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <SparklesIcon className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          AI Not Configured
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Configure your AI provider in Team Settings to enable chat-based video
          editing.
        </p>
        <a
          href="../settings/ai"
          className="text-sm text-foreground underline hover:no-underline"
        >
          Go to AI Settings
        </a>
      </div>
    );
  }

  const isStreaming = status === "streaming";

  return (
    <div className="h-full flex flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <SparklesIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Ask me to edit your video. Try:
            </p>
            <div className="space-y-2">
              {[
                "Change the title to 'Welcome'",
                "Switch to dark theme",
                "Make the text larger and centered",
                "Hide the logo animation",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="block w-full text-left px-3 py-2 text-sm border border-unfocused-border-color rounded-geist hover:border-focused-border-color hover:bg-muted/50 transition-colors"
                >
                  &quot;{suggestion}&quot;
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-geist px-3 py-2 ${
                message.role === "user"
                  ? "bg-foreground text-background"
                  : "bg-muted border border-unfocused-border-color"
              }`}
            >
              {/* Render message parts */}
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <p key={index} className="text-sm whitespace-pre-wrap">
                      {part.text}
                    </p>
                  );
                }

                // Tool parts have type like "tool-updateTitle"
                if (part.type.startsWith("tool-") && "state" in part) {
                  return (
                    <div key={index} className="mt-2 first:mt-0">
                      <ToolCallBadge
                        toolName={part.type}
                        state={part.state as string}
                      />
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-muted border border-unfocused-border-color rounded-geist px-3 py-2">
              <LoadingDots />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-geist-error/10 border border-geist-error/20 rounded-geist">
            <p className="text-sm text-geist-error">{error.message}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-unfocused-border-color p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask to edit the video..."
            rows={1}
            className="flex-1 px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground resize-none focus:outline-none focus:border-focused-border-color placeholder:text-muted-foreground"
            style={{ minHeight: "40px", maxHeight: "120px" }}
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-3 py-2 bg-foreground text-background rounded-geist hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
