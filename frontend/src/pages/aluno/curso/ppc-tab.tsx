//file: frontend/src/pages/aluno/curso/ppc-tab.tsx

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Input } from "../../gestor/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"

// Mock PPC content
const ppcContent = `
# Projeto Pedagógico do Curso de Pós-Graduação em Ciência da Computação

## 1. Apresentação

O Programa de Pós-Graduação em Ciência da Computação tem como objetivo formar pesquisadores e profissionais de alto nível, capazes de desenvolver pesquisas científicas e tecnológicas de excelência na área de Computação.

## 2. Objetivos do Curso

### 2.1 Objetivo Geral

Formar mestres e doutores capacitados para o exercício da pesquisa científica e tecnológica, bem como para o magistério superior, contribuindo para o avanço do conhecimento na área de Ciência da Computação.

### 2.2 Objetivos Específicos

- Desenvolver competências para a realização de pesquisas científicas originais
- Capacitar para o ensino superior em instituições públicas e privadas
- Formar profissionais aptos a atuar em centros de pesquisa e desenvolvimento tecnológico
- Promover a interdisciplinaridade e a colaboração com outras áreas do conhecimento

## 3. Perfil do Egresso

O egresso do programa deverá ser capaz de:

- Conduzir pesquisas científicas de forma independente
- Publicar resultados de pesquisa em periódicos e conferências de alto impacto
- Orientar trabalhos de conclusão de curso e iniciação científica
- Atuar como docente em instituições de ensino superior
- Desenvolver projetos de inovação tecnológica

## 4. Estrutura Curricular

### 4.1 Mestrado

O curso de mestrado tem duração de 24 meses e exige o cumprimento de 60 créditos, distribuídos entre disciplinas obrigatórias, eletivas e dissertação.

**Disciplinas Obrigatórias (16 créditos):**
- Metodologia de Pesquisa Científica (4 créditos)
- Estatística Aplicada (4 créditos)
- Seminários de Pesquisa I (2 créditos)
- Seminários de Pesquisa II (2 créditos)
- Tópicos Avançados em Computação (4 créditos)

**Disciplinas Eletivas (20 créditos):**
O aluno deverá cursar disciplinas eletivas de acordo com sua área de concentração e orientação do orientador.

**Dissertação (24 créditos):**
Desenvolvimento e defesa de dissertação de mestrado.

### 4.2 Doutorado

O curso de doutorado tem duração de 48 meses e exige o cumprimento de 96 créditos, incluindo disciplinas e tese.

## 5. Áreas de Concentração

- Inteligência Artificial e Aprendizado de Máquina
- Sistemas Distribuídos e Computação em Nuvem
- Engenharia de Software e Sistemas de Informação
- Banco de Dados e Big Data
- Redes de Computadores e Segurança da Informação

## 6. Processo Seletivo

O processo seletivo é realizado anualmente e compreende as seguintes etapas:

1. Análise do currículo e histórico escolar
2. Análise do projeto de pesquisa
3. Prova escrita
4. Entrevista com a comissão de seleção

## 7. Avaliação e Acompanhamento

Os alunos são avaliados semestralmente através de:

- Desempenho nas disciplinas cursadas
- Participação em seminários e eventos científicos
- Produção científica (publicações)
- Relatórios de atividades
- Avaliação do orientador

## 8. Requisitos para Titulação

### 8.1 Mestrado

- Cumprimento dos créditos exigidos
- Aprovação em exame de qualificação
- Publicação de pelo menos um artigo em conferência ou periódico
- Defesa pública da dissertação

### 8.2 Doutorado

- Cumprimento dos créditos exigidos
- Aprovação em exame de qualificação
- Publicação de pelo menos dois artigos em periódicos qualificados
- Defesa pública da tese

## 9. Corpo Docente

O programa conta com um corpo docente altamente qualificado, composto por doutores com produção científica regular e projetos de pesquisa ativos.

## 10. Infraestrutura

O programa dispõe de:

- Laboratórios de pesquisa equipados
- Biblioteca especializada
- Salas de aula climatizadas
- Auditório para defesas e eventos
- Acesso a bases de dados científicas
`

export function PpcTab() {
  const [searchTerm, setSearchTerm] = useState("")

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text

    const parts = text.split(new RegExp(`(${search})`, "gi"))
    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={index} className="bg-academic/30 text-foreground">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  const formatContent = (content: string) => {
    const lines = content.split("\n")
    return lines.map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="mb-4 mt-6 text-3xl font-bold">
            {highlightText(line.substring(2), searchTerm)}
          </h1>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="mb-3 mt-5 text-2xl font-semibold">
            {highlightText(line.substring(3), searchTerm)}
          </h2>
        )
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="mb-2 mt-4 text-xl font-semibold">
            {highlightText(line.substring(4), searchTerm)}
          </h3>
        )
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-6 list-disc text-muted-foreground">
            {highlightText(line.substring(2), searchTerm)}
          </li>
        )
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={index} className="mb-2 font-semibold">
            {highlightText(line.replace(/\*\*/g, ""), searchTerm)}
          </p>
        )
      }
      if (line.trim() === "") {
        return <br key={index} />
      }
      return (
        <p key={index} className="mb-2 leading-relaxed text-muted-foreground">
          {highlightText(line, searchTerm)}
        </p>
      )
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Projeto Pedagógico do Curso (PPC)</CardTitle>
          <CardDescription>Documento completo com informações sobre o programa de pós-graduação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Pesquisar no documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="rounded-lg border bg-card p-6">{formatContent(ppcContent)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
