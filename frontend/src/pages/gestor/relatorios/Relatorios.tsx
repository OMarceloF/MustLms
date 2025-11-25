"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { FiltroRelatorios } from "./components/filtro-relatorios"
import { InstitucionalTab } from "./institucional-tab"
import { CursosTab } from "./cursos-tab"
import { DisciplinasTab } from "./disciplinas-tab"
import { ProfessoresTab } from "./professores-tab"
import { AlunosTab } from "./alunos-tab"
import type { FiltrosRelatorio } from "../../lib/types"

export default function RelatoriosPage() {
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    periodoId: "2024_2",
    cursoId: "todos",
    disciplinaId: "todos",
    turmaId: "todos",
    professorId: "todos",
    modalidade: "todos",
    ano: "todos",
  })

  return (
    <main className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Relatórios</h1>
        <p className="text-muted-foreground">
          Análise de indicadores institucionais, cursos, disciplinas, professores e alunos
        </p>
      </div>

      <FiltroRelatorios filtros={filtros} onFiltrosChange={setFiltros} />

      <Tabs defaultValue="institucional" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="institucional" className="text-xs sm:text-sm">
            Institucional
          </TabsTrigger>
          <TabsTrigger value="cursos" className="text-xs sm:text-sm">
            Cursos
          </TabsTrigger>
          <TabsTrigger value="disciplinas" className="text-xs sm:text-sm">
            Disciplinas
          </TabsTrigger>
          <TabsTrigger value="professores" className="text-xs sm:text-sm">
            Professores
          </TabsTrigger>
          <TabsTrigger value="alunos" className="text-xs sm:text-sm">
            Alunos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="institucional" className="space-y-6">
          <InstitucionalTab filtros={filtros} />
        </TabsContent>

        <TabsContent value="cursos" className="space-y-6">
          <CursosTab filtros={filtros} />
        </TabsContent>

        <TabsContent value="disciplinas" className="space-y-6">
          <DisciplinasTab filtros={filtros} />
        </TabsContent>

        <TabsContent value="professores" className="space-y-6">
          <ProfessoresTab filtros={filtros} />
        </TabsContent>

        <TabsContent value="alunos" className="space-y-6">
          <AlunosTab filtros={filtros} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
