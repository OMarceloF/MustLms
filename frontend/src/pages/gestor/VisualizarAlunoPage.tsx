// src/pages/VisualizarAlunoPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { User, FileText, BookOpen, Briefcase, Download, Loader2, RefreshCw } from 'lucide-react';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import SidebarGestor from "./components/Sidebar";

// --- Interfaces ---
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
    status: 'Aprovado' | 'Reprovado' | 'Cursando' | 'Pendente' | 'Não Cursado' | 'Trancado';
    status_vinculo: string | null;
}

interface DadosAcademicos {
    [semestre: string]: Disciplina[];
}

interface Documento {
    id: number;
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


    useEffect(() => {
        fetchAlunoData();
    }, [id, navigate]);


    const handleUpdateDocument = async (documentoId: number, file: File) => {
        if (!file) {
            toast.info("Nenhum arquivo selecionado.");
            return;
        }

        const formData = new FormData();
        formData.append('documento', file);

        toast.loading("Atualizando documento...");

        try {
            // Ajuste a URL da API conforme necessário
            await axios.post(`/api/alunos/${id}/documentos/${documentoId}/atualizar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.dismiss();
            toast.success("Documento atualizado com sucesso!");

            // Recarrega os dados para mostrar o documento atualizado
            fetchAlunoData();

        } catch (error) {
            toast.dismiss();
            console.error("Erro ao atualizar documento:", error);
            toast.error("Falha ao atualizar o documento.");
        }
    };

    const triggerFileInput = (documentoId: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        // Opcional: defina os tipos de arquivo aceitos
        input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                handleUpdateDocument(documentoId, target.files[0]);
            }
        };
        input.click();
    };

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

    // Função auxiliar para definir a cor do badge de status
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Aprovado': return 'bg-green-100 text-green-800 border-green-200';
            case 'Reprovado': return 'bg-red-100 text-red-800 border-red-200';
            case 'Cursando': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Trancado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Não Cursado':
            default: return 'bg-gray-100 text-gray-500 border-gray-200';
        }
    };

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
                <p className="text-red-500">Dados do aluno não encontrados. Verifique o console para mais detalhes.</p>
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
                                        src={aluno.foto ? `${import.meta.env.VITE_API_URL}${aluno.foto}` : `https://ui-avatars.com/api/?name=${aluno.nome.replace(' ', '+'   )}&background=e0e7ff&color=4f46e5`}
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
                                            {Object.keys(academico).length > 0 ? Object.entries(academico).sort().map(([semestre, disciplinas]) => (
                                                <div key={semestre} className="mb-8">
                                                    <h3 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2">{semestre}</h3>
                                                    <div className="space-y-4">
                                                        {disciplinas && disciplinas.map(disciplina => {
                                                            const temNotasLancadas = disciplina.notas.length > 0;
                                                            const badgeColor = getStatusBadge(disciplina.status);
                                                            
                                                            // CORREÇÃO: Calcula a soma das notas regulares
                                                            const somaNotas = disciplina.notas.reduce((acc, curr) => acc + (curr.nota || 0), 0);
                                                            
                                                            // CORREÇÃO: Só mostra recuperação se a nota for menor que 60 E existir nota de rec.
                                                            const temRecuperacao = disciplina.nota_recuperacao !== null && somaNotas < 60;

                                                            // Lógica de vínculo (mantida da iteração anterior para exibir disciplinas não cursadas corretamente)
                                                            const isMatriculado = disciplina.status_vinculo || 
                                                                ['Aprovado', 'Reprovado', 'Cursando', 'Recuperação', 'Trancado'].includes(disciplina.status);

                                                            return (
                                                                <div key={disciplina.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                                                    {/* Cabeçalho da Disciplina com Status */}
                                                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                                                        <h4 className="font-semibold text-gray-800">{disciplina.nome}</h4>
                                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${badgeColor}`}>
                                                                            {disciplina.status}
                                                                        </span>
                                                                    </div>

                                                                    <div className="p-4">
                                                                        {isMatriculado ? (
                                                                            <div className="overflow-x-auto">
                                                                                <table className="w-full text-sm">
                                                                                    <thead>
                                                                                        <tr className="text-left text-gray-500 border-b">
                                                                                            <th className="pb-2 font-medium w-1/2">Avaliação</th>
                                                                                            <th className="pb-2 font-medium text-right">Valor</th>
                                                                                            <th className="pb-2 font-medium text-right">Nota</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-gray-100">
                                                                                        {temNotasLancadas ? (
                                                                                            disciplina.notas.map((n, index) => (
                                                                                                <tr key={index}>
                                                                                                    <td className="py-2 text-gray-700">{n.tipo}</td>
                                                                                                    <td className="py-2 text-right text-gray-500">{n.valor}</td>
                                                                                                    <td className="py-2 text-right font-medium text-gray-800">
                                                                                                        {typeof n.nota === 'number' ? n.nota.toFixed(1) : '—'}
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ))
                                                                                        ) : (
                                                                                            <tr>
                                                                                                <td colSpan={3} className="py-4 text-center text-gray-400 italic">
                                                                                                    Ainda não há notas lançadas.
                                                                                                </td>
                                                                                            </tr>
                                                                                        )}

                                                                                        {/* Linha de Recuperação - Exibição Condicional Corrigida */}
                                                                                        {temRecuperacao && (
                                                                                            <tr className="bg-yellow-50">
                                                                                                <td className="py-2 text-yellow-700 font-medium">Recuperação</td>
                                                                                                <td className="py-2 text-right text-yellow-600">—</td>
                                                                                                <td className="py-2 text-right font-bold text-yellow-700">
                                                                                                    {disciplina.nota_recuperacao?.toFixed(1)}
                                                                                                </td>
                                                                                            </tr>
                                                                                        )}
                                                                                    </tbody>
                                                                                    {/* Rodapé Nota Final */}
                                                                                    <tfoot className="bg-gray-50 border-t border-gray-200">
                                                                                        <tr>
                                                                                            <td colSpan={2} className="py-2 pl-2 font-bold text-gray-700 text-right pr-4">Nota Final:</td>
                                                                                            <td className={`py-2 text-right font-bold pr-1 ${disciplina.nota_final >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                                {disciplina.nota_final.toFixed(1)}
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tfoot>
                                                                                </table>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                                                                                <BookOpen size={16} />
                                                                                <p>Aluno ainda não matriculado nesta disciplina.</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )) : <div className="text-center py-10 text-gray-500">Nenhuma informação acadêmica encontrada na grade curricular.</div>}
                                        </div>
                                    )}

                                    {activeTab === 'documentos' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {documentos.length > 0 ? documentos.map((doc) => (
                                                <div key={doc.id} className="bg-gray-50 border rounded-lg p-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-700">{doc.tipo_documento.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                                                        <p className="text-xs text-gray-500 truncate" title={doc.nome_original}>{doc.nome_original}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => triggerFileInput(doc.id)}
                                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                                            title="Atualizar Documento"
                                                        >
                                                            <RefreshCw size={20} />
                                                        </button>
                                                        <a
                                                            href={`${import.meta.env.VITE_API_URL}${doc.caminho_arquivo}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-indigo-600 hover:text-indigo-800"
                                                            title="Baixar Documento"
                                                        >
                                                            <Download size={20} />
                                                        </a>
                                                    </div>
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