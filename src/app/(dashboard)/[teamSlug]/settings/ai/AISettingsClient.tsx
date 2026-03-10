"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

const AI_PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      "o3",
      "o3-pro",
      "o3-mini",
      "o4-mini",
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "gpt-4o",
      "gpt-4o-mini",
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      "claude-opus-4-6",
      "claude-opus-4-5-20251101",
      "claude-sonnet-4-20250514",
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
    ],
  },
  {
    id: "google",
    name: "Google",
    models: [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite-preview",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
    ],
  },
  {
    id: "xai",
    name: "xAI",
    models: ["grok-4", "grok-3", "grok-3-mini"],
  },
  {
    id: "mistral",
    name: "Mistral",
    models: [
      "mistral-large-latest",
      "codestral-2501",
      "mistral-small-latest",
      "mistral-nemo",
    ],
  },
] as const;

type ProviderType = (typeof AI_PROVIDERS)[number]["id"];

interface TeamData {
  id: string;
  name: string;
  slug: string;
}

interface ExistingSettings {
  id: string;
  provider: ProviderType;
  model: string;
  isActive: boolean;
}

interface AISettingsClientProps {
  team: TeamData;
  existingSettings: ExistingSettings | null;
  isOwner: boolean;
}

const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
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

export const AISettingsClient: React.FC<AISettingsClientProps> = ({
  team,
  existingSettings,
  isOwner,
}) => {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderType>(
    existingSettings?.provider || "openai",
  );
  const [model, setModel] = useState(existingSettings?.model || "o3");
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get available models for selected provider
  const currentProvider = AI_PROVIDERS.find((p) => p.id === provider);
  const availableModels = currentProvider?.models || [];

  // Update model when provider changes
  useEffect(() => {
    if (!availableModels.includes(model as never)) {
      setModel(availableModels[0] || "");
    }
  }, [provider, availableModels, model]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/teams/${team.id}/ai-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          apiKey: apiKey || undefined, // Only send if provided
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to save AI settings");
      }

      setSuccess("AI settings saved successfully");
      setApiKey(""); // Clear API key field after save
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete AI settings? This will disable chat functionality.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${team.id}/ai-settings`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete AI settings");
      }

      setSuccess("AI settings deleted");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <Breadcrumbs
        items={[
          { label: team.name, href: `/${team.slug}` },
          { label: "Settings", href: `/${team.slug}/settings` },
          { label: "AI" },
        ]}
      />

      <div className="flex items-center gap-3 mt-6 mb-8">
        <SparklesIcon className="w-7 h-7 text-foreground" />
        <h1 className="text-2xl font-semibold text-foreground">AI Settings</h1>
      </div>

      <p className="text-muted-foreground mb-8 max-w-2xl">
        Configure AI to enable chat-based video editing. Your API key is
        encrypted and stored securely. Each team member will use this
        configuration when editing videos with chat.
      </p>

      {/* Status Card */}
      <div className="mb-8 p-4 border border-unfocused-border-color rounded-geist bg-muted/30">
        <div className="flex items-center gap-3">
          {existingSettings ? (
            <>
              <div className="w-2 h-2 rounded-full bg-geist-success" />
              <span className="text-sm text-foreground">
                AI is configured using{" "}
                <span className="font-medium">{currentProvider?.name}</span> (
                {existingSettings.model})
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                AI is not configured
              </span>
            </>
          )}
        </div>
      </div>

      {/* Settings Form */}
      <section className="mb-12">
        <h2 className="text-lg font-medium text-foreground mb-4">
          Configuration
        </h2>
        <div className="border border-unfocused-border-color rounded-geist p-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                AI Provider
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {AI_PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    className={`px-4 py-2.5 text-sm border rounded-geist transition-colors ${
                      provider === p.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-unfocused-border-color hover:border-focused-border-color"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Model
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full max-w-md px-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground focus:outline-none focus:border-focused-border-color"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Choose a model that supports tool calling for best results.
              </p>
            </div>

            {/* API Key */}
            <div>
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-foreground mb-2"
              >
                API Key
                {existingSettings && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-geist-success font-normal">
                    <CheckIcon className="w-3 h-3" />
                    Configured
                  </span>
                )}
              </label>
              <div className="relative max-w-md">
                <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    existingSettings
                      ? "Enter new key to update"
                      : "Enter your API key"
                  }
                  className="w-full pl-10 pr-3 py-2 text-sm border border-unfocused-border-color rounded-geist bg-background text-foreground focus:outline-none focus:border-focused-border-color placeholder:text-muted-foreground"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Get your API key from the{" "}
                <a
                  href={getProviderDocsUrl(provider)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline hover:no-underline"
                >
                  {currentProvider?.name} dashboard
                </a>
                . Your key is encrypted before storage.
              </p>
            </div>

            {error && <p className="text-sm text-geist-error">{error}</p>}
            {success && <p className="text-sm text-geist-success">{success}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving || (!apiKey && !existingSettings)}
                className="px-4 py-2 text-sm font-medium rounded-geist border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground disabled:bg-button-disabled-color disabled:text-disabled-text-color disabled:border-unfocused-border-color disabled:cursor-not-allowed transition-colors"
              >
                {isSaving
                  ? "Saving..."
                  : existingSettings
                    ? "Update Settings"
                    : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Danger Zone - Only for owner when settings exist */}
      {existingSettings && isOwner && (
        <section>
          <h2 className="text-lg font-medium text-destructive mb-4">
            Danger Zone
          </h2>
          <div className="border border-destructive/30 rounded-geist p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">
                  Delete AI Configuration
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This will remove the API key and disable chat-based video
                  editing for your team.
                </p>
              </div>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium rounded-geist bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity shrink-0 ml-4 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

function getProviderDocsUrl(provider: ProviderType): string {
  const urls: Record<ProviderType, string> = {
    openai: "https://platform.openai.com/api-keys",
    anthropic: "https://console.anthropic.com/settings/keys",
    google: "https://aistudio.google.com/app/apikey",
    xai: "https://console.x.ai/",
    mistral: "https://console.mistral.ai/api-keys/",
  };
  return urls[provider];
}
