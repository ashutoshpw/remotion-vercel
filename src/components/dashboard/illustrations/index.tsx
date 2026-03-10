"use client";

import React from "react";

export const WelcomeIllustration: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="60"
      cy="60"
      r="56"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.2"
    />
    <circle
      cx="60"
      cy="60"
      r="40"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.3"
    />
    <path
      d="M60 30V90M30 60H90"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.4"
    />
    <circle cx="60" cy="45" r="8" stroke="currentColor" strokeWidth="2" />
    <path
      d="M45 70C45 62 52 56 60 56C68 56 75 62 75 70"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="40"
      cy="50"
      r="5"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.5"
    />
    <circle
      cx="80"
      cy="50"
      r="5"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.5"
    />
    <path
      d="M35 65L40 70M85 65L80 70"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

export const TeamIllustration: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="20"
      y="30"
      width="80"
      height="60"
      rx="4"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M20 45H100" stroke="currentColor" strokeWidth="2" />
    <circle cx="30" cy="37.5" r="2.5" fill="currentColor" opacity="0.5" />
    <circle cx="40" cy="37.5" r="2.5" fill="currentColor" opacity="0.5" />
    <circle cx="50" cy="37.5" r="2.5" fill="currentColor" opacity="0.5" />
    <rect
      x="30"
      y="55"
      width="25"
      height="25"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="65"
      y="55"
      width="25"
      height="25"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M35 65H50M35 70H45"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
    <path
      d="M70 65H85M70 70H80"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const ProjectIllustration: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M25 35H55L60 30H95V90H25V35Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M25 45H95" stroke="currentColor" strokeWidth="2" />
    <rect
      x="35"
      y="55"
      width="20"
      height="15"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="65"
      y="55"
      width="20"
      height="15"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="35"
      y="75"
      width="50"
      height="8"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.6"
    />
    <circle cx="45" cy="62.5" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M72 58L78 65L85 55"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const VideoIllustration: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="20"
      y="30"
      width="80"
      height="50"
      rx="4"
      stroke="currentColor"
      strokeWidth="2"
    />
    <polygon
      points="55,45 55,70 75,57.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <rect
      x="25"
      y="85"
      width="70"
      height="6"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.5"
    />
    <rect
      x="25"
      y="85"
      width="40"
      height="6"
      rx="3"
      fill="currentColor"
      opacity="0.3"
    />
    <circle cx="30" cy="40" r="3" fill="currentColor" opacity="0.4" />
    <circle cx="40" cy="40" r="3" fill="currentColor" opacity="0.4" />
  </svg>
);

export const EmptyIllustration: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="60"
      cy="60"
      r="40"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="4 4"
      opacity="0.4"
    />
    <path
      d="M45 55L60 70L75 55"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.6"
    />
    <line
      x1="60"
      y1="40"
      x2="60"
      y2="65"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
    <path
      d="M40 80H80"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.4"
    />
  </svg>
);

export const SettingsIllustration: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="60" cy="60" r="15" stroke="currentColor" strokeWidth="2" />
    <circle cx="60" cy="60" r="6" fill="currentColor" opacity="0.3" />
    <path
      d="M60 25V35M60 85V95"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M25 60H35M85 60H95"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M35.3 35.3L42.4 42.4M77.6 77.6L84.7 84.7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M84.7 35.3L77.6 42.4M42.4 77.6L35.3 84.7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
