"use client";

import * as React from "react";
import {
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { cn } from "../../../lib/utils"; // ajuste o caminho se necessário

// ------------------------------
// Tooltip genérico para Recharts
// ------------------------------
export interface ChartTooltipContentProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    valueFormatter?: (value: any) => string;
}

export const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({
    active,
    payload,
    label,
    valueFormatter,
}) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-md border bg-white/90 backdrop-blur-sm p-2 shadow-md text-sm text-slate-800">
            <p className="font-medium mb-1">{label}</p>
            {payload.map((item, idx) => (
                <div key={idx} className="flex justify-between gap-4">
                    <span
                        className="flex items-center gap-1"
                        style={{ color: item.color }}
                    >
                        ● {item.name}
                    </span>
                    <span className="font-semibold">
                        {valueFormatter ? valueFormatter(item.value) : item.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ------------------------------
// Tooltip Wrapper para Recharts
// ------------------------------
export const ChartTooltip = ({
    cursor = { fill: "transparent" },
    content,
}: {
    cursor?: any;
    content: React.ReactElement;
}) => {
    return <Tooltip cursor={cursor} content={content} />;
};

// ------------------------------
// Container base de gráfico
// ------------------------------
export interface ChartContainerProps {
    children: React.ReactElement;
    className?: string;
    height?: number;
    config?: Record<
        string,
        {
            label: string;
            color: string;
        }
    >;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
    children,
    className,
    height = 300,
    config, // ✅ agora reconhecido
}) => {
    return (
        <div
            className={cn(
                "w-full h-auto rounded-xl border border-slate-200 bg-white shadow-sm p-4",
                className
            )}
            style={{ height }}
        >
            {/* ✅ se quiser, pode usar config futuramente para gerar legendas */}
            {config && (
                <div className="flex items-center gap-4 mb-2 text-sm text-slate-600">
                    {Object.entries(config).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: value.color }}
                            />
                            <span>{value.label}</span>
                        </div>
                    ))}
                </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    );
};