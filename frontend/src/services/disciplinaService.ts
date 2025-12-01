import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface Disciplina {
    id: number;
    nome: string;
    codigo: string;
    curso_id: number;
    // adicione outros campos conforme necessário
}

export const disciplinaService = {
    obter: async (id: number): Promise<Disciplina> => {
        const response = await axios.get(`${API_URL}/api/disciplinas/${id}`);
        return response.data;
    }
};
