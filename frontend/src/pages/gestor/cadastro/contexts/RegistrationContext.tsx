import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// --- Definição dos Tipos de Dados ---

export interface StudentData {
  id: number | null;
  nomeCompleto: string;
  cpf: string;
  rg: string;
  matricula: string;
  dataNascimento: Date | null;
  email: string;
  telefone: string;
  sexo: 'M' | 'F' | undefined;
  contatoResponsaveis: string;
  biografia: string;
  restricoesMedicas: string;
  login: string;
  senha: string;
  foto?: File;
  fotoUrl?: string | null;
}

export interface ResponsibleData {
  responsavelFinanceiro: boolean;
  nomeResponsavel: string;
  cpf: string;
  rg: string;
  email: string;
  numero1: string;
  numero2?: string;
  logradouro: string;
  numeroEndereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  grauParentesco: string;
  telefoneContato: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
}

export interface DocumentData {}

// =================================================================
// INÍCIO DA CORREÇÃO: Interface ContractData preenchida
// =================================================================
export interface ContractData {
  alunoId?: number | null;
  planoPagamento?: 'mensal' | 'semestral' | 'anual';
  valorMensalidade?: number;
  desconto?: number;
  tipoDesconto?: 'percentual' | 'valor';
  dataVencimento?: number;
  bolsa?: boolean;
  descricaoBolsa?: string;
  formaPagamento?: string[];
}
// =================================================================

export interface RegistrationData {
  student: StudentData;
  responsible: ResponsibleData;
  documents: DocumentData;
  contract: ContractData;
}

// --- Estado Inicial ---

export const initialStudentData: StudentData = {
  id: null,
  nomeCompleto: '',
  cpf: '',
  rg: '',
  matricula: '',
  dataNascimento: null,
  email: '',
  telefone: '',
  sexo: undefined,
  contatoResponsaveis: '',
  biografia: '',
  restricoesMedicas: '',
  login: '',
  senha: '',
  foto: undefined,
  fotoUrl: null,
};

export const initialResponsibleData: ResponsibleData = {
  responsavelFinanceiro: false,
  nomeResponsavel: '',
  cpf: '',
  rg: '',
  email: '',
  numero1: '',
  numero2: '',
  logradouro: '',
  numeroEndereco: '',
  bairro: '',
  cidade: '',
  cep: '',
  grauParentesco: '',
  telefoneContato: '',
  nacionalidade: '',
  estadoCivil: '',
  profissao: '',
};

export const initialDocumentData: DocumentData = {};

// =================================================================
// INÍCIO DA CORREÇÃO: Estado inicial do contrato preenchido
// =================================================================
export const initialContractData: ContractData = {
  alunoId: null,
  planoPagamento: undefined,
  valorMensalidade: 0,
  desconto: 0,
  tipoDesconto: 'percentual',
  dataVencimento: 5,
  bolsa: false,
  descricaoBolsa: '',
  formaPagamento: [],
};
// =================================================================

// --- Lógica do Contexto (Reducer, Provider, etc.) ---

export type WizardStep = 'searchCpfAluno' | 'student' | 'searchCpf' | 'responsible' | 'documents' | 'contract';

interface RegistrationState {
  data: RegistrationData;
  currentStep: WizardStep;
  completedSteps: WizardStep[];
}

type RegistrationAction =
  | { type: 'UPDATE_STUDENT'; payload: Partial<StudentData> }
  | { type: 'UPDATE_RESPONSIBLE'; payload: Partial<ResponsibleData> }
  | { type: 'UPDATE_DOCUMENTS'; payload: Partial<DocumentData> }
  | { type: 'UPDATE_CONTRACT'; payload: Partial<ContractData> }
  | { type: 'SET_CURRENT_STEP'; payload: WizardStep }
  | { type: 'COMPLETE_STEP'; payload: WizardStep }
  | { type: 'RESET_DATA' };

const initialState: RegistrationState = {
  data: {
    student: initialStudentData,
    responsible: initialResponsibleData,
    documents: initialDocumentData,
    contract: initialContractData,
  },
  currentStep: 'searchCpfAluno',
  completedSteps: [],
};

function registrationReducer(state: RegistrationState, action: RegistrationAction): RegistrationState {
  switch (action.type) {
    case 'UPDATE_STUDENT':
      return { ...state, data: { ...state.data, student: { ...state.data.student, ...action.payload } } };
    case 'UPDATE_RESPONSIBLE':
      return { ...state, data: { ...state.data, responsible: { ...state.data.responsible, ...action.payload } } };
    case 'UPDATE_DOCUMENTS':
      return { ...state, data: { ...state.data, documents: { ...state.data.documents, ...action.payload } } };
    case 'UPDATE_CONTRACT':
      return { ...state, data: { ...state.data, contract: { ...state.data.contract, ...action.payload } } };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.payload)
          ? state.completedSteps
          : [...state.completedSteps, action.payload],
      };
    case 'RESET_DATA':
      return initialState;
    default:
      return state;
  }
}

interface RegistrationContextType {
  state: RegistrationState;
  updateStudent: (data: Partial<StudentData>) => void;
  updateResponsible: (data: Partial<ResponsibleData>) => void;
  updateDocuments: (data: Partial<DocumentData>) => void;
  updateContract: (data: Partial<ContractData>) => void;
  setCurrentStep: (step: WizardStep) => void;
  completeStep: (step: WizardStep) => void;
  resetData: () => void;
  canNavigateToStep: (step: WizardStep) => boolean;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(registrationReducer, initialState);

  const updateStudent = (data: Partial<StudentData>) => dispatch({ type: 'UPDATE_STUDENT', payload: data });
  const updateResponsible = (data: Partial<ResponsibleData>) => dispatch({ type: 'UPDATE_RESPONSIBLE', payload: data });
  const updateDocuments = (data: Partial<DocumentData>) => dispatch({ type: 'UPDATE_DOCUMENTS', payload: data });
  const updateContract = (data: Partial<ContractData>) => dispatch({ type: 'UPDATE_CONTRACT', payload: data });
  const setCurrentStep = (step: WizardStep) => dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  const completeStep = (step: WizardStep) => dispatch({ type: 'COMPLETE_STEP', payload: step });
  const resetData = () => dispatch({ type: 'RESET_DATA' });

  const canNavigateToStep = (step: WizardStep): boolean => {
    const stepOrder: WizardStep[] = ['searchCpfAluno', 'student', 'searchCpf', 'responsible', 'documents', 'contract'];
    const stepIndex = stepOrder.indexOf(step);
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (stepIndex <= currentIndex) return true;
    return stepIndex === 0 || state.completedSteps.includes(stepOrder[stepIndex - 1]);
  };

  const value: RegistrationContextType = {
    state,
    updateStudent,
    updateResponsible,
    updateDocuments,
    updateContract,
    setCurrentStep,
    completeStep,
    resetData,
    canNavigateToStep,
  };

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
}
