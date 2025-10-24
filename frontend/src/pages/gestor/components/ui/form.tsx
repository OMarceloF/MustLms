// components/ui/form.tsx
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
    Controller,
    FormProvider,
    useFormContext,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

/** util simples para classes */
function cn(...classes: Array<string | undefined | false | null>) {
    return classes.filter(Boolean).join(" ");
}

/** Provedor principal do formulário */
export const Form = FormProvider;

/* ------------------------ Contextos internos ------------------------ */

type FormItemContextValue = { id: string };
const FormItemContext = React.createContext<FormItemContextValue | undefined>(undefined);

type FormFieldContextValue = { name: string };
const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(undefined);

/** Hook utilitário para acessar estado do campo atual */
function useFormField() {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState, formState } = useFormContext();

    if (!fieldContext) {
        throw new Error("Form components devem ser usados dentro de <FormField />");
    }
    if (!itemContext) {
        throw new Error("Form components devem ser usados dentro de <FormItem />");
    }

    const fieldState = getFieldState(fieldContext.name, formState);

    return {
        id: itemContext.id,
        name: fieldContext.name,
        formItemId: `${itemContext.id}-form-item`,
        formDescriptionId: `${itemContext.id}-form-item-description`,
        formMessageId: `${itemContext.id}-form-item-message`,
        ...fieldState,
    };
}

/* ------------------------ Componentes ------------------------ */

/** Wrapper do Controller com contexto do nome do campo */
export function FormField<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: ControllerProps<TFieldValues, TName>) {
    return (
        <FormFieldContext.Provider value={{ name: props.name as string }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
}

/** Agrupador lógico/visual de um item do formulário */
export const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        const id = React.useId();
        return (
            <FormItemContext.Provider value={{ id }}>
                <div ref={ref} className={cn("space-y-2", className)} {...props} />
            </FormItemContext.Provider>
        );
    }
);
FormItem.displayName = "FormItem";

/** Rótulo associado ao campo dentro do mesmo FormItem */
export const FormLabel = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
    const { id, error } = useFormField();
    return (
        <label
            ref={ref}
            htmlFor={id}
            data-invalid={!!error || undefined}
            className={cn(
                "block text-sm font-medium",
                error ? "text-red-600" : "text-gray-900",
                className
            )}
            {...props}
        />
    );
});
FormLabel.displayName = "FormLabel";

/**
 * FormControl com Slot (Radix).
 * Injeta id/aria-* no componente filho (input/textarea/select trigger/checkbox etc.)
 * sem conflitar com os tipos do TS.
 */
export const FormControl = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    ({ className, ...props }, ref) => {
        const { id, formDescriptionId, formMessageId, error } = useFormField();
        return (
            <Slot
                ref={ref as any}
                id={id as any}
                aria-describedby={cn(formDescriptionId, formMessageId)}
                aria-invalid={!!error || undefined}
                className={className}
                {...(props as any)}
            />
        );
    }
);
FormControl.displayName = "FormControl";

/** Mensagem de erro do campo (usa mensagens do react-hook-form) */
export const FormMessage = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error.message ?? "Campo inválido") : children;

    if (!body) return null;

    return (
        <p
            ref={ref}
            id={formMessageId}
            className={cn("text-sm text-red-600", className)}
            {...props}
        >
            {body}
        </p>
    );
});
FormMessage.displayName = "FormMessage";
