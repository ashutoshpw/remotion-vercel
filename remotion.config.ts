// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";
import path from "path";

Config.setVideoImageFormat("jpeg");

Config.overrideWebpackConfig((currentConfiguration) => {
  // Enable Tailwind
  const withTailwind = enableTailwind(currentConfiguration);

  // Get existing aliases as an array
  const existingAlias = withTailwind.resolve?.alias || {};
  const existingAliasArray = Array.isArray(existingAlias)
    ? existingAlias
    : Object.entries(existingAlias).map(([name, alias]) => ({ name, alias }));

  // Add path aliases - more specific paths must come BEFORE less specific ones
  // Webpack processes aliases in order, so @/types must be before @
  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      alias: [
        // Most specific first: @/types/* -> types/*
        {
          name: "@/types",
          alias: path.resolve(process.cwd(), "types"),
        },
        // Less specific: @/* -> src/*
        {
          name: "@",
          alias: path.resolve(process.cwd(), "src"),
        },
        // Preserve any existing aliases
        ...existingAliasArray,
      ],
    },
  };
});
