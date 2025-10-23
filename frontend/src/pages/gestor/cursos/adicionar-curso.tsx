"use client"

import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Importações de UI e hooks (sem alterações)
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useToast } from "../hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"

// Layout e Auth (sem alterações)
import TopBarGestor from "../components/Navbar";
import SidebarGestor from "../components/Sidebar";
import { useAuth } from "../../../hooks/useAuth";

// Interfaces e Mocks (sem alterações)
interface Professor { id: string; nome: string; }
interface Unidade { id: string; nome: string; }
interface CursoFormData {
    nome: string;
    tipo: string;
    area: string;
    cargaHoraria: string;
    duracao: string;
    modalidade: string;
    coordenador: string;
    viceCoordenador: string;
    unidade: string;
    objetivos: string;
    perfilEgresso: string;
    justificativa: string;
    anoInicio: string;
    status: string;
    linkDivulgacao: string;
}
const mockProfessores: Professor[] = [
    { id: "1", nome: "Dr. João Silva" },
    { id: "2", nome: "Dra. Maria Santos" },
    { id: "3", nome: "Dr. Pedro Costa" },
];
const mockUnidades: Unidade[] = [
    { id: "1", nome: "Instituto de Ciências Exatas" },
    { id: "2", nome: "Faculdade de Ciências Humanas" },
    { id: "3", nome: "Centro de Ciências Biológicas" },
];

export default function AdicionarCursoPage() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();

    const isEditMode = Boolean(id);

    const [isLoading, setIsLoading] = useState(isEditMode);
    const [errors, setErrors] = useState<Partial<Record<keyof CursoFormData, string>>>({});
    const [formData, setFormData] = useState<CursoFormData>({
        nome: "", tipo: "", area: "", cargaHoraria: "", duracao: "",
        modalidade: "", coordenador: "", viceCoordenador: "", unidade: "",
        objetivos: "", perfilEgresso: "", justificativa: "", anoInicio: "",
        status: "", linkDivulgacao: "",
    });

    // Estados e Refs do Layout (sem alterações)
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isFeedbackMenuOpen, setIsFeedbackMenuOpen] = useState(false);
    const [activePage, setActivePage] = useState('cursos');
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const notificationsMenuRef = useRef<HTMLDivElement>(null);
    const helpModalRef = useRef<HTMLDivElement>(null);
    const feedbackMenuRef = useRef<HTMLDivElement>(null);

    // *** CORREÇÃO PRINCIPAL AQUI ***
    // Efeito para buscar e MAPEAR CORRETAMENTE os dados do curso
    useEffect(() => {
        if (isEditMode && id) {
            const fetchCursoData = async () => {
                try {
                    const response = await axios.get(`/api/cursos/${id}`);
                    const curso = response.data;
                    
                    // Mapeia os nomes do banco de dados para os nomes do estado `formData`
                    setFormData({
                        nome: curso.nome || "",
                        tipo: curso.tipo || "",
                        area: curso.area_conhecimento || "", // Correção: de 'area_conhecimento' para 'area'
                        cargaHoraria: String(curso.carga_horaria || ""), // Correção: de 'carga_horaria' para 'cargaHoraria'
                        duracao: String(curso.duracao_semestres || ""), // Correção: de 'duracao_semestres' para 'duracao'
                        modalidade: curso.modalidade || "",
                        coordenador: String(curso.coordenador_id || ""), // Correção: de 'coordenador_id' para 'coordenador'
                        viceCoordenador: String(curso.vice_coordenador_id || ""), // Correção: de 'vice_coordenador_id' para 'viceCoordenador'
                        unidade: String(curso.unidade_id || ""), // Correção: de 'unidade_id' para 'unidade'
                        objetivos: curso.objetivos || "",
                        perfilEgresso: curso.perfil_egresso || "", // Correção: de 'perfil_egresso' para 'perfilEgresso'
                        justificativa: curso.justificativa || "",
                        anoInicio: String(curso.ano_inicio || ""), // Correção: de 'ano_inicio' para 'anoInicio'
                        status: curso.status || "",
                        linkDivulgacao: curso.link_divulgacao || "", // Correção: de 'link_divulgacao' para 'linkDivulgacao'
                    });
                } catch (error) {
                    console.error("Erro ao buscar dados do curso:", error);
                    toast({ title: "Erro", description: "Não foi possível carregar os dados para edição.", variant: "destructive" });
                    navigate("/gestaocurso");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCursoData();
        }
    }, [id, isEditMode, navigate, toast]);

    const handleInputChange = (field: keyof CursoFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CursoFormData, string>> = {};
        if (!formData.nome.trim()) newErrors.nome = "Nome do curso é obrigatório";
        // Adicione outras validações conforme necessário
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast({
                title: "Erro de validação",
                description: "Por favor, preencha todos os campos obrigatórios.",
                variant: "destructive",
            });
            return;
        }

        try {
            if (isEditMode) {
                // No modo de edição, a requisição PUT já envia o `formData` com as chaves corretas (camelCase)
                await axios.put(`/api/cursos/${id}`, formData);
                toast({
                    title: "Curso atualizado com sucesso!",
                    description: `O curso "${formData.nome}" foi modificado.`,
                });
            } else {
                // No modo de adição, a requisição POST também envia o `formData`
                await axios.post('/api/cursos/adicionar', formData);
                toast({
                    title: "Curso cadastrado com sucesso!",
                    description: `O curso "${formData.nome}" foi adicionado ao sistema.`,
                });
            }
            navigate("/gestaocurso"); 
        } catch (error) {
            console.error(`Erro ao salvar curso (modo ${isEditMode ? 'edição' : 'adição'}):`, error);
            toast({
                title: `Erro ao ${isEditMode ? 'atualizar' : 'salvar'} curso`,
                description: "Ocorreu um erro ao processar sua solicitação. Verifique o console para mais detalhes.",
                variant: "destructive",
            });
        }
    };

    const handleCancel = () => navigate("/gestaocurso");
    const handleLogout = () => navigate('/');

    if (!user) return <div>Carregando...</div>;
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <TopBarGestor
                isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}
                isProfileMenuOpen={isProfileMenuOpen} setIsProfileMenuOpen={setIsProfileMenuOpen}
                isHelpModalOpen={isHelpModalOpen} setIsHelpModalOpen={setIsHelpModalOpen}
                isNotificationsOpen={isNotificationsOpen} setIsNotificationsOpen={setIsNotificationsOpen}
                isFeedbackMenuOpen={isFeedbackMenuOpen} setIsFeedbackMenuOpen={setIsFeedbackMenuOpen}
                profileMenuRef={profileMenuRef} notificationsMenuRef={notificationsMenuRef}
                helpModalRef={helpModalRef} feedbackMenuRef={feedbackMenuRef}
                user={user} handleLogout={handleLogout}
                setActivePage={setActivePage} activePage={activePage}
                usuarioId={user.id} notifications={[]}
            />

            <div className="flex flex-1">
                <SidebarGestor
                    isMenuOpen={isMenuOpen} setActivePage={setActivePage}
                    handleMouseEnter={() => setIsMenuOpen(true)}
                    handleMouseLeave={() => setIsMenuOpen(false)}
                />

                <main className={`flex-1 transition-all duration-500 pt-20 ${isMenuOpen ? 'sm:ml-[220px]' : 'sm:ml-[60px]'}`}>
                    <div className="mx-auto max-w-4xl p-8">
                        <Button variant="ghost" onClick={handleCancel} className="mb-6 hover:bg-muted">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>

                        <div className="mb-8">
                            <h1 className="text-4xl font-bold tracking-tight text-foreground">
                                {isEditMode ? "Editar Curso" : "Adicionar Novo Curso"}
                            </h1>
                            <p className="mt-2 text-lg text-muted-foreground">
                                {isEditMode 
                                    ? "Altere as informações institucionais e pedagógicas do curso."
                                    : "Cadastre as informações institucionais e pedagógicas do curso de pós-graduação."
                                }
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card className="border-border bg-card shadow-sm">
                                <CardContent className="p-8">
                                    {/* O formulário abaixo permanece inalterado, pois ele lê do estado `formData`, que agora é preenchido corretamente. */}
                                    
                                     {/* Informações Básicas */}
                                    <div className="mb-8">
                                        <h2 className="mb-6 text-2xl font-semibold text-foreground">Informações Básicas</h2>
                                        <div className="grid gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="nome" className="text-foreground">Nome do Curso <span className="text-destructive">*</span></Label>
                                                <Input id="nome" value={formData.nome} onChange={(e) => handleInputChange("nome", e.target.value)} className="bg-background" placeholder="Ex: Mestrado em Ciência da Computação" />
                                                {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="tipo" className="text-foreground">Tipo de Curso <span className="text-destructive">*</span></Label>
                                                    <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                                                        <SelectTrigger id="tipo" className="bg-background"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="mestrado">Mestrado</SelectItem>
                                                            <SelectItem value="doutorado">Doutorado</SelectItem>
                                                            <SelectItem value="especializacao">Especialização</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="area" className="text-foreground">Área de Conhecimento <span className="text-destructive">*</span></Label>
                                                    <Select value={formData.area} onValueChange={(value) => handleInputChange("area", value)}>
                                                        <SelectTrigger id="area" className="bg-background"><SelectValue placeholder="Selecione a área" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ciencias-exatas">Ciências Exatas</SelectItem>
                                                            <SelectItem value="ciencias-humanas">Ciências Humanas</SelectItem>
                                                            <SelectItem value="ciencias-biologicas">Ciências Biológicas</SelectItem>
                                                            <SelectItem value="engenharias">Engenharias</SelectItem>
                                                            <SelectItem value="ciencias-sociais">Ciências Sociais</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="cargaHoraria" className="text-foreground">Carga Horária Total <span className="text-destructive">*</span></Label>
                                                    <Input id="cargaHoraria" type="number" value={formData.cargaHoraria} onChange={(e) => handleInputChange("cargaHoraria", e.target.value)} className="bg-background" placeholder="Ex: 360" />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="duracao" className="text-foreground">Duração (semestres) <span className="text-destructive">*</span></Label>
                                                    <Input id="duracao" type="number" value={formData.duracao} onChange={(e) => handleInputChange("duracao", e.target.value)} className="bg-background" placeholder="Ex: 4" />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="modalidade" className="text-foreground">Modalidade <span className="text-destructive">*</span></Label>
                                                    <Select value={formData.modalidade} onValueChange={(value) => handleInputChange("modalidade", value)}>
                                                        <SelectTrigger id="modalidade" className="bg-background"><SelectValue placeholder="Selecione" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="presencial">Presencial</SelectItem>
                                                            <SelectItem value="hibrido">Híbrido</SelectItem>
                                                            <SelectItem value="ead">EAD</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coordenação e Vínculos */}
                                    <div className="mb-8">
                                        <h2 className="mb-6 text-2xl font-semibold text-foreground">Coordenação e Vínculos</h2>
                                        <div className="grid gap-6">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="coordenador" className="text-foreground">Coordenador do Curso <span className="text-destructive">*</span></Label>
                                                    <Select value={formData.coordenador} onValueChange={(value) => handleInputChange("coordenador", value)}>
                                                        <SelectTrigger id="coordenador" className="bg-background"><SelectValue placeholder="Selecione o coordenador" /></SelectTrigger>
                                                        <SelectContent>
                                                            {mockProfessores.map((prof) => (<SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="viceCoordenador" className="text-foreground">Vice-Coordenador (opcional)</Label>
                                                    <Select value={formData.viceCoordenador} onValueChange={(value) => handleInputChange("viceCoordenador", value)}>
                                                        <SelectTrigger id="viceCoordenador" className="bg-background"><SelectValue placeholder="Selecione o vice-coordenador" /></SelectTrigger>
                                                        <SelectContent>
                                                            {mockProfessores.map((prof) => (<SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="unidade" className="text-foreground">Unidade/Instituto Vinculado <span className="text-destructive">*</span></Label>
                                                <Select value={formData.unidade} onValueChange={(value) => handleInputChange("unidade", value)}>
                                                    <SelectTrigger id="unidade" className="bg-background"><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                                                    <SelectContent>
                                                        {mockUnidades.map((unidade) => (<SelectItem key={unidade.id} value={unidade.id}>{unidade.nome}</SelectItem>))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Descrição Institucional */}
                                    <div className="mb-8">
                                        <h2 className="mb-6 text-2xl font-semibold text-foreground">Descrição Institucional</h2>
                                        <div className="grid gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="objetivos" className="text-foreground">Objetivos do Curso <span className="text-destructive">*</span></Label>
                                                <Textarea id="objetivos" value={formData.objetivos} onChange={(e) => handleInputChange("objetivos", e.target.value)} rows={5} className="bg-background" placeholder="Descreva os objetivos gerais e específicos do curso..." />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="perfilEgresso" className="text-foreground">Perfil do Egresso <span className="text-destructive">*</span></Label>
                                                <Textarea id="perfilEgresso" value={formData.perfilEgresso} onChange={(e) => handleInputChange("perfilEgresso", e.target.value)} rows={5} className="bg-background" placeholder="Descreva as competências e habilidades esperadas do egresso..." />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="justificativa" className="text-foreground">Justificativa / Contexto <span className="text-destructive">*</span></Label>
                                                <Textarea id="justificativa" value={formData.justificativa} onChange={(e) => handleInputChange("justificativa", e.target.value)} rows={5} className="bg-background" placeholder="Apresente a justificativa e o contexto de criação do curso..." />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informações Complementares */}
                                    <div>
                                        <h2 className="mb-6 text-2xl font-semibold text-foreground">Informações Complementares</h2>
                                        <div className="grid gap-6">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="anoInicio" className="text-foreground">Ano de Início da Turma Atual <span className="text-destructive">*</span></Label>
                                                    <Input id="anoInicio" type="number" value={formData.anoInicio} onChange={(e) => handleInputChange("anoInicio", e.target.value)} className="bg-background" placeholder="Ex: 2024" min="2000" max="2100" />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="status" className="text-foreground">Status do Curso <span className="text-destructive">*</span></Label>
                                                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                                                        <SelectTrigger id="status" className="bg-background"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ativo">Ativo</SelectItem>
                                                            <SelectItem value="planejamento">Em Planejamento</SelectItem>
                                                            <SelectItem value="encerrado">Encerrado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="linkDivulgacao" className="text-foreground">Link de Divulgação (opcional)</Label>
                                                <Input id="linkDivulgacao" type="url" value={formData.linkDivulgacao} onChange={(e) => handleInputChange("linkDivulgacao", e.target.value)} className="bg-background" placeholder="https://exemplo.edu.br/curso" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-8 flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={handleCancel} className="min-w-32 bg-transparent">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="min-w-32 bg-primary text-primary-foreground hover:bg-primary/90">
                                    {isEditMode ? "Salvar Alterações" : "Salvar Curso"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
      )
}
