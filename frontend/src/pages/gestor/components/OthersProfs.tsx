// src/components/OtherProfs.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Professor {
  id: number;
  nome: string;
  foto_url: string;
}

interface OtherProfsProps {
  todosProfessores: Professor[];
  getFotoUrl: (url: string) => string;
}

const OtherProfs: React.FC<OtherProfsProps> = ({ todosProfessores, getFotoUrl }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="perfil-lateral">
      <h3>Outros Professores</h3>
      {todosProfessores
        .filter((p) => p.id !== Number(id))
        .map((p) => (
          <div
            className="professor-card"
            key={p.id}
            onClick={() => navigate(`/gestor/professores/${p.id}/visualizar`)}
          >
            <img src={getFotoUrl(p.foto_url)} alt={p.nome} />
            <div>
              <p>{p.nome}</p>
              <div className="mini-barra" />
            </div>
          </div>
        ))}
    </div>
  );
};

export default OtherProfs;
