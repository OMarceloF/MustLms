import React from 'react';


interface UserSocialListProps {
  nome: string;
  nomeCompleto: string;
  idade: string;
  escolaridade: string;
  comunidades: string;
  biografia: string;
  imagemBase64: string;
  onVerPerfil?: () => void;
  onSeguir?: () => void;
}

const UserSocialList: React.FC<UserSocialListProps> = ({
  nome,
  nomeCompleto,
  idade,
  escolaridade,
  comunidades,
  biografia,
  imagemBase64,
  onVerPerfil,
  onSeguir
}) => {
  return (
    <div className="perfil-item-Amigos">
      <img src={imagemBase64} alt={`Foto de ${nome}`} className="perfil-img-Amigos" />
      <div className="perfil-info-Amigos">
        <h2>{nome}</h2>
        <p><strong>Nome completo:</strong> {nomeCompleto}</p>
        <p><strong>Idade:</strong> {idade}</p>
        <p><strong>Escolaridade:</strong> {escolaridade}</p>
        <p><strong>Comunidades:</strong> {comunidades}</p>
        <p className="bio-Amigos">{biografia}</p>
        <div className="perfil-buttons-Amigos">
          <button className="seguir-btn-Amigos" onClick={onSeguir}>Seguir</button>
          <button className="verperfil-btn-Amigos" onClick={onVerPerfil}>Ver Perfil</button>
        </div>
      </div>
    </div>
  );
};

export default UserSocialList;
