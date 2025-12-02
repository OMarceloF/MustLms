"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import axios from "axios";

import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../components/ui/accordion";
import { Button } from "../../components/ui/button";
import { DialogFooter } from "../../components/ui/dialog";
import { toast } from "sonner";

import { QuestionarioForm } from "./forms/QuestionarioForm";
import { PesquisaForm } from "./forms/PesquisaForm";
import { PaginaForm } from "./forms/PaginaForm";
import { TarefaForm } from "./forms/TarefaForm";
import { LicaoForm } from "./forms/LicaoForm";

import { CommonModuleSettings } from "./form-sections/CommonModuleSettings";
import { ActivityCompletion } from "./form-sections/ActivityCompletion";
import { RestrictAccess } from "./form-sections/RestrictAccess";
import { Tags } from "./form-sections/Tags";
import { FileUpload } from "./FileUpload";

import { producaoAcademicaService } from "../../../../services/producaoAcademicaService";
import { turmaService, Turma } from "../../../../services/turmaService";
import { disciplinaService } from "../../../../services/disciplinaService";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface ActivityFormProps {
  activityType: string;
  initialData?: any;
  cursoId?: number;
  materiaId?: number | null;
  turmaId?: number | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Mapeamento frontend -> backend
const mapActivityType = {
  file: "arquivo",
  url: "url",
  quiz: "questionario",
  survey: "pesquisa",
  page: "pagina",
  task: "tarefa",
  lesson: "licao",
};

// Patch tipagem Turma para incluir campos extras retornados pela query personalizada
declare module "../../../../services/turmaService" {
  interface Turma {
    disciplinaTurmaId?: number;
    curso_id?: number;
  }
}

export function ActivityForm({
  activityType,
  initialData,
  onSuccess,
  onCancel,
  cursoId,
  materiaId,
  turmaId,
}: ActivityFormProps) {
  const methods = useForm();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
    setValue,
    control,
  } = methods;

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [estrutura, setEstrutura] = useState<any>(initialData?.estrutura || {});

  /* ============================================================
     CARREGAR TURMAS
  ============================================================ */
  useEffect(() => {
    const loadTurmas = async () => {
      try {
        let data: Turma[] = [];

        if (materiaId) {
          const response = await axios.get(`/api/disciplinas/${materiaId}/turmas-ativas-para-aulas`);
          data = response.data;
        } else {
          data = await turmaService.listar();
        }

        setTurmas(data);
      } catch (error) {
        console.error("Erro ao carregar turmas:", error);
        toast.error("Erro ao carregar lista de turmas.");
      }
    };

    loadTurmas();
  }, [materiaId]);

  const tipoMapeado = mapActivityType[activityType as keyof typeof mapActivityType];

  /* ============================================================
     RESET / DADOS INICIAIS
  ============================================================ */
  useEffect(() => {
    if (initialData) {
      const config = initialData.config || {};

      reset({
        nome: initialData.nome,
        descricao: initialData.descricao,
        materia_id: initialData.materia_id ?? materiaId ?? "",
        turma_id: initialData.turma_id
          ? String(initialData.turma_id)
          : turmaId
            ? String(turmaId)
            : "",
        ...config,
      });

      if (initialData.estrutura) {
        setEstrutura(initialData.estrutura);
      }
    } else {
      reset({
        materia_id: materiaId || "",
        turma_id: turmaId ? String(turmaId) : "",
      });
    }
  }, [initialData, reset, materiaId, turmaId]);

  /* ============================================================
     SUBMIT
  ============================================================ */
  const onSubmit = async (data: any) => {
    let finalCursoId = cursoId;

    if (!finalCursoId && data.turma_id) {
      const turmaIdNumber = Number(data.turma_id);
      const selected = turmas.find((t) => Number(t.id) === turmaIdNumber);

      if (selected?.curso_id) {
        finalCursoId = selected.curso_id;
      } else {
        try {
          const detalhes = await turmaService.obter(turmaIdNumber);
          if ((detalhes as any).curso_id) {
            finalCursoId = (detalhes as any).curso_id;
          }
        } catch (err) {
          console.error("Erro ao buscar detalhes da turma para obter curso", err);
        }
      }
    }

    if (!finalCursoId && materiaId) {
      try {
        const disciplina = await disciplinaService.obter(materiaId);
        if (disciplina && disciplina.curso_id) {
          finalCursoId = disciplina.curso_id;
        }
      } catch (err) {
        console.error("Erro ao buscar disciplina para obter curso_id", err);
      }
    }

    if (!finalCursoId) {
      toast.error("Não foi possível identificar o Curso desta turma. Verifique o cadastro.");
      return;
    }

    try {
      let config: any = {};

      switch (tipoMapeado) {
        case "arquivo":
          config = {
            url: data.url || null,
            display_mode: data.display_mode || "auto",
            mostrar_descricao: data.mostrar_descricao || false,
          };
          break;

        case "url":
          config = {
            url: data.url,
            display_mode: data.display_mode || "auto",
            mostrar_descricao: data.mostrar_descricao || false,
            parametros: data.parametros || [],
          };
          break;

        case "questionario":
          config = {
            nota_aprovacao: Number(data.nota_aprovacao) || 0,
            tentativas:
              data.tentativas === "unlimited"
                ? -1
                : Number(data.tentativas) || -1,
            metodo_avaliacao: data.metodo_avaliacao || "highest",
            layout_paginacao: data.layout_paginacao || "every",
            metodo_navegacao: data.metodo_navegacao || "free",
            opcoes_revisao: data.opcoes_revisao || {},
            feedback_final: data.feedback_final || {},
          };
          break;

        case "pesquisa":
          config = {
            permitir_de: data.permitir_de_enabled ? data.permitir_de : null,
            permitir_ate: data.permitir_ate_enabled ? data.permitir_ate : null,
            gravar_nome: data.gravar_nome || "anonymous",
            multiplas_submissoes: data.multiplas_submissoes || false,
            mostrar_pagina_analise: data.mostrar_pagina_analise || false,
            mensagem_conclusao: data.mensagem_conclusao || "",
            proxima_url: data.proxima_url || "",
          };
          break;

        default:
          config = data;
      }

      const payload = {
        curso_id: finalCursoId,
        nome: data.nome,
        descricao: data.descricao || "",
        materia_id: data.materia_id ? Number(data.materia_id) : null,
        turma_id: data.turma_id ? Number(data.turma_id) : null,
        tipo: tipoMapeado,
        config,
        estrutura, // Inclui a estrutura (perguntas/opções)
      };

      console.log("[ActivityForm] payload enviado:", payload);

      if (initialData?.id) {
        await producaoAcademicaService.atualizar(initialData.id, payload);
        toast.success("Atividade atualizada com sucesso!");
      } else {
        await producaoAcademicaService.criar(payload);
        toast.success("Atividade criada com sucesso!");
      }

      onSuccess?.();
    } catch (e: any) {
      console.error(e);
      if (e.response?.data?.error?.code === "ER_NO_REFERENCED_ROW_2") {
        toast.error("Erro: Vínculo inválido (Matéria ou Turma não pertencem ao curso informado).");
      } else {
        toast.error("Erro ao salvar atividade.");
      }
    }
  };

  /* ============================================================
     FORM ESPECÍFICO
  ============================================================ */
  const renderSpecificForm = () => {
    switch (activityType) {

      case "quiz":
        return (
          <QuestionarioForm
            initialData={initialData}
            onChange={(data) => setEstrutura((prev: any) => ({ ...prev, ...data }))}
          />
        );
      case "survey":
        return (
          <PesquisaForm
            initialData={initialData}
            onChange={(data) => setEstrutura((prev: any) => ({ ...prev, ...data }))}
          />
        );
      case "page":
        return <PaginaForm />;
      case "task":
        return <TarefaForm />;
      case "lesson":
        return <LicaoForm />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Accordion type="multiple" defaultValue={["geral"]}>
          {/* GERAL */}
          <AccordionItem value="geral">
            <AccordionTrigger className="text-lg font-semibold px-4">
              Geral
            </AccordionTrigger>

            <AccordionContent className="p-4 space-y-6">
              {/* NOME */}
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input {...register("nome", { required: true })} />
              </div>

              {/* DESCRIÇÃO */}
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea rows={5} {...register("descricao")} />
              </div>

              {/* MATÉRIA */}
              <div className={materiaId ? "hidden" : "space-y-2"}>
                <Label>Matéria</Label>
                <Input
                  {...register("materia_id")}
                  type="number"
                  readOnly={!!materiaId}
                />
              </div>

              {/* TURMA */}
              <div className="space-y-2">
                <Label>Turma</Label>
                <Controller
                  name="turma_id"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {turmas.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* UPLOAD ARQUIVO */}
              {activityType === "file" && (
                <FileUpload
                  onUploadComplete={(url) => setValue("url", url)}
                  initialFile={initialData?.config?.url}
                />
              )}

              {/* URL */}
              {activityType === "url" && (
                <div className="space-y-2">
                  <Label>URL *</Label>
                  <Input {...register("url")} type="url" required />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {renderSpecificForm()}

          <AccordionItem value="common">
            {/* <AccordionTrigger>Configurações comuns</AccordionTrigger> */}
            <AccordionContent className="p-4">
              <CommonModuleSettings />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="restrict">
            {/* <AccordionTrigger>Restringir acesso</AccordionTrigger> */}
            <AccordionContent className="p-4">
              <RestrictAccess />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="completion">
            {/* <AccordionTrigger>Conclusão da atividade</AccordionTrigger> */}
            <AccordionContent className="p-4">
              <ActivityCompletion />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tags">
            {/* <AccordionTrigger>Tags</AccordionTrigger> */}
            <AccordionContent className="p-4">
              <Tags />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <DialogFooter className="pt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancelar
          </Button>

          <Button type="submit" variant="secondary" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar e mostrar"}
          </Button>

          <Button type="button" onClick={() => handleSubmit(onSubmit)()}>
            Salvar e voltar ao curso
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
}
