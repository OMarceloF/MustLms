import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Button } from "../gestor/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../gestor/components/ui/card";
import { Badge } from "../gestor/components/ui/badge";
import axios from "axios";
import SidebarGestor from "../gestor/components/Sidebar";
import TopbarGestorAuto from "../gestor/components/TopbarGestorAuto";
import { AutocompleteAluno } from "./components/AutocompleteAluno";

interface ContratoPreenchido {
  id: number;
  contrato_id: number;
  aluno_id: number;
  dados_preenchidos: Record<string, string>;
  contrato_url: string | null;
  criado_em: string;
  atualizado_em: string;
  situacao_contrato: string;
  nome_contrato: string;
  numero_contrato: string;
  aluno_nome: string;
  aluno_status: string;
  aluno_cpf: string;
  aluno_serie: string;
  aluno_turma: string;
  mensalidade_valor: string;
  mensalidade_data_inicial: string;
}

interface Aluno {
  id: number;
  nome: string;
  cpf: string;
  numero_contrato: string;
  situacao_contrato: string;
  situacao_aluno: string;
  ano_escolar: string;
  turma: string;
  plano_financeiro: string;
  valor_matricula: string;
  valor_mensalidade: string;
  valor_material_didatico: string;
  desconto_aplicado: string;
  cartao_final?: string;
}

interface Mensalidade {
  id: number;
  referencia: string;
  valor_original: string;
  desconto_percentual: string;
  valor_com_desconto: string;
  data_vencimento: string;
  status: "pago" | "aguardando" | "atrasado";
  data_pagamento: string | null;
  forma_pagamento: string | null;
  comprovante_url: string | null;
  observacao: string | null;
}

const FichaFinanceiraAluno: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>("");

  const [contratosPreenchidos, setContratosPreenchidos] = useState<ContratoPreenchido[]>([]);
  const [contratoSelecionado, setContratoSelecionado] = useState<ContratoPreenchido | null>(null);

  // Estados para alunos e seleção
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);

  // Filtros para mensalidades
  const [filtros, setFiltros] = useState({
    ano: new Date().getFullYear().toString(),
    status: ""
  });

  const formatarStatus = (status: string | undefined | null) => {
    if (!status) return "-";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const buscarContratosPreenchidos = async () => {
    try {
      const res = await axios.get<ContratoPreenchido[]>(`/api/contratos_preenchidos`);
      setContratosPreenchidos(res.data);
    } catch (err) {
      console.error("Erro ao buscar contratos preenchidos", err);
    }
  };

  // Buscar lista de alunos
  const buscarAlunos = async () => {
    try {
      const res = await axios.get<Aluno[]>(`/api/listar_alunos`);
      setAlunos(res.data);
    } catch (err) {
      console.error("Erro ao buscar alunos", err);
    }
  };

  // Buscar mensalidades do aluno selecionado
  // const buscarMensalidades = async (alunoId: number) => {
  //   try {
  //     const params: any = { aluno_id: alunoId };
  //     if (filtros.ano) params.ano = filtros.ano;
  //     if (filtros.status) params.status = filtros.status;

  //     const res = await axios.get<Mensalidade[]>(
  //       `/api/financeiro/mensalidades/${alunoId}`,
  //       { params }
  //     );
  //     setMensalidades(res.data);
  //   } catch (err) {
  //     console.error("Erro ao buscar mensalidades", err);
  //   }
  // };

  const buscarTransacoes = async (alunoId: number) => {
    try {
      const params: any = {};
      if (filtros.ano) params.ano = filtros.ano;
      if (filtros.status) params.status = filtros.status;

      const res = await axios.get<Mensalidade[]>(
        `/financeiro/transacoes_aluno/${alunoId}`,
        { params }
      );
      setMensalidades(res.data);
    } catch (err) {
      console.error("Erro ao buscar transações", err);
    }
  };


  // Buscar dados detalhados do aluno
  const buscarDadosAluno = async (alunoId: number) => {
    try {
      const res = await axios.get<Aluno>(`/api/alunos/${alunoId}`);
      setAlunoSelecionado(res.data);
      await buscarTransacoes(alunoId);
    } catch (err) {
      console.error("Erro ao buscar dados do aluno", err);
    }
  };

  // const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const novosFiltros = { ...filtros, [e.target.name]: e.target.value };
  //   setFiltros(novosFiltros);

  //   if (alunoSelecionado) {
  //     buscarTransacoes(alunoSelecionado.id);
  //   }
  // };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novosFiltros = { ...filtros, [e.target.name]: e.target.value };
    setFiltros(novosFiltros);

    const alunoId = alunoSelecionado?.id || contratoSelecionado?.aluno_id;
    if (alunoId) {
      buscarTransacoes(alunoId);
    }
  };


  const formatarData = (isoDate: string | null) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString("pt-BR");
  };

  const formatarCPF = (cpf: string | undefined | null) => {
    if (!cpf || cpf === "0") return "-";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatarValor = (valor: string) => {
    return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
  };

  // Gerar query string com filtros aplicados
  const gerarQuery = () => {
    const params = new URLSearchParams();
    if (alunoSelecionado) params.append("aluno_id", alunoSelecionado.id.toString());
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return params.toString();
  };

  // Funções de exportação
  const exportarPDF = () => {
    if (!alunoSelecionado) return;
    const queryString = gerarQuery();
    const url = `/api/financeiro/ficha-aluno/pdf${queryString ? `?${queryString}` : ""}`;
    window.open(url, "_blank");
  };

  const exportarExcel = () => {
    if (!alunoSelecionado) return;
    const queryString = gerarQuery();
    const url = `/api/financeiro/ficha-aluno/excel${queryString ? `?${queryString}` : ""}`;
    window.open(url, "_blank");
  };

  const cadastrarCartao = async () => {
    if (!alunoSelecionado) return;
    // Implementar modal ou redirecionamento para cadastro de cartão
    setMensagemSucesso("Funcionalidade de cadastro de cartão será implementada");
    setTimeout(() => setMensagemSucesso(""), 3000);
  };

  const alterarCartao = async () => {
    if (!alunoSelecionado) return;
    // Implementar modal ou redirecionamento para alteração de cartão
    setMensagemSucesso("Funcionalidade de alteração de cartão será implementada");
    setTimeout(() => setMensagemSucesso(""), 3000);
  };

  function obterValorCampo(campo: string) {
    const chave = `{{${campo}}}`;
    if (!contratoSelecionado) return "-";
    const valor = contratoSelecionado.dados_preenchidos[chave];
    return valor ?? "-";
  }

  function formatarValorMonetario(valor: string) {
    if (!valor) return "-";
    let numero = Number(valor.replace(",", "."));
    if (isNaN(numero)) return valor; // Se não for numérico, retorne o valor literal
    return `R$ ${numero.toFixed(2).replace(".", ",")}`;
  }


  useEffect(() => {
    buscarContratosPreenchidos();
    buscarAlunos();
  }, []);

  useEffect(() => {
    const alunoId = contratoSelecionado?.aluno_id;
    if (alunoId) {
      buscarTransacoes(alunoId);
    }
  }, [contratoSelecionado, filtros]);

  // Gerar anos para o filtro
  const anosDisponiveis = [];
  const anoAtual = new Date().getFullYear();
  for (let i = anoAtual - 5; i <= anoAtual + 1; i++) {
    anosDisponiveis.push(i);
  }

  return (

    <div className="flex">
      {/* Sidebar */}
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page: string) =>
          navigate("/gestor", { state: { activePage: page } })
        }
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />

      <div className="flex-1 flex flex-col pt-20 px-6 ml-[50px] rounded-2xl shadow-md p-6">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Ficha Financeira do Aluno</h1>
              <p className="text-muted-foreground">Consulte e gerencie as informações financeiras dos alunos</p>
            </div>

            {/* Seleção do Aluno */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Selecionar Aluno</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm text-muted-foreground mb-2">Aluno</label>
                    <AutocompleteAluno
                      // CORREÇÃO: Agora usa a lista de alunos, que tem o formato { id, nome } correto.
                      alunos={alunos.map(aluno => ({ id: aluno.id.toString(), nome: aluno.nome }))}

                      // A prop 'value' agora deve ser o ID do aluno, não o nome.
                      value={alunoSelecionado ? alunoSelecionado.id.toString() : ""}

                      onChange={async (id) => {
                        if (id) {
                          // Quando um aluno é selecionado, buscamos seus dados completos.
                          await buscarDadosAluno(Number(id));
                        } else {
                          // Se a seleção for limpa, resetamos os estados.
                          setContratoSelecionado(null);
                          setAlunoSelecionado(null);
                          setMensalidades([]);
                        }
                      }}
                    />

                  </div>
                  {alunoSelecionado && (
                    <div className="flex gap-2">
                      <Button onClick={exportarPDF} variant="destructive">
                        Exportar PDF
                      </Button>
                      <Button onClick={exportarExcel} variant="default">
                        Exportar Excel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {mensagemSucesso && (
              <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded">
                {mensagemSucesso}
              </div>
            )}

            {/* Informações do Aluno */}
            {contratoSelecionado && (
              <>
                {/* Cabeçalho - Dados Contratuais e Acadêmicos */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Informações do Aluno</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Número do Contrato
                        </label>
                        <p className="text-lg text-foreground">{contratoSelecionado?.numero_contrato || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Situação do Contrato
                        </label>
                        <p className="text-lg text-foreground">{contratoSelecionado?.situacao_contrato || "-"}</p>
                        {/* <Badge variant={contratoSelecionado.situacao_contrato === 'Vigente' ? 'default' : 'destructive'}>
                              {contratoSelecionado?.situacao_contrato || "-"}
                            </Badge> */}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Situação do Aluno
                        </label>
                        <p className="text-lg text-foreground">{contratoSelecionado.aluno_status}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Nome Completo
                        </label>
                        <p className="text-lg text-foreground">{contratoSelecionado.aluno_nome}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          CPF
                        </label>
                        <p className="text-lg text-foreground">{obterValorCampo("cpf")}</p>
                      </div>
                      {/* <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                              Ano Escolar
                            </label>
                            <p className="text-lg text-foreground">{alunoSelecionado.ano_escolar}</p>
                          </div> */}
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Série
                        </label>
                        <p className="text-lg text-foreground">{contratoSelecionado?.aluno_serie || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Turma
                        </label>
                        <p className="text-lg text-foreground">{contratoSelecionado?.aluno_turma || "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informações Financeiras Padrão */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Informações Financeiras do Curso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Plano Financeiro
                        </label>
                        <p className="text-lg text-foreground">{contratoSelecionado?.nome_contrato || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Valor da Matrícula
                        </label>
                        <p className="text-lg text-green-600 font-medium">{formatarValorMonetario(obterValorCampo("valor_matricula"))}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Valor do Material Didático
                        </label>
                        <p className="text-lg text-blue-600 font-medium">{formatarValorMonetario(obterValorCampo("valor_material_didatico"))}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Valor da Mensalidade
                        </label>
                        <p className="text-lg text-green-600 font-medium">{formatarValorMonetario(obterValorCampo("valor_mensalidade"))}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Data da 1ª Mensalidade
                        </label>
                        <p className="text-lg text-foreground">{formatarValorMonetario(obterValorCampo("data_primeira_mensalidade"))}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Desconto (%)
                        </label>
                        <p className="text-lg text-orange-600 font-medium">{obterValorCampo("valor_desconto_porcentagem")}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Descrição do Desconto
                        </label>
                        <p className="text-lg text-foreground">{obterValorCampo("descricao_desconto")}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Data de Início do Desconto
                        </label>
                        <p className="text-lg text-foreground">{obterValorCampo("data_inicio_do_desconto")}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Data de Final do Desconto
                        </label>
                        <p className="text-lg text-foreground">{obterValorCampo("data_inicio_do_desconto")}</p>
                      </div>
                      {/* <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                              Cartão Cadastrado
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                              {contratoSelecionado.cartao_final ? (
                                <>
                                  <p className="text-lg text-foreground">**** {contratoSelecionado.cartao_final}</p>
                                  <Button size="sm" variant="outline" onClick={alterarCartao}>
                                    Alterar
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="default" onClick={cadastrarCartao}>
                                  Cadastrar Cartão
                                </Button>
                              )}
                            </div>
                          </div> */}
                    </div>
                  </CardContent>
                </Card>

                {/* Tabela de Mensalidades */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mensalidades do Aluno</CardTitle>
                  </CardHeader>

                  <CardContent>
                    {/* Filto de Mensalidades por status */}
                    <label className="block text-sm text-muted-foreground mb-2">Status</label>
                    <select
                      name="status"
                      value={filtros.status}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Todos</option>
                      <option value="pago">Pago</option>
                      <option value="aguardando">Aguardando</option>
                      <option value="atrasado">Atrasado</option>
                    </select>
                  </CardContent>

                  <CardContent>
                    {mensalidades.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        Nenhuma mensalidade encontrada para os filtros aplicados.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="bg-muted">
                              <th className="px-3 py-2 border border-border">Referência</th>
                              <th className="px-3 py-2 border border-border">Valor Original</th>
                              <th className="px-3 py-2 border border-border">Desconto (%)</th>
                              <th className="px-3 py-2 border border-border">Valor Final</th>
                              <th className="px-3 py-2 border border-border">Vencimento</th>
                              <th className="px-3 py-2 border border-border">Status</th>
                              <th className="px-3 py-2 border border-border">Data Pagamento</th>
                              <th className="px-3 py-2 border border-border">Forma Pagamento</th>
                              <th className="px-3 py-2 border border-border">Comprovante</th>
                              <th className="px-3 py-2 border border-border">Observações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mensalidades.map((mensalidade) => (
                              <tr key={mensalidade.id} className="hover:bg-muted/50">
                                <td className="px-3 py-2 border border-border font-medium">
                                  {mensalidade.referencia || "-"}
                                </td>
                                <td className="px-3 py-2 border border-border">{formatarValor(mensalidade.valor_original)}</td>
                                <td className="px-3 py-2 border border-border">{Number(mensalidade.desconto_percentual).toFixed(2)}%</td>
                                <td className="px-3 py-2 border border-border text-green-600 font-medium">{formatarValor(mensalidade.valor_com_desconto)}</td>
                                <td className="px-3 py-2 border border-border">{formatarData(mensalidade.data_vencimento)}</td>
                                <td className="px-3 py-2 border border-border">
                                  <Badge variant={
                                    mensalidade.status === 'pago' ? 'default' :
                                      mensalidade.status === 'atrasado' ? 'destructive' : 'secondary'
                                  }>
                                    {formatarStatus(mensalidade.status)}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2 border border-border">{formatarData(mensalidade.data_pagamento)}</td>
                                <td className="px-3 py-2 border border-border">{mensalidade.forma_pagamento || "-"}</td>
                                <td className="px-3 py-2 border border-border">
                                  {mensalidade.comprovante_url ? (
                                    <a href={`/${mensalidade.comprovante_url}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                                      Visualizar
                                    </a>
                                  ) : "-"}
                                </td>
                                <td className="px-3 py-2 border border-border">{mensalidade.observacao || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default FichaFinanceiraAluno;