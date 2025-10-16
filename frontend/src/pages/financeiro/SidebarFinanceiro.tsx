import {
  Home,
} from 'lucide-react';
import { VscRobot } from "react-icons/vsc";
import { MdOutlineAttachMoney } from "react-icons/md";
import { MdOutlineMoneyOff } from "react-icons/md";
import { IoAnalytics } from "react-icons/io5";
import { BsPencilSquare } from "react-icons/bs";
import { GrUserManager } from "react-icons/gr";


import NavItem from "../../components/NavItem"

interface SidebarFinanceiroProps {
  isMenuOpen: boolean;
  setActivePage: (page: string) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export default function SidebarFinanceiro({
  isMenuOpen,
  setActivePage,
  handleMouseEnter,
  handleMouseLeave
}: SidebarFinanceiroProps) {
  return (
    <aside
      className={`sidebar ${isMenuOpen ? 'expanded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NavItem icon={<Home size={20} />} text="Início" isExpanded={isMenuOpen} onClick={() => setActivePage('home')} />
      <NavItem icon={<VscRobot size={20} />} text="IA" isExpanded={isMenuOpen} onClick={() => setActivePage('ia')} />
      <NavItem icon={<MdOutlineAttachMoney size={20} />} text="Entradas" isExpanded={isMenuOpen} onClick={() => setActivePage('receita')} />
      <NavItem icon={<MdOutlineMoneyOff size={20} />} text="Saídas" isExpanded={isMenuOpen} onClick={() => setActivePage('despesas')} />
      <NavItem icon={<IoAnalytics size={20} />} text="Relatórios" isExpanded={isMenuOpen} onClick={() => setActivePage('relatorio')} />
      <NavItem icon={<BsPencilSquare size={20} />} text="Gerar Boleto" isExpanded={isMenuOpen} onClick={() => setActivePage('boleto')} />
      <NavItem icon={<GrUserManager size={20} />} text="Pagamentos" isExpanded={isMenuOpen} onClick={() => setActivePage('pagamentos')} />
    </aside>
  );
}
