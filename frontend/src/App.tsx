import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from './pages/gestor/components/ui/toaster';
import { Toaster as Sonner } from './pages/gestor/components/ui/sonner';
import { TooltipProvider } from '@radix-ui/react-tooltip';

// Hooks e Componentes de Rota
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './routes/ProtectedRoute';
import BoletimProtectedRoute from './routes/BoletimProtectedRoute';

// Páginas Principais
import Login from './pages/Login';
import Gestor from './pages/Gestor';
import Professor from './pages/Professor';
import Aluno from './pages/Aluno';
import Responsavel from './pages/Responsavel';
import Financeiro from './pages/Financeiro';

// Páginas do Gestor
import HomeGestor from './pages/gestor/HomeGestor';
import CriarProfessor from './pages/gestor/CriarProfessorPage';
import CriarAluno from './pages/gestor/CriarAlunoPage';
import CriarResponsavel from './pages/gestor/CriarResponsavelPage';
import CriarCalendario from './pages/gestor/CriarCalendarioPage';
import CriarTurma from './pages/gestor/CriarTurmaPage';
import CriarMateria from './pages/gestor/CriarMateriaPage';
import MateriaisDisponiveis from './pages/gestor/MateriaisDisponiveisPage';
import VisualizarProfessorPage from './pages/gestor/VisualizarProfessorPage';
import EditarProfessorPage from './pages/gestor/EditarProfessorPage';
import EditarTurmaPage from './pages/gestor/EditarTurmaPage';
import GestaoEscolarPage from './pages/gestor/GestaoEscolarPage';
import CalendarioPage from './pages/gestor/CalendarioPage';
import CalendarioDetalhePage from './pages/gestor/CalendarioDetalhePage';
import EditarMateriaPage from './pages/gestor/EditarMateriaPage';
import CriarAnunciosPage from './pages/gestor/CriarAnunciosPage';
import AnunciosPage from './pages/gestor/AnunciosPage';
import DetalhesAnunciosPage from './pages/gestor/DetalhesAnunciosPage';
import LancamentosPage from './pages/gestor/LancamentosPage';
import RelatorioProfessorPage from './pages/gestor/RelatorioProfessorPage';
import RelatorioAlunoPage from './pages/gestor/RelatorioAlunoPage';
import ConfiguracoesGestorPage from './pages/gestor/ConfiguracoesGestorPage';

// Páginas do Professor
import ConfiguracoesProfessorPage from './pages/professor/ConfiguracoesProfessorPage';
import ProfessorEnvios from './pages/professor/EnvioProfessor';

// Páginas de Avaliações (Compartilhadas)
import HomeAvaliacoes from './pages/professor/avaliacoes/HomeAvaliacoes';
import Avaliacoes from './pages/professor/avaliacoes/Avaliacoes';
import BancoQuestoes from './pages/professor/avaliacoes/BancoQuestoes';
import PerfilAvaliacoes from './pages/professor/avaliacoes/PerfilAvaliacoes';

// Páginas do Aluno
import EnviosdeProfessoresPage from './pages/aluno/EnviosdeProfessoresPage';
import ConfiguracoesAlunoPage from './pages/aluno/ConfiguracoesAlunoPage';
import Simulados from './pages/aluno/Simulados';
import ExercicioOnlinePage from './pages/aluno/ExercicioOnlinePage';
import IaAlunoPage from './pages/aluno/IaAlunoPage';

// Páginas do Responsável
import EscolhaAlunoResponsavelPage from './pages/gestor/EscolhaAlunoResponsavelPage';
import ConfiguracoesResponsavelPage from './pages/responsavel/ConfiguracoesResponsavelPage';

// Páginas do Financeiro
import FichaFinanceiraAluno from './pages/financeiro/FichaFinanceiraAluno';
import Contratos from './pages/financeiro/Contratos';
import ConfiguracoesFinanceiroPage from './pages/financeiro/ConfiguracoesFinanceiroPage';

// Páginas Compartilhadas/Mistas
import MateriasPage from './pages/gestor/MateriasPage';
import VisualizarAlunoPage from './pages/gestor/VisualizarAlunoPage';
import VisualizarTurmaPage from './pages/gestor/VisualizarTurmasPage';
import EditarAlunoPage from './pages/gestor/EditarAlunoPage';
import GestaoAluno from './pages/gestor/GestaoAluno';
import AvaliacoesNotasPage from './pages/gestor/AvaliacoesNotasPage';
import DiarioPage from './pages/gestor/DiarioPage';
import HorarioTurma from './pages/gestor/HorarioTurmaPage';
import EventosPageMenu from './pages/gestor/EventosPageMenu';
import FeedsPageMenu from './pages/gestor/FeedsPageMenu';
import ComunidadesPageMenu from './pages/gestor/ComunidadesPageMenu';
import NoticiasPageMenu from './pages/gestor/NoticiasPageMenu';
import PostPageMenu from './pages/gestor/PostPageMenu';
import FeedPrincipalMenuPage from './pages/gestor/FeedPrincipalMenuPage';
import JogoLetras from './pages/gestor/JogoLetras';
import WordSearchGame from './pages/gestor/WordSearchGame';
import TurmasPage from './pages/gestor/TurmasPage';
import AlunosPage from './pages/gestor/AlunosPage';
import IaPage from './pages/gestor/IaPage';
import ProfessorLayout from './pages/professor/ProfessorLayout';
import ConfiguracoesPage from './pages/gestor/configuracoes/configuracoes-page';


const queryClient = new QueryClient();

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota Pública */}
            <Route path="/" element={<Login />} />

            {/* Rotas Exclusivas do Gestor */}
            <Route element={<ProtectedRoute allowedRoles={['gestor']} />}>
              <Route path="/gestor" element={<Gestor />} />
              <Route path="/gestor/home" element={<HomeGestor />} />
              <Route path="/gestor/criarProfessor" element={<CriarProfessor />} />
              <Route path="/gestor/criarAluno" element={<CriarAluno />} />
              <Route path="/gestor/criarResponsavel" element={<CriarResponsavel />} />
              <Route path="/gestor/criarMateria" element={<CriarMateria />} />
              <Route path="/gestor/materiaisDisponiveis" element={<MateriaisDisponiveis />} />
              <Route path="/gestor/editarMateria/:id" element={<EditarMateriaPage />} />
              <Route path="/gestor/criarCalendario" element={<CriarCalendario />} />
              <Route path="/gestor/calendarios" element={<CalendarioPage />} />
              <Route path="/gestor/calendario/:id" element={<CalendarioDetalhePage />} />
              <Route path="/gestor/configuracoes" element={<ConfiguracoesGestorPage />} />
              <Route path="/gestor/configuracoes-sistema" element={<ConfiguracoesPage />} />
              <Route path="/gestor/professores/:id/editar" element={<EditarProfessorPage />} />
              <Route path="/gestor/turmas/:turmaId/materias/:materiaId/avaliacoes-notas" element={<AvaliacoesNotasPage />} />
              <Route path="/gestor/turmas/:turmaId/materias/:materiaId/diario" element={<DiarioPage />} />
              <Route path="/gestor/materias/:id" element={<MateriasPage />} />
              <Route path="/gestor/criarTurma" element={<CriarTurma />} />
              <Route path="/gestor/turmas/:turmaId/adicionar-alunos" element={<TurmasPage />} />
              <Route path="/gestor/turmas/:id/editar" element={<EditarTurmaPage />} />
              <Route path="/gestor/materias" element={<GestaoEscolarPage />} />
              <Route path="/gestor/professores/:id/visualizar" element={<VisualizarProfessorPage />} />
              <Route path="/gestor/:id/visualizar" element={<VisualizarTurmaPage />} />
              <Route path="/gestor/eventos" element={<EventosPageMenu />} />
              <Route path="/gestor/feeds" element={<FeedsPageMenu />} />
              <Route path="/gestor/anuncio" element={<AnunciosPage />} />
              <Route path="/gestor/anuncio/novo" element={<CriarAnunciosPage />} />
              <Route path="/gestor/anuncio/:id/visualizar" element={<DetalhesAnunciosPage />} />
              <Route path="/gestor/professores/:id/relatorio" element={<RelatorioProfessorPage />} />
              <Route path="/gestor/alunos/:id/relatorio" element={<RelatorioAlunoPage />} />
              <Route path="/gestor/financeiro/lancamento" element={<LancamentosPage />} />
              <Route path="/gestor/financeiro/ficha-aluno" element={<FichaFinanceiraAluno />} />
              <Route path="/gestor/financeiro/contratos" element={<Contratos />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['professor', 'gestor']} />}>
              <Route path="/professor" element={<ProfessorLayout />}>

                {/* A rota /professor/home renderiza o componente Professor dentro do Layout */}
                <Route path="home" element={<Professor />} />
                <Route path="/professor/turmas/:id/visualizar" element={<VisualizarTurmaPage />} />
                <Route path="/professor/turmas/:turmaId/materias/:materiaId/diario" element={<DiarioPage />} />
                <Route path="/professor/turmas/:turmaId/materias/:materiaId/avaliacoes-notas" element={<AvaliacoesNotasPage />} />

                {/* Outras rotas filhas do layout do professor */}
                <Route path="ia" element={<IaPage />} />
                <Route path="turmas" element={<TurmasPage />} />
                <Route path="alunos" element={<AlunosPage />} />
                <Route path="envio" element={<ProfessorEnvios />} />
                <Route path="configuracoes" element={<ConfiguracoesProfessorPage />} />

                {/* Rotas de Avaliações aninhadas */}
                <Route path="avaliacoes">
                  <Route index element={<HomeAvaliacoes />} /> {/* Acessada via /professor/avaliacoes */}
                  <Route path="montagem" element={<Avaliacoes />} /> {/* /professor/avaliacoes/montagem */}
                  <Route path="banco-questoes" element={<BancoQuestoes />} />
                  <Route path="perfil" element={<PerfilAvaliacoes />} />
                </Route>

                {/* Redirecionamento: se alguém acessar /professor, vai para /professor/home */}
                <Route index element={<Navigate to="home" replace />} />
              </Route>
            </Route>

            {/* Rotas do Aluno */}
            <Route element={<ProtectedRoute allowedRoles={['aluno']} />}>
              <Route path="/aluno" element={<Aluno />} />
              <Route path="/aluno/configuracoes" element={<ConfiguracoesAlunoPage />} />
              <Route path="/aluno/simulados" element={<Simulados />} />
              <Route path="/aluno/ia" element={<IaAlunoPage />} />
            </Route>

            {/* Rotas do Financeiro (Gestor e Financeiro) */}
            <Route element={<ProtectedRoute allowedRoles={['gestor', 'financeiro']} />}>
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/financeiro/configuracoes" element={<ConfiguracoesFinanceiroPage />} />
            </Route>

            {/* Rotas do Responsável (Gestor e Responsável) */}
            <Route element={<ProtectedRoute allowedRoles={['gestor', 'responsavel']} />}>
              <Route path="/responsavel/configuracoes" element={<ConfiguracoesResponsavelPage />} />
            </Route>

            {/* Rotas Abertas a Múltiplos Perfis */}
            <Route element={<ProtectedRoute allowedRoles={['responsavel', 'gestor', 'aluno', 'professor']} />}>
              <Route path="/responsavel" element={<Responsavel />} />
              <Route path="/gestor/alunos/:id/visualizaraluno" element={<VisualizarAlunoPage />} />
              <Route path="/professor/alunos/:id/visualizaraluno" element={<VisualizarAlunoPage />} />


              <Route path="/responsavel/:id/escolheraluno" element={<EscolhaAlunoResponsavelPage />} />
              <Route path="/gestor/feedprincipal" element={<FeedPrincipalMenuPage />} />
              <Route path="/gestor/post" element={<PostPageMenu />} />
              <Route path="/gestor/feedNoticias" element={<NoticiasPageMenu />} />
              <Route path="/gestor/comunidades" element={<ComunidadesPageMenu />} />
              <Route path="/gestor/turmas/horario" element={<HorarioTurma />} />
              <Route path="/aluno/:id/enviosdeprofessores" element={<EnviosdeProfessoresPage />} />
              <Route path="/aluno/:id/exercicioonline/:envioId" element={<ExercicioOnlinePage />} />
              <Route path="/aluno/:id/configurar" element={<EditarAlunoPage />} />
              <Route path="/aluno/:id" element={<VisualizarAlunoPage />} />
            </Route>

            {/* Rotas com Proteção Específica */}
            <Route element={<BoletimProtectedRoute />}>
              <Route path="/gestor/alunos/:id/boletim" element={<GestaoAluno />} />
            </Route>

            {/* Rotas de Jogos */}
            <Route element={<ProtectedRoute allowedRoles={['gestor', 'professor', 'aluno']} />}>
              <Route path="/jogo-letras" element={<JogoLetras />} />
              <Route path="/caca-palavras" element={<WordSearchGame />} />
            </Route>

            {/* Rota de Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
