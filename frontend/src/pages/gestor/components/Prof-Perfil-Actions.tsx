// src/components/ProfPerfilActions.tsx
import React from 'react';
import { HiOutlineHeart, HiHeart, HiOutlineChatAlt2, HiChatAlt2, HiOutlinePhone, HiPhone, HiOutlineClock, HiClock, HiOutlineClipboardList, HiClipboardList, HiOutlineInformationCircle, HiInformationCircle } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';

const ProfPerfilActions = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="perfil-info-coluna-direita">
      <div className="icon-button" onClick={() => console.log('Seguir')}>
        <HiOutlineHeart className="icon-normal" size={24} />
        <HiHeart className="icon-hover" size={24} />
        <p>Seguir</p>
      </div>

      <div className="icon-button" onClick={() => console.log('Mandar Mensagem')}>
        <HiOutlineChatAlt2 className="icon-normal" size={24} />
        <HiChatAlt2 className="icon-hover" size={24} />
        <p>Mensagem</p>
      </div>

      <div className="icon-button" onClick={() => console.log('Entrar em Contato')}>
        <HiOutlinePhone className="icon-normal" size={24} />
        <HiPhone className="icon-hover" size={24} />
        <p>Contato</p>
      </div>

      <div className="icon-button" onClick={() => console.log('Horários')}>
        <HiOutlineClock className="icon-normal" size={24} />
        <HiClock className="icon-hover" size={24} />
        <p>Horários</p>
      </div>

      <div className="icon-button" onClick={() => navigate(`/gestor/professores/${id}/relatorio`)}>
        <HiOutlineClipboardList className="icon-normal" size={24} />
        <HiClipboardList className="icon-hover" size={24} />
        <p>Relatórios</p>
      </div>

      <div className="icon-button" onClick={() => console.log('Informações')}>
        <HiOutlineInformationCircle className="icon-normal" size={24} />
        <HiInformationCircle className="icon-hover" size={24} />
        <p>Informações</p>
      </div>
    </div>
  );
};

export default ProfPerfilActions;
