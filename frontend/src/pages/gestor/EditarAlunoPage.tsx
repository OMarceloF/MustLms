import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { 
  User, Mail, Phone, BadgeCheck, ShieldCheck, Home, Calendar, Fingerprint, 
  KeyRound, UserSquare, Users, Edit, Loader2, Save, XCircle, FileText, Download, FileSignature 
} from 'lucide-react';

// --- INTERFACES E TIPOS ---
interface AlunoData {
  nome: string;
  email: string;
  telefone: string;
  matricula: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  genero: string;
  login: string;
  foto_url: string;
  endereco: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  responsaveis: Responsavel[];
  documentos: Documento[];
  contratos: Contrato[];
}

interface Responsavel {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  grau_parentesco: string;
  responsavel_financeiro: 'Sim' | 'Não';
}

interface Documento {
    id: number;
    tipo_documento: string;
    caminho_arquivo: string;
    nome_original: string;
    data_upload: string;
}

interface Contrato {
    id: number;
    nome_contrato: string;
    situacao_contrato: string;
    contrato_url: string | null;
    criado_em: string;
}

// --- FUNÇÕES DE FORMATAÇÃO ---
const formatCPF = (value: string = ''): string => {
  const numericValue = (value || '').replace(/\D/g, '').slice(0, 11);
  return numericValue.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};
const formatTelefone = (value: string = ''): string => {
  const numericValue = (value || '').replace(/\D/g, '').slice(0, 11);
  if (numericValue.length > 10) return numericValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  return numericValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};
const formatDate = (dateString: string) => {
  if (!dateString) return 'Não informado';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
};
const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};
const formatDocumentType = (type: string) => {
    const formatted = type.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    const typeMap: { [key: string]: string } = {
        'Foto3x4': 'Foto 3x4',
        'Comprovante Residencia': 'Comprovante de Residência',
        'Documento Aluno': 'Documento do Aluno',
        'Documento Responsavel': 'Documento do Responsável',
        'Certidao Nascimento': 'Certidão de Nascimento',
        'Historico Escolar': 'Histórico Escolar',
        'Laudo Medico': 'Laudo Médico',
        'Adicionais': 'Adicional'
    };
    return typeMap[formatted] || formatted;
};

// --- SCHEMA DE VALIDAÇÃO ---
const formSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Email inválido."),
  telefone: z.string().optional(),
  cpf: z.string().min(14, "CPF inválido."),
  rg: z.string().optional(),
  data_nascimento: z.string().min(1, "A data de nascimento é obrigatória."),
  genero: z.string().optional(),
  login: z.string().min(3, "O login deve ter pelo menos 3 caracteres."),
  senha: z.string().optional().refine(val => !val || val.length >= 6, { message: "A nova senha deve ter pelo menos 6 caracteres." }),
  "endereco.cep": z.string().optional(),
  "endereco.logradouro": z.string().optional(),
  "endereco.numero": z.string().optional(),
  "endereco.complemento": z.string().optional(),
  "endereco.bairro": z.string().optional(),
  "endereco.cidade": z.string().optional(),
  "endereco.estado": z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

// --- COMPONENTES AUXILIARES ---
const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined | null }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{label}</p>
    <p className="text-sm font-medium text-gray-800 mt-1">{value || 'Não informado'}</p>
  </div>
);
const CardSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="p-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-800">{title}</h3></div>
    <div className="p-6">{children}</div>
  </div>
);
const FormInput = ({ label, id, error, ...props }: any) => (
    <div>
        <label htmlFor={id} className="block text-xs font-medium text-gray-600">{label}</label>
        <input id={id} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" {...props} />
        {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
    </div>
);
const FileItem = ({ icon: Icon, label, fileName, filePath }: { icon: React.ElementType, label: string, fileName: string, filePath: string }) => (
    <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-4 hover:bg-gray-50">
        <div className="flex items-center gap-3 overflow-hidden">
            <Icon className="h-6 w-6 text-gray-500 flex-shrink-0" />
            <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-700 truncate">{label}</p>
                <p className="text-xs text-gray-500 truncate">{fileName}</p>
            </div>
        </div>
        <a 
            href={filePath} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex-shrink-0"
        >
            <Download className="h-3.5 w-3.5" />
            Ver
        </a>
    </div>
);

// --- COMPONENTE PRINCIPAL ---
const EditarAlunoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [aluno, setAluno] = useState<AlunoData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/alunos/${id}/edit-data`);
        setAluno(response.data);
        setPreviewUrl(response.data.foto_url || '');
      } catch (err) {
        setError('Não foi possível carregar os dados do aluno.');
        toast.error('Falha ao carregar dados do aluno.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleEditToggle = () => {
    if (!isEditing && aluno) {
      reset({
        nome: aluno.nome,
        email: aluno.email,
        login: aluno.login,
        cpf: formatCPF(aluno.cpf),
        rg: aluno.rg,
        telefone: formatTelefone(aluno.telefone),
        data_nascimento: formatDateForInput(aluno.data_nascimento),
        genero: aluno.genero,
        "endereco.cep": aluno.endereco?.cep,
        "endereco.logradouro": aluno.endereco?.logradouro,
        "endereco.numero": aluno.endereco?.numero,
        "endereco.complemento": aluno.endereco?.complemento,
        "endereco.bairro": aluno.endereco?.bairro,
        "endereco.cidade": aluno.endereco?.cidade,
        "endereco.estado": aluno.endereco?.estado,
        senha: '',
      });
    } else if (isEditing && aluno) {
      setFotoFile(null);
      setPreviewUrl(aluno.foto_url || '');
    }
    setIsEditing(!isEditing);
  };

  const onSubmit = async (data: FormValues) => {
    if (!aluno) return;
    setIsSaving(true);
    const formPayload = new FormData();
    
    const endereco = { cep: data["endereco.cep"], logradouro: data["endereco.logradouro"], numero: data["endereco.numero"], complemento: data["endereco.complemento"], bairro: data["endereco.bairro"], cidade: data["endereco.cidade"], estado: data["endereco.estado"] };
    formPayload.append('endereco', JSON.stringify(endereco));

    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith('endereco.')) return;
      if (key === 'senha' && !value) return;
      let finalValue = (['cpf', 'telefone'].includes(key)) ? String(value || '').replace(/\D/g, '') : value;
      if (finalValue !== null && finalValue !== undefined) formPayload.append(key, String(finalValue));
    });

    if (fotoFile) formPayload.append('foto', fotoFile);

    try {
      const response = await axios.put(`/api/alunos/${id}`, formPayload, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      const updatedAlunoData = {
        ...aluno,
        ...data,
        cpf: String(data.cpf).replace(/\D/g, ''),
        telefone: String(data.telefone).replace(/\D/g, ''),
        endereco,
        foto_url: response.data.fotoUrl || aluno.foto_url,
      };
      setAluno(updatedAlunoData);
      setPreviewUrl(response.data.fotoUrl || previewUrl);
      
      toast.success('Dados atualizados com sucesso!');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error || !aluno) return <div className="m-6 p-6 text-center text-red-700 bg-red-100 rounded-lg">{error || 'Aluno não encontrado.'}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarGestor isMenuOpen={sidebarAberta} setActivePage={(page) => navigate(`/gestor/${page}`)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
        <main className="flex-1 p-4 md:p-6 mt-16">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-6xl mx-auto space-y-8">
            
            {/* CABEÇALHO */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <img src={previewUrl || '/placeholder-avatar.png'} alt={`Foto de ${aluno.nome}`} className="h-28 w-28 object-cover rounded-full border-4 border-white shadow-md" />
                {isEditing && (
                    <label className="absolute -bottom-2 -right-2 cursor-pointer bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                        <Edit className="h-4 w-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) { setFotoFile(file); setPreviewUrl(URL.createObjectURL(file)); }
                        }} />
                    </label>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{isEditing ? 'Editando Perfil' : aluno.nome}</h1>
                <p className="text-md text-gray-500 mt-1">Matrícula: {aluno.matricula}</p>
              </div>
              {!isEditing ? (
                <button type="button" onClick={handleEditToggle} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                  <Edit className="h-4 w-4" /> Editar Cadastro
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button type="button" onClick={handleEditToggle} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                    <XCircle className="h-4 w-4" /> Cancelar
                  </button>
                  <button type="submit" disabled={isSaving} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
                  </button>
                </div>
              )}
            </div>

            {/* SEÇÕES DE DADOS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* INFORMAÇÕES PESSOAIS */}
                <CardSection title="Informações Pessoais">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {isEditing ? (
                      <>
                        <div className="md:col-span-3"><FormInput label="Nome Completo" id="nome" {...register("nome")} error={errors.nome} /></div>
                        <FormInput label="Data de Nascimento" id="data_nascimento" type="date" {...register("data_nascimento")} error={errors.data_nascimento} />
                        <FormInput label="CPF" id="cpf" {...register("cpf", { onChange: (e) => e.target.value = formatCPF(e.target.value) })} error={errors.cpf} />
                        <FormInput label="RG" id="rg" {...register("rg")} />
                        <FormInput label="Email" id="email" type="email" {...register("email")} error={errors.email} />
                        <FormInput label="Telefone" id="telefone" {...register("telefone", { onChange: (e) => e.target.value = formatTelefone(e.target.value) })} />
                        <div>
                            <label htmlFor="genero" className="block text-xs font-medium text-gray-600">Gênero</label>
                            <select id="genero" {...register("genero")} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <InfoItem icon={User} label="Nome Completo" value={aluno.nome} />
                        <InfoItem icon={Calendar} label="Data de Nascimento" value={formatDate(aluno.data_nascimento)} />
                        <InfoItem icon={UserSquare} label="Gênero" value={aluno.genero} />
                        <InfoItem icon={Fingerprint} label="CPF" value={formatCPF(aluno.cpf)} />
                        <InfoItem icon={Fingerprint} label="RG" value={aluno.rg} />
                        <InfoItem icon={BadgeCheck} label="Matrícula" value={aluno.matricula} />
                        <InfoItem icon={Mail} label="Email" value={aluno.email} />
                        <InfoItem icon={Phone} label="Telefone" value={formatTelefone(aluno.telefone)} />
                      </>
                    )}
                  </div>
                </CardSection>

                {/* ENDEREÇO */}
                <CardSection title="Endereço">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {isEditing ? (
                        <>
                          <FormInput label="CEP" id="endereco.cep" {...register("endereco.cep")} />
                          <div className="md:col-span-2"><FormInput label="Logradouro" id="endereco.logradouro" {...register("endereco.logradouro")} /></div>
                          <FormInput label="Número" id="endereco.numero" {...register("endereco.numero")} />
                          <FormInput label="Bairro" id="endereco.bairro" {...register("endereco.bairro")} />
                          <FormInput label="Cidade" id="endereco.cidade" {...register("endereco.cidade")} />
                          <FormInput label="UF" id="endereco.estado" {...register("endereco.estado")} />
                          <div className="md:col-span-3"><FormInput label="Complemento" id="endereco.complemento" {...register("endereco.complemento")} /></div>
                        </>
                    ) : (
                        <>
                          <InfoItem icon={Home} label="CEP" value={aluno.endereco?.cep} />
                          <div className="sm:col-span-2"><InfoItem icon={Home} label="Logradouro" value={aluno.endereco?.logradouro} /></div>
                          <InfoItem icon={Home} label="Número" value={aluno.endereco?.numero} />
                          <InfoItem icon={Home} label="Bairro" value={aluno.endereco?.bairro} />
                          <InfoItem icon={Home} label="Cidade" value={aluno.endereco?.cidade} />
                          <InfoItem icon={Home} label="UF" value={aluno.endereco?.estado} />
                          {aluno.endereco?.complemento && <div className="sm:col-span-3"><InfoItem icon={Home} label="Complemento" value={aluno.endereco.complemento} /></div>}
                        </>
                    )}
                  </div>
                </CardSection>
              </div>

              {/* COLUNA DIREITA */}
              <div className="space-y-8">
                {/* ACESSO AO SISTEMA */}
                <CardSection title="Acesso ao Sistema">
                    <div className="space-y-6">
                        {isEditing ? (
                            <>
                                <FormInput label="Login de Acesso" id="login" {...register("login")} error={errors.login} />
                                <FormInput label="Nova Senha" id="senha" type="password" placeholder="Deixe em branco para não alterar" {...register("senha")} error={errors.senha} />
                            </>
                        ) : (
                            <>
                                <InfoItem icon={User} label="Login de Acesso" value={aluno.login} />
                                <InfoItem icon={KeyRound} label="Senha" value="•••••••• (oculta por segurança)" />
                            </>
                        )}
                    </div>
                </CardSection>

                {/* ======================================================================= */}
                {/* MODIFICAÇÃO 5: Nova seção para exibir documentos */}
                {/* ======================================================================= */}
                <CardSection title="Documentos Enviados">
                    {aluno.documentos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {aluno.documentos.map(doc => (
                                <FileItem 
                                    key={doc.id}
                                    icon={FileText}
                                    label={formatDocumentType(doc.tipo_documento)}
                                    fileName={doc.nome_original}
                                    filePath={doc.caminho_arquivo}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-gray-500 py-4">Nenhum documento encontrado.</p>
                    )}
                </CardSection>
              </div>
            </div>
            
            {/* RESPONSÁVEIS VINCULADOS */}
            <CardSection title="Responsáveis Vinculados">
              {aluno.responsaveis.length > 0 ? (
                <div className="space-y-4">
                  {aluno.responsaveis.map((resp) => (
                    <div key={resp.id} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row items-start gap-4">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center"><User className="h-6 w-6 text-gray-500" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">{resp.nome}</p>
                          {resp.responsavel_financeiro === 'Sim' && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium"><ShieldCheck className="h-3 w-3" /> Financeiro</span>}
                        </div>
                        <p className="text-sm text-gray-600">{resp.grau_parentesco}</p>
                        <div className="mt-2 flex flex-col sm:flex-row flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {resp.email || 'N/A'}</span>
                          <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {formatTelefone(resp.telefone)}</span>
                          <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4" /> CPF: {formatCPF(resp.cpf)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center text-gray-500 py-4">Nenhum responsável vinculado a este aluno.</p>}
            </CardSection>

            {/* ======================================================================= */}
            {/* MODIFICAÇÃO 6: Nova seção para exibir contratos */}
            {/* ======================================================================= */}
            <CardSection title="Contratos Vinculados">
                {aluno.contratos.length > 0 ? (
                    <div className="space-y-3">
                        {aluno.contratos.map(cont => (
                            <FileItem
                                key={cont.id}
                                icon={FileSignature}
                                label={cont.nome_contrato}
                                fileName={`Situação: ${cont.situacao_contrato} - Criado em: ${formatDate(cont.criado_em)}`}
                                filePath={cont.contrato_url || '#'}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-sm text-gray-500 py-4">Nenhum contrato encontrado.</p>
                )}
            </CardSection>

          </form>
        </main>
      </div>
    </div>
  );
};

export default EditarAlunoPage;
