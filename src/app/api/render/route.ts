import {
  addBundleToSandbox,
  createSandbox,
  renderMediaOnVercel,
  uploadToVercelBlob,
} from "@remotion/vercel";
import { waitUntil } from "@vercel/functions";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { project, projectAsset, team, video } from "@/db/schema";
import { getDb } from "@/lib/db";
import { getRequestSession } from "@/lib/session";
import { COMP_NAME } from "@/types/constants";
import { RenderRequest } from "@/types/schema";
import {
  bundleRemotionProject,
  formatSSE,
  type RenderProgress,
} from "./helpers";
import { restoreSnapshot } from "./restore-snapshot";

export async function POST(req: Request) {
  const session = await getRequestSession(req);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    return NextResponse.json(
      {
        message:
          "BLOB_READ_WRITE_TOKEN is not set. Create a public Vercel Blob store and add BLOB_READ_WRITE_TOKEN to your environment.",
      },
      { status: 503 },
    );
  }

  let body: ReturnType<typeof RenderRequest.parse>;

  try {
    const payload = await req.json();
    body = RenderRequest.parse(payload);
  } catch (error) {
    const message =
      error instanceof ZodError ? error.message : "Invalid render request";
    return NextResponse.json({ message }, { status: 400 });
  }

  const db = getDb();
  const [projectRecord] = await db
    .select({ id: project.id })
    .from(project)
    .innerJoin(team, eq(project.teamId, team.id))
    .where(
      and(eq(project.id, body.projectId), eq(team.ownerId, session.user.id)),
    )
    .limit(1);

  if (!projectRecord) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  if (body.assetId) {
    const [asset] = await db
      .select({ id: projectAsset.id })
      .from(projectAsset)
      .where(
        and(
          eq(projectAsset.id, body.assetId),
          eq(projectAsset.projectId, body.projectId),
        ),
      )
      .limit(1);

    if (!asset) {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 });
    }
  }

  const [createdVideo] = await db
    .insert(video)
    .values({
      projectId: body.projectId,
      assetId: body.assetId,
      title: body.inputProps.title,
      inputProps: body.inputProps,
    })
    .returning({ id: video.id });

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const send = async (message: RenderProgress) => {
    await writer.write(encoder.encode(formatSSE(message)));
  };

  const runRender = async () => {
    await send({ type: "phase", phase: "Creating sandbox...", progress: 0 });
    const sandbox = process.env.VERCEL
      ? await restoreSnapshot()
      : await createSandbox({
          onProgress: async ({ progress, message }) => {
            await send({
              type: "phase",
              phase: message,
              progress,
              subtitle:
                "This setup step only happens during local development.",
            });
          },
        });

    try {
      if (!process.env.VERCEL) {
        bundleRemotionProject(".remotion");
        await addBundleToSandbox({ sandbox, bundleDir: ".remotion" });
      }

      const { sandboxFilePath, contentType } = await renderMediaOnVercel({
        sandbox,
        compositionId: COMP_NAME,
        inputProps: body.inputProps,
        onProgress: async (update) => {
          switch (update.stage) {
            case "opening-browser":
              await send({
                type: "phase",
                phase: "Opening browser...",
                progress: update.overallProgress,
              });
              break;
            case "selecting-composition":
              await send({
                type: "phase",
                phase: "Selecting composition...",
                progress: update.overallProgress,
              });
              break;
            case "render-progress":
              await send({
                type: "phase",
                phase: "Rendering video...",
                progress: update.overallProgress,
              });
              break;
            default:
              break;
          }
        },
      });

      await send({
        type: "phase",
        phase: "Uploading video...",
        progress: 1,
      });

      const { url, size } = await uploadToVercelBlob({
        sandbox,
        sandboxFilePath,
        contentType,
        blobToken,
        access: "public",
      });

      await db
        .update(video)
        .set({
          status: "ready",
          renderUrl: url,
          size,
          updatedAt: new Date(),
        })
        .where(eq(video.id, createdVideo.id));

      await send({ type: "done", url, size, videoId: createdVideo.id });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to render video";
      console.log(err);
      await db
        .update(video)
        .set({
          status: "failed",
          errorMessage: message,
          updatedAt: new Date(),
        })
        .where(eq(video.id, createdVideo.id));
      await send({ type: "error", message });
    } finally {
      await sandbox?.stop().catch(() => {});
      await writer.close();
    }
  };

  waitUntil(runRender());

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
