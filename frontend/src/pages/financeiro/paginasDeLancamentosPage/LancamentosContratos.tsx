import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../../gestor/components/ui/dialog";
import { AutocompleteAluno } from "../components/AutocompleteAluno"; 
import { toast } from "sonner";

interface ContratoPreenchido {
  id: number;
  contrato_id: number;
  aluno_id: number;
  dados_preenchidos: Record<string, string>;
  contrato_url: string | null;
  criado_em: string;
  atualizado_em: string;
  situacao_contrato: string;
  nome_contrato:string;
  numero_contrato: string;
  aluno_nome: string;
  aluno_status: string;
  aluno_cpf: string;
  aluno_serie: string;
  aluno_turma: string;
  mensalidade_valor: string;
  mensalidade_data_inicial: string;
}

interface LancamentosContratosProps {
  alunos:any | null;
  buscaTexto: string;
  setBuscaTexto: React.Dispatch<React.SetStateAction<string>>;
  abrirGerarContrato: boolean;
  setAbrirGerarContrato: React.Dispatch<React.SetStateAction<boolean>>;
  modeloSelecionado: any | null;
  setModeloSelecionado: React.Dispatch<React.SetStateAction<any | null>>;
  dadosPreenchidos: { [campo: string]: string };
  setDadosPreenchidos: React.Dispatch<React.SetStateAction<{ [campo: string]: string }>>;
  contratoUrl: string;
  setContratoUrl: React.Dispatch<React.SetStateAction<string>>;
  formEdicao: {
    dados_preenchidos: { [key: string]: string };
    contrato_url: string;
    situacao_contrato: string;
  };
  setFormEdicao: React.Dispatch<React.SetStateAction<{
    dados_preenchidos: { [key: string]: string };
    contrato_url: string;
    situacao_contrato: string;
  }>>;
  alunoSelecionado: string;
  setAlunoSelecionado: React.Dispatch<React.SetStateAction<string>>;
  modalEdicaoAberto: boolean;
  setModalEdicaoAberto: React.Dispatch<React.SetStateAction<boolean>>;
  previewHtml: string | null;
  setPreviewHtml: React.Dispatch<React.SetStateAction<string | null>>;
  modalPreviewAberto: boolean;
  setModalPreviewAberto: React.Dispatch<React.SetStateAction<boolean>>;
  contratosPreenchidos: any[];
  setContratosPreenchidos: React.Dispatch<React.SetStateAction<any[]>>;
  contratoPreenchidoSelecionado: any | null;
  setContratoPreenchidoSelecionado: React.Dispatch<React.SetStateAction<any | null>>;
  templates: any[];
  fetchContratosPreenchidos: () => Promise<void>;
  abrirModalEdicao: (item: any) => void;
  excluirContratoPreenchido: (id: string) => Promise<void>;
  imprimirContratoPreenchido: (item: any) => Promise<void>;
  abrirPreviewContrato: (id: string) => Promise<void>;
}

const LancamentosContratos: React.FC<LancamentosContratosProps> = ({
  alunos,
  buscaTexto,
  setBuscaTexto,
  abrirGerarContrato,
  setAbrirGerarContrato,
  modeloSelecionado,
  setModeloSelecionado,
  dadosPreenchidos,
  setDadosPreenchidos,
  contratoUrl,
  setContratoUrl,
  formEdicao,
  setFormEdicao,
  alunoSelecionado,
  setAlunoSelecionado,
  modalEdicaoAberto,
  setModalEdicaoAberto,
  previewHtml,
  setPreviewHtml,
  modalPreviewAberto,
  setModalPreviewAberto,
  contratosPreenchidos,
  setContratosPreenchidos,
  contratoPreenchidoSelecionado,
  setContratoPreenchidoSelecionado,
  templates,
  fetchContratosPreenchidos,
  abrirModalEdicao,
  excluirContratoPreenchido,
  imprimirContratoPreenchido,
  abrirPreviewContrato,
}) => {
  // Filtro local para buscaTexto
  const contratosFiltrados = contratosPreenchidos.filter(item => {
    const texto = buscaTexto.toLowerCase();
    return (
      (item.numero_contrato?.toLowerCase().includes(texto)) ||
      (item.aluno_nome?.toLowerCase().includes(texto)) ||
      (item.situacao_contrato?.toLowerCase().includes(texto)) ||
      (item.aluno_serie?.toLowerCase().includes(texto)) ||
      (item.aluno_turma?.toLowerCase().includes(texto)) ||
      (item.aluno_cpf?.toLowerCase().includes(texto))
    );
  });
  const [contratoSelecionado, setContratoSelecionado] = useState<ContratoPreenchido | null>(null);
  // Estado para armazenar o ID do contrato para upload atual
  const [uploadContratoId, setUploadContratoId] = useState<number | null>(null);
  // Ref para o input file oculto
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [valorInput, setValorInput] = useState('');
  const [inputMonetarios, setInputMonetarios] = useState<{ [key: string]: string }>({});

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Salva valor formatado no estado
    const formattedValue = formatarMoedaParaInput(rawValue);

    setValorInput(formattedValue);
  };


  const handleAbrirUpload = (id: number) => {
    setUploadContratoId(id);
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
      inputFileRef.current.click();
    }
  };

  const handleMonetarioChange = (campo: string, value: string) => {
    const formattedValue = formatarMoedaParaInput(value);

    // Atualizar os dois estados: input controlado local e estado global de dados
    setInputMonetarios((prev) => ({
      ...prev,
      [campo]: formattedValue,
    }));

    setDadosPreenchidos((prev) => ({
      ...prev,
      [campo]: formattedValue,
    }));
  };

  const formatarMesAno = (valor: string) => {
    if (!valor) return "—";
    // valor ex: "2025-08"
    const [ano, mes] = valor.split("-");
    if (!ano || !mes) return valor;
    return `${mes}/${ano}`;
  };

  const formatarCpfInput = (valor: string) => {
    // Remove tudo que não for dígito
    let cpf = valor.replace(/\D/g, '');
    // Limita a 11 dígitos (sem pontuação)
    cpf = cpf.slice(0, 11);

    // Monta a máscara
    if (cpf.length <= 3) return cpf;
    if (cpf.length <= 6) return cpf.replace(/(\d{3})(\d+)/, '$1.$2');
    if (cpf.length <= 9) return cpf.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  };

  const CAMPOS_DATA_MONTH = [
    "data_primeira_mensalidade",
    "data_inicio_do_desconto",
    "data_fim_do_desconto",
  ];

  const buscarContratosPreenchidos = async () => {
    try {
      const res = await axios.get<ContratoPreenchido[]>(`/api/contratos_preenchidos`);
      setContratosPreenchidos(res.data);
    } catch (err) {
      console.error("Erro ao buscar contratos preenchidos", err);
    }
  };

  // Função que formata um número para moeda brasileira com vírgula
  const formatarMoedaParaInput = (value: string) => {
    // Remove tudo que não for número
    const numeros = value.replace(/\D/g, '');

    if (!numeros) return '';

    // Converte em número float
    const valorInt = parseInt(numeros, 10);

    if (isNaN(valorInt)) return '';

    // Divide valor em reais e centavos separando via substring
    const reais = Math.floor(valorInt / 100);
    let centavos = valorInt % 100;

    // Garantir centavos em duas casas
    let centavosStr = centavos.toString();
    if (centavos < 10) centavosStr = '0' + centavosStr;

    // Formata reais com pontos de milhar
    const reaisFormatado = reais.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${reaisFormatado},${centavosStr}`;
  };


  const formatarValorMonetarioInput = (valor: string) => {
    // Remove qualquer caractere que não seja número ou vírgula
    let somenteNumeros = valor.replace(/[^0-9,]/g, '');

    // Substitui vírgulas duplicadas por uma única
    const partes = somenteNumeros.split(',');
    if (partes.length > 2) {
      somenteNumeros = partes[0] + ',' + partes.slice(1).join('');
    }

    // Remove pontos (caso o usuário digite)
    somenteNumeros = somenteNumeros.replace(/\./g, '');

    // Para facilitar, substitui vírgula por ponto e tenta converter para número flutuante
    let numero = parseFloat(somenteNumeros.replace(',', '.'));

    if (isNaN(numero)) {
      return '';
    }

    // Formata número com as casas decimais
    // Aqui você pode usar Intl.NumberFormat para formato BR ou manualmente
    return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const camposMonetarios = [
    "valor_matricula",
    "valor_mensalidade",
    "valor_material_didatico",
    "valor_uniforme"
  ];

  // Função para enviar arquivo ao backend
  const handleUploadArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !uploadContratoId) return;
    const arquivo = e.target.files[0];
    const formData = new FormData();
    formData.append('contrato', arquivo);

    try {
      await axios.put(`/api/contratos_preenchidos/${uploadContratoId}/upload-contrato`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Contrato assinado enviado com sucesso!');
      setUploadContratoId(null);
      await fetchContratosPreenchidos();
    } catch {
      toast.error('Erro ao enviar arquivo');
    }
  };

  function obterValorCampo(campo: string) {
    const chave = `{{${campo}}}`;
    if (!contratoSelecionado) return "-";
    const valor = contratoSelecionado.dados_preenchidos[chave];
    return valor ?? "-";
  }

  function obterValorCampoDoContrato(contrato: ContratoPreenchido | null, campo: string) {
    if (!contrato) return "-";
    const chave = `{{${campo}}}`;
    return contrato.dados_preenchidos[chave] ?? "-";
  }


  useEffect(() => {
      buscarContratosPreenchidos();
    }, []);

  

  return (
    <div className="p-6">
      {/* Busca e botão */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="w-full">
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={buscaTexto}
            onChange={e => setBuscaTexto(e.target.value)}
            className="px-3 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setAbrirGerarContrato(true)}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Gerar Novo Contrato
          </button>
        </div>
      </div>

      {abrirGerarContrato && (
        <Dialog open={abrirGerarContrato} onOpenChange={setAbrirGerarContrato}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" aria-describedby="descricao-dialogo">
            <DialogHeader>
              <DialogTitle>Gerar Novo Contrato</DialogTitle>
              <DialogDescription>
                Preencha o formulário abaixo para gerar um novo contrato.
              </DialogDescription>
            </DialogHeader>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Modelo do Contrato</label>
              <select
                className="border rounded w-full p-2"
                value={modeloSelecionado?.id || ""}
                onChange={(e) => {
                  const id = e.target.value;
                  const modelo = templates.find((t) => t.id === id) || null;
                  setModeloSelecionado(modelo);
                  setDadosPreenchidos({});
                }}
              >
                <option value="">Selecione um modelo</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            

            {/* Form geração contrato */}
            {modeloSelecionado && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const todosPreenchidos = modeloSelecionado.campos.every(
                    (campo: string) => dadosPreenchidos[campo]?.trim() !== ""
                  );
                  if (!todosPreenchidos) {
                    toast.error("Preencha todos os campos");
                    return;
                  }
                  try {
                    await axios.post("/api/contratos_preenchidos", {
                      contrato_id: modeloSelecionado.id,
                      aluno_id: alunoSelecionado,
                      dados_preenchidos: dadosPreenchidos,
                      contrato_url: contratoUrl || null,
                      situacao_contrato: 'Vigente',
                    });
                    toast.success("Contrato gerado com sucesso!");
                    setAbrirGerarContrato(false);
                    await fetchContratosPreenchidos();
                  } catch (error) {
                    toast.error("Erro ao gerar contrato");
                    console.error(error);
                  }
                }}
                className="space-y-4"
              >

                {modeloSelecionado.campos.map((campo: string) => {
  const nomeCampoPuro = campo.replace(/^\{\{|\}\}$/g, "");
  const isDataMesAno = CAMPOS_DATA_MONTH.includes(nomeCampoPuro);
  const isCpfCampo = nomeCampoPuro === "cpf";
  const isMonetario = camposMonetarios.includes(nomeCampoPuro);

  return (
    <div key={campo}>
      <label className="block mb-1 font-medium">{campo}</label>
      {isDataMesAno ? (
        <input
          type="month"
          className="border rounded w-full p-2"
          value={dadosPreenchidos[campo] || ""}
          onChange={(e) =>
            setDadosPreenchidos((prev) => ({
              ...prev,
              [campo]: e.target.value,
            }))
          }
          required
        />
      ) : isCpfCampo ? (
          <input
            type="text"
            className="border rounded w-full p-2"
            value={dadosPreenchidos[campo] || ""}
            onChange={e =>
              setDadosPreenchidos(prev => ({
                ...prev,
                [campo]: formatarCpfInput(e.target.value),
              }))
            }
            required
            placeholder="000.000.000-00"
            maxLength={14}
          />

          ) : isMonetario ? (
        <input
          key={campo}
          type="text"
          className="border rounded w-full p-2 text-right"
          value={inputMonetarios[campo] ?? dadosPreenchidos[campo] ?? ''}
          onChange={(e) => handleMonetarioChange(campo, e.target.value)}
          maxLength={15}
          placeholder="0,00"
          inputMode="decimal"
          required
        />
        ) : (
        <input
          type="text"
          className="border rounded w-full p-2"
          value={dadosPreenchidos[campo] || ""}
          onChange={(e) =>
            setDadosPreenchidos((prev) => ({
              ...prev,
              [campo]: e.target.value,
            }))
          }
          required
        />
      )}
    </div>
  );
})}

                 <div>
                    <label className="block mb-1 font-medium">Selecione um aluno para vincular ao contrato</label>
                    <AutocompleteAluno
                      alunos={alunos}
                      value={alunoSelecionado}
                      onChange={setAlunoSelecionado}
                    />
                  </div>

                <label className="block mb-1 font-medium">
                  Selecione a situação atual do contrato
                </label>
                <select
                  className="border rounded w-full p-2"
                  value={formEdicao.situacao_contrato}
                  onChange={(e) =>
                    setFormEdicao((prev) => ({
                      ...prev,
                      situacao_contrato: e.target.value,
                    }))
                  }
                >
                  <option value="Vigente">Vigente</option>
                  <option value="Cancelado">Cancelado</option>
                  <option value="Suspenso">Suspenso</option>
                  <option value="Finalizado">Finalizado</option>
                </select>

                {/* <div>
                  <label className="block mb-1 font-medium">
                    URL do Contrato Assinado (opcional)
                  </label>
                  <input
                    type="text"
                    className="border rounded w-full p-2"
                    value={contratoUrl}
                    onChange={(e) => setContratoUrl(e.target.value)}
                    placeholder="Cole a URL do contrato assinado aqui"
                  />
                </div> */}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAbrirGerarContrato(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Gerar Contrato
                  </button>
                </div>
              </form>
            )}


          </DialogContent>
        </Dialog>
      )}

      {/* Modal de edição */}
      <Dialog open={modalEdicaoAberto} onOpenChange={setModalEdicaoAberto}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar Contrato Preenchido #{contratoPreenchidoSelecionado?.id}
            </DialogTitle>
          </DialogHeader>

          {contratoPreenchidoSelecionado && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await axios.put(
                    `/api/contratos_preenchidos/${contratoPreenchidoSelecionado.id}`,
                    {
                      dados_preenchidos: formEdicao.dados_preenchidos,
                      aluno_id: alunoSelecionado,
                      contrato_url: formEdicao.contrato_url || null,
                      situacao_contrato: formEdicao.situacao_contrato,
                    }
                  );
                  toast.success("Contrato atualizado com sucesso!");
                  setModalEdicaoAberto(false);
                  await fetchContratosPreenchidos();
                } catch (error) {
                  toast.error("Erro ao atualizar contrato");
                  console.error(error);
                }
              }}
              className="space-y-4"
            >
              {Object.entries(formEdicao.dados_preenchidos).map(([campo, valor]) => (
                <div key={campo}>
                  <label className="block mb-1 font-medium">{campo}</label>
                  <input
                    type="text"
                    className="border rounded w-full p-2"
                    value={valor}
                    onChange={(e) =>
                      setFormEdicao((prev) => ({
                        ...prev,
                        dados_preenchidos: { ...prev.dados_preenchidos, [campo]: e.target.value },
                      }))
                    }
                    required
                  />
                </div>
              ))}


              <div>
                <label className="block mb-1 font-medium">
                  Selecione um aluno para vincular ao contrato
                </label>
                <AutocompleteAluno
                  alunos={alunos}
                  value={alunoSelecionado}
                  onChange={setAlunoSelecionado}
                />
              </div>

              <label className="block mb-1 font-medium">
                Selecione a situação atual do contrato
              </label>
              <select
                className="border rounded w-full p-2"
                value={formEdicao.situacao_contrato}
                onChange={(e) =>
                  setFormEdicao((prev) => ({ ...prev, situacao_contrato: e.target.value }))
                }
              >
                <option value="Vigente">Vigente</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Finalizado">Finalizado</option>
              </select>

              <div>
                <label className="block mb-1 font-medium">URL do Contrato Assinado (opcional)</label>
                <input
                  type="text"
                  className="border rounded w-full p-2"
                  value={formEdicao.contrato_url}
                  onChange={(e) => setFormEdicao({ ...formEdicao, contrato_url: e.target.value })}
                  placeholder="Cole a URL do contrato assinado aqui"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalEdicaoAberto(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de preview */}
      <Dialog open={modalPreviewAberto} onOpenChange={setModalPreviewAberto}>
        <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-auto mt-12">
          <div
            className="bg-white p-8 shadow-md"
            style={{
              width: '21cm',
              minHeight: '29.7cm',
              margin: 'auto',
              boxShadow: '0 0 10px rgba(0,0,0,0.3)',
              overflowY: 'auto',
              fontFamily: 'Times New Roman, serif',
              fontSize: '12pt',
              lineHeight: '1.4',
            }}
            dangerouslySetInnerHTML={{ __html: previewHtml || "" }}
          />
        </DialogContent>
      </Dialog>

      {/* Tabela */}
      <div className="mt-6">
        <h4 className="text-md font-semibold mb-2">Lista de Contratos e Documentos Gerados</h4>
        <table className="w-full border text-sm bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Nº Contrato</th>
              <th className="border px-2 py-1">Situação</th>
              <th className="border px-2 py-1">Pessoa Vinculada</th>
              <th className="border px-2 py-1">CPF</th>
              <th className="border px-2 py-1">Série - Turma</th>
              <th className="border px-2 py-1">Mensalidade</th>
              <th className="border px-2 py-1">Data Inicial da Mensalidade</th>
              <th className="border px-2 py-1">Operações</th>
            </tr>
          </thead>
          <tbody>
            {contratosPreenchidos.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-4">
                  Nenhum contrato gerado encontrado.
                </td>
              </tr>
            )}
            {contratosFiltrados.map((item) => (
              <tr key={item.id}>
                <td className="border px-2 py-1">{item.numero_contrato || '—'}</td>
                <td className="border px-2 py-1">{item.situacao_contrato || '—'}</td>
                <td className="border px-2 py-1">{item.aluno_nome || '—'}</td>
                <td className="border px-2 py-1">{obterValorCampoDoContrato(item, "cpf")}</td>
                <td className="border px-2 py-1">{(item.aluno_serie || '') + ' - ' + (item.aluno_turma || '') || '—'}</td>
                <td className="border px-2 py-1">
                  {(() => {
                    const valor = obterValorCampoDoContrato(item, "valor_mensalidade");
                    if (!valor || valor === "-" || valor === "") return "—";
                    // Formata valor monetário com 'R$' e vírgula decimal
                    const num = Number(valor.replace(",", "."));
                    if (isNaN(num)) return valor; // Caso não seja número
                    return `R$ ${num.toFixed(2).replace(".", ",")}`;
                  })()}
                </td>
                <td className="border px-2 py-1">{formatarMesAno(obterValorCampoDoContrato(item, "data_primeira_mensalidade"))}</td>
                <td className="border px-2 py-1">
                  <button
                    onClick={() => abrirModalEdicao(item)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluirContratoPreenchido(item.id)}
                    className="text-red-600 hover:underline mr-3"
                  >
                    Excluir
                  </button>
                  <button
                    onClick={() => imprimirContratoPreenchido(item)}
                    className="text-gray-600 hover:underline mr-3"
                  >
                    Imprimir
                  </button>

                  <button
                    onClick={() => handleAbrirUpload(item.id)}
                    className="text-green-600 hover:underline mr-3"
                    title="Enviar contrato assinado"
                  >
                    Enviar Contrato Assinado
                  </button>

                  {/* Input file escondido */}
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    style={{ display: 'none' }}
                    ref={inputFileRef}
                    onChange={handleUploadArquivo}
                  />

                  <button onClick={() => 
                  window.open(`/${item.contrato_url}`, '_blank')} 
                  className="text-purple-600 hover:underline" title="Visualizar contrato assinado"
                  >
                    Visualizar Contrato Assinado
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LancamentosContratos;
