import React from "react";

export const ProgressBar: React.FC<{
  progress: number;
  size?: "sm" | "md";
}> = ({ progress, size = "md" }) => {
  const height = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div
      className={`w-full ${height} rounded-full overflow-hidden bg-muted`}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`${height} rounded-full bg-geist-success transition-all duration-300 ease-out`}
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
};
