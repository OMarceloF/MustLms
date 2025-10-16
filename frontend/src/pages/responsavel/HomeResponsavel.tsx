import Card from '../../components/Card';
import {
  BarChart2,
  Calendar,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import '../../styles/Responsavel.css';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useRef, useState } from 'react';
import HelpModal from '../../components/AjudaModal';

function HomePage({ setActivePage }: { setActivePage: React.Dispatch<React.SetStateAction<string>> }) {
    const { user, loading } = useAuth();
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
        const helpModalRef = useRef<HTMLDivElement>(null);
    
      useEffect(() => {
        const handleClickOutsideHelpModal = (event: MouseEvent) => {
          if (helpModalRef.current && !helpModalRef.current.contains(event.target as Node)) {
            setIsHelpModalOpen(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutsideHelpModal);
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutsideHelpModal);
        };
      }, []);
  
    if (loading) return <p>Carregando...</p>;
    
    return (
      <div className="home-container">
        <h1>Olá, {user.nome}!</h1>
        <h3>Módulos Principais</h3>
        <div className="cards-container">
          <Card icon={<HelpCircle size={40} />} title="Ajuda" onClick={() => setIsHelpModalOpen(true)}/>
          <Card icon={<MessageCircle size={40} />} title="Comunicação" onClick={() => setActivePage('comunicacao')} />
          <Card icon={<BarChart2 size={40} />} title="Desempenho" onClick={() => setActivePage('desempenho')} />
          <Card icon={<Calendar size={40} />} title="Calendário" onClick={() => setActivePage('calendario')} />
        </div>
        <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} ref={helpModalRef}/>
      </div>
    );
  }

  export default HomePage