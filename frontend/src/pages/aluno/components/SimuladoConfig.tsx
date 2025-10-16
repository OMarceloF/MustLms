import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Clock, Target, Zap, Brain } from "lucide-react";

interface SimuladoConfigProps {
  onConfigChange: (config: SimuladoConfig) => void;
}

export interface SimuladoConfig {
  numeroQuestoes: number;
  dificuldade: string;
  tempoLimite: number;
  tempoLimiteEnabled: boolean;
  categoria: string;
}

const SimuladoConfig = ({ onConfigChange }: SimuladoConfigProps) => {
  const [config, setConfig] = useState<SimuladoConfig>({
    numeroQuestoes: 5,
    dificuldade: "medio",
    tempoLimite: 30,
    tempoLimiteEnabled: false,
    categoria: "geral"
  });

  const updateConfig = (updates: Partial<SimuladoConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const dificuldadeColors = {
    facil: "bg-green-100 text-green-800 border-green-200",
    medio: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dificil: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <Card className="shadow-medium border-muted-light bg-card text-card-foreground">
      <CardHeader className="bg-muted/50 bg-gradient-glow">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Brain className="w-5 h-5 text-brand" />
          Configurações do Simulado
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Número de Questões */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-brand" />
            Número de Questões: {config.numeroQuestoes}
          </Label>
          <Slider
            value={[config.numeroQuestoes]}
            onValueChange={(value) => updateConfig({ numeroQuestoes: value[0] })}
            max={20}
            min={3}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3 questões</span>
            <span>20 questões</span>
          </div>
        </div>

        {/* Dificuldade */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand" />
            Nível de Dificuldade
          </Label>
          <Select value={config.dificuldade} onValueChange={(value) => updateConfig({ dificuldade: value })}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="facil">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={dificuldadeColors.facil}>
                    Fácil
                  </Badge>
                  <span className="text-muted-foreground">Conceitos básicos</span>
                </div>
              </SelectItem>
              <SelectItem value="medio">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={dificuldadeColors.medio}>
                    Médio
                  </Badge>
                  <span className="text-muted-foreground">Conhecimento intermediário</span>
                </div>
              </SelectItem>
              <SelectItem value="dificil">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={dificuldadeColors.dificil}>
                    Difícil
                  </Badge>
                  <span className="text-muted-foreground">Conhecimento avançado</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">Categoria</Label>
          <Select value={config.categoria} onValueChange={(value) => updateConfig({ categoria: value })}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geral">Conhecimentos Gerais</SelectItem>
              <SelectItem value="academico">Acadêmico</SelectItem>
              <SelectItem value="concurso">Concurso Público</SelectItem>
              <SelectItem value="enem">ENEM</SelectItem>
              <SelectItem value="vestibular">Vestibular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tempo Limite */}
        <div className="space-y-4">
          <div className="relative z-10 flex items-center justify-between">
            <Label className="text-foreground font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand" />
              Tempo Limite
            </Label>
            <Switch
              checked={config.tempoLimiteEnabled}
              onCheckedChange={(checked) => updateConfig({ tempoLimiteEnabled: checked })}
            />
          </div>

          {/* Este Slider agora ficará sempre ABAIXO do Switch */}
          {config.tempoLimiteEnabled && (
            <div className="space-y-3 animate-fade-in">
              <Slider
                value={[config.tempoLimite]}
                onValueChange={(value) => updateConfig({ tempoLimite: value[0] })}
                max={120}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 min</span>
                <span className="text-brand font-medium">{config.tempoLimite} minutos</span>
                <span>120 min</span>
              </div>
            </div>
          )}
        </div>

        {/* Preview das Configurações */}
        <div className="p-4 bg-accent/30 rounded-lg border border-muted-light">
          <h4 className="font-medium text-foreground mb-2">Resumo da Configuração:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20">
              {config.numeroQuestoes} questões
            </Badge>
            <Badge variant="outline" className={dificuldadeColors[config.dificuldade as keyof typeof dificuldadeColors]}>
              {config.dificuldade}
            </Badge>
            <Badge variant="outline" className="bg-secondary">
              {config.categoria}
            </Badge>
            {config.tempoLimiteEnabled && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                {config.tempoLimite} min
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimuladoConfig;