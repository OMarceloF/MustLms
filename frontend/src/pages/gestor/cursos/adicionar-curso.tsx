"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Importações de UI e hooks
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useToast } from "../hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import TopbarGestorAuto from '../components/TopbarGestorAuto';
import SidebarGestor from "../components/Sidebar";
import { useAuth } from "../../../hooks/useAuth";

// Interfaces e Mocks
interface Professor { id: string; nome: string; }
interface Unidade { id: string; nome: string; }

// Interface do formulário atualizada com o campo 'sigla'
interface CursoFormData {
    nome: string;
    sigla: string; // <-- CAMPO ADICIONADO
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
    
    // Estado inicial do formulário atualizado com 'sigla'
    const [formData, setFormData] = useState<CursoFormData>({
        nome: "",
        sigla: "", // <-- CAMPO ADICIONADO
        tipo: "",
        area: "",
        cargaHoraria: "",
        duracao: "",
        modalidade: "",
        coordenador: "",
        viceCoordenador: "",
        unidade: "",
        objetivos: "",
        perfilEgresso: "",
        justificativa: "",
        anoInicio: "",
        status: "",
        linkDivulgacao: "",
    });

    // Estados e Refs do Layout
    const [sidebarAberta, setSidebarAberta] = useState(false);

    useEffect(() => {
        if (isEditMode && id) {
            const fetchCursoData = async () => {
                setIsLoading(true);
                try {
                    const response = await axios.get(`/api/cursos/${id}`);
                    const curso = response.data;

                    // Mapeia os dados do backend para o estado do formulário, incluindo 'sigla'
                    setFormData({
                        nome: curso.nome || "",
                        sigla: curso.sigla || "", // <-- CAMPO ADICIONADO
                        tipo: curso.tipo || "",
                        area: curso.area_conhecimento || "",
                        cargaHoraria: String(curso.carga_horaria || ""),
                        duracao: String(curso.duracao_semestres || ""),
                        modalidade: curso.modalidade || "",
                        coordenador: String(curso.coordenador_id || ""),
                        viceCoordenador: String(curso.vice_coordenador_id || ""),
                        unidade: String(curso.unidade_id || ""),
                        objetivos: curso.objetivos || "",
                        perfilEgresso: curso.perfil_egresso || "",
                        justificativa: curso.justificativa || "",
                        anoInicio: String(curso.ano_inicio || ""),
                        status: curso.status || "",
                        linkDivulgacao: curso.link_divulgacao || "",
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
        if (!formData.sigla.trim()) newErrors.sigla = "A sigla do curso é obrigatória"; // <-- VALIDAÇÃO ADICIONADA
        // Adicione outras validações essenciais aqui
        if (!formData.tipo) newErrors.tipo = "O tipo de curso é obrigatório";
        if (!formData.area) newErrors.area = "A área de conhecimento é obrigatória";
        if (!formData.cargaHoraria) newErrors.cargaHoraria = "A carga horária é obrigatória";
        if (!formData.duracao) newErrors.duracao = "A duração é obrigatória";
        if (!formData.modalidade) newErrors.modalidade = "A modalidade é obrigatória";
        if (!formData.coordenador) newErrors.coordenador = "O coordenador é obrigatório";
        if (!formData.unidade) newErrors.unidade = "A unidade é obrigatória";
        if (!formData.objetivos) newErrors.objetivos = "Os objetivos são obrigatórios";
        if (!formData.perfilEgresso) newErrors.perfilEgresso = "O perfil do egresso é obrigatório";
        if (!formData.justificativa) newErrors.justificativa = "A justificativa é obrigatória";
        if (!formData.anoInicio) newErrors.anoInicio = "O ano de início é obrigatório";
        if (!formData.status) newErrors.status = "O status é obrigatório";

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

        // Payload para a API, incluindo 'sigla'
        const apiPayload = {
            nome: formData.nome,
            sigla: formData.sigla, // <-- CAMPO ADICIONADO
            tipo: formData.tipo,
            area_conhecimento: formData.area,
            carga_horaria: Number(formData.cargaHoraria),
            duracao_semestres: Number(formData.duracao),
            modalidade: formData.modalidade,
            coordenador_id: Number(formData.coordenador),
            vice_coordenador_id: formData.viceCoordenador ? Number(formData.viceCoordenador) : null,
            unidade_id: Number(formData.unidade),
            objetivos: formData.objetivos,
            perfil_egresso: formData.perfilEgresso,
            justificativa: formData.justificativa,
            ano_inicio: Number(formData.anoInicio),
            status: formData.status,
            link_divulgacao: formData.linkDivulgacao,
        };

        try {
            if (isEditMode) {
                await axios.put(`/api/cursos/${id}`, apiPayload);
                toast({
                    title: "Curso atualizado com sucesso!",
                    description: `O curso "${formData.nome}" foi modificado.`,
                });
            } else {
                await axios.post('/api/cursos/adicionar', apiPayload);
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

    if (!user) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

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

                    <main className={`flex-1 transition-all duration-500 pt-20 ${sidebarAberta ? 'sm:ml-[220px]' : 'sm:ml-[60px]'}`}>
                        <div className="mx-auto max-w-4xl p-8">
                            <div className="mb-8">
                                <Button variant="ghost" onClick={handleCancel} className="mb-4">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Voltar para Gestão de Cursos
                                </Button>
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
                                        {/* Informações Básicas */}
                                        <div className="mb-8">
                                            <h2 className="mb-6 text-2xl font-semibold text-foreground">Informações Básicas</h2>
                                            <div className="grid gap-6">
                                                {/* Layout atualizado para Nome e Sigla */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="md:col-span-2 grid gap-2">
                                                        <Label htmlFor="nome" className="text-foreground">Nome do Curso <span className="text-destructive">*</span></Label>
                                                        <Input id="nome" value={formData.nome} onChange={(e) => handleInputChange("nome", e.target.value)} className="bg-background" placeholder="Ex: Mestrado em Ciência da Computação" />
                                                        {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="sigla" className="text-foreground">Sigla <span className="text-destructive">*</span></Label>
                                                        <Input id="sigla" value={formData.sigla} onChange={(e) => handleInputChange("sigla", e.target.value)} className="bg-background" placeholder="Ex: MCC" />
                                                        {errors.sigla && <p className="text-sm text-destructive">{errors.sigla}</p>}
                                                    </div>
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
                                                        {errors.tipo && <p className="text-sm text-destructive">{errors.tipo}</p>}
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="area" className="text-foreground">Área de Conhecimento <span className="text-destructive">*</span></Label>
                                                        <Select value={formData.area} onValueChange={(value) => handleInputChange("area", value)}>
                                                            <SelectTrigger id="area" className="bg-background"><SelectValue placeholder="Selecione a área" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ciencias-exatas">Ciências Exatas e da Terra</SelectItem>
                                                                <SelectItem value="ciencias-humanas">Ciências Humanas</SelectItem>
                                                                <SelectItem value="ciencias-da-saude">Ciências da Saúde</SelectItem>
                                                                <SelectItem value="engenharias">Engenharias</SelectItem>
                                                                <SelectItem value="ciencias-sociais-aplicadas">Ciências Sociais Aplicadas</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.area && <p className="text-sm text-destructive">{errors.area}</p>}
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-3">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="cargaHoraria" className="text-foreground">Carga Horária Total <span className="text-destructive">*</span></Label>
                                                        <Input id="cargaHoraria" type="number" value={formData.cargaHoraria} onChange={(e) => handleInputChange("cargaHoraria", e.target.value)} className="bg-background" placeholder="Ex: 360" />
                                                        {errors.cargaHoraria && <p className="text-sm text-destructive">{errors.cargaHoraria}</p>}
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="duracao" className="text-foreground">Duração (semestres) <span className="text-destructive">*</span></Label>
                                                        <Input id="duracao" type="number" value={formData.duracao} onChange={(e) => handleInputChange("duracao", e.target.value)} className="bg-background" placeholder="Ex: 4" />
                                                        {errors.duracao && <p className="text-sm text-destructive">{errors.duracao}</p>}
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
                                                        {errors.modalidade && <p className="text-sm text-destructive">{errors.modalidade}</p>}
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
                                                        {errors.coordenador && <p className="text-sm text-destructive">{errors.coordenador}</p>}
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
                                                    {errors.unidade && <p className="text-sm text-destructive">{errors.unidade}</p>}
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
                                                    {errors.objetivos && <p className="text-sm text-destructive">{errors.objetivos}</p>}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="perfilEgresso" className="text-foreground">Perfil do Egresso <span className="text-destructive">*</span></Label>
                                                    <Textarea id="perfilEgresso" value={formData.perfilEgresso} onChange={(e) => handleInputChange("perfilEgresso", e.target.value)} rows={5} className="bg-background" placeholder="Descreva as competências e habilidades esperadas do egresso..." />
                                                    {errors.perfilEgresso && <p className="text-sm text-destructive">{errors.perfilEgresso}</p>}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="justificativa" className="text-foreground">Justificativa / Contexto <span className="text-destructive">*</span></Label>
                                                    <Textarea id="justificativa" value={formData.justificativa} onChange={(e) => handleInputChange("justificativa", e.target.value)} rows={5} className="bg-background" placeholder="Apresente a justificativa e o contexto de criação do curso..." />
                                                    {errors.justificativa && <p className="text-sm text-destructive">{errors.justificativa}</p>}
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
                                                        {errors.anoInicio && <p className="text-sm text-destructive">{errors.anoInicio}</p>}
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
                                                        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
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
                                    <Button type="submit" className="min-w-32 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditMode ? "Salvar Alterações" : "Salvar Curso" )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
