// src/pages/gestor/components/FormField.tsx
import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

// Define os tipos para as propriedades (props) que o componente vai receber.
// Isso garante que estamos usando o componente corretamente com TypeScript.
interface FormFieldProps {
    id: string; // O 'name' do campo, usado para registro e no 'htmlFor' do label.
    label: string; // O texto que aparecerá acima do campo.
    register: UseFormRegister<any>; // A função 'register' do React Hook Form.
    error?: FieldError; // O objeto de erro para este campo, vindo do React Hook Form.

    // Propriedades opcionais para customização
    type?: string; // O tipo do input (ex: 'text', 'date', 'password'). Padrão é 'text'.
    as?: 'input' | 'select' | 'textarea'; // Que tipo de elemento de formulário renderizar. Padrão é 'input'.
    options?: string[]; // Array de strings para as opções de um 'select'.
    placeholder?: string; // Texto de ajuda dentro do campo.
    className?: string; // Classes CSS adicionais para o próprio campo (input, select, etc.).
    containerClassName?: string; // Classes CSS adicionais para o 'div' que envolve o label e o campo.
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; // Função para lidar com mudanças, útil para formatação.
    [key: string]: any; // Permite passar outras props (como 'rows' para textarea ou 'autoComplete').
}

const FormField: React.FC<FormFieldProps> = ({
    id,
    label,
    register,
    error,
    type = 'text',
    as = 'input',
    options,
    placeholder,
    className = '',
    containerClassName = '',
    onChange,
    ...props // Pega todas as outras props passadas
}) => {

    // Definimos um conjunto de classes base do Tailwind para todos os campos.
    const baseInputClasses = `
    w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground 
    placeholder:text-muted-foreground 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
    transition-colors
  `;
    // Objeto com as propriedades comuns a todos os tipos de campo
    // para evitar repetição de código.
    const fieldClassName = `${baseInputClasses} ${error ? 'border-destructive' : ''} ${className}`;

    const commonProps = {
        id,
        ...register(id, { onChange }),
        placeholder,
        className: fieldClassName,
        ...props,
    };

    const renderInput = () => {
        switch (as) {
            case 'textarea':
                return <textarea {...commonProps} />;
            case 'select':
                return (
                    <select {...commonProps}>
                        <option value="">Selecione...</option>
                        {options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            default:
                return <input type={type} {...commonProps} />;
        }
    };

    return (
        <div className={`flex flex-col ${containerClassName}`}>
            {/* 1. Cor do label alterada para 'text-foreground' (preto) */}
            <label htmlFor={id} className="mb-2 text-sm font-medium text-foreground">
                {label}
            </label>

            {renderInput()}

            {error && <p className="mt-1.5 text-xs text-destructive">{error.message}</p>}
        </div>
    );
};

export default FormField;