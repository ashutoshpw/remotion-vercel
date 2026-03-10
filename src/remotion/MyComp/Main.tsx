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
import { CompositionProps } from "../../../types/constants";
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
}: z.infer<typeof CompositionProps>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const transitionStart = 2 * fps;
  const transitionDuration = 1 * fps;

  const logoOut = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    durationInFrames: transitionDuration,
    delay: transitionStart,
  });

  return (
    <AbsoluteFill className="bg-white">
      <Sequence durationInFrames={transitionStart + transitionDuration}>
        <Rings outProgress={logoOut}></Rings>
        <AbsoluteFill className="justify-center items-center">
          <NextLogo outProgress={logoOut}></NextLogo>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={transitionStart + transitionDuration / 2}>
        <TextFade>
          <div className="flex items-center gap-12 px-20">
            <div className="flex flex-col gap-5 max-w-[720px]">
              <div
                className="uppercase tracking-[0.3em] text-[24px] text-[#555]"
                style={{ fontFamily }}
              >
                {projectName}
              </div>
              <h1
                className="text-[70px] font-bold leading-tight"
                style={{ fontFamily }}
              >
                {title}
              </h1>
              {assetName ? (
                <div className="text-[28px] text-[#666]" style={{ fontFamily }}>
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
