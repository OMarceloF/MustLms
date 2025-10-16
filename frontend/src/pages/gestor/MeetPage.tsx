import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const MeetPage = () => {
  const { turmaId } = useParams();
  const [nomeSala, setNomeSala] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [entrouNaSala, setEntrouNaSala] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const nome = user?.nome || 'Aluno';
    const sala = `turma-${turmaId}-aula`;
    setNomeUsuario(nome);
    setNomeSala(sala);
  }, [turmaId]);

  if (entrouNaSala) {
    return (
      <div className="w-full h-screen">
        <iframe
          src={`https://meet.jit.si/${nomeSala}#userInfo.displayName="${encodeURIComponent(
            nomeUsuario
          )}"`}
          allow="camera; microphone; fullscreen; display-capture"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Aula Online"
        ></iframe>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between h-screen bg-white px-6 lg:px-24">
      {/* Esquerda */}
      <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6">
        <h1 className="text-3xl sm:text-5xl font-semibold text-gray-800">
          Videoaulas com sua turma
        </h1>
        <p className="text-gray-600 text-lg">
          Conecte-se com professores e colegas em tempo real. Tudo sem sair do sistema.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={() => setEntrouNaSala(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Entrar na aula
          </button>
          <div className="border rounded-lg px-4 py-2 bg-gray-50 text-gray-500">
            {nomeSala}
          </div>
        </div>
      </div>

      {/* Direita */}
      <div className="w-full lg:w-1/2 flex justify-center mt-10 lg:mt-0">
        <img
          src="/logoNexum.png"
          alt="Ilustração"
          className="max-h-96 object-contain"
        />
      </div>
    </div>
  );
};

export default MeetPage;
