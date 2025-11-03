"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Save, FileText, Loader2 } from "lucide-react"
import { useToast } from "../hooks/use-toast"

// Modelo de texto inicial para o PPC, usado como fallback
const initialPPC = `# Projeto Pedagógico do Curso (PPC)

## 1. Apresentação

O Programa de Pós-Graduação em [Nome do Curso] tem como objetivo formar pesquisadores e profissionais de alto nível, capazes de contribuir para o avanço do conhecimento científico e tecnológico em suas áreas de atuação.

## 2. Objetivos

### 2.1 Objetivo Geral
Formar mestres e doutores com sólida formação teórica e metodológica, capazes de desenvolver pesquisas originais e relevantes para a sociedade.

### 2.2 Objetivos Específicos
- Desenvolver competências em metodologia de pesquisa científica
- Promover a produção de conhecimento inovador
- Estimular a publicação em periódicos de alto impacto
- Formar docentes qualificados para o ensino superior

## 3. Perfil do Egresso

O egresso do programa deverá ser capaz de:
- Conduzir pesquisas científicas de forma autônoma
- Publicar resultados em periódicos qualificados
- Orientar trabalhos de conclusão de curso
- Atuar como docente no ensino superior

## 4. Estrutura Curricular

O programa está organizado em disciplinas obrigatórias e eletivas, totalizando [X] créditos para o mestrado e [Y] créditos para o doutorado.

## 5. Linhas de Pesquisa

[Descrever as linhas de pesquisa do programa]

## 6. Corpo Docente

O programa conta com [X] docentes permanentes, todos com título de doutor e produção científica regular.

## 7. Infraestrutura

[Descrever laboratórios, bibliotecas e demais recursos disponíveis]

## 8. Avaliação

O programa é avaliado periodicamente pela CAPES, tendo obtido conceito [X] na última avaliação.`

// Define a interface para as props que o componente espera receber
interface PpcTabProps {
  cursoId?: string;
}

export function PpcTab({ cursoId }: PpcTabProps) {
  const [ppcContent, setPpcContent] = useState("") // Inicia com string vazia para aguardar o fetch
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Estado para controlar o carregamento inicial
  const { toast } = useToast()

  // Efeito para buscar o PPC existente assim que o componente for montado
  useEffect(() => {
    const fetchPPC = async () => {
      if (!cursoId) {
        toast({
          title: "Aviso",
          description: "ID do curso não fornecido. Usando modelo padrão.",
        });
        setPpcContent(initialPPC);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/cursos/${cursoId}/ppc`);
        // Se a API retornar um conteúdo, usa ele. Senão, usa o modelo inicial.
        setPpcContent(response.data.conteudo || initialPPC);
      } catch (error) {
        console.error("Erro ao buscar PPC:", error);
        toast({
          title: "Erro ao carregar PPC",
          description: "Não foi possível buscar os dados existentes. Usando modelo padrão.",
          variant: "destructive",
        });
        setPpcContent(initialPPC); // Garante que o editor não fique em branco em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    fetchPPC();
  }, [cursoId, toast]); // Dependências do efeito

  // Função para salvar as alterações, agora com a chamada real à API
  const handleSave = async () => {
    if (!cursoId) {
      toast({
        title: "Erro de Operação",
        description: "Não é possível salvar, pois o ID do curso não foi encontrado.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Chamada POST para a rota do backend, enviando o conteúdo do PPC
      await axios.post(`/api/cursos/${cursoId}/ppc`, {
        conteudo: ppcContent,
      });

      toast({
        title: "PPC salvo com sucesso!",
        description: "As alterações foram permanentemente salvas no sistema.",
      });
    } catch (error) {
      console.error("Erro ao salvar PPC:", error);
      toast({
        title: "Falha ao Salvar",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Renderiza um indicador de carregamento enquanto busca os dados
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Projeto Pedagógico do Curso
            </CardTitle>
            <CardDescription>Edite o documento completo do PPC do programa.</CardDescription>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-background p-4">
            <Textarea
              value={ppcContent}
              onChange={(e) => setPpcContent(e.target.value)}
              className="min-h-[600px] w-full resize-y font-mono text-sm leading-relaxed"
              placeholder="Digite o conteúdo do Projeto Pedagógico do Curso..."
            />
          </div>
          <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
            <p>
              {ppcContent.split(/\s+/).filter(Boolean).length} palavras • {ppcContent.length} caracteres
            </p>
            <p>Última atualização local: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
