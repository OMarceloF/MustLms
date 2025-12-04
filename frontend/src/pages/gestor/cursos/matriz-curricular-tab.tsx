"use client"

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

// ========================================================================
// INLINED ICONS (To prevent import issues with lucide-react)
// ========================================================================

const IconX = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
);
const IconPlus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const IconPencil = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);
const IconTrash2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
);
const IconLoader2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
const IconBookCopy = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 16V4a2 2 0 0 1 2-2h11" /><path d="M5 14H4a2 2 0 1 0 0 4h16a2 2 0 0 0 0-4h-5" /><path d="M2 8h18" /><path d="M22 21a1 1 0 0 0 1-1v-8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8a1 1 0 0 0 1 1Z" /></svg>
);
const IconEye = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const IconChevronDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
);
const IconCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5" /></svg>
);
const IconListChecks = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 17l5-5-5-5" /><path d="M8 10h12" /><path d="M8 6h12" /><path d="M8 14h12" /></svg>
);

// ========================================================================
// INLINED UI COMPONENTS (For standalone preview compatibility)
// ========================================================================

const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ""}`}>{children}</div>
);
const CardHeader = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ""}`}>{children}</div>
);
const CardTitle = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className || ""}`}>{children}</h3>
);
const CardDescription = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <p className={`text-sm text-muted-foreground ${className || ""}`}>{children}</p>
);
const CardContent = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`p-6 pt-0 ${className || ""}`}>{children}</div>
);

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link", size?: "default" | "sm" | "lg" | "icon" }>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className || ""}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ""}`}
      {...props}
    />
  )
);
Label.displayName = "Label";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

const Badge = ({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "destructive" | "outline" }) => {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className || ""}`} {...props} />
  );
};

// Simplified Accordion
const Accordion = ({ children, className }: { children: React.ReactNode; type?: string; collapsible?: boolean; className?: string }) => (
  <div className={className}>{children}</div>
);
const AccordionItem = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border-b ${className || ""}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // @ts-ignore
          return React.cloneElement(child, { isOpen, onClick: () => setIsOpen(!isOpen) });
        }
        return child;
      })}
    </div>
  );
};
const AccordionTrigger = ({ children, isOpen, onClick, className }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 ${className || ""}`}
  >
    {children}
    <IconChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
  </button>
);
const AccordionContent = ({ children, isOpen }: any) => (
  <div className={`overflow-hidden text-sm transition-all ${isOpen ? "block" : "hidden"}`}>
    <div className="pb-4 pt-0">{children}</div>
  </div>
);

// Simplified Dialog
const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>;
const DialogHeader = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>;
const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => <h2 className={`text-lg font-semibold leading-none tracking-tight ${className || ""}`}>{children}</h2>;
const DialogDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>;
const DialogFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ""}`}>{children}</div>;

// ========================================================================
// 2. COMPONENTE MULTISELECT CORRIGIDO (CUSTOM IMPLEMENTATION)
// ========================================================================

type Option = {
  id: number;
  label: string;
};

function MultiSelectComponent({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
}: {
  options: Option[];
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.filter((opt) => value.includes(opt.id));
  const available = options.filter((opt) => !value.includes(opt.id) && opt.label.toLowerCase().includes(query.toLowerCase()));

  const handleRemove = (id: number) => {
    onChange(value.filter((v) => v !== id));
  };

  const handleAdd = (id: number) => {
    onChange([...value, id]);
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="group flex min-h-[40px] w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-text"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selected.map((option) => (
          <Badge key={option.id} variant="secondary" className="mr-1 mb-1">
            {option.label}
            <button
              className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(option.id);
              }}
            >
              <IconX className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
        />
      </div>

      {open && available.length > 0 && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 max-h-60 overflow-auto p-1 bg-white">
          {available.map((option) => (
            <div
              key={option.id}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100"
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onClick={() => handleAdd(option.id)}
            >
              <IconCheck className={`mr-2 h-4 w-4 ${value.includes(option.id) ? "opacity-100" : "opacity-0"}`} />
              {option.label}
            </div>
          ))}
        </div>
      )}
      {open && available.length === 0 && query && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-md border bg-popover p-2 text-sm text-muted-foreground shadow-md bg-white">
          Nenhum resultado encontrado.
        </div>
      )}
    </div>
  );
}

// ========================================================================
// MAIN COMPONENT
// ========================================================================

interface Turma {
  id: number;
  nome: string;
  semestre_nome?: string;
}

interface Disciplina {
  id: number
  nome: string
  codigo: string
  creditos: number
  carga_horaria: number
  semestre: number
  tipo: 'obrigatoria' | 'optativa'
  ementa: string
  requisitos?: number[]
  turmas?: Turma[]
}

interface DisciplinaFormData {
  id?: number
  nome: string
  codigo: string
  creditos: number
  cargaHoraria: number
  semestre: number
  tipo: 'obrigatoria' | 'optativa'
  ementa: string
  requisitos: number[]
}

export function MatrizCurricularTab() {
  const { id: cursoId } = useParams<{ id: string }>()
  const navigate = useNavigate();

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDisciplina, setEditingDisciplina] = useState<DisciplinaFormData | null>(null)
  const [todasDisciplinas, setTodasDisciplinas] = useState<Disciplina[]>([]);
  
  // NOVO STATE: Duração máxima do curso em semestres
  const [duracaoCurso, setDuracaoCurso] = useState<number>(10);

  // Função para buscar dados do curso (limite de semestres)
  const fetchCursoDetails = async () => {
    if (!cursoId) return;
    try {
      const response = await axios.get(`/api/cursos/${cursoId}`);
      if (response.data && response.data.duracao_semestres) {
        setDuracaoCurso(response.data.duracao_semestres);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do curso:", error);
    }
  };

  const fetchDisciplinas = async () => {
    if (!cursoId) return;
    try {
      setIsLoading(true);
      const response = await axios.get<Disciplina[]>(`/api/cursos/${cursoId}/disciplinas`);

      setTodasDisciplinas(response.data);

      const disciplinasComTurmas = await Promise.all(
        response.data.map(async (disciplina) => {
          try {
            const requisitos = disciplina.requisitos || [];
            const turmasResponse = await axios.get<Turma[]>(`/api/disciplinas/${disciplina.id}/turmas`);
            return { ...disciplina, turmas: turmasResponse.data, requisitos };
          } catch (error) {
            console.error(`Erro ao buscar dados adicionais para a disciplina ${disciplina.id}:`, error);
            return { ...disciplina, turmas: [], requisitos: disciplina.requisitos || [] };
          }
        })
      );
      setDisciplinas(disciplinasComTurmas);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      toast.error("Não foi possível carregar a matriz curricular.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisciplinas();
    fetchCursoDetails(); // Chama busca da duração
  }, [cursoId]);

  const handleOpenDialog = (disciplina: Disciplina | null) => {
    if (disciplina) {
      setEditingDisciplina({
        id: disciplina.id,
        nome: disciplina.nome,
        codigo: disciplina.codigo,
        creditos: disciplina.creditos,
        cargaHoraria: disciplina.carga_horaria,
        semestre: disciplina.semestre,
        tipo: disciplina.tipo || 'obrigatoria',
        ementa: disciplina.ementa,
        requisitos: disciplina.requisitos || []
      })
    } else {
      setEditingDisciplina({
        nome: "",
        codigo: "",
        creditos: 0,
        cargaHoraria: 0,
        semestre: 1,
        tipo: 'obrigatoria',
        ementa: "",
        requisitos: []
      })
    }
    setIsDialogOpen(true)
  }

  const handleDelete = async (disciplinaId: number) => {
    if (window.confirm("Tem certeza que deseja apagar esta disciplina?")) {
      try {
        await axios.delete(`/api/cursos/disciplinas/${disciplinaId}`)
        toast.success("Disciplina removida com sucesso!")
        fetchDisciplinas()
      } catch (error) {
        console.error("Erro ao deletar disciplina:", error)
        toast.error("Não foi possível remover a disciplina.")
      }
    }
  }

  const handleSave = async () => {
    if (!editingDisciplina) return;

    // --- NOVA VALIDAÇÃO DE SEMESTRE ---
    if (editingDisciplina.semestre > duracaoCurso) {
      toast.error(`O semestre não pode ser maior que a duração do curso (${duracaoCurso} semestres).`);
      return;
    }
    if (editingDisciplina.semestre < 0) {
      toast.error(`O semestre não pode ser negativo.`);
      return;
    }
    // ----------------------------------

    const payload = {
      nome: editingDisciplina.nome,
      codigo: editingDisciplina.codigo,
      carga_horaria: editingDisciplina.cargaHoraria,
      creditos: editingDisciplina.creditos,
      semestre: editingDisciplina.semestre,
      tipo: editingDisciplina.tipo,
      ementa: editingDisciplina.ementa,
      requisitos: editingDisciplina.requisitos || [],
    };
    
    try {
      if (editingDisciplina.id) {
        await axios.put(`/api/cursos/disciplinas/${editingDisciplina.id}`, payload);
        toast.success("Disciplina atualizada com sucesso!");
      } else {
        await axios.post(`/api/cursos/${cursoId}/disciplinas`, payload);
        toast.success("Disciplina adicionada com sucesso!");
      }
      setIsDialogOpen(false);
      setTimeout(() => fetchDisciplinas(), 100);
    } catch (error: any) {
      console.error("Erro ao salvar disciplina:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Ocorreu um erro ao salvar a disciplina.");
      }
    }
  }

  const handleFormChange = (field: keyof DisciplinaFormData, value: string | number | number[]) => {
    if (editingDisciplina) {
      setEditingDisciplina({ ...editingDisciplina, [field]: value });
    }
  };

  const handleViewTurma = (turmaId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/gestor/gestao-turma/${turmaId}`);
  };

  const getRequisitoNames = (requisitoIds: number[] | undefined): string[] => {
    if (!requisitoIds || requisitoIds.length === 0) return [];
    return requisitoIds.map(id => {
      const req = todasDisciplinas.find(d => d.id === id);
      return req ? req.nome : `[Disciplina ID ${id} não encontrada]`;
    });
  }

  const opcoesRequisitos = useMemo(() => {
    return todasDisciplinas
      .filter(d => !editingDisciplina?.id || d.id !== editingDisciplina.id)
      .map(d => ({ id: d.id, label: d.nome }));
  }, [todasDisciplinas, editingDisciplina?.id]);

  const semestres = [...new Set(disciplinas.map(d => d.semestre))].sort((a, b) => a - b);

  if (isLoading) {
    return <div className="flex justify-center items-center p-10"><IconLoader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão da Matriz Curricular</CardTitle>
              <CardDescription>Adicione, edite ou remova as disciplinas do curso.</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog(null)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Adicionar Disciplina
            </Button>
          </div>
        </CardHeader>
      </Card>

      {semestres.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhuma disciplina encontrada. Clique em "Adicionar Disciplina" para começar.
          </CardContent>
        </Card>
      ) : (
        semestres.map((semestre) => {
          const disciplinasSemestre = disciplinas.filter((d) => d.semestre === semestre).sort((a, b) => a.nome.localeCompare(b.nome));
          if (disciplinasSemestre.length === 0) return null;

          return (
            <Card key={semestre}>
              <CardHeader>
                <CardTitle>
                    {semestre === 0 ? "Disciplinas Optativas (0º Semestre)" : `${semestre}º Semestre`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {disciplinasSemestre.map((disciplina) => (
                    <AccordionItem key={disciplina.id} value={String(disciplina.id)}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex w-full items-center justify-between pr-4">
                          <div className="text-left">
                            <p className="font-semibold flex items-center gap-2">
                              {disciplina.nome}
                              <Badge variant={disciplina.tipo === 'optativa' ? 'secondary' : 'default'} className="text-[10px] h-5">
                                {disciplina.tipo === 'optativa' ? 'Optativa' : 'Obrigatória'}
                              </Badge>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {disciplina.codigo} • {disciplina.creditos} créditos • {disciplina.carga_horaria}h
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDialog(disciplina); }} className="h-8 w-8 hover:bg-muted">
                              <IconPencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(disciplina.id); }} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                              <IconTrash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                          <div>
                            <h4 className="mb-2 font-semibold">Ementa:</h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">{disciplina.ementa || "Nenhuma ementa cadastrada."}</p>
                          </div>
                          <div className="border-t border-border/50 pt-4">
                            <h4 className="mb-3 font-semibold flex items-center">
                              <IconListChecks className="mr-2 h-4 w-4 text-primary" />
                              Pré-requisitos
                            </h4>
                            {disciplina.requisitos && disciplina.requisitos.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {getRequisitoNames(disciplina.requisitos).map((nome, index) => (
                                  <Badge key={index} variant="outline" className="text-xs bg-white border-primary/50 text-primary">
                                    {nome}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Esta disciplina não possui pré-requisitos.</p>
                            )}
                          </div>
                          <div className="border-t border-border/50 pt-4">
                            <h4 className="mb-3 font-semibold flex items-center">
                              <IconBookCopy className="mr-2 h-4 w-4" />
                              Turmas Vinculadas
                            </h4>
                            {disciplina.turmas && disciplina.turmas.length > 0 ? (
                              <ul className="space-y-2">
                                {disciplina.turmas.sort((a, b) => (a.semestre_nome || '').localeCompare(b.semestre_nome || '') || a.nome.localeCompare(b.nome)).map(turma => (
                                  <li key={turma.id} className="flex items-center justify-between rounded-md bg-background p-2 px-3 border">
                                    <div className="text-sm">
                                      <span className="font-medium">{turma.nome}</span>
                                      {turma.semestre_nome && <span className="text-muted-foreground ml-2">({turma.semestre_nome})</span>}
                                    </div>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => handleViewTurma(turma.id, e)}>
                                      <IconEye className="h-4 w-4" />
                                      <span className="sr-only">Visualizar Turma</span>
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">Nenhuma turma vinculada a esta disciplina.</p>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })
      )}

      {isDialogOpen && editingDisciplina && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/40 bg-card shadow-2xl p-0">
            <div className="p-6 border-b">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{editingDisciplina?.id ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
                <DialogDescription>Configure os detalhes acadêmicos e operacionais da disciplina.</DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-muted/40 border rounded-xl p-5 space-y-4 shadow-sm">
                <h3 className="font-semibold text-lg">Informações Gerais</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Nome da Disciplina</Label>
                    <Input className="rounded-lg bg-background mt-1" value={editingDisciplina.nome} onChange={(e) => handleFormChange("nome", e.target.value)} />
                  </div>
                  <div>
                    <Label>Código</Label>
                    <Input className="rounded-lg bg-background mt-1" value={editingDisciplina.codigo} onChange={(e) => handleFormChange("codigo", e.target.value)} />
                  </div>
                    <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Carga Horária</Label>
                      <Input type="number" className="rounded-lg bg-background mt-1" value={editingDisciplina.cargaHoraria} onChange={(e) => handleFormChange("cargaHoraria", Number(e.target.value))} />
                    </div>
                    <div>
                      <Label>Créditos</Label>
                      <Input type="number" className="rounded-lg bg-background mt-1" value={editingDisciplina.creditos} onChange={(e) => handleFormChange("creditos", Number(e.target.value))} />
                    </div>
                    {/* INPUT SEMESTRE ATUALIZADO */}
                    <div>
                      <Label>Semestre</Label>
                      <Input 
                        type="number" 
                        className="rounded-lg bg-background mt-1" 
                        value={editingDisciplina.semestre} 
                        min={0}
                        max={duracaoCurso}
                        onChange={(e) => handleFormChange("semestre", Number(e.target.value))} 
                      />
                       <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                         Máx: {duracaoCurso} (0=Opt)
                       </p>
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
                        value={editingDisciplina.tipo}
                        onChange={(e) => handleFormChange("tipo", e.target.value)}
                      >
                        <option value="obrigatoria">Obrigatória</option>
                        <option value="optativa">Optativa</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-muted/40 border rounded-xl p-5 space-y-3 shadow-sm">
                <h3 className="font-semibold text-lg">Ementa</h3>
                <Textarea rows={5} className="rounded-lg bg-background" value={editingDisciplina.ementa} onChange={(e) => handleFormChange("ementa", e.target.value)} />
              </div>
              <div className="bg-muted/40 border rounded-xl p-5 space-y-3 shadow-sm">
                <h3 className="font-semibold text-lg">Pré-requisitos</h3>
                <p className="text-sm text-muted-foreground">Marque as disciplinas que devem ser concluídas anteriormente.</p>
                <MultiSelectComponent
                  options={opcoesRequisitos}
                  value={editingDisciplina.requisitos}
                  onChange={(selectedIds) => handleFormChange("requisitos", selectedIds)}
                  placeholder="Selecione os pré-requisitos..."
                />
              </div>
            </div>
            <DialogFooter className="p-6 border-t flex justify-end gap-2 bg-card">
              <Button variant="outline" className="rounded-lg" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="rounded-lg bg-primary text-primary-foreground" onClick={handleSave}>Salvar Disciplina</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}