-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 31/10/2025 às 20:03
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `lms`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `alunos`
--

CREATE TABLE `alunos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `cpf` varchar(11) DEFAULT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `matricula` varchar(50) NOT NULL,
  `serie` varchar(50) DEFAULT NULL,
  `turma` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `biografia` text DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`endereco`)),
  `restricoes_medicas` text DEFAULT NULL COMMENT 'Descrição de restrições médicas do aluno',
  `turno` varchar(20) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `nacionalidade` varchar(50) NOT NULL DEFAULT 'Brasileira',
  `genero` varchar(50) DEFAULT NULL,
  `status` enum('regular','transferido','concluido/formado','inativo') DEFAULT 'regular'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `alunos`
--

INSERT INTO `alunos` (`id`, `nome`, `cpf`, `rg`, `matricula`, `serie`, `turma`, `email`, `foto`, `biografia`, `telefone`, `endereco`, `restricoes_medicas`, `turno`, `data_nascimento`, `nacionalidade`, `genero`, `status`) VALUES
(2, 'Krysthyan', '12631956325', '18765432', '612413', '3º Ano EM', '301', 'krysthyan@gmail.com', '', 'Aluno veterano, focado em tecnologia e desenvolvimento de software.', '31912345678', '{\"cep\":\"36576130\",\"logradouro\":\"Rua Doutor José Felismino de Oliveira\",\"numero\":\"45\",\"complemento\":\"arfsdf\",\"bairro\":\"Júlia Mollá\",\"cidade\":\"Viçosa\",\"uf\":\"MG\"}', NULL, 'Matutino', '2001-09-02', 'Brasileira', 'Masculino', 'regular'),
(3, 'Marcelo', '12345678901', '12345678', '123456', '7º Ano', '7B', 'marcelo@gmail.com', '', NULL, '21998877665', NULL, NULL, 'Matutino', '2012-03-10', 'Brasileira', 'Masculino', 'regular'),
(4, 'Rinaldo', '23456789012', '87654321', '121212', '8º Ano', '8A', 'junio@gmail.com', '', NULL, '11987654321', NULL, NULL, 'Vespertino', '2011-04-22', 'Brasileira', 'Masculino', 'regular'),
(5, 'Raissa', '34567890123', '56781234', '212121', '9º Ano', '9C', 'raissa@gmail.com', '', NULL, '71976543210', NULL, NULL, 'Matutino', '2010-01-15', 'Brasileira', 'Feminino', 'regular'),
(7, 'João', '01234567886', '99887766', 'MAT9876', 'Não aplicável', 'Egressos 2023', 'joao@escola.com.br', '', 'Ex-aluno, atualmente cursando Engenharia na universidade local.', '31965432109', '{\"cep\":\"23423345\",\"logradouro\":\"Rua dos Estudantes\",\"numero\":\"204\",\"complemento\":\"Apt 909\",\"bairro\":\"Centro\",\"cidade\":\"Viçosa\",\"uf\":\"MG\"}', NULL, 'N/A', '2002-12-13', 'Brasileira', 'Masculino', 'inativo'),
(8, 'Marcelo Ferreira', '45678901234', '11223344', '21028901', '1º Ano EM', '101', 'marceloNexum@gmail.com', '', NULL, '32954321098', NULL, NULL, 'Vespertino', '2009-07-11', 'Brasileira', 'Masculino', 'regular'),
(10, 'Marcelo Ferreira', '12629680622', '12312312', '2109888', '2º Ano EM', '202', 'the.marcelofNovo@gmail.com', '/uploads/1758741424481-433567356.png', 'fsdfsdfs', '31981158484', '{\"cep\":\"13213123\",\"logradouro\":\"asdasdad\",\"numero\":\"2\",\"bairro\":\"weqweqw\",\"cidade\":\"fdsfds\",\"uf\":\"bg\"}', NULL, 'Matutino', '2003-03-07', 'Brasileira', 'Masculino', 'regular'),
(12, 'Rinaldo Junior ', '12629680622', '32132132', '2109888', '8º Ano', '8B', 'junior@gmail.com', '/uploads/1758809924095-718224439.png', NULL, '19912345678', '{\"cep\":\"12123123\",\"logradouro\":\"asdasdasda\",\"numero\":\"4324\",\"complemento\":\"ASDASDA\",\"bairro\":\"DSA\",\"cidade\":\"seeea\",\"uf\":\"mg\"}', NULL, 'Vespertino', '2025-09-25', 'Brasileira', 'Masculino', 'inativo'),
(16, 'usuarioteste', '10101010101', '45645645', '101010', '7º Ano', '7C', 'usuarioteste@gmail.com', '/uploads/1758907439058-202349397.jpg', 'Aluno para fins de teste do sistema.', '61901010101', '{\"cep\":\"10101-010\",\"logradouro\":\"ruateste\",\"numero\":\"1010\",\"complemento\":\"ruateste\",\"bairro\":\"bairroteste\",\"cidade\":\"cidadeteste\",\"uf\":\"ut\"}', NULL, 'Matutino', '1010-10-10', 'Brasileira', 'Masculino', 'regular'),
(18, 'Arthur Jesus', '67988324212', '78978978', '54632', '9º Ano', '9A', 'arthur@gmail.com', '/uploads/1758910522190-113759779.png', NULL, '31988776655', '{\"cep\":\"36576130\",\"logradouro\":\"Rua Doutor José Felismino de Oliveira\",\"numero\":\"45\",\"complemento\":\"arfsdf\",\"bairro\":\"Júlia Mollá\",\"cidade\":\"Viçosa\",\"uf\":\"MG\"}', NULL, 'Vespertino', '2007-09-08', 'Brasileira', 'Masculino', 'regular'),
(20, 'Lucas Ferreira', '12432543567', '98798798', '2343245235', '6º Ano', '6A', 'lucasferreira@gmail.com', '/uploads/1758911261009-736922933.png', NULL, '21977665544', '{\"cep\":\"36576-130\",\"logradouro\":\"Rua Doutor José Felismino de Oliveira\",\"numero\":\"45\",\"complemento\":\"arfsdf\",\"bairro\":\"Júlia Mollá\",\"cidade\":\"Viçosa\",\"uf\":\"MG\"}', NULL, 'Matutino', '2002-09-12', 'Brasileira', 'Masculino', 'regular'),
(26, 'Arthur Lopes Saraiva', '22222222222', '0233450', '222222', NULL, NULL, 'arthurlsaraiva@gmail.com', NULL, 'kkkkkkkkkkkkk', '31982471144', '{\"cep\":\"36590000\",\"logradouro\":\"Rua Rio de Janeiro\",\"numero\":\"222\",\"bairro\":\"Centro\",\"cidade\":\"Viçosa\",\"estado\":\"MG\",\"complemento\":\"Casa\"}', 'kkkkkkkkkkkkkkk', NULL, '1988-10-20', 'Brasileira', 'Masculino', 'regular'),
(27, 'Arthur L. Saraiva', '99999999999', '999999999', '2332221', NULL, NULL, 'Joaovv@gmail.com', '/uploads/download-1761674394496.jpg', 'kkkkkkkkkkkkkkkkkkkkkk', '31982471144', '{\"cep\":\"36590000\",\"logradouro\":\"Rua Rio de Janeiro\",\"numero\":\"222\",\"bairro\":\"Centro\",\"cidade\":\"Viçosa\",\"estado\":\"MG\",\"complemento\":\"Casa\"}', 'kkkkkkkkkkkkkkkkkkk', NULL, '1998-10-31', 'Brasileira', 'Masculino', 'regular'),
(28, 'Arthur Teste', '77777777777', '111111111', '123456789', NULL, NULL, 'arthur11@gmail.com', '/uploads/download-1761683485087.jpg', 'kkkkkkkkkkkkkkkkkkkkk', '31982471144', '{\"cep\":\"36590000\",\"logradouro\":\"Rua Rio de Janeiro\",\"numero\":\"222\",\"bairro\":\"Centro\",\"cidade\":\"Viçosa\",\"estado\":\"MG\",\"complemento\":\"Casa\"}', 'kkkkkkkkkkkkkkkkkkkkkk', NULL, '1996-10-24', 'Brasileira', 'Masculino', 'regular'),
(29, 'Arthur Teste 2', '02036224544', '111112224', '2025000001', NULL, NULL, 'arthur123@gmail.com', NULL, '1111111111111111111111', '31982471144', '{\"cep\":\"36590000\",\"logradouro\":\"Rua Rio de Janeiro\",\"numero\":\"222\",\"bairro\":\"Centro\",\"cidade\":\"Viçosa\",\"estado\":\"MG\",\"complemento\":\"Casa\"}', '11111111111111111111111', NULL, '1996-10-01', 'Brasileira', 'Masculino', 'regular');

--
-- Acionadores `alunos`
--
DELIMITER $$
CREATE TRIGGER `alunos_bi` BEFORE INSERT ON `alunos` FOR EACH ROW BEGIN
    -- Limpa os campos, removendo caracteres não numéricos.
    SET NEW.cpf = REGEXP_REPLACE(NEW.cpf, '[^0-9]', '');
    -- SET NEW.rg = REGEXP_REPLACE(NEW.rg, '[^0-9]', ''); -- LINHA REMOVIDA
    SET NEW.telefone = REGEXP_REPLACE(NEW.telefone, '[^0-9]', '');

    -- Garante que o status seja 'regular' se não for fornecido
    IF NEW.status IS NULL OR NEW.status = '' THEN
        SET NEW.status = 'regular';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `alunos_bu` BEFORE UPDATE ON `alunos` FOR EACH ROW BEGIN
    -- Limpa os campos para armazenar apenas os dígitos numéricos durante a atualização.
    SET NEW.cpf = REGEXP_REPLACE(NEW.cpf, '[^0-9]', '');
    SET NEW.rg = REGEXP_REPLACE(NEW.rg, '[^0-9]', '');
    SET NEW.telefone = REGEXP_REPLACE(NEW.telefone, '[^0-9]', '');
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `alunos_responsaveis`
--

CREATE TABLE `alunos_responsaveis` (
  `id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `responsavel_id` int(11) NOT NULL,
  `parentesco` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `alunos_responsaveis`
--

INSERT INTO `alunos_responsaveis` (`id`, `aluno_id`, `responsavel_id`, `parentesco`) VALUES
(1, 2, 0, 'Mãe'),
(2, 2, 1, 'Avó'),
(3, 2, 2, 'Mãe'),
(4, 2, 3, 'Mãe'),
(5, 2, 1, 'Avó'),
(6, 7, 1, 'Avó'),
(7, 7, 2, 'Mãe'),
(9, 7, 3, 'Mãe'),
(12, 7, 4, 'Avô'),
(13, 24, 5, 'Próprio Aluno'),
(14, 26, 6, 'Próprio Aluno'),
(18, 27, 4, 'Avô'),
(20, 27, 2, 'Mãe'),
(24, 27, 5, 'Próprio Aluno'),
(25, 27, 8, 'Avó'),
(27, 27, 5, 'Próprio Aluno'),
(28, 28, 9, 'Próprio Aluno'),
(30, 28, 4, 'Avô'),
(32, 29, 10, 'Próprio Aluno'),
(33, 29, 5, 'Próprio Aluno'),
(34, 27, 5, 'Próprio Aluno'),
(35, 28, 5, 'Próprio Aluno'),
(36, 27, 3, 'Mãe'),
(37, 27, 4, 'Avô'),
(38, 29, 7, 'Próprio Aluno');

-- --------------------------------------------------------

--
-- Estrutura para tabela `alunos_turmas`
--

CREATE TABLE `alunos_turmas` (
  `id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL,
  `status_vinculo` enum('ativo','inativo','trancado') NOT NULL DEFAULT 'ativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `alunos_turmas`
--

INSERT INTO `alunos_turmas` (`id`, `aluno_id`, `turma_id`, `status_vinculo`) VALUES
(9, 24, 3, 'ativo'),
(10, 29, 3, 'ativo'),
(11, 28, 3, 'ativo'),
(12, 26, 3, 'ativo'),
(13, 27, 3, 'ativo'),
(16, 18, 3, 'ativo'),
(17, 18, 7, 'ativo'),
(18, 27, 7, 'ativo'),
(19, 26, 7, 'ativo'),
(20, 24, 7, 'ativo'),
(21, 28, 7, 'ativo'),
(22, 29, 7, 'ativo');

-- --------------------------------------------------------

--
-- Estrutura para tabela `anuncios`
--

CREATE TABLE `anuncios` (
  `id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `conteudo` text NOT NULL,
  `criado_em` datetime DEFAULT current_timestamp(),
  `autor_id` int(11) DEFAULT NULL,
  `visualizacoes` int(11) NOT NULL DEFAULT 0,
  `data_inicio` date DEFAULT NULL,
  `data_fim` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `anuncios_lidos`
--

CREATE TABLE `anuncios_lidos` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `anuncio_id` int(11) NOT NULL,
  `lido_em` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `aulas`
--

CREATE TABLE `aulas` (
  `id` int(11) NOT NULL,
  `data` date NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `status` enum('realizada','pendente','futura') NOT NULL,
  `materia_id` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL,
  `calendario_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `avaliacoes`
--

CREATE TABLE `avaliacoes` (
  `id` int(11) NOT NULL,
  `descricao` varchar(50) NOT NULL,
  `valor` decimal(5,2) NOT NULL,
  `calendario_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `status` enum('Pendente','Concluído') NOT NULL DEFAULT 'Pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `calendario_gestor`
--

CREATE TABLE `calendario_gestor` (
  `id` int(11) NOT NULL,
  `periodo` int(11) NOT NULL,
  `data_inicial` date NOT NULL,
  `data_final` date NOT NULL,
  `ano_letivo` int(11) NOT NULL,
  `tipo` varchar(255) NOT NULL,
  `valor` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `calendario_gestor`
--

INSERT INTO `calendario_gestor` (`id`, `periodo`, `data_inicial`, `data_final`, `ano_letivo`, `tipo`, `valor`) VALUES
(13, 1, '2025-10-01', '2025-10-15', 2025, '1º Semestre', 25),
(17, 2, '2025-10-23', '2025-10-31', 2025, '2º Semestre', 10);

--
-- Acionadores `calendario_gestor`
--
DELIMITER $$
CREATE TRIGGER `trg_calendario_periodo` BEFORE INSERT ON `calendario_gestor` FOR EACH ROW BEGIN
  IF NEW.periodo IS NULL OR NEW.periodo = 0 THEN
     SET NEW.periodo = (
       SELECT COALESCE(MAX(periodo),0) + 1
       FROM calendario_gestor
       WHERE ano_letivo = NEW.ano_letivo
     );
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `calendario_letivo`
--

CREATE TABLE `calendario_letivo` (
  `id` int(11) NOT NULL,
  `escola_id` int(11) NOT NULL,
  `ano_letivo` int(11) NOT NULL,
  `inicio` date NOT NULL,
  `fim` date NOT NULL,
  `tipo` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `calendario_letivo`
--

INSERT INTO `calendario_letivo` (`id`, `escola_id`, `ano_letivo`, `inicio`, `fim`, `tipo`) VALUES
(4, 1, 2025, '2025-01-01', '2025-12-31', 'Bimestral');

-- --------------------------------------------------------

--
-- Estrutura para tabela `configuracoes_calendario`
--

CREATE TABLE `configuracoes_calendario` (
  `id` int(11) NOT NULL,
  `ano_letivo` int(11) NOT NULL,
  `fuso_horario` varchar(50) DEFAULT 'America/Sao_Paulo',
  `primeiro_dia_semana` varchar(20) DEFAULT 'domingo',
  `feriados_personalizados` text DEFAULT NULL,
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Armazena as configurações gerais do calendário acadêmico.';

--
-- Despejando dados para a tabela `configuracoes_calendario`
--

INSERT INTO `configuracoes_calendario` (`id`, `ano_letivo`, `fuso_horario`, `primeiro_dia_semana`, `feriados_personalizados`, `atualizado_em`) VALUES
(1, 2025, 'America/Sao_Paulo', 'segunda', '2025-10-23,2025-10-24', '2025-10-23 17:10:11');

-- --------------------------------------------------------

--
-- Estrutura para tabela `configuracoes_cores`
--

CREATE TABLE `configuracoes_cores` (
  `id` int(11) NOT NULL,
  `cor_primaria` varchar(7) NOT NULL DEFAULT '#3b82f6',
  `cor_secundaria` varchar(7) NOT NULL DEFAULT '#8b5cf6',
  `cor_sucesso` varchar(7) NOT NULL DEFAULT '#10b981',
  `cor_erro` varchar(7) NOT NULL DEFAULT '#ef4444',
  `cor_fundo` varchar(7) NOT NULL DEFAULT '#0a0a0a',
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Armazena as configurações de cores para o tema do sistema.';

-- --------------------------------------------------------

--
-- Estrutura para tabela `configuracoes_escola`
--

CREATE TABLE `configuracoes_escola` (
  `id` int(11) NOT NULL,
  `nome_completo` varchar(255) DEFAULT NULL,
  `razao_social` varchar(255) DEFAULT NULL,
  `cnpj` varchar(18) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Armazena as informações institucionais da escola.';

--
-- Despejando dados para a tabela `configuracoes_escola`
--

INSERT INTO `configuracoes_escola` (`id`, `nome_completo`, `razao_social`, `cnpj`, `endereco`, `email`, `telefone`, `atualizado_em`) VALUES
(1, 'Must University', 'Must', '12405288000163', 'Rua do Rosario', 'must@gmail.com', '31982471144', '2025-10-17 16:54:16');

-- --------------------------------------------------------

--
-- Estrutura para tabela `configuracoes_periodos_letivos`
--

CREATE TABLE `configuracoes_periodos_letivos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `config_calendario_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Armazena os períodos letivos configurados.';

--
-- Despejando dados para a tabela `configuracoes_periodos_letivos`
--

INSERT INTO `configuracoes_periodos_letivos` (`id`, `nome`, `data_inicio`, `data_fim`, `config_calendario_id`) VALUES
(16, '2025.1', '2025-02-01', '2025-06-30', 1),
(17, '2025.2', '2025-07-01', '2025-12-30', 1),
(18, '2026.1', '2026-02-01', '2026-06-30', 1),
(19, '2026.2', '2026-07-01', '2026-12-30', 1),
(20, '2027.1', '2027-02-01', '2027-06-30', 1),
(21, '2027.2', '2027-07-01', '2027-12-30', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `configuracoes_sistema`
--

CREATE TABLE `configuracoes_sistema` (
  `id` int(11) NOT NULL,
  `escola_status` varchar(3) NOT NULL DEFAULT 'Não' COMMENT 'Status de preenchimento da aba Escola',
  `cores_status` varchar(3) NOT NULL DEFAULT 'Não' COMMENT 'Status de preenchimento da aba Cores',
  `calendario_status` varchar(3) NOT NULL DEFAULT 'Não' COMMENT 'Status de preenchimento da aba Calendário',
  `data_ultima_atualizacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Rastreia o status de preenchimento das configurações do sistema.';

--
-- Despejando dados para a tabela `configuracoes_sistema`
--

INSERT INTO `configuracoes_sistema` (`id`, `escola_status`, `cores_status`, `calendario_status`, `data_ultima_atualizacao`) VALUES
(1, 'Sim', 'Não', 'Não', '2025-10-17 16:54:16');

-- --------------------------------------------------------

--
-- Estrutura para tabela `conteudos`
--

CREATE TABLE `conteudos` (
  `id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `arquivo_pdf` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contratos`
--

CREATE TABLE `contratos` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `tipo` varchar(255) NOT NULL,
  `conteudo` text NOT NULL,
  `campos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`campos`)),
  `criado_em` datetime DEFAULT current_timestamp(),
  `atualizado_em` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `numero_contrato` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `contratos`
--

INSERT INTO `contratos` (`id`, `nome`, `tipo`, `conteudo`, `campos`, `criado_em`, `atualizado_em`, `numero_contrato`) VALUES
(3, 'Contrato de Matrícula Padrão', 'Contrato de Matrícula', '<p style=\"text-align: center;\"><strong>CONTRATO DE MATRÍCULA</strong></p><p style=\"text-align: center;\"><br></p><p style=\"text-align: justify;\"> &nbsp; &nbsp;Eu, {{responsavel}} responsável pelo(a) aluno(a) {{nome}} de CPF {{cpf}}, residente no endereço {{endereco}} fica a crédito de pagar a matrícula do aluno de valor {{valor_matricula}} e a mensalidade {{valor_mensalidade}}.</p><p style=\"text-align: justify;\">Valor do Material didático: {{valor_material_didatico}}</p><p style=\"text-align: justify;\">Data da 1ª Mensalidade: {{data_primeira_mensalidade}}</p><p style=\"text-align: justify;\">Desconto: {{valor_desconto_porcentagem}}</p><p style=\"text-align: justify;\">Data do início do desconto: {{data_inicio_do_desconto}}</p><p style=\"text-align: justify;\">Data Final do desconto: &nbsp;{{data_fim_do_desconto}}</p><p style=\"text-align: justify;\"><strong>CLÁUSULA PRIMEIRA – DO OBJETO</strong><br>1.1. O objeto do presente contrato é a prestação, pela CONTRATADA, de serviços educacionais ao CONTRATANTE, na<br>modalidade GRADUAÇÃO, no curso abaixo indicado, conforme resultado obtido em processo seletivo e ministrado pela<br>FACULDADE ITEC, para o 1° Semestre - Ano 2022.<br></p><p style=\"text-align: justify;\"><strong>CLÁUSULA SEGUNDA – DA CONDIÇÃO DO ESTUDANTE</strong><br>2.1 - No ato da matrícula/rematrícula, o CONTRATANTE, ao requerer a condição de matriculado no referido curso, assina o<br>presente instrumento, submetendo-se às condições e requisitos aqui constantes, bem como ao Manual do Candidato/Edital de<br>Processo Seletivo, Manual do Acadêmico, Manual de Código de Conduta Ético Social, Normas para Utilização do<br>Laboratório, Normas e Procedimentos da FACULDADE ITEC, e as demais obrigações constantes da legislação aplicável à<br>área de ensino e às emanadas de outras fontes legais, desde que regulem supletivamente a matéria.<br>2.2 - O curso objeto deste instrumento será executado pela CONTRATADA, obedecendo estritamente ao que estabelece seu<br>Projeto Pedagógico e à regulamentação estabelecida pelo Ministério da Educação.<br>2.3 - Em vista dos princípios e normas que balizam a Educação Nacional, em especial o disposto nos arts. 22, inc. XIV, 206,<br>inc. II e III e 209, inc. I da Constituição Federal de 1988, na Lei no 9.394/96, bem como no Estatuto, no Regimento Geral e nos<br>demais regulamentos internos da Faculdade, eventuais alterações que venham a ocorrer em virtude de Lei, ou de normas<br>editadas pelo MEC, não ensejarão reparação de qualquer natureza, obrigando-se as partes ao fiel cumprimento das obrigações<br>financeiras e contratuais ora estabelecidas.<br></p><p style=\"text-align: justify;\"><strong>CLÁUSULA TERCEIRA - DO CONTRATO ADESIVO</strong><br>3.1 O presente Contrato é de natureza adesiva, adotado sem distinção para todos os acadêmicos, sendo proibida e nula,<br>a alteração de seu texto para caso específico, conforme previsão contida no art. 54, da Lei 8.078, de 11/09/90.<br></p><p style=\"text-align: justify;\"><strong>CLÁUSULA QUARTA – DAS OBRIGAÇÕES DAS PARTES</strong><br>4.1 - É de inteira responsabilidade e autonomia da CONTRATADA o planejamento e prestação de serviços de ensino do curso<br>abaixo assinalado, além de outras providências que as atividades docentes exigirem, obedecendo ao seu exclusivo critério.<br>4.2 – Cabe ao contratante:<br>4.2.1 – Preencher todos os requisitos necessários para a matrícula no curso de graduação, especialmente a apresentação de<br>histórico escolar e diploma de conclusão do Ensino Médio e/ou documento equivalente, quando da matrícula para o primeiro<br>período.<br>4.2.2 - Não possuir débitos anteriores, em qualquer curso, nível ou modalidade ofertados pelo CONTRATANTE.<br>4.2.3 - Apresentar o comprovante de quitação da 1ª parcela do Curso, deduzindo, quando houver, o valor pago a título de<br>pré-matrícula/rematrícula.<br>4.3 - Constatadas irregularidades na matrícula/rematrícula em função de pré e co-requisitos, coincidência de horário,<br>problemas técnicos e outras, efetuar-se-á o cancelamento da referida matrícula/rematrícula na disciplina inscrita, assim<br>que detectada a irregularidade, devendo o CONTRATANTE requerer a sua regularização, de acordo com a grade curricular<br>escolhida, perante a secretaria, via requerimento na Central do Aluno ou após ser notificado.<br></p><p style=\"text-align: justify;\"><strong>CLÁUSULA QUINTA – DO VALOR E FORMA DE PAGAMENTO</strong><br>5.1 – Pela disponibilização dos serviços, tal como descritos na Cláusula Primeira supra, o CONTRATANTE obriga-se a pagar<br>à CONTRATADA o valor semestral do curso escolhido conforme abaixo descrito.<br>QUADRO I:<br>Curso: Período: Turma:<br>Turma: Ano/Semestre:<br>QUADRO II: VALOR A SER PAGO<br>Curso Valor do Semestre<br>Graduação em R$<br>5.1.2 – Em função de eventual redução ou aumento no número de disciplinas a serem cursadas pelo aluno/beneficiário, o valor<br>referente à contraprestação poderá sofrer modificações.<br>5.1.3 – O pagamento do boleto com o valor atualizado caracteriza anuência do CONTRATANTE, conforme disposto no item<br>5.1.2;<br>4.2 – O valor do contrato é representado pelo valor total das mensalidades devidas pelo período compreendido de 6 (seis)<br>meses coincidentes com o Semestre Letivo, no entanto, por mera liberalidade, a CONTRATADA autoriza o pagamento em<br>parcelas iguais e sucessivas de acordo com o quadro abaixo, e se for caso, com descontos praticados pela CONTRATADA, até<br>as seguintes datas:<br>1ª Matricula á Vista valor integral 2ª 28 de fevererio de 2022 3ª 30 de março de 2022<br>4ª 30 de abril de 2022 5ª 30 de maio de 2022 6ª 30 de junho de 2022<br>§ 1° – A primeira parcela (matrícula), deverá ser paga à vista, sem qualquer desconto, exceto em casos específicos<br>expressamente autorizados pela Direção da CONTRATADA, sendo sua quitação condição indispensável para concretização,<br>confirmação e celebração deste contrato de prestação de serviços. No caso de não quitação do valor da primeira parcela<br>(matrícula/rematrícula), a CONTRATADA fica expressamente autorizada a rescindir o presente termo de prestação de<br>serviços educacionais, a qualquer tempo e modo, desde que identificado o inadimplemento de referida parcela.<br>§ 2° – Fica estabelecido que, a partir da 2ª parcela, poderão ser conferidos descontos não cumulativos para pagamento<br>antecipado das mensalidades convencionados no item 4.2, à exceção dos alunos beneficiados com BOLSA DE ESTUDO,<br>DESCONTOS ESPECIAIS e/ou CONVÊNIOS, conforme edital e/ou regulamentos aplicados a este.<br>§ 3° – Resta ainda estabelecido que todos os descontos referidos no parágrafo anterior não são cumulativos. Assim, o aluno<br>que fizer jus a mais de um tipo de desconto – bolsa, desconto especial, convênio e/ou pagamento antecipado – deverá indicar<br>aquele que melhor lhe atender pela semestralidade da prestação de serviços aqui avençada.<br>§ 4° – O direito a descontos concedidos está submetido à condição resolutiva e não cumulativa, representada pela obrigação do<br>pagamento nas datas previstas no REGULAMENTO DO PROGRAMA DE INCENTIVO AO INGRESSO E<br>PERMANÊNCIA (PIP), sendo certo que a realização do pagamento disposto no item 4.2 após o vencimento, extinguirá o<br>direito a quaisquer descontos escolhidos e/ou ofertados naquele mês específico, obrigando o aluno/beneficiário a pagar<br>o valor integral da mensalidade, acrescido de multa e juros estipulados, aplicados à espécie.<br>Tipo de desconto almejado: _____________________________________________________________.<br>§ 5° – O desconto acima requerido, será objeto de apreciação e deverá ser deferido ou indeferido dentro do prazo de 15<br>(quinze) dias da efetivação da matrícula/rematrícula, que se concretiza pela assinatura do presente, bem como pelo seu<br>pagamento, sendo, portanto, aplicado a partir da Segunda Parcela.<br>§ 6° – Quaisquer descontos ofertados/aplicados fora da data especificada no item 4.2, configura mera liberalidade da<br>CONTRATADA, não gerando direito adquirido de quaisquer naturezas contratuais.<br>5.3 – A cobrança dos valores relativos à semestralidade se dará através de boleto bancário, a ser emitido pela CONTRATADA<br>e entregue ao CONTRATANTE, VIA E-MAIL ou POR DISPONIBILIZAÇÃO NO SETOR FINANCEIRO da<br>CONTRATADA.<br>§ Único – É de responsabilidade e obrigação do CONTRATANTE (aluno/beneficiário) retirar os aludidos boletos bancários<br>para pagamento nos locais indicados no item 4.3, ficando isenta a CONTRATADA desta obrigação, não podendo o<br>CONTRATANTE argui-la para fins de não pagamento das prestações avençadas na Cláusula Quarta e/ou atraso do referido<br>pagamento.<br>5.4 – Sobre valores pagos em atraso, haverá incidência de multa de 2% (dois por cento) e juros diários de 0,0333% (zero<br>vírgula zero trezentos e trinta e três por cento), calculados desde a data do vencimento até a data do efetivo pagamento.<br>5.5 – Na existência de inadimplemento das parcelas avençadas por prazo igual ou superior a 30 (trinta) dias, a<br>CONTRATADA poderá, a seu critério, inscrever o CONTRATANTE devedor em cadastro ou serviço de proteção de crédito<br>(SPC, SERASA, CARTÓRIOS DE PROTESTO). Poderá, ainda, a CONTRATADA remeter a referida dívida à cobrança<br>extrajudicial e judicial, através de advogados e/ou empresa especializada, sendo, nesses casos, aplicado acréscimo de 20%<br>(vinte por cento) ao valor da dívida a titulo de honorários advocatícios, além das custas e emolumentos incidentes, nos termos<br>do Artigo 389 e seguintes do Código Civil Brasileiro.<br>5.6 – De outro modo, poderá a CONTRATADA emitir fatura e/ou duplicata correspondente ao total do montante devido,<br>atribuindo as partes, neste instrumento, a plena eficácia e força executiva extrajudicial ao título emitido, aplicando-se a ele a<br>normativa legal.<br>5.7 – Os valores dos serviços descritos no item 4.2 serão reajustados anualmente, ou em periodicidade menor, desde que<br>previstos em lei e, ainda, com base na revisão da planilha de custos baseado em índices legais, de acordo com o período letivo.<br>5.8 – Efetivada a matrícula/rematrícula, havendo a ocorrência de INCLUSÃO / ALTERAÇÃO e/ou EXCLUSÃO de disciplina<br>a ser cursada, independente do período de início, é de responsabilidade única do CONTRATANTE, dirigir-se à Central do<br>Aluno, Setor Financeiro e/ou Secretaria Geral para proceder à modificação necessária à grade curricular e acordar pagamento<br>das diferenças apuradas e mediante assinatura de termo aditivo que integrará o presente.<br>5.9. Requerimento de matrícula e documentação:<br>5.9.1. O candidato aprovado deverá requerer, formalmente, a sua matrícula, no curso de sua aprovação, na Secretaria Geral,<br>obedecendo às instruções que seguem:<br>5.9.2. Documentação: o candidato deve apresentar a via original (para conferência) e cópia dos documentos autenticados:<br>● Cédula de Identidade;<br>● Cadastro de Pessoa Física - CPF (se o candidato for menor de idade, deve apresentar também o RG e CPF do<br>responsável financeiro – com as referidas cópias);<br>● 02 (duas) fotos 3x4 (recente e colorida);<br>● Certificado de Conclusão do Ensino Médio - (carimbo e assinatura da secretária e diretor legível);<br>● Histórico Escolar do Ensino Médio - (carimbo e assinatura da secretária e diretor legível);<br>● Certidão de Nascimento ou Casamento;<br>● Comprovante de Residência recente (ex. conta de energia, água ou telefone);<br>● BOLETIM INDIVIDUAL DE RESULTADO do Exame Nacional do Ensino Médio, expedido pelo INEP/MEC<br>(caso o candidato ingresse com aproveitamento do resultado do ENEM);<br>● Título de Eleitor;<br>● Carteira de Reservista;<br>● Em caso de procurador, entregar cópia da Cédula de Identidade e a via original de procuração pública ou<br>particular com firma reconhecida, com poderes específicos para a efetivação da matrícula.<br>● Se estrangeiro deve apresentar passaporte.<br>Observação. A carteira de Habilitação não substitui Identidade.</p><p><br></p><p><br></p><p style=\"text-align: center;\">_______________________________________________</p><p style=\"text-align: center;\">{{responsavel}}</p><p style=\"text-align: center;\"><br></p><p style=\"text-align: center;\"><br></p><p style=\"text-align: center;\">_______________________________________________</p><p style=\"text-align: center;\">{{instituicao}}</p>', '[\"{{responsavel}}\",\"{{nome}}\",\"{{cpf}}\",\"{{endereco}}\",\"{{valor_matricula}}\",\"{{valor_mensalidade}}\",\"{{valor_material_didatico}}\",\"{{data_primeira_mensalidade}}\",\"{{valor_desconto_porcentagem}}\",\"{{data_inicio_do_desconto}}\",\"{{data_fim_do_desconto}}\",\"{{instituicao}}\"]', '2025-08-04 11:38:18', '2025-08-05 16:51:45', 'CT - 123');

-- --------------------------------------------------------

--
-- Estrutura para tabela `contratos_preenchidos`
--

CREATE TABLE `contratos_preenchidos` (
  `id` int(11) NOT NULL,
  `contrato_id` int(11) NOT NULL,
  `aluno_id` int(11) DEFAULT NULL,
  `dados_preenchidos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`dados_preenchidos`)),
  `contrato_url` varchar(500) DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `situacao_contrato` varchar(20) NOT NULL DEFAULT 'Vigente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `contratos_preenchidos`
--

INSERT INTO `contratos_preenchidos` (`id`, `contrato_id`, `aluno_id`, `dados_preenchidos`, `contrato_url`, `criado_em`, `atualizado_em`, `situacao_contrato`) VALUES
(12, 3, 5, '{\"{{responsavel}}\":\"Carmem\",\"{{nome}}\":\"Raissa\",\"{{cpf}}\":\"15447789662\",\"{{endereco}}\":\"Av. José\",\"{{valor_matricula}}\":\"100\",\"{{valor_mensalidade}}\":\"600\",\"{{valor_material_didatico}}\":\"200\",\"{{data_primeira_mensalidade}}\":\"01/08/2025\",\"{{valor_desconto_porcentagem}}\":\"10\",\"{{data_inicio_do_desconto}}\":\"01/08/2025\",\"{{data_fim_do_desconto}}\":\"01/12/2025\",\"{{instituicao}}\":\"Anglo\"}', NULL, '2025-08-05 22:06:44', '2025-08-05 22:06:44', 'Vigente');

-- --------------------------------------------------------

--
-- Estrutura para tabela `conversas`
--

CREATE TABLE `conversas` (
  `id` int(11) NOT NULL,
  `usuario1_id` int(11) NOT NULL,
  `usuario2_id` int(11) NOT NULL,
  `criado_em` datetime DEFAULT current_timestamp(),
  `chave_unica_conversa` varchar(255) GENERATED ALWAYS AS (if(`usuario1_id` < `usuario2_id`,concat(`usuario1_id`,'_',`usuario2_id`),concat(`usuario2_id`,'_',`usuario1_id`))) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `conversas`
--

INSERT INTO `conversas` (`id`, `usuario1_id`, `usuario2_id`, `criado_em`) VALUES
(3, 1, 2, '2025-08-21 13:32:20'),
(14, 1, 7, '2025-08-26 13:38:25'),
(15, 1, 6, '2025-08-26 13:38:40'),
(16, 1, 3, '2025-08-26 13:39:19'),
(19, 1, 5, '2025-08-27 14:32:18'),
(20, 1, 4, '2025-08-27 14:32:27');

-- --------------------------------------------------------

--
-- Estrutura para tabela `cursos_alunos`
--

CREATE TABLE `cursos_alunos` (
  `curso_id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `status_vinculo` enum('Ativo','Concluído','Desistente','Transferido') NOT NULL DEFAULT 'Ativo',
  `data_vinculo` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cursos_disciplinas`
--

CREATE TABLE `cursos_disciplinas` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `carga_horaria` int(11) NOT NULL,
  `creditos` int(11) NOT NULL,
  `semestre` int(11) NOT NULL,
  `professor` varchar(255) DEFAULT NULL,
  `ementa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `cursos_disciplinas`
--

INSERT INTO `cursos_disciplinas` (`id`, `curso_id`, `nome`, `codigo`, `carga_horaria`, `creditos`, `semestre`, `professor`, `ementa`) VALUES
(1, 1, 'Metodologia de Pesquisa Científica', NULL, 60, 4, 1, 'Dr. João Silva', 'Introdução aos métodos de pesquisa científica.'),
(13, 3, 'Estatística Aplicada', 'POS-002', 64, 4, 1, NULL, 'kkkkkkkkkkkkkkkkkk'),
(14, 3, 'Cálculo II', 'CALC-02', 64, 4, 2, NULL, 'kkkkkkkkkkkkk'),
(16, 3, 'Cálculo I', 'CALC-01', 64, 4, 1, NULL, 'kkkkkkkkkkkkkkkkkk'),
(17, 4, 'Fundamentos de Machine Learning Avançado', 'IAA-001', 60, 4, 1, 'Dr. Alan Turing', 'Estudo aprofundado de algoritmos de classificação, regressão e clustering. Tópicos em regularização, otimização e avaliação de modelos.'),
(19, 4, 'Processamento de Linguagem Natural', 'IAA-003', 60, 4, 3, 'Dr. Geoffrey Hinton', 'Modelagem de linguagem, análise sintática e semântica, tradução automática e sistemas de diálogo. Estudo de modelos como BERT e GPT.'),
(20, 4, 'Seminários de Pesquisa em IA', 'IAA-004', 30, 2, 4, 'Dr. Alan Turing', 'Apresentação e discussão de artigos científicos de ponta na área de Inteligência Artificial.'),
(21, 5, 'Gerenciamento de Projetos Tradicional (PMBOK)', 'GPA-001', 45, 3, 1, 'Prof. Peter Drucker', 'Introdução aos processos, áreas de conhecimento e boas práticas do PMBOK. Gerenciamento de escopo, tempo, custo e riscos.'),
(22, 5, 'Framework Scrum e Papéis Ágeis', 'GPA-002', 45, 3, 1, 'Prof. Jeff Sutherland', 'Estudo aprofundado do framework Scrum, incluindo papéis (Scrum Master, Product Owner, Dev Team), eventos e artefatos.'),
(23, 5, 'Kanban, Lean e Otimização de Fluxo', 'GPA-003', 45, 3, 2, 'Prof. David Anderson', 'Aplicação do método Kanban para visualização do trabalho, limitação do WIP (Work in Progress) e melhoria contínua do fluxo de entrega.'),
(24, 5, 'Gestão de Produtos e Portfólio Ágil', 'GPA-004', 45, 3, 2, 'Prof. Marty Cagan', 'Técnicas para discovery de produtos, priorização de backlog, roadmap de produto e alinhamento estratégico do portfólio de projetos.'),
(25, 6, 'Fundamentos do Direito Digital e da Sociedade da Informação', 'DDP-001', 40, 3, 1, 'Dr. Lawrence Lessig', 'Análise do impacto da tecnologia no direito, abordando temas como Marco Civil da Internet, neutralidade de rede e governança da internet.'),
(26, 6, 'Lei Geral de Proteção de Dados (LGPD) na Prática', 'DDP-002', 60, 4, 1, 'Dra. Patrícia Peck', 'Estudo detalhado da LGPD: bases legais, direitos dos titulares, responsabilidades dos agentes de tratamento e o papel da ANPD.'),
(27, 6, 'Contratos Eletrônicos e Responsabilidade Civil na Internet', 'DDP-003', 40, 3, 2, 'Dr. Ricardo Lorenzetti', 'Validade jurídica de contratos eletrônicos, assinatura digital, responsabilidade de provedores e combate a fake news.'),
(28, 6, 'Crimes Cibernéticos e Evidências Digitais', 'DDP-004', 40, 3, 2, 'Prof. Jack Goldsmith', 'Tipificação de crimes informáticos, técnicas de investigação digital, cadeia de custódia de provas e cooperação internacional.'),
(29, 7, 'Bases Neurobiológicas da Aprendizagem e Memória', 'NED-001', 60, 4, 1, 'Dra. Carla Shatz', 'Estudo das estruturas cerebrais e processos sinápticos envolvidos na aquisição, consolidação e evocação de memórias.'),
(30, 7, 'Funções Executivas e o Desenvolvimento Cognitivo na Escola', 'NED-002', 60, 4, 2, 'Dr. Adele Diamond', 'Análise do papel da atenção, controle inibitório e memória de trabalho no desempenho acadêmico e desenvolvimento de estratégias de ensino.'),
(31, 8, 'Tecnologias de Energia Solar e Eólica', 'SER-001', 60, 4, 1, 'Prof. Eicke Weber', 'Princípios de funcionamento, dimensionamento e integração de sistemas fotovoltaicos e eólicos na matriz energética.'),
(32, 8, 'Políticas Públicas para Sustentabilidade e Mudanças Climáticas', 'SER-002', 60, 4, 2, 'Dra. Christiana Figueres', 'Análise de acordos internacionais, legislação ambiental e instrumentos econômicos para a transição para uma economia de baixo carbono.'),
(35, 4, 'Engenharia Civil', 'CALC-01', 2, 2, 2, NULL, '1');

-- --------------------------------------------------------

--
-- Estrutura para tabela `cursos_eventos`
--

CREATE TABLE `cursos_eventos` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `tipo` enum('prazo','evento','defesa') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `cursos_eventos`
--

INSERT INTO `cursos_eventos` (`id`, `curso_id`, `titulo`, `descricao`, `data_inicio`, `data_fim`, `tipo`) VALUES
(1, 1, 'Início do Semestre 2024.1', 'Início das aulas do primeiro semestre de 2024', '2024-03-01', '2024-03-01', 'evento');

-- --------------------------------------------------------

--
-- Estrutura para tabela `cursos_posgraduacao`
--

CREATE TABLE `cursos_posgraduacao` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `tipo` varchar(50) NOT NULL COMMENT 'Ex: mestrado, doutorado',
  `area_conhecimento` varchar(100) NOT NULL,
  `carga_horaria` int(11) NOT NULL,
  `duracao_semestres` int(11) NOT NULL,
  `modalidade` varchar(50) NOT NULL COMMENT 'Ex: presencial, hibrido, ead',
  `coordenador_id` int(11) NOT NULL,
  `vice_coordenador_id` int(11) DEFAULT NULL,
  `unidade_id` int(11) NOT NULL,
  `objetivos` text NOT NULL,
  `perfil_egresso` text NOT NULL,
  `justificativa` text NOT NULL,
  `ano_inicio` year(4) NOT NULL,
  `status` varchar(50) NOT NULL COMMENT 'Ex: ativo, planejamento',
  `link_divulgacao` varchar(500) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Armazena informações detalhadas dos cursos de pós-graduação.';

--
-- Despejando dados para a tabela `cursos_posgraduacao`
--

INSERT INTO `cursos_posgraduacao` (`id`, `nome`, `tipo`, `area_conhecimento`, `carga_horaria`, `duracao_semestres`, `modalidade`, `coordenador_id`, `vice_coordenador_id`, `unidade_id`, `objetivos`, `perfil_egresso`, `justificativa`, `ano_inicio`, `status`, `link_divulgacao`, `criado_em`, `atualizado_em`) VALUES
(1, 'Mestrado em Ciências da Computação', 'mestrado', 'ciencias-exatas', 240, 1, 'presencial', 1, 2, 2, 'oooooooooooooooo', 'ooooopppppppppppppp', 'lllllllllllllllllllllllllllllllllllllll', '2025', 'ativo', 'https://mustedu.com/pt/forma-para-admissao/', '2025-10-23 12:42:14', '2025-10-23 12:42:14'),
(3, 'Engenharia Civil', 'doutorado', 'engenharias', 4000, 10, 'presencial', 1, 3, 1, 'kkkkkkkkkkkkk', 'kkkkkkkkkkkkkkkkkk', 'kkkkkkkkkkkkkkkkkkkkkk', '2025', 'planejamento', 'https://mustedu.com/pt/forma-para-admissao/', '2025-10-23 14:24:08', '2025-10-23 14:58:57'),
(4, 'Doutorado em Inteligência Artificial Aplicada', 'doutorado', 'ciencias-exatas', 600, 8, 'hibrido', 1, 3, 1, 'Formar pesquisadores de alto nível capazes de desenvolver soluções inovadoras em IA para problemas complexos da indústria e da sociedade.', 'Pesquisador ou líder técnico em IA, com profundo conhecimento em machine learning, processamento de linguagem natural e visão computacional.', 'A crescente demanda por especialistas em IA justifica um programa de doutorado focado em aplicações práticas e pesquisa de ponta.', '2025', 'ativo', 'https://mustedu.com/pt/ia-aplicada/', '2025-10-24 12:03:55', '2025-10-31 17:46:05'),
(5, 'MBA em Gestão de Projetos e Metodologias Ágeis', 'especializacao', 'ciencias-sociais-aplicadas', 360, 2, 'ead', 1, 6, 2, 'Capacitar profissionais para liderar projetos complexos utilizando frameworks ágeis como Scrum, Kanban e Lean, garantindo entregas de valor.', 'Gerente de projetos, Scrum Master, Product Owner ou Agile Coach, apto a otimizar processos e liderar equipes de alta performance.', 'O mercado de trabalho moderno exige profissionais que dominem tanto a gestão tradicional quanto as abordagens ágeis para se manterem competitivos.', '2025', 'ativo', 'https://mustedu.com/pt/mba-projetos/', '2025-10-24 12:03:55', '2025-10-24 12:03:55'),
(6, 'Especialização em Direito Digital e Proteção de Dados', 'especializacao', 'ciencias-sociais-aplicadas', 400, 3, 'ead', 1, NULL, 1, 'Aprofundar o conhecimento sobre a legislação de proteção de dados (LGPD/GDPR), crimes cibernéticos e os desafios jurídicos da era digital.', 'Advogado especialista em direito digital, Data Protection Officer (DPO) ou consultor em privacidade e proteção de dados.', 'Com a implementação da LGPD, a necessidade de profissionais especializados em proteção de dados tornou-se crítica para todas as organizações.', '2024', 'ativo', 'https://mustedu.com/pt/direito-digital/', '2025-10-24 12:03:55', '2025-10-24 12:03:55'),
(7, 'Mestrado em Neurociência e Educação', 'mestrado', 'ciencias-humanas', 480, 4, 'presencial', 22, 6, 1, 'Investigar a interface entre o funcionamento do cérebro e os processos de aprendizagem, desenvolvendo novas práticas pedagógicas baseadas em evidências científicas.', 'Pesquisador em neuroeducação, coordenador pedagógico ou professor especializado em dificuldades de aprendizagem.', 'Compreender como o cérebro aprende é fundamental para revolucionar a educação e criar métodos de ensino mais eficazes.', '2025', 'planejamento', 'https://mustedu.com/pt/neurociencia-edu/', '2025-10-24 12:03:55', '2025-10-24 12:03:55'),
(8, 'Doutorado em Sustentabilidade e Energias Renováveis', 'doutorado', 'engenharias', 620, 8, 'presencial', 1, 22, 2, 'Desenvolver pesquisa de ponta em tecnologias de energia limpa, políticas de sustentabilidade e gestão de recursos naturais para um futuro mais verde.', 'Cientista, consultor ou gestor em sustentabilidade, apto a criar soluções para os desafios energéticos e ambientais globais.', 'A transição energética é um dos maiores desafios do nosso tempo, demandando pesquisa e inovação constantes.', '2026', 'planejamento', 'https://mustedu.com/pt/sustentabilidade/', '2025-10-24 12:03:55', '2025-10-24 12:03:55'),
(9, 'MBA Executivo em Finanças, Investimentos e Banking', 'especializacao', 'ciencias-sociais-aplicadas', 380, 2, 'hibrido', 23, NULL, 1, 'Formar líderes para o mercado financeiro, com domínio sobre análise de investimentos, gestão de portfólios, banking digital e fintechs.', 'Analista de investimentos, gerente de banco, consultor financeiro ou CFO, preparado para tomar decisões estratégicas em um ambiente volátil.', 'A transformação digital do setor financeiro exige profissionais com uma visão moderna e integrada de finanças e tecnologia.', '2025', 'ativo', 'https://mustedu.com/pt/mba-financas/', '2025-10-24 12:03:55', '2025-10-24 12:03:55'),
(10, 'Mestrado em Design de Interação e Experiência do Usuário (UX)', 'mestrado', 'ciencias-sociais-aplicadas', 450, 4, 'hibrido', 6, 22, 2, 'Capacitar profissionais para projetar produtos e serviços digitais centrados no usuário, combinando pesquisa, design e tecnologia.', 'UX Designer, UX Researcher, Product Designer ou líder de equipes de design, focado em criar experiências digitais memoráveis e eficazes.', 'A experiência do usuário é um diferencial competitivo crucial no mercado digital, tornando este profissional indispensável.', '2025', 'ativo', 'https://mustedu.com/pt/mestrado-ux/', '2025-10-24 12:03:55', '2025-10-24 12:03:55'),
(11, 'Especialização em Psicologia Clínica e Terapia Cognitivo-Comportamental', 'especializacao', 'ciencias-da-saude', 420, 3, 'presencial', 22, NULL, 1, 'Oferecer formação teórica e prática aprofundada em Terapia Cognitivo-Comportamental (TCC) para o tratamento de diversos transtornos mentais.', 'Psicólogo clínico com especialização em TCC, apto a aplicar técnicas baseadas em evidências para promover a saúde mental.', 'A TCC é uma das abordagens terapêuticas mais eficazes e procuradas, havendo grande demanda por psicólogos com esta especialização.', '2024', 'ativo', 'https://mustedu.com/pt/psicologia-tcc/', '2025-10-24 12:03:55', '2025-10-24 12:03:55'),
(12, 'Mestrado Profissional em Saúde Pública', 'mestrado', 'ciencias-da-saude', 500, 4, 'presencial', 22, 1, 2, 'Formar gestores e profissionais para atuarem no planejamento, execução e avaliação de políticas e programas de saúde pública.', 'Gestor de saúde, epidemiologista, sanitarista ou pesquisador em políticas públicas de saúde.', 'Fortalecer o sistema de saúde e responder a emergências sanitárias requer profissionais com visão estratégica e técnica apurada.', '2025', 'ativo', 'https://mustedu.com/pt/saude-publica/', '2025-10-24 12:03:55', '2025-10-24 12:03:55'),
(13, 'Especialização em Marketing Digital e Growth Hacking', 'especializacao', 'ciencias-sociais-aplicadas', 360, 2, 'ead', 23, 6, 1, 'Desenvolver competências em estratégias de marketing digital, análise de dados e técnicas de growth hacking para acelerar o crescimento de negócios.', 'Gerente de marketing digital, analista de growth, especialista em SEO/SEM ou empreendedor digital.', 'Em um mercado saturado, a capacidade de gerar crescimento rápido e escalável através de estratégias digitais é altamente valorizada.', '2025', 'ativo', 'https://mustedu.com/pt/mkt-growth/', '2025-10-24 12:03:55', '2025-10-24 12:03:55');

-- --------------------------------------------------------

--
-- Estrutura para tabela `cursos_ppc`
--

CREATE TABLE `cursos_ppc` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `conteudo` longtext DEFAULT NULL,
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cursos_professores`
--

CREATE TABLE `cursos_professores` (
  `curso_id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `tipo_vinculo` enum('Permanente','Colaborador','Visitante') NOT NULL DEFAULT 'Permanente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `descontos`
--

CREATE TABLE `descontos` (
  `id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `percentual` decimal(5,2) DEFAULT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `descontos`
--

INSERT INTO `descontos` (`id`, `aluno_id`, `descricao`, `percentual`, `data_inicio`, `data_fim`) VALUES
(1, 8, 'Segundo Filho', 5.00, '2025-10-01', '2025-12-01');

-- --------------------------------------------------------

--
-- Estrutura para tabela `disciplinas_turmas`
--

CREATE TABLE `disciplinas_turmas` (
  `id` int(11) NOT NULL,
  `disciplina_id` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `disponibilidade`
--

CREATE TABLE `disponibilidade` (
  `id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `disponibilidade_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`disponibilidade_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `documentos_alunos`
--

CREATE TABLE `documentos_alunos` (
  `id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `tipo_documento` varchar(100) NOT NULL COMMENT 'Ex: foto3x4, comprovanteResidencia',
  `caminho_arquivo` varchar(255) NOT NULL,
  `nome_original` varchar(255) NOT NULL,
  `data_upload` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `documentos_alunos`
--

INSERT INTO `documentos_alunos` (`id`, `aluno_id`, `tipo_documento`, `caminho_arquivo`, `nome_original`, `data_upload`) VALUES
(1, 7, 'foto3x4', '/uploads/documentos/download-1761656398203.jpg', 'download.jpg', '2025-10-28 12:59:58'),
(2, 7, 'comprovanteResidencia', '/uploads/documentos/download-1761656398204.jpg', 'download.jpg', '2025-10-28 12:59:58'),
(3, 7, 'documentoAluno', '/uploads/documentos/download-1761656398205.jpg', 'download.jpg', '2025-10-28 12:59:58'),
(4, 7, 'documentoResponsavel', '/uploads/documentos/download-1761656398205.jpg', 'download.jpg', '2025-10-28 12:59:58'),
(5, 7, 'certidaoNascimento', '/uploads/documentos/download-1761656398205.jpg', 'download.jpg', '2025-10-28 12:59:58'),
(6, 7, 'historicoEscolar', '/uploads/documentos/download-1761656398205.jpg', 'download.jpg', '2025-10-28 12:59:58'),
(7, 7, 'laudoMedico', '/uploads/documentos/download-1761656398206.jpg', 'download.jpg', '2025-10-28 12:59:58'),
(8, 7, 'adicionais', '/uploads/documentos/download-1761656398209.jpg', 'download.jpg', '2025-10-28 12:59:58'),
(9, 27, 'foto3x4', '/uploads/documentos/download-1761835245866.jpg', 'download.jpg', '2025-10-30 14:40:45'),
(10, 27, 'comprovanteResidencia', '/uploads/documentos/download-1761835245866.jpg', 'download.jpg', '2025-10-30 14:40:45'),
(11, 27, 'documentoAluno', '/uploads/documentos/download-1761835245866.jpg', 'download.jpg', '2025-10-30 14:40:45'),
(12, 27, 'documentoResponsavel', '/uploads/documentos/download-1761835245867.jpg', 'download.jpg', '2025-10-30 14:40:45'),
(13, 27, 'certidaoNascimento', '/uploads/documentos/download-1761835245867.jpg', 'download.jpg', '2025-10-30 14:40:45'),
(14, 27, 'historicoEscolar', '/uploads/documentos/download-1761835245867.jpg', 'download.jpg', '2025-10-30 14:40:45'),
(15, 27, 'laudoMedico', '/uploads/documentos/download-1761835245868.jpg', 'download.jpg', '2025-10-30 14:40:45'),
(16, 27, 'adicionais', '/uploads/documentos/download-1761683311156.jpg', 'download.jpg', '2025-10-28 20:28:31'),
(17, 28, 'foto3x4', '/uploads/documentos/download-1761832955788.jpg', 'download.jpg', '2025-10-30 14:02:35'),
(18, 28, 'comprovanteResidencia', '/uploads/documentos/download-1761832955789.jpg', 'download.jpg', '2025-10-30 14:02:35'),
(19, 28, 'documentoAluno', '/uploads/documentos/download-1761832955789.jpg', 'download.jpg', '2025-10-30 14:02:35'),
(20, 28, 'documentoResponsavel', '/uploads/documentos/download-1761832955789.jpg', 'download.jpg', '2025-10-30 14:02:35'),
(21, 28, 'certidaoNascimento', '/uploads/documentos/download-1761832955789.jpg', 'download.jpg', '2025-10-30 14:02:35'),
(22, 28, 'historicoEscolar', '/uploads/documentos/download-1761832955789.jpg', 'download.jpg', '2025-10-30 14:02:35'),
(23, 28, 'laudoMedico', '/uploads/documentos/download-1761832955790.jpg', 'download.jpg', '2025-10-30 14:02:35'),
(24, 28, 'adicionais', '/uploads/documentos/transacoes-1761683577611.pdf', 'transacoes.pdf', '2025-10-28 20:32:57'),
(47, 29, 'foto3x4', '/uploads/documentos/download-1761838566327.jpg', 'download.jpg', '2025-10-30 15:36:06'),
(48, 29, 'comprovanteResidencia', '/uploads/documentos/download-1761838566328.jpg', 'download.jpg', '2025-10-30 15:36:06'),
(49, 29, 'documentoAluno', '/uploads/documentos/download-1761838566328.jpg', 'download.jpg', '2025-10-30 15:36:06'),
(50, 29, 'documentoResponsavel', '/uploads/documentos/download-1761838566328.jpg', 'download.jpg', '2025-10-30 15:36:06'),
(51, 29, 'certidaoNascimento', '/uploads/documentos/download-1761838566328.jpg', 'download.jpg', '2025-10-30 15:36:06'),
(52, 29, 'historicoEscolar', '/uploads/documentos/download-1761838566328.jpg', 'download.jpg', '2025-10-30 15:36:06'),
(53, 29, 'laudoMedico', '/uploads/documentos/download-1761838566328.jpg', 'download.jpg', '2025-10-30 15:36:06');

-- --------------------------------------------------------

--
-- Estrutura para tabela `envios`
--

CREATE TABLE `envios` (
  `id` int(11) NOT NULL,
  `tipo` enum('Aviso','PDF','Imagem','Exercício Tradicional','Exercício Online') NOT NULL DEFAULT 'Aviso',
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `arquivo_url` varchar(255) DEFAULT NULL,
  `destinatario` varchar(100) DEFAULT 'turma_toda',
  `usuario_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL,
  `data_criacao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `envios`
--

INSERT INTO `envios` (`id`, `tipo`, `titulo`, `descricao`, `arquivo_url`, `destinatario`, `usuario_id`, `materia_id`, `turma_id`, `data_criacao`) VALUES
(1, 'PDF', 'PDF', 'PDF', '1753189048961-403377686.pdf', 'turma_toda', 6, 1, 1, '2025-07-22 09:57:28'),
(2, 'Exercício Online', 'Prova 1', '', NULL, 'turma_toda', 6, 1, 1, '2025-09-17 14:35:18'),
(3, 'Imagem', 'sdassd', 'asdas', '1758637206688-816113394.png', 'turma_toda', 6, 1, 1, '2025-09-23 11:20:06');

-- --------------------------------------------------------

--
-- Estrutura para tabela `escolas`
--

CREATE TABLE `escolas` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `escolas`
--

INSERT INTO `escolas` (`id`, `nome`, `cidade`, `estado`) VALUES
(1, 'Must University', 'Miami', 'FL');

-- --------------------------------------------------------

--
-- Estrutura para tabela `eventos_calendario`
--

CREATE TABLE `eventos_calendario` (
  `id` int(11) NOT NULL,
  `calendario_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `tipo` enum('letivo','feriado','recesso','evento_especial','prova','planejamento','inicio_periodo','fim_periodo') NOT NULL,
  `descricao` text DEFAULT NULL,
  `recorrente` tinyint(1) DEFAULT 0,
  `cor` varchar(7) NOT NULL DEFAULT '#000000',
  `nome` varchar(100) NOT NULL,
  `importancia` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `eventos_calendario`
--

INSERT INTO `eventos_calendario` (`id`, `calendario_id`, `data`, `tipo`, `descricao`, `recorrente`, `cor`, `nome`, `importancia`) VALUES
(3, 4, '2025-09-09', 'feriado', 'Teste', 0, '#2dd4bf', 'Teste', 'alta');

-- --------------------------------------------------------

--
-- Estrutura para tabela `eventos_roles`
--

CREATE TABLE `eventos_roles` (
  `id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `role` enum('aluno','responsavel','professor','gestor') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `eventos_roles`
--

INSERT INTO `eventos_roles` (`id`, `evento_id`, `role`) VALUES
(24, 3, 'aluno');

-- --------------------------------------------------------

--
-- Estrutura para tabela `eventos_usuarios`
--

CREATE TABLE `eventos_usuarios` (
  `id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `eventos_usuarios`
--

INSERT INTO `eventos_usuarios` (`id`, `evento_id`, `user_id`) VALUES
(5, 3, 3),
(6, 3, 2),
(7, 3, 4),
(8, 3, 5),
(9, 3, 7),
(10, 3, 16),
(11, 3, 20),
(12, 3, 22);

-- --------------------------------------------------------

--
-- Estrutura para tabela `exercicios`
--

CREATE TABLE `exercicios` (
  `id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `tentativas_permitidas` int(11) NOT NULL,
  `tempo_limite` int(11) DEFAULT NULL,
  `mostrar_resultado` tinyint(1) NOT NULL DEFAULT 0,
  `embaralhar_questoes` tinyint(1) NOT NULL DEFAULT 0,
  `nota_max` decimal(5,2) NOT NULL DEFAULT 10.00,
  `envios_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `exercicios`
--

INSERT INTO `exercicios` (`id`, `professor_id`, `materia_id`, `turma_id`, `titulo`, `descricao`, `tentativas_permitidas`, `tempo_limite`, `mostrar_resultado`, `embaralhar_questoes`, `nota_max`, `envios_id`) VALUES
(1, 6, 1, 1, 'Prova 1', '', 1, 20, 1, 1, 1.00, 2);

-- --------------------------------------------------------

--
-- Estrutura para tabela `exercicios_alunos`
--

CREATE TABLE `exercicios_alunos` (
  `id` int(11) NOT NULL,
  `envios_id` int(11) DEFAULT NULL,
  `exercicios_questoes_id` int(11) DEFAULT NULL,
  `aluno_id` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL,
  `exercicio_id` int(11) DEFAULT NULL,
  `questao_id` int(11) DEFAULT NULL,
  `tentativa` int(11) NOT NULL DEFAULT 1,
  `tempo_realizado` int(11) DEFAULT NULL,
  `alt_selecionada` tinyint(1) DEFAULT NULL,
  `nota_obtida` decimal(5,2) DEFAULT 0.00,
  `resp_texto` text DEFAULT NULL,
  `resp_num` decimal(10,2) DEFAULT NULL,
  `data_envio` datetime DEFAULT current_timestamp(),
  `status_correcao` enum('pendente','corrigido','corrigido_manual') DEFAULT 'pendente',
  `arquivo_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `exercicios_questoes`
--

CREATE TABLE `exercicios_questoes` (
  `id` int(11) NOT NULL,
  `exercicio_id` int(11) NOT NULL,
  `enunciado` text NOT NULL,
  `tipo` enum('multipla_escolha','verdadeiro_falso','aberta','numerica') NOT NULL,
  `valor_questao` decimal(5,2) NOT NULL DEFAULT 1.00,
  `explicacao` text DEFAULT NULL,
  `alt_1` varchar(255) DEFAULT NULL,
  `alt_2` varchar(255) DEFAULT NULL,
  `alt_3` varchar(255) DEFAULT NULL,
  `alt_4` varchar(255) DEFAULT NULL,
  `alt_certa` tinyint(1) DEFAULT NULL,
  `resp_modelo` text DEFAULT NULL,
  `resp_numerica` decimal(10,2) DEFAULT NULL,
  `envios_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `exercicios_questoes`
--

INSERT INTO `exercicios_questoes` (`id`, `exercicio_id`, `enunciado`, `tipo`, `valor_questao`, `explicacao`, `alt_1`, `alt_2`, `alt_3`, `alt_4`, `alt_certa`, `resp_modelo`, `resp_numerica`, `envios_id`) VALUES
(1, 1, 'Digite a questão Correta', 'multipla_escolha', 1.00, '', 'Certo', 'Errado', 'Errado', 'Errado', 1, NULL, NULL, 2);

-- --------------------------------------------------------

--
-- Estrutura para tabela `favoritos`
--

CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `conversa_id` int(11) NOT NULL,
  `criado_em` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `favoritos`
--

INSERT INTO `favoritos` (`id`, `usuario_id`, `conversa_id`, `criado_em`) VALUES
(253, 1, 19, '2025-08-27 16:04:51'),
(254, 1, 3, '2025-08-27 16:04:52'),
(255, 1, 20, '2025-08-27 16:04:52'),
(256, 1, 15, '2025-08-27 16:04:53'),
(257, 1, 14, '2025-08-27 16:05:13'),
(258, 1, 16, '2025-08-28 09:56:16');

-- --------------------------------------------------------

--
-- Estrutura para tabela `funcionarios`
--

CREATE TABLE `funcionarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `cpf` varchar(11) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `data_contratacao` date DEFAULT NULL,
  `endereco` text DEFAULT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `registro` varchar(255) NOT NULL,
  `biografia` varchar(255) NOT NULL,
  `formacao_academica` varchar(255) DEFAULT NULL,
  `especialidades` text DEFAULT NULL,
  `instituicao` varchar(255) DEFAULT NULL,
  `materias` text DEFAULT NULL,
  `turmas` text DEFAULT NULL,
  `total_alunos` int(11) DEFAULT 0,
  `taxa_aprovacao` decimal(5,2) DEFAULT 0.00,
  `status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `funcionarios`
--

INSERT INTO `funcionarios` (`id`, `nome`, `email`, `cpf`, `telefone`, `data_nascimento`, `data_contratacao`, `endereco`, `cargo`, `departamento`, `foto`, `registro`, `biografia`, `formacao_academica`, `especialidades`, `instituicao`, `materias`, `turmas`, `total_alunos`, `taxa_aprovacao`, `status`) VALUES
(6, 'jose', 'jose@gmail.com', NULL, NULL, NULL, NULL, NULL, 'Professor', 'História', '', 'MAT12345', 'José', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 'ativo'),
(22, 'Lela', 'lela@gmail.com', '54378793223', '52376832341', '1998-09-03', '2025-09-30', '{\"cep\":\"36576-130\",\"logradouro\":\"Rua Doutor José Felismino de Oliveira\",\"numero\":\"31\",\"complemento\":\"Apt 202\",\"bairro\":\"Júlia Mollá\",\"cidade\":\"Viçosa\",\"uf\":\"MG\"}', 'Professor', 'Matemática  ', '/uploads/1759235296926-718355380.png', 'MAT12345', 'Oi, sou Lucas, professor de Matemática', 'Matemática', 'Matemática Computacional', NULL, NULL, NULL, 0, 0.00, 'ativo'),
(23, 'Marcelo Funcionario ', 'marcelofuncionarionovo@gmail.com', '12629680232', '31989371121', '2003-03-07', '2025-09-30', '{\"cep\":\"36576-130\",\"logradouro\":\"Rua Doutor José Felismino de Oliveira\",\"numero\":\"78\",\"complemento\":\"Apt 202\",\"bairro\":\"Júlia Mollá\",\"cidade\":\"Viçosa\",\"uf\":\"MG\"}', 'Gestor', 'Matemática  ', '/uploads/1759249857291-37726123.jpg', 'DEV1', 'We are the future', 'Ciencia da Computação', NULL, NULL, NULL, NULL, 0, 0.00, 'ativo');

-- --------------------------------------------------------

--
-- Estrutura para tabela `materiais`
--

CREATE TABLE `materiais` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `autor` varchar(255) NOT NULL,
  `capa_url` varchar(255) NOT NULL,
  `conteudo_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `materiais`
--

INSERT INTO `materiais` (`id`, `nome`, `autor`, `capa_url`, `conteudo_url`) VALUES
(1, 'Livro', 'Autor', '/uploads/material/1753360900782-836016659.png', '/uploads/material/1753360900793-26293232.pdf');

-- --------------------------------------------------------

--
-- Estrutura para tabela `materias`
--

CREATE TABLE `materias` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `breve_descricao` varchar(255) NOT NULL,
  `sobre_a_materia` text NOT NULL,
  `qtd_professores` int(11) NOT NULL,
  `qtd_materiais` int(11) NOT NULL,
  `qtd_turmas_vinculadas` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `aulas_semanais` int(11) NOT NULL DEFAULT 2
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `materias`
--

INSERT INTO `materias` (`id`, `nome`, `breve_descricao`, `sobre_a_materia`, `qtd_professores`, `qtd_materiais`, `qtd_turmas_vinculadas`, `created_at`, `aulas_semanais`) VALUES
(1, 'História', 'História é a disciplina que estuda o passado da humanidade, analisando acontecimentos, sociedades e culturas, para compreender o presente e construir consciência crítica sobre o futuro', 'História é a disciplina que estuda o passado da humanidade, analisando acontecimentos, sociedades e culturas, para compreender o presente e construir consciência crítica sobre o futuro', 0, 0, 1, '2025-07-22 12:49:19', 2),
(2, 'Português', 'Português é a disciplina que desenvolve a leitura, interpretação, escrita e oralidade, além de explorar a gramática e a literatura, fortalecendo a comunicação e a valorização cultural', 'Português é a disciplina que desenvolve a leitura, interpretação, escrita e oralidade, além de explorar a gramática e a literatura, fortalecendo a comunicação e a valorização cultural', 0, 1, 1, '2025-09-17 16:40:35', 5),
(3, 'Geografia', 'Geografia é a disciplina que estuda o espaço geográfico, analisando a relação entre sociedade e natureza, seus aspectos físicos, culturais e econômicos', 'Geografia é a disciplina que estuda o espaço geográfico, analisando a relação entre sociedade e natureza, seus aspectos físicos, culturais e econômicos', 0, 1, 1, '2025-09-17 16:41:19', 2),
(4, 'Ingles', 'Inglês é a disciplina que desenvolve habilidades de comunicação oral e escrita em língua inglesa, ampliando o acesso à cultura, à informação e às oportunidades globais', 'Inglês é a disciplina que desenvolve habilidades de comunicação oral e escrita em língua inglesa, ampliando o acesso à cultura, à informação e às oportunidades globais', 0, 1, 1, '2025-09-17 16:41:42', 2),
(5, 'Artes', 'Artes é a disciplina que estimula a criatividade e a expressão, explorando diferentes linguagens artísticas para desenvolver sensibilidade estética e cultural', 'Artes é a disciplina que estimula a criatividade e a expressão, explorando diferentes linguagens artísticas para desenvolver sensibilidade estética e cultural', 0, 1, 1, '2025-09-17 16:42:08', 1),
(6, 'Química', 'Química é a disciplina que estuda a composição, as transformações e as interações da matéria, relacionando a ciência ao cotidiano e ao desenvolvimento tecnológico', 'Química é a disciplina que estuda a composição, as transformações e as interações da matéria, relacionando a ciência ao cotidiano e ao desenvolvimento tecnológico.', 0, 1, 1, '2025-09-17 16:42:48', 2),
(7, 'Física', 'Física é a disciplina que investiga os fenômenos naturais, suas leis e princípios, explicando o funcionamento do universo e suas aplicações no cotidiano e na tecnologia', 'Física é a disciplina que investiga os fenômenos naturais, suas leis e princípios, explicando o funcionamento do universo e suas aplicações no cotidiano e na tecnologia', 0, 1, 1, '2025-09-17 16:43:09', 2),
(8, 'Biologia', 'Biologia é a disciplina que estuda os seres vivos, suas estruturas, funções e interações, promovendo a compreensão da vida e da relação entre homem e natureza', 'Biologia é a disciplina que estuda os seres vivos, suas estruturas, funções e interações, promovendo a compreensão da vida e da relação entre homem e natureza', 0, 1, 1, '2025-09-17 16:43:27', 2),
(9, 'Matemática', 'Matemática é a disciplina que desenvolve o raciocínio lógico e a resolução de problemas, estudando números, formas, medidas e relações para aplicação no cotidiano e na ciência', 'Matemática é a disciplina que desenvolve o raciocínio lógico e a resolução de problemas, estudando números, formas, medidas e relações para aplicação no cotidiano e na ciência', 0, 1, 1, '2025-09-17 16:43:57', 5),
(10, 'Redação', 'Redação é a disciplina que aprimora a escrita, organização de ideias e argumentação, capacitando para a produção de textos claros, coesos e críticos', 'Redação é a disciplina que aprimora a escrita, organização de ideias e argumentação, capacitando para a produção de textos claros, coesos e críticos', 0, 1, 1, '2025-09-17 16:44:25', 1),
(11, 'Educação Física', 'Educação Física é a disciplina que promove o desenvolvimento corporal, a saúde, o trabalho em equipe e a consciência sobre a importância da atividade física para a qualidade de vida', 'Educação Física é a disciplina que promove o desenvolvimento corporal, a saúde, o trabalho em equipe e a consciência sobre a importância da atividade física para a qualidade de vida', 0, 1, 1, '2025-09-17 16:44:59', 2);

-- --------------------------------------------------------

--
-- Estrutura para tabela `materias_materiais`
--

CREATE TABLE `materias_materiais` (
  `materia_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `materias_materiais`
--

INSERT INTO `materias_materiais` (`materia_id`, `material_id`, `id`) VALUES
(2, 1, 2),
(1, 1, 3),
(3, 1, 4),
(4, 1, 5),
(5, 1, 6),
(6, 1, 7),
(7, 1, 8),
(8, 1, 9),
(9, 1, 10),
(10, 1, 11),
(11, 1, 12);

-- --------------------------------------------------------

--
-- Estrutura para tabela `mensagens`
--

CREATE TABLE `mensagens` (
  `id` int(11) NOT NULL,
  `conversa_id` int(11) NOT NULL,
  `remetente_id` int(11) NOT NULL,
  `mensagem` text NOT NULL,
  `criada_em` datetime DEFAULT current_timestamp(),
  `visto` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `mensagens`
--

INSERT INTO `mensagens` (`id`, `conversa_id`, `remetente_id`, `mensagem`, `criada_em`, `visto`) VALUES
(102, 14, 1, 'fala joao', '2025-08-26 13:38:33', 0),
(103, 3, 1, 'fala krysthyan', '2025-08-26 13:38:50', 0),
(104, 15, 1, 'tudo bem jose?', '2025-08-26 13:40:16', 0),
(105, 16, 1, 'hrtherhereter', '2025-08-26 15:11:41', 0),
(106, 16, 1, 'tretrtw', '2025-08-26 15:11:45', 0),
(107, 14, 1, 'efwefewf', '2025-08-26 15:27:09', 0),
(108, 3, 1, 'dwqweq', '2025-08-26 15:52:38', 0),
(109, 3, 1, 'eqwe', '2025-08-26 15:52:41', 0),
(110, 15, 1, '6636346', '2025-08-26 15:52:57', 0),
(111, 15, 1, 'retertw', '2025-08-26 15:55:13', 0),
(112, 16, 1, '23456789', '2025-08-26 16:07:50', 0),
(113, 15, 1, 'trsyrst', '2025-08-26 16:08:33', 0),
(114, 16, 1, 'fala marcelo', '2025-08-27 12:07:40', 0),
(115, 15, 1, 'ola jose', '2025-08-27 12:07:45', 0),
(116, 14, 1, 'fala jao', '2025-08-27 12:07:51', 0),
(117, 15, 1, 'jose', '2025-08-27 12:08:39', 0),
(118, 15, 1, 'opa', '2025-08-27 13:37:16', 0),
(119, 19, 1, 'raissa', '2025-08-27 14:32:21', 0),
(120, 20, 1, 'opa', '2025-08-27 14:32:29', 0),
(121, 3, 1, 'fewfefwr', '2025-08-27 14:40:09', 0),
(122, 19, 1, 'tudo bem?', '2025-08-27 14:55:02', 0),
(123, 14, 1, 'joao', '2025-08-27 16:05:10', 0),
(124, 16, 1, 'Ei lindo', '2025-08-28 09:56:20', 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `mensalidades`
--

CREATE TABLE `mensalidades` (
  `id` int(11) NOT NULL,
  `aluno_id` int(11) DEFAULT NULL,
  `valor` decimal(10,2) DEFAULT NULL,
  `data_inicial` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `mensalidades`
--

INSERT INTO `mensalidades` (`id`, `aluno_id`, `valor`, `data_inicial`) VALUES
(6, 8, 1200.00, '2025-10-01'),
(7, 10, 1200.00, '2025-09-01'),
(8, 12, 1232.00, '2025-09-01'),
(9, 16, 1111.00, '2025-10-01'),
(10, 20, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `notas`
--

CREATE TABLE `notas` (
  `id` int(11) NOT NULL,
  `tipo` varchar(255) NOT NULL,
  `valor` int(11) NOT NULL,
  `nota` int(11) NOT NULL,
  `recuperacao` enum('Sim','Não') NOT NULL DEFAULT 'Não',
  `nota_rec` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `avaliacao_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `notificacoes`
--

CREATE TABLE `notificacoes` (
  `id` int(11) NOT NULL,
  `tipo` enum('mensagem','outro_tipo') NOT NULL DEFAULT 'mensagem',
  `conversa_id` int(11) NOT NULL,
  `remetente_id` int(11) NOT NULL,
  `destinatario_id` int(11) NOT NULL,
  `conteudo` text DEFAULT NULL,
  `lida` tinyint(1) DEFAULT 0,
  `criada_em` datetime DEFAULT current_timestamp(),
  `visualizada` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `notificacoes`
--

INSERT INTO `notificacoes` (`id`, `tipo`, `conversa_id`, `remetente_id`, `destinatario_id`, `conteudo`, `lida`, `criada_em`, `visualizada`) VALUES
(7, 'mensagem', 3, 1, 2, 'krysthayn', 0, '2025-08-25 14:32:55', 0),
(8, 'mensagem', 3, 1, 2, 'krysthayn', 0, '2025-08-25 14:32:55', 0),
(11, 'mensagem', 3, 1, 2, 'fqwfqwqwf', 0, '2025-08-25 14:35:19', 0),
(12, 'mensagem', 3, 1, 2, 'fqwfqwqwf', 0, '2025-08-25 14:35:19', 0),
(57, 'mensagem', 3, 1, 2, 'erwerewrewgegettewetwt', 0, '2025-08-25 15:23:44', 0),
(58, 'mensagem', 3, 1, 2, 'erwerewrewgegettewetwt', 0, '2025-08-25 15:23:44', 0),
(59, 'mensagem', 3, 1, 2, 'rwerwe', 0, '2025-08-25 15:23:46', 0),
(60, 'mensagem', 3, 1, 2, 'rwerwe', 0, '2025-08-25 15:23:46', 0),
(61, 'mensagem', 3, 1, 2, 'fewtewtew', 0, '2025-08-25 15:26:34', 0),
(68, 'mensagem', 3, 1, 2, 'tewtewtew', 0, '2025-08-25 15:41:33', 0),
(69, 'mensagem', 3, 1, 2, 'twetwhhwrhwrwe', 0, '2025-08-25 15:41:35', 0),
(75, 'mensagem', 3, 1, 2, 'tweetwetw', 0, '2025-08-25 15:50:08', 0),
(76, 'mensagem', 3, 1, 2, '212232', 0, '2025-08-25 15:50:12', 0),
(77, 'mensagem', 3, 1, 2, '32353535', 0, '2025-08-25 15:50:39', 0),
(78, 'mensagem', 3, 1, 2, '563754535', 0, '2025-08-25 15:50:44', 0),
(79, 'mensagem', 3, 1, 2, 'dwqrqwr', 0, '2025-08-25 15:51:05', 0),
(84, 'mensagem', 3, 1, 2, '4322353523', 0, '2025-08-25 15:58:30', 0),
(86, 'mensagem', 3, 1, 2, '4324325325', 0, '2025-08-25 15:58:46', 0),
(87, 'mensagem', 3, 1, 2, '42432532', 0, '2025-08-25 15:58:50', 0),
(93, 'mensagem', 3, 1, 2, 'regrtrt', 0, '2025-08-26 10:25:07', 0),
(99, 'mensagem', 3, 1, 2, '24366436634', 0, '2025-08-26 13:29:33', 0),
(102, 'mensagem', 14, 1, 7, 'fala joao', 0, '2025-08-26 13:38:33', 0),
(103, 'mensagem', 3, 1, 2, 'fala krysthyan', 0, '2025-08-26 13:38:50', 0),
(104, 'mensagem', 15, 1, 6, 'tudo bem jose?', 0, '2025-08-26 13:40:16', 0),
(105, 'mensagem', 16, 1, 3, 'hrtherhereter', 0, '2025-08-26 15:11:41', 0),
(106, 'mensagem', 16, 1, 3, 'tretrtw', 0, '2025-08-26 15:11:45', 0),
(107, 'mensagem', 14, 1, 7, 'efwefewf', 0, '2025-08-26 15:27:09', 0),
(108, 'mensagem', 3, 1, 2, 'dwqweq', 0, '2025-08-26 15:52:38', 0),
(109, 'mensagem', 3, 1, 2, 'eqwe', 0, '2025-08-26 15:52:42', 0),
(110, 'mensagem', 15, 1, 6, '6636346', 0, '2025-08-26 15:52:57', 0),
(111, 'mensagem', 15, 1, 6, 'retertw', 0, '2025-08-26 15:55:13', 0),
(112, 'mensagem', 16, 1, 3, '23456789', 0, '2025-08-26 16:07:50', 0),
(113, 'mensagem', 15, 1, 6, 'trsyrst', 0, '2025-08-26 16:08:33', 0),
(114, 'mensagem', 16, 1, 3, 'fala marcelo', 0, '2025-08-27 12:07:40', 0),
(115, 'mensagem', 15, 1, 6, 'ola jose', 0, '2025-08-27 12:07:45', 0),
(116, 'mensagem', 14, 1, 7, 'fala jao', 0, '2025-08-27 12:07:51', 0),
(117, 'mensagem', 15, 1, 6, 'jose', 0, '2025-08-27 12:08:39', 0),
(118, 'mensagem', 15, 1, 6, 'opa', 0, '2025-08-27 13:37:16', 0),
(119, 'mensagem', 19, 1, 5, 'raissa', 0, '2025-08-27 14:32:21', 0),
(120, 'mensagem', 20, 1, 4, 'opa', 0, '2025-08-27 14:32:29', 0),
(121, 'mensagem', 3, 1, 2, 'fewfefwr', 0, '2025-08-27 14:40:09', 0),
(122, 'mensagem', 19, 1, 5, 'tudo bem?', 0, '2025-08-27 14:55:02', 0),
(123, 'mensagem', 14, 1, 7, 'joao', 0, '2025-08-27 16:05:10', 0),
(124, 'mensagem', 16, 1, 3, 'Ei lindo', 0, '2025-08-28 09:56:20', 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `notificacoes_eventos`
--

CREATE TABLE `notificacoes_eventos` (
  `id` int(11) NOT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `conteudo` varchar(255) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `data` datetime DEFAULT current_timestamp(),
  `usuario_id` int(11) DEFAULT NULL,
  `lida` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `notificacoes_eventos`
--

INSERT INTO `notificacoes_eventos` (`id`, `tipo`, `conteudo`, `titulo`, `data`, `usuario_id`, `lida`) VALUES
(2, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-22 12:20:40', 3, 0),
(3, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-22 12:20:40', 5, 0),
(10, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:36:51', 2, 0),
(11, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:36:51', 3, 0),
(12, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:36:51', 4, 0),
(13, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:36:51', 5, 0),
(14, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:36:51', 7, 0),
(15, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 2, 0),
(16, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 2, 0),
(17, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 3, 0),
(18, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 3, 0),
(19, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 4, 0),
(20, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 4, 0),
(21, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 5, 0),
(22, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 5, 0),
(23, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 7, 0),
(24, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 7, 0),
(25, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 2, 0),
(26, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 2, 0),
(27, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 3, 0),
(28, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 3, 0),
(29, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 4, 0),
(30, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 4, 0),
(31, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 5, 0),
(32, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 5, 0),
(33, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 7, 0),
(34, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 2, 0),
(35, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 2, 0),
(36, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 3, 0),
(37, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 3, 0),
(38, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 4, 0),
(39, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 4, 0),
(40, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 5, 0),
(41, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 5, 0),
(42, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 7, 0),
(43, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 7, 0),
(44, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 2, 0),
(45, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 2, 0),
(46, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 3, 0),
(47, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 3, 0),
(48, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 4, 0),
(49, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 4, 0),
(50, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 5, 0),
(51, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 5, 0),
(52, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 7, 0),
(53, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 7, 0),
(54, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 2, 0),
(55, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 2, 0),
(56, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 3, 0),
(57, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 3, 0),
(58, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 4, 0),
(59, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 4, 0),
(60, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 5, 0),
(61, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 5, 0),
(62, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 7, 0),
(63, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 2, 0),
(64, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 2, 0),
(65, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 3, 0),
(66, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 3, 0),
(67, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 4, 0),
(68, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 4, 0),
(69, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 5, 0),
(70, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 5, 0),
(71, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 7, 0),
(72, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 7, 0),
(73, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 2, 0),
(74, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 2, 0),
(75, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 3, 0),
(76, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 3, 0),
(77, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 4, 0),
(78, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 4, 0),
(79, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 5, 0),
(80, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 5, 0),
(81, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 7, 0),
(82, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 7, 0),
(83, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 2, 0),
(84, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 2, 0),
(85, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 3, 0),
(86, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 3, 0),
(87, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 4, 0),
(88, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 4, 0),
(89, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 5, 0),
(90, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 5, 0),
(91, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 7, 0),
(92, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 7, 0),
(93, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 2, 0),
(94, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 2, 0),
(95, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 3, 0),
(96, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 3, 0),
(97, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 4, 0),
(98, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 4, 0),
(99, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 5, 0),
(100, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 5, 0),
(101, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 7, 0),
(102, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 7, 0),
(103, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 2, 0),
(104, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 2, 0),
(105, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 3, 0),
(106, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 3, 0),
(107, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 4, 0),
(108, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 4, 0),
(109, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 5, 0),
(110, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 5, 0),
(111, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 7, 0),
(112, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 7, 0),
(113, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 2, 0),
(114, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 2, 0),
(115, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 3, 0),
(116, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 3, 0),
(117, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 4, 0),
(118, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 4, 0),
(119, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 5, 0),
(120, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 5, 0),
(121, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 7, 0),
(122, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 7, 0),
(123, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 2, 0),
(124, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 2, 0),
(125, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 3, 0),
(126, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 3, 0),
(127, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 4, 0),
(128, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 4, 0),
(129, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 5, 0),
(130, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 5, 0),
(131, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 7, 0),
(132, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 7, 0),
(133, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 2, 0),
(134, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 2, 0),
(135, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 3, 0),
(136, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 3, 0),
(137, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 4, 0),
(138, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 4, 0),
(139, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 5, 0),
(140, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 5, 0),
(141, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 7, 0),
(142, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 7, 0),
(143, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 2, 0),
(144, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 2, 0),
(145, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 3, 0),
(146, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 3, 0),
(147, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 4, 0),
(148, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 4, 0),
(149, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 5, 0),
(150, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 5, 0),
(151, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 7, 0),
(152, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 7, 0),
(153, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 2, 0),
(154, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 2, 0),
(155, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 3, 0),
(156, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 3, 0),
(157, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 4, 0),
(158, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 4, 0),
(159, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 5, 0),
(160, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 5, 0),
(161, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 7, 0),
(162, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 7, 0),
(163, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 2, 0),
(164, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 2, 0),
(165, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 3, 0),
(166, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 3, 0),
(167, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 4, 0),
(168, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 4, 0),
(169, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 5, 0),
(170, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 5, 0),
(171, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 7, 0),
(172, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 7, 0),
(173, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 2, 0),
(174, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 2, 0),
(175, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 3, 0),
(176, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 3, 0),
(177, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 4, 0),
(178, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 4, 0),
(179, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 5, 0),
(180, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 5, 0),
(181, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 7, 0),
(182, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 7, 0),
(183, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 2, 0),
(184, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 2, 0),
(185, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 3, 0),
(186, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 3, 0),
(187, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 4, 0),
(188, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 4, 0),
(189, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 5, 0),
(190, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 5, 0),
(191, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 7, 0),
(192, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 7, 0),
(193, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 2, 0),
(194, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 2, 0),
(195, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 3, 0),
(196, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 3, 0),
(197, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 4, 0),
(198, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 4, 0),
(199, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 5, 0),
(200, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 5, 0),
(201, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 7, 0),
(202, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 7, 0),
(203, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 2, 0),
(204, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 2, 0),
(205, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 3, 0),
(206, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 3, 0),
(207, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 4, 0),
(208, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 4, 0),
(209, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 5, 0),
(210, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 5, 0),
(211, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 7, 0),
(212, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 7, 0),
(213, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 2, 0),
(214, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 2, 0),
(215, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 3, 0),
(216, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 3, 0),
(217, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 4, 0),
(218, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 4, 0),
(219, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 5, 0),
(220, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 5, 0),
(221, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 7, 0),
(222, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 7, 0),
(225, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 3, 0),
(226, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 3, 0),
(227, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 4, 0),
(228, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 4, 0),
(229, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 5, 0),
(230, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 5, 0),
(231, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 7, 0),
(232, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 7, 0),
(233, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:32:15', 7, 0),
(234, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:32:25', 6, 0),
(235, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:32:32', 6, 0),
(237, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:33:05', 4, 0),
(239, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:35:27', 4, 0),
(240, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:36:40', 4, 0),
(241, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:36:49', 6, 0),
(242, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:42:44', 6, 0),
(243, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:49:00', 6, 0),
(244, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:49:03', 6, 0),
(245, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:54:05', 6, 0),
(246, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:54:23', 3, 0),
(247, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:54:46', 7, 0),
(248, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:54:53', 6, 0),
(249, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:55:42', 3, 0),
(250, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:55:50', 3, 0),
(251, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:58:34', 6, 0),
(252, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:58:40', 6, 0),
(253, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:58:55', 6, 0),
(254, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 15:01:49', 6, 0),
(255, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 15:02:30', 6, 0),
(256, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 15:20:26', 3, 0),
(257, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 15:20:27', 3, 0),
(258, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 15:20:29', 3, 0),
(259, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 15:20:30', 3, 0),
(260, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 15:20:51', 3, 0),
(264, 'envio_material', 'Um novo material foi enviado para sua turma.', 'Novo material disponível', '2025-09-17 14:35:18', 3, 0),
(265, 'envio_material', 'Um novo material foi enviado para sua turma.', 'Novo material disponível', '2025-09-17 14:35:18', 5, 0),
(266, 'envio_material', 'Um novo material foi enviado para sua turma.', 'Novo material disponível', '2025-09-17 14:35:18', 4, 0),
(267, 'envio_material', 'Um novo material foi enviado para sua turma.', 'Novo material disponível', '2025-09-17 14:35:18', 7, 0),
(269, 'envio_material', 'Um novo material foi enviado para sua turma.', 'Novo material disponível', '2025-09-23 11:20:06', 3, 0),
(270, 'envio_material', 'Um novo material foi enviado para sua turma.', 'Novo material disponível', '2025-09-23 11:20:06', 5, 0),
(271, 'envio_material', 'Um novo material foi enviado para sua turma.', 'Novo material disponível', '2025-09-23 11:20:06', 4, 0),
(272, 'envio_material', 'Um novo material foi enviado para sua turma.', 'Novo material disponível', '2025-09-23 11:20:06', 7, 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `pagamentos_funcionarios`
--

CREATE TABLE `pagamentos_funcionarios` (
  `id` int(11) NOT NULL,
  `funcionario_id` int(11) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `data_inicial` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `pagamentos_funcionarios`
--

INSERT INTO `pagamentos_funcionarios` (`id`, `funcionario_id`, `valor`, `data_inicial`) VALUES
(1, 6, 3500.00, '2025-07-01');

-- --------------------------------------------------------

--
-- Estrutura para tabela `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `tipo` varchar(255) NOT NULL,
  `cutidas` int(11) NOT NULL,
  `qt_comentarios` int(11) NOT NULL,
  `data` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `presencas`
--

CREATE TABLE `presencas` (
  `id` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `presenca` tinyint(1) NOT NULL,
  `aula_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `professores_materias`
--

CREATE TABLE `professores_materias` (
  `id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `professores_materias`
--

INSERT INTO `professores_materias` (`id`, `professor_id`, `materia_id`) VALUES
(3, 6, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `professores_turmas`
--

CREATE TABLE `professores_turmas` (
  `id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `responsaveis`
--

CREATE TABLE `responsaveis` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `numero1` varchar(20) NOT NULL,
  `numero2` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `grau_parentesco` varchar(50) DEFAULT NULL,
  `nacionalidade` varchar(50) DEFAULT 'Brasileira',
  `estado_civil` varchar(50) DEFAULT NULL,
  `profissao` varchar(100) DEFAULT NULL,
  `responsavel_financeiro` enum('Sim','Não') NOT NULL DEFAULT 'Não',
  `cep` varchar(9) DEFAULT NULL,
  `logradouro` varchar(255) DEFAULT NULL,
  `numero_casa` varchar(20) DEFAULT NULL COMMENT 'Nome da coluna alterado para evitar conflito com a coluna "numero1"',
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `telefone_contato` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `responsaveis`
--

INSERT INTO `responsaveis` (`id`, `nome`, `numero1`, `numero2`, `email`, `cpf`, `rg`, `grau_parentesco`, `nacionalidade`, `estado_civil`, `profissao`, `responsavel_financeiro`, `cep`, `logradouro`, `numero_casa`, `complemento`, `bairro`, `cidade`, `estado`, `telefone_contato`) VALUES
(1, 'Clara', '31988880007', '31932323232', 'Joao3112@gmail.com', '01262224542', '0267250', 'Avó', 'Brasileira', 'Casado(a)', 'Panhador de café', 'Não', '30110000', 'Rua da Bahia', '250', NULL, 'Funcionários', 'Belo Horizonte', NULL, '31932323232'),
(2, 'Lara', '31931313131', '31932323232', 'Joao99@gmail.com', '02032224543', '0233450', 'Mãe', 'Brasileira', 'Casado(a)', 'Panhador de café', 'Não', '30110000', 'Rua das Acácias', '250', NULL, 'Maraca', 'Belo Horizonte', NULL, '31932323232'),
(3, 'Lara S', '31931313131', '31932323232', 'Joao91@gmail.com', '02032224541', '0233454', 'Mãe', 'Brasileira', 'Casado(a)', 'Panhador de café', 'Sim', '30110000', 'Rua das Acácias', '250', NULL, 'Maraca', 'Belo Horizonte', NULL, '31932323232'),
(4, 'Julio', '31988880004', '31932323232', 'Joao23@gmail.com', '02032221543', '999999999', 'Avô', 'Brasileira', 'Solteiro(a)', 'Autônomo', 'Não', '30160010', 'Av. Brasil', '320', NULL, 'Funcionários', 'Belo Horizonte', NULL, '31932323232'),
(5, 'Arthur Lopes Saraiva', '31982471122', NULL, 'arthursaraiva@gmail.com', '11111111111', NULL, 'Próprio Aluno', 'Brasileira', NULL, NULL, 'Não', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'Arthur L. Saraiva', '(31) 98247-1144', NULL, 'Joaovv@gmail.com', '99999999999', NULL, 'Próprio Aluno', 'Brasileira', NULL, NULL, 'Não', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'Geovanna', '31988880001', '31932323232', 'maria.souza@example.com', '33333333333', '33333333', 'Avó', 'Brasileira', 'Solteiro(a)', 'Engenheiro', 'Não', '30110000', 'Rua das Acácias', '1200', NULL, 'Centro', 'Belo Horizonte', NULL, '31932323232'),
(9, 'Arthur Teste', '(31) 98247-1144', NULL, 'arthur11@gmail.com', '77777777777', NULL, 'Próprio Aluno', 'Brasileira', NULL, NULL, 'Não', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'Arthur Teste 2', '(31) 98247-1144', NULL, 'arthur123@gmail.com', '02036224544', NULL, 'Próprio Aluno', 'Brasileira', NULL, NULL, 'Sim', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `seguidores`
--

CREATE TABLE `seguidores` (
  `seguidor_id` int(11) NOT NULL,
  `seguido_id` int(11) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Acionadores `seguidores`
--
DELIMITER $$
CREATE TRIGGER `trg_after_delete_seguidores` AFTER DELETE ON `seguidores` FOR EACH ROW BEGIN
  -- decrementa contador de quem foi seguido
  UPDATE stats_seguidores
    SET qtd_seguidores = qtd_seguidores - 1
  WHERE user_id = OLD.seguido_id;
  
  -- decrementa contador de quem seguiu
  UPDATE stats_seguidores
    SET qtd_seguindo = qtd_seguindo - 1
  WHERE user_id = OLD.seguidor_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_after_insert_seguidores` AFTER INSERT ON `seguidores` FOR EACH ROW BEGIN
  -- incrementa contador de quem foi seguido
  UPDATE stats_seguidores
    SET qtd_seguidores = qtd_seguidores + 1
  WHERE user_id = NEW.seguido_id;
  
  -- incrementa contador de quem seguiu
  UPDATE stats_seguidores
    SET qtd_seguindo = qtd_seguindo + 1
  WHERE user_id = NEW.seguidor_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `stats_seguidores`
--

CREATE TABLE `stats_seguidores` (
  `user_id` int(11) NOT NULL,
  `qtd_seguidores` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `qtd_seguindo` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `stats_seguidores`
--

INSERT INTO `stats_seguidores` (`user_id`, `qtd_seguidores`, `qtd_seguindo`) VALUES
(1, 0, 0),
(2, 0, 0),
(3, 0, 0),
(4, 0, 0),
(5, 0, 0),
(6, 0, 0),
(7, 0, 0),
(8, 0, 0),
(9, 0, 0),
(10, 0, 0),
(11, 0, 0),
(12, 0, 0),
(13, 0, 0),
(14, 0, 0),
(15, 0, 0),
(16, 0, 0),
(17, 0, 0),
(18, 0, 0),
(19, 0, 0),
(20, 0, 0),
(21, 0, 0),
(22, 0, 0),
(23, 0, 0),
(24, 0, 0),
(26, 0, 0),
(27, 0, 0),
(28, 0, 0),
(29, 0, 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `status_digitando`
--

CREATE TABLE `status_digitando` (
  `conversa_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `destinatario_id` int(11) NOT NULL,
  `atualizado_em` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `transacoes`
--

CREATE TABLE `transacoes` (
  `id` int(11) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `id_pessoa` int(11) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `desconto_percentual` decimal(5,2) DEFAULT NULL,
  `valor_com_desconto` decimal(10,2) NOT NULL,
  `tipo` enum('receita','despesa') NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `data_referencia` date NOT NULL,
  `data_pagamento` date DEFAULT NULL,
  `data_vencimento` date NOT NULL,
  `observacao` text DEFAULT NULL,
  `forma_pagamento` varchar(50) DEFAULT NULL,
  `responsavel` varchar(255) DEFAULT NULL,
  `status` text NOT NULL,
  `comprovante_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `transacoes`
--

INSERT INTO `transacoes` (`id`, `descricao`, `id_pessoa`, `valor`, `desconto_percentual`, `valor_com_desconto`, `tipo`, `categoria`, `data_referencia`, `data_pagamento`, `data_vencimento`, `observacao`, `forma_pagamento`, `responsavel`, `status`, `comprovante_url`) VALUES
(13, 'Pagamento de Salário - jose', 6, 3500.00, 0.00, 3500.00, 'despesa', 'salarios dos funcionarios', '2025-08-01', NULL, '2025-08-11', NULL, NULL, 'sistema', 'atrasado', NULL),
(14, 'Pagamento de Salário - jose', 6, 3500.00, 0.00, 3500.00, 'despesa', 'salarios dos funcionarios', '2025-09-01', NULL, '2025-09-11', NULL, NULL, 'sistema', 'atrasado', NULL),
(15, 'Mensalidade - Marcelo Ferreira', 10, 1200.00, 0.00, 1200.00, 'receita', 'mensalidades', '2025-09-01', NULL, '2025-09-11', NULL, NULL, 'sistema', 'atrasado', NULL),
(16, 'Mensalidade - Rinaldo Junior ', 12, 1232.00, 0.00, 1232.00, 'receita', 'mensalidades', '2025-09-01', NULL, '2025-09-11', NULL, NULL, 'sistema', 'atrasado', NULL),
(17, 'Mensalidade - Marcelo Ferreira', 8, 1200.00, 5.00, 1140.00, 'receita', 'mensalidades', '2025-10-01', NULL, '2025-10-11', NULL, NULL, 'sistema', 'atrasado', NULL),
(18, 'Mensalidade - Marcelo Ferreira', 10, 1200.00, 0.00, 1200.00, 'receita', 'mensalidades', '2025-10-01', NULL, '2025-10-11', NULL, NULL, 'sistema', 'atrasado', NULL),
(19, 'Mensalidade - 232eqweewasdas', 12, 1232.00, 0.00, 1232.00, 'receita', 'mensalidades', '2025-10-01', NULL, '2025-10-11', NULL, NULL, 'sistema', 'atrasado', NULL),
(20, 'Mensalidade - usuarioteste', 16, 1111.00, 0.00, 1111.00, 'receita', 'mensalidades', '2025-10-01', NULL, '2025-10-11', NULL, NULL, 'sistema', 'atrasado', NULL),
(21, 'Pagamento de Salário - jose', 6, 3500.00, 0.00, 3500.00, 'despesa', 'salarios dos funcionarios', '2025-10-01', NULL, '2025-10-11', NULL, NULL, 'sistema', 'atrasado', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `turmas`
--

CREATE TABLE `turmas` (
  `id` int(11) NOT NULL,
  `nome_turma` varchar(100) NOT NULL,
  `ano_letivo` year(4) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `aulas_por_dia` int(11) NOT NULL DEFAULT 5,
  `serie` varchar(50) DEFAULT NULL,
  `turno` enum('Matutino','Vespertino','Noturno') DEFAULT NULL,
  `etapa_ensino` enum('EI','EFAI','EFAF','EM') DEFAULT NULL,
  `qtd_alunos` int(11) NOT NULL DEFAULT 0,
  `professor_responsavel` int(11) DEFAULT NULL,
  `curso_id` int(11) DEFAULT NULL COMMENT 'ID do curso de pós-graduação vinculado',
  `materias_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array de IDs das matérias vinculadas' CHECK (json_valid(`materias_ids`)),
  `semestre_id` int(11) DEFAULT NULL COMMENT 'ID do período letivo (semestre) vinculado',
  `modalidade` enum('Presencial','Híbrido','EAD') DEFAULT NULL,
  `quantidade_alunos` int(11) DEFAULT NULL COMMENT 'Quantidade estimada de alunos',
  `status` enum('Ativa','Em Planejamento','Encerrada') DEFAULT NULL,
  `descricao` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `turmas`
--

INSERT INTO `turmas` (`id`, `nome_turma`, `ano_letivo`, `created_at`, `aulas_por_dia`, `serie`, `turno`, `etapa_ensino`, `qtd_alunos`, `professor_responsavel`, `curso_id`, `materias_ids`, `semestre_id`, `modalidade`, `quantidade_alunos`, `status`, `descricao`) VALUES
(3, 'Turma 1', '2025', '2025-10-30 17:18:28', 5, NULL, NULL, NULL, 2, 22, 4, '[\"17\"]', 16, 'Presencial', 30, 'Ativa', 'kkkkkkkkkkkkkkkkkkk'),
(5, 'Turma 1', '2025', '2025-10-31 14:51:39', 5, NULL, NULL, NULL, 0, 22, 4, '[\"19\"]', 16, 'Presencial', 30, 'Ativa', 'kkkkkkkkkk'),
(6, 'Turma 2', '2025', '2025-10-31 14:53:27', 5, NULL, NULL, NULL, 0, 22, 4, '[\"17\"]', 16, 'Presencial', 30, 'Ativa', 'kkkkkkkkkk'),
(7, 'Turma 1', '2025', '2025-10-31 18:15:25', 5, NULL, NULL, NULL, 0, 6, 6, '[\"27\"]', 16, 'Presencial', 45, 'Ativa', 'kkkkkkkkkkk');

-- --------------------------------------------------------

--
-- Estrutura para tabela `turmas_materias`
--

CREATE TABLE `turmas_materias` (
  `id` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `turmas_materias`
--

INSERT INTO `turmas_materias` (`id`, `turma_id`, `materia_id`) VALUES
(15, 3, 5);

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `login` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('aluno','responsavel','professor','gestor') NOT NULL,
  `status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
  `nome` varchar(50) NOT NULL,
  `cpf` varchar(11) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `foto_url` varchar(255) DEFAULT NULL,
  `last_seen` timestamp NULL DEFAULT NULL COMMENT 'Registra a última vez que o usuário esteve ativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `login`, `senha`, `email`, `role`, `status`, `nome`, `cpf`, `telefone`, `created_at`, `foto_url`, `last_seen`) VALUES
(1, 'admin', '$2a$10$277ebYX8de9naMMcHyLiseq46sehpWUe.cCX7g09aDYFDc9rE65by', 'admin@gmail.com', 'gestor', 'ativo', 'admin', NULL, NULL, '2025-07-08 18:13:54', NULL, '2025-10-31 17:48:00'),
(2, 'krysthyan', '$2b$10$KMJrFAJmdYHujl20TRrJYu5tr8DtEbnSSbaoKyOp5ChMkm/DRV9Ei', 'krysthyan@gmail.com', 'aluno', 'ativo', 'Krysthyan', NULL, NULL, '2025-07-17 13:59:58', '/uploads/73613a84a8060384359358d40ff0fe19', '2025-10-23 12:57:26'),
(3, 'marcelo', '$2b$10$0GUe.kHSKZSHT3xd0phzSOGG5LQPhYUEc44ssaOac3oDz/t.P3VCK', 'marcelo@gmail.com', 'aluno', 'ativo', 'Marcelo', NULL, NULL, '2025-07-17 14:01:45', '', NULL),
(4, 'rinaldo', '$2b$10$8gNSZSqJYdoXGzInfmGdwehqQcMNnFnMWkEBOemf6pbqERHSbU7JG', 'junio@gmail.com', 'aluno', 'ativo', 'Rinaldo', NULL, NULL, '2025-07-17 14:02:30', '', NULL),
(5, 'raissab', '$2b$10$wVhJ.IPozJLJDNgyc6O4GOOCAiTaQEuj87ALJjP1Mf8urwfoiMzgu', 'raissa@gmail.com', 'aluno', 'ativo', 'Raissa', NULL, NULL, '2025-07-17 14:02:56', '', NULL),
(6, 'jose', '$2b$10$r6YVVFnOZOgFHNJ8DhWUQeoIdKU1tAdbqHMszE0pUH34/kcSdXZU2', 'jose@gmail.com', 'professor', 'ativo', 'jose', NULL, NULL, '2025-07-22 12:48:08', '', '2025-09-23 14:20:54'),
(7, 'joao', '$2b$10$ocLNcZt9VDeTHNlIewCHQ.bK8yaduEAYrtxxmxu9jCEznShGW.PlO', 'joao@escola.com.br', 'aluno', 'inativo', 'João Vieira', NULL, NULL, '2025-07-22 16:47:09', '/uploads/2f18c75abcbf3ba4c00234d51cd60799', NULL),
(8, 'marceloNexum', '$2b$10$fyiX8nxbq1j7UmFRdTMPKOUFlg8RJiySpeVdOKebpVTVAxzR/3dpO', 'marceloNexum@gmail.com', 'aluno', 'ativo', 'Marcelo Ferreira', NULL, NULL, '2025-09-17 17:47:25', '', NULL),
(9, 'marceloCompleto', '$2b$10$fsPuidL8UlRMTq2q3CwlceSyGUgIFF4/esbMTUjy1XGFDfqET4.Na', 'the.marcelof@gmail.com', 'aluno', 'ativo', 'Marcelo Ferreira', NULL, NULL, '2025-09-24 19:09:52', '/uploads/1758740992212-140524608.png', NULL),
(10, 'dasdadasdasda', '$2b$10$wo8pb1F8VFARB70Ji9g0ZOfr2BxhZK5Pk/nN1AGIE7ay.7uPmMd06', 'the.marcelofNovo@gmail.com', 'aluno', 'ativo', 'Marcelo Ferreira', '12629680622', NULL, '2025-09-24 19:17:04', '/uploads/1758741424481-433567356.png', '2025-09-25 12:06:15'),
(11, 'paidojunior@gmail.com', '$2b$10$iaCAs11H4GYG.uxLwJnVUeINsXnxA72DJituzKmBwM1lw07RxCgIq', 'ddfbdfgsdfd@gmail.com', 'responsavel', 'ativo', '24dsfsdfdssdfdsfsdfs', '23132143232', '21423534523', '2025-09-25 14:18:44', NULL, NULL),
(12, 'marceloCompletoNovo', '$2b$10$Od6OBmUJ5JHGpHwYlT/QW.vnDVbHyY3cXfONxki9eh1HDUtFsnc82', 'the.sad@gmail.com', 'aluno', 'inativo', '232eqweewasdas', NULL, NULL, '2025-09-25 14:18:44', '/uploads/1758809924095-718224439.png', NULL),
(13, 'maedojunior@gmail.com', '$2b$10$QEwS0tmTRQM4gS1IIgw.zup.KqQuJBVb36YG/kyOriWgnGElDWCX6', 'maedojunior@gmail.com', 'responsavel', 'ativo', 'Mae do Junior', '14567110801', '31241234212', '2025-09-25 16:25:36', NULL, NULL),
(14, 'sdasdas@gmail.com', '$2b$10$dcGCqSrwuTWSxIpps675xO/XKvJgApE.Vl9LXMDlKLSDTDLKnE2gm', 'sdasdas@gmail.com', 'responsavel', 'ativo', 'PaiDoJoao', '23123123131', '32423543534', '2025-09-26 16:55:56', NULL, NULL),
(15, 'usuarioteste@gmail.com', '$2b$10$9JiiYG8lpW5TXwAwdMq2ZebjKCoWHBOh89jPWzPn/tXGMmRwgSmOu', 'usuarioteste@gmail.com', 'responsavel', 'ativo', 'Uusuário Teste', '10101010101', '(10) 10101-0101', '2025-09-26 17:23:59', NULL, NULL),
(16, 'usuarioteste', '$2b$10$/YZgh/ttqlZ0yFSdkqZzKOu53U1G58mXP6Iou1muk4H2IAxtxskrC', 'usuarioteste@gmail.com', 'aluno', 'ativo', 'usuarioteste', NULL, NULL, '2025-09-26 17:23:59', '/uploads/1758907439058-202349397.jpg', NULL),
(17, 'paidoarthur@gmail.com', '$2b$10$4etl0FlXrJk65oof3tUCVO0gEkjtmTRDm.qNJVDI.RYHLovW0evn.', 'paidoarthur@gmail.com', 'responsavel', 'ativo', 'Pai do Arthur', '12629612315', '52453456345', '2025-09-26 18:15:22', NULL, NULL),
(18, 'Arthur', '$2b$10$mepSFJpLov/aiL5lJ0uIM.ZfyrCOvxFtIH6aabOygLrGVUaoWzRIy', 'arthur@gmail.com', 'aluno', 'ativo', 'Arthur Jesussdfsd', NULL, NULL, '2025-09-26 18:15:22', '/uploads/1758910522190-113759779.png', NULL),
(19, 'paidolucas@gmail.com', '$2b$10$0fJ2McVtKuCT/RlTo729WeYsw9q5c9Zzf3wt8JyqN5XHUT/Gu3vZC', 'paidolucas@gmail.com', 'responsavel', 'ativo', 'Pai do Lucas', '12431243243', '(12) 35462-1412', '2025-09-26 18:27:41', NULL, NULL),
(20, 'lucasum', '$2b$10$rK2y/upUxF2BIFHXDNCZHeOQeDagythRuWfZ9eOVW7ZrgjYG5Rlz.', 'lucasferreira@gmail.com', 'aluno', 'ativo', 'Lucas Ferreira', NULL, NULL, '2025-09-26 18:27:41', '/uploads/1758911261009-736922933.png', NULL),
(21, 'lucas@gmail.com', '$2b$10$dsRwmxL8H9lb5k7Y/JaqWOTpqsT0wBlJADyhA8ERvOcrUwQIaZqru', 'lucas@gmail.com', 'responsavel', 'ativo', 'Lucas Fonseca', '52351241243', '54634632754', '2025-09-29 16:13:13', NULL, NULL),
(22, 'lela', '$2b$10$6oTF70xLe.OeASx74luWxu9JjE/4ARBDHME6Ubt2bYbcaUtFOPAy2', 'lela@gmail.com', 'professor', 'ativo', 'Lela', '54378793223', '52376832341', '2025-09-30 12:28:16', '/uploads/1759235296926-718355380.png', NULL),
(23, 'OMarceloFuncionario', '$2b$10$qQol/APCBRHsj8B7KaVv8.LJtkD2YO/y2XqZ3lsWkSzc9jo6q65b6', 'marcelofuncionarionovo@gmail.com', 'gestor', 'ativo', 'Marcelo Funcionario ', '12629680232', '31989371121', '2025-09-30 16:21:53', '/uploads/1759249857291-37726123.jpg', NULL),
(24, 'arthurlsaraiva@gmail.com', '$2b$10$U4K1dfAoM/lm1kUpks/pbueozdT01h0xqI4CPwdrxPM63naxu3vDq', 'arthursaraiva@gmail.com', 'aluno', 'ativo', 'Arthur Lopes Saraiva', '11111111111', '31982471122', '2025-10-28 17:00:31', '/uploads/download-1761670831528.jpg', NULL),
(26, 'arthurlsaraiva@gmail.com', '$2b$10$pU0wPsr3SJYr67FA/WBaH.JNaFKLhx7doucvDIvkZHQlPSmdP.NZ2', 'arthurlsaraiva@gmail.com', 'aluno', 'ativo', 'Arthur Lopes Saraiva', '22222222222', '(31) 98247-1144', '2025-10-28 17:37:05', NULL, NULL),
(27, 'arthurlsaraiva1@gmail.com', '$2b$10$fZ8q6mMsfMzdanFnAgL06ONstWB1yyPXyp3mNjTkOuBz89yqhnCNm', 'Joaovv@gmail.com', 'aluno', 'ativo', 'Arthur L. Saraiva', '99999999999', '(31) 98247-1144', '2025-10-28 17:59:54', '/uploads/download-1761674394496.jpg', NULL),
(28, 'arthurlsaraiva1h@gmail.com', '$2b$10$8NuHVqMJfQUwIMx9a1lRI.aRwMHsrUP7FoFxvj8nY2QKzKGxJyAq.', 'arthur11@gmail.com', 'aluno', 'ativo', 'Arthur Teste', '77777777777', '(31) 98247-1144', '2025-10-28 20:31:25', '/uploads/download-1761683485087.jpg', NULL),
(29, 'arthurlh12@gmail.com', '$2b$10$A2RjjfOocqTDPm9QkhmgP.sdrItNpunTl2WLaNhAn3HwL8WcBwUC6', 'arthur123@gmail.com', 'aluno', 'ativo', 'Arthur Teste 2', '02036224544', '(31) 98247-1144', '2025-10-29 14:02:13', NULL, NULL);

--
-- Acionadores `users`
--
DELIMITER $$
CREATE TRIGGER `trg_after_insert_user` AFTER INSERT ON `users` FOR EACH ROW BEGIN
  INSERT INTO stats_seguidores (
    user_id
  ) VALUES (
    NEW.id
  );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `vincular_aluno_curso`
--

CREATE TABLE `vincular_aluno_curso` (
  `id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `curso_posgraduacao_id` int(11) NOT NULL,
  `turma_id_mocado` varchar(50) DEFAULT NULL COMMENT 'Armazena o ID mocado da turma selecionada',
  `grade_mocada` varchar(50) DEFAULT NULL COMMENT 'Armazena a grade mocada selecionada',
  `data_vinculo` timestamp NOT NULL DEFAULT current_timestamp(),
  `status_matricula` enum('Ativa','Concluída','Cancelada') NOT NULL DEFAULT 'Ativa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `vincular_aluno_curso`
--

INSERT INTO `vincular_aluno_curso` (`id`, `aluno_id`, `curso_posgraduacao_id`, `turma_id_mocado`, `grade_mocada`, `data_vinculo`, `status_matricula`) VALUES
(1, 29, 8, '1', '2025.1', '2025-10-30 14:56:28', 'Ativa'),
(2, 29, 4, '1', '2025.1', '2025-10-30 15:35:20', 'Ativa');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `alunos`
--
ALTER TABLE `alunos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `alunos_responsaveis`
--
ALTER TABLE `alunos_responsaveis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluno_id` (`aluno_id`),
  ADD KEY `responsavel_id` (`responsavel_id`);

--
-- Índices de tabela `alunos_turmas`
--
ALTER TABLE `alunos_turmas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_aluno_turma_unico` (`aluno_id`,`turma_id`),
  ADD KEY `aluno_id` (`aluno_id`),
  ADD KEY `turma_id` (`turma_id`);

--
-- Índices de tabela `anuncios`
--
ALTER TABLE `anuncios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `autor_id` (`autor_id`);

--
-- Índices de tabela `anuncios_lidos`
--
ALTER TABLE `anuncios_lidos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_anuncio_unique` (`user_id`,`anuncio_id`),
  ADD KEY `anuncio_id` (`anuncio_id`);

--
-- Índices de tabela `aulas`
--
ALTER TABLE `aulas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aulas_materia` (`materia_id`),
  ADD KEY `fk_aulas_turma` (`turma_id`),
  ADD KEY `fk_aulas_calendario_gestor` (`calendario_id`);

--
-- Índices de tabela `avaliacoes`
--
ALTER TABLE `avaliacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_avaliacoes_materias` (`materia_id`),
  ADD KEY `fk_avaliacoes_turma` (`turma_id`),
  ADD KEY `fk_avaliacoes_calendario` (`calendario_id`);

--
-- Índices de tabela `calendario_gestor`
--
ALTER TABLE `calendario_gestor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_ano_periodo` (`ano_letivo`,`periodo`);

--
-- Índices de tabela `calendario_letivo`
--
ALTER TABLE `calendario_letivo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `calendario_letivo_ibfk_1` (`escola_id`);

--
-- Índices de tabela `configuracoes_calendario`
--
ALTER TABLE `configuracoes_calendario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ano_letivo` (`ano_letivo`);

--
-- Índices de tabela `configuracoes_cores`
--
ALTER TABLE `configuracoes_cores`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `configuracoes_escola`
--
ALTER TABLE `configuracoes_escola`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `configuracoes_periodos_letivos`
--
ALTER TABLE `configuracoes_periodos_letivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `config_calendario_id` (`config_calendario_id`);

--
-- Índices de tabela `configuracoes_sistema`
--
ALTER TABLE `configuracoes_sistema`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `conteudos`
--
ALTER TABLE `conteudos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `materia_id` (`materia_id`);

--
-- Índices de tabela `contratos`
--
ALTER TABLE `contratos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `contratos_preenchidos`
--
ALTER TABLE `contratos_preenchidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_contrato` (`contrato_id`),
  ADD KEY `idx_aluno_id` (`aluno_id`);

--
-- Índices de tabela `conversas`
--
ALTER TABLE `conversas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `chave_unica_conversa` (`chave_unica_conversa`),
  ADD KEY `usuario1_id` (`usuario1_id`),
  ADD KEY `usuario2_id` (`usuario2_id`);

--
-- Índices de tabela `cursos_alunos`
--
ALTER TABLE `cursos_alunos`
  ADD PRIMARY KEY (`curso_id`,`aluno_id`),
  ADD KEY `aluno_id` (`aluno_id`);

--
-- Índices de tabela `cursos_disciplinas`
--
ALTER TABLE `cursos_disciplinas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_disciplina_para_posgraduacao` (`curso_id`);

--
-- Índices de tabela `cursos_eventos`
--
ALTER TABLE `cursos_eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `curso_id` (`curso_id`);

--
-- Índices de tabela `cursos_posgraduacao`
--
ALTER TABLE `cursos_posgraduacao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_curso_coordenador` (`coordenador_id`),
  ADD KEY `fk_curso_vice_coordenador` (`vice_coordenador_id`);

--
-- Índices de tabela `cursos_ppc`
--
ALTER TABLE `cursos_ppc`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `curso_id` (`curso_id`);

--
-- Índices de tabela `cursos_professores`
--
ALTER TABLE `cursos_professores`
  ADD PRIMARY KEY (`curso_id`,`professor_id`),
  ADD KEY `professor_id` (`professor_id`);

--
-- Índices de tabela `descontos`
--
ALTER TABLE `descontos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluno_id` (`aluno_id`);

--
-- Índices de tabela `disciplinas_turmas`
--
ALTER TABLE `disciplinas_turmas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_disciplina_turma_unica` (`disciplina_id`,`turma_id`),
  ADD KEY `fk_disciplina_id` (`disciplina_id`),
  ADD KEY `fk_turma_id` (`turma_id`);

--
-- Índices de tabela `disponibilidade`
--
ALTER TABLE `disponibilidade`
  ADD PRIMARY KEY (`id`),
  ADD KEY `professor_id` (`professor_id`);

--
-- Índices de tabela `documentos_alunos`
--
ALTER TABLE `documentos_alunos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_aluno_tipo` (`aluno_id`,`tipo_documento`);

--
-- Índices de tabela `envios`
--
ALTER TABLE `envios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `escolas`
--
ALTER TABLE `escolas`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `eventos_calendario`
--
ALTER TABLE `eventos_calendario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `calendario_id` (`calendario_id`);

--
-- Índices de tabela `eventos_roles`
--
ALTER TABLE `eventos_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_eventos_roles_evento` (`evento_id`);

--
-- Índices de tabela `eventos_usuarios`
--
ALTER TABLE `eventos_usuarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_eventos_usuarios_evento` (`evento_id`),
  ADD KEY `idx_eventos_usuarios_user` (`user_id`);

--
-- Índices de tabela `exercicios`
--
ALTER TABLE `exercicios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_exercicio_envio` (`envios_id`);

--
-- Índices de tabela `exercicios_alunos`
--
ALTER TABLE `exercicios_alunos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluno_id` (`aluno_id`),
  ADD KEY `turma_id` (`turma_id`),
  ADD KEY `exercicio_id` (`exercicio_id`),
  ADD KEY `questao_id` (`questao_id`),
  ADD KEY `fk_exercicio_alunos_envio` (`envios_id`),
  ADD KEY `fk_exercicio_questões_alunos_envio` (`exercicios_questoes_id`);

--
-- Índices de tabela `exercicios_questoes`
--
ALTER TABLE `exercicios_questoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exercicio_id` (`exercicio_id`),
  ADD KEY `fk_exercicio_questoes_envio` (`envios_id`);

--
-- Índices de tabela `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unq_fav` (`usuario_id`,`conversa_id`),
  ADD KEY `conversa_id` (`conversa_id`);

--
-- Índices de tabela `funcionarios`
--
ALTER TABLE `funcionarios`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `materiais`
--
ALTER TABLE `materiais`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `materias`
--
ALTER TABLE `materias`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `materias_materiais`
--
ALTER TABLE `materias_materiais`
  ADD PRIMARY KEY (`id`),
  ADD KEY `materia_id` (`materia_id`),
  ADD KEY `material_id` (`material_id`);

--
-- Índices de tabela `mensagens`
--
ALTER TABLE `mensagens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversa_id` (`conversa_id`),
  ADD KEY `remetente_id` (`remetente_id`);

--
-- Índices de tabela `mensalidades`
--
ALTER TABLE `mensalidades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluno_id` (`aluno_id`);

--
-- Índices de tabela `notas`
--
ALTER TABLE `notas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `aluno_id` (`aluno_id`,`avaliacao_id`),
  ADD KEY `fk_notas_alunos` (`aluno_id`),
  ADD KEY `fk_notas_materias` (`materia_id`),
  ADD KEY `fk_notas_turmas` (`turma_id`),
  ADD KEY `fk_notas_avaliacoes` (`avaliacao_id`);

--
-- Índices de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notificacoes_remetente` (`remetente_id`),
  ADD KEY `fk_notificacoes_destinatario` (`destinatario_id`),
  ADD KEY `fk_notificacoes_conversa` (`conversa_id`);

--
-- Índices de tabela `notificacoes_eventos`
--
ALTER TABLE `notificacoes_eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `pagamentos_funcionarios`
--
ALTER TABLE `pagamentos_funcionarios`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_posts_users` (`user_id`);

--
-- Índices de tabela `presencas`
--
ALTER TABLE `presencas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_presenca` (`aluno_id`,`aula_id`),
  ADD KEY `fk_presenca_turma` (`turma_id`),
  ADD KEY `fk_presenca_aluno` (`aluno_id`),
  ADD KEY `fk_presenca_materia` (`materia_id`),
  ADD KEY `fk_presencas_aula` (`aula_id`);

--
-- Índices de tabela `professores_materias`
--
ALTER TABLE `professores_materias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `professor_id` (`professor_id`),
  ADD KEY `materia_id` (`materia_id`);

--
-- Índices de tabela `professores_turmas`
--
ALTER TABLE `professores_turmas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `professor_id` (`professor_id`),
  ADD KEY `turma_id` (`turma_id`);

--
-- Índices de tabela `responsaveis`
--
ALTER TABLE `responsaveis`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_cpf` (`cpf`),
  ADD UNIQUE KEY `uk_email` (`email`);

--
-- Índices de tabela `seguidores`
--
ALTER TABLE `seguidores`
  ADD PRIMARY KEY (`seguidor_id`,`seguido_id`),
  ADD KEY `idx_seguido` (`seguido_id`);

--
-- Índices de tabela `stats_seguidores`
--
ALTER TABLE `stats_seguidores`
  ADD PRIMARY KEY (`user_id`);

--
-- Índices de tabela `status_digitando`
--
ALTER TABLE `status_digitando`
  ADD PRIMARY KEY (`conversa_id`,`usuario_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `destinatario_id` (`destinatario_id`);

--
-- Índices de tabela `transacoes`
--
ALTER TABLE `transacoes`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `turmas`
--
ALTER TABLE `turmas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `professor_responsavel` (`professor_responsavel`),
  ADD KEY `fk_turma_curso_pos` (`curso_id`),
  ADD KEY `fk_turma_semestre_periodo` (`semestre_id`);

--
-- Índices de tabela `turmas_materias`
--
ALTER TABLE `turmas_materias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `turma_id` (`turma_id`),
  ADD KEY `materia_id` (`materia_id`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpf` (`cpf`);

--
-- Índices de tabela `vincular_aluno_curso`
--
ALTER TABLE `vincular_aluno_curso`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_aluno_curso` (`aluno_id`,`curso_posgraduacao_id`),
  ADD KEY `curso_posgraduacao_id` (`curso_posgraduacao_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `alunos_responsaveis`
--
ALTER TABLE `alunos_responsaveis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de tabela `alunos_turmas`
--
ALTER TABLE `alunos_turmas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de tabela `anuncios`
--
ALTER TABLE `anuncios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `anuncios_lidos`
--
ALTER TABLE `anuncios_lidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `aulas`
--
ALTER TABLE `aulas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `avaliacoes`
--
ALTER TABLE `avaliacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `calendario_gestor`
--
ALTER TABLE `calendario_gestor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de tabela `calendario_letivo`
--
ALTER TABLE `calendario_letivo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `configuracoes_calendario`
--
ALTER TABLE `configuracoes_calendario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `configuracoes_cores`
--
ALTER TABLE `configuracoes_cores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `configuracoes_escola`
--
ALTER TABLE `configuracoes_escola`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `configuracoes_periodos_letivos`
--
ALTER TABLE `configuracoes_periodos_letivos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de tabela `configuracoes_sistema`
--
ALTER TABLE `configuracoes_sistema`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `conteudos`
--
ALTER TABLE `conteudos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `contratos`
--
ALTER TABLE `contratos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `contratos_preenchidos`
--
ALTER TABLE `contratos_preenchidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `conversas`
--
ALTER TABLE `conversas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de tabela `cursos_disciplinas`
--
ALTER TABLE `cursos_disciplinas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de tabela `cursos_eventos`
--
ALTER TABLE `cursos_eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `cursos_posgraduacao`
--
ALTER TABLE `cursos_posgraduacao`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `cursos_ppc`
--
ALTER TABLE `cursos_ppc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `descontos`
--
ALTER TABLE `descontos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `disciplinas_turmas`
--
ALTER TABLE `disciplinas_turmas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `disponibilidade`
--
ALTER TABLE `disponibilidade`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `documentos_alunos`
--
ALTER TABLE `documentos_alunos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT de tabela `envios`
--
ALTER TABLE `envios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `escolas`
--
ALTER TABLE `escolas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `eventos_calendario`
--
ALTER TABLE `eventos_calendario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `eventos_roles`
--
ALTER TABLE `eventos_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de tabela `eventos_usuarios`
--
ALTER TABLE `eventos_usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `exercicios`
--
ALTER TABLE `exercicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `exercicios_alunos`
--
ALTER TABLE `exercicios_alunos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `exercicios_questoes`
--
ALTER TABLE `exercicios_questoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=259;

--
-- AUTO_INCREMENT de tabela `materiais`
--
ALTER TABLE `materiais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `materias`
--
ALTER TABLE `materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `materias_materiais`
--
ALTER TABLE `materias_materiais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `mensagens`
--
ALTER TABLE `mensagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT de tabela `mensalidades`
--
ALTER TABLE `mensalidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `notas`
--
ALTER TABLE `notas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=234;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT de tabela `notificacoes_eventos`
--
ALTER TABLE `notificacoes_eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=273;

--
-- AUTO_INCREMENT de tabela `pagamentos_funcionarios`
--
ALTER TABLE `pagamentos_funcionarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `presencas`
--
ALTER TABLE `presencas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de tabela `professores_materias`
--
ALTER TABLE `professores_materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `professores_turmas`
--
ALTER TABLE `professores_turmas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `responsaveis`
--
ALTER TABLE `responsaveis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `transacoes`
--
ALTER TABLE `transacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de tabela `turmas`
--
ALTER TABLE `turmas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `turmas_materias`
--
ALTER TABLE `turmas_materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de tabela `vincular_aluno_curso`
--
ALTER TABLE `vincular_aluno_curso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `alunos`
--
ALTER TABLE `alunos`
  ADD CONSTRAINT `fk_aluno_user` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `alunos_turmas`
--
ALTER TABLE `alunos_turmas`
  ADD CONSTRAINT `alunos_turmas_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alunos_turmas_ibfk_2` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `anuncios`
--
ALTER TABLE `anuncios`
  ADD CONSTRAINT `anuncios_ibfk_1` FOREIGN KEY (`autor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `anuncios_lidos`
--
ALTER TABLE `anuncios_lidos`
  ADD CONSTRAINT `anuncios_lidos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `anuncios_lidos_ibfk_2` FOREIGN KEY (`anuncio_id`) REFERENCES `anuncios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `aulas`
--
ALTER TABLE `aulas`
  ADD CONSTRAINT `fk_aulas_calendario_gestor` FOREIGN KEY (`calendario_id`) REFERENCES `calendario_gestor` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aulas_materia` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`),
  ADD CONSTRAINT `fk_aulas_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`);

--
-- Restrições para tabelas `avaliacoes`
--
ALTER TABLE `avaliacoes`
  ADD CONSTRAINT `fk_avaliacoes_calendario` FOREIGN KEY (`calendario_id`) REFERENCES `calendario_gestor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_avaliacoes_materias` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_avaliacoes_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `calendario_letivo`
--
ALTER TABLE `calendario_letivo`
  ADD CONSTRAINT `calendario_letivo_ibfk_1` FOREIGN KEY (`escola_id`) REFERENCES `escolas` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `configuracoes_periodos_letivos`
--
ALTER TABLE `configuracoes_periodos_letivos`
  ADD CONSTRAINT `fk_periodo_config_calendario` FOREIGN KEY (`config_calendario_id`) REFERENCES `configuracoes_calendario` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `conteudos`
--
ALTER TABLE `conteudos`
  ADD CONSTRAINT `conteudos_ibfk_1` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `contratos_preenchidos`
--
ALTER TABLE `contratos_preenchidos`
  ADD CONSTRAINT `fk_contrato` FOREIGN KEY (`contrato_id`) REFERENCES `contratos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `conversas`
--
ALTER TABLE `conversas`
  ADD CONSTRAINT `conversas_ibfk_1` FOREIGN KEY (`usuario1_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `conversas_ibfk_2` FOREIGN KEY (`usuario2_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `cursos_alunos`
--
ALTER TABLE `cursos_alunos`
  ADD CONSTRAINT `cursos_alunos_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cursos_alunos_ibfk_2` FOREIGN KEY (`aluno_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `cursos_disciplinas`
--
ALTER TABLE `cursos_disciplinas`
  ADD CONSTRAINT `fk_disciplina_para_posgraduacao` FOREIGN KEY (`curso_id`) REFERENCES `cursos_posgraduacao` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `cursos_eventos`
--
ALTER TABLE `cursos_eventos`
  ADD CONSTRAINT `cursos_eventos_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `cursos_posgraduacao`
--
ALTER TABLE `cursos_posgraduacao`
  ADD CONSTRAINT `fk_curso_coordenador` FOREIGN KEY (`coordenador_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_curso_vice_coordenador` FOREIGN KEY (`vice_coordenador_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `cursos_ppc`
--
ALTER TABLE `cursos_ppc`
  ADD CONSTRAINT `cursos_ppc_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `cursos_professores`
--
ALTER TABLE `cursos_professores`
  ADD CONSTRAINT `cursos_professores_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cursos_professores_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `descontos`
--
ALTER TABLE `descontos`
  ADD CONSTRAINT `descontos_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `disciplinas_turmas`
--
ALTER TABLE `disciplinas_turmas`
  ADD CONSTRAINT `fk_disciplina_id` FOREIGN KEY (`disciplina_id`) REFERENCES `cursos_disciplinas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_turma_id` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `disponibilidade`
--
ALTER TABLE `disponibilidade`
  ADD CONSTRAINT `disponibilidade_ibfk_1` FOREIGN KEY (`professor_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `envios`
--
ALTER TABLE `envios`
  ADD CONSTRAINT `envios_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `eventos_calendario`
--
ALTER TABLE `eventos_calendario`
  ADD CONSTRAINT `eventos_calendario_ibfk_1` FOREIGN KEY (`calendario_id`) REFERENCES `calendario_letivo` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `eventos_roles`
--
ALTER TABLE `eventos_roles`
  ADD CONSTRAINT `fk_eventos_roles_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `eventos_calendario` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `eventos_usuarios`
--
ALTER TABLE `eventos_usuarios`
  ADD CONSTRAINT `fk_eventos_usuarios_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `eventos_calendario` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_eventos_usuarios_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `exercicios`
--
ALTER TABLE `exercicios`
  ADD CONSTRAINT `fk_exercicio_envio` FOREIGN KEY (`envios_id`) REFERENCES `envios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `exercicios_alunos`
--
ALTER TABLE `exercicios_alunos`
  ADD CONSTRAINT `exercicios_alunos_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exercicios_alunos_ibfk_2` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exercicios_alunos_ibfk_3` FOREIGN KEY (`exercicio_id`) REFERENCES `exercicios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exercicios_alunos_ibfk_4` FOREIGN KEY (`questao_id`) REFERENCES `exercicios_questoes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_exercicio_alunos_envio` FOREIGN KEY (`envios_id`) REFERENCES `envios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_exercicio_questões_alunos_envio` FOREIGN KEY (`exercicios_questoes_id`) REFERENCES `exercicios_questoes` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `exercicios_questoes`
--
ALTER TABLE `exercicios_questoes`
  ADD CONSTRAINT `exercicios_questoes_ibfk_1` FOREIGN KEY (`exercicio_id`) REFERENCES `exercicios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_exercicio_questoes_envio` FOREIGN KEY (`envios_id`) REFERENCES `envios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `funcionarios`
--
ALTER TABLE `funcionarios`
  ADD CONSTRAINT `fk_funcionario_user` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `materias_materiais`
--
ALTER TABLE `materias_materiais`
  ADD CONSTRAINT `materias_materiais_ibfk_1` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `materias_materiais_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materiais` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `mensalidades`
--
ALTER TABLE `mensalidades`
  ADD CONSTRAINT `mensalidades_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `notas`
--
ALTER TABLE `notas`
  ADD CONSTRAINT `fk_notas_alunos` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notas_avaliacoes` FOREIGN KEY (`avaliacao_id`) REFERENCES `avaliacoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notas_materias` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notas_turmas` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD CONSTRAINT `fk_notificacoes_conversa` FOREIGN KEY (`conversa_id`) REFERENCES `conversas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notificacoes_destinatario` FOREIGN KEY (`destinatario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notificacoes_remetente` FOREIGN KEY (`remetente_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `notificacoes_eventos`
--
ALTER TABLE `notificacoes_eventos`
  ADD CONSTRAINT `notificacoes_eventos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `fk_posts_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `presencas`
--
ALTER TABLE `presencas`
  ADD CONSTRAINT `fk_presenca_aluno` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`),
  ADD CONSTRAINT `fk_presenca_materia` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`),
  ADD CONSTRAINT `fk_presenca_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`),
  ADD CONSTRAINT `fk_presencas_aula` FOREIGN KEY (`aula_id`) REFERENCES `aulas` (`id`);

--
-- Restrições para tabelas `professores_materias`
--
ALTER TABLE `professores_materias`
  ADD CONSTRAINT `professores_materias_ibfk_1` FOREIGN KEY (`professor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `professores_materias_ibfk_2` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `seguidores`
--
ALTER TABLE `seguidores`
  ADD CONSTRAINT `fk_seguidores_seguido` FOREIGN KEY (`seguido_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_seguidores_seguidor` FOREIGN KEY (`seguidor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `stats_seguidores`
--
ALTER TABLE `stats_seguidores`
  ADD CONSTRAINT `fk_stats_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stats_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `status_digitando`
--
ALTER TABLE `status_digitando`
  ADD CONSTRAINT `status_digitando_ibfk_1` FOREIGN KEY (`conversa_id`) REFERENCES `conversas` (`id`),
  ADD CONSTRAINT `status_digitando_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `status_digitando_ibfk_3` FOREIGN KEY (`destinatario_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `turmas`
--
ALTER TABLE `turmas`
  ADD CONSTRAINT `fk_turma_curso` FOREIGN KEY (`curso_id`) REFERENCES `cursos_posgraduacao` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_turma_curso_pos` FOREIGN KEY (`curso_id`) REFERENCES `cursos_posgraduacao` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_turma_semestre` FOREIGN KEY (`semestre_id`) REFERENCES `configuracoes_periodos_letivos` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_turma_semestre_periodo` FOREIGN KEY (`semestre_id`) REFERENCES `configuracoes_periodos_letivos` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `vincular_aluno_curso`
--
ALTER TABLE `vincular_aluno_curso`
  ADD CONSTRAINT `vincular_aluno_curso_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `vincular_aluno_curso_ibfk_2` FOREIGN KEY (`curso_posgraduacao_id`) REFERENCES `cursos_posgraduacao` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
