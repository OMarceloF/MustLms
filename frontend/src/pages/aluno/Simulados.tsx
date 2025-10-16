import { useState } from "react";
import SimuladoForm from "./components/SimuladoForm";
import SimuladoResult from "./components/SimuladoResult";
import LayoutAluno from "./components/LayoutAluno"; // Importa o novo layout

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

const Simulados = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [tema, setTema] = useState("");

    const handleSimuladoGenerated = (generatedQuestions: Question[], tema: string) => {
        setQuestions(generatedQuestions);
        setTema(tema);
    };

    const handleNewSimulado = () => {
        setQuestions([]);
        setTema("");
    };

    return (
        // 1. Envolve tudo no componente de Layout
        <LayoutAluno>
            {/* 2. O conteúdo da página vai aqui dentro */}
            <div className="container mx-auto px-6">
                {questions.length === 0 ? (
                    <>
                        {/* Hero Section */}
                        <div className="text-center mb-16 space-y-6">
                            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                                Gerador de Simulados
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                Digite um tema e receba um simulado exclusivo para praticar seus conhecimentos.
                            </p>
                        </div>

                        {/* Form Section */}
                        <div className="flex justify-center mb-20">
                            <SimuladoForm
                                onSimuladoGenerated={handleSimuladoGenerated}
                            />
                        </div>

                        {/* Features Section */}
                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Seus 3 cards de features permanecem aqui, sem alterações */}
                            <div className="text-center space-y-4 p-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">Inteligência Personalizada</h3>
                                <p className="text-muted-foreground">Simulados criados especificamente para o tema que você quer estudar</p>
                            </div>
                            <div className="text-center space-y-4 p-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">Resultados Instantâneos</h3>
                                <p className="text-muted-foreground">Receba feedback imediato com respostas corretas e explicações</p>
                            </div>
                            <div className="text-center space-y-4 p-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">Acompanhe o Progresso</h3>
                                <p className="text-muted-foreground">Monitore seu desempenho e identifique áreas para melhorar</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <SimuladoResult
                        questions={questions}
                        tema={tema}
                        onFinalize={handleNewSimulado}
                    />
                )}
            </div>
        </LayoutAluno>
    );
};

export default Simulados;
