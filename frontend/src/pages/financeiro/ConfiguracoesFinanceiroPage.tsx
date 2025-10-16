import React, { useState, useEffect } from "react";
import TopbarGestorAuto from "../gestor/components/TopbarGestorAuto";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const API_URL = `/`;

const ConfiguracoesFinanceiroPage: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [registro, setRegistro] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [alterarSenha, setAlterarSenha] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}check-auth`, { withCredentials: true })
      .then((res) => {
        const userId = res.data.id;
        setUserId(userId);
        if (userId) {
          axios
            .get(`${API_URL}api/financeiro/${userId}`)
            .then((resp) => {
              setNome(resp.data.nome || "");
              setLogin(resp.data.login || "");
              setEmail(resp.data.email || "");
              setDepartamento(resp.data.departamento || "");
              setRegistro(resp.data.registro || "");
            })
            .catch(() => {
              setMensagem("Não foi possível carregar os dados do usuário financeiro.");
            });
        } else {
          setMensagem("Usuário não autenticado.");
        }
      })
      .catch(() => {
        setMensagem("Não foi possível autenticar o usuário.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");

    if (!userId) {
      setMensagem("Usuário não autenticado.");
      return;
    }
    if (!senhaAtual) {
      setMensagem("Digite a senha atual.");
      return;
    }

    if (alterarSenha) {
      if (!novaSenha || !confirmarSenha) {
        setMensagem("Preencha a nova senha e a confirmação.");
        return;
      }
      if (novaSenha !== confirmarSenha) {
        setMensagem("As senhas não coincidem.");
        return;
      }
      if (novaSenha.length < 6) {
        setMensagem("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }
    }

    try {
      const res = await axios.post(
        `${API_URL}api/financeiro/verify-password`,
        { id: userId, senha: senhaAtual },
        { withCredentials: true }
      );
      if (!res.data.valido) {
        setMensagem("Senha atual incorreta.");
        return;
      }
    } catch {
      setMensagem("Erro ao verificar a senha atual.");
      return;
    }

    try {
      await axios.put(
        `${API_URL}api/financeiro/${userId}`,
        {
          nome,
          email,
          login,
          departamento,
          registro,
          ...(alterarSenha ? { senha: novaSenha } : {}),
        },
        { withCredentials: true }
      );
      setMensagem("Configurações salvas com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setAlterarSenha(false);
    } catch {
      setMensagem("Erro ao salvar as alterações.");
    }
  };

  const handleCancelar = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="text-indigo-900 text-lg font-semibold animate-pulse">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-2">
      <TopbarGestorAuto isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border border-indigo-100 mt-12 transition-all duration-300">
        <h1 className="text-3xl font-bold text-indigo-900 mb-8 text-center tracking-tight">
          Configurações do Financeiro
        </h1>
        <form onSubmit={handleSalvar} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-indigo-900 font-semibold mb-1">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none bg-indigo-50"
              />
            </div>
            <div>
              <label className="block text-indigo-900 font-semibold mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none bg-indigo-50"
              />
            </div>
            <div>
              <label className="block text-indigo-900 font-semibold mb-1">Departamento</label>
              <input
                type="text"
                value={departamento}
                onChange={e => setDepartamento(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none bg-indigo-50"
              />
            </div>
            <div>
              <label className="block text-indigo-900 font-semibold mb-1">Registro</label>
              <input
                type="text"
                value={registro}
                onChange={e => setRegistro(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none bg-indigo-50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-indigo-900 font-semibold mb-1">Login</label>
              <input
                type="text"
                value={login}
                onChange={e => setLogin(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none bg-indigo-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-indigo-900 font-semibold mb-1">Senha Atual <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={senhaAtual}
              onChange={e => setSenhaAtual(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none bg-indigo-50"
              placeholder="Digite sua senha atual"
              autoComplete="current-password"
              required
            />
          </div>
          {!alterarSenha && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAlterarSenha(true)}
                className="text-indigo-600 underline text-sm hover:text-indigo-800 transition font-medium"
              >
                Alterar senha
              </button>
            </div>
          )}
          {alterarSenha && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-indigo-900 font-semibold mb-1">Nova Senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none bg-indigo-50"
                  placeholder="Nova senha"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-indigo-900 font-semibold mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none bg-indigo-50"
                  placeholder="Confirme a nova senha"
                  autoComplete="new-password"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAlterarSenha(false);
                    setSenhaAtual("");
                    setNovaSenha("");
                    setConfirmarSenha("");
                  }}
                  className="text-gray-500 underline text-sm hover:text-gray-700 transition font-medium"
                >
                  Cancelar alteração de senha
                </button>
              </div>
            </div>
          )}
          {mensagem && (
            <div
              className={`text-center text-sm mt-2 ${
                mensagem.includes("sucesso")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {mensagem}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={handleCancelar}
              className="w-full sm:w-auto bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-900 transition font-semibold shadow-md"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfiguracoesFinanceiroPage;