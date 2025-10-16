import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { toast } from "sonner";


const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  breve_descricao: z.string().min(3, { message: "A breve descrição deve ter pelo menos 3 caracteres." }),
  aulas_semanais: z.number().min(1, { message: "Deve ter pelo menos 1 aula semanal." }),
  sobre_a_materia: z.string().min(3, { message: "O campo sobre a matéria deve conter pelo menos 3 caracteres." }),
  professores: z.array(z.object({ id: z.number(), nome: z.string() })).optional(),
  materiais: z.array(z.object({ id: z.number(), nome: z.string() })).optional(),
  turmas: z.array(z.object({ id: z.number(), nome: z.string() })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Item {
  id: number;
  nome: string;
}

const EditarMateriaPage = () => {
  const { id } = useParams();
  const [sidebarAberta, setSidebarAberta] = useState(false);

  const navigate = useNavigate();

  const [listaProfessores, setListaProfessores] = useState<Item[]>([]);
  const [listaMateriais, setListaMateriais] = useState<Item[]>([]);
  const [listaTurmas, setListaTurmas] = useState<Item[]>([]);

  // Para busca e seleção múltipla:
  const [professoresSelecionados, setProfessoresSelecionados] = useState<Item[]>([]);
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<Item[]>([]);
  const [turmasSelecionadas, setTurmasSelecionadas] = useState<Item[]>([]);

  // Para filtros de busca:
  const [filtroProfessores, setFiltroProfessores] = useState("");
  const [filtroMateriais, setFiltroMateriais] = useState("");
  const [filtroTurmas, setFiltroTurmas] = useState("");

   const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  

   useEffect(() => {
    async function carregarDados() {
      try {
        const [resProfessores, resMateriais, resTurmas, resMateria] = await Promise.all([
          axios.get(`/api/listarFuncionariosMateria`),
          axios.get(`/api/listarMateriaisMateria`),
          axios.get(`/api/listarTurmasMateria`),
          axios.get(`/api/materias/${id}`),
        ]);

        setListaProfessores(resProfessores.data);
        setListaMateriais(resMateriais.data);
        setListaTurmas(resTurmas.data);

        const materia = resMateria.data;
        setValue("nome", materia.nome);
        setValue("breve_descricao", materia.breve_descricao);
        setValue("aulas_semanais", materia.aulas_semanais);
        setValue("sobre_a_materia", materia.sobre_a_materia);
        setProfessoresSelecionados(materia.professores);
        setMateriaisSelecionados(materia.materiais);
        setTurmasSelecionadas(materia.turmas);
      } catch (err) {
        toast.error("Erro ao carregar dados da matéria.");
      }
    }

    carregarDados();
  }, [id, setValue]);

  // Funções para adicionar/remover seleção múltipla:

  const toggleSelecionado = (item: Item, list: Item[], setList: (items: Item[]) => void) => {
    if (list.find(i => i.id === item.id)) {
      setList(list.filter(i => i.id !== item.id));
    } else {
      setList([...list, item]);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        nome: data.nome,
        breve_descricao: data.breve_descricao,
        aulas_semanais: data.aulas_semanais,
        sobre_a_materia: data.sobre_a_materia,
        professores: professoresSelecionados.map(p => p.id),
        materiais: materiaisSelecionados.map(m => m.id),
        turmas: turmasSelecionadas.map(t => t.id),
      };

      await axios.put(`/api/materias/${id}`, payload);

      toast.success("Matéria atualizada com sucesso!");
      navigate("/gestor", { state: { activePage: "gestao" } });
    } catch (error) {
      console.error("Erro ao atualizar matéria:", error);
      toast.error("Erro ao atualizar a matéria.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page: string) => navigate("/gestor", { state: { activePage: page } })}
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />
      <div className="flex-1 flex flex-col pt-20 px-6">

        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 max-w-3xl mx-auto w-full mt-[20px] mb-8">
          <div className="mb-8 flex justify-center items-center">
            <h1 className="text-2xl font-bold text-black text-center">Adicionar Nova Matéria</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Nome */}
              <div className="space-y-2">
                <label htmlFor="nome" className="block text-sm font-medium text-indigo-900">
                  Nome da Matéria
                </label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Nome da matéria"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.nome ? "border-red-500" : "border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-700`}
                  {...register("nome")}
                />
                {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
              </div>

              {/* Breve Descrição */}
              <div className="space-y-2">
                <label htmlFor="breve_descricao" className="block text-sm font-medium text-indigo-900">
                  Breve Descrição
                </label>
                <input
                  id="breve_descricao"
                  type="text"
                  placeholder="Breve descrição da matéria"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.breve_descricao ? "border-red-500" : "border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-700`}
                  {...register("breve_descricao")}
                />
                {errors.breve_descricao && (
                  <p className="text-red-500 text-xs mt-1">{errors.breve_descricao.message}</p>
                )}
              </div>

              {/* Aulas Semanais */}
              <div className="space-y-2">
                <label htmlFor="aulas_semanais" className="block text-sm font-medium text-indigo-900">
                  Aulas Semanais
                </label>
                <input
                  id="aulas_semanais"
                  type="number"
                  min={1}
                  placeholder="Quantidade de aulas semanais"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.aulas_semanais ? "border-red-500" : "border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-700`}
                  {...register("aulas_semanais", { valueAsNumber: true })}
                />
                {errors.aulas_semanais && (
                  <p className="text-red-500 text-xs mt-1">{errors.aulas_semanais.message}</p>
                )}
              </div>

              {/* Sobre a Matéria */}
              <div className="space-y-2">
                <label htmlFor="sobre_a_materia" className="block text-sm font-medium text-indigo-900">
                  Sobre a Matéria
                </label>
                <textarea
                  id="sobre_a_materia"
                  placeholder="Detalhes sobre a matéria"
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.sobre_a_materia ? "border-red-500" : "border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-700 resize-none`}
                  {...register("sobre_a_materia")}
                />
                {errors.sobre_a_materia && (
                  <p className="text-red-500 text-xs mt-1">{errors.sobre_a_materia.message}</p>
                )}
              </div>
            </div>

            {/* Vincular Materiais */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2 text-indigo-900">Vincular Materiais</h2>
              <input
                type="text"
                placeholder="Buscar materiais..."
                className="w-full mb-2 px-3 py-2 border border-indigo-500 rounded-md"
                value={filtroMateriais}
                onChange={(e) => setFiltroMateriais(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto border border-indigo-400 rounded-md p-2">
                {listaMateriais
                  .filter((m) => m.nome.toLowerCase().includes(filtroMateriais.toLowerCase()))
                  .map((mat) => (
                    <label
                      key={mat.id}
                      className="flex items-center gap-2 cursor-pointer mb-1"
                    >
                      <input
                        type="checkbox"
                        checked={!!materiaisSelecionados.find((m) => m.id === mat.id)}
                        onChange={() => toggleSelecionado(mat, materiaisSelecionados, setMateriaisSelecionados)}
                      />
                      <span>{mat.nome}</span>
                    </label>
                  ))}
                {listaMateriais.length === 0 && <p>Nenhum material encontrado.</p>}
              </div>
            </div>

            {/* Vincular Turmas */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2 text-indigo-900">Vincular Turmas</h2>
              <input
                type="text"
                placeholder="Buscar turmas..."
                className="w-full mb-2 px-3 py-2 border border-indigo-500 rounded-md"
                value={filtroTurmas}
                onChange={(e) => setFiltroTurmas(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto border border-indigo-400 rounded-md p-2">
                {listaTurmas
                  .filter((t) => t.nome.toLowerCase().includes(filtroTurmas.toLowerCase()))
                  .map((tur) => (
                    <label
                      key={tur.id}
                      className="flex items-center gap-2 cursor-pointer mb-1"
                    >
                      <input
                        type="checkbox"
                        checked={!!turmasSelecionadas.find((t) => t.id === tur.id)}
                        onChange={() => toggleSelecionado(tur, turmasSelecionadas, setTurmasSelecionadas)}
                      />
                      <span>{tur.nome}</span>
                    </label>
                  ))}
                {listaTurmas.length === 0 && <p>Nenhuma turma encontrada.</p>}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={() => navigate("/gestor", { state: { activePage: "gestao" } })}
                className="px-4 py-2 border border-indigo-500 text-indigo-900 rounded-md hover:bg-indigo-50 transition-colors mr-4"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-800 text-white rounded-md hover:bg-indigo-900 transition-colors"
              >
                Salvar Matéria
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarMateriaPage;
