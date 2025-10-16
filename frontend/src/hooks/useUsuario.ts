import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import.meta.env.VITE_API_URL


const useUsuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<any[]>([]);

  const onView = (id: number) => {
    console.log(`Visualizando aluno ${id}`);
    navigate(`/gestor/alunos/${id}`); // Redireciona para a página de detalhes
  };

  const onEdit = (id: number) => {
    console.log(`Editando aluno ${id}`);
    navigate(`/gestor/editarAluno/${id}`);
  };

  const onDelete = async (id: number, setAlunos: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (!window.confirm("Tem certeza que deseja excluir este aluno?")) return;

    try {
      const response = await axios.delete(`/api/alunos/${id}`);

      if (response.status !== 200) throw new Error("Erro ao excluir aluno");

      setAlunos((prev) => prev.filter((aluno) => aluno.id !== id));
      console.log(`Aluno ${id} excluído com sucesso!`);
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir aluno.");
    }
  };

  return { usuarios, setUsuarios, onView, onEdit, onDelete };
};

export default useUsuarios;
