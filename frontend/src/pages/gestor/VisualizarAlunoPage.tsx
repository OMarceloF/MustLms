// src/pages/VisualizarAlunoPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { User, FileText, BookOpen, Briefcase, Download, Loader2 } from 'lucide-react';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import SidebarGestor from "./components/Sidebar";

// --- Interfaces (Atualizadas para corresponder ao backend) ---
interface AlunoDetalhes {
    id: number;
    nome: string;
    cpf: string;
    matricula: string;
    email: string;
    foto: string | null;
    biografia: string | null;
    telefone: string | null;
    endereco: { logradouro: string; numero: string; bairro: string; cidade: string; uf: string; cep: string; } | null;
    data_nascimento: string;
    genero: string;
    status: string;
    curso_nome: string | null;
    turma_ingresso_nome: string | null;
}

interface Nota {
    tipo: string;
    valor: number;
    nota: number | null;
}

interface Disciplina {
    id: number;
    nome: string;
    notas: Nota[];
    nota_final: number;
    nota_recuperacao: number | null;
    status: 'Aprovado' | 'Reprovado' | 'Em Andamento' | 'Pendente';
}

interface DadosAcademicos {
    [semestre: string]: Disciplina[];
}

interface Documento {
    tipo_documento: string;
    caminho_arquivo: string;
    nome_original: string;
    data_upload: string;
}

interface Contrato {
    id: number;
    nome_contrato: string;
    tipo: string;
    situacao_contrato: string;
    contrato_url: string | null;
    criado_em: string;
}

interface AlunoCompleto {
    aluno: AlunoDetalhes;
    academico: DadosAcademicos;
    documentos: Documento[];
    contratos: Contrato[];
}

const VisualizarAlunoPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [alunoCompleto, setAlunoCompleto] = useState<AlunoCompleto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'geral' | 'academico' | 'documentos' | 'contratos'>('geral');
    const [sidebarAberta, setSidebarAberta] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchAlunoData = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const response = await axios.get<AlunoCompleto>(`/api/alunos/${id}/detalhes-completos`);
                setAlunoCompleto(response.data);
            } catch (error) {
                console.error("Erro ao buscar detalhes do aluno:", error);
                toast.error("Não foi possível carregar os dados do aluno.");
                navigate('/gestor/alunos');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAlunoData();
    }, [id, navigate]);

    // =======================================================================
    // FUNÇÕES DE RENDERIZAÇÃO (Lógica de cálculo foi removida)
    // =======================================================================
    const renderEndereco = (endereco: AlunoDetalhes['endereco']) => {
        if (!endereco) return "Não informado";
        return `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade}/${endereco.uf}, CEP: ${endereco.cep}`;
    };

    const TabButton = ({ tabName, label, icon: Icon }: { tabName: typeof activeTab, label: string, icon: React.ElementType }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${activeTab === tabName
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!alunoCompleto) {
        return (
            <div className="text-center mt-10 p-4">
                <p className="text-red-500">Dados do aluno não encontrados.</p>
            </div>
        );
    }

    const { aluno, academico, documentos, contratos } = alunoCompleto;

    return (
        <div className="min-h-screen bg-gray-100 w-full min-w-0 overflow-x-hidden">
            <div className="flex flex-col md:flex-row w-full min-w-0 md:flex">
                <SidebarGestor
                    isMenuOpen={sidebarAberta}
                    setActivePage={(page: string) => navigate('/gestor', { state: { activePage: page } })}
                    handleMouseEnter={() => setSidebarAberta(true)}
                    handleMouseLeave={() => setSidebarAberta(false)}
                />
                <div className="flex-1 min-w-0 flex flex-col">
                    <TopbarGestorAuto
                        isMenuOpen={sidebarAberta}
                        setIsMenuOpen={setSidebarAberta}
                    />
                    <main className={`flex-1 transition-all duration-500 pt-20 ${isMenuOpen ? 'sm:ml-[220px]' : 'sm:ml-[60px]'}`}>
                        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                                {/* --- Cabeçalho do Aluno --- */}
                                <div className="p-6 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-center gap-6">
                                    <img
                                        src={aluno.foto ? `${import.meta.env.VITE_API_URL}${aluno.foto}` : `https://ui-avatars.com/api/?name=${aluno.nome.replace(' ', '+'  )}&background=e0e7ff&color=4f46e5`}
                                        alt={`Foto de ${aluno.nome}`}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                    />
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-800">{aluno.nome}</h1>
                                        <p className="text-md text-gray-500">Matrícula: {aluno.matricula}</p>
                                        <p className="text-md text-indigo-600 font-semibold">{aluno.curso_nome || "Curso não vinculado"}</p>
                                    </div>
                                </div>

                                {/* --- Abas de Navegação --- */}
                                <div className="border-b border-gray-200 px-6">
                                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                        <TabButton tabName="geral" label="Dados Gerais" icon={User} />
                                        <TabButton tabName="academico" label="Acadêmico" icon={BookOpen} />
                                        <TabButton tabName="documentos" label="Documentos" icon={FileText} />
                                        <TabButton tabName="contratos" label="Contratos" icon={Briefcase} />
                                    </nav>
                                </div>

                                {/* --- Conteúdo das Abas --- */}
                                <div className="p-6">
                                    {activeTab === 'geral' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Informações Pessoais e de Matrícula</h3>
                                                <p><strong>CPF:</strong> {aluno.cpf}</p>
                                                <p><strong>Email:</strong> {aluno.email}</p>
                                                <p><strong>Telefone:</strong> {aluno.telefone || "Não informado"}</p>
                                                <p><strong>Data de Nascimento:</strong> {new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}</p>
                                                <p><strong>Gênero:</strong> {aluno.genero}</p>
                                                <p><strong>Turma de Ingresso:</strong> {aluno.turma_ingresso_nome || "Não informada"}</p>
                                                <p><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${aluno.status === 'regular' || aluno.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{aluno.status}</span></p>
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Endereço e Biografia</h3>
                                                <p><strong>Endereço:</strong> {renderEndereco(aluno.endereco)}</p>
                                                <p><strong>Biografia:</strong> {aluno.biografia || "Nenhuma biografia fornecida."}</p>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'academico' && (
                                        <div>
                                            {Object.keys(academico).length > 0 ? Object.entries(academico).map(([semestre, disciplinas]) => (
                                                <div key={semestre} className="mb-8">
                                                    <h3 className="text-xl font-bold text-indigo-700 mb-4">{semestre}</h3>
                                                    <div className="space-y-6">
                                                        {/* ADICIONADA VERIFICAÇÃO DE SEGURANÇA AQUI */}
                                                        {disciplinas && disciplinas.map(disciplina => {
                                                            const statusColor = disciplina.status === 'Aprovado' ? 'text-green-600' : disciplina.status === 'Reprovado' ? 'text-red-600' : 'text-gray-500';
                                                            const temRecuperacao = disciplina.nota_recuperacao !== null;
                                                            const temNotasLancadas = disciplina.notas.some(n => n.nota !== null);

                                                            return (
                                                                <div key={disciplina.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                                                    <h4 className="font-semibold text-gray-800">{disciplina.nome}</h4>
                                                                    {disciplina.notas.length > 0 ? (
                                                                        <table className="mt-2 w-full text-sm">
                                                                            <thead className="text-left text-gray-500">
                                                                                <tr>
                                                                                    <th className="py-1 font-medium">Avaliação</th>
                                                                                    <th className="py-1 font-medium text-right">Nota</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {disciplina.notas.map((n, index) => (
                                                                                    <tr key={index} className="border-t">
                                                                                        <td className="py-2">{n.tipo} (Valor: {n.valor})</td>
                                                                                        <td className="py-2 text-right font-medium">
                                                                                            {typeof n.nota === 'number' ? n.nota.toFixed(2) : '—'}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                                
                                                                                <tr className={`border-t ${temRecuperacao ? 'bg-yellow-50' : ''}`}>
                                                                                    <td className="py-2 font-semibold">Nota de Recuperação</td>
                                                                                    <td className={`py-2 text-right font-bold ${temRecuperacao ? 'text-yellow-700' : 'text-gray-500'}`}>
                                                                                        {typeof disciplina.nota_recuperacao === 'number' ? disciplina.nota_recuperacao.toFixed(2) : '—'}
                                                                                    </td>
                                                                                </tr>

                                                                                <tr className="border-t bg-gray-100">
                                                                                    <td className="py-2 font-semibold">Nota Final</td>
                                                                                    <td className="py-2 text-right font-bold text-gray-800">
                                                                                        {temNotasLancadas ? disciplina.nota_final.toFixed(2) : '—'}
                                                                                    </td>
                                                                                </tr>

                                                                                <tr className="border-t bg-gray-100">
                                                                                    <td className="py-2 font-semibold">Status Final</td>
                                                                                    <td className={`py-2 text-right font-bold ${statusColor}`}>
                                                                                        {temNotasLancadas ? disciplina.status : 'Pendente'}
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    ) : <p className="text-sm text-gray-500 mt-2">Nenhuma nota lançada para esta disciplina.</p>}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )) : <p>Nenhuma informação acadêmica encontrada.</p>}
                                        </div>
                                    )}

                                    {activeTab === 'documentos' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {documentos.length > 0 ? documentos.map((doc, index) => (
                                                <div key={index} className="bg-gray-50 border rounded-lg p-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-700">{doc.tipo_documento.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                                                        <p className="text-xs text-gray-500 truncate" title={doc.nome_original}>{doc.nome_original}</p>
                                                    </div>
                                                    <a href={`${import.meta.env.VITE_API_URL}${doc.caminho_arquivo}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                                        <Download size={20} />
                                                    </a>
                                                </div>
                                            )) : <p>Nenhum documento encontrado.</p>}
                                        </div>
                                    )}

                                    {activeTab === 'contratos' && (
                                        <div className="space-y-4">
                                            {contratos.length > 0 ? contratos.map(contrato => (
                                                <div key={contrato.id} className="bg-gray-50 border rounded-lg p-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-700">{contrato.nome_contrato}</p>
                                                        <p className="text-sm text-gray-500">
                                                            Situação: <span className="font-medium">{contrato.situacao_contrato}</span>
                                                        </p>
                                                    </div>
                                                    {contrato.contrato_url && (
                                                        <a href={`${import.meta.env.VITE_API_URL}${contrato.contrato_url}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                                            <Download size={20} />
                                                        </a>
                                                    )}
                                                </div>
                                            )) : <p>Nenhum contrato encontrado.</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default VisualizarAlunoPage;
