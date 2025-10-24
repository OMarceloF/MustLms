// frontend/src/pages/gestor/cadastro/Cadastro.tsx


import { RegistrationProvider } from './contexts/RegistrationContext';
import { RegistrationLayout } from './components/RegistrationLayout';

const Cadastro = () => {
  return (
    <RegistrationProvider>
      <RegistrationLayout />
    </RegistrationProvider>
  );
};

export default Cadastro;