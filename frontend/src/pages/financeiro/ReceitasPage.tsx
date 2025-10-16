import { useState, useRef } from 'react';
// import '../../styles/ReceitaPage.css';
import { NumericFormat } from 'react-number-format';

const ReceitaPage = () => {
  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [categoria, setCategoria] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

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

    // 🔄 Zera os campos
    setTitulo('');
    setValor('');
    setData('');
    setCategoria('');
    setComprovante(null);

    setTimeout(() => setSucesso(false), 3000);
  };

  return (
    <div className="receita-page">
      <h2>Nova Entrada</h2>

      {sucesso && (
        <div className="alerta sucesso">Receita salva com sucesso!</div>
      )}
      {erro && (
        <div className="alerta erro">
          Preencha todos os campos obrigatórios.
        </div>
      )}

      <form className="form-receita" onSubmit={handleSubmit}>
        <label>
          Título
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Repasse estadual"
            required
          />
        </label>

        <label>
          Valor
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
          Data
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </label>

        <label>
          Fonte
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
          >
            <option value="">Selecione</option>
            <option value="repasse_governo">Repasse do Governo</option>
            <option value="verba_federal">Verba Federal</option>
            <option value="verba_federal">Verba Estadual</option>
            <option value="verba_federal">Verba Municipal</option>
            <option value="doacoes">Doações</option>
            <option value="eventos_escolares">Eventos Escolares</option>
            <option value="projetos_sociais">Projetos Sociais / ONGs</option>
            <option value="convênios">Convênios e Parcerias</option>
            <option value="aluguel_espacos">Aluguel de Espaços</option>
            <option value="multas">Multas / Taxas Administrativas</option>
            <option value="juros_aplicacoes">
              Juros / Aplicações Financeiras
            </option>
            <option value="outras_receitas">Outras Receitas Diversas</option>
          </select>
        </label>

        <label>
          Comprovante (PDF ou imagem)
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setComprovante(e.target.files?.[0] || null)}
            required
          />
        </label>

        <button type="submit">Salvar Entrada</button>
      </form>
    </div>
  );
};

export default ReceitaPage;
