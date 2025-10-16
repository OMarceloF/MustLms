// src/pages/gestor/PlanoPage.tsx
import React, { useState } from 'react';
// import '../../styles/Plano.css';
import LegendaFlutuante from './components/LegendaFlutuante';
// IMPORTAÇÃO EXATA E FUNCIONAL
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ATENÇÃO: REGISTRA MANUALMENTE autoTable no protótipo de jsPDF
(jsPDF as any).API.autoTable = autoTable;

const pesos: { [disciplina: string]: number } = {
  Matemática: 5,
  Portugues: 5,
  Redação: 3,
  Inglês: 3,
  Geografia: 3,
  História: 3,
  Física: 2,
  Biologia: 2,
  Química: 2,
  EducaçãoFisica: 2,
  Artes: 1,
  Filosofia: 1,
};

const turmas = [
  '6º A',
  '6º A',
  '7º A',
  '7º B',
  '8º A',
  '8º B',
  '9º A',
  '9º B',
  '1º A',
  '1º B',
  '2º A',
  '2º B',
  '3º A',
  '3º B',
];

const horarios = [
  '1º Horário',
  '2º Horário',
  '3º Horário',
  '4º Horário',
  '5º Horário',
  '6º Horário',
];

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

const disciplinasFake = [
  'Matemática',
  'Redação',
  'Portugues',
  'Geografia',
  'História',
  'Inglês',
  'EducaçãoFisica',
  'Artes',
  'Biologia',
  'Física',
  'Química',
  'Filosofia',
];

const coresDisciplinas: { [key: string]: string } = {
  Matemática: 'rgb(58, 128, 209)',
  Geografia: 'rgb(0, 0, 0)',
  Inglês: 'rgb(0, 116, 15)',
  Redação: 'rgb(134, 86, 128)',
  Portugues: 'rgb(255, 230, 0)',
  EducaçãoFisica: 'rgb(0, 231, 77)',
  Física: 'rgb(13, 0, 255)',
  História: 'rgb(255, 0, 0)',
  Artes: 'rgb(255, 136, 0)',
  Filosofia: 'rgb(183, 0, 255)',
  Biologia: 'rgb(122, 253, 122)',
  Química: 'rgb(135, 190, 248)',
};

const professoresPorMateria: { [materia: string]: string[] } = {
  Matemática: ['Ana', 'Carlos', 'Daniel'],
  Geografia: ['João', 'Kátia'],
  Inglês: ['Beatriz', 'Cristiano'],
  Redação: ['Cláudia', 'Daniela'],
  Portugues: ['Felipe', 'Fernanda', 'Gabriel'],
  EducaçãoFisica: ['Gustavo', 'Hiago'],
  Física: ['Helena', 'Ivana'],
  História: ['Roberto', 'Sofia'],
  Artes: ['Tamires', 'Úrsula'],
  Filosofia: ['Marina', 'Nathan'],
  Biologia: ['André', 'Bianca'],
  Química: ['Andreia', 'Bruna'],
};

function PlanoPage() {
  const [mouseSobreTabela, setMouseSobreTabela] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [gerandoHorario, setGerandoHorario] = useState(false);
  const [disponibilidadeSelecionada, setDisponibilidadeSelecionada] =
    useState('');

  const tabelaFilas: { [turma: string]: string[] } = {};

  const [tabelasSemana, setTabelasSemana] = useState(
    diasSemana.map(
      () =>
        Array(7)
          .fill(null)
          .map(() => turmas.map(() => '')) // 6 horários + 1 intervalo
    )
  );

  const materiaPorProfessor: { [professor: string]: string } = {};

  Object.entries(professoresPorMateria).forEach(([materia, profs]) => {
    profs.forEach((prof) => {
      materiaPorProfessor[prof] = materia;
    });
  });

  const diasAtivosParaTurma = (nomeTurma: string): number[] => {
    if (nomeTurma.startsWith('6º')) return [Math.floor(Math.random() * 5)];
    if (
      nomeTurma.startsWith('7º') ||
      nomeTurma.startsWith('8º') ||
      nomeTurma.startsWith('9º')
    ) {
      const dias = [0, 1, 2, 3, 4];
      return dias.sort(() => 0.5 - Math.random()).slice(0, 2);
    }
    // Ensino Médio: todos os dias
    return [0, 1, 2, 3, 4];
  };

  const diasPermitidosPorTurma = Object.fromEntries(
    turmas.map((turma) => [turma, diasAtivosParaTurma(turma)])
  );

  const handleChange = (
    diaIndex: number,
    row: number,
    col: number,
    value: string
  ) => {
    const novasTabelas = [...tabelasSemana];
    novasTabelas[diaIndex][row][col] = value;
    setTabelasSemana(novasTabelas);
  };

  const exportarParaExcel = () => {
    const workbook = XLSX.utils.book_new();

    diasSemana.forEach((dia, diaIndex) => {
      const data = [];
      const header = ['Horário', ...turmas];
      data.push(header);

      for (let rowIndex = 0; rowIndex < 7; rowIndex++) {
        const isIntervalo = rowIndex === 3;
        const nomeHorario = isIntervalo
          ? 'Intervalo'
          : horarios[rowIndex < 3 ? rowIndex : rowIndex - 1];

        const row = [nomeHorario];

        turmas.forEach((_, turmaIndex) => {
          row.push(tabelasSemana[diaIndex][rowIndex][turmaIndex] || '');
        });

        data.push(row);
      }

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, dia);
    });

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(
      new Blob([buffer], { type: 'application/octet-stream' }),
      'HorarioSemanal.xlsx'
    );
  };

  const gerarHorarioFake = () => {
    const pesos: { [disciplina: string]: number } = {
      Matemática: 5,
      Portugues: 5,
      Redação: 3,
      Inglês: 3,
      Geografia: 3,
      História: 3,
      Física: 2,
      Biologia: 2,
      Química: 2,
      EducaçãoFisica: 2,
      Artes: 1,
      Filosofia: 1,
    };

    const totalAulasPorSemana = 30;

    const gerarFilaDisciplinas = () => {
      const filaObrigatoria: string[] = [];
      const filaPonderada: string[] = [];
      const somaPesos = Object.values(pesos).reduce((a, b) => a + b, 0);
      const totalSlots = 30;

      // Garante 1 aula de cada disciplina
      Object.keys(pesos).forEach((disc) => {
        const professores = professoresPorMateria[disc];
        if (!professores || professores.length === 0) return;
        const prof =
          professores[Math.floor(Math.random() * professores.length)];
        filaObrigatoria.push(prof);
      });

      const restantes = totalSlots - filaObrigatoria.length;

      // Preenche o restante da carga horária proporcionalmente
      Object.entries(pesos).forEach(([disc, peso]) => {
        const professores = professoresPorMateria[disc];
        if (!professores || professores.length === 0) return;

        // Já garantimos 1, então subtrai
        const proporcao = peso / somaPesos;
        const qtd = Math.round(proporcao * totalSlots) - 1;
        for (let i = 0; i < qtd; i++) {
          const prof =
            professores[Math.floor(Math.random() * professores.length)];
          filaPonderada.push(prof);
        }
      });

      const filaFinal = [...filaObrigatoria, ...filaPonderada];

      // Ajuste fino
      while (filaFinal.length > totalSlots) filaFinal.pop();
      while (filaFinal.length < totalSlots) filaFinal.push('');

      // Embaralha
      for (let i = filaFinal.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filaFinal[i], filaFinal[j]] = [filaFinal[j], filaFinal[i]];
      }

      return filaFinal;
    };

    const diasPermitidosPorTurma = Object.fromEntries(
      turmas.map((turma) => [turma, diasAtivosParaTurma(turma)])
    );
    const novaTabela = diasSemana.map(() =>
      Array(7)
        .fill(null)
        .map(() => turmas.map(() => ''))
    );

    const ocupacaoPorHorario: {
      [dia: number]: { [horario: number]: Set<string> };
    } = {};

    turmas.forEach((turma, turmaIndex) => {
      const fila = gerarFilaDisciplinas(); // 30 balanceadas
      const diasPermitidos = diasAtivosParaTurma(turma);
      let filaIndex = 0;

      for (let dia = 0; dia < 5; dia++) {
        for (let horario = 0; horario < 7; horario++) {
          if (horario === 3) continue; // intervalo
          if (horario === 6 && !diasPermitidos.includes(dia)) continue;

          if (!ocupacaoPorHorario[dia]) ocupacaoPorHorario[dia] = {};
          if (!ocupacaoPorHorario[dia][horario])
            ocupacaoPorHorario[dia][horario] = new Set();

          // Busca o próximo professor disponível
          let professorSelecionado: string | null = null;

          for (let i = 0; i < fila.length; i++) {
            const candidato = fila[i];
            if (!ocupacaoPorHorario[dia][horario].has(candidato)) {
              professorSelecionado = candidato;
              fila.splice(i, 1); // Remove da fila só se for usado
              break;
            }
          }

          // Se ninguém foi encontrado, tenta alocar qualquer professor livre
          if (!professorSelecionado && fila.length > 0) {
            const livres = fila.filter(
              (prof) => !ocupacaoPorHorario[dia][horario].has(prof)
            );
            if (livres.length > 0) {
              const random = livres[Math.floor(Math.random() * livres.length)];
              professorSelecionado = random;
              const idx = fila.indexOf(random);
              if (idx !== -1) fila.splice(idx, 1);
            }
          }

          novaTabela[dia][horario][turmaIndex] = professorSelecionado || '';
          if (professorSelecionado) {
            ocupacaoPorHorario[dia][horario].add(professorSelecionado);
          }
        }
      }
    });

    setTabelasSemana(novaTabela);
  };

  const simularGeracaoHorario = () => {
    setGerandoHorario(true);
    setTimeout(() => {
      gerarHorarioFake();
      setGerandoHorario(false);
      setModalAberto(false);
    }, 4000);
  };

  return (
    <div className="plano-container">
      <h2>Horários por Turma</h2>
      <div
        onMouseEnter={() => setMouseSobreTabela(true)}
        onMouseLeave={() => setMouseSobreTabela(false)}
      >
        {diasSemana.map((dia, diaIndex) => (
          <div key={diaIndex} className="dia-bloco">
            <h3>{dia}</h3>
            <div className="table-wrapper">
              <table className="horario-tabela">
                <thead>
                  <tr>
                    <th>Horários</th>
                    {turmas.map((turma, idx) => (
                      <th key={idx}>{turma}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array(7)
                    .fill(null)
                    .map((_, rowIndex) => {
                      const isIntervalo = rowIndex === 3;
                      const nomeHorario = isIntervalo
                        ? 'Intervalo'
                        : horarios[rowIndex < 3 ? rowIndex : rowIndex - 1];

                      return (
                        <tr key={rowIndex}>
                          <td>{nomeHorario}</td>
                          {turmas.map((_, colIndex) => (
                            <td key={colIndex}>
                              {isIntervalo ? (
                                <div className="celula-intervalo">—</div>
                              ) : (
                                <input
                                  type="text"
                                  value={
                                    tabelasSemana[diaIndex][rowIndex][colIndex]
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      diaIndex,
                                      rowIndex,
                                      colIndex,
                                      e.target.value
                                    )
                                  }
                                  className="celula-input"
                                  style={{
                                    backgroundColor:
                                      coresDisciplinas[
                                        materiaPorProfessor[
                                          tabelasSemana[diaIndex][rowIndex][
                                            colIndex
                                          ]
                                        ]
                                      ] || '#ffffff',
                                    color: materiaPorProfessor[
                                      tabelasSemana[diaIndex][rowIndex][
                                        colIndex
                                      ]
                                    ]
                                      ? '#fff'
                                      : '#000',
                                    fontWeight: 'bold',
                                  }}
                                />
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="botao-container">
        <button className="gerar-btn" onClick={() => setModalAberto(true)}>
          Sugerir Horário
        </button>
      </div>

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            {gerandoHorario ? (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Gerando horário com IA...</p>
              </div>
            ) : (
              <>
                <h2>Configuração de Geração Inteligente</h2>

                <label>Modelo de Geração (IA):</label>
                <select>
                  <option>Balanceado</option>
                  <option>Por Prioridade</option>
                  <option>IA</option>
                  <option>Otimizado (Beta)</option>
                </select>

                <label>Carregar Disponibilidade:</label>
                <select>
                  <option>Modelo Atual - Completo</option>
                  <option>Modelo 2024 - Parcial</option>
                  <option>Simulação Livre (IA)</option>
                  <option disabled>Importar Arquivo CSV (Indisponível)</option>
                </select>

                <label>Método de Distribuição:</label>
                <select>
                  <option>Proporcional</option>
                  <option>Igualitário (Não Recomendado)</option>
                  <option disabled>Manual (Indisponível)</option>
                </select>

                <label>Restrição por Professor:</label>
                <select>
                  <option>Nenhuma</option>
                  <option>Evitar horários consecutivos</option>
                  <option>Priorizar horários consecutivos</option>
                </select>

                <label>Modelo de Alocação por Série:</label>
                <select>
                  <option>Por Etapa</option>
                  <option>Blocos Temáticos</option>
                  <option>Distribuição Livre</option>
                </select>

                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" defaultChecked /> Evitar disciplinas
                    repetidas no mesmo dia
                  </label>
                  <label>
                    <input type="checkbox" /> Agrupar disciplinas por área
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> Alternar entre
                    teoria e prática
                  </label>
                </div>

                <div className="botoes-modal">
                  <button onClick={simularGeracaoHorario}>Gerar com IA</button>
                  <button onClick={() => setModalAberto(false)}>
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <div className="export-buttons">
        <button>Salvar Horário</button>
        <button onClick={exportarParaExcel}>📊 Exportar Excel</button>
      </div>

      <LegendaFlutuante mostrarCompleto={mouseSobreTabela} />
    </div>
  );
}

export default PlanoPage;
