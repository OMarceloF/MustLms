// frontend/src/pages/aluno/materias/materias.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../gestor/components/ui/tabs";
import { EvolucaoDisciplinaTab } from "./evoluca-disciplina-tab";
import { NotasAvaliacoesTab } from "./notas-avaliacoes-tab";
import { ProducaoAcademicaTab } from "./producao-academica-tab";
import { AulasGravadasTab } from "./aulas-gravadas-tab";
import { MateriaisDidaticosTab } from "./materiais-didaticos-tab";
import { InformacoesComplementaresTab } from "./informacoes-complementares-tab";
import { PlanoEnsinoTab } from "./plano-ensino-tab";
import { AvisosTab } from "./avisos-tab";
import SidebarAluno from '../../aluno/components/sidebaraluno';
import TopBarGestor from '../../gestor/components/Navbar';

// A definição do componente começa aqui
export default function MateriaVisualizacaoPage() {
  // ✅ CORREÇÃO: Todos os hooks e a lógica associada foram movidos para dentro do componente.
  const { user } = useAuth();
  const navigate = useNavigate();
  const usuarioId = user?.id ?? 0;

  // Estado para controlar a abertura da sidebar
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleMouseEnter = () => setIsMenuOpen(true);
  const handleMouseLeave = () => setIsMenuOpen(false);

  // Estados e refs para a TopBar
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFeedbackMenuOpen, setIsFeedbackMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);
  const feedbackMenuRef = useRef<HTMLDivElement>(null);

  const [activePage, setActivePage] = useState('curso');

  const handleLogout = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
    await fetch(`${apiUrl}/api/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    // Redireciona o usuário para a página de login
    window.location.href = '/';
  };

  // Carregar notificações
  useEffect(() => {
    const fetchNotifications = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      try {
        const res = await fetch(`${apiUrl}/api/notificacoes/${usuarioId}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error('Erro ao buscar notificações:', err);
      }
    };
    if (usuarioId) {
      fetchNotifications();
    }
  }, [usuarioId]);


  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Sidebar do Aluno */}
      <SidebarAluno
        isMenuOpen={isMenuOpen}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
        setActivePage={setActivePage}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col">
        {/* Navbar Superior */}
        <TopBarGestor
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          isProfileMenuOpen={isProfileMenuOpen}
          setIsProfileMenuOpen={setIsProfileMenuOpen}
          isHelpModalOpen={isHelpModalOpen}
          setIsHelpModalOpen={setIsHelpModalOpen}
          isNotificationsOpen={isNotificationsOpen}
          setIsNotificationsOpen={setIsNotificationsOpen}
          isFeedbackMenuOpen={isFeedbackMenuOpen}
          setIsFeedbackMenuOpen={setIsFeedbackMenuOpen}
          profileMenuRef={profileMenuRef}
          notificationsMenuRef={notificationsMenuRef}
          helpModalRef={helpModalRef}
          feedbackMenuRef={feedbackMenuRef}
          user={user}
          usuarioId={usuarioId}
          notifications={notifications}
          handleLogout={handleLogout}
          setActivePage={setActivePage}
          activePage={activePage}
        />

        <div className="min-h-screen bg-background pt-16">
          <div className="mx-auto max-w-7xl p-6 md:p-8">
            {/* Header */}
            <header className="mb-8 space-y-2">
              <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                Inteligência Artificial Aplicada
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="font-medium">Professor:</span>
                  <span>Dr. Carlos Eduardo Silva</span>
                </span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-medium">Período:</span>
                  <span>2025.1</span>
                </span>
              </div>
            </header>

            {/* Tabs Navigation */}
            <Tabs defaultValue="evolucao" className="space-y-6">
              <TabsList className="inline-flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
                <TabsTrigger value="evolucao" className="text-sm">Evolução</TabsTrigger>
                <TabsTrigger value="notas" className="text-sm">Notas</TabsTrigger>
                <TabsTrigger value="producao" className="text-sm">Produção Acadêmica</TabsTrigger>
                <TabsTrigger value="aulas" className="text-sm">Aulas Gravadas</TabsTrigger>
                <TabsTrigger value="materiais" className="text-sm">Materiais</TabsTrigger>
                <TabsTrigger value="informacoes" className="text-sm">Informações</TabsTrigger>
                <TabsTrigger value="plano" className="text-sm">Plano de Ensino</TabsTrigger>
                <TabsTrigger value="avisos" className="text-sm">Avisos</TabsTrigger>
              </TabsList>

              {/* Tabs Content */}
              <TabsContent value="evolucao" className="mt-6"><EvolucaoDisciplinaTab /></TabsContent>
              <TabsContent value="notas" className="mt-6"><NotasAvaliacoesTab /></TabsContent>
              <TabsContent value="producao" className="mt-6"><ProducaoAcademicaTab /></TabsContent>
              <TabsContent value="aulas" className="mt-6"><AulasGravadasTab /></TabsContent>
              <TabsContent value="materiais" className="mt-6"><MateriaisDidaticosTab /></TabsContent>
              <TabsContent value="informacoes" className="mt-6"><InformacoesComplementaresTab /></TabsContent>
              <TabsContent value="plano" className="mt-6"><PlanoEnsinoTab /></TabsContent>
              <TabsContent value="avisos" className="mt-6"><AvisosTab /></TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
