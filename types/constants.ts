import { z } from "zod";
export const COMP_NAME = "MyComp";

// Hex color regex pattern
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const CompositionProps = z.object({
  // Content
  title: z.string().trim().min(1).max(80),
  projectName: z.string().trim().min(1).max(80),
  assetName: z.string().trim().min(1).max(80).optional(),
  assetUrl: z.string().url().optional(),

  // Theming
  theme: z.enum(["light", "dark"]).default("light"),
  backgroundColor: z.string().regex(hexColorRegex).optional(),
  primaryColor: z.string().regex(hexColorRegex).optional(), // Title color
  accentColor: z.string().regex(hexColorRegex).optional(), // Subtitle/accent color

  // Typography
  titleFontSize: z.enum(["small", "medium", "large"]).default("medium"),
  textAlign: z.enum(["left", "center"]).default("left"),

  // Layout
  showLogo: z.boolean().default(true),

  // Animation
  animationSpeed: z.enum(["slow", "normal", "fast"]).default("normal"),
});

export type CompositionPropsType = z.infer<typeof CompositionProps>;

// Theme color presets
export const themeColors = {
  light: {
    background: "#FFFFFF",
    primary: "#000000",
    accent: "#555555",
  },
  dark: {
    background: "#0A0A0A",
    primary: "#FFFFFF",
    accent: "#AAAAAA",
  },
} as const;

// Font size presets (in pixels)
export const fontSizes = {
  small: { title: 50, subtitle: 20, assetLabel: 22 },
  medium: { title: 70, subtitle: 24, assetLabel: 28 },
  large: { title: 90, subtitle: 28, assetLabel: 32 },
} as const;

// Animation speed presets (spring damping values - lower = bouncier/slower)
export const animationSpeeds = {
  slow: 100,
  normal: 200,
  fast: 300,
} as const;

export const defaultMyCompProps: CompositionPropsType = {
  title: "Ship product updates faster",
  projectName: "Create a project to start rendering",
  theme: "light",
  titleFontSize: "medium",
  textAlign: "left",
  showLogo: true,
  animationSpeed: "normal",
};

export const DURATION_IN_FRAMES = 200;
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const VIDEO_FPS = 30;
