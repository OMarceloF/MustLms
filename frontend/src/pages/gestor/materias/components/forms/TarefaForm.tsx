import { useFormContext } from "react-hook-form";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { HelpTooltip } from "../form-sections/HelpTooltip";
import { FileUpload } from "../FileUpload"; // Reutilizaremos o componente de upload

// Componente auxiliar para os seletores de data/hora
const DateTimeSelector = ({ label, id, register, setValue }: { label: string, id: string, register: any, setValue: any }) => (
  <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
    <div className="flex items-center gap-2">
      <Label>{label}</Label>
      <HelpTooltip text={`Habilite para definir a data de "${label.toLowerCase()}".`} />
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id={id} onCheckedChange={(checked) => setValue(`${id}_enabled`, checked)} />
      <Label htmlFor={id} className="font-normal">Habilitar</Label>
      {/* Aqui entrariam os seletores de data/hora, que seriam ativados pelo checkbox. 
          Por enquanto, registrando um input hidden ou similar se necessário, ou apenas o checkbox. */}
    </div>
  </div>
);

export function TarefaForm() {
  const { register, setValue } = useFormContext();

  return (
    <>
      {/* Seção Disponibilidade */}
      <AccordionItem value="disponibilidade">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">Disponibilidade</AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
          <DateTimeSelector id="allow-from" label="Permite envios a partir de" register={register} setValue={setValue} />
          <DateTimeSelector id="due-date" label="Data de entrega" register={register} setValue={setValue} />
          <DateTimeSelector id="cutoff-date" label="Data limite" register={register} setValue={setValue} />
          <DateTimeSelector id="grading-reminder" label="Lembre-me de avaliar por" register={register} setValue={setValue} />
        </AccordionContent>
      </AccordionItem>

      {/* Seção Tipos de Envio */}
      <AccordionItem value="tipos-envio">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">Tipos de envio</AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
          <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-[1fr_2fr]">
            <div className="flex items-center gap-2">
              <Label>Tipos de envio</Label>
              <HelpTooltip text="Escolha como os estudantes devem submeter a tarefa." />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox id="online-text" onCheckedChange={(checked) => setValue("texto_online", checked)} />
                <Label htmlFor="online-text" className="font-normal">Texto online</Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="file-submission" defaultChecked onCheckedChange={(checked) => setValue("envio_arquivo", checked)} />
                <Label htmlFor="file-submission" className="font-normal">Envios de arquivo</Label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Número máximo de arquivos</Label>
            <Input type="number" defaultValue={20} className="max-w-xs" {...register("max_arquivos")} />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Seção Nota */}
      <AccordionItem value="nota">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">Nota</AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Nota máxima</Label>
            <Input type="number" defaultValue={100} className="max-w-xs" {...register("nota_maxima")} />
          </div>
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Método de avaliação</Label>
            <Select defaultValue="simple" onValueChange={(val) => setValue("metodo_avaliacao", val)}>
              <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Método simples de avaliação</SelectItem>
                <SelectItem value="rubric">Rubrica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}
