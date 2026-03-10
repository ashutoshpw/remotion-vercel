import { z } from "zod";
export const COMP_NAME = "MyComp";

export const CompositionProps = z.object({
  title: z.string().trim().min(1).max(80),
  projectName: z.string().trim().min(1).max(80),
  assetName: z.string().trim().min(1).max(80).optional(),
  assetUrl: z.string().url().optional(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  title: "Ship product updates faster",
  projectName: "Create a project to start rendering",
};

export const DURATION_IN_FRAMES = 200;
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const VIDEO_FPS = 30;
