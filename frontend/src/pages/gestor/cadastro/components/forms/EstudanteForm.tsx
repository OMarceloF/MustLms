// frontend/src/pages/gestor/cadastro/components/forms/EstudanteForm.tsx

import React, { useRef, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Upload, X, Loader2, User, MapPin, Lock, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';

import { useRegistration } from '../../contexts/RegistrationContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import { cn } from '../../../../lib/utils';

// Schema de validação (matricula não é mais validada aqui)
const studentSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().min(14, 'CPF inválido, preencha completamente').max(14),
  rg: z.string().min(1, 'RG é obrigatório'),
  email: z.string().email('Email inválido'),
  biografia: z.string().max(500, 'Biografia deve ter no máximo 500 caracteres').optional().or(z.literal('')),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  sexo: z.enum(['Masculino', 'Feminino'], { required_error: 'Sexo é obrigatório' }),
  login: z.string().min(3, 'Login deve ter pelo menos 3 caracteres'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  restricoesMedicas: z.string().optional(),
  endereco: z.object({
    cep: z.string().optional().or(z.literal('')),
    logradouro: z.string().optional().or(z.literal('')),
    numero: z.string().optional().or(z.literal('')),
    bairro: z.string().optional().or(z.literal('')),
    cidade: z.string().optional().or(z.literal('')),
    estado: z.string().optional().or(z.literal('')),
    complemento: z.string().optional(),
  }).optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

// Funções auxiliares
const formatCPF = (value: string) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14);
const formatRG = (value: string) => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1})$/, '$1-$2').slice(0, 12);

export function StudentForm() {
  const { state, updateStudent, setCurrentStep, completeStep } = useRegistration();
  const { student } = state.data;
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(student.fotoUrl || null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(student.dataNascimento ? new Date(student.dataNascimento) : undefined);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOver18, setIsOver18] = useState<boolean>(differenceInYears(new Date(), student.dataNascimento || new Date()) >= 18);
  const [isSelfResponsible, setIsSelfResponsible] = useState(false);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      nomeCompleto: student.nomeCompleto || '',
      cpf: student.cpf || '',
      rg: student.rg || '',
      email: student.email || '',
      biografia: student.biografia || '',
      telefone: student.telefone || '',
      sexo: student.sexo === 'M' ? 'Masculino' : student.sexo === 'F' ? 'Feminino' : undefined,
      login: student.login || '',
      senha: student.senha || '',
      restricoesMedicas: student.restricoesMedicas || '',
      endereco: student.endereco || {},
    },
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };
  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (student.fotoUrl) updateStudent({ fotoUrl: null });
  };
  const handleSelfResponsibleChange = (checked: boolean) => {
    if (!isOver18 && checked) {
      toast.warning("O aluno deve ter 18 anos ou mais para ser seu próprio responsável.");
      return;
    }
    setIsSelfResponsible(checked);
  };
  useEffect(() => { if (student.fotoUrl) setPhotoPreview(student.fotoUrl); }, [student.fotoUrl]);
  useEffect(() => {
    const age = differenceInYears(new Date(), selectedDate || new Date());
    setIsOver18(age >= 18);
    if (age < 18) setIsSelfResponsible(false);
  }, [selectedDate]);

  const onSubmit = async (data: StudentFormData) => {
    setSubmitting(true);
    try {
      const yyyyMMdd = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
      const fotoFile = fileInputRef.current?.files?.[0];

      const payload: any = {
        nome: data.nomeCompleto, cpf: data.cpf, rg: data.rg,
        data_nascimento: yyyyMMdd, email: data.email, telefone: data.telefone, sexo: data.sexo,
        biografia: data.biografia ?? '',
        restricoes_medicas: data.restricoesMedicas ?? '', login: data.login, senha: data.senha,
        aluno_e_responsavel: isSelfResponsible,
        endereco: data.endereco,
      };

      if (fotoFile) payload.foto = fotoFile;
      else if (student.fotoUrl) payload.fotoUrl = student.fotoUrl;

      const formData = new FormData();
      for (const key in payload) {
        const value = payload[key];
        if (value !== null && value !== undefined) {
          if (key === 'endereco' && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      }

      const studentId = state.data.student.id;
      const url = studentId ? `/api/alunos/${studentId}` : '/api/alunos';
      const method = studentId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: formData });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Ocorreu um erro no servidor.' }));
        throw new Error(errorData.message || `Erro ao ${method === 'POST' ? 'criar' : 'atualizar'} aluno`);
      }
      const response = await res.json();

      const updatedStudentData = {
        ...data,
        sexo: data.sexo === 'Masculino' ? 'M' : 'F' as 'M' | 'F',
        dataNascimento: selectedDate || null,
        id: response.id || studentId,
        fotoUrl: response.fotoUrl || photoPreview,
        matricula: response.matricula || student.matricula,
      };
      updateStudent(updatedStudentData);
      
      toast.success(`Dados do aluno ${studentId ? 'atualizados' : 'salvos'} com sucesso!`);

      if (isSelfResponsible) {
        completeStep('student'); completeStep('searchCpf'); completeStep('responsible');
        setCurrentStep('documents');
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* CARD 1: DADOS PESSOAIS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl"><User className="h-6 w-6" /> Dados Pessoais</CardTitle>
          <CardDescription>Informações de identificação e contato do aluno.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seção da Foto */}
          <div>
            <Label>Foto de Perfil</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="relative">
                <img src={photoPreview || '/placeholder-avatar.png'} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-muted" />
                {photoPreview && (<Button type="button" variant="destructive" size="icon" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full" onClick={removePhoto}><X className="h-4 w-4" /></Button>)}
              </div>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Alterar Foto</Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
          </div>

          <div className="border-t border-border -mx-6"></div>

          {/* Seção de Documentos e Dados Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              <Label htmlFor="nomeCompleto">Nome Completo *</Label>
              <Input id="nomeCompleto" {...form.register('nomeCompleto')} className="mt-1" />
              {form.formState.errors.nomeCompleto && <p className="text-destructive text-sm mt-1">{form.formState.errors.nomeCompleto.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Controller name="cpf" control={form.control} render={({ field }) => ( <Input {...field} id="cpf" placeholder="000.000.000-00" className="mt-1" onChange={(e) => field.onChange(formatCPF(e.target.value))} /> )} />
              {form.formState.errors.cpf && <p className="text-destructive text-sm mt-1">{form.formState.errors.cpf.message}</p>}
            </div>

            <div>
              <Label htmlFor="rg">RG *</Label>
              <Controller name="rg" control={form.control} render={({ field }) => ( <Input {...field} id="rg" placeholder="00.000.000-0" className="mt-1" onChange={(e) => field.onChange(formatRG(e.target.value))} /> )} />
              {form.formState.errors.rg && <p className="text-destructive text-sm mt-1">{form.formState.errors.rg.message}</p>}
            </div>
            
            {/* ======================================================================= */}
            {/* MODIFICAÇÃO: Campo de Matrícula alterado para exibição */}
            {/* ======================================================================= */}
            <div>
              <Label htmlFor="matricula">Matrícula</Label>
              {student.matricula ? (
                <div className="mt-1 flex items-center gap-2 p-2 h-10 border rounded-md bg-gray-100 text-gray-600">
                  <BadgeCheck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{student.matricula}</span>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2 p-2 h-10 border border-dashed rounded-md text-gray-500">
                  <span className="text-sm italic">Será gerada automaticamente</span>
                </div>
              )}
            </div>

            <div>
              <Label>Data de Nascimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal mt-1', !selectedDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : <span>Selecionar data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus captionLayout="dropdown" fromYear={1950} toYear={new Date().getFullYear()} />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Sexo *</Label>
              <Select value={form.watch('sexo') || ''} onValueChange={(value) => form.setValue('sexo', value as 'Masculino' | 'Feminino')}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.sexo && <p className="text-destructive text-sm mt-1">{form.formState.errors.sexo.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input id="email" type="email" {...form.register('email')} className="mt-1" />
              {form.formState.errors.email && <p className="text-destructive text-sm mt-1">{form.formState.errors.email.message}</p>}
            </div>

            <div className="lg:col-span-3">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input id="telefone" {...form.register('telefone')} placeholder="(00) 00000-0000" className="mt-1" />
              {form.formState.errors.telefone && <p className="text-destructive text-sm mt-1">{form.formState.errors.telefone.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: ENDEREÇO */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl"><MapPin className="h-6 w-6" /> Endereço Residencial</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-2"><Label htmlFor="cep">CEP</Label><Input id="cep" {...form.register('endereco.cep')} placeholder="00000-000" className="mt-1" /></div>
                <div className="md:col-span-4"><Label htmlFor="logradouro">Logradouro (Rua/Avenida)</Label><Input id="logradouro" {...form.register('endereco.logradouro')} className="mt-1" /></div>
                <div className="md:col-span-2"><Label htmlFor="numero">Número</Label><Input id="numero" {...form.register('endereco.numero')} className="mt-1" /></div>
                <div className="md:col-span-4"><Label htmlFor="complemento">Complemento</Label><Input id="complemento" {...form.register('endereco.complemento')} placeholder="Apto, Bloco, Casa" className="mt-1" /></div>
                <div className="md:col-span-2"><Label htmlFor="bairro">Bairro</Label><Input id="bairro" {...form.register('endereco.bairro')} className="mt-1" /></div>
                <div className="md:col-span-3"><Label htmlFor="cidade">Cidade</Label><Input id="cidade" {...form.register('endereco.cidade')} className="mt-1" /></div>
                <div className="md:col-span-1"><Label htmlFor="estado">UF</Label><Input id="estado" {...form.register('endereco.estado')} maxLength={2} placeholder="MG" className="mt-1" /></div>
            </div>
        </CardContent>
      </Card>

      {/* CARD 3: INFORMAÇÕES ADICIONAIS */}
      <Card>
        <CardHeader><CardTitle className="text-xl">Informações Adicionais</CardTitle></CardHeader>
        <CardContent className="space-y-6">
            <div><Label htmlFor="biografia">Biografia</Label><Textarea id="biografia" {...form.register('biografia')} placeholder="Conte um pouco sobre o aluno, seus interesses e objetivos..." className="mt-1" rows={4} /></div>
            <div><Label htmlFor="restricoesMedicas">Restrições Médicas ou Alergias</Label><Textarea id="restricoesMedicas" {...form.register('restricoesMedicas')} placeholder="Descreva qualquer condição médica, alergia ou necessidade especial relevante..." className="mt-1" rows={4} /></div>
        </CardContent>
      </Card>

      {/* CARD 4: ACESSO E RESPONSABILIDADE */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-3 text-xl"><Lock className="h-6 w-6" /> Acesso e Responsabilidade</CardTitle></CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><Label htmlFor="login">Login *</Label><Input id="login" {...form.register('login')} placeholder="nome.de.usuario" className="mt-1" />{form.formState.errors.login && <p className="text-destructive text-sm mt-1">{form.formState.errors.login.message}</p>}</div>
                <div><Label htmlFor="senha">Senha *</Label><Input id="senha" type="password" {...form.register('senha')} placeholder="••••••••" className="mt-1" />{form.formState.errors.senha && <p className="text-destructive text-sm mt-1">{form.formState.errors.senha.message}</p>}</div>
            </div>
            {isOver18 && (
                <>
                    <div className="border-t border-border -mx-6"></div>
                    <div>
                        <h3 className="text-base font-medium mb-3 text-foreground">Responsabilidade Financeira</h3>
                        <div className="flex items-start gap-4 rounded-lg border p-4 bg-muted/50">
                            <Checkbox id="selfResponsible" checked={isSelfResponsible} onCheckedChange={(checked) => handleSelfResponsibleChange(Boolean(checked))} className="mt-1 h-5 w-5" />
                            <div className="grid gap-1.5">
                                <label htmlFor="selfResponsible" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">O próprio aluno é o responsável financeiro</label>
                                <p className="text-sm text-muted-foreground">Ao marcar, o aluno (maior de 18 anos) receberá todas as comunicações financeiras e será o titular do contrato.</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </CardContent>
      </Card>

      {/* BOTÃO DE AÇÃO FINAL */}
      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" className="px-10" disabled={submitting}>
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar e Continuar'}
        </Button>
      </div>
    </form>
  );
}
