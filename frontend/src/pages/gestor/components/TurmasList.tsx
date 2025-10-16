import React from 'react';

interface TurmasListProps {
  turmasDoProfessor: any[];
}

const TurmasList: React.FC<TurmasListProps> = ({ turmasDoProfessor }) => {
  return (
    <div className="novo-card-container">
      <h2 className="novo-card-title">Turmas Associadas ao Professor</h2>

      {turmasDoProfessor.length === 0 ? (
        <>
          <p className="novo-card-conteudo" style={{ marginBottom: '15px' }}>
            Turma A - 1º Ano de Informática.
          </p>
          <p className="novo-card-conteudo" style={{ marginBottom: '15px' }}>
            Turma B - 2º Ano de Robótica
          </p>
          <p className="novo-card-conteudo" style={{ marginBottom: '15px' }}>
            Turma C - 3º Ano de Programação Web
          </p>
          <p className="novo-card-conteudo" style={{ marginBottom: '15px' }}>
            Turma D - 1º Ano de Química e Física
          </p>
          <p className="novo-card-conteudo" style={{ marginBottom: '15px' }}>
            Turma E - 2º Ano de Inteligência Artificial
          </p>
          <p className="novo-card-conteudo" style={{ marginBottom: '15px' }}>
            Turma F - 3º Ano de Design e UX/UI
          </p>
        </>
      ) : (
        <ul className="turmas-lista">
          {turmasDoProfessor.map((turma, index) => (
            <li key={index} className="turmas-item">
              {turma.nome}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TurmasList;
