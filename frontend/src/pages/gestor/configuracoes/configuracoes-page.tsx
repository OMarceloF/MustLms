//src/pages/gestor/configuracoes/configuracoes-page.tsx

"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
// import AbaFinanceiro from "../configuracoes/aba-financeiro"
import AbaEscola from "../configuracoes/aba-escola"
import AbaCores from "../configuracoes/aba-cores"
// import AbaInterface from "../configuracoes/aba-interface"
import AbaCalendario from "../configuracoes/aba-calendario"
// import AbaAdicionais from "../configuracoes/aba-adicionais"

export default function ConfiguracoesPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Configurações do Sistema</h1>
                    <p className="text-muted-foreground">Gerencie as configurações e preferências do seu LMS</p>
                </div>

                <Tabs defaultValue="financeiro" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
                        {/* <TabsTrigger value="financeiro">Financeiro</TabsTrigger> */}
                        <TabsTrigger value="escola">Escola</TabsTrigger>
                        <TabsTrigger value="cores">Cores</TabsTrigger>
                        {/* <TabsTrigger value="interface">Interface</TabsTrigger> */}
                        <TabsTrigger value="calendario">Calendário</TabsTrigger>
                        {/* <TabsTrigger value="adicionais">Adicionais</TabsTrigger> */}
                    </TabsList>
{/* 
                    <TabsContent value="financeiro">
                        <AbaFinanceiro />
                    </TabsContent> */}

                    <TabsContent value="escola">
                        <AbaEscola />
                    </TabsContent>

                    <TabsContent value="cores">
                        <AbaCores />
                    </TabsContent>
{/* 
                    <TabsContent value="interface">
                        <AbaInterface />
                    </TabsContent> */}

                    <TabsContent value="calendario">
                        <AbaCalendario />
                    </TabsContent>
{/* 
                    <TabsContent value="adicionais">
                        <AbaAdicionais />
                    </TabsContent> */}
                </Tabs>
            </div>
        </div>
    )
}