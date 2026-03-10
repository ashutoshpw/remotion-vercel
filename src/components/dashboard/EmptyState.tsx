"use client";

import React from "react";
import { Button } from "../Button";

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

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-6 text-muted-foreground w-24 h-24 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-sm mt-2 text-sm">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          {action.href ? (
            <a href={action.href}>
              <Button>{action.label}</Button>
            </a>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );
};
