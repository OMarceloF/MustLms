import { useState } from "react";
import { Button } from "../gestor/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../gestor/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../gestor/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../gestor/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../gestor/components/ui/alert-dialog";
import { Badge } from "../gestor/components/ui/badge";
import { FileText, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "../gestor/hooks/use-toast";
import * as React from "react"
import SidebarGestor from "../gestor/components/Sidebar";
import TopbarGestorAuto from "../gestor/components/TopbarGestorAuto";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect} from "react";

import EditorDocumento from '../gestor/components/EditorDocumento';
import { cn } from "../lib/utils"


const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

const labelBaseClasses =
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(labelBaseClasses, className)}
      {...props}
    />
  )
)
Label.displayName = "Label"

interface ContratoTemplate {
  id: string;
  nome: string;
  tipo: string;
  conteudo: string;
  numeroContrato: string;
  campos: string[];
  criadoEm: Date;
  atualizadoEm: Date;
}

const tiposContrato = [
  "Contrato de Matrícula",
  "Contrato de Funcionário", 
  "Carta de Cobrança",
  "Declaração de Conclusão",
  "Termo de Responsabilidade",
  "Contrato de Prestação de Serviços",
  "Declaração de Transferência"
];

const camposDisponiveis = [
  "{{nome}}",
  "{{cpf}}",
  "{{rg}}",
  "{{endereco}}",
  "{{telefone}}",
  "{{email}}",
  "{{valor_matricula}}",
  "{{valor_mensalidade}}",
  "{{data_primeira_mensalidade}}",
  "{{valor_material_didatico}}",
  "{{valor_uniforme}}",
  "{{descricao_desconto}}",
  "{{valor_desconto_porcentagem}}",
  "{{data_inicio_do_desconto}}",
  "{{data_fim_do_desconto}}",
  "{{curso}}",
  "{{periodo}}",
  "{{data_atual}}",
  "{{instituicao}}",
  "{{responsavel}}",
  "{{cargo_responsavel}}"
];

const Contratos = () => {
  const [templates, setTemplates] = useState<ContratoTemplate[]>([]);
  const [templateSelecionado, setTemplateSelecionado] = useState<ContratoTemplate | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [previewAberto, setPreviewAberto] = useState(false);
  const { toast } = useToast();
  const [layout, setLayout] = useState<'portrait' | 'landscape'>('portrait');

  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);

  const toggleLayout = () => {
    setLayout(prevLayout => (prevLayout === 'portrait' ? 'landscape' : 'portrait'));
  };

  // Estilos para o contêiner da página
  const pageStyles = layout === 'portrait' ? 'w-[210mm] h-[297mm]' : 'w-[297mm] h-[210mm]';

  const [formulario, setFormulario] = useState({
    nome: "",
    tipo: "",
    conteudo: "",
    numeroContrato: ""
  });

  const detectarCampos = (conteudo: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const campos: string[] = [];
    let match;
    
    while ((match = regex.exec(conteudo)) !== null) {
      const campo = `{{${match[1]}}}`;
      if (!campos.includes(campo)) {
        campos.push(campo);
      }
    }
    
    return campos;
  };

  const abrirDialogNovo = () => {
    setFormulario({ nome: "", tipo: "", conteudo: "" , numeroContrato: ""});
    setTemplateSelecionado(null);
    setModoEdicao(false);
    setDialogAberto(true);
  };

  const abrirDialogEdicao = (template: ContratoTemplate) => {
    setFormulario({
      nome: template.nome,
      tipo: template.tipo,
      conteudo: template.conteudo,
      numeroContrato: template.numeroContrato
    });
    setTemplateSelecionado(template);
    setModoEdicao(true);
    setDialogAberto(true);
  };

  const salvarTemplate = async () => {
    if (!formulario.nome || !formulario.tipo || !formulario.conteudo || !formulario.numeroContrato) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const payload = {
      nome: formulario.nome,
      tipo: formulario.tipo,
      conteudo: formulario.conteudo,
      campos: detectarCampos(formulario.conteudo),
      numeroContrato: formulario.numeroContrato
    };

    try {
      if (modoEdicao && templateSelecionado) {
        // Certifique-se que está batendo com a rota e envia pelo id!
        await axios.put(`/api/contratos/${templateSelecionado.id}`, payload);
      } else {
        await axios.post("/api/contratos", payload);
      }

      toast({
        title: "Sucesso",
        description: `Template ${modoEdicao ? 'atualizado' : 'criado'} com sucesso`
      });

      setDialogAberto(false);

      // Atualize a lista
      const { data } = await axios.get<ContratoTemplate[]>("/api/contratos");
      setTemplates(
        data.map((t) => ({
          ...t,
          criadoEm: new Date(t.criadoEm),
          atualizadoEm: new Date(t.atualizadoEm),
        }))
      );

    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao salvar no servidor",
        variant: "destructive",
      });
    }
  };

  const excluirTemplate = async (id: string) => {
    try {
      await axios.delete(`/api/contratos/${id}`);
      setTemplates((prev) => prev.filter(t => t.id !== id));
      toast({
        title: "Sucesso",
        description: "Template excluído com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir template",
        variant: "destructive"
      });
    }
  }

  const abrirPreview = (template: ContratoTemplate) => {
    setTemplateSelecionado(template);
    setPreviewAberto(true);
  };

  const inserirCampo = (campo: string) => {
    setFormulario({
      ...formulario,
      conteudo: formulario.conteudo + campo
    });
  };

  const editorConfiguration = {
    toolbar: [
      'heading', '|',
      'bold', 'italic', 'underline', '|',
      'bulletedList', 'numberedList', '|',
      'insertTable', '|',
      'imageUpload', '|',
      'blockQuote', 'undo', 'redo'
    ],
    // Adicione outras configurações conforme necessário
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await axios.get<ContratoTemplate[]>('/api/contratos');

        // Converter as datas de string para Date, se necessário
        const parsedData = data.map((t) => ({
          ...t,
          criadoEm: new Date(t.criadoEm),
          atualizadoEm: new Date(t.atualizadoEm),
        }));

        setTemplates(parsedData);
      } catch (err) {
        // Trate o erro, exiba toast, etc.
        console.error('Erro ao carregar contratos:', err);
      }
    };
    fetchTemplates();
  }, []);

  return (

    <div className="flex">
              {/* Sidebar */}
               <SidebarGestor
                isMenuOpen={sidebarAberta}
                setActivePage={(page: string) =>
                  navigate("/gestor", { state: { activePage: page } })
                }
                handleMouseEnter={() => setSidebarAberta(true)}
                handleMouseLeave={() => setSidebarAberta(false)}
              />
        
              <div className="flex-1 flex flex-col pt-20 px-6 ml-[50px] rounded-2xl shadow-md p-6">
                <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

                <div className="container mx-auto p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold">Gestão de Modelos de Documentos</h1>
                      <p className="text-muted-foreground">
                        Gerencie seus modelos com campos dinâmicos
                      </p>
                    </div>
                    
                    <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={abrirDialogNovo} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Novo Modelo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {modoEdicao ? "Editar Modelo" : "Novo Modelo de Contrato"}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="nome">Nome do Modelo</Label>
                                <Input
                                  id="nome"
                                  value={formulario.nome}
                                  onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                                  placeholder="Ex: Contrato de Matrícula Padrão"
                                />
                              </div>

                              <div>
                                <Label htmlFor="numeroContrato">Número do Contrato</Label>
                                <Input
                                  id="numeroContrato"
                                  value={formulario.numeroContrato}
                                  onChange={(e) => setFormulario({ ...formulario, numeroContrato: e.target.value })}
                                  placeholder="Ex: 1234-ABC"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="tipo">Tipo de Contrato</Label>
                                <Select value={formulario.tipo} onValueChange={(value) => setFormulario({ ...formulario, tipo: value })}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tiposContrato.map((tipo) => (
                                      <SelectItem key={tipo} value={tipo}>
                                        {tipo}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="conteudo">Conteúdo do Contrato</Label>
                              <div className={`border rounded-md overflow-hidden bg-white `}>

                                {/* <Editor
                                  apiKey="0rqmmb0bt9dy1j9jj1l2v9jwb3qsluholsfo69cu517eem4w" // pode usar sem também
                                  value={formulario.conteudo}
                                  onEditorChange={(content: string) =>
                                    setFormulario({ ...formulario, conteudo: content })
                                  }
                                  init={{
                                    height: 500,
                                    menubar: true,
                                    plugins: [
                                      'advlist autolink lists link image charmap print preview anchor',
                                      'searchreplace visualblocks code fullscreen',
                                      'insertdatetime media table paste code help wordcount'
                                    ],
                                    toolbar:
                                      'undo redo | formatselect | bold italic underline | \
                                      alignleft aligncenter alignright alignjustify | \
                                      bullist numlist outdent indent | removeformat | help',
                                    content_style:
                                      'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                  }}
                                /> */}

                                <EditorDocumento
                                  value={formulario.conteudo}
                                  onChange={(content: string) => setFormulario({ ...formulario, conteudo: content })}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" onClick={salvarTemplate}>
                                {modoEdicao ? "Atualizar" : "Criar"} Modelo
                              </Button>
                              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                                Cancelar
                              </Button>
                              {/* <Button variant="outline" onClick={toggleLayout}>
                                {layout === 'portrait' ? 'Mudar para Paisagem' : 'Mudar para Retrato'}
                              </Button> */}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold mb-2">Campos Disponíveis</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                Exemplos de campos para inserir no contrato
                              </p>
                              <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
                                {camposDisponiveis.map((campo) => (
                                  <Button
                                    key={campo}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => inserirCampo(campo)}
                                    className="justify-start h-8 text-xs"
                                  >
                                    {campo}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {formulario.conteudo && (
                              <div>
                                <h3 className="font-semibold mb-2">Campos Detectados</h3>
                                <div className="flex flex-wrap gap-1">
                                  {detectarCampos(formulario.conteudo).map((campo) => (
                                    <Badge key={campo} variant="secondary" className="text-xs">
                                      {campo}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                      <Card key={template.id} className="relative">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{template.nome}</CardTitle>
                              <Badge variant="outline" className="mt-1">
                                {template.tipo}
                              </Badge>
                              <Badge variant="outline" className="mt-1 ml-1">
                                {template.numeroContrato}
                              </Badge>
                            </div>
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {template.campos.length} campos detectados
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.campos.slice(0, 3).map((campo) => (
                                <Badge key={campo} variant="secondary" className="text-xs">
                                  {campo}
                                </Badge>
                              ))}
                              {template.campos.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{template.campos.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <p>Criado: {template.criadoEm.toLocaleDateString()}</p>
                            <p>Atualizado: {template.atualizadoEm.toLocaleDateString()}</p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirPreview(template)}
                              className="flex-1"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirDialogEdicao(template)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o modelo "{template.nome}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => excluirTemplate(template.id)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {templates.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum modelo encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Comece criando seu primeiro modelo de contrato
                      </p>
                      <Button onClick={abrirDialogNovo}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Modelo
                      </Button>
                    </div>
                  )}

                  <Dialog open={previewAberto} onOpenChange={setPreviewAberto}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Preview: {templateSelecionado?.nome}</DialogTitle>
                      </DialogHeader>
                      
                      {templateSelecionado && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{templateSelecionado.tipo}</Badge>
                            <Badge variant="outline">{templateSelecionado.numeroContrato}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {templateSelecionado.campos.length} campos
                            </span>
                          </div>
                          
                          <div className="bg-muted p-4 rounded-lg">
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: templateSelecionado.conteudo }}
                            ></div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Campos utilizados:</h4>
                            <div className="flex flex-wrap gap-1">
                              {templateSelecionado.campos.map((campo) => (
                                <Badge key={campo} variant="secondary">
                                  {campo}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

              </div>
    </div>
  );
};

export default Contratos;