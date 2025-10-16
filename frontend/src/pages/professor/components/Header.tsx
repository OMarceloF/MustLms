// frontend/src/pages/professor/components/Header.tsx

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // 🚨 ATUALIZAÇÃO: Os links devem apontar para as rotas completas e corretas
  const menuItems = [
    { href: '/professor/home', label: 'Início' },
    { href: '/professor/avaliacoes/home', label: 'Avaliações' },
    { href: '/professor/avaliacoes/banco-questoes', label: 'Banco de Questões' },
    { href: '/professor/avaliacoes/perfil', label: 'Perfil' }
  ];

  return (
    // 1. 🚨 CORREÇÃO PRINCIPAL: Removido o posicionamento fixo.
    // O header agora é um bloco normal que ocupará o espaço abaixo da Topbar.
    <header className="bg-surface-primary border-b border-surface-border shadow-soft w-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/professor/avaliacoes/home" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-text-primary hidden sm:block">
              Plataforma de Avaliações
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                // 2. 🚨 MELHORIA: Usar startsWith para destacar o menu "Avaliações" em sub-páginas
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname.startsWith(item.href)
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-surface-border">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname.startsWith(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
