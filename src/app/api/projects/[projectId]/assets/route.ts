import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { getRequestSession } from "../../../../../lib/session";
import { AssetRequest } from "../../../../../../types/schema";

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const session = await getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  try {
    const payload = AssetRequest.parse(await request.json());
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        team: {
          ownerId: session.user.id,
        },
      },
    });

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const asset = await prisma.projectAsset.create({
      data: {
        projectId,
        name: payload.name,
        url: payload.url,
      },
    });

    return NextResponse.json(
      {
        asset: {
          ...asset,
          createdAt: asset.createdAt.toISOString(),
          updatedAt: asset.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const status = error instanceof ZodError ? 400 : 503;
    return NextResponse.json({ message: (error as Error).message }, { status });
  }
}
