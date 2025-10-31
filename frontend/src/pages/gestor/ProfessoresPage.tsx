import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Search,
  Filter,
  Eye,
  Settings,
  Trash,
  UserPlus,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../gestor/components/ui/button'

interface Funcionario {
  id: string
  nome: string
  email: string
  login: string
  role: string
  cargo?: string
  departamento?: string
  foto?: string
  created_at: string
}

function getSafeImagePath(path: string): string | null {
  const regex = /^\/uploads\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i
  return regex.test(path) ? path : null
}

const ProfessoresPage = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [filteredFuncionarios, setFilteredFuncionarios] = useState<Funcionario[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Funcionario | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' })
  const [filterCargo, setFilterCargo] = useState('')
  const [filterDepartamento, setFilterDepartamento] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        setIsLoading(true)
        const { data } = await axios.get('/api/listar_funcionarios')
        setFuncionarios(data)
        setFilteredFuncionarios(data)
      } catch (err) {
        console.error('Erro ao buscar professores:', err)
        toast.error('Erro ao carregar os dados dos professores.')
        setError('Erro ao carregar professores.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchFuncionarios()
  }, [])

  // 🔍 Filtros e ordenação
  useEffect(() => {
    let result = [...funcionarios]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(f =>
        (f.nome?.toLowerCase() ?? '').includes(term) ||
        (f.email?.toLowerCase() ?? '').includes(term) ||
        (f.cargo?.toLowerCase() ?? '').includes(term)
      )
    }

    if (filterCargo) result = result.filter(f => f.cargo === filterCargo)
    if (filterDepartamento) result = result.filter(f => f.departamento === filterDepartamento)

    if (sortConfig.key && sortConfig.key !== 'foto') {
      const key = sortConfig.key
      result.sort((a, b) => {
        const aVal = a[key] ?? ''
        const bVal = b[key] ?? ''
        return sortConfig.direction === 'ascending'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal))
      })
    }

    setFilteredFuncionarios(result)
  }, [funcionarios, searchTerm, filterCargo, filterDepartamento, sortConfig])

  const handleSort = (key: keyof Funcionario) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }))
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/professores/${id}`)
      setFuncionarios(prev => prev.filter(f => f.id !== id))
      toast.success('Professor removido com sucesso!')
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error('Erro ao excluir professor:', err)
      toast.error('Erro ao excluir professor.')
    }
  }

  const uniqueCargos = [...new Set(funcionarios.map(f => f.cargo).filter(Boolean))]
  const uniqueDepartamentos = [...new Set(funcionarios.map(f => f.departamento).filter(Boolean))]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive font-medium">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-card p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
              Gerenciamento de Funcionários
            </h1>
            <p className="mt-2 text-pretty text-muted-foreground">
              Visualize, filtre e gerencie os funcionários cadastrados no sistema.
            </p>
          </div>

          {/* Actions Bar */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nome, cargo ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button onClick={() => navigate('/gestor/criarProfessor')} className="gap-2">
                <UserPlus className="size-4" />
                Adicionar Novo Funcionário
              </Button>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1 sm:max-w-xs">
                <Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={filterCargo}
                  onChange={(e) => setFilterCargo(e.target.value)}
                  className="w-full appearance-none rounded-lg border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Filtrar por Cargo</option>
                  {uniqueCargos.map((cargo) => (
                    <option key={cargo} value={cargo}>{cargo}</option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1 sm:max-w-xs">
                <Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={filterDepartamento}
                  onChange={(e) => setFilterDepartamento(e.target.value)}
                  className="w-full appearance-none rounded-lg border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Filtrar por Departamento</option>
                  {uniqueDepartamentos.map((dep) => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabela / Cards */}
          {filteredFuncionarios.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">Nenhum funcionário encontrado com os filtros atuais.</p>
            </div>
          ) : (
            <>
              {/* Tabela para telas grandes */}
              <div className="hidden lg:block overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Foto</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted" onClick={() => handleSort('nome')}>Nome</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted" onClick={() => handleSort('cargo')}>Cargo</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted" onClick={() => handleSort('departamento')}>Departamento</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredFuncionarios.map((f) => (
                      <tr key={f.id} className="hover:bg-muted/50">
                        <td className="p-4">
                          <div className="size-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                            {f.foto && getSafeImagePath(f.foto) ? (
                              <img
                                src={`${import.meta.env.VITE_API_URL}${encodeURI(f.foto)}`}
                                alt={f.nome}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-primary">
                                {f.nome.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-foreground">{f.nome}</td>
                        <td className="p-4 text-muted-foreground">{f.cargo || '—'}</td>
                        <td className="p-4 text-muted-foreground">{f.departamento || '—'}</td>
                        <td className="p-4 text-muted-foreground">{f.email || '—'}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            {showDeleteConfirm === f.id ? (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Check className="size-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(null)}><X className="size-4" /></Button>
                              </>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => navigate(`/gestor/professores/${f.id}/visualizarprofessor`, { state: { funcionario: f, todos: funcionarios } })}><Eye className="size-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => navigate(`/gestor/professores/${f.id}/editar`)}><Settings className="size-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(f.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash className="size-4" /></Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards para mobile */}
              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {filteredFuncionarios.map((f) => (
                  <div key={f.id} className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                          {f.foto && getSafeImagePath(f.foto) ? (
                            <img src={`${import.meta.env.VITE_API_URL}${encodeURI(f.foto)}`} alt={f.nome} className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-bold text-primary">{f.nome.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{f.nome}</p>
                          <p className="text-sm text-muted-foreground">{f.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {showDeleteConfirm === f.id ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Check className="size-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(null)}><X className="size-4" /></Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/gestor/professores/${f.id}/visualizarprofessor`, { state: { funcionario: f } })}><Eye className="size-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/gestor/professores/${f.id}/editar`)}><Settings className="size-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(f.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash className="size-4" /></Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 border-t pt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Cargo</p>
                        <p className="font-medium">{f.cargo || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Departamento</p>
                        <p className="font-medium">{f.departamento || '—'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfessoresPage
