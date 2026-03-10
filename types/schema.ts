import { z } from "zod";
import { CompositionProps } from "./constants";

export const TeamRequest = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().min(2).max(48).optional(),
});

export const ProjectRequest = z.object({
  teamId: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(200).optional(),
});

export const AssetRequest = z.object({
  name: z.string().trim().min(2).max(80),
  url: z.string().url(),
});

export const RenderRequest = z.object({
  id: z.string(),
  projectId: z.string().min(1),
  assetId: z.string().optional(),
  inputProps: CompositionProps,
});

export const TeamMemberInviteRequest = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]).default("member"),
});

export const TeamMemberUpdateRequest = z.object({
  role: z.enum(["admin", "member"]),
});

export type RenderResponse =
  | {
      type: "error";
      message: string;
    }
  | {
      type: "done";
      url: string;
      size: number;
      videoId: string;
    };

export type SSEMessage =
  | { type: "phase"; phase: string; progress: number; subtitle?: string }
  | { type: "done"; url: string; size: number; videoId: string }
  | { type: "error"; message: string };

export type TeamSummary = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    projects: number;
  };
};

export type ProjectSummary = {
  id: string;
  teamId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    assets: number;
    videos: number;
  };
};

export type ProjectAssetRecord = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
};

export type ProjectVideoRecord = {
  id: string;
  title: string;
  status: "rendering" | "ready" | "failed";
  renderUrl: string | null;
  size: number | null;
  errorMessage: string | null;
  createdAt: string;
  asset: {
    id: string;
    name: string;
  } | null;
};

export type ProjectDetails = {
  id: string;
  teamId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  team: {
    id: string;
    name: string;
    slug: string;
  };
  assets: ProjectAssetRecord[];
  videos: ProjectVideoRecord[];
};

export type TeamMemberRole = "owner" | "admin" | "member";

export type TeamMemberRecord = {
  id: string;
  userId: string;
  role: TeamMemberRole;
  joinedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export type VideoDetails = {
  id: string;
  projectId: string;
  title: string;
  status: "rendering" | "ready" | "failed";
  renderUrl: string | null;
  size: number | null;
  inputProps: Record<string, unknown>;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    slug: string;
    team: {
      id: string;
      name: string;
      slug: string;
    };
  };
  asset: {
    id: string;
    name: string;
    url: string;
  } | null;
};

export type AssetWithUsage = ProjectAssetRecord & {
  _count: {
    videos: number;
  };
};
