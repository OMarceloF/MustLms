// frontend/src/pages/gestor/cadastro/components/RegistrationLayout.tsx

import React from 'react';
import { Sidebar } from '../components/sidebarcadastro';
import { StudentForm } from './forms/EstudanteForm';
import { ResponsibleForm } from './forms/ResponsavelForm';
import { DocumentsForm } from './forms/DocumentosForm';
import { ContractForm } from './forms/ContratoForm';
import { BuscaCPFForm } from './forms/BuscaCPFResponsavelForm';
import { VincularAlunoCursoForm } from './forms/VincularAlunoCursoForm';
import { BuscaCPFAlunoForm } from './forms/BuscaCPFAlunoForm';
import { useRegistration } from '../contexts/RegistrationContext';

const stepComponents = {
    searchCpfAluno: BuscaCPFAlunoForm,
    student: StudentForm,
    searchCpf: BuscaCPFForm,
    responsible: ResponsibleForm,
    documents: DocumentsForm,
    vincularAluno: VincularAlunoCursoForm,
    contract: ContractForm,
} as const;

export function RegistrationLayout() {
    const { state } = useRegistration();
    const { currentStep } = state;

    const CurrentStepComponent = stepComponents[currentStep as keyof typeof stepComponents];

    return (
        // O container principal continua com 'flex'
        <div className="min-h-screen bg-gradient-subtle flex">
            {/* O componente Sidebar agora controla sua própria visibilidade */}
            <Sidebar />

            <main className="flex-1 overflow-auto">
                {/* 
                  AJUSTE: 
                  - 'max-w-4xl' é removido para que o conteúdo possa usar mais espaço em telas médias.
                  - O padding horizontal 'px-6' é ajustado para 'px-4' em mobile e 'px-8' em desktop para melhor espaçamento.
                */}
                <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
                    <div className="bg-card rounded-xl shadow-custom border border-border min-h-[600px]">
                        {/* 
                          AJUSTE: 
                          - Padding interno ajustado para ser menor em telas pequenas ('p-4') e maior em telas maiores ('sm:p-6', 'lg:p-8').
                        */}
                        <div className="p-4 sm:p-6 lg:p-8">
                            {CurrentStepComponent ? <CurrentStepComponent /> : null}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
