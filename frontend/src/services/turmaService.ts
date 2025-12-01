import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface Turma {
    id: number;                 // ID real da Tabela 'turmas'
    nome: string;               // Nome/código da turma
    curso_id?: number;          // Curso vinculado
    disciplinaTurmaId?: number; // ID da tabela disciplinas_turmas (FK usado no módulo atividades)
}

export const turmaService = {
    listar: async (): Promise<Turma[]> => {
        const response = await axios.get(`${API_URL}/api/turmas`);
        return response.data;
    },

    listarPorMateria: async (materiaId: number): Promise<Turma[]> => {
        const response = await axios.get(`${API_URL}/api/materiasPage/${materiaId}/turmas`);
        return response.data;
    },

    obter: async (id: number): Promise<Turma> => {
        const response = await axios.get(`${API_URL}/api/turmas/${id}`);
        return response.data;
    },

    listarNovo: async (): Promise<any[]> => {
        const response = await axios.get(`${API_URL}/api/turmas-novo`);
        return response.data;
    },

    /**
     * LISTA TURMAS VINCULADAS A UMA DISCIPLINA (MÁTERIA)
     * Retorna o formato necessário para o ActivityForm funcionar com FKs.
     *
     * Estrutura backend esperada:
     * {
     *   turmas: [
     *     {
     *       id: 29,           // disciplinas_turmas.id (FK de atividades.turma_id)
     *       turma_id: 101,    // turmas.id
     *       codigo: "1º Ano A",
     *       curso_id: 17
     *     }
     *   ]
     * }
     */
    listarPorDisciplinaVinculada: async (disciplinaId: number): Promise<Turma[]> => {
        const response = await axios.get(`${API_URL}/api/disciplinas/${disciplinaId}/vinculados`);
        const turmasRaw = response.data.turmas || [];

        return turmasRaw.map((t: any) => ({
            id: t.id,                  // ID REAL DA TURMA (t.id vem do SELECT t.id)
            nome: t.codigo,            // Nome/Código da turma
            curso_id: t.curso_id,      // Curso da turma (pode ser undefined)
            disciplinaTurmaId: t.id,   // Usando o mesmo ID pois a relação parece ser direta
        }));
    },
};
