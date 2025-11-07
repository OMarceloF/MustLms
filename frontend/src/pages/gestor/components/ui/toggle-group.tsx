"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "../../../lib/utils";

type ToggleGroupSize = "sm" | "md" | "lg";

interface BaseProps {
  size?: ToggleGroupSize;
  className?: string;
}

interface ToggleGroupSingleProps
  extends BaseProps,
    ToggleGroupPrimitive.ToggleGroupSingleProps {}

interface ToggleGroupMultipleProps
  extends BaseProps,
    ToggleGroupPrimitive.ToggleGroupMultipleProps {}

/**
 * Componente ToggleGroup unificado (aceita single ou multiple)
 */
export const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupSingleProps | ToggleGroupMultipleProps
>(({ className, size = "md", ...props }, ref) => {
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn("inline-flex items-center justify-center gap-1", className)}
      {...props}
    />
  );
});
ToggleGroup.displayName = "ToggleGroup";

/**
 * ToggleGroupItem
 */
interface ToggleGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> {
  size?: ToggleGroupSize;
}

const sizeClasses: Record<ToggleGroupSize, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-9 w-9 text-base",
  lg: "h-10 w-10 text-lg",
};

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, size = "md", ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-100 hover:text-black focus:z-10 focus:outline-none data-[state=on]:bg-blue-600 data-[state=on]:text-white transition-colors",
      sizeClasses[size],
      className
    )}
    {...props}
  />
));
ToggleGroupItem.displayName = "ToggleGroupItem";
