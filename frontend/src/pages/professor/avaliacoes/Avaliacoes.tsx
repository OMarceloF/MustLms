// frontend/src/pages/professor/Avaliacoes/Avaliacoes.tsx
// --- 1. Importações ---
// Hooks do React e React Router
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Ícones e componentes de UI
import { Plus, Edit, Trash2, FileText, Download, Printer, Eye } from 'lucide-react';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { Checkbox } from '../components/checkbox';
import { Textarea } from '../components/textarea';
import { Label } from '../components/label';
import { Badge } from '../components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/tabs';

// Componentes de Layout que serão integrados
import SidebarProfessor from '../SidebarProfessor';
import TopbarGestorAuto from '../../gestor/components/TopbarGestorAuto';
import Header from '../components/Header';

// --- 2. Interfaces e Tipos ---
interface Question {
    id: number;
    enunciado: string;
    alternativas?: string[];
    respostaCorreta?: number;
    tipo: 'multipla_escolha' | 'dissertativa';
    disciplina: string;
    dificuldade: 'Fácil' | 'Médio' | 'Difícil';
}

// --- 3. Componente Principal ---
const Avaliacoes = () => {
    // --- 4. Lógica de Estado e Navegação (Trazida para dentro do componente) ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activePage, setActivePage] = useState('avaliacoes');
    const navigate = useNavigate();
    const location = useLocation();

    // Função de navegação que a Sidebar e a Topbar usarão
    const handleNavigation = (page: string) => {
        const pageToRoute: { [key: string]: string } = {
            home: '/professor/home',
            avaliacoes: '/avaliacoes/home',
            // Adicione outras rotas da sidebar aqui se precisar
        };
        const route = pageToRoute[page];
        if (route) {
            navigate(route);
        }
    };

    // Efeito para garantir que o menu 'avaliacoes' na sidebar fique ativo
    useEffect(() => {
        if (location.pathname.startsWith('/avaliacoes')) {
            setActivePage('avaliacoes');
        }
    }, [location.pathname]);

    // --- Estados específicos da página de Montagem de Avaliações ---
    const [nomeAvaliacao, setNomeAvaliacao] = useState('');
    const [disciplina, setDisciplina] = useState('');
    const [serie, setSerie] = useState('');
    const [questoes, setQuestoes] = useState<Question[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [novaQuestao, setNovaQuestao] = useState<{
        enunciado: string;
        alternativas: string[];
        respostaCorreta: number;
        tipo: 'multipla_escolha' | 'dissertativa';
        disciplina: string;
        dificuldade: 'Fácil' | 'Médio' | 'Difícil';
    }>({
        enunciado: '',
        alternativas: ['', '', '', ''],
        respostaCorreta: 0,
        tipo: 'multipla_escolha',
        disciplina: '',
        dificuldade: 'Médio'
    });
    const [configuracoes, setConfiguracoes] = useState({
        incluirCabecalho: true,
        numeroVersoes: 1,
        exibirGabarito: true,
        ordenacaoAleatoria: false
    });
    const [visualizacao, setVisualizacao] = useState<'prova' | 'gabarito'>('prova');

    const disciplinas = ['Matemática', 'Português', 'História', 'Geografia', 'Ciências', 'Física', 'Química', 'Biologia'];
    const series = ['6º Ano', '7º Ano', '8º Ano', '9º Ano', '1ª Série', '2ª Série', '3ª Série'];

    const adicionarQuestao = () => {
        if (novaQuestao.enunciado.trim()) {
            const questao: Question = {
                id: Date.now(),
                enunciado: novaQuestao.enunciado,
                alternativas: novaQuestao.tipo === 'multipla_escolha' ? novaQuestao.alternativas : undefined,
                respostaCorreta: novaQuestao.tipo === 'multipla_escolha' ? novaQuestao.respostaCorreta : undefined,
                tipo: novaQuestao.tipo,
                disciplina: novaQuestao.disciplina || disciplina,
                dificuldade: novaQuestao.dificuldade
            };
            setQuestoes([...questoes, questao]);
            setNovaQuestao({
                enunciado: '',
                alternativas: ['', '', '', ''],
                respostaCorreta: 0,
                tipo: 'multipla_escolha',
                disciplina: '',
                dificuldade: 'Médio'
            });
            setModalOpen(false);
        }
    };

    const removerQuestao = (id: number) => {
        setQuestoes(questoes.filter(q => q.id !== id));
    };


    // --- 5. Estrutura JSX Completa (Layout e Conteúdo no mesmo arquivo) ---
    return (
        <div className="flex h-screen bg-gray-100">

            {/* Container principal para o conteúdo à direita */}
            <div className="relative flex-1 flex flex-col lg:pl-[60px] transition-all duration-500">

                {/* Área de Conteúdo com Rolagem Independente */}
        <main className="flex-1 overflow-y-auto pt-32">
                    <div className="container mx-auto px-4 py-8">
                        {/* Título Principal */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">Montagem de Avaliações</h1>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Monte avaliações personalizadas escolhendo questões do banco ou adicionando suas próprias questões.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Área de Montagem */}
                            <div className="space-y-6">
                                {/* Informações Básicas */}
                                <Card className="shadow-soft">
                                    <CardHeader>
                                        <CardTitle className="text-text-primary">Informações da Avaliação</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="nome" className="text-text-primary">Nome da Avaliação</Label>
                                            <Input
                                                id="nome"
                                                value={nomeAvaliacao}
                                                onChange={(e) => setNomeAvaliacao(e.target.value)}
                                                placeholder="Digite o nome da avaliação..."
                                                className="mt-1"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-text-primary">Disciplina</Label>
                                                <Select value={disciplina} onValueChange={setDisciplina}>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Selecionar..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {disciplinas.map(d => (
                                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label className="text-text-primary">Série/Ano</Label>
                                                <Select value={serie} onValueChange={setSerie}>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Selecionar..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {series.map(s => (
                                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full bg-primary hover:bg-brand-hover text-primary-foreground">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Adicionar Questão
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Nova Questão</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 pt-4">
                                                    <div>
                                                        <Label>Tipo de Questão</Label>
                                                        <Select
                                                            value={novaQuestao.tipo}
                                                            onValueChange={(value) =>
                                                                setNovaQuestao({ ...novaQuestao, tipo: value as 'multipla_escolha' | 'dissertativa' })
                                                            }
                                                        >
                                                            <SelectTrigger className="mt-1">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                                                                <SelectItem value="dissertativa">Dissertativa</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <Label>Enunciado</Label>
                                                        <Textarea
                                                            value={novaQuestao.enunciado}
                                                            onChange={(e) => setNovaQuestao({ ...novaQuestao, enunciado: e.target.value })}
                                                            placeholder="Digite o enunciado da questão..."
                                                            className="mt-1 min-h-[100px]"
                                                        />
                                                    </div>

                                                    {novaQuestao.tipo === 'multipla_escolha' && (
                                                        <div className="space-y-3">
                                                            <Label>Alternativas</Label>
                                                            {novaQuestao.alternativas.map((alt, index) => (
                                                                <div key={index} className="flex items-center space-x-2">
                                                                    <input
                                                                        type="radio"
                                                                        name="resposta"
                                                                        checked={novaQuestao.respostaCorreta === index}
                                                                        onChange={() => setNovaQuestao({ ...novaQuestao, respostaCorreta: index })}
                                                                        className="accent-primary"
                                                                    />
                                                                    <Input
                                                                        value={alt}
                                                                        onChange={(e) => {
                                                                            const newAlts = [...novaQuestao.alternativas];
                                                                            newAlts[index] = e.target.value;
                                                                            setNovaQuestao({ ...novaQuestao, alternativas: newAlts });
                                                                        }}
                                                                        placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Dificuldade</Label>
                                                            <Select
                                                                value={novaQuestao.dificuldade}
                                                                onValueChange={(value) =>
                                                                    setNovaQuestao({ ...novaQuestao, dificuldade: value as 'Fácil' | 'Médio' | 'Difícil' })
                                                                }
                                                            >
                                                                <SelectTrigger className="mt-1">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Fácil">Fácil</SelectItem>
                                                                    <SelectItem value="Médio">Médio</SelectItem>
                                                                    <SelectItem value="Difícil">Difícil</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    <Button onClick={adicionarQuestao} className="w-full bg-primary hover:bg-brand-hover">
                                                        Adicionar Questão
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                </Card>

                                {/* Lista de Questões */}
                                <Card className="shadow-soft">
                                    <CardHeader>
                                        <CardTitle className="text-text-primary">Questões Adicionadas ({questoes.length})</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {questoes.length === 0 ? (
                                            <p className="text-text-secondary text-center py-8">Nenhuma questão adicionada ainda.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {questoes.map((questao, index) => (
                                                    <div key={questao.id} className="border border-surface-border rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Questão {index + 1}
                                                                    </Badge>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {questao.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 'Dissertativa'}
                                                                    </Badge>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {questao.dificuldade}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-text-primary text-sm">
                                                                    {questao.enunciado.length > 100
                                                                        ? `${questao.enunciado.substring(0, 100)}...`
                                                                        : questao.enunciado}
                                                                </p>
                                                            </div>
                                                            <div className="flex space-x-2 ml-4">
                                                                <Button variant="outline" size="sm">
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => removerQuestao(questao.id)}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Configurações */}
                                <Card className="shadow-soft">
                                    <CardHeader>
                                        <CardTitle className="text-text-primary">Configurações da Prova</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="cabecalho"
                                                checked={configuracoes.incluirCabecalho}
                                                onCheckedChange={(checked) =>
                                                    setConfiguracoes({ ...configuracoes, incluirCabecalho: !!checked })
                                                }
                                            />
                                            <Label htmlFor="cabecalho" className="text-text-primary">
                                                Incluir cabeçalho da instituição
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="gabarito"
                                                checked={configuracoes.exibirGabarito}
                                                onCheckedChange={(checked) =>
                                                    setConfiguracoes({ ...configuracoes, exibirGabarito: !!checked })
                                                }
                                            />
                                            <Label htmlFor="gabarito" className="text-text-primary">
                                                Exibir gabarito no final
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="aleatorio"
                                                checked={configuracoes.ordenacaoAleatoria}
                                                onCheckedChange={(checked) =>
                                                    setConfiguracoes({ ...configuracoes, ordenacaoAleatoria: !!checked })
                                                }
                                            />
                                            <Label htmlFor="aleatorio" className="text-text-primary">
                                                Ordenar questões aleatoriamente
                                            </Label>
                                        </div>

                                        <div>
                                            <Label className="text-text-primary">Número de versões</Label>
                                            <Select
                                                value={configuracoes.numeroVersoes.toString()}
                                                onValueChange={(value) =>
                                                    setConfiguracoes({ ...configuracoes, numeroVersoes: parseInt(value) })
                                                }
                                            >
                                                <SelectTrigger className="mt-1 w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[1, 2, 3, 4].map(n => (
                                                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Botões de Ação */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Button className="bg-primary hover:bg-brand-hover text-primary-foreground">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Gerar Prova
                                    </Button>
                                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                                        <Download className="mr-2 h-4 w-4" />
                                        Gerar Gabarito
                                    </Button>
                                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                                        <Printer className="mr-2 h-4 w-4" />
                                        Imprimir
                                    </Button>
                                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Pré-visualizar
                                    </Button>
                                </div>
                            </div>

                            {/* Área de Pré-visualização */}
                            <div>
                                <Card className="shadow-medium h-[800px]">
                                    <CardHeader className="border-b border-surface-border">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-text-primary">Pré-visualização</CardTitle>
                                            <Tabs value={visualizacao} onValueChange={(value) => setVisualizacao(value as 'prova' | 'gabarito')}>
                                                <TabsList>
                                                    <TabsTrigger value="prova">Prova</TabsTrigger>
                                                    <TabsTrigger value="gabarito">Gabarito</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 h-full overflow-auto bg-white">
                                        {questoes.length === 0 ? (
                                            <div className="flex items-center justify-center h-full text-text-secondary">
                                                <div className="text-center">
                                                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                                    <p>A pré-visualização aparecerá aqui quando você adicionar questões.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {/* Cabeçalho da Prova */}
                                                {configuracoes.incluirCabecalho && (
                                                    <div className="text-center border-b border-surface-border pb-6 mb-6">
                                                        <h2 className="text-xl font-bold text-text-primary mb-2">
                                                            [Logo da Instituição]
                                                        </h2>
                                                        <h3 className="text-lg font-semibold text-text-primary mb-4">
                                                            {nomeAvaliacao || 'Nome da Avaliação'}
                                                        </h3>
                                                        <div className="flex justify-between text-sm text-text-secondary">
                                                            <span>Disciplina: {disciplina || '______'}</span>
                                                            <span>Série: {serie || '______'}</span>
                                                            <span>Data: ___/___/___</span>
                                                        </div>
                                                        <div className="mt-4 text-sm text-text-secondary">
                                                            Nome do Aluno: ________________________________
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Questões */}
                                                {visualizacao === 'prova' && (
                                                    <div className="space-y-6">
                                                        {questoes.map((questao, index) => (
                                                            <div key={questao.id} className="border-l-4 border-primary pl-4">
                                                                <div className="mb-3">
                                                                    <span className="font-semibold text-text-primary">
                                                                        {index + 1}. {questao.enunciado}
                                                                    </span>
                                                                </div>
                                                                {questao.tipo === 'multipla_escolha' && questao.alternativas && (
                                                                    <div className="ml-4 space-y-2">
                                                                        {questao.alternativas.map((alt, altIndex) => (
                                                                            <div key={altIndex} className="flex items-start">
                                                                                <span className="text-text-primary mr-2 mt-1">
                                                                                    {String.fromCharCode(65 + altIndex)})
                                                                                </span>
                                                                                <span className="text-text-secondary">{alt || '[Alternativa não preenchida]'}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {questao.tipo === 'dissertativa' && (
                                                                    <div className="mt-4 space-y-2">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <div key={i} className="border-b border-surface-border h-6"></div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Gabarito */}
                                                {visualizacao === 'gabarito' && configuracoes.exibirGabarito && (
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold text-text-primary border-b border-surface-border pb-2">
                                                            Gabarito
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {questoes.map((questao, index) => (
                                                                <div key={questao.id} className="flex justify-between items-center p-2 bg-surface-secondary rounded">
                                                                    <span className="font-medium text-text-primary">Questão {index + 1}:</span>
                                                                    <span className="text-text-secondary">
                                                                        {questao.tipo === 'multipla_escolha' && questao.respostaCorreta !== undefined
                                                                            ? String.fromCharCode(65 + questao.respostaCorreta)
                                                                            : 'Dissertativa'
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Avaliacoes;