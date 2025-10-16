import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { cn } from "../../lib/utils";
import { Sparkles, BookOpen, Lightbulb, History } from "lucide-react";
import SimuladoConfig, { SimuladoConfig as ConfigType } from "./SimuladoConfig";

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

interface SimuladoFormProps {
    onSimuladoGenerated: (questions: Question[], tema: string, config: ConfigType) => void;
}

const SimuladoForm = ({ onSimuladoGenerated }: SimuladoFormProps) => {
    const [tema, setTema] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [config, setConfig] = useState<ConfigType>({
        numeroQuestoes: 5,
        dificuldade: "medio",
        tempoLimite: 30,
        tempoLimiteEnabled: false,
        categoria: "geral"
    });
    const [showConfig, setShowConfig] = useState(false);

    const sugestoesTemas = [
        { nome: "História do Brasil", icon: History, cor: "bg-blue-100 text-blue-800 border-blue-200" },
        { nome: "Matemática Básica", icon: BookOpen, cor: "bg-green-100 text-green-800 border-green-200" },
        { nome: "Física Moderna", icon: Lightbulb, cor: "bg-purple-100 text-purple-800 border-purple-200" },
        { nome: "Literatura Brasileira", icon: BookOpen, cor: "bg-orange-100 text-orange-800 border-orange-200" }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tema.trim()) return;

        setIsLoading(true);

        // Simular geração de simulado baseado na configuração
        setTimeout(() => {
            const mockQuestions: Question[] = Array.from({ length: config.numeroQuestoes }, (_, index) => ({
                id: index + 1,
                question: `${getDifficultyPrefix()} sobre ${tema}: ${generateQuestionByDifficulty(config.dificuldade, tema, index + 1)}`,
                options: generateOptions(config.dificuldade, tema, index),
                correctAnswer: Math.floor(Math.random() * 4),
                explanation: `Esta questão aborda conceitos ${config.dificuldade === 'facil' ? 'básicos' : config.dificuldade === 'medio' ? 'intermediários' : 'avançados'} de ${tema}.`
            }));

            onSimuladoGenerated(mockQuestions, tema, config);
            setIsLoading(false);
        }, 2000);
    };

    const getDifficultyPrefix = () => {
        switch (config.dificuldade) {
            case 'facil': return 'Conceito básico';
            case 'medio': return 'Análise intermediária';
            case 'dificil': return 'Questão avançada';
            default: return 'Questão';
        }
    };

    const generateQuestionByDifficulty = (dificuldade: string, tema: string, index: number) => {
        const questions = {
            facil: [
                `Qual é a definição principal de ${tema}?`,
                `Quais são as características básicas de ${tema}?`,
                `Como identificar ${tema}?`
            ],
            medio: [
                `Qual a relação entre ${tema} e outros conceitos relacionados?`,
                `Como aplicar os conhecimentos de ${tema} na prática?`,
                `Quais são as implicações de ${tema}?`
            ],
            dificil: [
                `Analise criticamente a teoria de ${tema} e suas limitações`,
                `Compare diferentes abordagens sobre ${tema}`,
                `Avalie o impacto contemporâneo de ${tema}`
            ]
        };

        const questionList = questions[dificuldade as keyof typeof questions] || questions.medio;
        return questionList[index % questionList.length];
    };

    const generateOptions = (dificuldade: string, tema: string, index: number) => {
        const baseOptions = [
            `Primeira alternativa sobre ${tema}`,
            `Segunda alternativa explicativa`,
            `Terceira opção de resposta`,
            `Quarta possibilidade de resposta`
        ];

        if (dificuldade === 'dificil') {
            return [
                `Análise complexa considerando múltiplos fatores de ${tema}`,
                `Interpretação crítica baseada em teorias consolidadas`,
                `Síntese de diferentes perspectivas sobre o tema`,
                `Avaliação contextualizada dos aspectos principais`
            ];
        }

        return baseOptions;
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            {/* Formulário Principal */}
            <div className="relative">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-brand rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <Input
                            type="text"
                            value={tema}
                            onChange={(e) => setTema(e.target.value)}
                            placeholder="Ex: História do Brasil, Matemática, Biologia…"
                            className="relative h-16 text-lg px-6 rounded-xl border-2 border-muted-light focus:border-brand focus:ring-2 focus:ring-brand/20 bg-background"
                            disabled={isLoading}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <Sparkles className="w-6 h-6 text-brand/60" />
                        </div>
                    </div>

                    {/* Sugestões de Temas */}
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Sugestões populares:</p>
                        <div className="flex flex-wrap gap-2">
                            {sugestoesTemas.map((sugestao, index) => {
                                const Icon = sugestao.icon;
                                return (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer hover:scale-105 transition-transform p-2 h-auto",
                                            sugestao.cor,
                                            "hover:shadow-soft"
                                        )}
                                        onClick={() => setTema(sugestao.nome)}
                                    >
                                        <Icon className="w-3 h-3 mr-1" />
                                        {sugestao.nome}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-14 text-lg rounded-xl border-2"
                            onClick={() => setShowConfig(!showConfig)}
                            disabled={isLoading}
                        >
                            <BookOpen className="w-5 h-5 mr-2" />
                            {showConfig ? "Ocultar" : "Configurar"} Simulado
                        </Button>

                        <Button
                            type="submit"
                            variant="brand"
                            size="lg"
                            disabled={!tema.trim() || isLoading}
                            className={cn(
                                "flex-2 h-14 text-lg rounded-xl font-semibold pulse-glow",
                                isLoading && "cursor-not-allowed opacity-75"
                            )}
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Gerando Simulado...</span>
                                </div>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Gerar Simulado
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Configurações Avançadas */}
            {showConfig && (
                <div className="animate-fade-in">
                    <SimuladoConfig onConfigChange={setConfig} />
                </div>
            )}
        </div>
    );
};

export default SimuladoForm;