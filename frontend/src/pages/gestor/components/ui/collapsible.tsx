"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "../../../lib/utils"; // ajuste o caminho se necessário

// ------------------------------
// Container principal
// ------------------------------
export const Collapsible = CollapsiblePrimitive.Root;

// ------------------------------
// Trigger (botão que abre/fecha)
// ------------------------------
export const CollapsibleTrigger = React.forwardRef<
    React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <CollapsiblePrimitive.Trigger
        ref={ref}
        className={cn(
            "flex w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-100 transition-all",
            className
        )}
        {...props}
    />
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

// ------------------------------
// Conteúdo expansível
// ------------------------------
export const CollapsibleContent = React.forwardRef<
    React.ElementRef<typeof CollapsiblePrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...props }, ref) => (
    <CollapsiblePrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-inner data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
            className
        )}
        {...props}
    />
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;
