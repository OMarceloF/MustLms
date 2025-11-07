// frontend/src/pages/lib/created-activities.ts

export interface CreatedActivity {
  id: string;
  type: string; // Ex: "Tarefa", "Fórum", "Questionário"
  title: string;
  dueDate?: string; // Data de entrega
  status: "Publicado" | "Rascunho";
  submissions?: number; // Número de envios (para tarefas)
}

export const CREATED_ACTIVITIES_MOCK: CreatedActivity[] = [
  {
    id: "act1",
    type: "Tarefa",
    title: "Análise de Caso: Marketing Digital",
    dueDate: "15 de dez de 2025",
    status: "Publicado",
    submissions: 15,
  },
  {
    id: "act2",
    type: "Questionário",
    title: "Teste Rápido: Conceitos de UX",
    dueDate: "10 de dez de 2025",
    status: "Publicado",
  },
  {
    id: "act3",
    type: "Fórum",
    title: "Discussão sobre o Futuro da IA",
    status: "Publicado",
  },
  {
    id: "act4",
    type: "Arquivo",
    title: "Slides da Aula 05 - Prototipação",
    status: "Rascunho",
  },
  {
    id: "act5",
    type: "Tarefa",
    title: "Projeto Final: Desenvolvimento de App",
    dueDate: "30 de jan de 2026",
    status: "Rascunho",
  },
];