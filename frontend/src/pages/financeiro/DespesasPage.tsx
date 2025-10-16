import { useState, useRef } from 'react';
import { NumericFormat } from 'react-number-format';
// import '../../styles/DespesasPage.css'

const DespesasPage = () => {
  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [categoria, setCategoria] = useState('');
  const [comprovante, setComprovante] = useState<File | null>(null);

  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !valor || !data || !categoria || !comprovante) {
      setErro(true);
      setSucesso(false);
      setTimeout(() => setErro(false), 3000);
      return;
    }

    setErro(false);
    setSucesso(true);

    console.log({
      titulo,
      valor,
      data,
      categoria,
      comprovante,
    });

    // Resetar campos
    setTitulo('');
    setValor('');
    setData('');
    setCategoria('');
    setComprovante(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => setSucesso(false), 3000);
  };

  return (
    <div className="despesas-page">
      <h2>Nova Saída</h2>

      {sucesso && (
        <div className="alerta sucesso">Despesa salva com sucesso!</div>
      )}
      {erro && (
        <div className="alerta erro">
          Preencha todos os campos obrigatórios.
        </div>
      )}

      <form className="form-despesa" onSubmit={handleSubmit}>
        <label>
          Título:
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Conta de Luz"
            required
          />
        </label>

        <label>
          Valor:
          <NumericFormat
            value={valor}
            onValueChange={(values) =>
              setValor(values.floatValue?.toString() || '')
            }
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            fixedDecimalScale={true}
            decimalScale={2}
            allowNegative={false}
            className="input-formatado"
          />
        </label>

        <label>
          Data:
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </label>

        <label>
          Categoria:
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
          >
            <option value="">Selecione</option>
            <option value="energia">Energia Elétrica</option>
            <option value="agua">Água</option>
            <option value="internet">Internet</option>
            <option value="limpeza">Produtos de Limpeza</option>
            <option value="material_didatico">Material Didático</option>
            <option value="manutencao">Manutenção</option>
            <option value="salarios">Salários</option>
            <option value="alimentacao">Alimentação Escolar</option>
            <option value="transporte">Transporte</option>
            <option value="outros">Outros</option>
          </select>
        </label>

        <label>
          Comprovante (PDF ou imagem):
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf, .png, .jpg, .jpeg"
            onChange={(e) => setComprovante(e.target.files?.[0] || null)}
            required
          />
        </label>

        <button type="submit">Salvar Saída</button>
      </form>
    </div>
  );
};

export default DespesasPage;
