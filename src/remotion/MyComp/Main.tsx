import { fontFamily, loadFont } from "@remotion/google-fonts/Inter";
import {
  AbsoluteFill,
  Img,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import {
  CompositionProps,
  themeColors,
  fontSizes,
  animationSpeeds,
} from "@/types/constants";
import { NextLogo } from "./NextLogo";
import { Rings } from "./Rings";
import { TextFade } from "./TextFade";

loadFont("normal", {
  subsets: ["latin"],
  weights: ["400", "700"],
});

export const Main = ({
  title,
  projectName,
  assetName,
  assetUrl,
  theme = "light",
  backgroundColor,
  primaryColor,
  accentColor,
  titleFontSize = "medium",
  textAlign = "left",
  showLogo = true,
  animationSpeed = "normal",
}: z.infer<typeof CompositionProps>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Resolve colors based on theme and custom overrides
  const colors = themeColors[theme];
  const bgColor = backgroundColor || colors.background;
  const titleColor = primaryColor || colors.primary;
  const subtitleColor = accentColor || colors.accent;

  // Get font sizes based on setting
  const sizes = fontSizes[titleFontSize];

  // Get animation damping based on speed
  const damping = animationSpeeds[animationSpeed];

  const transitionStart = 2 * fps;
  const transitionDuration = 1 * fps;

  const logoOut = spring({
    fps,
    frame,
    config: {
      damping,
    },
    durationInFrames: transitionDuration,
    delay: transitionStart,
  });

  // Text alignment styles
  const alignmentStyles =
    textAlign === "center"
      ? { alignItems: "center", textAlign: "center" as const }
      : { alignItems: "flex-start", textAlign: "left" as const };

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      {showLogo && (
        <Sequence durationInFrames={transitionStart + transitionDuration}>
          <Rings outProgress={logoOut} />
          <AbsoluteFill className="justify-center items-center">
            <NextLogo outProgress={logoOut} />
          </AbsoluteFill>
        </Sequence>
      )}
      <Sequence from={showLogo ? transitionStart + transitionDuration / 2 : 0}>
        <TextFade>
          <div
            className="flex items-center gap-12 px-20"
            style={{
              justifyContent: textAlign === "center" ? "center" : "flex-start",
            }}
          >
            <div
              className="flex flex-col gap-5 max-w-[720px]"
              style={alignmentStyles}
            >
              <div
                className="uppercase tracking-[0.3em]"
                style={{
                  fontFamily,
                  fontSize: sizes.subtitle,
                  color: subtitleColor,
                }}
              >
                {projectName}
              </div>
              <h1
                className="font-bold leading-tight"
                style={{
                  fontFamily,
                  fontSize: sizes.title,
                  color: titleColor,
                }}
              >
                {title}
              </h1>
              {assetName ? (
                <div
                  style={{
                    fontFamily,
                    fontSize: sizes.assetLabel,
                    color: subtitleColor,
                  }}
                >
                  Reusing saved asset: {assetName}
                </div>
              ) : null}
            </div>
            {assetUrl ? (
              <div className="h-[320px] w-[320px] overflow-hidden rounded-[48px] border border-black/10 bg-[#f6f6f6] shadow-xl">
                <Img src={assetUrl} className="h-full w-full object-cover" />
              </div>
            ) : null}
          </div>
        </TextFade>
      </Sequence>
    </AbsoluteFill>
  );
};
