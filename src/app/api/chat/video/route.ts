import { streamText, tool, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createXai } from "@ai-sdk/xai";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { getServerSession } from "@/lib/server-session";
import { getDb } from "@/lib/db";
import {
  video,
  project,
  team,
  teamMember,
  teamAiSettings,
  projectAsset,
  chatMessage,
} from "@/db/schema";
import { decrypt } from "@/lib/encryption";
import type { CompositionPropsType } from "@/types/constants";

export const maxDuration = 60;

// Get model provider based on settings
function getModel(provider: string, model: string, apiKey: string) {
  switch (provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(model);
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(model);
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(model);
    }
    case "mistral": {
      const mistral = createMistral({ apiKey });
      return mistral(model);
    }
    case "xai": {
      const xai = createXai({ apiKey });
      return xai(model);
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// Tool definitions for video editing
const videoEditingTools = {
  updateTitle: tool({
    description: "Update the video title text that appears in the video",
    inputSchema: z.object({
      title: z.string().min(1).max(80).describe("The new title text"),
    }),
  }),

  updateProjectName: tool({
    description: "Update the project name subtitle that appears in the video",
    inputSchema: z.object({
      projectName: z.string().min(1).max(80).describe("The new project name"),
    }),
  }),

  setTheme: tool({
    description: "Set the video theme to light or dark mode",
    inputSchema: z.object({
      theme: z.enum(["light", "dark"]).describe("The theme to apply"),
    }),
  }),

  setColors: tool({
    description:
      "Set custom colors for the video. Leave undefined to use theme defaults.",
    inputSchema: z.object({
      backgroundColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional()
        .describe("Background color as hex (e.g., #FFFFFF)"),
      primaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional()
        .describe("Primary/title color as hex"),
      accentColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional()
        .describe("Accent/subtitle color as hex"),
    }),
  }),

  setTypography: tool({
    description: "Configure text styling for the video",
    inputSchema: z.object({
      titleFontSize: z
        .enum(["small", "medium", "large"])
        .optional()
        .describe("Font size for the title"),
      textAlign: z
        .enum(["left", "center"])
        .optional()
        .describe("Text alignment"),
    }),
  }),

  toggleLogo: tool({
    description: "Show or hide the animated logo at the start of the video",
    inputSchema: z.object({
      showLogo: z.boolean().describe("Whether to show the logo animation"),
    }),
  }),

  setAnimationSpeed: tool({
    description: "Set the animation speed for transitions",
    inputSchema: z.object({
      animationSpeed: z
        .enum(["slow", "normal", "fast"])
        .describe("Animation speed"),
    }),
  }),

  selectAsset: tool({
    description:
      "Select an asset (image) to display in the video. Use listAssets first to see available options.",
    inputSchema: z.object({
      assetId: z.string().describe("The ID of the asset to use"),
    }),
  }),

  listAssets: tool({
    description:
      "List all available assets for this project that can be used in the video",
    inputSchema: z.object({}),
  }),

  getCurrentProps: tool({
    description: "Get the current video composition properties",
    inputSchema: z.object({}),
  }),
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, videoId } = await req.json();

    if (!videoId) {
      return new Response("Video ID is required", { status: 400 });
    }

    const db = getDb();

    // Fetch video with project and team info
    const [videoData] = await db
      .select({
        id: video.id,
        title: video.title,
        inputProps: video.inputProps,
        assetId: video.assetId,
        projectId: video.projectId,
        projectName: project.name,
        teamId: project.teamId,
      })
      .from(video)
      .innerJoin(project, eq(video.projectId, project.id))
      .where(eq(video.id, videoId))
      .limit(1);

    if (!videoData) {
      return new Response("Video not found", { status: 404 });
    }

    // Verify user has access to the team
    const [teamData] = await db
      .select()
      .from(team)
      .where(eq(team.id, videoData.teamId))
      .limit(1);

    const isOwner = teamData?.ownerId === session.user.id;

    const [membership] = await db
      .select()
      .from(teamMember)
      .where(
        and(
          eq(teamMember.teamId, videoData.teamId),
          eq(teamMember.userId, session.user.id),
        ),
      )
      .limit(1);

    if (!isOwner && !membership) {
      return new Response("Not authorized", { status: 403 });
    }

    // Get AI settings
    const [aiSettings] = await db
      .select()
      .from(teamAiSettings)
      .where(eq(teamAiSettings.teamId, videoData.teamId))
      .limit(1);

    if (!aiSettings) {
      return new Response(
        "AI is not configured for this team. Please configure it in Team Settings > AI.",
        { status: 400 },
      );
    }

    // Decrypt the API key
    const apiKey = decrypt(aiSettings.apiKey);

    // Fetch project assets for listAssets tool
    const assets = await db
      .select({
        id: projectAsset.id,
        name: projectAsset.name,
        url: projectAsset.url,
        type: projectAsset.type,
      })
      .from(projectAsset)
      .where(eq(projectAsset.projectId, videoData.projectId));

    // Current video props
    const currentProps = videoData.inputProps as CompositionPropsType;

    // Create the model
    const model = getModel(aiSettings.provider, aiSettings.model, apiKey);

    // System prompt
    const systemPrompt = `You are an AI assistant helping to edit video compositions. You have access to tools that modify the video properties in real-time. The user will see a live preview of their changes.

Current video properties:
- Title: "${currentProps.title}"
- Project Name: "${currentProps.projectName}"
- Theme: ${currentProps.theme || "light"}
- Background Color: ${currentProps.backgroundColor || "theme default"}
- Primary Color: ${currentProps.primaryColor || "theme default"}
- Accent Color: ${currentProps.accentColor || "theme default"}
- Title Font Size: ${currentProps.titleFontSize || "medium"}
- Text Align: ${currentProps.textAlign || "left"}
- Show Logo: ${currentProps.showLogo !== false}
- Animation Speed: ${currentProps.animationSpeed || "normal"}
- Current Asset: ${videoData.assetId ? "Yes" : "None selected"}

Available assets: ${assets.length > 0 ? assets.map((a) => `${a.name} (ID: ${a.id})`).join(", ") : "None"}

When the user asks to make changes, use the appropriate tools. You can call multiple tools in sequence for complex requests. Always confirm what changes you've made.`;

    // Save user message to database
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === "user") {
      await db.insert(chatMessage).values({
        videoId,
        role: "user",
        content: lastUserMessage.content,
      });
    }

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      tools: videoEditingTools,
      stopWhen: stepCountIs(5), // Allow multiple tool calls
      onFinish: async ({ text, toolCalls, toolResults }) => {
        // Save assistant response to database
        await db.insert(chatMessage).values({
          videoId,
          role: "assistant",
          content: text || "",
          toolCalls: toolCalls?.length ? toolCalls : null,
          toolResults: toolResults?.length ? toolResults : null,
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Failed to process chat request", { status: 500 });
  }
}

// GET: Fetch chat history for a video
export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return new Response("Video ID is required", { status: 400 });
    }

    const db = getDb();

    // Verify access (simplified check)
    const [videoData] = await db
      .select({ teamId: project.teamId })
      .from(video)
      .innerJoin(project, eq(video.projectId, project.id))
      .where(eq(video.id, videoId))
      .limit(1);

    if (!videoData) {
      return new Response("Video not found", { status: 404 });
    }

    // Get recent messages (last 100)
    const messages = await db
      .select({
        id: chatMessage.id,
        role: chatMessage.role,
        content: chatMessage.content,
        toolCalls: chatMessage.toolCalls,
        createdAt: chatMessage.createdAt,
      })
      .from(chatMessage)
      .where(eq(chatMessage.videoId, videoId))
      .orderBy(desc(chatMessage.createdAt))
      .limit(100);

    // Reverse to get chronological order
    return Response.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return new Response("Failed to fetch chat history", { status: 500 });
  }
}
