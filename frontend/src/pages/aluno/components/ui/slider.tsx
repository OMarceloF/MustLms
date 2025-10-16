// Cole este código final e definitivo em: src/components/ui/slider.tsx

"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "../../../lib/utils"; // Ajuste o caminho se necessário

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    {/* 1. A LINHA (TRACK): Cor cinza para garantir que seja sempre visível. */}
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-300 dark:bg-gray-700">
      {/* A parte preenchida da linha */}
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>

    {/* 
      2. O BOTÃO (THUMB) - ESTA É A CORREÇÃO PARA O SEU PROBLEMA:
      - 'bg-background' foi trocado por 'bg-white'. Isso dá ao botão um fundo branco sólido.
      - 'border-primary' foi mantido para a borda preta/escura.
      - 'relative z-10' garante que o botão fique sempre por cima da linha.
    */}
    <SliderPrimitive.Thumb className={cn(
      "relative z-10 block h-5 w-5 rounded-full border-2 border-primary bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    )} />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
