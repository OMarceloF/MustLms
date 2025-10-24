import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useRegistration } from '../../contexts/RegistrationContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import { cn } from '../../../../lib/utils';

// Schema de validação do formulário com Zod
const studentSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  email: z.string().email('Email inválido'),
  biografia: z.string().max(500, 'Biografia deve ter no máximo 500 caracteres').optional().or(z.literal('')),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  contatoResponsaveis: z.string().min(1, 'Contato dos responsáveis é obrigatório'),
  sexo: z.enum(['Masculino', 'Feminino'], { required_error: 'Sexo é obrigatório' }),
  rg: z.string().min(1, 'RG é obrigatório'),
  restricoesMedicas: z.string().optional(),
  login: z.string().min(3, 'Login deve ter pelo menos 3 caracteres'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type StudentFormData = z.infer<typeof studentSchema>;

// Função para calcular a idade
const calculateAge = (birthDate: Date | null): number => {
  if (!birthDate) return 0;
  try {
    return differenceInYears(new Date(), birthDate);
  } catch {
    return 0;
  }
};

// Função genérica para enviar os dados do aluno
async function sendStudentData(payload: any, studentId: number | null) {
  const formData = new FormData();
  for (const key in payload) {
    if (payload[key] !== null && payload[key] !== undefined) {
      formData.append(key, payload[key]);
    }
  }

  const url = studentId ? `/api/alunos/${studentId}` : '/api/alunos';
  const method = studentId ? 'PUT' : 'POST';
  
  const res = await fetch(url, { method, body: formData });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Erro ao ${method === 'POST' ? 'criar' : 'atualizar'} aluno`);
  }
  
  return data;
}

export function StudentForm() {
  const { state, updateStudent, setCurrentStep, completeStep } = useRegistration();
  const { student } = state.data;
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(student.fotoUrl || null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(student.dataNascimento ? new Date(student.dataNascimento) : undefined);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOver18, setIsOver18] = useState(calculateAge(student.dataNascimento) >= 18);
  const [isSelfResponsible, setIsSelfResponsible] = useState(false); // Estado local para o checkbox

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      nomeCompleto: student.nomeCompleto || '',
      cpf: student.cpf || '',
      matricula: student.matricula || '',
      email: student.email || '',
      biografia: student.biografia || '',
      telefone: student.telefone || '',
      contatoResponsaveis: student.contatoResponsaveis || '',
      sexo: student.sexo === 'M' ? 'Masculino' : student.sexo === 'F' ? 'Feminino' : undefined,
      rg: student.rg || '',
      restricoesMedicas: student.restricoesMedicas || '',
      login: student.login || '',
      senha: student.senha || '',
    },
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      updateStudent({ foto: file });
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    updateStudent({ foto: undefined, fotoUrl: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (student.fotoUrl) setPhotoPreview(student.fotoUrl);
  }, [student.fotoUrl]);

  useEffect(() => {
    const age = calculateAge(selectedDate || null);
    setIsOver18(age >= 18);
    if (age < 18) {
      setIsSelfResponsible(false); // Garante que a opção seja desmarcada se a idade mudar para menor de 18
    }
  }, [selectedDate]);

  // Handler simplificado para o checkbox
  const handleSelfResponsibleChange = (checked: boolean) => {
    if (!isOver18 && checked) {
      toast.warning("O aluno deve ter 18 anos ou mais para ser seu próprio responsável.");
      return;
    }
    // Apenas atualiza o estado local. A lógica será enviada ao backend no submit.
    setIsSelfResponsible(checked);
  };

  const onSubmit = async (data: StudentFormData) => {
    setSubmitting(true);
    try {
      const yyyyMMdd = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
      const fotoFile = fileInputRef.current?.files?.[0] ?? (student.foto instanceof File ? student.foto : null);

      const payload = {
        nome: data.nomeCompleto, cpf: data.cpf, rg: data.rg, matricula: data.matricula,
        data_nascimento: yyyyMMdd, email: data.email, telefone: data.telefone, sexo: data.sexo,
        contato_responsaveis: data.contatoResponsaveis, biografia: data.biografia ?? '',
        restricoes_medicas: data.restricoesMedicas ?? '', login: data.login, senha: data.senha,
        foto: fotoFile,
        // Envia o status do checkbox para o backend
        aluno_e_responsavel: isSelfResponsible,
      };

      const studentId = state.data.student.id;
      const response = await sendStudentData(payload, studentId);

      if (!studentId && response.id) {
        updateStudent({ id: response.id });
      }
      
      updateStudent({
        ...data,
        sexo: data.sexo === 'Masculino' ? 'M' : 'F',
        dataNascimento: selectedDate || null,
      });

      // Se o aluno for o próprio responsável, pula a etapa de responsáveis
      if (isSelfResponsible) {
        toast.info("Aluno definido como responsável. Etapa de responsáveis pulada.");
        completeStep('student');
        completeStep('responsible'); // Marca a etapa de responsável como concluída
        setCurrentStep('documents'); // Pula para documentos
      } else {
        completeStep('student');
        setCurrentStep('searchCpf');
      }

    } catch (err: any) {
      toast.error(err.message || 'Não foi possível salvar os dados do aluno.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
            <span>Dados Pessoais do Aluno</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Foto do Aluno</Label>
            <div className="mt-2 flex items-center space-x-4">
              <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-x-2">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Selecionar Foto
                </Button>
                {photoPreview && (
                  <Button type="button" variant="outline" size="sm" onClick={removePhoto}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="nomeCompleto">Nome Completo *</Label>
              <Input id="nomeCompleto" {...form.register('nomeCompleto')} className="mt-1" />
              {form.formState.errors.nomeCompleto && <p className="text-red-500 text-sm mt-1">{form.formState.errors.nomeCompleto.message}</p>}
            </div>

            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input id="cpf" {...form.register('cpf')} placeholder="000.000.000-00" className="mt-1" />
              {form.formState.errors.cpf && <p className="text-red-500 text-sm mt-1">{form.formState.errors.cpf.message}</p>}
            </div>

            <div>
              <Label htmlFor="rg">RG *</Label>
              <Input id="rg" {...form.register('rg')} className="mt-1" />
              {form.formState.errors.rg && <p className="text-red-500 text-sm mt-1">{form.formState.errors.rg.message}</p>}
            </div>

            <div>
              <Label htmlFor="matricula">Matrícula *</Label>
              <Input id="matricula" {...form.register('matricula')} className="mt-1" />
              {form.formState.errors.matricula && <p className="text-red-500 text-sm mt-1">{form.formState.errors.matricula.message}</p>}
            </div>

            <div>
              <Label>Data de Nascimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal mt-1', !selectedDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : <span>Selecionar data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1950}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Sexo *</Label>
              <Select value={form.watch('sexo') || ''} onValueChange={(value) => form.setValue('sexo', value as 'Masculino' | 'Feminino')}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.sexo && <p className="text-red-500 text-sm mt-1">{form.formState.errors.sexo.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input id="email" type="email" {...form.register('email')} className="mt-1" />
              {form.formState.errors.email && <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input id="telefone" {...form.register('telefone')} placeholder="(00) 00000-0000" className="mt-1" />
              {form.formState.errors.telefone && <p className="text-red-500 text-sm mt-1">{form.formState.errors.telefone.message}</p>}
            </div>

            <div>
              <Label htmlFor="contatoResponsaveis">Contato dos Responsáveis *</Label>
              <Input id="contatoResponsaveis" {...form.register('contatoResponsaveis')} className="mt-1" />
              {form.formState.errors.contatoResponsaveis && <p className="text-red-500 text-sm mt-1">{form.formState.errors.contatoResponsaveis.message}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="biografia">Biografia</Label>
              <Textarea id="biografia" {...form.register('biografia')} placeholder="Conte um pouco sobre o aluno..." className="mt-1" rows={3} />
              {form.formState.errors.biografia && <p className="text-red-500 text-sm mt-1">{form.formState.errors.biografia.message}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="restricoesMedicas">Restrições Médicas</Label>
              <Textarea id="restricoesMedicas" {...form.register('restricoesMedicas')} placeholder="Descreva qualquer restrição médica relevante..." className="mt-1" rows={3} />
              {form.formState.errors.restricoesMedicas && <p className="text-red-500 text-sm mt-1">{form.formState.errors.restricoesMedicas.message}</p>}
            </div>
          </div>
          
          {isOver18 && (
            <div className="pt-6 border-t">
              <h3 className="text-base font-semibold mb-3 text-gray-800">Responsabilidade Financeira</h3>
              <div className="flex items-center gap-3 rounded-lg border p-4 bg-blue-50/50 border-blue-200">
                <Checkbox
                  id="selfResponsible"
                  checked={isSelfResponsible}
                  onCheckedChange={(checked) => handleSelfResponsibleChange(Boolean(checked))}
                  className="h-5 w-5"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="selfResponsible"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    O próprio aluno é o responsável financeiro
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Ao marcar, o aluno (maior de 18 anos) receberá todas as comunicações financeiras.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              !
            </div>
            <span>Informações de Acesso</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="login">Login *</Label>
              <Input id="login" {...form.register('login')} placeholder="nome.de.usuario" className="mt-1" />
              {form.formState.errors.login && <p className="text-red-500 text-sm mt-1">{form.formState.errors.login.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="senha">Senha *</Label>
              <Input id="senha" type="password" {...form.register('senha')} placeholder="********" className="mt-1" />
              {form.formState.errors.senha && <p className="text-red-500 text-sm mt-1">{form.formState.errors.senha.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" className="gradient-primary text-primary-foreground px-8" disabled={submitting}>
          {submitting ? 'Salvando…' : 'Continuar'}
        </Button>
      </div>
    </form>
  );
}
