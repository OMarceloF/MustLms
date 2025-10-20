"use client";

import * as React from "react";
import { cn } from "../../../lib/utils"; // ajuste o caminho conforme sua estrutura

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string | null;
    alt?: string;
    fallback?: string; // ex: iniciais do usuário
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
};

/**
 * Avatar principal — exibe imagem ou fallback com iniciais.
 */
export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    fallback,
    size = "md",
    className,
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
            {src ? (
                // Imagem do avatar
                <img
                    src={src}
                    alt={alt || "Avatar"}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                    }}
                />
            ) : (
                // Fallback (iniciais ou ícone)
                <AvatarFallback>{fallback || "?"}</AvatarFallback>
            )}
        </div>
    );
};

/**
 * Fallback de avatar — usado quando a imagem não está disponível.
 */
export const AvatarFallback: React.FC<{
    children?: React.ReactNode;
    className?: string; // ✅ adicionado
}> = ({ children, className }) => {
    return (
        <span
            className={cn(
                "flex items-center justify-center w-full h-full text-slate-600 font-semibold",
                className // ✅ aplicado corretamente
            )}
        >
            {children}
        </span>
    );
};

