import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"

type Materia = {
  id: number
  nome: string
  codigo: string
  cargaHoraria: number
}

type Periodo = {
  id: number
  nome: string
  materias: Materia[]
}

type Curso = {
  id: number
  nome: string
  tipo: string
}

type GradeCurricular = {
  id: number
  curso: Curso
  periodoAcademico: string
  periodos: Periodo[]
}

interface ViewGradeModalProps {
  grade: GradeCurricular
  open: boolean
  onClose: () => void
}

export function ViewGradeModal({ grade, open, onClose }: ViewGradeModalProps) {
  const getTotalCargaHoraria = () => {
    return grade.periodos.reduce((total, periodo) => {
      return total + periodo.materias.reduce((sum, materia) => sum + materia.cargaHoraria, 0)
    }, 0)
  }

  const getPeriodoCargaHoraria = (periodoId: number) => {
    const periodo = grade.periodos.find((p) => p.id === periodoId)
    if (!periodo) return 0
    return periodo.materias.reduce((sum, materia) => sum + materia.cargaHoraria, 0)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes da Grade Curricular</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{grade.curso.nome}</h3>
                <p className="text-sm text-muted-foreground">{grade.curso.tipo}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Período Acadêmico</p>
                <p className="text-lg font-bold">{grade.periodoAcademico}</p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">
                Carga Horária Total: <span className="text-lg font-bold">{getTotalCargaHoraria()}h</span>
              </p>
            </div>
          </div>

          {/* Periods Accordion */}
          <div>
            <h4 className="font-semibold mb-3">Disciplinas por Período</h4>
            <Accordion type="single" collapsible className="w-full">
              {grade.periodos.map((periodo) => (
                <AccordionItem key={periodo.id} value={`periodo-${periodo.id}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex justify-between w-full pr-4">
                      <span className="font-medium">{periodo.nome}</span>
                      <span className="text-sm text-muted-foreground">
                        {periodo.materias.length} disciplinas • {getPeriodoCargaHoraria(periodo.id)}h
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {periodo.materias.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma matéria cadastrada neste período
                        </p>
                      ) : (
                        periodo.materias.map((materia) => (
                          <div
                            key={materia.id}
                            className="flex justify-between items-center p-3 bg-slate-50 rounded-md"
                          >
                            <div>
                              <p className="font-medium">{materia.nome}</p>
                              <p className="text-sm text-muted-foreground">Código: {materia.codigo}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{materia.cargaHoraria}h</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
