import React from 'react';
import SmallChart from '../gestor/components/SmallChart';
import LargeChart from '../gestor/components/LargeChart';
import BottomChart from '../gestor/components/BottomChart';
import MiniCalendar from '../../components/MiniCalendar';
import Anuncios from '../gestor/components/Anuncios';
// import '../../styles/HomeGestor.css'

const HomePage = () => {
  return (
    <div className="gestor-layout">
      {/* Coluna principal (esquerda) */}
      <div className="gestor-main-column">
        {/* Cards iniciais */}
        <div className="gestor-cards-row">
          <div className="dashboard-card card-blue">
            <div className="dashboard-card-header">
              <span className="dashboard-badge">2024/25</span>
              <span className="dashboard-menu">⋯</span>
            </div>
            <div className="dashboard-card-body">
              <h2>1230</h2>
              <p>Alunos</p>
            </div>
          </div>

          <div className="dashboard-card card-yellow">
            <div className="dashboard-card-header">
              <span className="dashboard-badge">2024/25</span>
              <span className="dashboard-menu">⋯</span>
            </div>
            <div className="dashboard-card-body">
              <h2>845</h2>
              <p>Responsáveis</p>
            </div>
          </div>

          <div className="dashboard-card card-blue">
            <div className="dashboard-card-header">
              <span className="dashboard-badge">2024/25</span>
              <span className="dashboard-menu">⋯</span>
            </div>
            <div className="dashboard-card-body">
              <h2>27</h2>
              <p>Usuários Online</p>
            </div>
          </div>

          <div className="dashboard-card card-yellow">
            <div className="dashboard-card-header">
              <span className="dashboard-badge">2024/25</span>
              <span className="dashboard-menu">⋯</span>
            </div>
            <div className="dashboard-card-body">
              <h2>142</h2>
              <p>Professores</p>
            </div>
          </div>
        </div>

        {/* Gráficos (em breve) */}
        <div className="gestor-middle-charts">
          <div className="gestor-chart-small">
            <SmallChart />
          </div>
          <div className="gestor-chart-large">
            <LargeChart />
          </div>
        </div>

        {/* Gráfico Financeiro (em breve) */}
        <div className="gestor-bottom-chart">
          <BottomChart />
        </div>
      </div>

      {/* Coluna lateral direita */}
      <div className="gestor-side-column">
        <div className="gestor-box">
          <MiniCalendar />
        </div>
        <div className="gestor-box">
          <Anuncios />
        </div>
      </div>
    </div>
  );
};

export default HomePage
