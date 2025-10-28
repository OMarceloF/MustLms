"use client";

import * as React from "react";
import { cn } from "../../../lib/utils";

// --- TIPOS E CONSTANTES ---
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
};

// --- COMPONENTE PRINCIPAL (Wrapper) ---
export const Avatar: React.FC<AvatarProps> = ({
    size = "md",
    className,
    children, // Recebe os filhos
    ...props
}) => {
    return (
        <div
            className={cn(
                "relative inline-flex items-center justify-center rounded-full overflow-hidden bg-slate-200 border border-slate-300 text-slate-700 font-medium select-none",
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {children} {/* Renderiza os filhos (AvatarImage e AvatarFallback) */}
        </div>
    );
};

// --- NOVO COMPONENTE: AvatarImage ---
export const AvatarImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({
    src,
    alt,
    className,
    ...props
}) => {
    if (!src) return null; // Não renderiza se não houver src

    return (
        <img
            src={src}
            alt={alt}
            className={cn("object-cover w-full h-full", className)}
            {...props}
        />
    );
};

// --- COMPONENTE: AvatarFallback ---
export const AvatarFallback: React.FC<{
    children?: React.ReactNode;
    className?: string;
}> = ({ children, className }) => {
    return (
        <span
            className={cn(
                "flex items-center justify-center w-full h-full text-slate-600 font-semibold",
                className
            )}
        >
            {children}
        </span>
    );
};
