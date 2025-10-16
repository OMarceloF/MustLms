import { useState, useRef, useEffect } from 'react';
//import '../../styles/Ia.css';
import ReactMarkdown from 'react-markdown';


function IaPage() {
  const [autoScrollAtivo, setAutoScrollAtivo] = useState(true);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const [digitando, setDigitando] = useState(false);
  const [modoIA, setModoIA] = useState<'simples' | 'detalhado'>('simples');
  const [erro, setErro] = useState('');
  const [inputVazio, setInputVazio] = useState(false);
  const [pergunta, setPergunta] = useState('');
  const [mensagens, setMensagens] = useState<
    { role: string; content: string }[]
  >([]);

  const [carregando, setCarregando] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    if (!chatBoxRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;

    const noFim = scrollHeight - scrollTop <= clientHeight + 10; // margem de segurança

    setAutoScrollAtivo(noFim);
  };

  const scrollParaFim = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setAutoScrollAtivo(true); // reativa o scroll automático
  };  

  const hoje = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const processarComando = (texto: string) => {
    const comando = texto.trim().toLowerCase();

    switch (comando) {
      case '/limpar':
        setMensagens([]);
        return '🧹 Conversa limpa com sucesso.';

      case '/ajuda':
        return '📘 Comandos disponíveis:\n/limpar\n/ajuda\n/modoSimples\n/modoDetalhado';

      case '/modosimples':
        setModoIA('simples');
        return '🔧 Modo IA alterado para: **Simples**.';

      case '/mododetalhado':
        setModoIA('detalhado');
        return '🔧 Modo IA alterado para: **Detalhado**.';

      default:
        return '❌ Comando não reconhecido. Use /ajuda para ver os disponíveis.';
    }
  };

  const enviarPergunta = async () => {
    if (!pergunta.trim()) {
      setInputVazio(true);
      setTimeout(() => setInputVazio(false), 1500);
      return;
    }

    if (pergunta.startsWith('/')) {
      const respostaComando = processarComando(pergunta);
      setMensagens((prev) => [
        ...prev,
        { role: 'user', content: pergunta },
        { role: 'assistant', content: respostaComando },
      ]);
      setPergunta('');
      return;
    }

    const novaMensagem = { role: 'user', content: pergunta };
    const mensagensAtualizadas = [...mensagens, novaMensagem];

    // Aqui montamos o payload real com a system
    const systemMessage = {
      role: 'system',
      content:
        modoIA === 'simples'
          ? `Qualquer pergunta relacionado a informações atualizadas de datas além do seu banco de dados, avisar que não vai ser preciso. A data de hoje é ${hoje}.Você é uma IA feita para a interação com Alunos e Professores, portanto, seja sempre educado, educacional e interativo, lembre-se de incentivar o usuário a fazer novas perguntas dando sugestões no final, porém, foque em ser objetivo nas suas respostas`
          : `Qualquer pergunta relacionado a informações atualizadas de datas além do seu banco de dados, avisar que não vai ser preciso. A data de hoje é ${hoje}. Você é uma IA feita para a interação com Alunos e Professores, portanto, seja sempre educado, educacional e interativo, lembre-se de incentivar o usuário a fazer novas perguntas dando sugestões no final, porém, foque em ser o mais detalhado e abundante possível nas suas respostas`,
    };

    const payload = [systemMessage, ...mensagensAtualizadas];

    setMensagens(mensagensAtualizadas);
    setCarregando(true);
    setErro('');

    try {
      const res = await fetch(`/api/ia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      });

      const data = await res.json();
      const textoResposta = data.resposta;
      setDigitando(true);

      let index = 0;
      let respostaParcial = '';

      const intervalo = setInterval(() => {
        respostaParcial += textoResposta[index];
        index++;

        setMensagens((prev) => {
          // Substitui a última mensagem da IA durante a digitação
          const atualizadas = [...prev];
          if (atualizadas[atualizadas.length - 1]?.role === 'assistant') {
            atualizadas[atualizadas.length - 1].content = respostaParcial;
          } else {
            atualizadas.push({ role: 'assistant', content: respostaParcial });
          }
          return atualizadas;
        });

        if (index >= textoResposta.length) {
          clearInterval(intervalo);
          setDigitando(false);
        }
      }, 15); // Velocidade: 15ms por caractere
    } catch (error) {
      setErro('Erro ao se comunicar com a IA. Tente novamente.');
      setMensagens((prev) => [...prev, { role: 'assistant', content: '...' }]);
    } finally {
      setCarregando(false);
      setPergunta('');
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 pt-8">
      <div className="max-w-3xl w-full mx-auto my-8 p-6 bg-white rounded-3xl shadow-xl flex flex-col gap-6">
        {/* Título */}
        <h1 className="text-3xl font-bold text-center text-gray-800 p-4">
          Assistente Inteligente
        </h1>

        {/* Seletor de modo */}
        <div className="flex justify-end items-center gap-3 p-2">
          <label htmlFor="modoIA" className="font-medium text-gray-700 text-base">
            Modo IA:
          </label>
          <select
            id="modoIA"
            value={modoIA}
            onChange={(e) => setModoIA(e.target.value as 'simples' | 'detalhado')}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          >
            <option value="simples">Simples</option>
            <option value="detalhado">Detalhado</option>
          </select>
        </div>

        {/* Chatbox de mensagens */}
        <div
          className="flex flex-col gap-3 max-h-[500px] overflow-y-auto px-4 py-5 bg-gray-50 rounded-xl shadow m-1"
          ref={chatBoxRef}
          onScroll={handleScroll}
        >
          {mensagens.map((msg, index) => (
            <div
              key={index}
              className={`px-4 py-3 rounded-xl max-w-[75%] break-words text-sm shadow ${msg.role === 'user'
                  ? 'self-end bg-indigo-500 text-white'
                  : 'self-start bg-gray-200 text-gray-900'
                }`}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          ))}
          {carregando && (
            <div className="self-start bg-gray-300 text-transparent min-h-[40px] p-3 w-[60%] rounded-lg animate-pulse">
              ...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Botão para rolar ao final */}
        {!autoScrollAtivo && (
          <button
            className="fixed bottom-20 right-6 px-4 py-3 bg-indigo-500 text-white rounded-full shadow-lg z-50 hover:bg-indigo-400 transition text-base"
            onClick={scrollParaFim}
          >
            🔽 Fim
          </button>
        )}

        {/* Área de input */}
        <div className="flex items-center gap-3 w-full p-2 bg-gray-50 rounded-xl shadow-inner m-1">
          <div className="relative flex-1">
            <textarea
              className={`w-full resize-none p-2 pr-12 rounded-md text-sm border min-h-[50px] ${inputVazio
                  ? 'border-indigo-500 bg-yellow-100'
                  : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-400 transition`}
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  enviarPergunta();
                }
              }}
              placeholder="Digite sua pergunta..."
              rows={2}
            />
            <span className="absolute right-3 top-2 text-gray-400 text-lg">💬</span>
          </div>

          <button
            className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-400 transition shadow-md text-sm"
            onClick={enviarPergunta}
            disabled={carregando}
          >
            Enviar
          </button>
        </div>

        {/* Mensagem de erro */}
        {erro && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md text-center font-medium text-sm m-1">
            {erro}
          </div>
        )}
      </div>
    </div>
  );

}

export default IaPage;
