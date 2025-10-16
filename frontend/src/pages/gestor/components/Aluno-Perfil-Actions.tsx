import React from 'react';
import { HiOutlineHeart, HiHeart, HiOutlineChatAlt2, HiChatAlt2, HiOutlinePhone, HiPhone, HiOutlineClock, HiClock, HiOutlineClipboardList, HiClipboardList, HiOutlineInformationCircle, HiInformationCircle } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

interface AlunoPerfilActionsProps {
  aluno: any;
  todosAlunos: any[];
}

const AlunoPerfilActions: React.FC<AlunoPerfilActionsProps> = ({ aluno, todosAlunos }) => {
  const navigate = useNavigate();

  return (
    <div className="perfil-info-coluna-direita">
      <div className="icon-button"><HiOutlineHeart className="icon-normal" /><HiHeart className="icon-hover" /><p>Seguir</p></div>
      <div className="icon-button"><HiOutlineChatAlt2 className="icon-normal" /><HiChatAlt2 className="icon-hover" /><p>Mensagem</p></div>
      <div className="icon-button"><HiOutlinePhone className="icon-normal" /><HiPhone className="icon-hover" /><p>Contato</p></div>
      <div className="icon-button"><HiOutlineClock className="icon-normal" /><HiClock className="icon-hover" /><p>Horários</p></div>
      <div
        className="icon-button"
        onClick={() =>
          navigate(`/gestor/alunos/${aluno.id}/relatorio`, {
            state: { aluno, todosAlunos }
          })
        }
        style={{ cursor: 'pointer' }}
      >
        <HiOutlineClipboardList className="icon-normal" />
        <HiClipboardList className="icon-hover" />
        <p>Relatórios</p>
      </div>
      <div className="icon-button"><HiOutlineInformationCircle className="icon-normal" /><HiInformationCircle className="icon-hover" /><p>Informações</p></div>
    </div>
  );
};

export default AlunoPerfilActions;
