import React from 'react';
import { Sidebar } from '../components/sidebarcadastro';
import { StudentForm } from './forms/EstudanteForm';
import { ResponsibleForm } from './forms/ResponsavelForm';
import { DocumentsForm } from './forms/DocumentosForm';
import { ContractForm } from './forms/ContratoForm';
import { BuscaCPFForm } from './forms/BuscaCPFForm'; // Busca do Responsável

// =================================================================
// PASSO 1: Importe o novo formulário de busca do aluno
// =================================================================
import { BuscaCPFAlunoForm } from './forms/BuscaCPFAlunoForm';
// =================================================================

import { useRegistration } from '../contexts/RegistrationContext';

// =================================================================
// PASSO 2: Adicione o novo componente ao objeto de mapeamento
// =================================================================
const stepComponents = {
    searchCpfAluno: BuscaCPFAlunoForm, // <-- NOVA LINHA ADICIONADA
    student: StudentForm,
    searchCpf: BuscaCPFForm,
    responsible: ResponsibleForm,
    documents: DocumentsForm,
    contract: ContractForm,
} as const;
// =================================================================

export function RegistrationLayout() {
    const { state } = useRegistration();
    const { currentStep } = state;

    // Esta lógica agora funcionará corretamente para a nova etapa
    const CurrentStepComponent = stepComponents[currentStep as keyof typeof stepComponents];

    return (
        <div className="min-h-screen bg-gradient-subtle flex">
            <Sidebar />

            <main className="flex-1 overflow-auto">
                <div className="container max-w-4xl mx-auto py-8 px-6">
                    <div className="bg-card rounded-xl shadow-custom border border-border min-h-[600px]">
                        <div className="p-8">
                            {CurrentStepComponent ? <CurrentStepComponent /> : null}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
