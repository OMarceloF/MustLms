import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const Login: React.FC = () => {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ Faz o login enviando cookie httpOnly (credentials: 'include')
      const resp = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, senha }), // backend aceita login OU email + senha
        credentials: 'include',
      });

      if (!resp.ok) {
        // Tratamento de mensagens por status
        let msg = 'Erro no login. Verifique suas credenciais.';
        try {
          const data = await resp.json();
          if (data?.message) msg = data.message;
        } catch {
          /* ignore JSON parse */
        }

        if (resp.status === 429) {
          setError(msg || 'Muitas tentativas. Tente novamente em alguns minutos.');
        } else if (resp.status === 401 || resp.status === 404) {
          setError(msg || 'Credenciais inválidas.');
        } else if (resp.status === 503) {
          setError(msg || 'Servidor/banco indisponível. Tente novamente em instantes.');
        } else if (resp.status >= 500) {
          setError(msg || 'Erro interno do servidor.');
        } else {
          setError(msg);
        }
        return;
      }

      // ✅ Cookie setado → validar sessão
      const authCheck = await fetch(`${API}/api/check-auth`, { credentials: 'include' });
      const data = await authCheck.json();

      if (authCheck.ok) {
        switch (data.role) {
          case 'gestor':
            navigate('/gestor');
            break;
          case 'professor':
            navigate('/professor');
            break;
          case 'aluno':
            navigate('/aluno');
            break;
          case 'responsavel':
            navigate(`/responsavel/${data.id}/escolheraluno`);
            break;
          case 'financeiro':
            navigate('/financeiro');
            break;
          default:
            setError('Perfil de acesso não reconhecido.');
        }
      } else {
        setError(data?.message || 'Falha ao verificar sessão.');
      }
    } catch (err) {
      console.error('Erro de rede:', err);
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-gray-100">
      <div className="flex flex-1 items-center justify-center lg:w-2/5 lg:rounded-none lg:h-full bg-gradient-to-r from-indigo-700 to-indigo-900 lg:from-white lg:to-white relative z-10">
        <div className="bg-white p-5 sm:p-10 shadow-md lg:shadow-none text-center w-full max-w-md lg:max-w-none z-10 flex flex-col justify-center mx-2 sm:mx-0 lg:mx-0 rounded-lg lg:h-full lg:rounded-none">
          <div className="mb-4 flex justify-center items-center">
            <img
              src="https://mustedu.com/wp-content/uploads/2023/07/F1i732qm9AH1A8iIrHdJqwLAGyzkJYr2PXKubO29.png"
              alt="Logo Must"
              className="max-w-[200px] w-full h-auto"
            />
          </div>

          <div className="mb-4">
            <h1 className="mb-4 text-2lg text-gray-800">
              Bem-vindo!
            </h1>
            <p className="mb-6 text-gray-600">Entre com seus dados de login</p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full sm:w-4/5 mx-auto"
          >
            <div className="flex items-center mb-4 border border-gray-300 rounded px-2 py-2">
              <User className="mr-2 text-gray-600" size={20} />
              <input
                type="text"
                placeholder="Login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="flex-1 border-none outline-none text-base bg-transparent"
                required
              />
            </div>
            <div className="flex items-center mb-4 border border-gray-300 rounded px-2 py-2">
              <Lock className="mr-2 text-gray-600" size={20} />
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="flex-1 border-none outline-none text-base bg-transparent"
                required
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              className="py-2 bg-indigo-900 text-white rounded text-base cursor-pointer transition hover:bg-indigo-900 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>

      {/* substituindo a imagem por vídeo no lado direito */}
      <div className="hidden lg:block w-full h-full lg:w-3/5 relative overflow-hidden">
        <video
          className="w-full h-full object-cover"
          src="https://ava.mustedu.com/pluginfile.php/1/local_mb2builder/images/MUST%20University%20-%20Florida.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    </div>
  );
};

export default Login;