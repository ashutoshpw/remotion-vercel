"use client";

import { Player } from "@remotion/player";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  CompositionProps,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import {
  ProjectDetails,
  ProjectSummary,
  ProjectVideoRecord,
  TeamSummary,
} from "../../types/schema";
import { authClient } from "../lib/auth-client";
import { Main } from "../remotion/MyComp/Main";
import { AuthCard } from "./AuthCard";
import { Button } from "./Button";
import { InputContainer } from "./Container";
import { RenderControls } from "./RenderControls";

const inputClassName =
  "leading-[1.7] block w-full rounded-geist bg-background p-geist-half text-foreground text-sm border border-unfocused-border-color transition-colors duration-150 ease-in-out focus:border-focused-border-color outline-none";

const fetchJson = async <T,>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const fallback = "Request failed";
    try {
      const data = (await response.json()) as { message?: string };
      throw new Error(data.message ?? fallback);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(fallback);
    }
  }

  return (await response.json()) as T;
};

const formatBytes = (size: number | null) => {
  if (!size) {
    return null;
  }

  return Intl.NumberFormat("en", {
    notation: "compact",
    style: "unit",
    unit: "byte",
    unitDisplay: "narrow",
  }).format(size);
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const VideoRow: React.FC<{ video: ProjectVideoRecord }> = ({ video }) => {
  return (
    <div className="rounded-geist border border-unfocused-border-color p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-medium text-foreground">{video.title}</div>
          <div className="text-xs text-subtitle">
            {video.asset ? `Uses ${video.asset.name}` : "No saved asset selected"}
          </div>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-subtitle">
          {video.status}
        </span>
      </div>
      <div className="text-xs text-subtitle">{formatDate(video.createdAt)}</div>
      {video.errorMessage ? (
        <div className="text-sm text-geist-error">{video.errorMessage}</div>
      ) : null}
      {video.renderUrl ? (
        <a className="text-sm underline underline-offset-4 text-foreground" href={video.renderUrl}>
          Open render{video.size ? ` • ${formatBytes(video.size)}` : ""}
        </a>
      ) : null}
    </div>
  );
};

export const WorkspaceDashboard: React.FC = () => {
  const sessionState = authClient.useSession();
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [title, setTitle] = useState(defaultMyCompProps.title);
  const [teamName, setTeamName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [assetName, setAssetName] = useState("");
  const [assetUrl, setAssetUrl] = useState("");
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTeams = useCallback(async () => {
    const data = await fetchJson<{ teams: TeamSummary[] }>("/api/teams");
    setTeams(data.teams);
    setSelectedTeamId((current) => {
      if (current && data.teams.some((team) => team.id === current)) {
        return current;
      }
      return data.teams[0]?.id ?? null;
    });
    return data.teams;
  }, []);

  const loadProjects = useCallback(async (teamId: string) => {
    const data = await fetchJson<{ projects: ProjectSummary[] }>(
      `/api/projects?teamId=${teamId}`,
      { cache: "no-store" },
    );
    setProjects(data.projects);
    setSelectedProjectId((current) => {
      if (current && data.projects.some((project) => project.id === current)) {
        return current;
      }
      return data.projects[0]?.id ?? null;
    });
    return data.projects;
  }, []);

  const loadProjectDetails = useCallback(async (projectId: string) => {
    const data = await fetchJson<{ project: ProjectDetails }>(`/api/projects/${projectId}`, {
      cache: "no-store",
    });
    setProjectDetails(data.project);
    return data.project;
  }, []);

  useEffect(() => {
    if (!sessionState.data) {
      setTeams([]);
      setProjects([]);
      setProjectDetails(null);
      setSelectedTeamId(null);
      setSelectedProjectId(null);
      setSelectedAssetId(null);
      setErrorMessage(null);
      return;
    }

    loadTeams().catch((error: Error) => {
      setErrorMessage(error.message);
    });
  }, [loadTeams, sessionState.data]);

  useEffect(() => {
    if (!selectedTeamId) {
      setProjects([]);
      setSelectedProjectId(null);
      return;
    }

    loadProjects(selectedTeamId).catch((error: Error) => {
      setErrorMessage(error.message);
    });
  }, [loadProjects, selectedTeamId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectDetails(null);
      setSelectedAssetId(null);
      return;
    }

    loadProjectDetails(selectedProjectId).catch((error: Error) => {
      setErrorMessage(error.message);
    });
  }, [loadProjectDetails, selectedProjectId]);

  useEffect(() => {
    if (!projectDetails) {
      setTitle(defaultMyCompProps.title);
      return;
    }

    setTitle(projectDetails.name);
    setSelectedAssetId((current) => {
      if (current && projectDetails.assets.some((asset) => asset.id === current)) {
        return current;
      }
      return projectDetails.assets[0]?.id ?? null;
    });
  }, [projectDetails]);

  const selectedAsset = useMemo(() => {
    if (!projectDetails || !selectedAssetId) {
      return null;
    }

    return projectDetails.assets.find((asset) => asset.id === selectedAssetId) ?? null;
  }, [projectDetails, selectedAssetId]);

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      title,
      projectName: projectDetails?.name ?? defaultMyCompProps.projectName,
      assetName: selectedAsset?.name,
      assetUrl: selectedAsset?.url,
    };
  }, [projectDetails?.name, selectedAsset?.name, selectedAsset?.url, title]);

  const createTeam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingTeam(true);
    setErrorMessage(null);

    try {
      const data = await fetchJson<{ team: TeamSummary }>("/api/teams", {
        method: "POST",
        body: JSON.stringify({ name: teamName }),
      });
      setTeamName("");
      await loadTeams();
      setSelectedTeamId(data.team.id);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSavingTeam(false);
    }
  };

  const createProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTeamId) {
      setErrorMessage("Create a team first.");
      return;
    }

    setIsSavingProject(true);
    setErrorMessage(null);

    try {
      const data = await fetchJson<{ project: ProjectSummary }>("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          teamId: selectedTeamId,
          name: projectName,
          description: projectDescription,
        }),
      });
      setProjectName("");
      setProjectDescription("");
      await loadProjects(selectedTeamId);
      setSelectedProjectId(data.project.id);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSavingProject(false);
    }
  };

  const createAsset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId) {
      setErrorMessage("Select a project first.");
      return;
    }

    setIsSavingAsset(true);
    setErrorMessage(null);

    try {
      const data = await fetchJson<{ asset: { id: string } }>(
        `/api/projects/${selectedProjectId}/assets`,
        {
          method: "POST",
          body: JSON.stringify({ name: assetName, url: assetUrl }),
        },
      );
      setAssetName("");
      setAssetUrl("");
      await loadProjectDetails(selectedProjectId);
      setSelectedAssetId(data.asset.id);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSavingAsset(false);
    }
  };

  if (sessionState.isPending) {
    return <div className="max-w-screen-md m-auto mt-16 px-4 text-subtitle">Loading…</div>;
  }

  if (!sessionState.data) {
    return <AuthCard />;
  }

  return (
    <div className="max-w-screen-2xl m-auto px-4 py-10 flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-subtitle">
            Remotion + Vercel
          </div>
          <h1 className="text-3xl font-semibold text-foreground">
            Teams, projects, and reusable video assets
          </h1>
          <p className="text-sm text-subtitle mt-2">
            Signed in as {sessionState.data.user.email}
          </p>
        </div>
        <Button
          secondary
          onClick={() => {
            void authClient.signOut();
          }}
        >
          Sign out
        </Button>
      </div>

      {errorMessage ? (
        <div className="rounded-geist border border-geist-error/30 bg-geist-error/5 px-4 py-3 text-sm text-geist-error">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <InputContainer>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-foreground">Teams</h2>
              <span className="text-xs text-subtitle">{teams.length} total</span>
            </div>
            <form className="mt-4 flex flex-col gap-3" onSubmit={createTeam}>
              <input
                className={inputClassName}
                value={teamName}
                onChange={(event) => setTeamName(event.currentTarget.value)}
                placeholder="Acme Studio"
                minLength={2}
                required
              />
              <div className="flex justify-end">
                <Button disabled={isSavingTeam} loading={isSavingTeam}>
                  Create team
                </Button>
              </div>
            </form>
            <div className="mt-4 flex flex-col gap-2">
              {teams.length === 0 ? (
                <div className="text-sm text-subtitle">
                  Your first team becomes the home for every project and render.
                </div>
              ) : null}
              {teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className={`rounded-geist border p-3 text-left transition-colors ${
                    selectedTeamId === team.id
                      ? "border-focused-border-color bg-foreground text-background"
                      : "border-unfocused-border-color"
                  }`}
                  onClick={() => setSelectedTeamId(team.id)}
                >
                  <div className="font-medium">{team.name}</div>
                  <div className="text-xs opacity-70">/{team.slug}</div>
                  <div className="text-xs opacity-70 mt-2">
                    {team._count.projects} project{team._count.projects === 1 ? "" : "s"}
                  </div>
                </button>
              ))}
            </div>
          </InputContainer>

          <InputContainer>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-foreground">Projects</h2>
              <span className="text-xs text-subtitle">{projects.length} total</span>
            </div>
            <form className="mt-4 flex flex-col gap-3" onSubmit={createProject}>
              <input
                className={inputClassName}
                value={projectName}
                onChange={(event) => setProjectName(event.currentTarget.value)}
                placeholder="Spring launch video"
                minLength={2}
                required
              />
              <textarea
                className={inputClassName}
                value={projectDescription}
                onChange={(event) => setProjectDescription(event.currentTarget.value)}
                placeholder="Optional notes for your team"
                rows={3}
              />
              <div className="flex justify-end">
                <Button disabled={isSavingProject || !selectedTeamId} loading={isSavingProject}>
                  Create project
                </Button>
              </div>
            </form>
            <div className="mt-4 flex flex-col gap-2">
              {projects.length === 0 ? (
                <div className="text-sm text-subtitle">
                  Create a project inside the selected team to start collecting renders and assets.
                </div>
              ) : null}
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`rounded-geist border p-3 text-left transition-colors ${
                    selectedProjectId === project.id
                      ? "border-focused-border-color bg-foreground text-background"
                      : "border-unfocused-border-color"
                  }`}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <div className="font-medium">{project.name}</div>
                  {project.description ? (
                    <div className="text-xs opacity-70 mt-1">{project.description}</div>
                  ) : null}
                  <div className="text-xs opacity-70 mt-2">
                    {project._count.assets} assets • {project._count.videos} videos
                  </div>
                </button>
              ))}
            </div>
          </InputContainer>
        </div>

        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-geist shadow-[0_0_200px_rgba(0,0,0,0.15)]">
            <Player
              acknowledgeRemotionLicense
              component={Main}
              inputProps={inputProps}
              durationInFrames={DURATION_IN_FRAMES}
              fps={VIDEO_FPS}
              compositionHeight={VIDEO_HEIGHT}
              compositionWidth={VIDEO_WIDTH}
              style={{ width: "100%" }}
              controls
              autoPlay
              loop
            />
          </div>

          <RenderControls
            text={title}
            setText={setTitle}
            inputProps={inputProps}
            projectId={selectedProjectId}
            assetId={selectedAssetId}
            projectName={projectDetails?.name ?? null}
            onRendered={
              selectedProjectId
                ? async () => {
                    await loadProjectDetails(selectedProjectId);
                  }
                : undefined
            }
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <InputContainer>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-foreground">Saved assets</h2>
                <span className="text-xs text-subtitle">
                  {projectDetails?.assets.length ?? 0} reusable
                </span>
              </div>
              <form className="mt-4 flex flex-col gap-3" onSubmit={createAsset}>
                <input
                  className={inputClassName}
                  value={assetName}
                  onChange={(event) => setAssetName(event.currentTarget.value)}
                  placeholder="Product logo"
                  minLength={2}
                  required
                />
                <input
                  className={inputClassName}
                  type="url"
                  value={assetUrl}
                  onChange={(event) => setAssetUrl(event.currentTarget.value)}
                  placeholder="https://example.com/logo.png"
                  required
                />
                <div className="flex justify-end">
                  <Button disabled={isSavingAsset || !selectedProjectId} loading={isSavingAsset}>
                    Save asset
                  </Button>
                </div>
              </form>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  className={`rounded-geist border p-3 text-left transition-colors ${
                    selectedAssetId === null
                      ? "border-focused-border-color bg-foreground text-background"
                      : "border-unfocused-border-color"
                  }`}
                  onClick={() => setSelectedAssetId(null)}
                >
                  Don’t use a saved asset
                </button>
                {projectDetails?.assets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    className={`rounded-geist border p-3 text-left transition-colors ${
                      selectedAssetId === asset.id
                        ? "border-focused-border-color bg-foreground text-background"
                        : "border-unfocused-border-color"
                    }`}
                    onClick={() => setSelectedAssetId(asset.id)}
                  >
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-xs opacity-70 break-all mt-1">{asset.url}</div>
                    <div className="text-xs opacity-70 mt-2">Saved {formatDate(asset.createdAt)}</div>
                  </button>
                ))}
              </div>
            </InputContainer>

            <InputContainer>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-foreground">Project videos</h2>
                <span className="text-xs text-subtitle">
                  {projectDetails?.videos.length ?? 0} renders
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {projectDetails?.videos.length ? (
                  projectDetails.videos.map((video) => (
                    <VideoRow key={video.id} video={video} />
                  ))
                ) : (
                  <div className="text-sm text-subtitle">
                    Rendered videos are automatically attached to the active project.
                  </div>
                )}
              </div>
            </InputContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
