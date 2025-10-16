import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Settings, Trash } from 'lucide-react'; // Ícones adaptados
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { toast } from 'sonner';

interface Material {
  id: number;
  nome: string;
  autor: string;
  capa_url: string;
  conteudo_url: string;
}

function getSafePath(path: string): string | null {
  if (typeof path !== 'string') return null;

  // precisa ser caminho absoluto relativo ao host
  if (!path.startsWith('/')) return null;

  // evita path traversal
  if (path.includes('..')) return null;

  // só aceitamos arquivos sob /uploads/ ou /materiais/ (qualquer subpasta)
  if (!/^\/(uploads|materiais)\//.test(path)) return null;

  // extensão permitida (pdf e imagens)
  if (!/\.(pdf|jpg|jpeg|png|webp)$/i.test(path)) return null;

  return path;
}



const backendUrl = ``;

const MateriaisDisponiveisPage: React.FC = () => {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMateriais, setFilteredMateriais] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);

  // Estados para adicionar novo material
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [autor, setAutor] = useState('');
  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [conteudoFile, setConteudoFile] = useState<File | null>(null);
  const [previewCapa, setPreviewCapa] = useState<string | null>(null);
  const [errorCapa, setErrorCapa] = useState<string | null>(null);
  const [errorConteudo, setErrorConteudo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para editar material
  const [materialEditando, setMaterialEditando] = useState<Material | null>(
    null
  );
  const [editNome, setEditNome] = useState('');
  const [editAutor, setEditAutor] = useState('');
  const [editCapaFile, setEditCapaFile] = useState<File | null>(null);
  const [editConteudoFile, setEditConteudoFile] = useState<File | null>(null);
  const [previewEditCapa, setPreviewEditCapa] = useState<string | null>(null);
  const [errorEditCapa, setErrorEditCapa] = useState<string | null>(null);
  const [errorEditConteudo, setErrorEditConteudo] = useState<string | null>(
    null
  );
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Busca inicial
  useEffect(() => {
    const fetchMateriais = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/materiais`);
        setMateriais(response.data);
        setFilteredMateriais(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Erro ao carregar materiais.');
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchMateriais();
  }, []);

  // Filtro conforme busca
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = materiais.filter(
      (m) =>
        m.nome.toLowerCase().includes(term) ||
        m.autor.toLowerCase().includes(term)
    );
    setFilteredMateriais(filtered);
  }, [searchTerm, materiais]);

  // Função para enviar novo material
  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!nome || !autor || !capaFile || !conteudoFile) {
      toast.error('Preencha todos os campos e selecione os arquivos.');
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('autor', autor);
    formData.append('capa', capaFile);
    formData.append('conteudo', conteudoFile);

    try {
      setLoading(true);
      await axios.post(`/materiais`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Material enviado com sucesso!');
      setNome('');
      setAutor('');
      setCapaFile(null);
      setConteudoFile(null);
      setPreviewCapa(null);
      setShowForm(false);
      // Recarrega a lista
      const response = await axios.get(`/materiais`);
      setMateriais(response.data);
    } catch (err) {
      console.error('Erro ao enviar material:', err);
      toast.error('Erro ao enviar material.');
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir material
  const handleExcluirMaterial = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este material?'))
      return;
    try {
      await axios.delete(`/materiais/${id}`);
      setMateriais((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      toast.error('Erro ao excluir material');
      console.error(err);
    }
  };

  // Abre o formulário de edição com dados preenchidos
  const handleEditarMaterial = (mat: Material) => {
    setMaterialEditando(mat);
    setEditNome(mat.nome);
    setEditAutor(mat.autor);
    setEditCapaFile(null);
    setEditConteudoFile(null);
    setPreviewEditCapa(null);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submete alterações de edição
  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!materialEditando) return;
    if (!editNome || !editAutor) {
      toast.error('Nome e autor são obrigatórios');
      return;
    }

    try {
      setLoadingEdit(true);
      const formData = new FormData();
      formData.append('nome', editNome);
      formData.append('autor', editAutor);

      if (editCapaFile) {
        formData.append('capa', editCapaFile);
      }
      if (editConteudoFile) {
        formData.append('conteudo', editConteudoFile);
      }

      await axios.put(
        `/materiais/${materialEditando.id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      toast.success('Material editado com sucesso!');
      setMaterialEditando(null);
      // Recarrega a lista
      const response = await axios.get(`/materiais`);
      setMateriais(response.data);
    } catch (error) {
      console.error('Erro ao editar material:', error);
      toast.error('Erro ao editar material');
    } finally {
      setLoadingEdit(false);
    }
  };

  // Manipuladores de input de capa e conteúdo
  const handleCapaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrorCapa(
          'Formato inválido! Apenas PNG, JPG e JPEG são permitidos.'
        );
        setCapaFile(null);
        setPreviewCapa(null);
        return;
      }
      setErrorCapa(null);
      setCapaFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCapa(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setErrorCapa(null);
      setCapaFile(null);
      setPreviewCapa(null);
    }
  };

  const handleConteudoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorConteudo('Formato inválido! Apenas PDF é permitido.');
        setConteudoFile(null);
        return;
      }
      setErrorConteudo(null);
      setConteudoFile(file);
    } else {
      setErrorConteudo(null);
      setConteudoFile(null);
    }
  };

  const handleEditCapaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrorEditCapa(
          'Formato inválido! Apenas PNG, JPG e JPEG são permitidos.'
        );
        setEditCapaFile(null);
        setPreviewEditCapa(null);
        return;
      }
      setErrorEditCapa(null);
      setEditCapaFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewEditCapa(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setErrorEditCapa(null);
      setEditCapaFile(null);
      setPreviewEditCapa(null);
    }
  };

  const handleEditConteudoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorEditConteudo('Formato inválido! Apenas PDF é permitido.');
        setEditConteudoFile(null);
        return;
      }
      setErrorEditConteudo(null);
      setEditConteudoFile(file);
    } else {
      setErrorEditConteudo(null);
      setEditConteudoFile(null);
    }
  };

  return (
    <div className="flex min-h-screen">
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page: string) =>
          navigate('/gestor', { state: { activePage: page } })
        }
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />

      <div className="flex-1 flex flex-col pt-20 px-4 min-w-0 transition-all duration-300">
        <TopbarGestorAuto
          isMenuOpen={sidebarAberta}
          setIsMenuOpen={setSidebarAberta}
        />

        <div className="min-h-screen p-4">
          <div className="max-w-full sm:max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-4 mt-[30px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900">
                Materiais Disponíveis
              </h1>
              <button
                onClick={() => {
                  setShowForm(true);
                  setMaterialEditando(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2 rounded-lg shadow transition w-full sm:w-auto"
              >
                <Download size={20} />
                <span>Adicionar Novo Material</span>
              </button>
            </div>

            <div className="relative mb-4 max-w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-indigo-700" />
              </div>
              <input
                type="text"
                placeholder="Buscar materiais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full py-2 border border-indigo-500 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-700 outline-none"
              />
            </div>

            {/* Formulário de Adição */}
            {showForm && !materialEditando && (
              <form
                onSubmit={handleUpload}
                className="mb-8 border p-4 rounded shadow bg-gray-50 max-w-full sm:max-w-3xl mx-auto"
              >
                <h2 className="text-lg font-semibold mb-4 text-indigo-900">
                  Enviar novo material
                </h2>

                <label className="block mb-2">
                  Nome:
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="mt-1 w-full border rounded p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </label>

                <label className="block mb-2">
                  Autor:
                  <input
                    type="text"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    className="mt-1 w-full border rounded p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </label>

                <label className="block mb-2">
                  Capa (imagem):
                  <input
                    type="file"
                    accept="image/*"
                    id="capaFileInput"
                    onChange={handleCapaChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="capaFileInput"
                    className="inline-block cursor-pointer px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    Selecionar Imagem
                  </label>
                  {errorCapa && (
                    <p className="text-red-600 text-sm mt-1">{errorCapa}</p>
                  )}
                  {previewCapa && (
                    <img
                      src={previewCapa}
                      alt="Prévia da capa"
                      className="mt-2 w-24 h-24 object-cover rounded border"
                    />
                  )}
                  <div className="mt-[2px]">
                    <small className="text-gray-500">PNG, JPG ou JPEG</small>
                  </div>
                </label>

                <label className="block mb-2">
                  Conteúdo (PDF):
                  <input
                    type="file"
                    accept="application/pdf"
                    id="conteudoFileInput"
                    onChange={handleConteudoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="conteudoFileInput"
                    className="inline-block cursor-pointer px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    Selecionar PDF
                  </label>
                  {errorConteudo && (
                    <p className="text-red-600 text-sm mt-1">{errorConteudo}</p>
                  )}
                  {conteudoFile && (
                    <p className="mt-1 text-sm text-gray-600">
                      {conteudoFile.name}
                    </p>
                  )}
                  <div className="mt-[2px]">
                    <small className="text-gray-500">PDF</small>
                  </div>
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-800 text-white rounded hover:bg-indigo-900 transition w-full sm:w-auto"
                  >
                    {loading ? 'Enviando...' : 'Enviar Material'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setNome('');
                      setAutor('');
                      setCapaFile(null);
                      setConteudoFile(null);
                      setPreviewCapa(null);
                      setErrorCapa(null);
                      setErrorConteudo(null);
                    }}
                    className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition w-full sm:w-auto"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Formulário de Edição */}
            {materialEditando && (
              <div className="mb-8 border p-4 rounded shadow bg-yellow-50 max-w-full sm:max-w-3xl mx-auto">
                <h2 className="text-lg font-semibold mb-4 text-yellow-800">
                  Editar Material
                </h2>
                <form onSubmit={handleSubmitEdit}>
                  <label className="block mb-2">
                    Nome:
                    <input
                      type="text"
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className="mt-1 w-full border rounded p-2 outline-none focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </label>

                  <label className="block mb-2">
                    Autor:
                    <input
                      type="text"
                      value={editAutor}
                      onChange={(e) => setEditAutor(e.target.value)}
                      className="mt-1 w-full border rounded p-2 outline-none focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </label>

                  <label className="block mb-2">
                    Capa (imagem):
                    <input
                      type="file"
                      accept="image/*"
                      id="editCapaFileInput"
                      onChange={handleEditCapaChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="editCapaFileInput"
                      className="inline-block cursor-pointer px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                    >
                      Selecionar Imagem
                    </label>
                    {errorEditCapa && (
                      <p className="text-red-600 text-sm mt-1">
                        {errorEditCapa}
                      </p>
                    )}
                    {previewEditCapa && (
                      <img
                        src={previewEditCapa}
                        alt="Prévia da capa"
                        className="mt-2 w-24 h-24 object-cover rounded border"
                      />
                    )}
                    <div className="mt-[2px]">
                      <small className="text-gray-500">
                        PNG, JPG ou JPEG (opcional)
                      </small>
                    </div>
                  </label>

                  <label className="block mb-2">
                    Conteúdo (PDF):
                    <input
                      type="file"
                      accept="application/pdf"
                      id="editConteudoFileInput"
                      onChange={handleEditConteudoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="editConteudoFileInput"
                      className="inline-block cursor-pointer px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                    >
                      Selecionar PDF
                    </label>
                    {errorEditConteudo && (
                      <p className="text-red-600 text-sm mt-1">
                        {errorEditConteudo}
                      </p>
                    )}
                    {editConteudoFile && (
                      <p className="mt-1 text-sm text-gray-600">
                        {editConteudoFile.name}
                      </p>
                    )}
                    <div className="mt-[2px]">
                      <small className="text-gray-500">PDF (opcional)</small>
                    </div>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={loadingEdit}
                      className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition w-full sm:w-auto"
                    >
                      {loadingEdit ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMaterialEditando(null);
                        setErrorEditCapa(null);
                        setErrorEditConteudo(null);
                        setPreviewEditCapa(null);
                      }}
                      className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition w-full sm:w-auto"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tabela de Materiais */}
            {isLoading ? (
              <div className="p-8 text-center text-indigo-900">
                Carregando materiais...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-600">{error}</div>
            ) : filteredMateriais.length === 0 ? (
              <div className="p-8 text-center text-indigo-900">
                Nenhum material encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-indigo-50">
                      <th className="px-4 py-3 text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                        Capa
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-indigo-900 uppercase tracking-wider cursor-default">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-indigo-900 uppercase tracking-wider cursor-default">
                        Autor
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-indigo-900 uppercase tracking-wider text-right">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-300">
                    {filteredMateriais.map((mat) => {
                      const capaSafe = getSafePath(mat.capa_url || '');
                      const conteudoSafe = getSafePath(mat.conteudo_url || '');

                      return (
                        <tr
                          key={mat.id}
                          className="hover:bg-indigo-50 transition-colors"
                        >
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                            {capaSafe ? (
                              <img
                                src={`${capaSafe}`}
                                alt={`Capa de ${mat.nome}`}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-md" />
                            )}
                          </td>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                            {mat.nome}
                          </td>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-gray-600">
                            {mat.autor}
                          </td>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-3">
                              {conteudoSafe && (
                                <a
                                  href={`${conteudoSafe}`}
                                  download={`${mat.nome}.pdf`}
                                  title="Baixar"
                                  target="_blank"
                                  className="p-2 bg-indigo-300 text-indigo-800 rounded-full hover:bg-indigo-400 transition"
                                  rel="noopener noreferrer"
                                >
                                  <Download size={18} />
                                </a>
                              )}
                              <button
                                onClick={() => handleEditarMaterial(mat)}
                                title="Editar"
                                className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
                              >
                                <Settings size={18} />
                              </button>
                              <button
                                onClick={() => handleExcluirMaterial(mat.id)}
                                title="Excluir"
                                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                              >
                                <Trash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MateriaisDisponiveisPage;
