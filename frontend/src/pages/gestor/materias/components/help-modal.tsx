"use client"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajuda - Adicionar Atividade ou Recurso</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <h3 className="font-semibold text-lg text-foreground mb-2">Como adicionar uma atividade ou recurso?</h3>
            <p className="text-muted-foreground leading-relaxed">
              Selecione o tipo de atividade ou recurso que deseja adicionar ao seu curso. Cada tipo possui configurações
              e funcionalidades específicas. Após selecionar, você será direcionado para a tela de configuração.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-foreground mb-2">Tipos de Atividades e Recursos</h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-foreground">Conteúdo</p>
                <p className="text-sm text-muted-foreground">
                  Arquivos, páginas, URLs e outros recursos para compartilhar conteúdo com os alunos.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Comunicação</p>
                <p className="text-sm text-muted-foreground">
                  Fóruns, chats e outras ferramentas para colaboração entre alunos e professor.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Avaliação</p>
                <p className="text-sm text-muted-foreground">
                  Tarefas, questionários e outras atividades para avaliar o aprendizado.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Interoperabilidade</p>
                <p className="text-sm text-muted-foreground">Ferramentas externas e integrações com outros serviços.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-foreground mb-2">Usando os Filtros</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Buscar:</strong> Digite o nome ou descrição da atividade para
                filtrar.
              </li>
              <li>
                <strong className="text-foreground">Mais usados:</strong> Mostra as atividades mais utilizadas.
              </li>
              <li>
                <strong className="text-foreground">Ordem alfabética:</strong> Organiza as atividades em ordem
                alfabética.
              </li>
              <li>
                <strong className="text-foreground">Favoritos:</strong> Mostra apenas as atividades que você marcou como
                favoritas.
              </li>
            </ul>
          </section>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
