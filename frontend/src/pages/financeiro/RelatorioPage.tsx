import { useEffect, useState } from 'react';
import React from 'react';
import { Bar, Doughnut, Line, Pie, PolarArea, Radar } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart } from 'chart.js';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx'
import FiltroData from '../gestor/components/FiltroData';
import FiltroBusca from '../gestor/components/FiltroBusca';
import FiltroCategoria from '../gestor/components/FiltroCategoria';
function gerarRelatorioPDF(titulo: string, dados: { descricao: string; valor: number }[]) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 105, 15, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(10, 20, 200, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  let y = 30;

  doc.setFont('helvetica', 'bold');
  doc.text('Descrição', 20, y);
  doc.text('Valor (R$)', 150, y);
  doc.setLineWidth(0.1);
  doc.line(10, y + 2, 200, y + 2);
  y += 10;

  doc.setFont('helvetica', 'normal');
  let total = 0;
  dados.forEach((item) => {
    doc.text(item.descricao, 20, y);
    doc.text(`R$ ${item.valor.toLocaleString('pt-BR')}`, 150, y);
    total += item.valor;
    y += 10;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 20, y);
  doc.text(`R$ ${total.toLocaleString('pt-BR')}`, 150, y);

  const dataAtual = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Relatório gerado em: ${dataAtual}`, 10, 290);
  doc.save(`${titulo}.pdf`);
}
function exportarParaExcel(titulo: string, dados: { descricao: string; valor: number }[]) {
  const total = dados.reduce((acc, item) => acc + item.valor, 0);
  const worksheet = XLSX.utils.json_to_sheet(
    dados.map((item) => ({
      Descrição: item.descricao,
      Valor: `R$ ${item.valor.toLocaleString('pt-BR')}`,
    }))
  );
  const totalRow = {
    Descrição: 'Total',
    Valor: `R$ ${total.toLocaleString('pt-BR')}`,
  };
  XLSX.utils.sheet_add_json(worksheet, [totalRow], { skipHeader: true, origin: -1 });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
  XLSX.writeFile(workbook, `${titulo}.xlsx`);
}
function gerarNumeroAleatorio(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function gerarTransacoes(startDate: Date, endDate: Date): any[] {
  const transacoes = [];
  const tipos = ['Receita', 'Despesa'];
  const descricoesReceita = [
    'Recebimento de Mensalidade',
    'Recebimento de Doação',
    'Venda de Material Didático',
    'Taxa de Matrícula',
    'Venda de Kit Papelaria',
    'Faturamento de Eventos',
    'Atividades Extracurriculares',
    'Rendimentos de Aplicações Financeiras',
  ];
  const descricoesDespesa = [
    'Compra de Material Escolar',
    'Manutenção Elétrica',
    'Salário em Folha de Pagamento',
    'Aluguel de Espaço',
    'Impostos',
    'Compra de Equipamentos',
    'Despesas com Marketing',
    'Despesas com Eventos',
  ];
  const diasIntervalo = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  for (let i = 0; i < 50; i++) {
    const tipo = tipos[gerarNumeroAleatorio(0, 1)];
    const descricao =
      tipo === 'Receita'
        ? descricoesReceita[gerarNumeroAleatorio(0, descricoesReceita.length - 1)]
        : descricoesDespesa[gerarNumeroAleatorio(0, descricoesDespesa.length - 1)];
    const valor = gerarNumeroAleatorio(500, 5000);
    const data = new Date(
      startDate.getTime() + gerarNumeroAleatorio(0, diasIntervalo) * (1000 * 60 * 60 * 24)
    );
    transacoes.push({
      id: i + 1,
      descricao,
      tipo,
      valor,
      data: data.toLocaleDateString('pt-BR'),
    });
  }
  return transacoes;
}
type DadosFuncionarios = {
  [key: string]: { nome: string; salario: number }[];
};

function gerarFolhaPagamentoPDF(cargo: keyof DadosFuncionarios, dadosFuncionarios: DadosFuncionarios) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Folha de Pagamento - ${cargo}`, 105, 15, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(10, 20, 200, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  let y = 30;

  doc.setFont('helvetica', 'bold');
  doc.text('Nome', 20, y);
  doc.text('Salário (R$)', 150, y);
  doc.setLineWidth(0.1);
  doc.line(10, y + 2, 200, y + 2);
  y += 10;

  doc.setFont('helvetica', 'normal');
  let total = 0;
  dadosFuncionarios[cargo].forEach((funcionario) => {
    doc.text(funcionario.nome, 20, y);
    doc.text(`R$ ${funcionario.salario.toLocaleString('pt-BR')}`, 150, y);
    total += funcionario.salario;
    y += 10;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 20, y);
  doc.text(`R$ ${total.toLocaleString('pt-BR')}`, 150, y);

  const dataAtual = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Relatório gerado em: ${dataAtual}`, 10, 290);

  doc.save(`Folha_de_Pagamento_${cargo}.pdf`);
}
function FinanceiroPage() {
  const [isReceitasModalOpen, setIsReceitasModalOpen] = useState(false);
  const [isDespesasModalOpen, setIsDespesasModalOpen] = useState(false);
  const [isLucroModalOpen, setIsLucroModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const receitasModalRef = React.useRef<HTMLDivElement>(null);
  const despesasModalRef = React.useRef<HTMLDivElement>(null);
  const lucroModalRef = React.useRef<HTMLDivElement>(null);
  const [dadosGerados, setDadosGerados] = useState<any>(null);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [ordem, setOrdem] = useState({ atributo: '', crescente: true });
  const itensPorPagina = 10;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLUListElement>(null);
  const [isModalFolhaOpen, setIsModalFolhaOpen] = useState(false);
  const [indiceSelecionado, setIndiceSelecionado] = useState<number | null>(null);
  const modalFolhaRef = React.useRef<HTMLDivElement>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const categorias = ["Receitas", "Despesas", "Projeção", "Distribuição"];
  const [buscaNome] = useState("");

  const filtrarDados = (dados: any[], _categoria: string, _nome: string) => {
    return dados
    .filter((item) => {
      return !categoriaSelecionada || item.categoria === categoriaSelecionada;
    })
    .filter((item) => {
      return !buscaNome || item.nome?.toLowerCase().includes(buscaNome.toLowerCase());
    });
  };
  const gerarValores = () => {
    return {
      receitasDetalhadas: Array.from({ length: 10 }, () => gerarNumeroAleatorio(5500, 21000)) || [],
      mensalidades: Array.from({ length: 50 }, () => gerarNumeroAleatorio(2300, 3900)) || [],
      despesasDetalhadas: Array.from({ length: 8 }, () => gerarNumeroAleatorio(4000, 18000)) || [],
      receitasMes: Array.from({ length: 12 }, () => gerarNumeroAleatorio(10000, 20000)) || [],
      despesasMes: Array.from({ length: 12 }, () => gerarNumeroAleatorio(8000, 15000)) || [],
      salariosProfessores: Array.from({ length: 10 }, () => gerarNumeroAleatorio(3000, 5000)) || [],
      salariosAdministrativo: Array.from({ length: 10 }, () => gerarNumeroAleatorio(3000, 6000)) || [],
      salariosManutencao: Array.from({ length: 10 }, () => gerarNumeroAleatorio(2000, 4000)) || [],
      salariosOutros: Array.from({ length: 10 }, () => gerarNumeroAleatorio(2000, 4000)) || [],
      projecaoReceitas: Array.from({ length: 5 }, () => gerarNumeroAleatorio(90000, 150000)) || [],
      projecaoDespesas: Array.from({ length: 5 }, () => gerarNumeroAleatorio(80000, 130000)) || [],
      alunosInadimplentes: Array.from({ length: 12 }, () => gerarNumeroAleatorio(5, 30)) || [],
      projecaoMatriculas: Array.from({ length: 5 }, () => gerarNumeroAleatorio(100, 300)) || [],
    };
  };
  useEffect(() => {
    if (startDate && endDate) {
      const transacoesGeradas = gerarTransacoes(startDate, endDate);
      transacoesGeradas.sort((a, b) => {
        const dataA = new Date(a.data.split('/').reverse().join('-'));
        const dataB = new Date(b.data.split('/').reverse().join('-'));
        return dataB.getTime() - dataA.getTime();
      });
      setTransacoes(transacoesGeradas);
      setPaginaAtual(0);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (!startDate || !endDate) {
      setDadosGerados(gerarValores());
    }
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      setDadosGerados(gerarValores());
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const handleClickOutsideReceitasModal = (event: MouseEvent) => {
      if (receitasModalRef.current && !receitasModalRef.current.contains(event.target as Node)) {
        setIsReceitasModalOpen(false);
      }
    };

    const handleClickOutsideDespesasModal = (event: MouseEvent) => {
      if (despesasModalRef.current && !despesasModalRef.current.contains(event.target as Node)) {
        setIsDespesasModalOpen(false);
      }
    };

    const handleClickOutsideLucroModal = (event: MouseEvent) => {
      if (lucroModalRef.current && !lucroModalRef.current.contains(event.target as Node)) {
        setIsLucroModalOpen(false);
      }
    };

    const handleClickOutsideDropdown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleClickOutsideFolhaModal = (event: MouseEvent) => {
      if (modalFolhaRef && modalFolhaRef.current && !modalFolhaRef.current.contains(event.target as Node)) {
        setIsModalFolhaOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideReceitasModal);
    document.addEventListener('mousedown', handleClickOutsideDespesasModal);
    document.addEventListener('mousedown', handleClickOutsideLucroModal);
    document.addEventListener('mousedown', handleClickOutsideDropdown);
    document.addEventListener('mousedown', handleClickOutsideFolhaModal);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideReceitasModal);
      document.removeEventListener('mousedown', handleClickOutsideDespesasModal);
      document.removeEventListener('mousedown', handleClickOutsideLucroModal);
      document.removeEventListener('mousedown', handleClickOutsideDropdown);
      document.removeEventListener('mousedown', handleClickOutsideFolhaModal);
    };
  }, []);

  const transacoesFiltradas = transacoes
    .filter((transacao) =>
      transacao.descricao.toLowerCase().includes(busca.toLowerCase())
    )
    .filter((transacao) => (filtroTipo ? transacao.tipo === filtroTipo : true))
    .sort((a, b) => {
      if (!ordem.atributo) return 0;
      const valorA = a[ordem.atributo];
      const valorB = b[ordem.atributo];
      if (typeof valorA === 'string') {
        return ordem.crescente
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }
      return ordem.crescente ? valorA - valorB : valorB - valorA;
    });
    
  const transacoesPaginadas = transacoesFiltradas.slice(
    paginaAtual * itensPorPagina,
    (paginaAtual + 1) * itensPorPagina
  );

  const avancarPagina = () => {
    if ((paginaAtual + 1) * itensPorPagina < transacoes.length) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const voltarPagina = () => {
    if (paginaAtual > 0) {
      setPaginaAtual(paginaAtual - 1);
    }
  };
  
  const handleBusca = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(event.target.value);
  };

  const handleFiltroTipo = (tipo: string) => {
    setFiltroTipo(tipo);
    setIsDropdownOpen(false);
  };

  const handleOrdenar = (atributo: string) => {
    setOrdem((prev) => ({
      atributo,
      crescente: prev.atributo === atributo ? !prev.crescente : true,
    }));
  };

  const receitasDetalhadas = [
    { id: 1, descricao: 'Taxa de Matrícula', valor: dadosGerados?.receitasDetalhadas[0] || 0 },
    { id: 2, descricao: 'Eventos', valor: dadosGerados?.receitasDetalhadas[1] || 0 },
    { id: 3, descricao: 'Doações', valor: dadosGerados?.receitasDetalhadas[2] || 0 },
    { id: 4, descricao: 'Parcerias e Patrocínios', valor: dadosGerados?.receitasDetalhadas[3] || 0 },
    { id: 5, descricao: 'Atividades Extracurriculares', valor: dadosGerados?.receitasDetalhadas[4] || 0 },
    { id: 6, descricao: 'Venda de Materiais Didáticos', valor: dadosGerados?.receitasDetalhadas[5] || 0 },
    { id: 7, descricao: 'Cursos e Treinamentos', valor: dadosGerados?.receitasDetalhadas[6] || 0 },
    { id: 8, descricao: 'Rendimentos de Aplicações Financeiras', valor: dadosGerados?.receitasDetalhadas[7] || 0 },
    { id: 9, descricao: 'Outras Vendas', valor: dadosGerados?.receitasDetalhadas[8] || 0 },
    { id: 10, descricao: 'Outras Receitas', valor: dadosGerados?.receitasDetalhadas[9] || 0 },
  ];
  const mensalidades = [
    { id: 1, descricao: 'Mensalidade - Ozzy Ozbourne', valor: dadosGerados?.mensalidades[0] || 0 },
    { id: 2, descricao: 'Mensalidade - Emily Armstrong', valor: dadosGerados?.mensalidades[1] || 0 },
    { id: 3, descricao: 'Mensalidade - John Doe', valor: dadosGerados?.mensalidades[2] || 0 },
    { id: 4, descricao: 'Mensalidade - Jane Smith', valor: dadosGerados?.mensalidades[3] || 0 },
    { id: 5, descricao: 'Mensalidade - Alice Johnson', valor: dadosGerados?.mensalidades[4] || 0 },
    { id: 6, descricao: 'Mensalidade - Bob Brown', valor: dadosGerados?.mensalidades[5] || 0 },
    { id: 7, descricao: 'Mensalidade - Charlie White', valor: dadosGerados?.mensalidades[6] || 0 },
    { id: 8, descricao: 'Mensalidade - David Green', valor: dadosGerados?.mensalidades[7] || 0 },
    { id: 9, descricao: 'Mensalidade - Eva Black', valor: dadosGerados?.mensalidades[8] || 0 },
    { id: 10, descricao: 'Mensalidade - Frank Blue', valor: dadosGerados?.mensalidades[9] || 0 },
    { id: 11, descricao: 'Mensalidade - Grace Yellow', valor: dadosGerados?.mensalidades[10] || 0 },
    { id: 12, descricao: 'Mensalidade - Henry Red', valor: dadosGerados?.mensalidades[11] || 0 },
    { id: 13, descricao: 'Mensalidade - Ivy Pink', valor: dadosGerados?.mensalidades[12] || 0 },
    { id: 14, descricao: 'Mensalidade - Jack Purple', valor: dadosGerados?.mensalidades[13] || 0 },
    { id: 15, descricao: 'Mensalidade - Kate Orange', valor: dadosGerados?.mensalidades[14] || 0 },
    { id: 16, descricao: 'Mensalidade - Liam Gray', valor: dadosGerados?.mensalidades[15] || 0 },
    { id: 17, descricao: 'Mensalidade - Mia Cyan', valor: dadosGerados?.mensalidades[16] || 0 },
    { id: 18, descricao: 'Mensalidade - Noah Magenta', valor: dadosGerados?.mensalidades[17] || 0 },
    { id: 19, descricao: 'Mensalidade - Olivia Teal', valor: dadosGerados?.mensalidades[18] || 0 },
    { id: 20, descricao: 'Mensalidade - Paul Silver', valor: dadosGerados?.mensalidades[19] || 0 },
    { id: 21, descricao: 'Mensalidade - Quinn Gold', valor: dadosGerados?.mensalidades[20] || 0 },
    { id: 22, descricao: 'Mensalidade - Ryan Bronze', valor: dadosGerados?.mensalidades[21] || 0 },
    { id: 23, descricao: 'Mensalidade - Sophia Copper', valor: dadosGerados?.mensalidades[22] || 0 },
    { id: 24, descricao: 'Mensalidade - Tyler Steel', valor: dadosGerados?.mensalidades[23] || 0 },
    { id: 25, descricao: 'Mensalidade - Uma Violet', valor: dadosGerados?.mensalidades[24] || 0 },
    { id: 26, descricao: 'Mensalidade - Victor indigo', valor: dadosGerados?.mensalidades[25] || 0 },
    { id: 27, descricao: 'Mensalidade - Willow Lavender', valor: dadosGerados?.mensalidades[26] || 0 },
    { id: 28, descricao: 'Mensalidade - Xavier Olive', valor: dadosGerados?.mensalidades[27] || 0 },
    { id: 29, descricao: 'Mensalidade - Yara Coral', valor: dadosGerados?.mensalidades[28] || 0 },
    { id: 30, descricao: 'Mensalidade - Zachary Peach', valor: dadosGerados?.mensalidades[29] || 0 },
    { id: 31, descricao: 'Mensalidade - Ava Mint', valor: dadosGerados?.mensalidades[30] || 0 },
    { id: 32, descricao: 'Mensalidade - Benjamin Lemon', valor: dadosGerados?.mensalidades[31] || 0 },
    { id: 33, descricao: 'Mensalidade - Chloe Lime', valor: dadosGerados?.mensalidades[32] || 0 },
    { id: 34, descricao: 'Mensalidade - Daniel Cherry', valor: dadosGerados?.mensalidades[33] || 0 },
    { id: 35, descricao: 'Mensalidade - Ella Plum', valor: dadosGerados?.mensalidades[34] || 0 },
    { id: 36, descricao: 'Mensalidade - Finn Walnut', valor: dadosGerados?.mensalidades[35] || 0 },
    { id: 37, descricao: 'Mensalidade - Grace Birch', valor: dadosGerados?.mensalidades[36] || 0 },
    { id: 38, descricao: 'Mensalidade - Henry Cedar', valor: dadosGerados?.mensalidades[37] || 0 },
    { id: 39, descricao: 'Mensalidade - Isla Spruce', valor: dadosGerados?.mensalidades[38] || 0 },
    { id: 40, descricao: 'Mensalidade - Jack Redwood', valor: dadosGerados?.mensalidades[39] || 0 },
    { id: 41, descricao: 'Mensalidade - Liam Fir', valor: dadosGerados?.mensalidades[40] || 0 },
    { id: 42, descricao: 'Mensalidade - Mia Cypress', valor: dadosGerados?.mensalidades[41] || 0 },
    { id: 43, descricao: 'Mensalidade - Noah Hemlock', valor: dadosGerados?.mensalidades[42] || 0 },
    { id: 44, descricao: 'Mensalidade - Olivia Maple', valor: dadosGerados?.mensalidades[43] || 0 },
    { id: 45, descricao: 'Mensalidade - Paul Oak', valor: dadosGerados?.mensalidades[44] || 0 },
    { id: 46, descricao: 'Mensalidade - Quinn Willow', valor: dadosGerados?.mensalidades[45] || 0 },
    { id: 47, descricao: 'Mensalidade - Ryan Aspen', valor: dadosGerados?.mensalidades[46] || 0 },
    { id: 48, descricao: 'Mensalidade - Sophia Birch', valor: dadosGerados?.mensalidades[47] || 0 },
    { id: 49, descricao: 'Mensalidade - Tyler Cedar', valor: dadosGerados?.mensalidades[48] || 0 },
    { id: 50, descricao: 'Mensalidade - Uma Redwood', valor: dadosGerados?.mensalidades[49] || 0 },
  ];
  const totalMensalidades = mensalidades.reduce((acc: number, mensalidade: { valor: number }) => acc + mensalidade.valor, 0) || 0;
  const dadosFuncionarios = {
    Professores: [
      { nome: 'João Silva', salario: dadosGerados?.salariosProfessores[0] || 0 },
      { nome: 'Ana Santos', salario: dadosGerados?.salariosProfessores[1] || 0 },
      { nome: 'Maria Oliveira', salario: dadosGerados?.salariosProfessores[2] || 0 },
      { nome: 'Pedro Almeida', salario: dadosGerados?.salariosProfessores[3] || 0 },
      { nome: 'Lucas Costa', salario: dadosGerados?.salariosProfessores[4] || 0 },
      { nome: 'Fernanda Lima', salario: dadosGerados?.salariosProfessores[5] || 0 },
      { nome: 'Rafael Pereira', salario: dadosGerados?.salariosProfessores[6] || 0 },
      { nome: 'Juliana Martins', salario: dadosGerados?.salariosProfessores[7] || 0 },
      { nome: 'Carlos Souza', salario: dadosGerados?.salariosProfessores[8] || 0 },
      { nome: 'Ana Lima', salario: dadosGerados?.salariosProfessores[9] || 0 },
    ],
    Administrativo: [
      { nome: 'Carlos Souza', salario: dadosGerados?.salariosAdministrativo[0] || 0 },
      { nome: 'Juliana Martins', salario: dadosGerados?.salariosAdministrativo[1] || 0 },
      { nome: 'Ana Lima', salario: dadosGerados?.salariosAdministrativo[2] || 0 },
      { nome: 'Marcos Silva', salario: dadosGerados?.salariosAdministrativo[3] || 0 },
      { nome: 'Tatiane Almeida', salario: dadosGerados?.salariosAdministrativo[4] || 0 },
      { nome: 'Roberto Costa', salario: dadosGerados?.salariosAdministrativo[5] || 0 },
      { nome: 'Patrícia Santos', salario: dadosGerados?.salariosAdministrativo[6] || 0 },
      { nome: 'Ricardo Oliveira', salario: dadosGerados?.salariosAdministrativo[7] || 0 },
      { nome: 'Renata Lima', salario: dadosGerados?.salariosAdministrativo[8] || 0 },
      { nome: 'Felipe Almeida', salario: dadosGerados?.salariosAdministrativo[9] || 0 },
    ],
    Manutenção: [
      { nome: 'Pedro Santos', salario: dadosGerados?.salariosManutencao[0] || 0 },
      { nome: 'Mariana Costa', salario: dadosGerados?.salariosManutencao[1] || 0 },
      { nome: 'Lucas Almeida', salario: dadosGerados?.salariosManutencao[2] || 0 },
      { nome: 'Fernanda Lima', salario: dadosGerados?.salariosManutencao[3] || 0 },
      { nome: 'Ricardo Oliveira', salario: dadosGerados?.salariosManutencao[4] || 0 },
      { nome: 'Tatiane Almeida', salario: dadosGerados?.salariosManutencao[5] || 0 },
      { nome: 'Roberto Costa', salario: dadosGerados?.salariosManutencao[6] || 0 },
      { nome: 'Patrícia Santos', salario: dadosGerados?.salariosManutencao[7] || 0 },
      { nome: 'Juliana Martins', salario: dadosGerados?.salariosManutencao[8] || 0 },
      { nome: 'Felipe Almeida', salario: dadosGerados?.salariosManutencao[9] || 0 },
    ],
    Outros: [
      { nome: 'Fernanda Costa', salario: dadosGerados?.salariosOutros[0] || 0 },
      { nome: 'Rafael Pereira', salario: dadosGerados?.salariosOutros[1] || 0 },
      { nome: 'Marcos Silva', salario: dadosGerados?.salariosOutros[2] || 0 },
      { nome: 'Tatiane Almeida', salario: dadosGerados?.salariosOutros[3] || 0 },
      { nome: 'Roberto Costa', salario: dadosGerados?.salariosOutros[4] || 0 },
      { nome: 'Patrícia Santos', salario: dadosGerados?.salariosOutros[5] || 0 },
      { nome: 'Ricardo Oliveira', salario: dadosGerados?.salariosOutros[6] || 0 },
      { nome: 'Juliana Martins', salario: dadosGerados?.salariosOutros[7] || 0 },
      { nome: 'Carlos Souza', salario: dadosGerados?.salariosOutros[8] || 0 },
      { nome: 'Ana Lima', salario: dadosGerados?.salariosOutros[9] || 0 },
    ],
  };
  const cargos: (keyof typeof dadosFuncionarios)[] = ['Professores', 'Administrativo', 'Manutenção', 'Outros'];
  const salariosProfessores = dadosFuncionarios.Professores.reduce((acc: any, salario: { salario: any; }) => acc + salario.salario, 0);
  const salariosAdministrativo = dadosFuncionarios.Administrativo.reduce((acc: any, salario: { salario: any; }) => acc + salario.salario, 0);
  const salariosManutencao = dadosFuncionarios.Manutenção.reduce((acc: any, salario: { salario: any; }) => acc + salario.salario, 0); 
  const salariosOutros = dadosFuncionarios.Outros.reduce((acc: any, salario: { salario: any; }) => acc + salario.salario, 0);
  const salarios = salariosProfessores + salariosAdministrativo + salariosManutencao + salariosOutros;

  const despesasDetalhadas = [
    { id: 1, descricao: 'Salários', valor: salarios },
    { id: 2, descricao: 'Manutenção', valor: dadosGerados?.despesasDetalhadas[0] || 0 },
    { id: 3, descricao: 'Material Didático', valor: dadosGerados?.despesasDetalhadas[1] || 0 },
    { id: 4, descricao: 'Eventos', valor: dadosGerados?.despesasDetalhadas[2] || 0 },
    { id: 5, descricao: 'Aluguel', valor: dadosGerados?.despesasDetalhadas[3] || 0 },
    { id: 6, descricao: 'Contas de Serviços Públicos', valor: dadosGerados?.despesasDetalhadas[4] || 0 },
    { id: 7, descricao: 'Marketing e Publicidade', valor: dadosGerados?.despesasDetalhadas[5] || 0 },
    { id: 8, descricao: 'Impostos e Taxas', valor: dadosGerados?.despesasDetalhadas[6] || 0 },
    { id: 9, descricao: 'Outras Despesas', valor: dadosGerados?.despesasDetalhadas[7] || 0 },
  ];

  const totalReceitas = [...receitasDetalhadas, ...mensalidades].reduce((acc, receita) => acc + receita.valor, 0);
  const totalDespesas = despesasDetalhadas.reduce((acc, despesa) => acc + despesa.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  const estimativaLucroMensal = Number((saldo / 12).toFixed(2));
  const impostos = saldo * 0.15;

  const lucroDetalhado = [
    { descricao: 'Saldo Atual', valor: saldo },
    { descricao: 'Total de Receitas Anuais', valor: totalReceitas },
    { descricao: 'Total de Despesas Anuais', valor: totalDespesas },
    { descricao: 'Lucro Bruto Estimado', valor: saldo },
    { descricao: 'Impostos Estimados', valor: impostos }, 
    { descricao: 'Lucro Operacional Estimado', valor: saldo - impostos },
  ];

  const fluxoDeCaixa = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Receitas',
        data: dadosGerados?.receitasMes || [],
        backgroundColor: '#F19953',
        backgroundColorHover: '#D68A3C',
      },
      {
        label: 'Despesas',
        data: dadosGerados?.despesasMes || [],
        backgroundColor: '#759C9D',
        backgroundColorHover: '#5A7D7E',
      },
    ],
  };
  const folhaDePagamento = {
    labels: ['Professores', 'Administrativo', 'Manutenção', 'Outros'],
    datasets: [
      {
        data: [salariosProfessores, salariosAdministrativo, salariosManutencao, salariosOutros], 
        backgroundColor: ['#759C9D', '#F19953', '#ACDDE7', '#F5E7AD'],
        backgroundColorHover: ['#5A7D7E', '#D68A3C', '#8CC4D0', '#E1DCA6'],
      },
    ],
  };
  const projecaoCrescimento = {
    labels: ['2025', '2026', '2027', '2028', '2029'],
    datasets: [
      {
        label: 'Projeção de Receitas',
        data: dadosGerados?.projecaoReceitas || [],
        borderColor: 'rgb(157, 231, 248)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Projeção de Despesas',
        data: dadosGerados?.projecaoDespesas || [],
        borderColor: 'rgb(255, 247, 160)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };
  const alunosInadimplentes = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Alunos Inadimplentes',
        data: dadosGerados?.alunosInadimplentes || [],
        backgroundColor: 'rgba(241, 153, 83, 0.5)',
        borderColor: 'rgba(241, 153, 83, 1)',
        borderWidth: 1,
      },
    ],
  };
  const projecaoMatriculas = {
    labels: ['2025', '2026', '2027', '2028', '2029'],
    datasets: [
      {
        label: 'Projeção de Matrículas',
        data: dadosGerados?.projecaoMatriculas || [],
        borderColor: 'rgba(101, 158, 160, 1)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };
  const distribuicaoDespesas = {
    labels: despesasDetalhadas.map((despesa) => despesa.descricao),
    datasets: [
      {
        data: despesasDetalhadas.map((despesa) => despesa.valor), 
        backgroundColor: ['#759C9D', '#F19953', '#ACDDE7', '#CCCCCC', '#F5E7AD', '#CFBB9D', '#4F6A6B', '#D1E2CA', '#999'],
        backgroundColorHover: ['#5A7D7E', '#D68A3C', '#8CC4D0', '#B0B0B0', '#E1DCA6', '#BFAF9D', '#3A4B4C', '#A8C6A8'],
      },
    ],
  };
  const [paginaAtualMensalidades, setPaginaAtualMensalidades] = useState(0);
  const itensPorPaginaMensalidades = 5;
  const mensalidadesPaginadas = mensalidades.slice(
    paginaAtualMensalidades * itensPorPaginaMensalidades,
    (paginaAtualMensalidades + 1) * itensPorPaginaMensalidades
  );

  const avancarPaginaMensalidades = () => {
    if ((paginaAtualMensalidades + 1) * itensPorPaginaMensalidades < mensalidades.length) {
      setPaginaAtualMensalidades(paginaAtualMensalidades + 1);
    }
  };

  const voltarPaginaMensalidades = () => {
    if (paginaAtualMensalidades > 0) {
      setPaginaAtualMensalidades(paginaAtualMensalidades - 1);
    }
  };

  const cardsFiltrados = filtrarDados(
    [
      { nome: "Receitas", valor: totalReceitas, categoria: "Receitas", onClick: () => setIsReceitasModalOpen(true) },
      { nome: "Despesas", valor: totalDespesas, categoria: "Despesas", onClick: () => setIsDespesasModalOpen(true) },
      { nome: "Saldo", valor: saldo, categoria: "Projeção", onClick: () => setIsLucroModalOpen(true) },
    ],
    categoriaSelecionada,
    buscaNome
  );

  const chartsFiltrados = filtrarDados(
    [
      {
        nome: "Distribuição de Despesas",
        categoria: "Distribuição",
        tipo: "Doughnut",
        dados: distribuicaoDespesas,
      },
      {
        nome: "Fluxo de Caixa Mensal",
        categoria: "Distribuição",
        tipo: "Bar",
        dados: fluxoDeCaixa,
      },
      {
        nome: "Distribuição da Folha de Pagamento",
        categoria: "Distribuição",
        tipo: "Bar",
        dados: folhaDePagamento,
        onClick: (event: any) => {
          const chart = Chart.getChart(event.currentTarget as HTMLCanvasElement);
          if (chart) {
            const elements = chart.getElementsAtEventForMode(
              event.nativeEvent,
              "nearest",
              { intersect: true },
              false
            );
            if (elements.length > 0) {
              const indice = elements[0].index;
              setIndiceSelecionado(indice);
              setIsModalFolhaOpen(true);
            }
          }
        },
        options: {
          indexAxis: "y",
          scales: {
            x: { title: { display: true, text: "Valor (R$)" }, beginAtZero: true },
            y: { title: { display: true, text: "Cargos" } },
          },
          plugins: { legend: { display: false } },
        },
      },
      {
        nome: "Projeção de Crescimento",
        categoria: "Projeção",
        tipo: "Line",
        dados: projecaoCrescimento,
      },
      {
        nome: "Alunos Inadimplentes",
        categoria: "Despesas",
        tipo: "Bar",
        dados: alunosInadimplentes,
      },
      {
        nome: "Projeção de Matrículas",
        categoria: "Projeção",
        tipo: "Line",
        dados: projecaoMatriculas,
      },
    ],
    categoriaSelecionada,
    buscaNome
  );

  const tabelasFiltradas = filtrarDados(
    [
      { nome: "Transações Recentes", categoria: "Receitas", dados: transacoes },
    ],
    categoriaSelecionada,
    buscaNome
  );

  return (
    <div className="financeiro-container">
      <div className='fin-title'>
        <h1>Gestão Financeira</h1>
      </div>
      <div className="fin-filtro-container">
        <h2>Filtros</h2>
        <FiltroData
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
        <FiltroCategoria
          categorias={categorias}
          categoriaSelecionada={categoriaSelecionada}
          setCategoriaSelecionada={setCategoriaSelecionada}
        />
        <FiltroBusca busca={busca} setBusca={setBusca} />
      </div>
      
      {!startDate || !endDate ? (
        <div className="no-data-message">
          <h3>Por favor, selecione um intervalo de datas para visualizar os relatórios.</h3>
        </div>
      ) : ( <>
      <div className="fin-cards-container">
        {cardsFiltrados.map((card, index) => (
          <div className="fin-card" key={index} onClick={card.onClick}>
            <h3>{card.nome}</h3>
            <p>R$ {card.valor.toLocaleString("pt-BR")}</p>
          </div>
        ))}
      </div>

      {isReceitasModalOpen && (
        <div className="modal">
          <div className="modal-content" ref={receitasModalRef}>
            <span className="close-icon" onClick={() => setIsReceitasModalOpen(false)}>
              &times;
            </span>
            <h2>Detalhes das Receitas Anuais</h2>
            <ul>
              {receitasDetalhadas.map((receita) => (
                <li key={receita.id}>
                  <strong>{receita.descricao}:</strong> R${receita.valor.toLocaleString('pt-BR')}
                </li>
              ))}
            </ul>
            <p>
              <strong>Mensalidades:</strong> R${totalMensalidades.toLocaleString('pt-BR')}
            </p>
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {mensalidadesPaginadas.map((mensalidade) => (
                  <tr key={mensalidade.id}>
                    <td>{mensalidade.descricao}</td>
                    <td>R$ {mensalidade.valor.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination-buttons">
              <button onClick={voltarPaginaMensalidades} disabled={paginaAtualMensalidades === 0}>
                &lt; Anterior
              </button>
              <button
                onClick={avancarPaginaMensalidades}
                disabled={(paginaAtualMensalidades + 1) * itensPorPaginaMensalidades >= mensalidades.length}
              >
                Próximo &gt;
              </button>
            </div>
            <p><br />
              <strong>Total de Receitas:</strong> R${totalReceitas.toLocaleString('pt-BR')}
            </p>
            <div className="modal-buttons">
              <button onClick={() => gerarRelatorioPDF('Relatório de Receitas', [...receitasDetalhadas, ...mensalidades])}>
                Gerar Relatório em PDF
              </button>
              <button onClick={() => exportarParaExcel('Relatório de Receitas', [...receitasDetalhadas, ...mensalidades])}>
                Exportar para Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {isDespesasModalOpen && (
        <div className="modal">
          <div className="modal-content" ref={despesasModalRef}>
            <span className="close-icon" onClick={() => setIsDespesasModalOpen(false)}>&times;</span>
            <h2>Detalhes das Despesas Anuais</h2>
            <ul>
              {despesasDetalhadas.map((despesa) => (
                <li key={despesa.id}>
                  <strong>{despesa.descricao}:</strong> R$ {despesa.valor.toLocaleString('pt-BR')}
                </li>
              ))}
            </ul>
            <p><strong>Total de Despesas:</strong> R$ {totalDespesas.toLocaleString('pt-BR')}</p>
            <div className="modal-buttons">
              <button onClick={() => gerarRelatorioPDF('Relatório de Despesas', despesasDetalhadas)}> Gerar Relatório em PDF </button>
              <button onClick={() => exportarParaExcel('Relatório de Despesas', despesasDetalhadas)}> Exportar para Excel </button>
            </div>
          </div>
        </div>
      )}

      {isLucroModalOpen && (
        <div className="modal">
          <div className="modal-content" ref={lucroModalRef}>
            <span className="close-icon" onClick={() => setIsLucroModalOpen(false)}>&times;</span>
            <h2>Projeção de Lucro Mensal</h2>
            <p>
              Com base no saldo atual, a estimativa de lucro mensal é de: <strong>R$ {estimativaLucroMensal.toLocaleString('pt-BR')}</strong>
            </p>
            <ul>
              {lucroDetalhado.map((lucro) => (
                <li key={lucro.descricao}>
                  <strong>{lucro.descricao}:</strong> R$ {lucro.valor.toLocaleString('pt-BR')}
                </li>
              ))}
            </ul>
            <div className="modal-buttons">
              <button onClick={() => gerarRelatorioPDF('Estimativa de Lucro Mensal', lucroDetalhado)}>Gerar Relatório em PDF</button>
              <button onClick={() => exportarParaExcel('Estimativa de Lucro Mensal', lucroDetalhado)}>Exportar para Excel</button>
            </div>
          </div>
        </div>
      )}

      <div className="fin-charts-container">
      {chartsFiltrados.map((chart, index) => (
        <div className="fin-chart" key={index}>
          <h3>{chart.nome}</h3>
          {chart.tipo === "Doughnut" && <Doughnut data={chart.dados} />}
          {chart.tipo === "Bar" && (
            <Bar
              data={chart.dados}
              options={chart.options}
              onClick={chart.onClick}
            />
          )}
          {chart.tipo === "Line" && <Line data={chart.dados} />}
          {chart.tipo === "Pie" && <Pie data={chart.dados} />}
          {chart.tipo === "Radar" && <Radar data={chart.dados} />}
          {chart.tipo === "PolarArea" && <PolarArea data={chart.dados} />}
        </div>
      ))}
      {isModalFolhaOpen && indiceSelecionado !== null && (
        <div className="modal">
          <div className="modal-content" ref={modalFolhaRef}>
            <span className="close-icon" onClick={() => setIsModalFolhaOpen(false)}>
              &times;
            </span>
            <h2>Pagamento de {cargos[indiceSelecionado]}</h2>
            <ul>
              {dadosFuncionarios[cargos[indiceSelecionado]].map((funcionario, index) => (
                <li key={index}>
                  <strong>{funcionario.nome}:</strong> R$ {funcionario.salario.toLocaleString('pt-BR')}
                </li>
              ))}
            </ul>
            <div className="modal-buttons">
              <button onClick={() => gerarFolhaPagamentoPDF(cargos[indiceSelecionado], dadosFuncionarios)}>
                Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      <div className="fin-table-container">
        {tabelasFiltradas.map((tabela, index) => (
          <div key={index} className="fin-tables">
            <h3>{tabela.nome}</h3>
            <div className="fin-filters">
              <div className="input-container">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por descrição..."
                  value={busca}
                  onChange={handleBusca}
                />
                <button className="clear-button" onClick={() => setBusca("")}>
                  Limpar
                </button>
              </div>
            </div>
            <table className="fin-table">
              <thead>
                <tr>
                  <th onClick={() => handleOrdenar("descricao")}>
                    Descrição {ordem.atributo === "descricao" && (ordem.crescente ? "↑" : "↓")}
                  </th>
                  <th className="th-com-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    Tipo ▾
                    {isDropdownOpen && (
                      <ul className="dropdown-menu" ref={dropdownRef}>
                        <li onClick={() => handleFiltroTipo("")}>Todos os Tipos</li>
                        <li onClick={() => handleFiltroTipo("Receita")}>Receita</li>
                        <li onClick={() => handleFiltroTipo("Despesa")}>Despesa</li>
                      </ul>
                    )}
                  </th>
                  <th onClick={() => handleOrdenar("valor")}>
                    Valor {ordem.atributo === "valor" && (ordem.crescente ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleOrdenar("data")}>
                    Data {ordem.atributo === "data" && (ordem.crescente ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tabela.dados
                  .filter((transacao: { descricao: string; }) =>
                    transacao.descricao.toLowerCase().includes(busca.toLowerCase())
                  )
                  .filter((transacao: { tipo: string; }) => (filtroTipo ? transacao.tipo === filtroTipo : true))
                  .sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
                    if (!ordem.atributo) return 0;
                    const valorA = a[ordem.atributo];
                    const valorB = b[ordem.atributo];
                    if (typeof valorA === "string") {
                      return ordem.crescente
                        ? valorA.localeCompare(valorB)
                        : valorB.localeCompare(valorA);
                    }
                    return ordem.crescente ? valorA - valorB : valorB - valorA;
                  })
                  .slice(paginaAtual * itensPorPagina, (paginaAtual + 1) * itensPorPagina)
                  .map((transacao: { id: React.Key | null | undefined; descricao: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; tipo: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; valor: { toLocaleString: (arg0: string) => string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }; data: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                    <tr key={transacao.id}>
                      <td>{transacao.descricao}</td>
                      <td>{transacao.tipo}</td>
                      <td>R$ {transacao.valor.toLocaleString("pt-BR")}</td>
                      <td>{transacao.data}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="pagination-buttons">
              <button onClick={voltarPagina} disabled={paginaAtual === 0}>
                &lt; Anterior
              </button>
              <button
                onClick={avancarPagina}
                disabled={(paginaAtual + 1) * itensPorPagina >= tabela.dados.length}
              >
                Próximo &gt;
              </button>
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}

export default FinanceiroPage;