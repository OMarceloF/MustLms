import SmallChart from './components/SmallChart';
import LargeChart from './components/LargeChart';
import BottomChart from './components/BottomChart';
import MiniCalendar from '../../components/MiniCalendar';
import Anuncios from './components/Anuncios';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UsuariosOnlineCard from './components/UsuarioOnlineCard';


const HomeGestor = () => {

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

  const [verificacaoExecutada, setVerificacaoExecutada] = useState(false);

  const [verificou, setVerificou] = useState(false);

  useEffect(() => {
    if (!verificou) {
      axios.get(`/api/verificacoes`)
        .then(() => {
          console.log('✅ Verificações executadas com sucesso ao entrar no painel do gestor.');
          setVerificou(true);
        })
        .catch((err) => {
          console.error('❌ Erro ao executar verificações:', err);
        });
    }
  }, [verificou]);


  return (
    <div className="flex flex-col md:flex-row gap-6 py-2 px-2 md:py-4 md:px-4 overflow-x-hidden">
      {/* Coluna principal (esquerda) */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        {/* Cards iniciais */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <div
            className="w-52 rounded-lg p-4 flex flex-col shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#363776', color: '#ffffff' }}
          >
            <div className="flex justify-between items-center mb-4">
              <span
                className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#9dba32', color: '#ffffff' }}
              >
                2025
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {totalAlunos ?? '...'}
              </h2>
              <p>Alunos</p>
            </div>
          </div>

          <div
            className="w-52 rounded-lg p-4 flex flex-col shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#363776', color: '#ffffff' }}
          >
            <div className="flex justify-between items-center mb-4">
              <span
                className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#9dba32', color: '#ffffff' }}
              >
                2025
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {totalResponsaveis ?? '...'}
              </h2>
              <p>Responsáveis</p>
            </div>
          </div>

          <div className="w-52">
            <UsuariosOnlineCard />
          </div>

          <div
            className="w-52 rounded-lg p-4 flex flex-col shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#363776', color: '#ffffff' }}
          >
            <div className="flex justify-between items-center mb-4">
              <span
                className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#9dba32', color: '#ffffff' }}
              >
                2025
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {totalFuncionarios ?? '...'}
              </h2>
              <p>Funcionários</p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="flex flex-col lg:flex-row gap-4 justify-start">
          <div className="bg-white rounded-xl shadow p-4 w-full lg:flex-1 h-56 md:h-72 flex justify-center items-center overflow-hidden text-xs md:text-base">
            <SmallChart />
          </div>
          <div className="bg-white rounded-xl shadow p-4 w-full lg:flex-1 h-40 md:h-72 flex justify-center items-center overflow-hidden">
            <LargeChart />
          </div>
          <div className="bg-white rounded-xl shadow p-4 w-full h-40 md:h-80 flex justify-center items-center overflow-hidden">
            <BottomChart />
        </div>
        </div>
      </div>

      {/* Coluna lateral direita */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div className="bg-white rounded-xl shadow p-4 min-h-[200px] md:min-h-72 overflow-hidden">
          <MiniCalendar />
        </div>
        <div
          className="bg-white rounded-xl shadow p-4 min-h-[200px] md:min-h-72 overflow-hidden">
          <Anuncios />
        </div>
      </div>
    </div>
  );





};

export default HomeGestor
