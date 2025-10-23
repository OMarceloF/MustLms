"use client"

import React, { useState, useRef } from "react"
import { useNavigate } from 'react-router-dom';

// Importações de componentes de UI e hooks
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useToast } from "../hooks/use-toast"
import { ArrowLeft } from "lucide-react"

// Importações para o Layout (Sidebar e TopBar)
import TopBarGestor from "../components/Navbar";
import SidebarGestor from "../components/Sidebar";
import { useAuth } from "../../../hooks/useAuth";

// Interfaces (mantidas como estavam)
interface Professor {
    id: string
    nome: string
}

interface Unidade {
    id: string
    nome: string
}

interface CursoFormData {
    nome: string
    tipo: string
    area: string
    cargaHoraria: string
    duracao: string
    modalidade: string
    coordenador: string
    viceCoordenador: string
    unidade: string
    objetivos: string
    perfilEgresso: string
    justificativa: string
    anoInicio: string
    status: string
    linkDivulgacao: string
}

// Mocks (mantidos como estavam)
const mockProfessores: Professor[] = [
    { id: "1", nome: "Dr. João Silva" },
    { id: "2", nome: "Dra. Maria Santos" },
    { id: "3", nome: "Dr. Pedro Costa" },
]

const mockUnidades: Unidade[] = [
    { id: "1", nome: "Instituto de Ciências Exatas" },
    { id: "2", nome: "Faculdade de Ciências Humanas" },
    { id: "3", nome: "Centro de Ciências Biológicas" },
]

export default function AdicionarCursoPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth(); // Hook para obter dados do usuário logado

    // Estados para o formulário
    const [errors, setErrors] = useState<Partial<Record<keyof CursoFormData, string>>>({})
    const [formData, setFormData] = useState<CursoFormData>({
        nome: "",
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
    })

    // Estados para o controle do layout (Sidebar e menus da TopBar)
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isFeedbackMenuOpen, setIsFeedbackMenuOpen] = useState(false);
    const [activePage, setActivePage] = useState('cursos');

    // Referências para fechar menus ao clicar fora
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const notificationsMenuRef = useRef<HTMLDivElement>(null);
    const helpModalRef = useRef<HTMLDivElement>(null);
    const feedbackMenuRef = useRef<HTMLDivElement>(null);

    // Funções de manipulação do formulário (mantidas como estavam)
    const handleInputChange = (field: keyof CursoFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CursoFormData, string>> = {}
        if (!formData.nome.trim()) newErrors.nome = "Nome do curso é obrigatório"
        // ... (outras validações mantidas)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) {
            toast({
                title: "Erro de validação",
                description: "Por favor, preencha todos os campos obrigatórios.",
                variant: "destructive",
            })
            return
        }
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            toast({
                title: "Curso cadastrado com sucesso!",
                description: `O curso "${formData.nome}" foi adicionado ao sistema.`,
            })
            navigate("/gestaocurso") // Redireciona para a página de gestão de cursos
        } catch (error) {
            toast({
                title: "Erro ao salvar curso",
                description: "Ocorreu um erro ao cadastrar o curso. Tente novamente.",
                variant: "destructive",
            })
        }
    }

    const handleCancel = () => {
        navigate("/gestaocurso") // Redireciona para a página de gestão de cursos
    }

    // Funções para o layout
    const handleLogout = () => {
        // Implemente sua lógica de logout aqui
        navigate('/');
    };

    if (!user) {
        return <div>Carregando...</div>; // Ou um spinner de carregamento
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* TopBar Fixa */}
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
                handleLogout={handleLogout}
                setActivePage={setActivePage}
                activePage={activePage}
                usuarioId={user.id}
                notifications={[]} // Passe as notificações reais se disponíveis
            />

            <div className="flex flex-1">
                {/* Sidebar */}
                <SidebarGestor
                    isMenuOpen={isMenuOpen}
                    setActivePage={setActivePage}
                    handleMouseEnter={() => setIsMenuOpen(true)}
                    handleMouseLeave={() => setIsMenuOpen(false)}
                />

                {/* Conteúdo Principal da Página */}
                <main className={`flex-1 transition-all duration-500 pt-20 ${isMenuOpen ? 'sm:ml-[220px]' : 'sm:ml-[60px]'}`}>
                    <div className="mx-auto max-w-4xl p-8">
                        {/* Botão Voltar */}
                        <Button variant="ghost" onClick={handleCancel} className="mb-6 hover:bg-muted">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>

                        {/* Cabeçalho */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold tracking-tight text-foreground">Adicionar Novo Curso</h1>
                            <p className="mt-2 text-lg text-muted-foreground">
                                Cadastre as informações institucionais e pedagógicas do curso de pós-graduação.
                            </p>
                        </div>

                        {/* Formulário */}
                        <form onSubmit={handleSubmit}>
                            <Card className="border-border bg-card shadow-sm">
                                <CardContent className="p-8">
                                    {/* Seções do formulário (Informações Básicas, Coordenação, etc.) */}
                                    {/* ... todo o seu JSX do formulário vai aqui, sem alterações ... */}
                                     {/* Informações Básicas */}
                                    <div className="mb-8">
                                        <h2 className="mb-6 text-2xl font-semibold text-foreground">Informações Básicas</h2>
                                        <div className="grid gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="nome" className="text-foreground">
                                                    Nome do Curso <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id="nome"
                                                    value={formData.nome}
                                                    onChange={(e) => handleInputChange("nome", e.target.value)}
                                                    className="bg-background"
                                                    placeholder="Ex: Mestrado em Ciência da Computação"
                                                />
                                                {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="tipo" className="text-foreground">
                                                        Tipo de Curso <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                                                        <SelectTrigger id="tipo" className="bg-background">
                                                            <SelectValue placeholder="Selecione o tipo" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="mestrado">Mestrado</SelectItem>
                                                            <SelectItem value="doutorado">Doutorado</SelectItem>
                                                            <SelectItem value="especializacao">Especialização</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.tipo && <p className="text-sm text-destructive">{errors.tipo}</p>}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="area" className="text-foreground">
                                                        Área de Conhecimento <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Select value={formData.area} onValueChange={(value) => handleInputChange("area", value)}>
                                                        <SelectTrigger id="area" className="bg-background">
                                                            <SelectValue placeholder="Selecione a área" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ciencias-exatas">Ciências Exatas</SelectItem>
                                                            <SelectItem value="ciencias-humanas">Ciências Humanas</SelectItem>
                                                            <SelectItem value="ciencias-biologicas">Ciências Biológicas</SelectItem>
                                                            <SelectItem value="engenharias">Engenharias</SelectItem>
                                                            <SelectItem value="ciencias-sociais">Ciências Sociais</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.area && <p className="text-sm text-destructive">{errors.area}</p>}
                                                </div>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="cargaHoraria" className="text-foreground">
                                                        Carga Horária Total <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        id="cargaHoraria"
                                                        type="number"
                                                        value={formData.cargaHoraria}
                                                        onChange={(e) => handleInputChange("cargaHoraria", e.target.value)}
                                                        className="bg-background"
                                                        placeholder="Ex: 360"
                                                    />
                                                    {errors.cargaHoraria && <p className="text-sm text-destructive">{errors.cargaHoraria}</p>}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="duracao" className="text-foreground">
                                                        Duração (semestres) <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        id="duracao"
                                                        type="number"
                                                        value={formData.duracao}
                                                        onChange={(e) => handleInputChange("duracao", e.target.value)}
                                                        className="bg-background"
                                                        placeholder="Ex: 4"
                                                    />
                                                    {errors.duracao && <p className="text-sm text-destructive">{errors.duracao}</p>}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="modalidade" className="text-foreground">
                                                        Modalidade <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Select
                                                        value={formData.modalidade}
                                                        onValueChange={(value) => handleInputChange("modalidade", value)}
                                                    >
                                                        <SelectTrigger id="modalidade" className="bg-background">
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
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
                                                    <Label htmlFor="coordenador" className="text-foreground">
                                                        Coordenador do Curso <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Select
                                                        value={formData.coordenador}
                                                        onValueChange={(value) => handleInputChange("coordenador", value)}
                                                    >
                                                        <SelectTrigger id="coordenador" className="bg-background">
                                                            <SelectValue placeholder="Selecione o coordenador" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {mockProfessores.map((prof) => (
                                                                <SelectItem key={prof.id} value={prof.id}>
                                                                    {prof.nome}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.coordenador && <p className="text-sm text-destructive">{errors.coordenador}</p>}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="viceCoordenador" className="text-foreground">
                                                        Vice-Coordenador (opcional)
                                                    </Label>
                                                    <Select
                                                        value={formData.viceCoordenador}
                                                        onValueChange={(value) => handleInputChange("viceCoordenador", value)}
                                                    >
                                                        <SelectTrigger id="viceCoordenador" className="bg-background">
                                                            <SelectValue placeholder="Selecione o vice-coordenador" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {mockProfessores.map((prof) => (
                                                                <SelectItem key={prof.id} value={prof.id}>
                                                                    {prof.nome}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="unidade" className="text-foreground">
                                                    Unidade/Instituto Vinculado <span className="text-destructive">*</span>
                                                </Label>
                                                <Select value={formData.unidade} onValueChange={(value) => handleInputChange("unidade", value)}>
                                                    <SelectTrigger id="unidade" className="bg-background">
                                                        <SelectValue placeholder="Selecione a unidade" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {mockUnidades.map((unidade) => (
                                                            <SelectItem key={unidade.id} value={unidade.id}>
                                                                {unidade.nome}
                                                            </SelectItem>
                                                        ))}
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
                                                <Label htmlFor="objetivos" className="text-foreground">
                                                    Objetivos do Curso <span className="text-destructive">*</span>
                                                </Label>
                                                <Textarea
                                                    id="objetivos"
                                                    value={formData.objetivos}
                                                    onChange={(e) => handleInputChange("objetivos", e.target.value)}
                                                    rows={5}
                                                    className="bg-background"
                                                    placeholder="Descreva os objetivos gerais e específicos do curso..."
                                                />
                                                {errors.objetivos && <p className="text-sm text-destructive">{errors.objetivos}</p>}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="perfilEgresso" className="text-foreground">
                                                    Perfil do Egresso <span className="text-destructive">*</span>
                                                </Label>
                                                <Textarea
                                                    id="perfilEgresso"
                                                    value={formData.perfilEgresso}
                                                    onChange={(e) => handleInputChange("perfilEgresso", e.target.value)}
                                                    rows={5}
                                                    className="bg-background"
                                                    placeholder="Descreva as competências e habilidades esperadas do egresso..."
                                                />
                                                {errors.perfilEgresso && <p className="text-sm text-destructive">{errors.perfilEgresso}</p>}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="justificativa" className="text-foreground">
                                                    Justificativa / Contexto <span className="text-destructive">*</span>
                                                </Label>
                                                <Textarea
                                                    id="justificativa"
                                                    value={formData.justificativa}
                                                    onChange={(e) => handleInputChange("justificativa", e.target.value)}
                                                    rows={5}
                                                    className="bg-background"
                                                    placeholder="Apresente a justificativa e o contexto de criação do curso..."
                                                />
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
                                                    <Label htmlFor="anoInicio" className="text-foreground">
                                                        Ano de Início da Turma Atual <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        id="anoInicio"
                                                        type="number"
                                                        value={formData.anoInicio}
                                                        onChange={(e) => handleInputChange("anoInicio", e.target.value)}
                                                        className="bg-background"
                                                        placeholder="Ex: 2024"
                                                        min="2000"
                                                        max="2100"
                                                    />
                                                    {errors.anoInicio && <p className="text-sm text-destructive">{errors.anoInicio}</p>}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="status" className="text-foreground">
                                                        Status do Curso <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                                                        <SelectTrigger id="status" className="bg-background">
                                                            <SelectValue placeholder="Selecione o status" />
                                                        </SelectTrigger>
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
                                                <Label htmlFor="linkDivulgacao" className="text-foreground">
                                                    Link de Divulgação (opcional)
                                                </Label>
                                                <Input
                                                    id="linkDivulgacao"
                                                    type="url"
                                                    value={formData.linkDivulgacao}
                                                    onChange={(e) => handleInputChange("linkDivulgacao", e.target.value)}
                                                    className="bg-background"
                                                    placeholder="https://exemplo.edu.br/curso"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Botões de Ação */}
                            <div className="mt-8 flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={handleCancel} className="min-w-32 bg-transparent">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="min-w-32 bg-primary text-primary-foreground hover:bg-primary/90">
                                    Salvar Curso
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
     )
}
