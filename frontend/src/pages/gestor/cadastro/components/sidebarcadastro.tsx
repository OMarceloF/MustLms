import React from 'react';
import { Check, User, Users, FileText, FileCheck, Search as SearchIcon } from 'lucide-react';
import { useRegistration, WizardStep } from '../contexts/RegistrationContext';
import { cn } from '../../../lib/utils';

interface SidebarProps {
    className?: string;
}

// =================================================================
// INÍCIO DA CORREÇÃO: Adicionando a nova etapa no início
// =================================================================
const steps: { id: WizardStep; title: string; description: string; icon: React.ElementType }[] = [
    {
        id: 'searchCpfAluno', // Nova etapa
        title: 'Busca por CPF do Aluno',
        description: 'Verificar cadastro existente',
        icon: SearchIcon,
    },
    {
        id: 'student',
        title: 'Dados do Aluno',
        description: 'Informações pessoais',
        icon: User,
    },
    {
        id: 'searchCpf',
        title: 'Busca por Responsável',
        description: 'Localizar e vincular',
        icon: SearchIcon,
    },
    {
        id: 'responsible',
        title: 'Cadastrar Responsáveis',
        description: 'Vínculos e dados financeiros',
        icon: Users,
    },
    {
        id: 'documents',
        title: 'Documentos',
        description: 'Upload de arquivos',
        icon: FileText,
    },
    {
        id: 'contract',
        title: 'Contrato',
        description: 'Configurações finais',
        icon: FileCheck,
    },
];
// =================================================================
// FIM DA CORREÇÃO
// =================================================================

export function Sidebar({ className }: SidebarProps) {
    const { state, setCurrentStep, canNavigateToStep } = useRegistration();
    const { currentStep, completedSteps } = state;

    const handleStepClick = (step: WizardStep) => {
        if (canNavigateToStep(step)) {
            setCurrentStep(step);
        }
    };

    return (
        <div className={cn(
            "w-80 bg-card border-r border-border flex flex-col",
            className
        )}>
            <div className="p-6 border-b border-border">
                <h1 className="text-2xl font-bold gradient-hero bg-clip-text text-transparent">
                    Cadastro de Aluno
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Sistema de Matrícula Online
                </p>
            </div>

            <nav className="flex-1 p-6">
                <div className="space-y-2">
                    {steps.map((step, index) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = completedSteps.includes(step.id);
                        const canNavigate = canNavigateToStep(step.id);
                        const Icon = step.icon;

                        return (
                            <button
                                key={step.id}
                                onClick={() => handleStepClick(step.id)}
                                disabled={!canNavigate}
                                className={cn(
                                    "w-full flex items-center space-x-4 p-4 rounded-lg text-left transition-smooth",
                                    "border border-transparent hover:border-border",
                                    isActive && "bg-primary/10 border-primary/20 shadow-custom",
                                    isCompleted && !isActive && "bg-success/5 border-success/20",
                                    !canNavigate && "opacity-50 cursor-not-allowed",
                                    canNavigate && !isActive && "hover:bg-muted/50"
                                )}
                            >
                                <div className="flex-shrink-0 relative">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-smooth",
                                            isActive && "bg-primary text-primary-foreground",
                                            isCompleted && !isActive && "bg-success text-success-foreground",
                                            !isActive && !isCompleted && "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={cn(
                                                "absolute top-10 left-1/2 w-px h-8 -translate-x-1/2 transition-smooth",
                                                isCompleted ? "bg-success" : "bg-border"
                                            )}
                                        />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className={cn(
                                        "font-medium transition-smooth",
                                        isActive && "text-primary",
                                        isCompleted && !isActive && "text-success",
                                        !isActive && !isCompleted && "text-foreground"
                                    )}>
                                        {step.title}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {step.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </nav>

            <div className="p-6 border-t border-border">
                <div className="text-xs text-muted-foreground">
                    Etapa {steps.findIndex(s => s.id === currentStep) + 1} de {steps.length}
                </div>
                <div className="mt-2 bg-muted rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full transition-smooth"
                        style={{
                            width: `${((steps.findIndex(s => s.id === currentStep) + 1) / steps.length) * 100}%`
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
