import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegistration } from '../../contexts/RegistrationContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ArrowLeft, Crown, Pencil, Trash2, Search, Info, ShieldCheck, User2, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

/* Helper local para classnames */
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const responsibleSchema = z.object({
  nomeResponsavel: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
  rg: z.string().min(1, 'RG é obrigatório'),
  email: z.string().email('Email inválido'),
  numero1: z.string().min(10, 'Número deve ter pelo menos 10 dígitos'),
  numero2: z.string().optional(),
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numeroEndereco: z.string().min(1, 'Número é obrigatório'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  cep: z.string().min(8, 'CEP deve ter 8 dígitos'),
  grauParentesco: z.string().min(1, 'Grau de parentesco é obrigatório'),
  telefoneContato: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  nacionalidade: z.string().min(1, 'Nacionalidade é obrigatória'),
  estadoCivil: z.string().min(1, 'Estado civil é obrigatório'),
  profissao: z.string().min(1, 'Profissão é obrigatória'),
});

type ResponsibleFormData = z.infer<typeof responsibleSchema>;

type BackendResponsavel = {
  id: number;
  nome: string;
  cpf: string | null;
  rg: string | null;
  email: string | null;
  numero1: string | null;
  numero2: string | null;
  telefone: string | null;
  nacionalidade: string | null;
  grau_parentesco: string | null;
  estado_civil: string | null;
  profissao: string | null;
  logradouro: string | null;
  numero_casa: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  responsavel_financeiro?: 'Sim' | 'Não' | string | null;
};

export function ResponsibleForm() {
  const { state, updateResponsible, setCurrentStep, completeStep } = useRegistration();
  const { responsible } = state.data;
  const params = useParams<{ id?: string }>();

  const alunoId = useMemo(() => {
    const s: any = state?.data;
    return s?.student?.id || s?.contract?.alunoId || params.id || null;
  }, [state, params]);

  const [list, setList] = useState<BackendResponsavel[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const form = useForm<ResponsibleFormData>({
    resolver: zodResolver(responsibleSchema),
    defaultValues: {
      nomeResponsavel: responsible.nomeResponsavel,
      cpf: responsible.cpf,
      rg: responsible.rg,
      email: responsible.email,
      numero1: responsible.numero1,
      numero2: responsible.numero2 || '',
      logradouro: responsible.logradouro,
      numeroEndereco: responsible.numeroEndereco,
      bairro: responsible.bairro,
      cidade: responsible.cidade,
      cep: responsible.cep,
      grauParentesco: responsible.grauParentesco,
      telefoneContato: responsible.telefoneContato,
      nacionalidade: responsible.nacionalidade,
      estadoCivil: responsible.estadoCivil,
      profissao: responsible.profissao,
    },
    mode: 'onChange',
  });

  const { isDirty } = form.formState;

  async function fetchResponsaveis() {
    if (!alunoId) return;
    try {
      setLoadingList(true);
      setErrorMsg(null);
      const res = await fetch(`/api/alunos/${alunoId}/responsaveis`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao carregar responsáveis');
      }
      const data = await res.json();
      const arr: BackendResponsavel[] = Array.isArray(data) ? data : data?.responsaveis || [];
      setList(arr);
    } catch (e: any) {
      setErrorMsg(e?.message || 'Erro ao carregar responsáveis');
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    if (alunoId) {
      fetchResponsaveis();
    }
  }, [alunoId]);

  function payloadFromForm(data: ResponsibleFormData) {
    return {
      nome: data.nomeResponsavel,
      cpf: somenteDigitos(data.cpf),
      rg: somenteDigitos(data.rg),
      email: data.email,
      grau_parentesco: data.grauParentesco,
      estado_civil: data.estadoCivil,
      numero1: somenteDigitos(data.numero1),
      numero2: data.numero2 ? somenteDigitos(data.numero2) : null,
      telefone: somenteDigitos(data.telefoneContato),
      nacionalidade: data.nacionalidade,
      profissao: data.profissao,
      logradouro: data.logradouro,
      numero_casa: data.numeroEndereco,
      bairro: data.bairro,
      cidade: data.cidade,
      cep: somenteDigitos(data.cep),
      responsavel_financeiro: responsible.responsavelFinanceiro === true,
      id_aluno1: alunoId,
    };
  }

  function payloadMinimalForAluno(data: ResponsibleFormData) {
    return {
      nome: data.nomeResponsavel,
      parentesco: data.grauParentesco,
      telefoneContato: somenteDigitos(data.telefoneContato),
      telefone: somenteDigitos(data.telefoneContato),
      email: data.email || null,
      cpf: somenteDigitos(data.cpf) || null,
      rg: somenteDigitos(data.rg),
      numero1: somenteDigitos(data.numero1),
      numero2: data.numero2 ? somenteDigitos(data.numero2) : null,
      responsavel_financeiro: responsible.responsavelFinanceiro ? 'Sim' : 'Não',
    };
  }

  function resetFormToEmpty() {
    form.reset({
      nomeResponsavel: '', cpf: '', rg: '', email: '', numero1: '', numero2: '',
      logradouro: '', numeroEndereco: '', bairro: '', cidade: '', cep: '',
      grauParentesco: '', telefoneContato: '', nacionalidade: '', estadoCivil: '', profissao: '',
    });
    setEditingId(null);
    updateResponsible({ responsavelFinanceiro: false });
    requestAnimationFrame(() => {
      (document.getElementById('nomeResponsavel') as HTMLInputElement | null)?.focus();
    });
  }

  async function save(data: ResponsibleFormData, keepOnForm = false) {
    const valid = await form.trigger();
    if (!valid) return;

    setSaving(true);
    setErrorMsg(null);
    try {
      const checkedFinanceiro = Boolean(responsible.responsavelFinanceiro);

      if (editingId) {
        const res = await fetch(`/api/responsaveis/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadFromForm(data)),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Falha ao atualizar responsável.');
        }
        
        // Atualiza a lista localmente para refletir a mudança imediatamente
        setList(prevList => {
            const updatedList = prevList.map(r => {
                if (r.id === editingId) {
                    return { ...r, ...payloadFromForm(data), responsavel_financeiro: checkedFinanceiro ? 'Sim' : 'Não' };
                }
                // Se o item editado se tornou financeiro, desmarca os outros
                if (checkedFinanceiro) {
                    return { ...r, responsavel_financeiro: 'Não' };
                }
                return r;
            });
            return updatedList;
        });

        resetFormToEmpty();
        toast.success("Responsável atualizado com sucesso!");
        return;
      }

      const res = await fetch(`/api/alunos/${alunoId}/responsaveis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadMinimalForAluno(data)),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha ao criar responsável.');
      }
      const created = await res.json();
      
      // Atualiza a lista localmente
      setList(prevList => {
          const newList = checkedFinanceiro ? prevList.map(r => ({ ...r, responsavel_financeiro: 'Não' })) : prevList;
          return [created.responsavel, ...newList];
      });

      if (keepOnForm) {
        resetFormToEmpty();
      } else {
        // Não avança de etapa automaticamente ao salvar
        toast.success("Responsável adicionado à lista!");
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Falha ao salvar responsável');
      toast.error(e.message || 'Falha ao salvar responsável');
    } finally {
      setSaving(false);
    }
  }

  async function removeResponsavel(id: number) {
    if (!window.confirm('Remover este responsável?')) return;

    const snapshot = [...list];
    setList(prev => prev.filter((r) => r.id !== id));
    if (editingId === id) resetFormToEmpty();

    if (!alunoId) return;

    try {
      setSaving(true);
      setErrorMsg(null);
      const res = await fetch(`/api/responsaveis/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const errorData = await res.json();
        setList(snapshot);
        throw new Error(errorData.error || 'Erro ao remover responsável');
      }
      toast.success("Responsável removido com sucesso.");
      // Garante que, se o removido era financeiro, outro seja promovido (visualmente)
      await fetchResponsaveis(); 
    } catch (e: any) {
      setErrorMsg(e?.message);
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  const onSubmitAndAddAnother = (data: ResponsibleFormData) => save(data, true);
  const goBack = () => setCurrentStep('searchCpf');
  
  function startEdit(r: BackendResponsavel) {
    setEditingId(r.id);
    form.reset({
      nomeResponsavel: r.nome || '',
      cpf: r.cpf || '',
      rg: r.rg || '',
      email: r.email || '',
      numero1: r.numero1 || '',
      numero2: r.numero2 || '',
      logradouro: r.logradouro || '',
      numeroEndereco: r.numero_casa || '',
      bairro: r.bairro || '',
      cidade: r.cidade || '',
      cep: r.cep || '',
      grauParentesco: r.grau_parentesco || '',
      telefoneContato: r.telefone || '',
      nacionalidade: r.nacionalidade || '',
      estadoCivil: r.estado_civil || '',
      profissao: r.profissao || '',
    });
    updateResponsible({ responsavelFinanceiro: r.responsavel_financeiro === 'Sim' });
    requestAnimationFrame(() => {
      (document.getElementById('nomeResponsavel') as HTMLInputElement | null)?.focus();
    });
  }

  function cancelEdit() {
    resetFormToEmpty();
  }

  // =================================================================
  // INÍCIO DA NOVA LÓGICA PARA "CONTINUAR"
  // =================================================================
  const handleContinue = () => {
    // Validação 1: Deve haver pelo menos um responsável na lista.
    if (list.length === 0) {
      toast.error("É necessário ter pelo menos um responsável vinculado para continuar.");
      return;
    }

    // Validação 2: Deve haver exatamente um responsável financeiro.
    const financialResponsibleCount = list.filter(r => r.responsavel_financeiro === 'Sim').length;

    if (financialResponsibleCount === 0) {
      toast.error("Nenhum responsável financeiro foi definido. Por favor, edite um responsável e marque-o como financeiro.");
      return;
    }

    if (financialResponsibleCount > 1) {
      // Este caso é raro devido às proteções do backend, mas é uma boa salvaguarda no frontend.
      toast.error("Há mais de um responsável financeiro definido. Por favor, corrija isso antes de continuar.");
      return;
    }

    // Se todas as validações passaram, avança para a próxima etapa.
    toast.info("Lista de responsáveis validada. Avançando...");
    completeStep('responsible');
    setCurrentStep('documents');
  };
  // =================================================================
  // FIM DA NOVA LÓGICA
  // =================================================================

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = list;
    if (q) {
      items = items.filter((r) =>
        [firstName(r.nome), r.grau_parentesco].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    items = [...items].sort((a, b) => {
      const aF = a.responsavel_financeiro === 'Sim' ? 0 : 1;
      const bF = b.responsavel_financeiro === 'Sim' ? 0 : 1;
      if (aF !== bF) return aF - bF;
      return firstName(a.nome).localeCompare(firstName(b.nome));
    });
    return items;
  }, [list, query]);

  const Skeleton = () => (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-2xl border px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-32 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          </div>
          <div className="h-4 w-4 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit((data) => save(data, false))} className="space-y-6">
      {errorMsg && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <Info className="h-4 w-4" /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                  <span>Dados do Responsável {editingId ? '(editando)' : ''}</span>
                </span>
                {isDirty && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    Alterações não salvas
                  </span>
                )}
              </CardTitle>
              {editingId && (
                <div className="mt-3 text-xs rounded-md border border-amber-200 bg-amber-50 text-amber-700 px-3 py-2 flex items-center justify-between">
                  <span>🔧 Editando responsável #{editingId}.</span>
                  <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                    Cancelar edição (Esc)
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="nomeResponsavel">Nome Completo *</Label>
                  <Input id="nomeResponsavel" {...form.register('nomeResponsavel')} className="mt-1" />
                  {form.formState.errors.nomeResponsavel && <p className="text-destructive text-sm mt-1">{form.formState.errors.nomeResponsavel.message}</p>}
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input id="cpf" {...form.register('cpf')} placeholder="000.000.000-00" className="mt-1" />
                  {form.formState.errors.cpf && <p className="text-destructive text-sm mt-1">{form.formState.errors.cpf.message}</p>}
                </div>
                <div>
                  <Label htmlFor="rg">RG *</Label>
                  <Input id="rg" {...form.register('rg')} className="mt-1" />
                  {form.formState.errors.rg && <p className="text-destructive text-sm mt-1">{form.formState.errors.rg.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input id="email" type="email" {...form.register('email')} className="mt-1" />
                  {form.formState.errors.email && <p className="text-destructive text-sm mt-1">{form.formState.errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="grauParentesco">Grau de Parentesco *</Label>
                  <Select value={form.watch('grauParentesco') || ''} onValueChange={(value) => form.setValue('grauParentesco', value, { shouldValidate: true })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pai">Pai</SelectItem>
                      <SelectItem value="Mãe">Mãe</SelectItem>
                      <SelectItem value="Avô">Avô</SelectItem>
                      <SelectItem value="Avó">Avó</SelectItem>
                      <SelectItem value="Tutor(a)">Tutor(a)</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.grauParentesco && <p className="text-destructive text-sm mt-1">{form.formState.errors.grauParentesco.message}</p>}
                </div>
                <div>
                  <Label htmlFor="estadoCivil">Estado Civil *</Label>
                  <Select value={form.watch('estadoCivil') || ''} onValueChange={(value) => form.setValue('estadoCivil', value, { shouldValidate: true })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                      <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                      <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                      <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                      <SelectItem value="União Estável">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.estadoCivil && <p className="text-destructive text-sm mt-1">{form.formState.errors.estadoCivil.message}</p>}
                </div>
                <div>
                  <Label htmlFor="numero1">Telefone Principal *</Label>
                  <Input id="numero1" {...form.register('numero1')} placeholder="(00) 00000-0000" className="mt-1" />
                  {form.formState.errors.numero1 && <p className="text-destructive text-sm mt-1">{form.formState.errors.numero1.message}</p>}
                </div>
                <div>
                  <Label htmlFor="numero2">Telefone Secundário</Label>
                  <Input id="numero2" {...form.register('numero2')} placeholder="(00) 00000-0000" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="telefoneContato">Telefone de Contato *</Label>
                  <Input id="telefoneContato" {...form.register('telefoneContato')} placeholder="(00) 00000-0000" className="mt-1" />
                  {form.formState.errors.telefoneContato && <p className="text-destructive text-sm mt-1">{form.formState.errors.telefoneContato.message}</p>}
                </div>
                <div>
                  <Label htmlFor="nacionalidade">Nacionalidade *</Label>
                  <Input id="nacionalidade" {...form.register('nacionalidade')} className="mt-1" />
                  {form.formState.errors.nacionalidade && <p className="text-destructive text-sm mt-1">{form.formState.errors.nacionalidade.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="profissao">Profissão *</Label>
                  <Input id="profissao" {...form.register('profissao')} className="mt-1" />
                  {form.formState.errors.profissao && <p className="text-destructive text-sm mt-1">{form.formState.errors.profissao.message}</p>}
                </div>
              </div>

              <div className="pt-2 border-t">
                <h3 className="text-sm font-semibold mb-3">Endereço Completo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro *</Label>
                    <Input id="logradouro" {...form.register('logradouro')} placeholder="Rua, Avenida, etc." className="mt-1" />
                    {form.formState.errors.logradouro && <p className="text-destructive text-sm mt-1">{form.formState.errors.logradouro.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="numeroEndereco">Número *</Label>
                    <Input id="numeroEndereco" {...form.register('numeroEndereco')} className="mt-1" />
                    {form.formState.errors.numeroEndereco && <p className="text-destructive text-sm mt-1">{form.formState.errors.numeroEndereco.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input id="bairro" {...form.register('bairro')} className="mt-1" />
                    {form.formState.errors.bairro && <p className="text-destructive text-sm mt-1">{form.formState.errors.bairro.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input id="cidade" {...form.register('cidade')} className="mt-1" />
                    {form.formState.errors.cidade && <p className="text-destructive text-sm mt-1">{form.formState.errors.cidade.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <Input id="cep" {...form.register('cep')} placeholder="00000-000" className="mt-1" />
                    {form.formState.errors.cep && <p className="text-destructive text-sm mt-1">{form.formState.errors.cep.message}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={goBack} className="px-6" disabled={saving}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            <div className="flex items-center gap-2">
              {!editingId && (
                <Button type="button" variant="outline" onClick={form.handleSubmit(onSubmitAndAddAnother)} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar e Adicionar Outro'}
                </Button>
              )}
              
              {editingId ? (
                <Button type="submit" className="gradient-primary text-primary-foreground px-8" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Alterações'}
                </Button>
              ) : (
                <Button type="button" onClick={handleContinue} className="gradient-primary text-primary-foreground px-8" disabled={saving}>
                  Continuar para Documentos
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 h-fit">
          <Card>
            <CardHeader><CardTitle>Configurações Financeiras</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Checkbox id="responsavelFinanceiro" checked={responsible.responsavelFinanceiro} onCheckedChange={(checked) => updateResponsible({ responsavelFinanceiro: Boolean(checked) })} />
                <Label htmlFor="responsavelFinanceiro" className="text-sm font-medium">Este responsável é o responsável financeiro</Label>
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> O responsável financeiro receberá todas as comunicações sobre pagamentos e faturas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Responsáveis vinculados</span>
                <span className="text-xs text-muted-foreground">{list.length} registro(s)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome ou parentesco..." className="pl-10 h-10" />
              </div>

              {loadingList ? (
                <Skeleton />
              ) : filtered.length === 0 ? (
                <EmptyState onAdd={() => { setEditingId(null); updateResponsible({ responsavelFinanceiro: false }); }} />
              ) : (
                <div className="space-y-3">
                  {filtered.map((r) => {
                    const isFinanceiro = r.responsavel_financeiro === 'Sim';
                    const nomeCurto = firstName(r.nome);
                    return (
                      <div key={r.id} className={cn('flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition-all', isFinanceiro ? 'border-primary/40 bg-primary/5' : 'border-border bg-card hover:bg-muted/40')}>
                        <div className="flex items-center gap-4 min-w-0">
                          <Avatar name={r.nome} isFinanceiro={isFinanceiro} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-base truncate">{nomeCurto}</p>
                              {isFinanceiro && (
                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                                  <Crown className="h-3 w-3" /> Financeiro
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{r.grau_parentesco || 'Parentesco não informado'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button type="button" variant="ghost" size="icon" onClick={() => startEdit(r)} title="Editar"><Pencil className="h-5 w-5" /></Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeResponsavel(r.id)} title="Remover"><Trash2 className="h-5 w-5 text-destructive" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

function Avatar({ name, isFinanceiro }: { name?: string | null; isFinanceiro?: boolean }) {
  const initials = (name || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'R';
  return (
    <div className={cn('h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0', isFinanceiro ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')} title={name || 'Responsável'}>
      {initials}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center p-8 rounded-2xl border bg-card">
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <User2 className="h-6 w-6 text-primary" />
      </div>
      <p className="font-medium">Nenhum responsável cadastrado</p>
      <p className="text-sm text-muted-foreground mt-1">
        Cadastre pelo menos um responsável para prosseguir no fluxo de matrícula.
      </p>
      <Button type="button" variant="outline" className="mt-3" onClick={onAdd}>
        Adicionar responsável
      </Button>
    </div>
  );
}

/* --------------------------------- Helpers -------------------------------- */
function somenteDigitos(v: string) {
  return (v || '').replace(/\D+/g, '');
}
function firstName(fullName?: string | null) {
  const s = (fullName || '').trim();
  if (!s) return '';
  return s.split(/\s+/)[0];
}
