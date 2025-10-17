"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Save, FileText } from "lucide-react"
import { useToast } from "../hooks/use-toast"

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

export function PpcTab() {
  const [ppcContent, setPpcContent] = useState(initialPPC)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "PPC salvo com sucesso",
      description: "As alterações foram salvas no sistema.",
    })

    setIsSaving(false)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Projeto Pedagógico do Curso
            </CardTitle>
            <CardDescription>Edite o documento completo do PPC do programa</CardDescription>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
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
              className="min-h-[600px] font-mono text-sm leading-relaxed"
              placeholder="Digite o conteúdo do PPC..."
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              {ppcContent.split(/\s+/).length} palavras • {ppcContent.length} caracteres
            </p>
            <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
