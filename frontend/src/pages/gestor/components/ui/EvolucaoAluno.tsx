import React, { useState } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Progress } from './progress';
import { Check } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Skill {
    id: number;
    name: string;
    value: number;
}

interface EvolucaoDisciplina {
    nome: string;
    notas: (number | null)[];
}

interface Props {
    skillsData: Skill[];
    evolucaoDisciplinas: EvolucaoDisciplina[];
}

const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]; // azul, laranja, verde, vermelho (para 4 bimestres)

const EvolucaoAluno: React.FC<Props> = ({ skillsData, evolucaoDisciplinas }) => {
    // Estado com array dos índices selecionados dos bimestres
    const [filtrosBi, setFiltrosBi] = useState<number[]>([0, 1, 2, 3]);
    const bimestresLabels = ['1º Bi', '2º Bi', '3º Bi', '4º Bi'];  // Atualizado para 4 bimestres

    const exportarPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text("Notas por Disciplina e Bimestre", 14, 15);

        // Preparar dados da tabela para autoTable
        const bodyData = evolucaoDisciplinas.map(({ nome, notas }) => [
            nome,
            notas[0]?.toString() ?? '–',
            notas[1]?.toString() ?? '–',
            notas[2]?.toString() ?? '–',
            notas[3]?.toString() ?? '–',
        ]);

        autoTable(doc, {
            startY: 20,
            head: [["Disciplina", "1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"]],
            body: bodyData,
            styles: { fontSize: 10 },
        });

        doc.save("Notas_Evolucao.pdf");
    };

    const exportarExcel = () => {
        // Preparar array de arrays para XLSX
        const wsData = [
            ["Disciplina", "1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"],
            ...evolucaoDisciplinas.map(({ nome, notas }) => [
                nome,
                notas[0]?.toString() ?? '–',
                notas[1]?.toString() ?? '–',
                notas[2]?.toString() ?? '–',
                notas[3]?.toString() ?? '–',
            ])
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Notas");

        XLSX.writeFile(wb, "Notas_Evolucao.xlsx");
    };

    // Construir dados substituindo 0 ou null por undefined para pular pontos
    const dataRadar = evolucaoDisciplinas.map(({ nome, notas }) => {
        const entry: any = { subject: nome };
        notas.forEach((nota, idx) => {
            entry[bimestresLabels[idx]] = nota && nota > 0 ? nota : undefined;
        });
        return entry;
    });

    // Manipula seleção dos filtros (botões)
    const toggleFiltro = (index: number) => {
        setFiltrosBi((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    return (
        <div className="space-y-8">
            <br />
            <div className="mb-4 flex gap-2 justify-end">
                <button
                    onClick={exportarPDF}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-1 rounded"
                >
                    Exportar PDF
                </button>
                <button
                    onClick={exportarExcel}
                    className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-1 rounded"
                >
                    Exportar Excel
                </button>
            </div>

            {/* Tabela comparativa de notas */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Notas por Disciplina e Bimestre</h3>
                <table className="table-auto w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1">Disciplina</th>
                            <th className="border px-2 py-1">1º Bimestre</th>
                            <th className="border px-2 py-1">2º Bimestre</th>
                            <th className="border px-2 py-1">3º Bimestre</th>
                            <th className="border px-2 py-1">4º Bimestre</th>
                        </tr>
                    </thead>
                    <tbody>
                        {evolucaoDisciplinas.map(({ nome, notas }) => (
                            <tr key={nome} className="odd:bg-white even:bg-gray-50">
                                <td className="border px-2 py-1 font-medium">{nome}</td>
                                <td className="border px-2 py-1 text-center">{notas[0] ?? '–'}</td>
                                <td className="border px-2 py-1 text-center">{notas[1] ?? '–'}</td>
                                <td className="border px-2 py-1 text-center">{notas[2] ?? '–'}</td>
                                <td className="border px-2 py-1 text-center">{notas[3] ?? '–'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Filtros de bimestres via botões estilo checkbox */}
            <div className="mb-6 flex space-x-3">
                {bimestresLabels.map((label, idx) => {
                    const ativo = filtrosBi.includes(idx);
                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => toggleFiltro(idx)}
                            className={`flex items-center space-x-2 rounded border px-4 py-1 text-sm font-medium
                                ${ativo ? 'bg-blue-100 border-blue-600 text-blue-700' : 'bg-gray-100 border-gray-300 text-gray-600'}
                                hover:bg-blue-200 hover:border-blue-700 hover:text-blue-800 transition`}
                        >
                            {ativo && <Check className="w-4 h-4" />}
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Gráfico Radar com múltiplos bimestres selecionados */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Gráfico Radar da Evolução</h3>
                {filtrosBi.length === 0 ? (
                    <p className="text-center text-gray-500">Selecione ao menos um bimestre para exibir o gráfico.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dataRadar}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} />
                            {filtrosBi.map((biIdx) => (
                                <Radar
                                    key={bimestresLabels[biIdx]}
                                    name={bimestresLabels[biIdx]}
                                    dataKey={bimestresLabels[biIdx]}
                                    stroke={colors[biIdx]}
                                    strokeOpacity={0.8}
                                    fill={colors[biIdx]}
                                    fillOpacity={0.3}
                                    connectNulls={false}
                                    dot={{ r: 4 }}
                                />
                            ))}
                            <Tooltip />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default EvolucaoAluno;
