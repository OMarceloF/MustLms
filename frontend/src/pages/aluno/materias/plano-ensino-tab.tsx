import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Download, FileText } from "lucide-react"

export function PlanoEnsinoTab() {
  return (
    <div className="space-y-6">
      {/* Header with Download */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Plano de Ensino</h2>
          <p className="text-sm text-muted-foreground">Informações completas sobre a disciplina</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Baixar PDF
        </Button>
      </div>

      {/* Course Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Identificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <span className="font-medium">Disciplina:</span> Inteligência Artificial Aplicada
            </div>
            <div>
              <span className="font-medium">Código:</span> PPGCC-2025-IA-001
            </div>
            <div>
              <span className="font-medium">Carga Horária:</span> 60 horas
            </div>
            <div>
              <span className="font-medium">Créditos:</span> 4
            </div>
            <div>
              <span className="font-medium">Professor:</span> Dr. Carlos Eduardo Silva
            </div>
            <div>
              <span className="font-medium">Período:</span> 2025.1
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle>Objetivos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <div>
            <h4 className="mb-2 font-medium">Objetivo Geral</h4>
            <p className="text-muted-foreground">
              Capacitar os alunos a compreender os fundamentos teóricos e práticos da Inteligência Artificial,
              desenvolvendo habilidades para projetar, implementar e avaliar sistemas inteligentes aplicados a problemas
              reais.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium">Objetivos Específicos</h4>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Compreender os conceitos fundamentais de IA e suas aplicações</li>
              <li>Dominar algoritmos de busca e resolução de problemas</li>
              <li>Aplicar técnicas de aprendizado de máquina em problemas práticos</li>
              <li>Desenvolver sistemas baseados em redes neurais artificiais</li>
              <li>Avaliar criticamente soluções de IA em contextos reais</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Syllabus */}
      <Card>
        <CardHeader>
          <CardTitle>Ementa</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          <p>
            Introdução à Inteligência Artificial. Agentes Inteligentes. Resolução de Problemas por Busca. Busca
            Heurística. Algoritmos Genéticos. Lógica e Representação do Conhecimento. Aprendizado de Máquina.
            Classificação e Regressão. Redes Neurais Artificiais. Aprendizado Profundo. Processamento de Linguagem
            Natural. Visão Computacional. Aplicações de IA em Problemas Reais.
          </p>
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card>
        <CardHeader>
          <CardTitle>Metodologia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            A disciplina será desenvolvida através de aulas expositivas dialogadas, estudos de caso, desenvolvimento de
            projetos práticos e seminários. As aulas teóricas serão complementadas com atividades práticas de
            implementação de algoritmos e sistemas de IA.
          </p>
          <p>
            Os alunos serão incentivados a desenvolver projetos de pesquisa aplicados, relacionando os conceitos
            estudados com suas áreas de interesse no mestrado ou doutorado.
          </p>
        </CardContent>
      </Card>

      {/* Evaluation Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>Critérios de Avaliação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b pb-2">
              <span>Prova 1 (Fundamentos e Busca)</span>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span>Prova 2 (Machine Learning)</span>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span>Trabalhos Práticos</span>
              <span className="font-medium">20%</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span>Seminário</span>
              <span className="font-medium">15%</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span>Projeto Final</span>
              <span className="font-medium">15%</span>
            </div>
          </div>
          <p className="pt-2 text-muted-foreground">
            <span className="font-medium">Nota mínima para aprovação:</span> 7.0 |{" "}
            <span className="font-medium">Frequência mínima:</span> 75%
          </p>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <span className="font-medium">Semanas 1-2:</span>
              <span className="text-muted-foreground">Introdução à IA e Agentes Inteligentes</span>
              <span className="font-medium">Semanas 3-4:</span>
              <span className="text-muted-foreground">Algoritmos de Busca</span>
              <span className="font-medium">Semana 5:</span>
              <span className="text-muted-foreground">Prova 1</span>
              <span className="font-medium">Semanas 6-8:</span>
              <span className="text-muted-foreground">Fundamentos de Machine Learning</span>
              <span className="font-medium">Semanas 9-10:</span>
              <span className="text-muted-foreground">Redes Neurais e Deep Learning</span>
              <span className="font-medium">Semana 11:</span>
              <span className="text-muted-foreground">Prova 2</span>
              <span className="font-medium">Semanas 12-14:</span>
              <span className="text-muted-foreground">Aplicações Avançadas (NLP, Visão)</span>
              <span className="font-medium">Semana 15:</span>
              <span className="text-muted-foreground">Apresentação de Seminários</span>
              <span className="font-medium">Semana 16:</span>
              <span className="text-muted-foreground">Apresentação de Projetos Finais</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bibliography */}
      <Card>
        <CardHeader>
          <CardTitle>Bibliografia Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <div className="border-l-2 border-primary pl-4">
            <p className="font-medium">
              RUSSELL, Stuart; NORVIG, Peter. Inteligência Artificial: Uma Abordagem Moderna. 4ª ed. Rio de Janeiro:
              LTC, 2022.
            </p>
          </div>
          <div className="border-l-2 border-muted pl-4">
            <p className="font-medium">MITCHELL, Tom M. Machine Learning. New York: McGraw-Hill, 1997.</p>
          </div>
          <div className="border-l-2 border-muted pl-4">
            <p className="font-medium">
              GOODFELLOW, Ian; BENGIO, Yoshua; COURVILLE, Aaron. Deep Learning. Cambridge: MIT Press, 2016.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
