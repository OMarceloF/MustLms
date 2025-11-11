import type React from "react"
import {
  FileText,
  BookOpen,
  Bookmark,
  Link,
  AlignLeft,
  MessageSquare,
  MessageCircle,
  CheckSquare,
  Zap,
  BarChart3,
  Database,
  Layers,
  Code,
  Users,
  Award,
} from "lucide-react"

export interface ActivityType {
  id: string
  name: string
  description: string
  category: "content" | "communication" | "assessment" | "interoperability"
  icon: React.ComponentType<{ className?: string }>
}

export const ACTIVITY_TYPES: ActivityType[] = [
  {
    id: "file",
    name: "Arquivo",
    description: "Adicione arquivos para download (PDF, documentos, etc.)",
    category: "content",
    icon: FileText,
  },
  // {
  //   id: "page",
  //   name: "Página",
  //   description: "Crie páginas de conteúdo com texto e mídia",
  //   category: "content",
  //   icon: BookOpen,
  // },
  {
    id: "url",
    name: "URL",
    description: "Crie um atalho para um site ou recurso online",
    category: "content",
    icon: Link,
  },
  // {
  //   id: "book",
  //   name: "Livro",
  //   description: "Organize conteúdo em um formato de livro interativo",
  //   category: "content",
  //   icon: Bookmark,
  // },
  // {
  //   id: "glossary",
  //   name: "Glossário",
  //   description: "Crie um dicionário de termos relacionados ao curso",
  //   category: "content",
  //   icon: AlignLeft,
  // },
  // {
  //   id: "forum",
  //   name: "Fórum",
  //   description: "Discussões assíncronas entre professores e alunos",
  //   category: "communication",
  //   icon: MessageSquare,
  // },

  {
    id: "task",
    name: "Tarefa",
    description: "Crie tarefas para os alunos entregarem trabalhos",
    category: "assessment",
    icon: CheckSquare,
  },
  {
    id: "lesson",
    name: "Lição",
    description: "Criador de aulas com questões e ramificações",
    category: "assessment",
    icon: Zap,
  },
  {
    id: "quiz",
    name: "Questionário",
    description: "Crie avaliações com questões de múltipla escolha e mais",
    category: "assessment",
    icon: BarChart3,
  },

  // {
  //   id: "database",
  //   name: "Base de Dados",
  //   description: "Crie bancos de dados colaborativos com modelos customizados",
  //   category: "content",
  //   icon: Database,
  // },


  // {
  //   id: "workshop",
  //   name: "Workshop",
  //   description: "Atividade de avaliação por pares entre alunos",
  //   category: "assessment",
  //   icon: Users,
  // },
  {
    id: "survey",
    name: "Pesquisa",
    description: "Colete feedback e dados dos alunos",
    category: "communication",
    icon: Award,
  },
]
