"use client";

import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-unfocused-border-color rounded-geist bg-muted/20">
      <div className="rounded-full bg-muted p-5 mb-5 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-md mt-2 text-sm leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-geist bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-geist bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
