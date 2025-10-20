//file: frontend/src/pages/aluno/curso/documentos-tab.tsx

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Button } from "../../gestor/components/ui/button"
import { FileText, Download } from "lucide-react"
import { Badge } from "../../gestor/components/ui/badge"

interface Documento {
    id: string
    nome: string
    tipo: "PDF" | "DOCX" | "XLSX"
    categoria: "Regulamento" | "Formulário" | "Guia" | "Ata"
    descricao: string
    dataAtualizacao: string
}

// Mock data
const documentos: Documento[] = [
    {
        id: "1",
        nome: "Regulamento do Programa de Pós-Graduação",
        tipo: "PDF",
        categoria: "Regulamento",
        descricao: "Regulamento completo do programa com normas e procedimentos",
        dataAtualizacao: "2024-01-15",
    },
    {
        id: "2",
        nome: "Guia de Defesa de Dissertação",
        tipo: "PDF",
        categoria: "Guia",
        descricao: "Orientações para preparação e realização da defesa de dissertação",
        dataAtualizacao: "2024-02-20",
    },
    {
        id: "3",
        nome: "Formulário de Matrícula em Disciplinas",
        tipo: "DOCX",
        categoria: "Formulário",
        descricao: "Formulário para solicitação de matrícula em disciplinas",
        dataAtualizacao: "2024-07-10",
    },
    {
        id: "4",
        nome: "Formulário de Qualificação",
        tipo: "DOCX",
        categoria: "Formulário",
        descricao: "Formulário para agendamento de exame de qualificação",
        dataAtualizacao: "2024-03-05",
    },
    {
        id: "5",
        nome: "Ata de Defesa - Modelo",
        tipo: "DOCX",
        categoria: "Ata",
        descricao: "Modelo de ata para registro de defesa de dissertação ou tese",
        dataAtualizacao: "2024-01-30",
    },
    {
        id: "6",
        nome: "Guia de Formatação ABNT",
        tipo: "PDF",
        categoria: "Guia",
        descricao: "Manual de formatação de trabalhos acadêmicos segundo normas ABNT",
        dataAtualizacao: "2024-04-12",
    },
    {
        id: "7",
        nome: "Formulário de Relatório Semestral",
        tipo: "XLSX",
        categoria: "Formulário",
        descricao: "Planilha para preenchimento do relatório de atividades semestrais",
        dataAtualizacao: "2024-06-01",
    },
    {
        id: "8",
        nome: "Regulamento de Bolsas",
        tipo: "PDF",
        categoria: "Regulamento",
        descricao: "Normas e critérios para concessão e manutenção de bolsas",
        dataAtualizacao: "2024-02-15",
    },
]

const getTipoColor = (tipo: Documento["tipo"]) => {
    switch (tipo) {
        case "PDF":
            return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
        case "DOCX":
            return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
        case "XLSX":
            return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    }
}

const groupByCategory = (docs: Documento[]) => {
    const grouped: { [key: string]: Documento[] } = {}

    docs.forEach((doc) => {
        if (!grouped[doc.categoria]) {
            grouped[doc.categoria] = []
        }
        grouped[doc.categoria].push(doc)
    })

    return grouped
}

export function DocumentosTab() {
    const groupedDocs = groupByCategory(documentos)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Documentos do Curso</CardTitle>
                    <CardDescription>Acesse regulamentos, formulários, guias e outros documentos importantes</CardDescription>
                </CardHeader>
            </Card>

            {Object.entries(groupedDocs).map(([categoria, docs]) => (
                <Card key={categoria}>
                    <CardHeader>
                        <CardTitle className="text-xl">{categoria}s</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {docs.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-muted p-3">
                                            <FileText className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <h4 className="font-semibold">{doc.nome}</h4>
                                                <Badge variant="secondary" className={getTipoColor(doc.tipo)}>
                                                    {doc.tipo}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{doc.descricao}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Atualizado em {new Date(doc.dataAtualizacao).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Baixar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
