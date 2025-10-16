import { useState } from 'react';
import { NumericFormat } from 'react-number-format';
// import '../../styles/GerarBoletoPage.css';

const GerarBoletoPage = () => {
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(false);
  const [emailValido, setEmailValido] = useState(true);
  const [documentoValido, setDocumentoValido] = useState(true);
  const [numeroBoleto, setNumeroBoleto] = useState('');
  const [endereco, setEndereco] = useState('');
  const [enviarEmail, setEnviarEmail] = useState(false);

  const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0,
      resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf[10]);
  };

  const validarCNPJ = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho += 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isCPF = documento.length <= 14;
    const docOk = isCPF ? validarCPF(documento) : validarCNPJ(documento);
    const emailOk = validarEmail(email);

    setDocumentoValido(docOk);
    setEmailValido(emailOk);

    if (
      !nome ||
      !documento ||
      !email ||
      !valor ||
      !vencimento ||
      !descricao ||
      !docOk ||
      !emailOk
    ) {
      setErro(true);
      setSucesso(false);
      setTimeout(() => setErro(false), 3000);
      return;
    }

    if (!nome || !documento || !email || !valor || !vencimento || !descricao) {
      setErro(true);
      setSucesso(false);
      setTimeout(() => setErro(false), 3000);
      return;
    }

    setErro(false);
    setSucesso(true);

    const dadosBoleto = {
      nome,
      documento,
      email,
      valor,
      vencimento,
      descricao,
      categoria,
      observacoes,
    };

    console.log('Dados para gerar boleto:', dadosBoleto);

    // Resetar campos
    setNome('');
    setDocumento('');
    setEmail('');
    setValor('');
    setVencimento('');
    setDescricao('');
    setCategoria('');
    setObservacoes('');

    setTimeout(() => setSucesso(false), 3000);
  };

  return (
    <div className="boleto-page">
      <h2>Gerar Boleto</h2>

      {sucesso && (
        <div className="alerta sucesso">Boleto gerado com sucesso!</div>
      )}
      {erro && (
        <div className="alerta erro">
          Preencha todos os campos obrigatórios.
        </div>
      )}

      <form className="form-boleto" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Nome do destinatário:
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </label>

          <label>
            Número do boleto (ID ou referência interna):
            <input
              type="text"
              value={numeroBoleto}
              onChange={(e) => setNumeroBoleto(e.target.value)}
              placeholder="Ex: BOLETO-2025-0001"
            />
          </label>

          <label>
            Endereço do destinatário (opcional):
            <textarea
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              rows={2}
            />
          </label>

          <label>
            CPF ou CNPJ:
            <input
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              className={!documentoValido ? 'erro' : ''}
            />
          </label>

          <label>
            E-mail:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={!emailValido ? 'erro' : ''}
            />
          </label>

          <label>
            Valor:
            <NumericFormat
              value={valor}
              onValueChange={(val) =>
                setValor(val.floatValue?.toString() || '')
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
            Data de vencimento:
            <input
              type="date"
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              required
            />
          </label>

          <label>
            Descrição da cobrança:
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              required
            />
          </label>

          <label>
            Categoria:
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="aluguel_espaco">Aluguel de Espaço</option>
              <option value="curso_extracurricular">
                Curso Extracurricular
              </option>
              <option value="reforco">Aulas de Reforço</option>
              <option value="laboratorio">Uso de Laboratório</option>
              <option value="transporte">Transporte Contratado</option>
              <option value="alimentacao">Alimentação Escolar</option>
              <option value="evento">Participação em Evento</option>
              <option value="patrocinio">Patrocínio</option>
              <option value="parceria">Parceria Técnica</option>
              <option value="multa">Multa Contratual</option>
              <option value="taxa_admin">Taxa Administrativa</option>
              <option value="outros">Outros</option>
            </select>
          </label>

          <label>
            Observações adicionais:
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
            />
          </label>
        </div>

        <button type="submit">Gerar Boleto</button>
      </form>
    </div>
  );
};

export default GerarBoletoPage;
