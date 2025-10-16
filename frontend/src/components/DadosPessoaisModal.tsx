import { forwardRef, useState, useEffect } from 'react';


interface DadosPessoaisModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

interface UserData {
  nome: string;
  email: string;
  login: string;
}

const DadosPessoaisModal = forwardRef<HTMLDivElement, DadosPessoaisModalProps>(({ isOpen, onClose, userId }, ref) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/user/${userId}`, {
        method: 'GET',
        credentials: 'include',
      })
        .then(response => response.json())
        .then(data => setUserData(data))
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
      <div
        className="bg-white p-5 rounded-lg shadow-lg w-[400px] max-w-[90%] text-center"
        ref={ref}
      >
        <h2 className="mb-5 text-xl font-semibold text-[#333]">Dados Pessoais</h2>

        {userData ? (
          <>
            <p className="mb-5 text-[#444]">Nome: {userData.nome}</p>
            <p className="mb-5 text-[#444]">E-mail: {userData.email}</p>
            <p className="mb-5 text-[#444]">Login: {userData.login}</p>
          </>
        ) : (
          <p className="mb-5 text-[#666]">Carregando...</p>
        )}

        <button
          onClick={onClose}
          className="bg-[#C95830] text-white py-2 px-5 rounded hover:bg-[#df8e4c] transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
});

export default DadosPessoaisModal;