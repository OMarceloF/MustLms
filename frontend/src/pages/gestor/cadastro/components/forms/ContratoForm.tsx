import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegistration } from '../../contexts/RegistrationContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ArrowLeft, FileText, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

// Schema de validação do formulário com Zod
const contractSchema = z.object({
  planoPagamento: z.enum(['mensal', 'semestral', 'anual'], { 
    required_error: 'Plano de pagamento é obrigatório' 
  }),
  valorMensalidade: z.number().min(0.01, 'Valor deve ser maior que zero'),
  desconto: z.number().min(0).max(100).optional(),
  tipoDesconto: z.enum(['percentual', 'valor']),
  dataVencimento: z.number().min(1).max(31),
  descricaoBolsa: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

const paymentMethods = [
  { id: 'boleto', label: 'Boleto Bancário', icon: Banknote },
  { id: 'cartao', label: 'Cartão de Crédito/Débito', icon: CreditCard },
  { id: 'pix', label: 'PIX', icon: Smartphone },
  { id: 'debito_automatico', label: 'Débito Automático', icon: CreditCard },
];

export function ContractForm() {
  const { state, updateContract, setCurrentStep, completeStep } = useRegistration();
  const { contract, student, responsible } = state.data;
  
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(
    contract.formaPagamento || []
  );
  const [showContractPreview, setShowContractPreview] = useState(false);

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      planoPagamento: contract.planoPagamento || undefined,
      valorMensalidade: contract.valorMensalidade || 0,
      desconto: contract.desconto || 0,
      tipoDesconto: contract.tipoDesconto || 'percentual',
      dataVencimento: contract.dataVencimento || 5,
      descricaoBolsa: contract.descricaoBolsa || '',
    },
  });

  const handlePaymentMethodChange = (methodId: string) => {
    const newMethods = selectedPaymentMethods.includes(methodId)
      ? selectedPaymentMethods.filter(id => id !== methodId)
      : [...selectedPaymentMethods, methodId];
      
    setSelectedPaymentMethods(newMethods);
    updateContract({ formaPagamento: newMethods });
  };

  const calculateFinalValue = () => {
    const baseValue = form.watch('valorMensalidade') || 0;
    const discount = form.watch('desconto') || 0;
    const discountType = form.watch('tipoDesconto') || 'percentual';
    
    if (discountType === 'percentual') {
      return baseValue * (1 - discount / 100);
    } else {
      return Math.max(0, baseValue - discount);
    }
  };

  const onSubmit = (data: ContractFormData) => {
    if (selectedPaymentMethods.length === 0) {
      toast.error("Selecione pelo menos uma forma de pagamento.");
      return;
    }

    updateContract({
      ...data,
      formaPagamento: selectedPaymentMethods,
    });
    completeStep('contract');
    
    toast.success("Cadastro concluído!", {
      description: "Todas as informações foram salvas com sucesso.",
    });
  };

  const goBack = () => {
    setCurrentStep('documents');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                6
              </div>
              <span>Configurações do Contrato</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Plano de Pagamento *</Label>
                <Select
                  value={form.watch('planoPagamento') || ''}
                  onValueChange={(value) => form.setValue('planoPagamento', value as 'mensal' | 'semestral' | 'anual')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecionar plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="semestral">Semestral (6 meses)</SelectItem>
                    <SelectItem value="anual">Anual (12 meses)</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.planoPagamento && (
                  <p className="text-destructive text-sm mt-1">
                    {form.formState.errors.planoPagamento.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="valorMensalidade">Valor da Mensalidade (R$) *</Label>
                <Input
                  id="valorMensalidade"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('valorMensalidade', { valueAsNumber: true })}
                  className="mt-1"
                  placeholder="0,00"
                />
                {form.formState.errors.valorMensalidade && (
                  <p className="text-destructive text-sm mt-1">
                    {form.formState.errors.valorMensalidade.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                <Select
                  value={form.watch('dataVencimento')?.toString() || ''}
                  onValueChange={(value) => form.setValue('dataVencimento', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Dia do vencimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25].map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="desconto">Desconto</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="desconto"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register('desconto', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  <Select
                    value={form.watch('tipoDesconto') || 'percentual'}
                    onValueChange={(value) => form.setValue('tipoDesconto', value as 'percentual' | 'valor')}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentual">%</SelectItem>
                      <SelectItem value="valor">R$</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bolsa"
                  checked={contract.bolsa}
                  onCheckedChange={(checked) => 
                    updateContract({ bolsa: Boolean(checked) })
                  }
                />
                <Label htmlFor="bolsa" className="text-sm font-medium">
                  Aplicar bolsa de estudos
                </Label>
              </div>
              
              {contract.bolsa && (
                <Textarea
                  placeholder="Descreva os detalhes da bolsa de estudos..."
                  {...form.register('descricaoBolsa')}
                  rows={3}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPaymentMethods.includes(method.id);
                
                return (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handlePaymentMethodChange(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => {}} // O clique é gerenciado pelo div pai
                      />
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{method.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Selecione as formas de pagamento aceitas para este aluno.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Valor base:</span>
              <span>R$ {(form.watch('valorMensalidade') || 0).toFixed(2)}</span>
            </div>
            {(form.watch('desconto') || 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  Desconto ({form.watch('desconto')}{form.watch('tipoDesconto') === 'percentual' ? '%' : ' reais'}):
                </span>
                <span>
                  - R$ {form.watch('tipoDesconto') === 'percentual' 
                    ? ((form.watch('valorMensalidade') || 0) * (form.watch('desconto') || 0) / 100).toFixed(2)
                    : (form.watch('desconto') || 0).toFixed(2)
                  }
                </span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Valor final:</span>
              <span className="text-primary">R$ {calculateFinalValue().toFixed(2)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Vencimento: Todo dia {form.watch('dataVencimento') || 5}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={goBack}
            className="px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowContractPreview(!showContractPreview)}
            >
              <FileText className="w-4 h-4 mr-2" />
              {showContractPreview ? 'Ocultar' : 'Visualizar'} Contrato
            </Button>
            <Button 
              type="submit"
              className="gradient-primary text-primary-foreground px-8"
            >
              Finalizar Cadastro
            </Button>
          </div>
        </div>
      </form>

      {showContractPreview && (
        <Card className="border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-blue-600">Prévia do Contrato</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h4>CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h4>
            <p><strong>Aluno(a):</strong> {student.nomeCompleto || '[Nome do Aluno]'}</p>
            <p><strong>Responsável Financeiro:</strong> {responsible.nomeResponsavel || student.nomeCompleto || '[Nome do Responsável]'}</p>
            <p><strong>Matrícula:</strong> {student.matricula || '[Matrícula]'}</p>
            
            <h5>Cláusula Financeira:</h5>
            <ul>
              <li><strong>Plano de Pagamento:</strong> {form.watch('planoPagamento') || '[Não selecionado]'}</li>
              <li><strong>Valor da Parcela:</strong> R$ {calculateFinalValue().toFixed(2)}</li>
              <li><strong>Data de Vencimento:</strong> Dia {form.watch('dataVencimento') || 5} de cada mês</li>
              <li><strong>Formas de Pagamento Aceitas:</strong> {selectedPaymentMethods.length > 0 
                ? selectedPaymentMethods.map(id => paymentMethods.find(p => p.id === id)?.label).join(', ')
                : '[Nenhuma selecionada]'
              }</li>
            </ul>

            {contract.bolsa && (
              <>
                <h5>Cláusula de Bolsa de Estudos:</h5>
                <p>{form.watch('descricaoBolsa') || 'Bolsa de estudos aplicada conforme critérios institucionais e acordo prévio.'}</p>
              </>
            )}

            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md mt-4">
              <p><strong>Atenção:</strong> Esta é apenas uma prévia para conferência dos dados. O contrato oficial com todas as cláusulas será gerado e disponibilizado no portal do aluno e do responsável após a finalização do cadastro.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
