import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import SidebarGestor from "./components/Sidebar";
import TopbarGestorAuto from "./components/TopbarGestorAuto";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../gestor/components/ui/dialog";
import LancamentosContratos from "../financeiro/paginasDeLancamentosPage/LancamentosContratos";
import { toast } from "sonner";

// Dados fictícios para diferentes anos
type Receita = {
  conta: string;
  totalPeriodo: string;
  recebido: string;
  aReceber: string;
};

type Despesa = {
  conta: string;
  totalPeriodo: string;
  pago: string;
  aPagar: string;
};

type Saldo = {
  banco: string;
  saldo: string;
};

type AnoFinanceiro = {
  receitas: Receita[];
  despesas: Despesa[];
  saldos: Saldo[];
};

const DADOS_FICTICIOS: Record<number, AnoFinanceiro> = {
  2024: {
    receitas: [
      { conta: "PLANO MATERIAL DIDÁTICO", totalPeriodo: "R$ 15.000,00", recebido: "R$ 10.000,00", aReceber: "R$ 5.000,00" },
      { conta: "PLANO MATRÍCULAS", totalPeriodo: "R$ 8.000,00", recebido: "R$ 6.500,00", aReceber: "R$ 1.500,00" },
      { conta: "PLANO MENSALIDADES", totalPeriodo: "R$ 120.000,00", recebido: "R$ 50.000,00", aReceber: "R$ 70.000,00" },
    ],
    despesas: [
      { conta: "PAGAMENTO FUNCIONARIOS", totalPeriodo: "R$ 25.000,00", pago: "R$ 10.000,00", aPagar: "R$ 15.000,00" },
      { conta: "PLANO DESPESAS", totalPeriodo: "R$ 3.000,00", pago: "R$ 2.000,00", aPagar: "R$ 1.000,00" },
    ],
    saldos: [
      { banco: "Banco Bradesco", saldo: "R$ 2.500,00" },
      { banco: "BANCO DO BRASIL", saldo: "R$ 58.000,00" },
      { banco: "INTERNO", saldo: "R$ 1.000,00" },
    ],
  },
  2025: {
    receitas: [
      { conta: "PLANO MATERIAL DIDÁTICO", totalPeriodo: "R$ 22.968,91", recebido: "R$ 0,00", aReceber: "R$ 22.968,91" },
      { conta: "PLANO MATRÍCULAS", totalPeriodo: "R$ 16.460,61", recebido: "R$ 3.622,33", aReceber: "R$ 12.838,28" },
      { conta: "PLANO MENSALIDADES", totalPeriodo: "R$ 172.308,62", recebido: "R$ 5.052,05", aReceber: "R$ 167.256,57" },
    ],
    despesas: [
      { conta: "PAGAMENTO FUNCIONARIOS", totalPeriodo: "R$ 30.865,00", pago: "R$ 1.665,00", aPagar: "R$ 29.200,00" },
      { conta: "PLANO DESPESAS", totalPeriodo: "R$ 2.555,00", pago: "R$ 555,00", aPagar: "R$ 2.000,00" },
    ],
    saldos: [
      { banco: "Banco Bradesco", saldo: "R$ -4,20" },
      { banco: "BANCO DO BRASIL", saldo: "R$ 116.486,47" },
      { banco: "INTERNO", saldo: "R$ 12.149,17" },
    ],
  },
};

// Tipos
type Conta = {
  ID: string;
  Descrição: string;
  Banco: string;
  Curso: string;
  "Data Vencimento": string;
  Valor: string;
  Status: "Pago" | "Pendente" | "Vencido";
};

type DadosCobranca = {
  "Contas a Pagar": Conta[];
  "Contas a Receber": Conta[];
};

// Dados fictícios
const DADOS_COBRANCA: DadosCobranca = {
  "Contas a Pagar": [
    { ID: "CP-001", Descrição: "Compra material escritório", Banco: "Banco Bradesco", Curso: "2023", "Data Vencimento": "2025-08-10", Valor: "R$ 1.200,00", Status: "Vencido" },
    { ID: "CP-002", Descrição: "Pagamento fornecedor TI", Banco: "BANCO DO BRASIL", Curso: "2024", "Data Vencimento": "2025-08-15", Valor: "R$ 3.500,00", Status: "Pendente" },
    { ID: "CP-003", Descrição: "Serviços limpeza e conservação", Banco: "INTERNO", Curso: "2025", "Data Vencimento": "2025-08-20", Valor: "R$ 800,00", Status: "Pago" },
  ],
  "Contas a Receber": [
    { ID: "CR-001", Descrição: "Mensalidade aluno João", Banco: "Banco Bradesco", Curso: "2023", "Data Vencimento": "2025-08-05", Valor: "R$ 600,00", Status: "Pago" },
    { ID: "CR-002", Descrição: "Mensalidade aluno Maria", Banco: "BANCO DO BRASIL", Curso: "2024", "Data Vencimento": "2025-08-12", Valor: "R$ 600,00", Status: "Vencido" },
    { ID: "CR-003", Descrição: "Mensalidade aluno Carlos", Banco: "INTERNO", Curso: "2025", "Data Vencimento": "2025-08-18", Valor: "R$ 600,00", Status: "Pendente" },
  ],
};

type MovimentoCaixa = {
  descricao: string;
  valor: string;
  data: string;
};

type DadosCaixaDestino = {
  "Banco Bradesco": {
    entradas: MovimentoCaixa[];
    saidas: MovimentoCaixa[];
  };
  "BANCO DO BRASIL": {
    entradas: MovimentoCaixa[];
    saidas: MovimentoCaixa[];
  };
  "INTERNO": {
    entradas: MovimentoCaixa[];
    saidas: MovimentoCaixa[];
  };
};

const DADOS_CAIXA_DESTINO: DadosCaixaDestino = {
  "Banco Bradesco": {
    entradas: [
      { descricao: "Mensalidade agosto", valor: "R$ 5.000,00", data: "2025-08-01" },
      { descricao: "Doação", valor: "R$ 1.000,00", data: "2025-08-03" },
    ],
    saidas: [
      { descricao: "Pagamento professor", valor: "R$ 2.000,00", data: "2025-08-05" },
    ],
  },
  "BANCO DO BRASIL": {
    entradas: [
      { descricao: "Mensalidade julho", valor: "R$ 10.000,00", data: "2025-07-25" },
    ],
    saidas: [
      { descricao: "Compra material", valor: "R$ 3.000,00", data: "2025-08-01" },
    ],
  },
  "INTERNO": {
    entradas: [
      { descricao: "Transferência Bradesco", valor: "R$ 500,00", data: "2025-08-02" },
    ],
    saidas: [],
  },
};




interface Transacao {
  id: number;
  descricao: string;
  id_pessoa: number;
  valor: string;
  desconto_percentual: string;
  valor_com_desconto: string;
  tipo: "receita" | "despesa";
  categoria: string;
  data_referencia: string;
  data_vencimento: string;
  data_pagamento: string | null;
  observacao: string | null;
  forma_pagamento: string | null;
  responsavel: string | null;
  status: string;
  comprovante_url: string | null;
}

interface ContratoTemplate {
  id: string;
  nome: string;
  tipo: string;
  conteudo: string;
  campos: string[];
  criadoEm: Date;
  atualizadoEm: Date;
}

const LancamentosPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>("");
  const [templates, setTemplates] = useState<ContratoTemplate[]>([]);
  const [alunos, setAlunos] = useState<{id: string; nome: string;}[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<string>("");
  const [situacaoContrato, setSituacaoContrato] = useState("Vigente");
  const [buscaTexto, setBuscaTexto] = useState("");

  const [contratosPreenchidos, setContratosPreenchidos] = useState<any[]>([]);
  const [contratoPreenchidoSelecionado, setContratoPreenchidoSelecionado] = useState<any | null>(null);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [formEdicao, setFormEdicao] = useState<{
    dados_preenchidos: { [key:string]: string },
    contrato_url: string,
    situacao_contrato: string,
  }>({
    dados_preenchidos: {},
    contrato_url: '',
    situacao_contrato: 'Vigente',
  });
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [modalPreviewAberto, setModalPreviewAberto] = useState(false);

  // CONSTANTES PARA OS DADOS FICTÍCIOS
  const [ano, setAno] = useState(2024);
  const [dados, setDados] = useState(DADOS_FICTICIOS[2024]);
  const gerar = () => {
    setDados(DADOS_FICTICIOS[ano]);
  };

  const [tipo, setTipo] = useState<"Contas a Pagar" | "Contas a Receber">("Contas a Pagar");
  const [banco, setBanco] = useState("Todos");
  const [curso, setCurso] = useState("Todos");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [tabela, setTabela] = useState<Conta[]>([]);

  // Listas dinâmicas para os selects
  const tipos = ["Contas a Pagar", "Contas a Receber"];
  const bancos = ["Todos", ...Array.from(new Set(
    [...DADOS_COBRANCA["Contas a Pagar"], ...DADOS_COBRANCA["Contas a Receber"]].map(c => c.Banco)
  ))];
  const cursos = ["Todos", ...Array.from(new Set(
    [...DADOS_COBRANCA["Contas a Pagar"], ...DADOS_COBRANCA["Contas a Receber"]].map(c => c.Curso)
  ))];

  // type NomeBancoCaixaDestino = keyof DadosCaixaDestino;

  const [bancoSelecionado, setBancoSelecionado] = useState<NomeBancoCaixaDestino | "Todos">("Todos");
  type NomeBancoCaixaDestino = keyof typeof DADOS_CAIXA_DESTINO;
  type BancoSelecionado = "Todos" | NomeBancoCaixaDestino;

  const [bancoOrigem, setBancoOrigem] = useState<NomeBancoCaixaDestino>('Banco Bradesco');
  const [bancoDestino, setBancoDestino] = useState<NomeBancoCaixaDestino>('BANCO DO BRASIL');
  const [valorTransferencia, setValorTransferencia] = useState('');
  const [transacaoRealizada, setTransacaoRealizada] = useState(false);

  // TERMINA AQUI

  const [abrirGerarContrato, setAbrirGerarContrato] = useState(false);
  const [modeloSelecionado, setModeloSelecionado] = useState<ContratoTemplate | null>(null);
  const [dadosPreenchidos, setDadosPreenchidos] = useState<{[campo: string]: string}>({});
  const [contratoUrl, setContratoUrl] = useState(''); // para URL/foto do contrato assinado


  // Controle de visibilidade dos forms
  const [showNovoLancamento, setShowNovoLancamento] = useState(false);
  const [showAddPagamento, setShowAddPagamento] = useState(false);
  const [pendingTransacoes, setPendingTransacoes] = useState<Transacao[]>([]);

  // Estados existentes
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [filtros, setFiltros] = useState({ inicio: "", fim: "", categoria: "", tipo: "", forma_pagamento: "", responsavel: "", status: "" });
  const [paymentForm, setPaymentForm] = useState({ transacaoId: null as number | null, valor_final: "", data_pagamento: new Date().toISOString().split("T")[0], observacao: "", forma_pagamento: "", comprovante: null as File | null });
  const [categorias] = useState<string[]>(["doação","evento","material didático","material pedagógico","manutenção"]);
  const [formasPagamento] = useState<string[]>(["pix","boleto","cartão","transferência","dinheiro"]);
  const [responsaveis, setResponsaveis] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<
      'DemonstrativoFinanceiro' | 'EntradasESaidas' | 'Cobrancas' | 'CaixaDestino' | 'MovimentacaoBancaria' | 'PagamentoProfessores' | 'PagamentoFuncionarios' | 'AlunosComPendencia' | 'Contratos' | 'Renegociacoes' | 'Dividas' | 'Comissao' | 'Extras'
    >('DemonstrativoFinanceiro');

  const [form, setForm] = useState<{
    descricao: string;
    valor_com_desconto: string;
    tipo: "receita" | "despesa";
    categoria: string;
    data_pagamento: string;
    observacao: string;
    forma_pagamento: string;
    responsavel: string;
    comprovante: File | null;
  }>({
    descricao: "",
    valor_com_desconto: "",
    tipo: "receita",
    categoria: "",
    data_pagamento: new Date().toISOString().split("T")[0], // hoje
    observacao: "",
    forma_pagamento: "",
    responsavel: "",
    comprovante: null,
  });

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (name === "comprovante") setForm({ ...form, comprovante: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const enviarTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("descricao", form.descricao);
      formData.append("valor", form.valor_com_desconto);
      formData.append("desconto_percentual", "0");
      formData.append("valor_com_desconto", form.valor_com_desconto);
      formData.append("tipo", form.tipo);
      formData.append("categoria", form.categoria);
      formData.append("data_referencia", form.data_pagamento);
      formData.append("data_pagamento", form.data_pagamento);
      formData.append("observacao", form.observacao);
      formData.append("forma_pagamento", form.forma_pagamento);
      formData.append("responsavel", form.responsavel);
      formData.append("status", "pago");
      if (form.comprovante) {
        formData.append("comprovante", form.comprovante);
      }

      await axios.post(`/api/financeiro/transacoes`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMensagemSucesso("Lançamento salvo com sucesso");
      await buscarTransacoes();
      setForm({
        descricao: "",
        valor_com_desconto: "",
        tipo: "receita",
        categoria: "",
        data_pagamento: new Date().toISOString().split("T")[0],
        observacao: "",
        forma_pagamento: "",
        responsavel: "",
        comprovante: null,
      });
      setTimeout(() => setMensagemSucesso(""), 3000);
    } catch (err) {
      console.error("Erro ao criar lançamento", err);
    }
  };

  const formatarData = (isoDate: string | null) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString("pt-BR");
  };

  const buscarTransacoes = async () => {
    try {
      const params: any = {};
      if (filtros.inicio) params.inicio = filtros.inicio;
      if (filtros.fim) params.fim = filtros.fim;
      if (filtros.categoria) params.categoria = filtros.categoria;
      if (filtros.tipo) params.tipo = filtros.tipo;
      if (filtros.forma_pagamento) params.forma_pagamento = filtros.forma_pagamento;
      if (filtros.responsavel) params.responsavel = filtros.responsavel;
      if (filtros.status) params.status = filtros.status;

      const res = await axios.get<Transacao[]>(`/api/financeiro/transacoes`, { params });
      setTransacoes(res.data);
    } catch (err) {
      console.error("Erro ao buscar transações", err);
    }
  };

  const fetchContratosPreenchidos = async () => {
    try {
      const res = await axios.get('/api/contratos_preenchidos');
      setContratosPreenchidos(res.data);
    } catch (err) {
      console.error('Erro ao carregar contratos preenchidos', err);
    }
  };

  const abrirPreviewContrato = async (id: string) => {
    try {
      const res = await axios.get(`/api/contratos_preenchidos/${id}/preview`);
      const { conteudo, campos, dados } = res.data;

      // campos é string JSON, desserialize para array:
      const camposArray: string[] = typeof campos === "string" ? JSON.parse(campos) : campos;

      // Normalize os campos removendo {{ e }} e espaços
      const camposNormalizados = camposArray.map((campo) =>
        campo.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '')
      );

      // Substitui cada placeholder no conteúdo pelo valor correspondente no dados
      let html = conteudo;

      camposNormalizados.forEach((campo) => {
        // Monta regex para buscar {{campo}} exatamente
        const regex = new RegExp(`{{\\s*${campo}\\s*}}`, 'g');

        // O valor pode estar em dados com chaves que têm delimitadores ou não,
        // vamos tentar localizar usando os dois formatos:
        const valor = dados[`{{${campo}}}`] ?? dados[campo] ?? '';

        html = html.replace(regex, valor);
      });

      setPreviewHtml(html);
      setModalPreviewAberto(true);

    } catch (err) {
      toast.error("Erro ao gerar preview do contrato");
      console.error(err);
    }
  };


  useEffect(() => {
    buscarTransacoes();
    axios.get(`/api/financeiro/responsaveis`)
      .then(res => setResponsaveis(res.data.map((r: any) => r.nome)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const res = await axios.get("/api/listar_alunos"); // Rota que deve listar alunos
        setAlunos(res.data);
      } catch (error) {
        console.error("Erro ao carregar alunos", error);
      }
    };
    fetchAlunos();
  }, []);


  // Função para gerar query string com filtros aplicados
  const gerarQuery = () => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return params.toString();
  };

  // Funções de exportação que incluem os filtros
  const exportarPDF = () => {
    const queryString = gerarQuery();
    const url = `/api/financeiro/exportar/pdf${queryString ? `?${queryString}` : ""}`;
    window.open(url, "_blank");
  };

  const exportarExcel = () => {
    const queryString = gerarQuery();
    const url = `/api/financeiro/exportar/excel${queryString ? `?${queryString}` : ""}`;
    window.open(url, "_blank");
  };

  const exportarCSV = () => {
    const queryString = gerarQuery();
    const url = `/api/financeiro/exportar/csv${queryString ? `?${queryString}` : ""}`;
    window.open(url, "_blank");
  };

  // Função para renderizar tabela (inline reutilizável)
  const renderTabela = (titulo: string, colunas: string[], dadosTabela: object[]) => (
    <div className="mb-6">
      <h4 className="font-bold mb-2">{titulo}</h4>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            {colunas.map((c, i) => (
              <th key={i} className="border px-2 py-1 text-left">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dadosTabela.map((linha, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
              {Object.values(linha).map((valor, i) => (
                <td key={i} className="border px-2 py-1">{valor}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const abrirModalEdicao = (item: any) => {
    setFormEdicao({
      dados_preenchidos: item.dados_preenchidos || {},
      contrato_url: item.contrato_url || '',
      situacao_contrato: item.situacao_contrato || 'Vigente',
    });
    if (item.aluno_id) {
      setAlunoSelecionado(item.aluno_id);
    }
    setContratoPreenchidoSelecionado(item);
    setModalEdicaoAberto(true);
  };


  const excluirContratoPreenchido = async (id: string) => {
    try {
      await axios.delete(`/api/contratos_preenchidos/${id}`);
      setContratosPreenchidos(prev => prev.filter(c => c.id !== id));
      toast.success("Contrato excluído com sucesso");
    } catch (err) {
      toast.error("Erro ao excluir contrato");
      console.error(err);
    }
  };

  const contratosFiltrados = contratosPreenchidos.filter(item => {
    const texto = buscaTexto.toLowerCase();

    return (
      (item.numero_contrato?.toLowerCase().includes(texto)) ||
      (item.aluno_nome?.toLowerCase().includes(texto)) ||
      (item.situacao_contrato?.toLowerCase().includes(texto)) ||
      (item.aluno_serie?.toLowerCase().includes(texto)) ||
      (item.aluno_turma?.toLowerCase().includes(texto)) ||
      (item.aluno_cpf?.toLowerCase().includes(texto))
    );
  });

  const fetchTemplates = async () => {
    try {
      const { data } = await axios.get<ContratoTemplate[]>('/api/contratos');

      // Converter as datas de string para Date, se necessário
      const parsedData = data.map((t) => ({
        ...t,
        criadoEm: new Date(t.criadoEm),
        atualizadoEm: new Date(t.atualizadoEm),
      }));

      setTemplates(parsedData);
    } catch (err) {
      // Trate o erro, exiba toast, etc.
      console.error('Erro ao carregar contratos:', err);
    }
  };

  // FILTRAR DADOS DE COBRANÇA
  function filtrarDados() {
    let dados = [...DADOS_COBRANCA[tipo]];

    if (banco !== "Todos") {
      dados = dados.filter(item => item.Banco === banco);
    }
    if (curso !== "Todos") {
      dados = dados.filter(item => item.Curso === curso);
    }
    if (dataInicial) {
      dados = dados.filter(item => item["Data Vencimento"] >= dataInicial);
    }
    if (dataFinal) {
      dados = dados.filter(item => item["Data Vencimento"] <= dataFinal);
    }

    setTabela(dados);
  }

  // Função para renderizar a tabela de cobrança
  function renderTabelaCobranca() {
    if (!tabela) return null;
    if (tabela.length === 0) return <p className="mt-2">Nenhum registro encontrado.</p>;

    return (
      <table className="min-w-full bg-white border mt-6">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Descrição</th>
            <th className="border px-2 py-1">Banco</th>
            <th className="border px-2 py-1">Ano Letivo</th>
            <th className="border px-2 py-1">Data Vencimento</th>
            <th className="border px-2 py-1">Valor</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {tabela.map((item, idx) => (
            <tr key={item.ID} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
              <td className="border px-2 py-1">{item.ID}</td>
              <td className="border px-2 py-1">{item.Descrição}</td>
              <td className="border px-2 py-1">{item.Banco}</td>
              <td className="border px-2 py-1">{item.Curso}</td>
              <td className="border px-2 py-1">{item["Data Vencimento"]}</td>
              <td className="border px-2 py-1">{item.Valor}</td>
              <td className="border px-2 py-1">{item.Status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function imprimirContrato(htmlContent: string) {
    if (!htmlContent) {
      toast.error("Nenhum conteúdo para imprimir!");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error("Impressão bloqueada pelo navegador.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { size: A4; margin: 20mm; }
            body {
              line-height: 1.4;
              margin: 0;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Aguardar carregar o conteúdo e disparar a impressão
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      // Opcional: fechar a aba após imprimir
      // printWindow.close();
    };
  }

  async function imprimirContratoPreenchido(item: any) {
    try {
      const res = await axios.get(`/api/contratos_preenchidos/${item.id}/preview`);
      const { conteudo, campos: camposStr } = res.data;

      const camposArray = typeof camposStr === 'string' ? JSON.parse(camposStr) : camposStr;

      // Verifica se dados_preenchidos já é objeto ou string JSON
      const dados =
        typeof item.dados_preenchidos === "string"
          ? JSON.parse(item.dados_preenchidos)
          : item.dados_preenchidos;

      const camposNormalizados = camposArray.map((campo: string) =>
        campo.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '')
      );

      let html = conteudo;

      camposNormalizados.forEach((campo: string) => {
        const regex = new RegExp(`{{\\s*${campo}\\s*}}`, 'g');
        const valor = dados[`{{${campo}}}`] ?? '';
        html = html.replace(regex, valor);
      });

      imprimirContrato(html);
    } catch (error) {
      toast.error("Erro ao carregar contrato para impressão.");
      console.error(error);
    }
  }

  useEffect(() => {
    
    fetchTemplates();
  }, []);

  useEffect(() => {
    fetchContratosPreenchidos();
  }, []);


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

        {/* ─── Abas ─────────────────────────────────────────────────────────────── */}
        <div className="border-b border-gray-200 bg-[rgba(0,0,0,0.01)] mt-4">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('DemonstrativoFinanceiro')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'DemonstrativoFinanceiro'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Demonstrativo Financeiro
            </button>
            <button
              onClick={() => setActiveTab('EntradasESaidas')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'EntradasESaidas'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Entradas E Saídas
            </button>
            <button
              onClick={() => setActiveTab('Cobrancas')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'Cobrancas'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Cobranças
            </button>
            <button
              onClick={() => setActiveTab('CaixaDestino')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'CaixaDestino'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Caixa de Destino
            </button>
            <button
              onClick={() => setActiveTab('MovimentacaoBancaria')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'MovimentacaoBancaria'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Movimentação Bancária
            </button>
            <button
              onClick={() => setActiveTab('PagamentoProfessores')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'PagamentoProfessores'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pagamento de Professores
            </button>
            <button
              onClick={() => setActiveTab('PagamentoFuncionarios')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'PagamentoFuncionarios'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pagamento de Funcionários
            </button>
            <button
              onClick={() => setActiveTab('AlunosComPendencia')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'AlunosComPendencia'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Alunos Com Pendência
            </button>
            <button
              onClick={() => setActiveTab('Contratos')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'Contratos'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Contratos
            </button>
            <button
              onClick={() => setActiveTab('Renegociacoes')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'Renegociacoes'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Renegociações
            </button>
            <button
              onClick={() => setActiveTab('Dividas')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'Dividas'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dívidas
            </button>
            <button
              onClick={() => setActiveTab('Comissao')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'Comissao'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Comissão
            </button>
            <button
              onClick={() => setActiveTab('Extras')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'Extras'
                  ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Extras
            </button>

          </div>
        </div>

        {/* ─── Conteúdo de cada Aba ────────────────────────────────────────────────── */}
        {activeTab === 'DemonstrativoFinanceiro' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div>
              <div className="bg-white shadow-md overflow-hidden">
                <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Demonstrativo Financeiro
                  </h3>
                </div>

                {/* Conteúdo do demonstrativo financeiro */}
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-4">
                    <label htmlFor="ano" className="font-medium">Selecione o ano:</label>
                    <select
                      id="ano"
                      value={ano}
                      onChange={e => setAno(Number(e.target.value))}
                      className="border px-2 py-1"
                    >
                      {Object.keys(DADOS_FICTICIOS).map(a => (
                        <option key={a} value={Number(a)}>{a}</option>
                      ))}
                    </select>
                    <button
                      onClick={gerar}
                      className="bg-blue-600 text-white px-4 py-1 rounded"
                    >
                      Gerar
                    </button>
                  </div>

                  {renderTabela(
                    "Receitas",
                    ["Plano de contas", "Valor total do período", "Total recebido", "Total a receber"],
                    dados.receitas
                  )}

                  {renderTabela(
                    "Despesas",
                    ["Plano de contas", "Valor total do período", "Total pago", "Total a pagar"],
                    dados.despesas
                  )}

                  {renderTabela(
                    "Saldos",
                    ["Banco", "Saldo"],
                    dados.saldos
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'EntradasESaidas' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div>
              {/* Entradas e Saídas */}
              <div className="bg-white shadow-md overflow-hidden">
                <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Entradas e Saídas
                  </h3>
                </div>
              </div>

              <div className="p-6 bg-gray-50 min-h-screen">

                {/* Botões principais */}
                <div className="mb-6 flex gap-4">
                  <button onClick={() => setShowNovoLancamento(v => !v)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Adicionar novo Lançamento
                  </button>
                  <button onClick={async () => {
                      const res = await axios.get<Transacao[]>(`/api/financeiro/transacoes`);
                      setPendingTransacoes(res.data.filter(t => t.status === 'aguardando' || t.status === 'atrasado')); 
                      setShowAddPagamento(v => !v);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                  >
                    Adicionar Pagamento
                  </button>
                </div>

                {/* Filtros de Busca */}
                <section className="mb-8 bg-white p-4 rounded shadow">
                  <h2 className="text-lg font-semibold text-gray-600 mb-4">
                    Filtros de Busca
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600">Início</label>
                      <input
                        type="date"
                        name="inicio"
                        value={filtros.inicio}
                        onChange={handleFiltroChange}
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Fim</label>
                      <input
                        type="date"
                        name="fim"
                        value={filtros.fim}
                        onChange={handleFiltroChange}
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Tipo</label>
                      <select
                        name="tipo"
                        value={filtros.tipo}
                        onChange={handleFiltroChange}
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      >
                        <option value="">Todos</option>
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Categoria</label>
                      <select
                        name="categoria"
                        value={filtros.categoria}
                        onChange={handleFiltroChange}
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      >
                        <option value="">Todas</option>
                        {categorias.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        Forma de Pagamento
                      </label>
                      <select
                        name="forma_pagamento"
                        value={filtros.forma_pagamento}
                        onChange={handleFiltroChange}
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      >
                        <option value="">Todas</option>
                        {formasPagamento.map((fp) => (
                          <option key={fp} value={fp}>
                            {fp.charAt(0).toUpperCase() + fp.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Responsável</label>
                      <select
                        name="responsavel"
                        value={filtros.responsavel}
                        onChange={handleFiltroChange}
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      >
                        <option value="">Todos</option>
                        {responsaveis.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Status</label>
                      <select
                        name="status"
                        value={filtros.status}
                        onChange={handleFiltroChange}
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      >
                        <option value="">Todos</option>
                        <option value="aguardando">Aguardando</option>
                        <option value="pago">Pago</option>
                        <option value="atrasado">Atrasado</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <button
                      onClick={buscarTransacoes}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                      Aplicar Filtros
                    </button>
                    {/* Botões de exportação com filtros aplicados */}
                    <button
                      onClick={exportarPDF}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Exportar PDF
                    </button>
                    <button
                      onClick={exportarExcel}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Exportar Excel
                    </button>
                    {/* <button
                      onClick={exportarCSV}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Exportar CSV
                    </button> */}
                  </div>
                </section>

                {mensagemSucesso && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded">
                    {mensagemSucesso}
                  </div>
                )}

                {/* Novo Lançamento */}
                {showNovoLancamento && (
                  <section className="mb-8 bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold text-gray-600 mb-4">Novo Lançamento</h2>
                    <form onSubmit={enviarTransacao} className="grid grid-cols-1 lg:grid-cols-2 gap-4">                
                    <div>
                      <label className="block text-sm text-gray-600">Descrição</label>
                      <input
                        type="text"
                        name="descricao"
                        value={form.descricao}
                        onChange={handleFormChange}
                        required
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Valor (R$)</label>
                      <input
                        type="number"
                        name="valor_com_desconto"
                        step="0.01"
                        value={form.valor_com_desconto}
                        onChange={handleFormChange}
                        required
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Tipo</label>
                      <select
                        name="tipo"
                        value={form.tipo}
                        onChange={handleFormChange}
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      >
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Categoria</label>
                      <select
                        name="categoria"
                        value={form.categoria}
                        onChange={handleFormChange}
                        required
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      >
                        <option value="">Selecione</option>
                        {categorias.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Data do Pagamento</label>
                      <input
                        type="date"
                        name="data_pagamento"
                        value={form.data_pagamento}
                        onChange={handleFormChange}
                        required
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        Forma de Pagamento
                      </label>
                      <select
                        name="forma_pagamento"
                        value={form.forma_pagamento}
                        onChange={handleFormChange}
                        required
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      >
                        <option value="">Selecione</option>
                        {formasPagamento.map((fp) => (
                          <option key={fp} value={fp}>
                            {fp.charAt(0).toUpperCase() + fp.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        Responsável (Nome)
                      </label>
                      <select
                        name="responsavel"
                        value={form.responsavel}
                        onChange={handleFormChange}
                        required
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      >
                        <option value="">Selecione</option>
                        {responsaveis.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm text-gray-600">Observação</label>
                      <textarea
                        name="observacao"
                        value={form.observacao}
                        onChange={handleFormChange}
                        rows={3}
                        className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm text-gray-600">
                        Comprovante (PDF/JPG)
                      </label>
                      <input
                        type="file"
                        name="comprovante"
                        accept=".pdf,image/*"
                        onChange={handleFormChange}
                        className="mt-1 w-full"
                      />
                    </div>
                      <div className="lg:col-span-2 flex justify-end">
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                          Salvar Lançamento
                        </button>
                      </div>
                    </form>
                  </section>
                )}

                {/* Adicionar Pagamento */}
                {showAddPagamento && (
                  <section className="mb-8 bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold text-gray-600 mb-4">Adicionar Pagamento</h2>
                    <form onSubmit={async e => {
                        e.preventDefault();
                        try {
                          const fd = new FormData();
                          fd.append('data_pagamento', paymentForm.data_pagamento);
                          fd.append('observacao', paymentForm.observacao);
                          fd.append('forma_pagamento', paymentForm.forma_pagamento);
                          if (paymentForm.comprovante) fd.append('comprovante', paymentForm.comprovante);
                          await axios.put(
                            `/api/financeiro/transacoes/${paymentForm.transacaoId}/pagar`,
                            fd,
                            { headers: { 'Content-Type': 'multipart/form-data' } }
                          );
                          setShowAddPagamento(false);
                          buscarTransacoes();
                        } catch (err) { console.error('Erro ao registrar pagamento', err); }
                      }}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                    >
                      <div>
                        <label className="block text-sm text-gray-600">Descrição</label>
                        <select
                          required
                          className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                          value={paymentForm.transacaoId ?? ''}
                          onChange={e => {
                            const id = Number(e.target.value);
                            const t = pendingTransacoes.find(x => x.id === id)!;
                            setPaymentForm(f => ({ ...f, transacaoId: id, valor_final: t.valor_com_desconto }));
                          }}
                        >
                          <option value="">Selecione</option>
                          {pendingTransacoes.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Valor Final (R$)</label>
                        <input readOnly className="mt-1 w-full px-2 py-1 border rounded bg-gray-100" value={paymentForm.valor_final} />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Data do Pagamento</label>
                        <input
                          type="date"
                          required
                          className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                          value={paymentForm.data_pagamento}
                          onChange={e => setPaymentForm(f => ({ ...f, data_pagamento: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Observação</label>
                        <textarea
                          rows={2}
                          className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                          value={paymentForm.observacao}
                          onChange={e => setPaymentForm(f => ({ ...f, observacao: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Forma de Pagamento</label>
                        <select
                          required
                          className="mt-1 w-full px-2 py-1 border rounded focus:outline-none focus:ring"
                          value={paymentForm.forma_pagamento}
                          onChange={e => setPaymentForm(f => ({ ...f, forma_pagamento: e.target.value }))}
                        >
                          <option value="">Selecione</option>
                          <option value="dinheiro">Dinheiro</option>
                          <option value="cartão de crédito">Cartão de Crédito</option>
                          <option value="cartão de débito">Cartão de Débito</option>
                          <option value="PIX">PIX</option>
                          <option value="boleto">Boleto</option>
                          <option value="transferência bancária">Transferência Bancária</option>
                          <option value="carteira digital">Carteira Digital</option>
                          <option value="link de pagamento">Link de Pagamento</option>
                        </select>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-sm text-gray-600">Comprovante (PDF)</label>
                        <input type="file" accept=".pdf" className="mt-1 w-full" onChange={e => setPaymentForm(f => ({ ...f, comprovante: e.target.files?.[0] ?? null }))} />
                      </div>
                      <div className="lg:col-span-2 flex justify-end">
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                          Registrar Pagamento
                        </button>
                      </div>
                    </form>
                  </section>
                )}

                {transacoes.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Nenhum lançamento encontrado.
                  </div>
                )}

                {/* Tabela de Transações */}
                <section className="bg-white p-4 rounded shadow">
                  <h2 className="text-lg font-semibold text-gray-600 mb-4">Lista de Transações</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 border">Data Ref.</th>
                          <th className="px-3 py-2 border">Descrição</th>
                          <th className="px-3 py-2 border">Valor Bruto (R$)</th>
                          <th className="px-3 py-2 border">Desconto (%)</th>
                          <th className="px-3 py-2 border">Valor Final (R$)</th>
                          <th className="px-3 py-2 border">Tipo</th>
                          <th className="px-3 py-2 border">Categoria</th>
                          <th className="px-3 py-2 border">Vencimento</th>
                          <th className="px-3 py-2 border">Data do Pagamento</th>
                          <th className="px-3 py-2 border">Status</th>
                          <th className="px-3 py-2 border">Observação</th>
                          <th className="px-3 py-2 border">Forma de Pagamento</th>
                          <th className="px-3 py-2 border">Responsável pelo Lançamento</th>
                          <th className="px-3 py-2 border">Comprovante</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transacoes.map(t => (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 border">
                              {formatarData(t.data_referencia)}
                            </td>
                            <td className="px-3 py-2 border">{t.descricao}</td>
                            <td
                              className={`px-3 py-2 border ${
                                t.tipo === "receita"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {Number(t.valor).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 border">
                              {Number(t.desconto_percentual).toFixed(2)}%
                            </td>
                            <td className="px-3 py-2 border">
                              {Number(t.valor_com_desconto).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 border">
                              {t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)}
                            </td>
                            <td className="px-3 py-2 border">{t.categoria}</td>
                            <td className="px-3 py-2 border">
                              {formatarData(t.data_vencimento)}
                            </td>
                            <td className="px-3 py-2 border">
                              {t.data_pagamento
                                ? formatarData(t.data_pagamento)
                                : "-"}
                            </td>
                            <td className="px-3 py-2 border">{t.status}</td>
                            <td className="px-3 py-2 border">
                              {t.observacao || "-"}
                            </td>
                            <td className="px-3 py-2 border">
                              {t.forma_pagamento || "-"}
                            </td>
                            <td className="px-3 py-2 border">
                              {t.responsavel || "-"}
                            </td>
                            <td className="px-3 py-2 border">
                              {t.comprovante_url ? (
                                <a
                                  href={`/${t.comprovante_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  Visualizar
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

              </div>

            </div>
          </div>
        )}

        {activeTab === 'Cobrancas' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div>
              {/* Cobranças */}
              <div className="bg-white shadow-md overflow-hidden">
                <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Cobranças
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div>
                    <label className="block font-medium">Tipo</label>
                    <select
                      value={tipo}
                      onChange={e => setTipo(e.target.value as "Contas a Pagar" | "Contas a Receber")}
                      className="border px-2 py-1"
                    >
                      {tipos.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium">Caixa de destino</label>
                    <select value={banco} onChange={e => setBanco(e.target.value)} className="border px-2 py-1">
                      {bancos.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium">Cursos (Ano Letivo)</label>
                    <select value={curso} onChange={e => setCurso(e.target.value)} className="border px-2 py-1">
                      {cursos.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium">Data inicial</label>
                    <input
                      type="date"
                      value={dataInicial}
                      onChange={e => setDataInicial(e.target.value)}
                      className="border px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-medium">Data final</label>
                    <input
                      type="date"
                      value={dataFinal}
                      onChange={e => setDataFinal(e.target.value)}
                      className="border px-2 py-1"
                    />
                  </div>
                  <button
                    onClick={filtrarDados}
                    className="bg-blue-600 text-white px-6 py-2 rounded self-end"
                    style={{marginTop: '1.74rem'}}
                  >
                    Gerar
                  </button>
                </div>
                {renderTabelaCobranca()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CaixaDestino' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div className="bg-white shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-lg text-gray-800">Caixa de Destino</h3>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-4 mb-6 items-end">
                  <div>
                    <label className="block font-medium">Selecione o banco</label>
                    <select
                      value={bancoSelecionado}
                      onChange={e => setBancoSelecionado(e.target.value as BancoSelecionado)}
                      className="border px-2 py-1"
                    >
                      <option value="Todos">Todos</option>
                      {Object.keys(DADOS_CAIXA_DESTINO).map(banco => (
                        <option key={banco} value={banco}>{banco}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="bg-green-600 text-white px-6 py-2 rounded"
                    onClick={() => toast.error("Abrir modal de cadastro (a ser implementado)")}
                  >
                    Cadastrar Caixa de Destino
                  </button>
                </div>

                {/* Mostrar saldos totais */}
                <div className="mb-6">
                  {bancoSelecionado === "Todos" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(DADOS_CAIXA_DESTINO).map(([banco, dados]) => {
                        const entradas = dados.entradas.reduce((acc, cur) => acc + parseFloat(cur.valor.replace(/[^\d,-]+/g, '').replace(',', '.')), 0);
                        const saidas = dados.saidas.reduce((acc, cur) => acc + parseFloat(cur.valor.replace(/[^\d,-]+/g, '').replace(',', '.')), 0);
                        const saldo = entradas - saidas;
                        return (
                          <div key={banco} className="bg-gray-50 border rounded p-4">
                            <h4 className="font-semibold mb-2">{banco}</h4>
                            <p>Saldo: R$ {saldo.toFixed(2).replace('.', ',')}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    (() => {
                      const entradas = DADOS_CAIXA_DESTINO[bancoSelecionado].entradas.reduce((acc, cur) => acc + parseFloat(cur.valor.replace(/[^\d,-]+/g, '').replace(',', '.')), 0);
                      const saidas = DADOS_CAIXA_DESTINO[bancoSelecionado].saidas.reduce((acc, cur) => acc + parseFloat(cur.valor.replace(/[^\d,-]+/g, '').replace(',', '.')), 0);
                      const saldo = entradas - saidas;
                      return <p className="mb-4">Saldo total do banco <strong>{bancoSelecionado}</strong>: R$ {saldo.toFixed(2).replace('.', ',')}</p>;
                    })()
                  )}
                </div>

                {/* Mostrar entradas e saídas */}
                {bancoSelecionado === "Todos" ? (
                  Object.entries(DADOS_CAIXA_DESTINO).map(([banco, dados]) => (
                    <div key={banco} className="mb-8">
                      <h4 className="text-md font-semibold mb-2">Banco: {banco}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium mb-1">Entradas</h5>
                          <table className="w-full border bg-white text-sm">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border px-2 py-1">Descrição</th>
                                <th className="border px-2 py-1">Valor</th>
                                <th className="border px-2 py-1">Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dados.entradas.map((entrada, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                  <td className="border px-2 py-1">{entrada.descricao}</td>
                                  <td className="border px-2 py-1">{entrada.valor}</td>
                                  <td className="border px-2 py-1">{entrada.data}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">Saídas</h5>
                          <table className="w-full border bg-white text-sm">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border px-2 py-1">Descrição</th>
                                <th className="border px-2 py-1">Valor</th>
                                <th className="border px-2 py-1">Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dados.saidas.map((saida, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                  <td className="border px-2 py-1">{saida.descricao}</td>
                                  <td className="border px-2 py-1">{saida.valor}</td>
                                  <td className="border px-2 py-1">{saida.data}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-semibold mb-2">Entradas</h4>
                      <table className="w-full border bg-white text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-2 py-1">Descrição</th>
                            <th className="border px-2 py-1">Valor</th>
                            <th className="border px-2 py-1">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DADOS_CAIXA_DESTINO[bancoSelecionado].entradas.map((entrada, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                              <td className="border px-2 py-1">{entrada.descricao}</td>
                              <td className="border px-2 py-1">{entrada.valor}</td>
                              <td className="border px-2 py-1">{entrada.data}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h4 className="text-md font-semibold mb-2">Saídas</h4>
                      <table className="w-full border bg-white text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-2 py-1">Descrição</th>
                            <th className="border px-2 py-1">Valor</th>
                            <th className="border px-2 py-1">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DADOS_CAIXA_DESTINO[bancoSelecionado].saidas.map((saida, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                              <td className="border px-2 py-1">{saida.descricao}</td>
                              <td className="border px-2 py-1">{saida.valor}</td>
                              <td className="border px-2 py-1">{saida.data}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'MovimentacaoBancaria' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div className="bg-white shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-lg text-gray-800">Movimentação Bancária</h3>
              </div>

              <div className="p-6">
                <form
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
                  onSubmit={e => {
                    e.preventDefault();
                    const novaEntrada = {
                      descricao: `Transferência recebida de ${bancoOrigem}`,
                      valor: valorTransferencia,
                      data: new Date().toISOString().split("T")[0],
                    };
                    const novaSaida = {
                      descricao: `Transferência para ${bancoDestino}`,
                      valor: valorTransferencia,
                      data: new Date().toISOString().split("T")[0],
                    };
                    if (
                      bancoOrigem !== bancoDestino &&
                      DADOS_CAIXA_DESTINO[bancoOrigem] &&
                      DADOS_CAIXA_DESTINO[bancoDestino]
                    ) {
                      DADOS_CAIXA_DESTINO[bancoOrigem].saidas.push(novaSaida);
                      DADOS_CAIXA_DESTINO[bancoDestino].entradas.push(novaEntrada);
                      setTransacaoRealizada(true);
                      setTimeout(() => setTransacaoRealizada(false), 3000);
                    }
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium">Banco de Origem</label>
                    <select
                      required
                      value={bancoOrigem}
                      onChange={e => setBancoOrigem(e.target.value as NomeBancoCaixaDestino)}
                      className="mt-1 block w-full px-2 py-1 border rounded"
                    >
                      <option value="">Selecione</option>
                      {Object.keys(DADOS_CAIXA_DESTINO).map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Banco de Destino</label>
                    <select
                      required
                      value={bancoDestino}
                      onChange={e => setBancoDestino(e.target.value as NomeBancoCaixaDestino)}
                      className="mt-1 block w-full px-2 py-1 border rounded"
                    >
                      <option value="">Selecione</option>
                      {Object.keys(DADOS_CAIXA_DESTINO).map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Valor (R$)</label>
                    <input
                      required
                      type="text"
                      value={valorTransferencia}
                      onChange={e => setValorTransferencia(e.target.value)}
                      className="mt-1 block w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div className="self-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Realizar Transferência
                    </button>
                  </div>
                </form>

                {transacaoRealizada && (
                  <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded">
                    Transação realizada com sucesso!
                  </div>
                )}

                <div className="mt-8">
                  <h4 className="text-md font-semibold mb-2">Histórico de Transações entre Bancos</h4>
                  {Object.entries(DADOS_CAIXA_DESTINO).map(([banco, dados]) => (
                    <div key={banco} className="mb-6">
                      <h5 className="font-medium text-gray-700">{banco}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="text-sm font-semibold">Entradas</h6>
                          <ul className="text-sm text-gray-700">
                            {dados.entradas.map((e, i) => (
                              <li key={i} className="border-b py-1">
                                {e.data} - {e.descricao} - {e.valor}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="text-sm font-semibold">Saídas</h6>
                          <ul className="text-sm text-gray-700">
                            {dados.saidas.map((s, i) => (
                              <li key={i} className="border-b py-1">
                                {s.data} - {s.descricao} - {s.valor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PagamentoProfessores' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div className="bg-white shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-lg text-gray-800">
                  Pagamento de Professores
                </h3>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 mb-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Curso</label>
                    <select className="border px-2 py-1 rounded">
                      <option>Todos</option>
                      <option>Ensino Médio</option>
                      <option>Tecnologia</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Turmas</label>
                    <select multiple className="border px-2 py-1 rounded h-20">
                      <option>Todos</option>
                      <option>Turma 1</option>
                      <option>Turma 2</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Professores</label>
                    <select className="border px-2 py-1 rounded">
                      <option>Todos</option>
                      <option>Prof. Ana</option>
                      <option>Prof. João</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Data inicial</label>
                    <input type="date" className="border px-2 py-1 rounded" defaultValue="2025-08-01" />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Data final</label>
                    <input type="date" className="border px-2 py-1 rounded" defaultValue="2025-08-31" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Considerar o valor de hora/aula</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Informado no cadastro do professor</option>
                      <option>Valor fixo para todos</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Tipo de relatório</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Detalhado</option>
                      <option>Resumido</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Filtro</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Exibir todas as aulas</option>
                      <option>Somente confirmadas</option>
                      <option>Somente pagas</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Ordem</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Data da aula, disciplina</option>
                      <option>Professor, data</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Gerar
                  </button>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2">Exemplo de Resultado (Simulado)</h4>
                  <table className="w-full border text-sm bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1">Professor</th>
                        <th className="border px-2 py-1">Turma</th>
                        <th className="border px-2 py-1">Data da Aula</th>
                        <th className="border px-2 py-1">Disciplina</th>
                        <th className="border px-2 py-1">Horas</th>
                        <th className="border px-2 py-1">Valor Hora</th>
                        <th className="border px-2 py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-2 py-1">Prof. Ana</td>
                        <td className="border px-2 py-1">Turma 1</td>
                        <td className="border px-2 py-1">2025-08-05</td>
                        <td className="border px-2 py-1">Matemática</td>
                        <td className="border px-2 py-1">2</td>
                        <td className="border px-2 py-1">R$ 60,00</td>
                        <td className="border px-2 py-1">R$ 120,00</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Prof. João</td>
                        <td className="border px-2 py-1">Turma 2</td>
                        <td className="border px-2 py-1">2025-08-06</td>
                        <td className="border px-2 py-1">História</td>
                        <td className="border px-2 py-1">1.5</td>
                        <td className="border px-2 py-1">R$ 55,00</td>
                        <td className="border px-2 py-1">R$ 82,50</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PagamentoFuncionarios' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div className="bg-white shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-lg text-gray-800">
                  Pagamento de Funcionários
                </h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Funcionário</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Todos</option>
                      <option>Aline (Administrativo)</option>
                      <option>Bruno (Limpeza)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Departamento</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Todos</option>
                      <option>Administração</option>
                      <option>Limpeza</option>
                      <option>Suporte Técnico</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Cargo</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Todos</option>
                      <option>Secretário(a)</option>
                      <option>Faxineiro(a)</option>
                      <option>Técnico de TI</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Data inicial</label>
                    <input type="date" className="border px-2 py-1 rounded w-full" defaultValue="2025-08-01" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Data final</label>
                    <input type="date" className="border px-2 py-1 rounded w-full" defaultValue="2025-08-31" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Tipo de relatório</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Detalhado</option>
                      <option>Resumido</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Gerar
                  </button>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2">Exemplo de Resultado (Simulado)</h4>
                  <table className="w-full border text-sm bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1">Funcionário</th>
                        <th className="border px-2 py-1">Cargo</th>
                        <th className="border px-2 py-1">Departamento</th>
                        <th className="border px-2 py-1">Período</th>
                        <th className="border px-2 py-1">Salário Base</th>
                        <th className="border px-2 py-1">Descontos</th>
                        <th className="border px-2 py-1">Total Líquido</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-2 py-1">Aline</td>
                        <td className="border px-2 py-1">Secretária</td>
                        <td className="border px-2 py-1">Administração</td>
                        <td className="border px-2 py-1">01/08/2025 a 31/08/2025</td>
                        <td className="border px-2 py-1">R$ 2.500,00</td>
                        <td className="border px-2 py-1">R$ 200,00</td>
                        <td className="border px-2 py-1">R$ 2.300,00</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Bruno</td>
                        <td className="border px-2 py-1">Faxineiro</td>
                        <td className="border px-2 py-1">Limpeza</td>
                        <td className="border px-2 py-1">01/08/2025 a 31/08/2025</td>
                        <td className="border px-2 py-1">R$ 1.800,00</td>
                        <td className="border px-2 py-1">R$ 0,00</td>
                        <td className="border px-2 py-1">R$ 1.800,00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'AlunosComPendencia' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div className="bg-white shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-lg text-gray-800">
                  Alunos Com Pendência
                </h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Situação do contrato</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Todos</option>
                      <option>Ativo</option>
                      <option>Cancelado</option>
                      <option>Trancado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Curso</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Escolha um curso...</option>
                      <option>Técnico em Informática</option>
                      <option>Ensino Médio</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Turmas</label>
                    <select multiple className="border px-2 py-1 rounded w-full h-20">
                      <option>Turma 1</option>
                      <option>Turma 2</option>
                      <option>Turma 3</option>
                    </select>
                    <div className="mt-1">
                      <label className="text-sm">
                        <input type="checkbox" className="mr-1" /> Considerar apenas a turma principal?
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Alunos</label>
                    <select multiple className="border px-2 py-1 rounded w-full h-20">
                      <option>Todos</option>
                      <option>Ana Clara</option>
                      <option>Lucas Silva</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Plano de conta</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Todos</option>
                      <option>Mensalidades</option>
                      <option>Material Didático</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Data inicial</label>
                    <input type="date" className="border px-2 py-1 rounded w-full" defaultValue="2025-08-01" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Data final</label>
                    <input type="date" className="border px-2 py-1 rounded w-full" defaultValue="2025-08-31" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Formato</label>
                    <div className="mt-1">
                      <label className="block text-sm">
                        <input type="radio" name="formato" defaultChecked className="mr-1" /> Relatórios
                      </label>
                      <label className="block text-sm">
                        <input type="radio" name="formato" className="mr-1" /> Carta de cobrança
                      </label>
                      <label className="block text-sm">
                        <input type="radio" name="formato" className="mr-1" /> Lista de cobrança
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <fieldset className="border p-4 rounded">
                    <legend className="text-sm font-semibold text-gray-700">Opções</legend>
                    <label className="block text-sm">
                      <input type="radio" name="opcao" defaultChecked className="mr-1" /> Exibir todos os registros
                    </label>
                    <label className="block text-sm">
                      <input type="radio" name="opcao" className="mr-1" /> Exibir todos agrupando por nome
                    </label>
                    <label className="block text-sm">
                      <input type="radio" name="opcao" className="mr-1" /> Exibir todos agrupando por mês
                    </label>
                    <label className="block text-sm mt-2">
                      Exibir totais por turma e ordenar por:
                      <select className="border ml-2 px-2 py-1 rounded">
                        <option>Valor</option>
                        <option>Qtd. Cobranças</option>
                      </select>
                    </label>
                  </fieldset>
                </div>

                <div className="mb-6">
                  <fieldset className="border p-4 rounded">
                    <legend className="text-sm font-semibold text-gray-700">Filtros</legend>
                    <label className="text-sm">
                      Exibir apenas alunos com:
                      <select className="mx-2 border px-1 py-0.5 rounded">
                        <option>MAIS ou IGUAL A</option>
                        <option>MENOS que</option>
                      </select>
                      <input type="number" defaultValue={1} className="border px-2 py-1 w-20 rounded mr-1" /> cobranças vencidas.
                    </label>
                  </fieldset>
                </div>

                <div className="mb-4">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Gerar
                  </button>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2">Exemplo de Resultado (Simulado)</h4>
                  <table className="w-full border text-sm bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1">Aluno</th>
                        <th className="border px-2 py-1">Turma</th>
                        <th className="border px-2 py-1">Curso</th>
                        <th className="border px-2 py-1">Qtd. Cobranças</th>
                        <th className="border px-2 py-1">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-2 py-1">Ana Clara</td>
                        <td className="border px-2 py-1">Turma 1</td>
                        <td className="border px-2 py-1">Técnico em Informática</td>
                        <td className="border px-2 py-1">5</td>
                        <td className="border px-2 py-1">R$ 1.500,00</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Lucas Silva</td>
                        <td className="border px-2 py-1">Turma 2</td>
                        <td className="border px-2 py-1">Ensino Médio</td>
                        <td className="border px-2 py-1">3</td>
                        <td className="border px-2 py-1">R$ 900,00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Contratos' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div className="bg-white shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-lg text-gray-800">
                  Contratos
                </h3>
              </div>
                <LancamentosContratos
                  alunos={alunos}
                  buscaTexto={buscaTexto}
                  setBuscaTexto={setBuscaTexto}
                  abrirGerarContrato={abrirGerarContrato}
                  setAbrirGerarContrato={setAbrirGerarContrato}
                  modeloSelecionado={modeloSelecionado}
                  setModeloSelecionado={setModeloSelecionado}
                  dadosPreenchidos={dadosPreenchidos}
                  setDadosPreenchidos={setDadosPreenchidos}
                  contratoUrl={contratoUrl}
                  setContratoUrl={setContratoUrl}
                  formEdicao={formEdicao}
                  setFormEdicao={setFormEdicao}
                  alunoSelecionado={alunoSelecionado}
                  setAlunoSelecionado={setAlunoSelecionado}
                  modalEdicaoAberto={modalEdicaoAberto}
                  setModalEdicaoAberto={setModalEdicaoAberto}
                  previewHtml={previewHtml}
                  setPreviewHtml={setPreviewHtml}
                  modalPreviewAberto={modalPreviewAberto}
                  setModalPreviewAberto={setModalPreviewAberto}
                  contratosPreenchidos={contratosPreenchidos}
                  setContratosPreenchidos={setContratosPreenchidos}
                  contratoPreenchidoSelecionado={contratoPreenchidoSelecionado}
                  setContratoPreenchidoSelecionado={setContratoPreenchidoSelecionado}
                  templates={templates}
                  fetchContratosPreenchidos={fetchContratosPreenchidos}
                  abrirModalEdicao={abrirModalEdicao}
                  excluirContratoPreenchido={excluirContratoPreenchido}
                  imprimirContratoPreenchido={imprimirContratoPreenchido}
                  abrirPreviewContrato={abrirPreviewContrato}
                />
            </div>
          </div>
        )}

        {activeTab === 'Renegociacoes' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div className="bg-white shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-lg text-gray-800">Renegociações</h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Curso</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Escolha um curso...</option>
                      <option>Técnico em Informática</option>
                      <option>Ensino Médio</option>
                      <option>Administração</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Turmas</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Selecione...</option>
                      <option>Turma 1</option>
                      <option>Turma 2</option>
                      <option>Turma 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Alunos</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Todos</option>
                      <option>Ana Clara</option>
                      <option>Lucas Silva</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Situação do contrato</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Todos</option>
                      <option>Vigente</option>
                      <option>Cancelado</option>
                      <option>Trancado</option>
                    </select>
                  </div>
                </div>

                <fieldset className="border p-4 rounded mb-4">
                  <legend className="text-sm font-semibold text-gray-700">Filtros</legend>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Cobranças na situação</label>
                      <select className="border px-2 py-1 rounded w-full">
                        <option>Todas</option>
                        <option>Vencida</option>
                        <option>Aberta</option>
                        <option>Renegociada</option>
                        <option>Paga</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Tipo de renegociação</label>
                      <select className="border px-2 py-1 rounded w-full">
                        <option>Todos</option>
                        <option>Desconto</option>
                        <option>Parcelamento</option>
                        <option>Reagendamento</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Valor renegociado (mínimo)</label>
                      <input
                        type="number"
                        placeholder="Ex: 100.00"
                        className="border px-2 py-1 rounded w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Data inicial</label>
                      <input type="date" className="border px-2 py-1 rounded w-full" defaultValue="2025-08-01" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Data final</label>
                      <input type="date" className="border px-2 py-1 rounded w-full" defaultValue="2025-08-31" />
                    </div>
                  </div>
                </fieldset>

                <div className="mb-4">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    ⚡ Gerar
                  </button>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2">Exemplo de Resultado (Simulado)</h4>
                  <table className="w-full border text-sm bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1">Aluno</th>
                        <th className="border px-2 py-1">Turma</th>
                        <th className="border px-2 py-1">Contrato</th>
                        <th className="border px-2 py-1">Situação</th>
                        <th className="border px-2 py-1">Tipo</th>
                        <th className="border px-2 py-1">Valor Renegociado</th>
                        <th className="border px-2 py-1">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-2 py-1">Ana Clara</td>
                        <td className="border px-2 py-1">Turma 1</td>
                        <td className="border px-2 py-1">CTR-2024-001</td>
                        <td className="border px-2 py-1">Vigente</td>
                        <td className="border px-2 py-1">Desconto</td>
                        <td className="border px-2 py-1">R$ 300,00</td>
                        <td className="border px-2 py-1">10/08/2025</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Lucas Silva</td>
                        <td className="border px-2 py-1">Turma 2</td>
                        <td className="border px-2 py-1">CTR-2024-009</td>
                        <td className="border px-2 py-1">Trancado</td>
                        <td className="border px-2 py-1">Parcelamento</td>
                        <td className="border px-2 py-1">R$ 900,00</td>
                        <td className="border px-2 py-1">15/08/2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Dividas' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div className="bg-white shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-lg text-gray-800">Dívidas</h3>
              </div>

              <div className="p-6">
                {/* Filtros principais */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Curso</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Escolha um curso...</option>
                      <option>Técnico em Informática</option>
                      <option>Ensino Médio</option>
                      <option>Administração</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Turmas</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Turma 1</option>
                      <option>Turma 2</option>
                      <option>Turma 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Alunos</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Todos</option>
                      <option>Ana Clara</option>
                      <option>Lucas Silva</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Situação do contrato</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Todos</option>
                      <option>Vigente</option>
                      <option>Cancelado</option>
                      <option>Trancado</option>
                    </select>
                  </div>
                </div>

                {/* Filtros avançados */}
                <fieldset className="border p-4 rounded mb-4">
                  <legend className="text-sm font-semibold text-gray-700">Filtros adicionais</legend>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Situação da cobrança</label>
                      <select className="border px-2 py-1 rounded w-full">
                        <option>Todas</option>
                        <option>Vencida</option>
                        <option>Aberta</option>
                        <option>Renegociada</option>
                        <option>Em protesto</option>
                        <option>Serasa</option>
                        <option>Paga</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Tipo de cobrança</label>
                      <select className="border px-2 py-1 rounded w-full">
                        <option>Todas</option>
                        <option>Mensalidade</option>
                        <option>Material Didático</option>
                        <option>Matrícula</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Valor mínimo da dívida</label>
                      <input type="number" placeholder="Ex: 100.00" className="border px-2 py-1 rounded w-full" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Cobranças com mais de (dias)</label>
                      <input type="number" placeholder="Ex: 30" className="border px-2 py-1 rounded w-full" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Protesto</label>
                      <select className="border px-2 py-1 rounded w-full">
                        <option>Não filtrar</option>
                        <option>Com protesto</option>
                        <option>Sem protesto</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Data de protesto entre</label>
                      <div className="flex gap-2">
                        <input type="date" className="border px-2 py-1 rounded w-full" />
                        <input type="date" className="border px-2 py-1 rounded w-full" />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Serasa</label>
                      <select className="border px-2 py-1 rounded w-full">
                        <option>Não filtrar</option>
                        <option>Com serasa</option>
                        <option>Sem serasa</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Data de serasa entre</label>
                      <div className="flex gap-2">
                        <input type="date" className="border px-2 py-1 rounded w-full" />
                        <input type="date" className="border px-2 py-1 rounded w-full" />
                      </div>
                    </div>
                  </div>
                </fieldset>

                <div className="mb-4">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    ⚡ Gerar
                  </button>
                </div>

                {/* Resultado simulado */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2">Exemplo de Resultado (Simulado)</h4>
                  <table className="w-full border text-sm bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1">Aluno</th>
                        <th className="border px-2 py-1">Contrato</th>
                        <th className="border px-2 py-1">Curso</th>
                        <th className="border px-2 py-1">Turma</th>
                        <th className="border px-2 py-1">Valor da dívida</th>
                        <th className="border px-2 py-1">Situação</th>
                        <th className="border px-2 py-1">Protesto</th>
                        <th className="border px-2 py-1">Serasa</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-2 py-1">Ana Clara</td>
                        <td className="border px-2 py-1">CTR-2023-015</td>
                        <td className="border px-2 py-1">Ensino Médio</td>
                        <td className="border px-2 py-1">3º Ano A</td>
                        <td className="border px-2 py-1">R$ 1.200,00</td>
                        <td className="border px-2 py-1">Vencida</td>
                        <td className="border px-2 py-1">Sim (12/06/2025)</td>
                        <td className="border px-2 py-1">Não</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Lucas Silva</td>
                        <td className="border px-2 py-1">CTR-2022-007</td>
                        <td className="border px-2 py-1">Técnico em Informática</td>
                        <td className="border px-2 py-1">2º Módulo</td>
                        <td className="border px-2 py-1">R$ 850,00</td>
                        <td className="border px-2 py-1">Renegociada</td>
                        <td className="border px-2 py-1">Não</td>
                        <td className="border px-2 py-1">Sim (05/07/2025)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Comissao' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div className="bg-white shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-lg text-gray-800">Comissão</h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Curso</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Todos</option>
                      <option>Ensino Médio</option>
                      <option>Técnico em Informática</option>
                      <option>Administração</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Situação do contrato</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Apenas VIGENTE</option>
                      <option>Todos</option>
                      <option>Cancelado</option>
                      <option>Trancado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Colaborador</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Todos</option>
                      <option>João Vendedor</option>
                      <option>Maria Supervisora</option>
                      <option>Carlos Promotor</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Tipo de comissão</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Simples (Apenas valor total)</option>
                      <option>Detalhado (por matrícula)</option>
                      <option>Com porcentagem</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Origem da comissão</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Matrículas cadastradas</option>
                      <option>Contratos ativos</option>
                      <option>Pagamentos confirmados</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Data inicial</label>
                    <input type="date" className="border px-2 py-1 rounded w-full" defaultValue="2025-08-01" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Data final</label>
                    <input type="date" className="border px-2 py-1 rounded w-full" defaultValue="2025-08-31" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Categoria</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Indiferente</option>
                      <option>Interno</option>
                      <option>Externo</option>
                      <option>Parceiro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Filtro por parcela</label>
                    <select className="border px-2 py-1 rounded w-full">
                      <option>Indiferente</option>
                      <option>Apenas parcelas pagas</option>
                      <option>Parcelas em aberto</option>
                      <option>Parcelas vencidas</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    ⚡ Gerar
                  </button>
                </div>

                {/* Resultado simulado */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2">Exemplo de Resultado (Simulado)</h4>
                  <table className="w-full border text-sm bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1">Colaborador</th>
                        <th className="border px-2 py-1">Qtd. Matrículas</th>
                        <th className="border px-2 py-1">Valor Total</th>
                        <th className="border px-2 py-1">Percentual</th>
                        <th className="border px-2 py-1">Comissão</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-2 py-1">João Vendedor</td>
                        <td className="border px-2 py-1">5</td>
                        <td className="border px-2 py-1">R$ 4.250,00</td>
                        <td className="border px-2 py-1">10%</td>
                        <td className="border px-2 py-1 text-green-700 font-semibold">R$ 425,00</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Maria Supervisora</td>
                        <td className="border px-2 py-1">2</td>
                        <td className="border px-2 py-1">R$ 1.600,00</td>
                        <td className="border px-2 py-1">8%</td>
                        <td className="border px-2 py-1 text-green-700 font-semibold">R$ 128,00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Extras' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div className="bg-white shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-lg text-gray-800">Extras</h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Indicadores financeiros resumidos */}
                <div>
                  <h4 className="font-semibold text-md text-gray-700 mb-2">Indicadores Financeiros</h4>
                  <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <li className="p-4 bg-gray-50 border rounded shadow">
                      <strong>Total de receitas 2025:</strong><br />
                      R$ {DADOS_FICTICIOS[2025].receitas.reduce((acc, r) => acc + parseFloat(r.totalPeriodo.replace(/[^\d,-]+/g, '').replace(',', '.')), 0).toFixed(2).replace('.', ',')}
                    </li>
                    <li className="p-4 bg-gray-50 border rounded shadow">
                      <strong>Total de despesas 2025:</strong><br />
                      R$ {DADOS_FICTICIOS[2025].despesas.reduce((acc, d) => acc + parseFloat(d.totalPeriodo.replace(/[^\d,-]+/g, '').replace(',', '.')), 0).toFixed(2).replace('.', ',')}
                    </li>
                    <li className="p-4 bg-gray-50 border rounded shadow">
                      <strong>Saldo bancário total:</strong><br />
                      R$ {DADOS_FICTICIOS[2025].saldos.reduce((acc, s) => acc + parseFloat(s.saldo.replace(/[^\d,-]+/g, '').replace(',', '.')), 0).toFixed(2).replace('.', ',')}
                    </li>
                  </ul>
                </div>

                {/* Alertas e avisos financeiros */}
                <div>
                  <h4 className="font-semibold text-md text-gray-700 mb-2">Alertas Importantes</h4>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {DADOS_COBRANCA["Contas a Pagar"].filter(c => c.Status === "Vencido").map(item => (
                      <li key={item.ID}>Conta vencida: {item.Descrição} (R$ {item.Valor}) - {item.Banco}</li>
                    ))}
                    {DADOS_COBRANCA["Contas a Receber"].filter(c => c.Status === "Vencido").map(item => (
                      <li key={item.ID}>Recebível vencido: {item.Descrição} (R$ {item.Valor}) - {item.Banco}</li>
                    ))}
                  </ul>
                  {(DADOS_COBRANCA["Contas a Pagar"].filter(c => c.Status === "Vencido").length === 0 &&
                    DADOS_COBRANCA["Contas a Receber"].filter(c => c.Status === "Vencido").length === 0) && (
                    <p className="text-green-700">Nenhuma pendência vencida até o momento.</p>
                  )}
                </div>

                {/* Histórico de transferências (resumo) */}
                <div>
                  <h4 className="font-semibold text-md text-gray-700 mb-2">Resumo de Transferências Internas</h4>
                  <ul className="text-sm text-gray-800 space-y-1">
                    {Object.entries(DADOS_CAIXA_DESTINO).flatMap(([banco, dados]) =>
                      dados.saidas
                        .filter(s => s.descricao.toLowerCase().includes("transferência"))
                        .map((s, idx) => (
                          <li key={`${banco}-${idx}`}>
                            {s.data} — {s.descricao} ({banco}) — {s.valor}
                          </li>
                        ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
    
      </div>
    </div>
  );
};

export default LancamentosPage;
