import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { BookOpen, LinkIcon, Library } from "lucide-react"

export function InformacoesComplementaresTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Informações Complementares</h2>
        <p className="text-sm text-muted-foreground">Recursos adicionais e orientações para a disciplina</p>
      </div>

      {/* Complementary Bibliography */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Bibliografia Complementar</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-l-2 border-primary pl-4">
              <p className="font-medium leading-relaxed">
                RUSSELL, Stuart; NORVIG, Peter. Inteligência Artificial: Uma Abordagem Moderna. 4ª ed. Rio de Janeiro:
                LTC, 2022.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Leitura fundamental para aprofundamento teórico</p>
            </div>
            <div className="border-l-2 border-muted pl-4">
              <p className="font-medium leading-relaxed">
                GOODFELLOW, Ian; BENGIO, Yoshua; COURVILLE, Aaron. Deep Learning. Cambridge: MIT Press, 2016.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Referência em aprendizado profundo</p>
            </div>
            <div className="border-l-2 border-muted pl-4">
              <p className="font-medium leading-relaxed">
                MITCHELL, Tom M. Machine Learning. New York: McGraw-Hill, 1997.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Clássico sobre aprendizado de máquina</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Useful Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            <CardTitle>Links Úteis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li>
              <a
                href="https://www.tensorflow.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 text-sm hover:text-primary"
              >
                <span className="mt-0.5 text-primary">→</span>
                <div>
                  <span className="font-medium group-hover:underline">TensorFlow</span>
                  <p className="text-muted-foreground">Framework para machine learning e deep learning</p>
                </div>
              </a>
            </li>
            <li>
              <a
                href="https://pytorch.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 text-sm hover:text-primary"
              >
                <span className="mt-0.5 text-primary">→</span>
                <div>
                  <span className="font-medium group-hover:underline">PyTorch</span>
                  <p className="text-muted-foreground">Biblioteca de aprendizado de máquina de código aberto</p>
                </div>
              </a>
            </li>
            <li>
              <a
                href="https://scikit-learn.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 text-sm hover:text-primary"
              >
                <span className="mt-0.5 text-primary">→</span>
                <div>
                  <span className="font-medium group-hover:underline">Scikit-learn</span>
                  <p className="text-muted-foreground">Ferramentas para análise de dados e mineração</p>
                </div>
              </a>
            </li>
            <li>
              <a
                href="https://www.kaggle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 text-sm hover:text-primary"
              >
                <span className="mt-0.5 text-primary">→</span>
                <div>
                  <span className="font-medium group-hover:underline">Kaggle</span>
                  <p className="text-muted-foreground">Plataforma para competições e datasets de ML</p>
                </div>
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Reading Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-primary" />
            <CardTitle>Indicações de Leitura</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              <span className="font-medium">Semana 1-4:</span> Capítulos 1-4 do Russell & Norvig - Fundamentos e Agentes
              Inteligentes
            </p>
            <p>
              <span className="font-medium">Semana 5-8:</span> Capítulos 3-4 do Russell & Norvig - Algoritmos de Busca
            </p>
            <p>
              <span className="font-medium">Semana 9-12:</span> Capítulos 18-20 do Russell & Norvig + Capítulos 1-5 do
              Mitchell - Machine Learning
            </p>
            <p>
              <span className="font-medium">Semana 13-16:</span> Capítulos 6-9 do Goodfellow - Deep Learning
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
