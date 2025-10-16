import React, { useState, useEffect, useRef } from "react";

export function AutocompleteAluno({
  alunos,
  value,
  onChange,
}: {
  alunos: { id: string; nome: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [busca, setBusca] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMostrarLista(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ====================================================================
  // >> CORREÇÃO FINAL APLICADA AQUI <<
  // Filtra de forma segura, ignorando alunos com nome nulo sem quebrar a aplicação.
  const alunosFiltrados = alunos.filter(
    (a) => a.nome && a.nome.toLowerCase().includes(busca.toLowerCase())
  );
  // ====================================================================

  function selecionarAluno(id: string, nome: string) {
    onChange(id);
    setBusca(nome);
    setMostrarLista(false);
  }

  useEffect(() => {
    const alunoSelecionado = alunos.find((a) => a.id === value);
    setBusca(alunoSelecionado?.nome || "");
  }, [value, alunos]);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        className="border rounded w-full p-2"
        value={busca}
        onFocus={() => setMostrarLista(true)}
        onChange={(e) => {
          setBusca(e.target.value);
          setMostrarLista(true);
        }}
        placeholder="Digite o nome do aluno"
        autoComplete="off"
      />
      {mostrarLista && alunosFiltrados.length > 0 && (
        <ul className="absolute z-10 w-full max-h-48 overflow-auto border rounded bg-white shadow-md">
          {alunosFiltrados.map((a) => (
            <li
              key={a.id}
              className="p-2 hover:bg-indigo-100 cursor-pointer"
              onClick={() => selecionarAluno(a.id, a.nome)}
            >
              {a.nome}
            </li>
          ))}
        </ul>
      )}
      {mostrarLista && busca && alunosFiltrados.length === 0 && (
        <div className="absolute z-10 w-full border rounded bg-white shadow-md p-2 text-gray-500">
          Nenhum aluno encontrado
        </div>
      )}
    </div>
  );
}
