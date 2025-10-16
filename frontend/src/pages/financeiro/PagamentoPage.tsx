import { useState } from 'react';
// import '../../styles/Pagamentos.css';

const mockAlunos = [
  {
    nome: 'Ana Beatriz',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=62`,
  },
  {
    nome: 'Carlos Eduardo',
    status: 'atencao',
    foto: `https://i.pravatar.cc/150?img=02`,
  },
  {
    nome: 'Lucas Martins',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=04`,
  },
  {
    nome: 'Juliana Ferreira',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=05`,
  },
  {
    nome: 'Bruno Oliveira',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=06`,
  },
  {
    nome: 'Felipe Souza',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=08`,
  },
  {
    nome: 'Marina Costa',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=09`,
  },
  {
    nome: 'André Santos',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=12`,
  },
  {
    nome: 'Renan Teixeira',
    status: 'problema',
    foto: `https://i.pravatar.cc/150?img=14`,
  },
  {
    nome: 'Giovana Pires',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=15`,
  },
  {
    nome: 'Matheus Lima',
    status: 'problema',
    foto: `https://i.pravatar.cc/150?img=18`,
  },
  {
    nome: 'Camila Nogueira',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=19`,
  },
  {
    nome: 'Eduarda Campos',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=20`,
  },
  {
    nome: 'Beatriz Figueiredo',
    status: 'atencao',
    foto: `https://i.pravatar.cc/150?img=22`,
  },
  {
    nome: 'Vitor Hugo',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=23`,
  },
  {
    nome: 'Letícia Moura',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=24`,
  },
  {
    nome: 'Daniela Barros',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=25`,
  },
  {
    nome: 'Aline Souza',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=27`,
  },
  {
    nome: 'Patrícia Lopes',
    status: 'problema',
    foto: `https://i.pravatar.cc/150?img=29`,
  },
];

const mockFuncionarios = [
  {
    nome: 'Maria da Silva',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=31`,
  },
  {
    nome: 'Luciana Castro',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=33`,
  },
  {
    nome: 'Andreia Martins',
    status: 'atencao',
    foto: `https://i.pravatar.cc/150?img=35`,
  },
  {
    nome: 'Secretária Camila',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=37`,
  },
  {
    nome: 'Fernanda Souza',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=38`,
  },
  {
    nome: 'Patrícia Ramos',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=40`,
  },
  {
    nome: 'José Antônio',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=41`,
  },
  {
    nome: 'Monitora Bruna',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=42`,
  },
  {
    nome: 'Juliano Andrade',
    status: 'problema',
    foto: `https://i.pravatar.cc/150?img=43`,
  },
  {
    nome: 'Bibliotecária Lúcia',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=45`,
  },
  {
    nome: 'Coordenadora Flávia',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=47`,
  },
  {
    nome: 'Tatiane Gomes',
    status: 'atencao',
    foto: `https://i.pravatar.cc/150?img=48`,
  },
  {
    nome: 'Sandra Rocha',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=50`,
  },
  {
    nome: 'Leandro Pires',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=52`,
  },
  {
    nome: 'Sérgio Mendes',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=54`,
  },
  {
    nome: 'Guilherme Silva',
    status: 'problema',
    foto: `https://i.pravatar.cc/150?img=55`,
  },
  {
    nome: 'Rafaela Cunha',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=57`,
  },
  {
    nome: 'Maurício Vieira',
    status: 'ok',
    foto: `https://i.pravatar.cc/150?img=58`,
  },
];

const PagamentosPage = () => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 25;
  const [filtroStatus, setFiltroStatus] = useState<
    'todos' | 'ok' | 'atencao' | 'problema'
  >('todos');
  const [busca, setBusca] = useState('');
  const [abaSelecionada, setAbaSelecionada] = useState<
    'alunos' | 'funcionarios'
  >('alunos');

  const listaOriginal =
    abaSelecionada === 'alunos' ? mockAlunos : mockFuncionarios;
  const lista = listaOriginal
    .filter((pessoa) => pessoa.nome.toLowerCase().includes(busca.toLowerCase()))
    .filter((pessoa) =>
      filtroStatus === 'todos' ? true : pessoa.status === filtroStatus
    );

  return (
    <div className="pagamentos-page">
      <div className="filtros-topo">
        <input
          type="text"
          className="input-busca"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <select
          className="select-status"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as any)}
        >
          <option value="todos">Todos os status</option>
          <option value="ok">Pagamentos em dia</option>
          <option value="atencao">Em Aberto</option>
          <option value="problema">Com problemas</option>
        </select>
      </div>

      <div className="abas-pagamento">
        <button
          className={abaSelecionada === 'alunos' ? 'ativa' : ''}
          onClick={() => setAbaSelecionada('alunos')}
        >
          Alunos
        </button>
        <button
          className={abaSelecionada === 'funcionarios' ? 'ativa' : ''}
          onClick={() => setAbaSelecionada('funcionarios')}
        >
          Funcionários
        </button>
      </div>

      <div className="lista-pagamentos">
        {lista.map((pessoa, index) => (
          <div key={index} className="item-pagamento">
            <img src={pessoa.foto} alt={pessoa.nome} />
            <span className="nome">{pessoa.nome}</span>
            <span className={`status ${pessoa.status}`}></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagamentosPage;
