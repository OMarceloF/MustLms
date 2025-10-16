import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SidebarGestor from './components/Sidebar';
import Navbar from './components/Navbar';
import TopbarGestorAuto from './components/TopbarGestorAuto';


const API_URL = `/api`;

const tipos = [
  { value: 'Bimestral', label: 'Bimestral', periodos: 4, nome: 'Bimestre' },
  { value: 'Trimestral', label: 'Trimestral', periodos: 3, nome: 'Trimestre' },
  { value: 'Semestral', label: 'Semestral', periodos: 2, nome: 'Semestre' },
];

const CriarCalendarioPage: React.FC = () => {
  const [anoLetivo, setAnoLetivo] = useState('');
  const [tipo, setTipo] = useState('Bimestral');
  const [periodos, setPeriodos] = useState([
    { inicio: '', fim: '', valor: 0 },
    { inicio: '', fim: '', valor: 0 },
    { inicio: '', fim: '', valor: 0 },
    { inicio: '', fim: '', valor: 0 },
  ]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);

  // Atualiza os períodos ao trocar o tipo
  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoTipo = e.target.value;
    setTipo(novoTipo);
    const info = tipos.find(t => t.value === novoTipo);
    setPeriodos(Array(info?.periodos || 4).fill(0).map(() => ({ inicio: '', fim: '', valor: 0 })));
  };

  // Atualiza campos dos períodos
  const handlePeriodoChange = (idx: number, campo: string, valor: string | number) => {
    setPeriodos(prev =>
      prev.map((p, i) =>
        i === idx ? { ...p, [campo]: valor } : p
      )
    );
  };

  // Validação e envio
  const handleCriarCalendario = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');
    setErro('');
    setIsLoading(true);

    if (!anoLetivo || !tipo) {
      setErro('Preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    // Validação dos períodos
    for (let i = 0; i < periodos.length; i++) {
      if (!periodos[i].inicio || !periodos[i].fim || periodos[i].valor === undefined) {
        setErro('Preencha todos os campos de cada período.');
        setIsLoading(false);
        return;
      }
    }

    // Soma dos valores deve ser 100
    const soma = periodos.reduce((acc, p) => acc + Number(p.valor), 0);
    if (soma !== 100) {
      setErro('A soma dos valores dos períodos deve ser 100 pontos.');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/calendario`, {
        ano_letivo: Number(anoLetivo),
        tipo,
        periodos
      });
      await axios.post(`${API_URL}/api/calendario/unificar`, {
        ano_letivo: Number(anoLetivo),
      });
      setMensagem('Calendário criado com sucesso!');
      setTimeout(() => {
        navigate('/gestor', { state: { activePage: 'calendario' } });
      }, 800);
    } catch (err: any) {
      setErro(err?.response?.data?.error || err?.message || 'Erro ao criar calendário.');
    }
    setIsLoading(false);
  };

  const tipoInfo = tipos.find(t => t.value === tipo);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SideBar */}
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page: string) => navigate("/gestor", { state: { activePage: page } })}
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />

      <div className="flex-1 flex flex-col pt-20 ml-16 lg:ml-auto mr-2 md:mr-auto transition-all duration-500">
        {/* TopBar */}
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        <main className="flex-1 px-2 sm:px-4 py-6 sm:py-8 w-full max-w-full sm:max-w-xl mx-auto mt-8 sm:mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-6 sm:mb-8 text-center">Novo Calendário Letivo</h2>
          <form className="bg-white rounded-xl shadow-md p-4 sm:p-8 space-y-4 sm:space-y-6" onSubmit={handleCriarCalendario}>
            <div>
              <label className="block mb-1 font-semibold text-indigo-900">Ano Letivo</label>
              <input
                type="number"
                className="w-full border border-indigo-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={anoLetivo}
                onChange={e => setAnoLetivo(e.target.value)}
                min={2020}
                max={2100}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-indigo-900">Tipo de Calendário</label>
              <select
                className="w-full border border-indigo-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={tipo}
                onChange={handleTipoChange}
              >
                {tipos.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            {/* Campos dinâmicos dos períodos */}
            {tipoInfo && periodos.map((p, idx) => (
              <div key={idx} className="border border-indigo-300 rounded-lg p-3 sm:p-4 mb-2 bg-indigo-50">
                <div className="font-semibold text-indigo-900 mb-2">
                  {`${idx + 1}º ${tipoInfo.nome}`}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <div className="flex-1">
                    <label className="block text-indigo-900 text-sm mb-1">Data de Início</label>
                    <input
                      type="date"
                      className="w-full border border-indigo-400 rounded-lg px-2 py-1"
                      value={p.inicio}
                      onChange={e => handlePeriodoChange(idx, 'inicio', e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-indigo-900 text-sm mb-1">Data de Fim</label>
                    <input
                      type="date"
                      className="w-full border border-indigo-400 rounded-lg px-2 py-1"
                      value={p.fim}
                      onChange={e => handlePeriodoChange(idx, 'fim', e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-indigo-900 text-sm mb-1">Valor (%)</label>
                    <input
                      type="number"
                      className="w-full border border-indigo-400 rounded-lg px-2 py-1"
                      value={p.valor}
                      onChange={e => handlePeriodoChange(idx, 'valor', Number(e.target.value))}
                      min={0}
                      max={100}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            {erro && <div className="text-red-600 font-semibold">{erro}</div>}
            {mensagem && <div className="text-green-600 font-semibold">{mensagem}</div>}
            <button
              type="submit"
              className="w-full bg-indigo-800 hover:bg-indigo-900 text-white py-2 rounded-lg font-bold transition"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Criar Calendário'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default CriarCalendarioPage;