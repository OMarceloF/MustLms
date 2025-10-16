import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface Transacao {
  id: number;
  descricao: string;
  valor_com_desconto: number;
  tipo: string; // receita ou despesa
  data_referencia: string; // yyyy-mm-dd
}

function formatarDataISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function gerarDiasMes(ano: number, mes: number) {
  const dias = [];
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  for (let d = 1; d <= ultimoDia; d++) {
    dias.push(d.toString());
  }
  return dias;
}

export default function FinanceAreaChart() {
  const [chartData, setChartData] = useState<any>(null);
  // Armazenar transações agrupadas por dia e tipo para tooltip
  const [transacoesPorDia, setTransacoesPorDia] = useState<
    Record<string, { receita: Transacao[]; despesa: Transacao[] }>
  >({});

  useEffect(() => {
    async function fetchData() {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = hoje.getMonth();

      const inicio = new Date(ano, mes, 1);
      const fim = new Date(ano, mes + 1, 0);

      const params = new URLSearchParams({
        inicio: formatarDataISO(inicio),
        fim: formatarDataISO(fim),
      });

      const response = await fetch(
        `/api/financeiro/transacoes?${params.toString()}`
      );
      const transacoes: Transacao[] = await response.json();

      const diasDoMes = gerarDiasMes(ano, mes);
      const receitasDiarias = new Array(diasDoMes.length).fill(0);
      const despesasDiarias = new Array(diasDoMes.length).fill(0);

      // Inicializa objeto para agrupamento detalhado
      const agrupado: Record<
        string,
        { receita: Transacao[]; despesa: Transacao[] }
      > = {};

      diasDoMes.forEach((d) => {
        agrupado[d] = { receita: [], despesa: [] };
      });

      transacoes.forEach((t) => {
        const partesData = t.data_referencia.split('-');
        const dia = parseInt(partesData[2], 10);

        if (dia >= 1 && dia <= diasDoMes.length) {
          // converte o valor final para número
          const valor = typeof t.valor_com_desconto === 'string'
            ? parseFloat(t.valor_com_desconto)
            : t.valor_com_desconto;

          const diaIdx = dia - 1;
          const diaStr = dia.toString();

          if (t.tipo.toLowerCase() === 'receita') {
            receitasDiarias[diaIdx] += valor;
            agrupado[diaStr].receita.push(t);
          } else {
            despesasDiarias[diaIdx] += valor;
            agrupado[diaStr].despesa.push(t);
          }
        }
      });

      setTransacoesPorDia(agrupado);

      setChartData({
        labels: diasDoMes,
        datasets: [
          {
            label: 'Receitas',
            data: receitasDiarias,
            fill: true,
            backgroundColor: '#dee3df',
            borderColor: '#dee3df',
            tension: 0.4,
          },
          {
            label: 'Despesas',
            data: despesasDiarias,
            fill: true,
            backgroundColor: '#283248',
            borderColor: '#283248',
            tension: 0.4,
          },
        ],
      });
    }

    fetchData();
  }, []);

  if (!chartData) return <p>Carregando gráfico...</p>;

  const options: ChartOptions<'line'> = {
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          title: (context) => `Dia ${context[0].label}`,
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const valor = context.parsed.y || 0;
            return `${datasetLabel}: R$ ${valor.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}`;
          },
          afterBody: (context) => {
            if (!context.length) return '';
            const dia = context[0].label as string;
            const tipo = context[0].dataset.label?.toLowerCase();

            if (!transacoesPorDia[dia]) return '';

            const transacoes =
              tipo === 'receitas'
                ? transacoesPorDia[dia].receita
                : transacoesPorDia[dia].despesa;

            if (!transacoes || transacoes.length === 0)
              return 'Nenhuma transação';

            const linhas = transacoes.map((t) => {
              const valorNum = Number(t.valor_com_desconto);
              return `• ${t.descricao} - R$ ${valorNum.toFixed(2)}`;
            });

            return linhas.join('\n');
          },
        },
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        ticks: {
          callback: (value) => `R$ ${value.toLocaleString('pt-BR')}`,
        },
      },
      x: {
        type: 'category',
      },
    },
  };

  return <Line data={chartData} options={options} />;
}