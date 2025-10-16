import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import type { ChartOptions } from 'chart.js';

// axios-shim precisa estar importado no main.tsx (import './axios-shim')
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

interface FrequenciaMensal {
  mes: number;
  ano: number;
  frequencia: number;
}

export default function LargeChart() {
  const [frequencias, setFrequencias] = useState<FrequenciaMensal[]>([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // axios-shim: '/notas/presencas' vira '/api/notas/presencas'
        const { data } = await axios.get('/notas/presencas');

        // garante array mesmo se backend mandar { items: [...] } ou objeto qualquer
        const lista: FrequenciaMensal[] =
          Array.isArray(data) ? data :
          Array.isArray((data as any)?.items) ? (data as any).items :
          [];

        if (mounted) setFrequencias(lista);
      } catch (err) {
        console.error('Erro ao buscar frequência:', err);
        if (mounted) setFrequencias([]); // nada de tela branca
      }
    })();

    return () => { mounted = false; };
  }, []);

  const labels = frequencias.map(it => `${MESES[it.mes - 1]}/${it.ano}`);
  const dataFrequencia = frequencias.map(it => it.frequencia);

  const data = {
    labels,
    datasets: [
      {
        label: 'Frequência (%)',
        data: dataFrequencia,
        backgroundColor: '#2A334B',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: { label: (ctx) => `${ctx.raw}% de presença` },
      },
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value) => `${value}%` },
      },
      x: { type: 'category' },
    },
  };

  return <Bar data={data} options={options} />;
}
