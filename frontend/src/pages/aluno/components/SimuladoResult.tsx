import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { cn } from "../../lib/utils";
import { CheckCircle, XCircle, Clock, Target, TrendingUp, RotateCcw } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface SimuladoResultProps {
  questions: Question[];
  tema: string;
  onFinalize: () => void;
}

const SimuladoResult = ({ questions, tema, onFinalize }: SimuladoResultProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const answeredQuestions = Object.keys(selectedAnswers).length;
    setProgress((answeredQuestions / questions.length) * 100);
  }, [selectedAnswers, questions.length]);

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleFinalize = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);
  
  const getPerformanceLevel = () => {
    if (percentage >= 80) return { label: "Excelente", color: "text-green-600", bgColor: "bg-green-100" };
    if (percentage >= 60) return { label: "Bom", color: "text-blue-600", bgColor: "bg-blue-100" };
    if (percentage >= 40) return { label: "Regular", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    return { label: "Precisa Melhorar", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Header com Progress e Stats */}
      <Card className="shadow-medium border-muted-light">
        <CardHeader className="bg-gradient-glow border-b border-muted-light">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Target className="w-6 h-6 text-brand" />
                Simulado: {tema}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {questions.length} questões • {Object.keys(selectedAnswers).length} respondidas
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>
              {!showResults && (
                <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20">
                  {Object.keys(selectedAnswers).length}/{questions.length}
                </Badge>
              )}
            </div>
          </div>

          {!showResults && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {showResults && (
            <div className="mt-6 p-6 bg-background rounded-lg border border-muted-light">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3", getPerformanceLevel().bgColor)}>
                    {percentage >= 60 ? (
                      <CheckCircle className={cn("w-8 h-8", getPerformanceLevel().color)} />
                    ) : (
                      <XCircle className={cn("w-8 h-8", getPerformanceLevel().color)} />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">{score}/{questions.length}</p>
                  <p className="text-sm text-muted-foreground">Acertos</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{percentage}%</p>
                  <p className="text-sm text-muted-foreground">Aproveitamento</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatTime(timeElapsed)}</p>
                  <p className="text-sm text-muted-foreground">Tempo Total</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Badge variant="outline" className={cn("text-lg px-4 py-2", getPerformanceLevel().bgColor, getPerformanceLevel().color)}>
                  {getPerformanceLevel().label}
                </Badge>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {index + 1}. {question.question}
              </h3>
              
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selectedAnswers[question.id] === optionIndex;
                  const isCorrect = optionIndex === question.correctAnswer;
                  const isWrong = showResults && isSelected && !isCorrect;
                  
                  return (
                    <div key={optionIndex} className="space-y-2">
                      <button
                        onClick={() => handleAnswerSelect(question.id, optionIndex)}
                        disabled={showResults}
                        className={cn(
                          "w-full p-4 text-left rounded-lg border-2 transition-smooth group",
                          "hover:shadow-soft hover:scale-[1.01]",
                          !showResults && !isSelected && "border-muted-light bg-background hover:border-brand/30",
                          !showResults && isSelected && "border-brand bg-brand/5 ring-2 ring-brand/20",
                          showResults && isCorrect && "border-green-500 bg-green-50 ring-2 ring-green-200",
                          showResults && isWrong && "border-red-500 bg-red-50 ring-2 ring-red-200",
                          showResults && !isSelected && !isCorrect && "border-muted-light bg-muted-light/20"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all",
                            !showResults && !isSelected && "border-muted group-hover:border-brand/50",
                            !showResults && isSelected && "border-brand bg-brand text-brand-foreground",
                            showResults && isCorrect && "border-green-500 bg-green-500 text-white",
                            showResults && isWrong && "border-red-500 bg-red-500 text-white",
                            showResults && !isSelected && !isCorrect && "border-muted"
                          )}>
                            {showResults && isCorrect ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : showResults && isWrong ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              String.fromCharCode(65 + optionIndex)
                            )}
                          </div>
                          <span className={cn(
                            "text-foreground flex-1",
                            showResults && isCorrect && "font-semibold text-green-700",
                            showResults && isWrong && "font-semibold text-red-700"
                          )}>
                            {option}
                          </span>
                        </div>
                      </button>

                      {/* Explicação quando mostrar resultados */}
                      {showResults && isCorrect && question.explanation && (
                        <div className="ml-11 p-3 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                          <p className="text-sm text-green-800">
                            <strong>💡 Explicação:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          <div className="flex justify-center pt-8 gap-4">
            {!showResults ? (
              <>
                <Button
                  onClick={() => setSelectedAnswers({})}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-lg rounded-xl"
                  disabled={Object.keys(selectedAnswers).length === 0}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Limpar Respostas
                </Button>
                <Button
                  onClick={handleFinalize}
                  variant="brand"
                  size="lg"
                  disabled={Object.keys(selectedAnswers).length !== questions.length}
                  className="px-12 py-3 text-lg font-semibold rounded-xl pulse-glow"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Finalizar Simulado
                </Button>
              </>
            ) : (
              <Button
                onClick={onFinalize}
                variant="brand"
                size="lg"
                className="px-12 py-3 text-lg font-semibold rounded-xl"
              >
                <Target className="w-5 h-5 mr-2" />
                Fazer Novo Simulado
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimuladoResult;