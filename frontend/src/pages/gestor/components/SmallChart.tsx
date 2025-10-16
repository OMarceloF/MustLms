import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import React, { useEffect, useState } from 'react';
import axios from 'axios';


ChartJS.register(ArcElement, Tooltip, Legend);

export default function SmallChart() {
  const [totalAlunos, setTotalAlunos] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalAlunos = async () => {
      try {
        const response = await axios.get(`/api/dashboard/contar-alunos`);
        setTotalAlunos(response.data.total);
      } catch (error) {
        console.error("Erro ao buscar total de alunos:", error);
      }
    };

    fetchTotalAlunos();
  }, []);

  const [totalFuncionarios, setTotalFuncionarios] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalFuncionarios = async () => {
      try {
        const response = await axios.get(`/api/dashboard/contar-funcionarios`);
        setTotalFuncionarios(response.data.totalF);
      } catch (error) {
        console.error("Erro ao buscar total de funcionarios:", error);
      }
    };

    fetchTotalFuncionarios();
  }, []);

  const [totalResponsaveis, setTotalResponsaveis] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalResponsaveis = async () => {
      try {
        const response = await axios.get(`/api/dashboard/contar-responsaveis`);
        setTotalResponsaveis(response.data.totalR);
      } catch (error) {
        console.error("Erro ao buscar total de responsaveis:", error);
      }
    };

    fetchTotalResponsaveis();
  }, []);

  const data = {
    // labels: ['Funcionários', 'Professores', 'Alunos', 'Responsáveis'],
    labels: ['Funcionários', 'Alunos'],
    datasets: [
      {
        label: 'Usuários',
        // data: [totalFuncionarios, 40, totalAlunos, totalResponsaveis],
        // backgroundColor: ['#745043', '#438A7A', '#C95830', '#374A46'],
        data: [totalFuncionarios, totalAlunos],
        backgroundColor: ['#2A334B', '#dee3df'],
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={data} />;
}
