import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
//import '../../../styles/TurmaItem.css'

interface Professor {
  id: number;
  nome: string;
  foto_url: string;
}

interface Turma {
  id: number;
  nome: string;
  ano_letivo: number;
  aulas_por_dia: number;
  professores: Professor[];
}

interface TurmaItemProps {
  turma: Turma;
  onDelete: (id: number) => void;
}

console.log("Deploy feito")

const TurmaItem: React.FC<TurmaItemProps> = ({ turma, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/gestor/turmas/${turma.id}/adicionar-alunos`);
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(turma.id);
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-[750px] mx-auto my-4 p-4 bg-[#f9f9f9] rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-shadow duration-300 cursor-pointer"
    >
      <button
        onClick={(e) => {
          e.stopPropagation(); // evita que o clique no botão dispare o clique do card
          handleDelete();
        }}
        className="absolute top-[15px] right-[15px] text-[#e74c3c] hover:text-[#c0392b] cursor-pointer transition-colors"
      >
        <Trash2 size={20} />
      </button>
  
      <h3 className="mb-1 text-lg font-semibold text-gray-800">{turma.nome}</h3>
  
      <p className="my-1 text-sm text-gray-700">
        <strong className="font-medium">Aulas por dia:</strong> {turma.aulas_por_dia}
      </p>
  
      <p className="my-1 text-sm text-gray-700">
        <strong className="font-medium">Professores:</strong>{' '}
        {turma.professores.map((professor) => professor.nome).join(', ')}
      </p>
    </div>
  );
  
};

export default TurmaItem;