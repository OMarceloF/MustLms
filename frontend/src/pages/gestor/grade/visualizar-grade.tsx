import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import { Badge } from "../components/ui/badge"

type Materia = {
  id: number
  nome: string
  codigo: string
  cargaHoraria: number
  tipo: 'obrigatoria' | 'optativa'
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
  
  // Função auxiliar para pegar todas as matérias flat
  const getAllMaterias = () => {
    return grade.periodos.flatMap(p => p.materias);
  }

  const getTotalCargaHoraria = () => {
    return getAllMaterias().reduce((sum, m) => sum + m.cargaHoraria, 0)
  }

  const getCargaHorariaObrigatoria = () => {
    return getAllMaterias()
      .filter(m => m.tipo === 'obrigatoria' || !m.tipo) // Assume obrigatória se null
      .reduce((sum, m) => sum + m.cargaHoraria, 0)
  }

  const getCargaHorariaOptativa = () => {
    return getAllMaterias()
      .filter(m => m.tipo === 'optativa')
      .reduce((sum, m) => sum + m.cargaHoraria, 0)
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
          <div className="bg-slate-50 rounded-lg p-4 space-y-4">
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
            
            {/* Seção de Carga Horária Detalhada */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
               <div>
                 <p className="text-xs font-medium text-muted-foreground uppercase">Obrigatórias</p>
                 <p className="text-lg font-bold">{getCargaHorariaObrigatoria()}h</p>
               </div>
               <div>
                 <p className="text-xs font-medium text-muted-foreground uppercase">Optativas</p>
                 <p className="text-lg font-bold">{getCargaHorariaOptativa()}h</p>
               </div>
               <div className="text-right">
                 <p className="text-xs font-medium text-muted-foreground uppercase">Total Geral</p>
                 <p className="text-xl font-black text-primary">{getTotalCargaHoraria()}h</p>
               </div>
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
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{materia.nome}</p>
                                <Badge variant={materia.tipo === 'optativa' ? 'secondary' : 'default'} className="text-[10px] h-5 px-1.5">
                                    {materia.tipo === 'optativa' ? 'Optativa' : 'Obrigatória'}
                                </Badge>
                              </div>
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