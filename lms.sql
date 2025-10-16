-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1

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

DELIMITER $$
--
-- Procedimentos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `drop_fk_if_exists` (IN `tbl_name` VARCHAR(255), IN `fk_name` VARCHAR(255))   BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = tbl_name AND CONSTRAINT_NAME = fk_name AND CONSTRAINT_TYPE = 'FOREIGN KEY') THEN
        SET @s = CONCAT('ALTER TABLE `', tbl_name, '` DROP FOREIGN KEY `', fk_name, '`');
        PREPARE stmt FROM @s;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_truncate_except_escolas` ()   BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE t VARCHAR(255);
  DECLARE cur CURSOR FOR
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = 'lms'
      AND TABLE_NAME <> 'escolas';
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  -- desativa checagem de FK
  SET FOREIGN_KEY_CHECKS = 0;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO t;
    IF done THEN
      LEAVE read_loop;
    END IF;
    SET @s = CONCAT('TRUNCATE TABLE `lms`.`', t, '`;');
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END LOOP;
  CLOSE cur;

  -- reativa checagem de FK
  SET FOREIGN_KEY_CHECKS = 1;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `alunos`
--

CREATE TABLE `alunos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `cpf` varchar(11) DEFAULT NULL,
  `matricula` varchar(50) NOT NULL,
  `serie` varchar(50) NOT NULL,
  `turma` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `biografia` text DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `contato_responsaveis` text DEFAULT NULL,
  `turno` varchar(20) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `data_cadastro` date DEFAULT NULL,
  `sexo` enum('Feminino','Masculino') NOT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `restricoes_medicas` text DEFAULT NULL,
  `status` enum('regular','transferido','concluído/formado','reprovado/retido','trancado','desistente/evasão','especial','expulso/desligado') NOT NULL DEFAULT 'regular' COMMENT 'Status do aluno'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `alunos`
--

INSERT INTO `alunos` (`id`, `nome`, `cpf`, `matricula`, `serie`, `turma`, `email`, `foto`, `biografia`, `telefone`, `contato_responsaveis`, `turno`, `data_nascimento`, `data_cadastro`, `sexo`, `rg`, `restricoes_medicas`, `status`) VALUES
(2, 'Krysthyan', '0', '666666', '6º Ano', 'Turma 1', 'krysthyan@gmail.com', '', 'Sou Foda', '31988441133', '3166666666', NULL, '2002-01-20', '2025-09-26', 'Masculino', 'MG66666666', '666', 'regular'),
(3, 'Marcelo', '0', '123456', '6º Ano', 'Turma 1', 'marcelo@gmail.com', '', NULL, NULL, NULL, NULL, NULL, '2025-09-26', 'Masculino', 'PENDENTE-3', NULL, 'regular'),
(4, 'Rinaldo', '0', '121212', '6º Ano', 'Turma 1', 'junio@gmail.com', '', NULL, NULL, NULL, NULL, NULL, '2025-09-26', 'Feminino', 'PENDENTE-4', NULL, 'regular'),
(8, 'Paulo Silva', NULL, 'MAT1001', '', '', 'Paulo_Silva32@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Masculino', 'PENDENTE-8', NULL, 'regular'),
(9, 'Sílvia Melo', NULL, 'MAT1002', '', '', 'Silvia.Melo97@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-9', NULL, 'regular'),
(10, 'Sr. Calebe Nogueira', NULL, 'MAT1003', '', '', 'Sr.Calebe11@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Masculino', 'PENDENTE-10', NULL, 'regular'),
(11, 'Yago Santos', NULL, 'MAT1004', '', '', 'Yago.Santos@escola.com.br', '/uploads/aluno4.jpg', '', '', '', '', NULL, '2025-09-26', 'Masculino', 'PENDENTE-11', NULL, 'regular'),
(12, 'Lavínia Oliveira Filho', NULL, 'MAT1005', '', '', 'Lavinia.Oliveira91@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-12', NULL, 'regular'),
(13, 'Warley Moreira', NULL, 'MAT1006', '', '', 'Warley.Moreira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Masculino', 'PENDENTE-13', NULL, 'regular'),
(14, 'Hélio Xavier', NULL, 'MAT1007', '', '', 'Helio_Xavier73@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Masculino', 'PENDENTE-14', NULL, 'regular'),
(15, 'César Braga', NULL, 'MAT1008', '', '', 'Cesar_Braga@escola.com.br', '/uploads/aluno8.jpg', '', '', '', '', NULL, '2025-09-26', 'Masculino', 'PENDENTE-15', NULL, 'regular'),
(16, 'Eloá Oliveira', NULL, 'MAT1009', '', '', 'Eloa.Oliveira39@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-16', NULL, 'regular'),
(17, 'Enzo Santos Jr.', NULL, 'MAT1010', '', '', 'Enzo.Santos21@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Masculino', 'PENDENTE-17', NULL, 'regular'),
(18, 'Arthur Moreira', NULL, 'MAT1011', '', '', 'Arthur.Moreira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Masculino', 'PENDENTE-18', NULL, 'regular'),
(19, 'Eduarda Santos', NULL, 'MAT1012', '', '', 'Eduarda_Santos70@escola.com.br', '/uploads/aluno12.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-19', NULL, 'regular'),
(20, 'Célia Carvalho', NULL, 'MAT1013', '', '', 'Celia_Carvalho@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-20', NULL, 'regular'),
(21, 'Ana Laura Costa', NULL, 'MAT1014', '', '', 'Ana.Laura84@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-21', NULL, 'regular'),
(22, 'Sra. Vitória Albuquerque', NULL, 'MAT1015', '', '', 'Sra._Vitoria@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-22', NULL, 'regular'),
(23, 'Mariana Saraiva', NULL, 'MAT1016', '', '', 'Mariana.Saraiva@escola.com.br', '/uploads/aluno16.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-23', NULL, 'regular'),
(24, 'Heitor Moreira', NULL, 'MAT1017', '', '', 'Heitor.Moreira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Masculino', 'PENDENTE-24', NULL, 'regular'),
(25, 'Laura Xavier', NULL, 'MAT1018', '', '', 'Laura.Xavier@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-25', NULL, 'regular'),
(26, 'Marli Batista', NULL, 'MAT1019', '', '', 'Marli_Batista@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-26', NULL, 'regular'),
(27, 'Ana Júlia Albuquerque', NULL, 'MAT1020', '', '', 'Ana.Julia@escola.com.br', '/uploads/aluno20.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-27', NULL, 'regular'),
(28, 'Heloísa Xavier', NULL, 'MAT1021', '', '', 'Heloisa.Xavier86@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-28', NULL, 'regular'),
(29, 'Alexandre Melo Jr.', NULL, 'MAT1022', '6º Ano', 'Turma 1', 'Alexandre.Melo84@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Masculino', 'PENDENTE-29', NULL, 'regular'),
(30, 'Pedro Macedo', NULL, 'MAT1023', '', '', 'Pedro_Macedo72@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-30', NULL, 'regular'),
(31, 'Felícia Silva', NULL, 'MAT1024', '', '', 'Felicia.Silva@escola.com.br', '/uploads/aluno24.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-31', NULL, 'regular'),
(32, 'Leonardo Carvalho', NULL, 'MAT1025', '', '', 'Leonardo_Carvalho33@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-32', NULL, 'regular'),
(33, 'Alice Moraes', NULL, 'MAT1026', '', '', 'Alice_Moraes77@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-33', NULL, 'regular'),
(34, 'Gabriel Carvalho', NULL, 'MAT1027', '', '', 'Gabriel_Carvalho@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-34', NULL, 'regular'),
(35, 'Salvador Costa', NULL, 'MAT1028', '', '', 'Salvador_Costa@escola.com.br', '/uploads/aluno28.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-35', NULL, 'regular'),
(36, 'João Costa', NULL, 'MAT1029', '', '', 'Joao.Costa62@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-36', NULL, 'regular'),
(37, 'Maria Cecília Martins', NULL, 'MAT1030', '', '', 'Maria_Cecilia85@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-37', NULL, 'regular'),
(38, 'Dra. Sílvia Silva', NULL, 'MAT1031', '', '', 'Dra.Silvia@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-38', NULL, 'regular'),
(39, 'João Lucas Macedo', NULL, 'MAT1032', '', '', 'Joao.Lucas91@escola.com.br', '/uploads/aluno32.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-39', NULL, 'regular'),
(40, 'Rafael Souza', NULL, 'MAT1033', '', '', 'Rafael.Souza@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-40', NULL, 'regular'),
(41, 'Antonella Santos', NULL, 'MAT1034', '', '', 'Antonella.Santos@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-41', NULL, 'regular'),
(42, 'Gúbio Saraiva', NULL, 'MAT1035', '', '', 'Gubio.Saraiva96@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-42', NULL, 'regular'),
(43, 'Benício Melo', NULL, 'MAT1036', '', '', 'Benicio.Melo@escola.com.br', '/uploads/aluno36.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-43', NULL, 'regular'),
(44, 'Ana Laura Moreira', NULL, 'MAT1037', '', '', 'Ana_Laura@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-44', NULL, 'regular'),
(45, 'Cecília Franco', NULL, 'MAT1038', '', '', 'Cecilia.Franco@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-45', NULL, 'regular'),
(46, 'Isadora Albuquerque Jr.', NULL, 'MAT1039', '', '', 'Isadora.Albuquerque@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-46', NULL, 'regular'),
(47, 'Lara Xavier', NULL, 'MAT1040', '', '', 'Lara.Xavier@escola.com.br', '/uploads/aluno40.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-47', NULL, 'regular'),
(48, 'Guilherme Silva', NULL, 'MAT1041', '', '', 'Guilherme_Silva@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-48', NULL, 'regular'),
(49, 'Isabel Costa', NULL, 'MAT1042', '', '', 'Isabel.Costa76@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-49', NULL, 'regular'),
(50, 'Natália Batista', NULL, 'MAT1043', '', '', 'Natalia_Batista55@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-50', NULL, 'regular'),
(51, 'Célia Moreira', NULL, 'MAT1044', '', '', 'Celia_Moreira29@escola.com.br', '/uploads/aluno44.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-51', NULL, 'regular'),
(52, 'Célia Melo', NULL, 'MAT1045', '', '', 'Celia_Melo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-52', NULL, 'regular'),
(53, 'Sr. Marcos Barros', NULL, 'MAT1046', '', '', 'Sr._Marcos0@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-53', NULL, 'regular'),
(54, 'Leonardo Albuquerque', NULL, 'MAT1047', '', '', 'Leonardo.Albuquerque66@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-54', NULL, 'regular'),
(55, 'Enzo Gabriel Carvalho', NULL, 'MAT1048', '', '', 'Enzo_Gabriel59@escola.com.br', '/uploads/aluno48.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-55', NULL, 'regular'),
(56, 'Davi Carvalho', NULL, 'MAT1049', '', '', 'Davi_Carvalho84@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-56', NULL, 'regular'),
(57, 'Ana Laura Franco', NULL, 'MAT1050', '', '', 'Ana.Laura87@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-57', NULL, 'regular'),
(58, 'Marcela Braga', NULL, 'MAT1051', '', '', 'Marcela_Braga85@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-58', NULL, 'regular'),
(59, 'Felícia Albuquerque', NULL, 'MAT1052', '', '', 'Felicia_Albuquerque23@escola.com.br', '/uploads/aluno52.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-59', NULL, 'regular'),
(60, 'Mércia Batista', NULL, 'MAT1053', '', '', 'Mercia.Batista@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-60', NULL, 'regular'),
(61, 'Calebe Moraes', NULL, 'MAT1054', '', '', 'Calebe.Moraes@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-61', NULL, 'regular'),
(62, 'Alícia Batista', NULL, 'MAT1055', '', '', 'Alicia_Batista@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-62', NULL, 'regular'),
(63, 'César Macedo', NULL, 'MAT1056', '', '', 'Cesar.Macedo10@escola.com.br', '/uploads/aluno56.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-63', NULL, 'regular'),
(64, 'Yuri Souza Filho', NULL, 'MAT1057', '', '', 'Yuri_Souza@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-64', NULL, 'regular'),
(65, 'Henrique Batista', NULL, 'MAT1058', '', '', 'Henrique.Batista60@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-65', NULL, 'regular'),
(66, 'Mariana Carvalho Jr.', NULL, 'MAT1059', '', '', 'Mariana_Carvalho@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-66', NULL, 'regular'),
(67, 'Sr. João Silva', NULL, 'MAT1060', '', '', 'Sr.Joao@escola.com.br', '/uploads/aluno60.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-67', NULL, 'regular'),
(68, 'Sr. Vitor Pereira', NULL, 'MAT1061', '', '', 'Sr.Vitor@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-68', NULL, 'regular'),
(69, 'Marina Santos', NULL, 'MAT1062', '', '', 'Marina_Santos@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-69', NULL, 'regular'),
(70, 'Isaac Xavier', NULL, 'MAT1063', '', '', 'Isaac.Xavier50@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-70', NULL, 'regular'),
(71, 'Joaquim Nogueira', NULL, 'MAT1064', '', '', 'Joaquim.Nogueira39@escola.com.br', '/uploads/aluno64.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-71', NULL, 'regular'),
(72, 'Sr. Enzo Batista', NULL, 'MAT1065', '', '', 'Sr.Enzo82@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-72', NULL, 'regular'),
(73, 'Roberto Saraiva', NULL, 'MAT1066', '', '', 'Roberto.Saraiva91@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-73', NULL, 'regular'),
(74, 'Srta. Sílvia Saraiva', NULL, 'MAT1067', '', '', 'Srta.Silvia17@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-74', NULL, 'regular'),
(75, 'Sra. Cecília Moreira', NULL, 'MAT1068', '', '', 'Sra.Cecilia@escola.com.br', '/uploads/aluno68.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-75', NULL, 'regular'),
(76, 'Meire Xavier', NULL, 'MAT1069', '', '', 'Meire_Xavier37@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-76', NULL, 'regular'),
(77, 'Frederico Souza', NULL, 'MAT1070', '', '', 'Frederico_Souza36@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-77', NULL, 'regular'),
(78, 'Maria Clara Souza', NULL, 'MAT1071', '', '', 'Maria_Clara98@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-78', NULL, 'regular'),
(79, 'Pedro Carvalho', NULL, 'MAT1072', '', '', 'Pedro.Carvalho@escola.com.br', '/uploads/aluno72.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-79', NULL, 'regular'),
(80, 'Rebeca Albuquerque', NULL, 'MAT1073', '', '', 'Rebeca_Albuquerque3@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-80', NULL, 'regular'),
(81, 'Dra. Maria Carvalho', NULL, 'MAT1074', '', '', 'Dra.Maria33@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-81', NULL, 'regular'),
(82, 'Ana Laura Xavier Jr.', NULL, 'MAT1075', '', '', 'Ana_Laura@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-82', NULL, 'regular'),
(83, 'Maria Clara Souza', NULL, 'MAT1076', '', '', 'Maria_Clara@escola.com.br', '/uploads/aluno76.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-83', NULL, 'regular'),
(84, 'Isabelly Barros', NULL, 'MAT1077', '', '', 'Isabelly_Barros12@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-84', NULL, 'regular'),
(85, 'Yasmin Albuquerque Jr.', NULL, 'MAT1078', '', '', 'Yasmin_Albuquerque0@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-85', NULL, 'regular'),
(86, 'Benício Braga Neto', NULL, 'MAT1079', '', '', 'Benicio.Braga@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-86', NULL, 'regular'),
(87, 'Lavínia Xavier', NULL, 'MAT1080', '', '', 'Lavinia_Xavier@escola.com.br', '/uploads/aluno80.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-87', NULL, 'regular'),
(88, 'Hugo Pereira Filho', NULL, 'MAT1081', '', '', 'Hugo_Pereira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-88', NULL, 'regular'),
(89, 'Dr. Tertuliano Moraes', NULL, 'MAT1082', '', '', 'Dr.Tertuliano81@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-89', NULL, 'regular'),
(90, 'Fabiano Albuquerque', NULL, 'MAT1083', '', '', 'Fabiano_Albuquerque12@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-90', NULL, 'regular'),
(91, 'Guilherme Reis', NULL, 'MAT1084', '', '', 'Guilherme_Reis@escola.com.br', '/uploads/aluno84.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-91', NULL, 'regular'),
(92, 'Carla Carvalho', NULL, 'MAT1085', '', '', 'Carla_Carvalho@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-92', NULL, 'regular'),
(93, 'Sr. Júlio Costa', NULL, 'MAT1086', '', '', 'Sr._Julio@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-93', NULL, 'regular'),
(94, 'Célia Melo', NULL, 'MAT1087', '', '', 'Celia_Melo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-94', NULL, 'regular'),
(95, 'Maria Eduarda Saraiva', NULL, 'MAT1088', '', '', 'Maria_Eduarda64@escola.com.br', '/uploads/aluno88.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-95', NULL, 'regular'),
(96, 'Matheus Moraes Jr.', NULL, 'MAT1089', '', '', 'Matheus.Moraes39@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-96', NULL, 'regular'),
(97, 'Anthony Batista', NULL, 'MAT1090', '', '', 'Anthony.Batista84@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-97', NULL, 'regular'),
(98, 'Sara Nogueira', NULL, 'MAT1091', '', '', 'Sara.Nogueira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-98', NULL, 'regular'),
(99, 'Vicente Barros', NULL, 'MAT1092', '', '', 'Vicente_Barros@escola.com.br', '/uploads/aluno92.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-99', NULL, 'regular'),
(100, 'Fábio Moraes', NULL, 'MAT1093', '', '', 'Fabio_Moraes19@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-100', NULL, 'regular'),
(101, 'Sophia Moraes', NULL, 'MAT1094', '', '', 'Sophia.Moraes37@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-101', NULL, 'regular'),
(102, 'Joaquim Silva', NULL, 'MAT1095', '', '', 'Joaquim_Silva@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-102', NULL, 'regular'),
(103, 'Sophia Costa', NULL, 'MAT1096', '', '', 'Sophia.Costa20@escola.com.br', '/uploads/aluno96.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-103', NULL, 'regular'),
(104, 'Davi Lucca Nogueira', NULL, 'MAT1097', '', '', 'Davi.Lucca74@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-104', NULL, 'regular'),
(105, 'Clara Martins', NULL, 'MAT1098', '', '', 'Clara.Martins59@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-105', NULL, 'regular'),
(106, 'Félix Franco Jr.', NULL, 'MAT1099', '', '', 'Felix.Franco35@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-106', NULL, 'regular'),
(107, 'Rafaela Batista', NULL, 'MAT1100', '', '', 'Rafaela.Batista@escola.com.br', '/uploads/aluno100.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-107', NULL, 'regular'),
(108, 'Júlio César Moreira', NULL, 'MAT1101', '', '', 'Julio_Cesar@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-108', NULL, 'regular'),
(109, 'Dalila Nogueira', NULL, 'MAT1102', '', '', 'Dalila.Nogueira45@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-109', NULL, 'regular'),
(110, 'Davi Lucca Martins', NULL, 'MAT1103', '', '', 'Davi.Lucca@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-110', NULL, 'regular'),
(111, 'Luiza Santos', NULL, 'MAT1104', '', '', 'Luiza.Santos36@escola.com.br', '/uploads/aluno104.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-111', NULL, 'regular'),
(112, 'Janaína Pereira', NULL, 'MAT1105', '', '', 'Janaina_Pereira59@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-112', NULL, 'regular'),
(113, 'Alexandre Franco Neto', NULL, 'MAT1106', '', '', 'Alexandre_Franco22@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-113', NULL, 'regular'),
(114, 'Benício Albuquerque', NULL, 'MAT1107', '', '', 'Benicio_Albuquerque93@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-114', NULL, 'regular'),
(115, 'Sr. Calebe Moreira', NULL, 'MAT1108', '', '', 'Sr._Calebe48@escola.com.br', '/uploads/aluno108.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-115', NULL, 'regular'),
(116, 'Nicolas Santos Neto', NULL, 'MAT1109', '', '', 'Nicolas.Santos@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-116', NULL, 'regular'),
(117, 'Marcelo Xavier', NULL, 'MAT1110', '', '', 'Marcelo_Xavier@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-117', NULL, 'regular'),
(118, 'Isaac Albuquerque Jr.', NULL, 'MAT1111', '', '', 'Isaac_Albuquerque80@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-118', NULL, 'regular'),
(119, 'Júlia Melo', NULL, 'MAT1112', '', '', 'Julia.Melo@escola.com.br', '/uploads/aluno112.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-119', NULL, 'regular'),
(120, 'Lorenzo Pereira', NULL, 'MAT1113', '', '', 'Lorenzo_Pereira8@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-120', NULL, 'regular'),
(121, 'Gael Carvalho', NULL, 'MAT1114', '', '', 'Gael_Carvalho@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-121', NULL, 'regular'),
(122, 'Felícia Macedo', NULL, 'MAT1115', '', '', 'Felicia_Macedo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-122', NULL, 'regular'),
(123, 'Yango Albuquerque', NULL, 'MAT1116', '', '', 'Yango.Albuquerque55@escola.com.br', '/uploads/aluno116.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-123', NULL, 'regular'),
(124, 'Joana Albuquerque', NULL, 'MAT1117', '', '', 'Joana.Albuquerque@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-124', NULL, 'regular'),
(125, 'Eduardo Reis', NULL, 'MAT1118', '', '', 'Eduardo.Reis15@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-125', NULL, 'regular'),
(126, 'Sr. Breno Macedo', NULL, 'MAT1119', '', '', 'Sr._Breno64@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-126', NULL, 'regular'),
(127, 'Fabrícia Melo', NULL, 'MAT1120', '', '', 'Fabricia_Melo90@escola.com.br', '/uploads/aluno120.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-127', NULL, 'regular'),
(128, 'Yuri Oliveira', NULL, 'MAT1121', '', '', 'Yuri.Oliveira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-128', NULL, 'regular'),
(129, 'Felícia Macedo', NULL, 'MAT1122', '', '', 'Felicia.Macedo53@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-129', NULL, 'regular'),
(130, 'Breno Moreira', NULL, 'MAT1123', '', '', 'Breno_Moreira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-130', NULL, 'regular'),
(131, 'Ígor Barros', NULL, 'MAT1124', '', '', 'Igor_Barros92@escola.com.br', '/uploads/aluno124.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-131', NULL, 'regular'),
(132, 'Vitor Pereira', NULL, 'MAT1125', '', '', 'Vitor.Pereira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-132', NULL, 'regular'),
(133, 'Alice Martins', NULL, 'MAT1126', '', '', 'Alice.Martins12@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-133', NULL, 'regular'),
(134, 'Morgana Barros', NULL, 'MAT1127', '', '', 'Morgana_Barros@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-134', NULL, 'regular'),
(135, 'Eduarda Carvalho', NULL, 'MAT1128', '', '', 'Eduarda.Carvalho@escola.com.br', '/uploads/aluno128.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-135', NULL, 'regular'),
(136, 'Elísio Macedo', NULL, 'MAT1129', '', '', 'Elisio.Macedo99@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-136', NULL, 'regular'),
(137, 'Elísio Albuquerque Filho', NULL, 'MAT1130', '', '', 'Elisio_Albuquerque@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-137', NULL, 'regular'),
(138, 'Dr. Danilo Moreira', NULL, 'MAT1131', '', '', 'Dr._Danilo3@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-138', NULL, 'regular'),
(139, 'Talita Saraiva', NULL, 'MAT1132', '', '', 'Talita_Saraiva@escola.com.br', '/uploads/aluno132.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-139', NULL, 'regular'),
(140, 'Larissa Reis Neto', NULL, 'MAT1133', '', '', 'Larissa_Reis@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-140', NULL, 'regular'),
(141, 'Théo Nogueira', NULL, 'MAT1134', '', '', 'Theo_Nogueira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-141', NULL, 'regular'),
(142, 'Sarah Melo Filho', NULL, 'MAT1135', '', '', 'Sarah_Melo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-142', NULL, 'regular'),
(143, 'Lara Moreira', NULL, 'MAT1136', '', '', 'Lara.Moreira@escola.com.br', '/uploads/aluno136.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-143', NULL, 'regular'),
(144, 'Antônio Franco', NULL, 'MAT1137', '', '', 'Antonio_Franco@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-144', NULL, 'regular'),
(145, 'Feliciano Barros', NULL, 'MAT1138', '', '', 'Feliciano.Barros@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-145', NULL, 'regular'),
(146, 'Breno Saraiva Filho', NULL, 'MAT1139', '', '', 'Breno.Saraiva53@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-146', NULL, 'regular'),
(147, 'Vitor Oliveira', NULL, 'MAT1140', '', '', 'Vitor_Oliveira@escola.com.br', '/uploads/aluno140.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-147', NULL, 'regular'),
(148, 'Helena Braga', NULL, 'MAT1141', '', '', 'Helena.Braga77@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-148', NULL, 'regular'),
(149, 'Warley Saraiva', NULL, 'MAT1142', '', '', 'Warley.Saraiva@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-149', NULL, 'regular'),
(150, 'Elisa Carvalho', NULL, 'MAT1143', '', '', 'Elisa.Carvalho99@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-150', NULL, 'regular'),
(151, 'Ana Luiza Santos', NULL, 'MAT1144', '', '', 'Ana_Luiza@escola.com.br', '/uploads/aluno144.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-151', NULL, 'regular'),
(152, 'Karla Santos', NULL, 'MAT1145', '', '', 'Karla_Santos@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-152', NULL, 'regular'),
(153, 'Benício Pereira', NULL, 'MAT1146', '', '', 'Benicio_Pereira64@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-153', NULL, 'regular'),
(154, 'Esther Moreira', NULL, 'MAT1147', '', '', 'Esther_Moreira22@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-154', NULL, 'regular'),
(155, 'Enzo Carvalho Filho', NULL, 'MAT1148', '', '', 'Enzo.Carvalho60@escola.com.br', '/uploads/aluno148.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-155', NULL, 'regular'),
(156, 'Lucca Nogueira', NULL, 'MAT1149', '', '', 'Lucca_Nogueira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-156', NULL, 'regular'),
(157, 'Ana Luiza Pereira', NULL, 'MAT1150', '', '', 'Ana_Luiza88@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-157', NULL, 'regular'),
(158, 'Hugo Reis', NULL, 'MAT1151', '', '', 'Hugo.Reis45@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-158', NULL, 'regular'),
(159, 'Ofélia Saraiva', NULL, 'MAT1152', '', '', 'Ofelia_Saraiva83@escola.com.br', '/uploads/aluno152.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-159', NULL, 'regular'),
(160, 'Noah Moraes', NULL, 'MAT1153', '', '', 'Noah_Moraes63@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-160', NULL, 'regular'),
(161, 'Davi Macedo', NULL, 'MAT1154', '', '', 'Davi_Macedo74@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-161', NULL, 'regular'),
(162, 'Carla Oliveira', NULL, 'MAT1155', '', '', 'Carla_Oliveira3@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-162', NULL, 'regular'),
(163, 'Liz Reis', NULL, 'MAT1156', '', '', 'Liz.Reis24@escola.com.br', '/uploads/aluno156.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-163', NULL, 'regular'),
(164, 'Alícia Melo', NULL, 'MAT1157', '', '', 'Alicia_Melo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-164', NULL, 'regular'),
(165, 'Antonella Batista', NULL, 'MAT1158', '', '', 'Antonella_Batista81@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-165', NULL, 'regular'),
(166, 'Dr. Henrique Xavier', NULL, 'MAT1159', '', '', 'Dr.Henrique@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-166', NULL, 'regular'),
(167, 'Melissa Oliveira', NULL, 'MAT1160', '', '', 'Melissa.Oliveira@escola.com.br', '/uploads/aluno160.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-167', NULL, 'regular'),
(168, 'Sr. Ígor Santos', NULL, 'MAT1161', '', '', 'Sr.Igor12@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-168', NULL, 'regular'),
(169, 'João Lucas Albuquerque Jr.', NULL, 'MAT1162', '', '', 'Joao.Lucas25@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-169', NULL, 'regular'),
(170, 'Pablo Silva', NULL, 'MAT1163', '', '', 'Pablo.Silva91@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-170', NULL, 'regular'),
(171, 'Rafael Silva', NULL, 'MAT1164', '', '', 'Rafael_Silva@escola.com.br', '/uploads/aluno164.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-171', NULL, 'regular'),
(172, 'Roberto Xavier', NULL, 'MAT1165', '', '', 'Roberto.Xavier@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-172', NULL, 'regular'),
(173, 'Karla Carvalho', NULL, 'MAT1166', '', '', 'Karla.Carvalho@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-173', NULL, 'regular'),
(174, 'Maria Cecília Oliveira Filho', NULL, 'MAT1167', '', '', 'Maria_Cecilia93@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-174', NULL, 'regular'),
(175, 'Isabel Reis', NULL, 'MAT1168', '', '', 'Isabel_Reis@escola.com.br', '/uploads/aluno168.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-175', NULL, 'regular'),
(176, 'Marli Saraiva', NULL, 'MAT1169', '', '', 'Marli.Saraiva45@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-176', NULL, 'regular'),
(177, 'Isis Albuquerque', NULL, 'MAT1170', '', '', 'Isis_Albuquerque91@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-177', NULL, 'regular'),
(178, 'Célia Albuquerque Jr.', NULL, 'MAT1171', '', '', 'Celia.Albuquerque22@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-178', NULL, 'regular'),
(179, 'Helena Carvalho', NULL, 'MAT1172', '', '', 'Helena_Carvalho@escola.com.br', '/uploads/aluno172.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-179', NULL, 'regular'),
(180, 'Rebeca Xavier', NULL, 'MAT1173', '', '', 'Rebeca.Xavier@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-180', NULL, 'regular'),
(181, 'Marcos Braga', NULL, 'MAT1174', '', '', 'Marcos.Braga@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-181', NULL, 'regular'),
(182, 'Salvador Pereira', NULL, 'MAT1175', '', '', 'Salvador_Pereira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-182', NULL, 'regular'),
(183, 'Henrique Martins', NULL, 'MAT1176', '', '', 'Henrique.Martins@escola.com.br', '/uploads/aluno176.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-183', NULL, 'regular'),
(184, 'Liz Martins', NULL, 'MAT1177', '', '', 'Liz_Martins@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-184', NULL, 'regular'),
(185, 'Sirineu Costa', NULL, 'MAT1178', '', '', 'Sirineu.Costa61@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-185', NULL, 'regular'),
(186, 'Sirineu Barros', NULL, 'MAT1179', '', '', 'Sirineu.Barros7@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-186', NULL, 'regular'),
(187, 'Maria Júlia Nogueira', NULL, 'MAT1180', '', '', 'Maria.Julia@escola.com.br', '/uploads/aluno180.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-187', NULL, 'regular'),
(188, 'Dr. Paulo Silva', NULL, 'MAT1181', '', '', 'Dr.Paulo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-188', NULL, 'regular'),
(189, 'Ana Laura Franco Jr.', NULL, 'MAT1182', '', '', 'Ana_Laura77@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-189', NULL, 'regular'),
(190, 'Maria Alice Martins', NULL, 'MAT1183', '', '', 'Maria_Alice@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-190', NULL, 'regular'),
(191, 'Frederico Costa', NULL, 'MAT1184', '', '', 'Frederico.Costa@escola.com.br', '/uploads/aluno184.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-191', NULL, 'regular'),
(192, 'Maria Alice Xavier', NULL, 'MAT1185', '', '', 'Maria_Alice@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-192', NULL, 'regular'),
(193, 'Melissa Saraiva Jr.', NULL, 'MAT1186', '', '', 'Melissa_Saraiva81@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-193', NULL, 'regular'),
(194, 'Yago Oliveira', NULL, 'MAT1187', '', '', 'Yago_Oliveira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-194', NULL, 'regular'),
(195, 'Isis Costa', NULL, 'MAT1188', '', '', 'Isis.Costa@escola.com.br', '/uploads/aluno188.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-195', NULL, 'regular'),
(196, 'Sr. Enzo Silva', NULL, 'MAT1189', '', '', 'Sr.Enzo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-196', NULL, 'regular'),
(197, 'Hugo Barros Filho', NULL, 'MAT1190', '', '', 'Hugo.Barros22@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-197', NULL, 'regular'),
(198, 'Helena Franco', NULL, 'MAT1191', '', '', 'Helena_Franco@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-198', NULL, 'regular'),
(199, 'Fabrício Macedo', NULL, 'MAT1192', '', '', 'Fabricio_Macedo@escola.com.br', '/uploads/aluno192.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-199', NULL, 'regular'),
(200, 'Miguel Batista', NULL, 'MAT1193', '', '', 'Miguel_Batista@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-200', NULL, 'regular'),
(201, 'Lívia Albuquerque', NULL, 'MAT1194', '', '', 'Livia_Albuquerque@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-201', NULL, 'regular'),
(202, 'Raul Santos', NULL, 'MAT1195', '', '', 'Raul.Santos@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-202', NULL, 'regular'),
(203, 'Hélio Braga', NULL, 'MAT1196', '', '', 'Helio_Braga@escola.com.br', '/uploads/aluno196.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-203', NULL, 'regular'),
(204, 'Gabriel Carvalho Jr.', NULL, 'MAT1197', '', '', 'Gabriel_Carvalho@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-204', NULL, 'regular'),
(205, 'Sr. Enzo Braga', NULL, 'MAT1198', '', '', 'Sr._Enzo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-205', NULL, 'regular'),
(206, 'Bruna Santos', NULL, 'MAT1199', '', '', 'Bruna.Santos14@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-206', NULL, 'regular'),
(207, 'Srta. Maitê Melo', NULL, 'MAT1200', '', '', 'Srta._Maite@escola.com.br', '/uploads/aluno200.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-207', NULL, 'regular'),
(208, 'Lavínia Moreira', NULL, 'MAT1201', '', '', 'Lavinia_Moreira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-208', NULL, 'regular'),
(209, 'Arthur Martins', NULL, 'MAT1202', '', '', 'Arthur_Martins@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-209', NULL, 'regular'),
(210, 'Vitória Silva Filho', NULL, 'MAT1203', '', '', 'Vitoria.Silva37@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-210', NULL, 'regular'),
(211, 'Benjamin Albuquerque', NULL, 'MAT1204', '', '', 'Benjamin.Albuquerque72@escola.com.br', '/uploads/aluno204.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-211', NULL, 'regular'),
(212, 'Noah Macedo', NULL, 'MAT1205', '', '', 'Noah.Macedo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-212', NULL, 'regular'),
(213, 'Alexandre Franco', NULL, 'MAT1206', '', '', 'Alexandre.Franco55@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-213', NULL, 'regular'),
(214, 'Júlio César Melo', NULL, 'MAT1207', '', '', 'Julio.Cesar@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-214', NULL, 'regular'),
(215, 'Lavínia Melo', NULL, 'MAT1208', '', '', 'Lavinia_Melo@escola.com.br', '/uploads/aluno208.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-215', NULL, 'regular'),
(216, 'Júlio Carvalho', NULL, 'MAT1209', '', '', 'Julio.Carvalho53@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-216', NULL, 'regular'),
(217, 'Roberto Melo', NULL, 'MAT1210', '', '', 'Roberto_Melo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-217', NULL, 'regular'),
(218, 'Feliciano Franco Neto', NULL, 'MAT1211', '', '', 'Feliciano_Franco@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-218', NULL, 'regular'),
(219, 'Sarah Moreira', NULL, 'MAT1212', '', '', 'Sarah.Moreira14@escola.com.br', '/uploads/aluno212.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-219', NULL, 'regular'),
(220, 'Maitê Oliveira', NULL, 'MAT1213', '', '', 'Maite_Oliveira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-220', NULL, 'regular'),
(221, 'Fabrício Nogueira', NULL, 'MAT1214', '', '', 'Fabricio_Nogueira44@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-221', NULL, 'regular'),
(222, 'Larissa Souza Jr.', NULL, 'MAT1215', '', '', 'Larissa_Souza@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-222', NULL, 'regular'),
(223, 'Leonardo Santos', NULL, 'MAT1216', '', '', 'Leonardo.Santos55@escola.com.br', '/uploads/aluno216.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-223', NULL, 'regular'),
(224, 'Antonella Xavier', NULL, 'MAT1217', '', '', 'Antonella.Xavier@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-224', NULL, 'regular'),
(225, 'Antônio Batista', NULL, 'MAT1218', '', '', 'Antonio_Batista@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-225', NULL, 'regular'),
(226, 'Yuri Melo', NULL, 'MAT1219', '', '', 'Yuri.Melo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-226', NULL, 'regular'),
(227, 'Enzo Gabriel Souza', NULL, 'MAT1220', '', '', 'Enzo_Gabriel@escola.com.br', '/uploads/aluno220.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-227', NULL, 'regular'),
(228, 'Marina Silva', NULL, 'MAT1221', '', '', 'Marina.Silva@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-228', NULL, 'regular'),
(229, 'Pedro Henrique Barros', NULL, 'MAT1222', '', '', 'Pedro.Henrique@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-229', NULL, 'regular'),
(230, 'Noah Moraes', NULL, 'MAT1223', '', '', 'Noah_Moraes69@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-230', NULL, 'regular'),
(231, 'Isabela Silva', NULL, 'MAT1224', '', '', 'Isabela.Silva@escola.com.br', '/uploads/aluno224.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-231', NULL, 'regular'),
(232, 'Miguel Xavier', NULL, 'MAT1225', '', '', 'Miguel.Xavier65@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-232', NULL, 'regular'),
(233, 'Carlos Franco', NULL, 'MAT1226', '', '', 'Carlos.Franco90@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-233', NULL, 'regular'),
(234, 'Cecília Batista', NULL, 'MAT1227', '', '', 'Cecilia_Batista@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-234', NULL, 'regular'),
(235, 'Sra. Márcia Pereira', NULL, 'MAT1228', '', '', 'Sra.Marcia@escola.com.br', '/uploads/aluno228.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-235', NULL, 'regular'),
(236, 'Srta. Dalila Albuquerque', NULL, 'MAT1229', '', '', 'Srta._Dalila@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-236', NULL, 'regular'),
(237, 'Eloá Reis', NULL, 'MAT1230', '', '', 'Eloa.Reis78@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-237', NULL, 'regular'),
(238, 'Fabrício Melo', NULL, 'MAT1231', '', '', 'Fabricio.Melo36@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-238', NULL, 'regular'),
(239, 'Maria Braga', NULL, 'MAT1232', '', '', 'Maria_Braga@escola.com.br', '/uploads/aluno232.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-239', NULL, 'regular'),
(240, 'Davi Lucca Xavier', NULL, 'MAT1233', '', '', 'Davi_Lucca8@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-240', NULL, 'regular'),
(241, 'Sílvia Carvalho', NULL, 'MAT1234', '', '', 'Silvia.Carvalho12@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-241', NULL, 'regular'),
(242, 'Maria Barros', NULL, 'MAT1235', '', '', 'Maria.Barros@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-242', NULL, 'regular'),
(243, 'Dr. Cauã Braga', NULL, 'MAT1236', '', '', 'Dr.Caua@escola.com.br', '/uploads/aluno236.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-243', NULL, 'regular'),
(244, 'Morgana Pereira', NULL, 'MAT1237', '', '', 'Morgana_Pereira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-244', NULL, 'regular'),
(245, 'Maria Helena Barros Jr.', NULL, 'MAT1238', '', '', 'Maria.Helena93@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-245', NULL, 'regular'),
(246, 'Davi Souza Jr.', NULL, 'MAT1239', '', '', 'Davi.Souza@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-246', NULL, 'regular'),
(247, 'Maria Júlia Braga', NULL, 'MAT1240', '', '', 'Maria.Julia28@escola.com.br', '/uploads/aluno240.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-247', NULL, 'regular'),
(248, 'Roberto Silva', NULL, 'MAT1241', '', '', 'Roberto.Silva@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-248', NULL, 'regular'),
(249, 'Isabela Franco Jr.', NULL, 'MAT1242', '', '', 'Isabela_Franco@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-249', NULL, 'regular'),
(250, 'Heitor Silva', NULL, 'MAT1243', '', '', 'Heitor_Silva28@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-250', NULL, 'regular'),
(251, 'Paulo Saraiva', NULL, 'MAT1244', '', '', 'Paulo.Saraiva55@escola.com.br', '/uploads/aluno244.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-251', NULL, 'regular'),
(252, 'Enzo Barros', NULL, 'MAT1245', '', '', 'Enzo.Barros24@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-252', NULL, 'regular'),
(253, 'Anthony Silva Neto', NULL, 'MAT1246', '', '', 'Anthony_Silva42@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-253', NULL, 'regular'),
(254, 'Emanuelly Moreira', NULL, 'MAT1247', '', '', 'Emanuelly_Moreira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-254', NULL, 'regular'),
(255, 'Norberto Costa', NULL, 'MAT1248', '', '', 'Norberto_Costa@escola.com.br', '/uploads/aluno248.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-255', NULL, 'regular'),
(256, 'João Miguel Xavier', NULL, 'MAT1249', '', '', 'Joao.Miguel@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-256', NULL, 'regular'),
(257, 'Dr. Deneval Santos', NULL, 'MAT1250', '', '', 'Dr._Deneval81@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-257', NULL, 'regular'),
(258, 'Maria Clara Franco', NULL, 'MAT1251', '', '', 'Maria.Clara73@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-258', NULL, 'regular'),
(259, 'Melissa Moreira', NULL, 'MAT1252', '', '', 'Melissa.Moreira@escola.com.br', '/uploads/aluno252.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-259', NULL, 'regular'),
(260, 'Dr. João Moraes', NULL, 'MAT1253', '', '', 'Dr._Joao18@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-260', NULL, 'regular'),
(261, 'Marcelo Braga', NULL, 'MAT1254', '', '', 'Marcelo_Braga@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-261', NULL, 'regular'),
(262, 'Isabella Souza', NULL, 'MAT1255', '', '', 'Isabella.Souza35@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-262', NULL, 'regular'),
(263, 'Júlia Santos Jr.', NULL, 'MAT1256', '', '', 'Julia.Santos@escola.com.br', '/uploads/aluno256.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-263', NULL, 'regular'),
(264, 'Laura Nogueira', NULL, 'MAT1257', '', '', 'Laura_Nogueira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-264', NULL, 'regular'),
(265, 'João Miguel Carvalho', NULL, 'MAT1258', '', '', 'Joao.Miguel@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-265', NULL, 'regular'),
(266, 'César Xavier', NULL, 'MAT1259', '', '', 'Cesar.Xavier14@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-266', NULL, 'regular'),
(267, 'Marcelo Melo', NULL, 'MAT1260', '', '', 'Marcelo.Melo@escola.com.br', '/uploads/aluno260.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-267', NULL, 'regular'),
(268, 'Rafaela Reis', NULL, 'MAT1261', '', '', 'Rafaela_Reis39@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-268', NULL, 'regular'),
(269, 'Isaac Melo', NULL, 'MAT1262', '', '', 'Isaac_Melo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-269', NULL, 'regular'),
(270, 'Sr. Raul Costa', NULL, 'MAT1263', '', '', 'Sr.Raul@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-270', NULL, 'regular'),
(271, 'Alícia Nogueira', NULL, 'MAT1264', '', '', 'Alicia_Nogueira@escola.com.br', '/uploads/aluno264.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-271', NULL, 'regular'),
(272, 'Célia Silva', NULL, 'MAT1265', '', '', 'Celia_Silva64@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-272', NULL, 'regular'),
(273, 'Silas Martins', NULL, 'MAT1266', '', '', 'Silas.Martins@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-273', NULL, 'regular'),
(274, 'Sophia Nogueira', NULL, 'MAT1267', '', '', 'Sophia.Nogueira34@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-274', NULL, 'regular'),
(275, 'Maria Luiza Souza', NULL, 'MAT1268', '', '', 'Maria.Luiza@escola.com.br', '/uploads/aluno268.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-275', NULL, 'regular'),
(276, 'Antonella Braga', NULL, 'MAT1269', '', '', 'Antonella_Braga@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-276', NULL, 'regular'),
(277, 'Srta. Júlia Saraiva', NULL, 'MAT1270', '', '', 'Srta.Julia@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-277', NULL, 'regular'),
(278, 'João Pedro Oliveira', NULL, 'MAT1271', '', '', 'Joao.Pedro@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-278', NULL, 'regular'),
(279, 'Guilherme Moraes', NULL, 'MAT1272', '', '', 'Guilherme_Moraes62@escola.com.br', '/uploads/aluno272.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-279', NULL, 'regular'),
(280, 'Esther Albuquerque', NULL, 'MAT1273', '', '', 'Esther_Albuquerque85@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-280', NULL, 'regular'),
(281, 'Félix Batista', NULL, 'MAT1274', '', '', 'Felix_Batista71@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-281', NULL, 'regular'),
(282, 'Maria Cecília Batista Filho', NULL, 'MAT1275', '', '', 'Maria.Cecilia19@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-282', NULL, 'regular'),
(283, 'Sr. Paulo Pereira', NULL, 'MAT1276', '', '', 'Sr.Paulo@escola.com.br', '/uploads/aluno276.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-283', NULL, 'regular'),
(284, 'Lorenzo Costa', NULL, 'MAT1277', '', '', 'Lorenzo.Costa7@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-284', NULL, 'regular'),
(285, 'Maria Cecília Moraes Jr.', NULL, 'MAT1278', '', '', 'Maria_Cecilia27@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-285', NULL, 'regular'),
(286, 'Natália Oliveira', NULL, 'MAT1279', '', '', 'Natalia.Oliveira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-286', NULL, 'regular'),
(287, 'Morgana Silva Neto', NULL, 'MAT1280', '', '', 'Morgana.Silva@escola.com.br', '/uploads/aluno280.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-287', NULL, 'regular'),
(288, 'Washington Reis', NULL, 'MAT1281', '', '', 'Washington_Reis@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-288', NULL, 'regular'),
(289, 'Janaína Xavier', NULL, 'MAT1282', '', '', 'Janaina_Xavier38@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-289', NULL, 'regular'),
(290, 'Danilo Costa', NULL, 'MAT1283', '', '', 'Danilo_Costa@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-290', NULL, 'regular'),
(291, 'Danilo Martins Jr.', NULL, 'MAT1284', '', '', 'Danilo.Martins69@escola.com.br', '/uploads/aluno284.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-291', NULL, 'regular'),
(292, 'Gustavo Moreira', NULL, 'MAT1285', '', '', 'Gustavo.Moreira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-292', NULL, 'regular'),
(293, 'Manuela Nogueira', NULL, 'MAT1286', '', '', 'Manuela.Nogueira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-293', NULL, 'regular');
INSERT INTO `alunos` (`id`, `nome`, `cpf`, `matricula`, `serie`, `turma`, `email`, `foto`, `biografia`, `telefone`, `contato_responsaveis`, `turno`, `data_nascimento`, `data_cadastro`, `sexo`, `rg`, `restricoes_medicas`, `status`) VALUES
(294, 'Gabriel Santos', NULL, 'MAT1287', '', '', 'Gabriel_Santos19@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-294', NULL, 'regular'),
(295, 'Sarah Moreira', NULL, 'MAT1288', '', '', 'Sarah.Moreira@escola.com.br', '/uploads/aluno288.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-295', NULL, 'regular'),
(296, 'Felipe Franco', NULL, 'MAT1289', '', '', 'Felipe.Franco@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-296', NULL, 'regular'),
(297, 'Sr. Davi Lucca Santos', NULL, 'MAT1290', '', '', 'Sr._Davi31@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-297', NULL, 'regular'),
(298, 'Sr. Gabriel Batista', NULL, 'MAT1291', '', '', 'Sr._Gabriel@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-298', NULL, 'regular'),
(299, 'Davi Silva', NULL, 'MAT1292', '', '', 'Davi.Silva@escola.com.br', '/uploads/aluno292.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-299', NULL, 'regular'),
(300, 'Cauã Macedo', NULL, 'MAT1293', '', '', 'Caua_Macedo87@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-300', NULL, 'regular'),
(301, 'Maria Júlia Melo', NULL, 'MAT1294', '', '', 'Maria_Julia@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-301', NULL, 'regular'),
(302, 'Noah Pereira', NULL, 'MAT1295', '', '', 'Noah_Pereira63@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-302', NULL, 'regular'),
(303, 'Alessandra Xavier', NULL, 'MAT1296', '', '', 'Alessandra.Xavier@escola.com.br', '/uploads/aluno296.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-303', NULL, 'regular'),
(304, 'Pablo Reis', NULL, 'MAT1297', '', '', 'Pablo_Reis57@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-304', NULL, 'regular'),
(305, 'Alessandra Moreira', NULL, 'MAT1298', '', '', 'Alessandra.Moreira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-305', NULL, 'regular'),
(306, 'Esther Martins', NULL, 'MAT1299', '', '', 'Esther_Martins@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-306', NULL, 'regular'),
(307, 'Warley Moraes', NULL, 'MAT1300', '', '', 'Warley.Moraes@escola.com.br', '/uploads/aluno300.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-307', NULL, 'regular'),
(308, 'Sílvia Franco', NULL, 'MAT1301', '', '', 'Silvia_Franco10@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-308', NULL, 'regular'),
(309, 'Eloá Reis', NULL, 'MAT1302', '', '', 'Eloa.Reis@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-309', NULL, 'regular'),
(310, 'Isabela Nogueira', NULL, 'MAT1303', '', '', 'Isabela_Nogueira99@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-310', NULL, 'regular'),
(311, 'Isabella Costa Jr.', NULL, 'MAT1304', '', '', 'Isabella_Costa51@escola.com.br', '/uploads/aluno304.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-311', NULL, 'regular'),
(312, 'Carla Nogueira', NULL, 'MAT1305', '', '', 'Carla.Nogueira95@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-312', NULL, 'regular'),
(313, 'Breno Batista', NULL, 'MAT1306', '', '', 'Breno.Batista@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-313', NULL, 'regular'),
(314, 'Paulo Oliveira', NULL, 'MAT1307', '', '', 'Paulo.Oliveira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-314', NULL, 'regular'),
(315, 'Morgana Reis', NULL, 'MAT1308', '', '', 'Morgana.Reis@escola.com.br', '/uploads/aluno308.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-315', NULL, 'regular'),
(316, 'Elisa Barros', NULL, 'MAT1309', '', '', 'Elisa_Barros@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-316', NULL, 'regular'),
(317, 'Sr. Davi Lucca Oliveira', NULL, 'MAT1310', '', '', 'Sr._Davi31@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-317', NULL, 'regular'),
(318, 'Danilo Franco Neto', NULL, 'MAT1311', '', '', 'Danilo.Franco98@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-318', NULL, 'regular'),
(319, 'Leonardo Costa', NULL, 'MAT1312', '', '', 'Leonardo.Costa@escola.com.br', '/uploads/aluno312.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-319', NULL, 'regular'),
(320, 'Suélen Moraes', NULL, 'MAT1313', '', '', 'Suelen.Moraes16@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-320', NULL, 'regular'),
(321, 'Frederico Melo', NULL, 'MAT1314', '', '', 'Frederico.Melo77@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-321', NULL, 'regular'),
(322, 'Ana Clara Oliveira', NULL, 'MAT1315', '', '', 'Ana_Clara@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-322', NULL, 'regular'),
(323, 'Carla Saraiva', NULL, 'MAT1316', '', '', 'Carla.Saraiva@escola.com.br', '/uploads/aluno316.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-323', NULL, 'regular'),
(324, 'Raul Oliveira', NULL, 'MAT1317', '', '', 'Raul.Oliveira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-324', NULL, 'regular'),
(325, 'Maria Alice Barros', NULL, 'MAT1318', '', '', 'Maria.Alice@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-325', NULL, 'regular'),
(326, 'Vicente Barros', NULL, 'MAT1319', '', '', 'Vicente_Barros@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-326', NULL, 'regular'),
(327, 'Dra. Bruna Reis', NULL, 'MAT1320', '', '', 'Dra.Bruna71@escola.com.br', '/uploads/aluno320.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-327', NULL, 'regular'),
(328, 'Henrique Franco', NULL, 'MAT1321', '', '', 'Henrique.Franco@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-328', NULL, 'regular'),
(329, 'Pedro Xavier', NULL, 'MAT1322', '', '', 'Pedro_Xavier15@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-329', NULL, 'regular'),
(330, 'Esther Moreira', NULL, 'MAT1323', '', '', 'Esther_Moreira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-330', NULL, 'regular'),
(331, 'Alessandra Franco', NULL, 'MAT1324', '6º Ano', 'Turma 1', 'Alessandra.Franco@escola.com.br', '/uploads/aluno324.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-331', NULL, 'regular'),
(332, 'Cauã Costa', NULL, 'MAT1325', '', '', 'Caua_Costa68@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-332', NULL, 'regular'),
(333, 'Aline Souza', NULL, 'MAT1326', '6º Ano', 'Turma 1', 'Aline_Souza@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-333', NULL, 'regular'),
(334, 'Isaac Melo', NULL, 'MAT1327', '', '', 'Isaac_Melo6@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-334', NULL, 'regular'),
(335, 'Joaquim Batista', NULL, 'MAT1328', '', '', 'Joaquim_Batista17@escola.com.br', '/uploads/aluno328.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-335', NULL, 'regular'),
(336, 'Silas Nogueira', NULL, 'MAT1329', '', '', 'Silas.Nogueira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-336', NULL, 'regular'),
(337, 'Talita Xavier', NULL, 'MAT1330', '', '', 'Talita_Xavier@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-337', NULL, 'regular'),
(338, 'Théo Franco', NULL, 'MAT1331', '', '', 'Theo_Franco@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-338', NULL, 'regular'),
(339, 'Marli Melo', NULL, 'MAT1332', '', '', 'Marli.Melo56@escola.com.br', '/uploads/aluno332.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-339', NULL, 'regular'),
(340, 'Yango Macedo', NULL, 'MAT1333', '', '', 'Yango.Macedo68@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-340', NULL, 'regular'),
(341, 'Antonella Costa', NULL, 'MAT1334', '', '', 'Antonella.Costa82@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-341', NULL, 'regular'),
(342, 'Felipe Saraiva', NULL, 'MAT1335', '', '', 'Felipe_Saraiva@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-342', NULL, 'regular'),
(343, 'Salvador Moraes', NULL, 'MAT1336', '', '', 'Salvador_Moraes17@escola.com.br', '/uploads/aluno336.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-343', NULL, 'regular'),
(344, 'Heloísa Martins', NULL, 'MAT1337', '', '', 'Heloisa_Martins69@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-344', NULL, 'regular'),
(345, 'Warley Melo', NULL, 'MAT1338', '', '', 'Warley_Melo62@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-345', NULL, 'regular'),
(346, 'Yango Nogueira', NULL, 'MAT1339', '', '', 'Yango_Nogueira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-346', NULL, 'regular'),
(347, 'Srta. Márcia Moraes', NULL, 'MAT1340', '', '', 'Srta.Marcia28@escola.com.br', '/uploads/aluno340.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-347', NULL, 'regular'),
(348, 'Luiza Carvalho', NULL, 'MAT1341', '', '', 'Luiza_Carvalho83@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-348', NULL, 'regular'),
(349, 'Nataniel Xavier', NULL, 'MAT1342', '', '', 'Nataniel_Xavier@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-349', NULL, 'regular'),
(350, 'Sílvia Melo', NULL, 'MAT1343', '', '', 'Silvia.Melo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-350', NULL, 'regular'),
(351, 'Washington Martins', NULL, 'MAT1344', '', '', 'Washington_Martins@escola.com.br', '/uploads/aluno344.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-351', NULL, 'regular'),
(352, 'Felícia Souza', NULL, 'MAT1345', '', '', 'Felicia_Souza@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-352', NULL, 'regular'),
(353, 'Dr. Eduardo Albuquerque', NULL, 'MAT1346', '', '', 'Dr.Eduardo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-353', NULL, 'regular'),
(354, 'Rebeca Moraes', NULL, 'MAT1347', '', '', 'Rebeca.Moraes11@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-354', NULL, 'regular'),
(355, 'Maria Cecília Albuquerque', NULL, 'MAT1348', '', '', 'Maria_Cecilia@escola.com.br', '/uploads/aluno348.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-355', NULL, 'regular'),
(356, 'Isabela Batista Filho', NULL, 'MAT1349', '', '', 'Isabela_Batista@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-356', NULL, 'regular'),
(357, 'Davi Lucca Franco', NULL, 'MAT1350', '', '', 'Davi.Lucca@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-357', NULL, 'regular'),
(358, 'Pedro Henrique Braga', NULL, 'MAT1351', '', '', 'Pedro_Henrique@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-358', NULL, 'regular'),
(359, 'Paulo Macedo', NULL, 'MAT1352', '', '', 'Paulo.Macedo@escola.com.br', '/uploads/aluno352.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-359', NULL, 'regular'),
(360, 'Marli Moraes', NULL, 'MAT1353', '', '', 'Marli.Moraes60@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-360', NULL, 'regular'),
(361, 'Ladislau Oliveira', NULL, 'MAT1354', '', '', 'Ladislau_Oliveira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-361', NULL, 'regular'),
(362, 'Bryan Reis', NULL, 'MAT1355', '', '', 'Bryan_Reis@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-362', NULL, 'regular'),
(363, 'Bernardo Costa', NULL, 'MAT1356', '', '', 'Bernardo.Costa@escola.com.br', '/uploads/aluno356.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-363', NULL, 'regular'),
(364, 'Esther Macedo', NULL, 'MAT1357', '', '', 'Esther_Macedo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-364', NULL, 'regular'),
(365, 'Ígor Franco', NULL, 'MAT1358', '', '', 'Igor_Franco@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-365', NULL, 'regular'),
(366, 'Isadora Silva', NULL, 'MAT1359', '', '', 'Isadora.Silva@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-366', NULL, 'regular'),
(367, 'Ígor Moreira', NULL, 'MAT1360', '', '', 'Igor.Moreira91@escola.com.br', '/uploads/aluno360.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-367', NULL, 'regular'),
(368, 'Isabelly Reis Jr.', NULL, 'MAT1361', '', '', 'Isabelly_Reis@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-368', NULL, 'regular'),
(369, 'Sr. Felipe Barros', NULL, 'MAT1362', '', '', 'Sr._Felipe13@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-369', NULL, 'regular'),
(370, 'Norberto Martins', NULL, 'MAT1363', '', '', 'Norberto.Martins56@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-370', NULL, 'regular'),
(371, 'Valentina Braga', NULL, 'MAT1364', '', '', 'Valentina_Braga43@escola.com.br', '/uploads/aluno364.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-371', NULL, 'regular'),
(372, 'Margarida Moraes', NULL, 'MAT1365', '', '', 'Margarida.Moraes@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-372', NULL, 'regular'),
(373, 'Alessandro Batista', NULL, 'MAT1366', '', '', 'Alessandro_Batista61@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-373', NULL, 'regular'),
(374, 'Daniel Carvalho', NULL, 'MAT1367', '', '', 'Daniel.Carvalho31@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-374', NULL, 'regular'),
(375, 'Lucas Melo Jr.', NULL, 'MAT1368', '', '', 'Lucas.Melo@escola.com.br', '/uploads/aluno368.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-375', NULL, 'regular'),
(376, 'Sr. César Moraes', NULL, 'MAT1369', '', '', 'Sr._Cesar@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-376', NULL, 'regular'),
(377, 'Lara Carvalho', NULL, 'MAT1370', '', '', 'Lara.Carvalho43@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-377', NULL, 'regular'),
(378, 'Fabrício Martins', NULL, 'MAT1371', '', '', 'Fabricio.Martins27@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-378', NULL, 'regular'),
(379, 'Srta. Isabela Reis', NULL, 'MAT1372', '', '', 'Srta.Isabela69@escola.com.br', '/uploads/aluno372.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-379', NULL, 'regular'),
(380, 'Gabriel Moraes', NULL, 'MAT1373', '', '', 'Gabriel.Moraes@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-380', NULL, 'regular'),
(381, 'Lorena Melo', NULL, 'MAT1374', '', '', 'Lorena.Melo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-381', NULL, 'regular'),
(382, 'Fábio Saraiva', NULL, 'MAT1375', '', '', 'Fabio_Saraiva@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-382', NULL, 'regular'),
(383, 'Ana Luiza Braga', NULL, 'MAT1376', '', '', 'Ana.Luiza@escola.com.br', '/uploads/aluno376.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-383', NULL, 'regular'),
(384, 'Marli Nogueira', NULL, 'MAT1377', '', '', 'Marli_Nogueira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-384', NULL, 'regular'),
(385, 'Maitê Barros', NULL, 'MAT1378', '', '', 'Maite_Barros@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-385', NULL, 'regular'),
(386, 'Víctor Melo', NULL, 'MAT1379', '', '', 'Victor.Melo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-386', NULL, 'regular'),
(387, 'Théo Moreira', NULL, 'MAT1380', '', '', 'Theo.Moreira@escola.com.br', '/uploads/aluno380.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-387', NULL, 'regular'),
(388, 'Dra. Lavínia Barros', NULL, 'MAT1381', '', '', 'Dra._Lavinia32@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-388', NULL, 'regular'),
(389, 'Manuela Souza', NULL, 'MAT1382', '', '', 'Manuela.Souza@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-389', NULL, 'regular'),
(390, 'Elisa Barros', NULL, 'MAT1383', '', '', 'Elisa.Barros@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-390', NULL, 'regular'),
(391, 'Félix Saraiva', NULL, 'MAT1384', '', '', 'Felix_Saraiva94@escola.com.br', '/uploads/aluno384.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-391', NULL, 'regular'),
(392, 'Célia Albuquerque', NULL, 'MAT1385', '', '', 'Celia_Albuquerque58@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-392', NULL, 'regular'),
(393, 'Silas Costa Jr.', NULL, 'MAT1386', '', '', 'Silas_Costa@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-393', NULL, 'regular'),
(394, 'Rebeca Nogueira', NULL, 'MAT1387', '', '', 'Rebeca.Nogueira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-394', NULL, 'regular'),
(395, 'Isis Barros', NULL, 'MAT1388', '', '', 'Isis_Barros@escola.com.br', '/uploads/aluno388.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-395', NULL, 'regular'),
(396, 'Fabiano Franco', NULL, 'MAT1389', '', '', 'Fabiano.Franco@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-396', NULL, 'regular'),
(397, 'Alice Santos', NULL, 'MAT1390', '', '', 'Alice_Santos94@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-397', NULL, 'regular'),
(398, 'Eduarda Albuquerque', NULL, 'MAT1391', '', '', 'Eduarda.Albuquerque@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-398', NULL, 'regular'),
(399, 'Antônio Macedo', NULL, 'MAT1392', '', '', 'Antonio.Macedo88@escola.com.br', '/uploads/aluno392.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-399', NULL, 'regular'),
(400, 'Fábio Costa', NULL, 'MAT1393', '', '', 'Fabio_Costa36@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-400', NULL, 'regular'),
(401, 'Paulo Martins', NULL, 'MAT1394', '', '', 'Paulo_Martins@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-401', NULL, 'regular'),
(402, 'Fabiano Saraiva', NULL, 'MAT1395', '', '', 'Fabiano_Saraiva@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-402', NULL, 'regular'),
(403, 'Joana Saraiva', NULL, 'MAT1396', '', '', 'Joana.Saraiva41@escola.com.br', '/uploads/aluno396.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-403', NULL, 'regular'),
(404, 'Dra. Sophia Santos', NULL, 'MAT1397', '', '', 'Dra.Sophia@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-404', NULL, 'regular'),
(405, 'Norberto Pereira', NULL, 'MAT1398', '', '', 'Norberto.Pereira39@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-405', NULL, 'regular'),
(406, 'Lavínia Costa', NULL, 'MAT1399', '', '', 'Lavinia.Costa@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-406', NULL, 'regular'),
(407, 'Suélen Moreira', NULL, 'MAT1400', '', '', 'Suelen.Moreira@escola.com.br', '/uploads/aluno400.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-407', NULL, 'regular'),
(408, 'Fabrícia Costa', NULL, 'MAT1401', '', '', 'Fabricia_Costa66@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-408', NULL, 'regular'),
(409, 'Morgana Albuquerque Neto', NULL, 'MAT1402', '', '', 'Morgana.Albuquerque12@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-409', NULL, 'regular'),
(410, 'Nataniel Macedo', NULL, 'MAT1403', '', '', 'Nataniel.Macedo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-410', NULL, 'regular'),
(411, 'João Lucas Costa Filho', NULL, 'MAT1404', '', '', 'Joao.Lucas@escola.com.br', '/uploads/aluno404.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-411', NULL, 'regular'),
(412, 'Ana Luiza Pereira', NULL, 'MAT1405', '', '', 'Ana_Luiza@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-412', NULL, 'regular'),
(413, 'Isis Melo', NULL, 'MAT1406', '', '', 'Isis.Melo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-413', NULL, 'regular'),
(414, 'Sr. Rafael Reis', NULL, 'MAT1407', '', '', 'Sr.Rafael@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-414', NULL, 'regular'),
(415, 'Lorenzo Melo', NULL, 'MAT1408', '', '', 'Lorenzo_Melo@escola.com.br', '/uploads/aluno408.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-415', NULL, 'regular'),
(416, 'Bryan Carvalho', NULL, 'MAT1409', '', '', 'Bryan.Carvalho77@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-416', NULL, 'regular'),
(417, 'Giovanna Barros', NULL, 'MAT1410', '', '', 'Giovanna_Barros0@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-417', NULL, 'regular'),
(418, 'Marli Macedo', NULL, 'MAT1411', '', '', 'Marli_Macedo26@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-418', NULL, 'regular'),
(419, 'Ana Clara Costa', NULL, 'MAT1412', '6º Ano', 'Turma 1', 'Ana.Clara@escola.com.br', '/uploads/aluno412.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-419', NULL, 'regular'),
(420, 'Davi Barros', NULL, 'MAT1413', '', '', 'Davi.Barros85@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-420', NULL, 'regular'),
(421, 'Carla Albuquerque', NULL, 'MAT1414', '', '', 'Carla.Albuquerque28@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-421', NULL, 'regular'),
(422, 'Natália Costa', NULL, 'MAT1415', '', '', 'Natalia_Costa@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-422', NULL, 'regular'),
(423, 'Deneval Souza', NULL, 'MAT1416', '', '', 'Deneval_Souza83@escola.com.br', '/uploads/aluno416.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-423', NULL, 'regular'),
(424, 'Lucca Reis', NULL, 'MAT1417', '', '', 'Lucca.Reis@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-424', NULL, 'regular'),
(425, 'Talita Oliveira', NULL, 'MAT1418', '', '', 'Talita.Oliveira26@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-425', NULL, 'regular'),
(426, 'Esther Oliveira Jr.', NULL, 'MAT1419', '', '', 'Esther_Oliveira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-426', NULL, 'regular'),
(427, 'Márcia Costa', NULL, 'MAT1420', '', '', 'Marcia.Costa76@escola.com.br', '/uploads/aluno420.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-427', NULL, 'regular'),
(428, 'Esther Carvalho', NULL, 'MAT1421', '', '', 'Esther.Carvalho@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-428', NULL, 'regular'),
(429, 'Maria Alice Reis', NULL, 'MAT1422', '', '', 'Maria.Alice40@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-429', NULL, 'regular'),
(430, 'Emanuel Martins', NULL, 'MAT1423', '', '', 'Emanuel_Martins@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-430', NULL, 'regular'),
(431, 'Ana Clara Reis', NULL, 'MAT1424', '', '', 'Ana_Clara70@escola.com.br', '/uploads/aluno424.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-431', NULL, 'regular'),
(432, 'Márcia Macedo', NULL, 'MAT1425', '', '', 'Marcia.Macedo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-432', NULL, 'regular'),
(433, 'João Pedro Xavier', NULL, 'MAT1426', '', '', 'Joao.Pedro@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-433', NULL, 'regular'),
(434, 'Alessandra Santos', NULL, 'MAT1427', '', '', 'Alessandra.Santos12@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-434', NULL, 'regular'),
(435, 'Maitê Batista', NULL, 'MAT1428', '', '', 'Maite_Batista29@escola.com.br', '/uploads/aluno428.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-435', NULL, 'regular'),
(436, 'Maria Helena Oliveira Jr.', NULL, 'MAT1429', '', '', 'Maria.Helena44@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-436', NULL, 'regular'),
(437, 'Mércia Oliveira Neto', NULL, 'MAT1430', '', '', 'Mercia.Oliveira34@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-437', NULL, 'regular'),
(438, 'Srta. Morgana Melo', NULL, 'MAT1431', '', '', 'Srta.Morgana@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-438', NULL, 'regular'),
(439, 'Hélio Barros', NULL, 'MAT1432', '', '', 'Helio.Barros13@escola.com.br', '/uploads/aluno432.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-439', NULL, 'regular'),
(440, 'Felícia Souza', NULL, 'MAT1433', '', '', 'Felicia_Souza75@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-440', NULL, 'regular'),
(441, 'Vitor Moraes', NULL, 'MAT1434', '', '', 'Vitor.Moraes92@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-441', NULL, 'regular'),
(442, 'Maria Luiza Batista', NULL, 'MAT1435', '', '', 'Maria_Luiza43@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-442', NULL, 'regular'),
(443, 'Alessandra Moreira', NULL, 'MAT1436', '', '', 'Alessandra.Moreira@escola.com.br', '/uploads/aluno436.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-443', NULL, 'regular'),
(444, 'Margarida Nogueira', NULL, 'MAT1437', '', '', 'Margarida_Nogueira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-444', NULL, 'regular'),
(445, 'Emanuelly Moreira', NULL, 'MAT1438', '', '', 'Emanuelly.Moreira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-445', NULL, 'regular'),
(446, 'Sílvia Macedo', NULL, 'MAT1439', '', '', 'Silvia.Macedo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-446', NULL, 'regular'),
(447, 'Vicente Reis Neto', NULL, 'MAT1440', '', '', 'Vicente_Reis@escola.com.br', '/uploads/aluno440.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-447', NULL, 'regular'),
(448, 'Dr. Isaac Batista', NULL, 'MAT1441', '', '', 'Dr.Isaac72@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-448', NULL, 'regular'),
(449, 'Emanuel Barros', NULL, 'MAT1442', '', '', 'Emanuel_Barros65@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-449', NULL, 'regular'),
(450, 'Matheus Pereira', NULL, 'MAT1443', '', '', 'Matheus.Pereira70@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-450', NULL, 'regular'),
(451, 'Nataniel Pereira', NULL, 'MAT1444', '', '', 'Nataniel.Pereira96@escola.com.br', '/uploads/aluno444.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-451', NULL, 'regular'),
(452, 'Sílvia Moraes', NULL, 'MAT1445', '', '', 'Silvia.Moraes78@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-452', NULL, 'regular'),
(453, 'Marcos Oliveira', NULL, 'MAT1446', '', '', 'Marcos_Oliveira96@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-453', NULL, 'regular'),
(454, 'Giovanna Melo', NULL, 'MAT1447', '', '', 'Giovanna_Melo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-454', NULL, 'regular'),
(455, 'Samuel Moreira', NULL, 'MAT1448', '', '', 'Samuel_Moreira@escola.com.br', '/uploads/aluno448.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-455', NULL, 'regular'),
(456, 'Fábio Nogueira', NULL, 'MAT1449', '', '', 'Fabio.Nogueira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-456', NULL, 'regular'),
(457, 'Nataniel Martins', NULL, 'MAT1450', '', '', 'Nataniel_Martins86@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-457', NULL, 'regular'),
(458, 'Lorena Macedo Jr.', NULL, 'MAT1451', '', '', 'Lorena_Macedo@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-458', NULL, 'regular'),
(459, 'Elisa Franco Neto', NULL, 'MAT1452', '', '', 'Elisa_Franco@escola.com.br', '/uploads/aluno452.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-459', NULL, 'regular'),
(460, 'Mariana Barros', NULL, 'MAT1453', '', '', 'Mariana.Barros@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-460', NULL, 'regular'),
(461, 'Liz Carvalho', NULL, 'MAT1454', '', '', 'Liz_Carvalho@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-461', NULL, 'regular'),
(462, 'Emanuelly Moreira', NULL, 'MAT1455', '', '', 'Emanuelly.Moreira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-462', NULL, 'regular'),
(463, 'Isabela Moreira Jr.', NULL, 'MAT1456', '', '', 'Isabela_Moreira@escola.com.br', '/uploads/aluno456.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-463', NULL, 'regular'),
(464, 'Enzo Gabriel Moreira', NULL, 'MAT1457', '', '', 'Enzo.Gabriel@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-464', NULL, 'regular'),
(465, 'Maria Júlia Santos', NULL, 'MAT1458', '', '', 'Maria.Julia@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-465', NULL, 'regular'),
(466, 'Gúbio Moreira', NULL, 'MAT1459', '', '', 'Gubio_Moreira17@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-466', NULL, 'regular'),
(467, 'Bernardo Barros Filho', NULL, 'MAT1460', '', '', 'Bernardo.Barros34@escola.com.br', '/uploads/aluno460.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-467', NULL, 'regular'),
(468, 'Srta. Célia Silva', NULL, 'MAT1461', '', '', 'Srta._Celia95@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-468', NULL, 'regular'),
(469, 'Suélen Oliveira', NULL, 'MAT1462', '', '', 'Suelen.Oliveira21@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-469', NULL, 'regular'),
(470, 'Salvador Nogueira', NULL, 'MAT1463', '', '', 'Salvador.Nogueira@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-470', NULL, 'regular'),
(471, 'Júlia Costa', NULL, 'MAT1464', '', '', 'Julia_Costa@escola.com.br', '/uploads/aluno464.jpg', '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-471', NULL, 'regular'),
(472, 'Rebeca Macedo Neto', NULL, 'MAT1465', '', '', 'Rebeca_Macedo53@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-472', NULL, 'regular'),
(473, 'Danilo Oliveira', NULL, 'MAT1466', '', '', 'Danilo_Oliveira60@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-473', NULL, 'regular'),
(474, 'Manuela Albuquerque', NULL, 'MAT1467', '', '', 'Manuela_Albuquerque@escola.com.br', NULL, '', '', '', '', NULL, '2025-09-26', 'Feminino', 'PENDENTE-474', NULL, 'regular'),
(475, 'Arthur', NULL, '222222', '', '', 'arthur@gmail.com', '', NULL, NULL, NULL, NULL, NULL, '2025-09-26', 'Feminino', 'PENDENTE-475', NULL, 'regular');

-- --------------------------------------------------------

--
-- Estrutura para tabela `alunos_turmas`
--

CREATE TABLE `alunos_turmas` (
  `id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `alunos_turmas`
--

INSERT INTO `alunos_turmas` (`id`, `aluno_id`, `turma_id`) VALUES
(10, 2, 1),
(11, 3, 1),
(12, 4, 1),
(13, 331, 1),
(14, 29, 1),
(15, 419, 1),
(16, 333, 1);

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

--
-- Despejando dados para a tabela `aulas`
--

INSERT INTO `aulas` (`id`, `data`, `descricao`, `status`, `materia_id`, `turma_id`, `calendario_id`) VALUES
(5, '2025-07-25', 'Aula 1', 'realizada', 1, 1, 13),
(6, '2025-07-24', 'Aula 2', 'realizada', 1, 1, 13);

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

--
-- Despejando dados para a tabela `avaliacoes`
--

INSERT INTO `avaliacoes` (`id`, `descricao`, `valor`, `calendario_id`, `materia_id`, `turma_id`, `data`, `status`) VALUES
(12, 'Prova', 10.00, 13, 1, 1, '2025-03-14', 'Concluído'),
(16, 'Trabalho', 15.00, 13, 1, 1, '2025-09-12', 'Concluído');

-- --------------------------------------------------------

--
-- Estrutura para tabela `caixas_destino`
--

CREATE TABLE `caixas_destino` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(120) NOT NULL,
  `saldo_inicial` decimal(15,2) NOT NULL DEFAULT 0.00,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `caixas_destino`
--

INSERT INTO `caixas_destino` (`id`, `nome`, `saldo_inicial`, `ativo`, `created_at`, `updated_at`) VALUES
(1, 'Caixa Interno', 0.00, 1, '2025-09-24 13:21:06', NULL),
(2, 'AIAT', 1000.00, 1, '2025-09-24 13:21:32', NULL),
(4, 'Arthur', 1240.00, 1, '2025-09-24 13:22:14', NULL),
(5, 'Arthur S', 1260.00, 1, '2025-09-24 13:28:01', NULL),
(6, 'Krysthyan', 2500.00, 1, '2025-09-24 14:11:41', NULL),
(8, 'ASD', 2500.00, 1, '2025-09-24 14:15:49', NULL),
(9, 'Teste', 1265.00, 1, '2025-09-24 14:29:44', NULL),
(10, 'asdsa', 1111.00, 1, '2025-09-24 17:48:06', NULL),
(11, 'dsasadasq', 12402.00, 1, '2025-09-24 18:51:51', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `caixa_movimentos`
--

CREATE TABLE `caixa_movimentos` (
  `id` int(10) UNSIGNED NOT NULL,
  `caixa_id` int(10) UNSIGNED NOT NULL,
  `tipo` enum('entrada','saida') NOT NULL,
  `valor` decimal(15,2) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `data` date NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
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
(13, 1, '2025-02-03', '2025-04-18', 2025, 'Bimestral', 25),
(14, 2, '2025-04-21', '2025-07-18', 2025, 'Bimestral', 25),
(15, 3, '2025-08-04', '2025-10-17', 2025, 'Bimestral', 25),
(16, 4, '2025-10-20', '2025-12-19', 2025, 'Bimestral', 25);

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
(12, 3, 5, '{\"{{responsavel}}\":\"Carmem\",\"{{nome}}\":\"Raissa\",\"{{cpf}}\":\"15447789662\",\"{{endereco}}\":\"Av. José\",\"{{valor_matricula}}\":\"100\",\"{{valor_mensalidade}}\":\"600\",\"{{valor_material_didatico}}\":\"200\",\"{{data_primeira_mensalidade}}\":\"01/08/2025\",\"{{valor_desconto_porcentagem}}\":\"10\",\"{{data_inicio_do_desconto}}\":\"01/08/2025\",\"{{data_fim_do_desconto}}\":\"01/12/2025\",\"{{instituicao}}\":\"Anglo\"}', NULL, '2025-08-05 22:06:44', '2025-08-05 22:06:44', 'Vigente'),
(13, 3, 475, '{\"{{responsavel}}\":\"Arthur\",\"{{nome}}\":\"Arthur Saraiva\",\"{{cpf}}\":\"123.456.789-10\",\"{{endereco}}\":\"Rua Oliveiras\",\"{{valor_matricula}}\":\"1.000,00\",\"{{valor_mensalidade}}\":\"925,00\",\"{{valor_material_didatico}}\":\"300,00\",\"{{data_primeira_mensalidade}}\":\"2025-02\",\"{{valor_desconto_porcentagem}}\":\"75\",\"{{data_inicio_do_desconto}}\":\"2025-02\",\"{{data_fim_do_desconto}}\":\"2027-12\",\"{{instituicao}}\":\"Desv\"}', NULL, '2025-09-18 15:39:55', '2025-09-18 15:39:55', 'Vigente');

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
(15, 1, 6, '2025-08-26 13:38:40'),
(16, 1, 3, '2025-08-26 13:39:19'),
(20, 1, 4, '2025-08-27 14:32:27');

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
(1, 12, 'amet rem', 10.00, '2025-07-01', '2025-12-15'),
(2, 17, 'occaecati sunt', 25.00, '2025-07-01', '2025-12-15'),
(3, 22, 'vel explicabo', 15.00, '2025-07-01', '2025-12-15'),
(4, 27, 'ducimus rerum', 10.00, '2025-07-01', '2025-12-15'),
(5, 32, 'assumenda in', 20.00, '2025-07-01', '2025-12-15'),
(6, 37, 'asperiores mollitia', 20.00, '2025-07-01', '2025-12-15'),
(7, 42, 'laboriosam cumque', 20.00, '2025-07-01', '2025-12-15'),
(8, 47, 'magni natus', 15.00, '2025-07-01', '2025-12-15'),
(9, 52, 'nisi dolor', 25.00, '2025-07-01', '2025-12-15'),
(10, 57, 'hic quasi', 20.00, '2025-07-01', '2025-12-15'),
(11, 62, 'dolorum voluptas', 20.00, '2025-07-01', '2025-12-15'),
(12, 67, 'pariatur accusamus', 10.00, '2025-07-01', '2025-12-15'),
(13, 72, 'dolorum consectetur', 15.00, '2025-07-01', '2025-12-15'),
(14, 77, 'assumenda error', 25.00, '2025-07-01', '2025-12-15'),
(15, 82, 'corrupti placeat', 25.00, '2025-07-01', '2025-12-15'),
(16, 87, 'aliquam maiores', 15.00, '2025-07-01', '2025-12-15'),
(17, 92, 'dicta ab', 15.00, '2025-07-01', '2025-12-15'),
(18, 97, 'quas doloremque', 25.00, '2025-07-01', '2025-12-15'),
(19, 102, 'provident vitae', 25.00, '2025-07-01', '2025-12-15'),
(20, 107, 'velit inventore', 20.00, '2025-07-01', '2025-12-15'),
(21, 112, 'rem eveniet', 15.00, '2025-07-01', '2025-12-15'),
(22, 117, 'distinctio cupiditate', 10.00, '2025-07-01', '2025-12-15'),
(23, 122, 'dolorem iure', 15.00, '2025-07-01', '2025-12-15'),
(24, 127, 'possimus quasi', 15.00, '2025-07-01', '2025-12-15'),
(25, 132, 'culpa ab', 15.00, '2025-07-01', '2025-12-15'),
(26, 137, 'nemo quaerat', 25.00, '2025-07-01', '2025-12-15'),
(27, 142, 'fugiat modi', 10.00, '2025-07-01', '2025-12-15'),
(28, 147, 'voluptatibus ratione', 10.00, '2025-07-01', '2025-12-15'),
(29, 152, 'commodi voluptatem', 25.00, '2025-07-01', '2025-12-15'),
(30, 157, 'ab dolorem', 15.00, '2025-07-01', '2025-12-15'),
(31, 162, 'eos sapiente', 20.00, '2025-07-01', '2025-12-15'),
(32, 167, 'itaque molestiae', 10.00, '2025-07-01', '2025-12-15'),
(33, 172, 'architecto earum', 25.00, '2025-07-01', '2025-12-15'),
(34, 177, 'numquam eligendi', 10.00, '2025-07-01', '2025-12-15'),
(35, 182, 'quaerat dolores', 25.00, '2025-07-01', '2025-12-15'),
(36, 187, 'aperiam voluptatibus', 15.00, '2025-07-01', '2025-12-15'),
(37, 192, 'nulla rem', 15.00, '2025-07-01', '2025-12-15'),
(38, 197, 'veniam delectus', 10.00, '2025-07-01', '2025-12-15'),
(39, 202, 'architecto harum', 15.00, '2025-07-01', '2025-12-15'),
(40, 207, 'quasi nemo', 10.00, '2025-07-01', '2025-12-15'),
(41, 212, 'praesentium minima', 25.00, '2025-07-01', '2025-12-15'),
(42, 217, 'ipsum eaque', 10.00, '2025-07-01', '2025-12-15'),
(43, 222, 'atque quasi', 10.00, '2025-07-01', '2025-12-15'),
(44, 227, 'distinctio nostrum', 15.00, '2025-07-01', '2025-12-15'),
(45, 232, 'commodi commodi', 10.00, '2025-07-01', '2025-12-15'),
(46, 237, 'quas libero', 25.00, '2025-07-01', '2025-12-15'),
(47, 242, 'delectus perferendis', 20.00, '2025-07-01', '2025-12-15'),
(48, 247, 'asperiores fuga', 20.00, '2025-07-01', '2025-12-15'),
(49, 252, 'veritatis placeat', 15.00, '2025-07-01', '2025-12-15'),
(50, 257, 'dignissimos eius', 25.00, '2025-07-01', '2025-12-15'),
(51, 262, 'non rem', 15.00, '2025-07-01', '2025-12-15'),
(52, 267, 'deleniti quis', 25.00, '2025-07-01', '2025-12-15'),
(53, 272, 'aliquam nemo', 15.00, '2025-07-01', '2025-12-15'),
(54, 277, 'quia minus', 10.00, '2025-07-01', '2025-12-15'),
(55, 282, 'voluptatibus modi', 15.00, '2025-07-01', '2025-12-15'),
(56, 287, 'delectus quod', 10.00, '2025-07-01', '2025-12-15'),
(57, 292, 'rerum est', 10.00, '2025-07-01', '2025-12-15'),
(58, 297, 'quam eos', 20.00, '2025-07-01', '2025-12-15'),
(59, 302, 'vitae pariatur', 15.00, '2025-07-01', '2025-12-15'),
(60, 307, 'maxime omnis', 25.00, '2025-07-01', '2025-12-15'),
(61, 312, 'fuga blanditiis', 10.00, '2025-07-01', '2025-12-15'),
(62, 317, 'necessitatibus a', 15.00, '2025-07-01', '2025-12-15'),
(63, 322, 'blanditiis maiores', 25.00, '2025-07-01', '2025-12-15'),
(64, 327, 'suscipit sunt', 25.00, '2025-07-01', '2025-12-15'),
(65, 332, 'vero provident', 20.00, '2025-07-01', '2025-12-15'),
(66, 337, 'officia magnam', 20.00, '2025-07-01', '2025-12-15'),
(67, 342, 'facere corrupti', 20.00, '2025-07-01', '2025-12-15'),
(68, 347, 'quasi sint', 20.00, '2025-07-01', '2025-12-15'),
(69, 352, 'exercitationem animi', 15.00, '2025-07-01', '2025-12-15'),
(70, 357, 'aliquid itaque', 20.00, '2025-07-01', '2025-12-15'),
(71, 362, 'odio sapiente', 25.00, '2025-07-01', '2025-12-15'),
(72, 367, 'eius totam', 25.00, '2025-07-01', '2025-12-15'),
(73, 372, 'neque esse', 25.00, '2025-07-01', '2025-12-15'),
(74, 377, 'hic dolore', 25.00, '2025-07-01', '2025-12-15'),
(75, 382, 'qui quaerat', 15.00, '2025-07-01', '2025-12-15'),
(76, 387, 'aut error', 10.00, '2025-07-01', '2025-12-15'),
(77, 392, 'fugit eius', 25.00, '2025-07-01', '2025-12-15'),
(78, 397, 'rerum saepe', 10.00, '2025-07-01', '2025-12-15'),
(79, 402, 'a ipsa', 15.00, '2025-07-01', '2025-12-15'),
(80, 407, 'numquam veniam', 10.00, '2025-07-01', '2025-12-15'),
(81, 412, 'quam et', 25.00, '2025-07-01', '2025-12-15'),
(82, 417, 'maiores impedit', 20.00, '2025-07-01', '2025-12-15'),
(83, 422, 'ipsam quidem', 20.00, '2025-07-01', '2025-12-15'),
(84, 427, 'numquam consectetur', 20.00, '2025-07-01', '2025-12-15'),
(85, 432, 'natus libero', 20.00, '2025-07-01', '2025-12-15'),
(86, 437, 'dicta eum', 15.00, '2025-07-01', '2025-12-15'),
(87, 442, 'aspernatur esse', 20.00, '2025-07-01', '2025-12-15'),
(88, 447, 'nam provident', 10.00, '2025-07-01', '2025-12-15'),
(89, 452, 'ipsam beatae', 10.00, '2025-07-01', '2025-12-15'),
(90, 457, 'atque tempora', 20.00, '2025-07-01', '2025-12-15'),
(91, 462, 'perferendis quae', 25.00, '2025-07-01', '2025-12-15'),
(92, 467, 'incidunt dolores', 10.00, '2025-07-01', '2025-12-15'),
(93, 472, 'voluptatum voluptatem', 10.00, '2025-07-01', '2025-12-15'),
(94, 475, 'Bolsa', 10.00, '2025-01-01', '2027-12-01');

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
(1, 'PDF', 'PDF', 'PDF', '1753189048961-403377686.pdf', 'turma_toda', 6, 1, 1, '2025-07-22 09:57:28');

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

-- --------------------------------------------------------

--
-- Estrutura para tabela `eventos_roles`
--

CREATE TABLE `eventos_roles` (
  `id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `role` enum('aluno','responsavel','professor','gestor') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `eventos_usuarios`
--

CREATE TABLE `eventos_usuarios` (
  `id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(257, 1, 14, '2025-08-27 16:05:13');

-- --------------------------------------------------------

--
-- Estrutura para tabela `funcionarios`
--

CREATE TABLE `funcionarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `registro` varchar(255) NOT NULL,
  `biografia` varchar(255) NOT NULL,
  `formacao` varchar(255) DEFAULT NULL,
  `instituicao` varchar(255) DEFAULT NULL,
  `materias` text DEFAULT NULL,
  `turmas` text DEFAULT NULL,
  `total_alunos` int(11) DEFAULT 0,
  `taxa_aprovacao` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `funcionarios`
--

INSERT INTO `funcionarios` (`id`, `nome`, `email`, `cargo`, `departamento`, `foto`, `registro`, `biografia`, `formacao`, `instituicao`, `materias`, `turmas`, `total_alunos`, `taxa_aprovacao`) VALUES
(6, 'jose', 'jose@gmail.com', 'Professor', 'História', '', 'MAT12345', 'José', NULL, NULL, NULL, NULL, 0, 0.00),
(476, 'João', 'Joao@gmail.com', 'Professor', 'Liderança Educacional', '', '1234', 'Sou foda', NULL, NULL, NULL, NULL, 0, 0.00);

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
(1, 'Livro', 'Autor', '/uploads/material/1753360900782-836016659.png', '/uploads/material/1753360900793-26293232.pdf'),
(2, 'O homem que calculava', 'Malba Tahan', '/uploads/material/1758825014560-185562336.png', '/uploads/material/1758825014566-147759856.pdf'),
(3, 'Livro', 'Rick', '/uploads/material/1758825609434-852725603.jpg', '/uploads/material/1758825609434-861586587.pdf'),
(4, 'Livro Confiável', 'Jhow', '/uploads/material/1758825711852-297427332.jpg', '/uploads/material/1758825711852-222712715.pdf');

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
(1, 'História', 'História', 'História', 0, 0, 1, '2025-07-22 12:49:19', 2),
(2, 'Matemática', 'Contas', 'Contas', 0, 0, 1, '2025-09-25 18:28:52', 2),
(3, 'Ciências', 'Corpo Humano', 'Detalhado', 0, 1, 1, '2025-09-25 18:40:59', 3);

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
(2, 2, 2),
(3, 3, 3),
(1, 1, 4),
(1, 4, 5);

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
(123, 14, 1, 'joao', '2025-08-27 16:05:10', 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `mensalidades`
--

CREATE TABLE `mensalidades` (
  `id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `data_inicial` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `mensalidades`
--

INSERT INTO `mensalidades` (`id`, `aluno_id`, `valor`, `data_inicial`) VALUES
(6, 8, 1404.00, '2025-09-05'),
(7, 9, 843.00, '2025-09-05'),
(8, 10, 1585.00, '2025-09-05'),
(9, 11, 1463.00, '2025-09-05'),
(10, 12, 1394.00, '2025-09-05'),
(11, 13, 1987.00, '2025-09-05'),
(12, 14, 1934.00, '2025-09-05'),
(13, 15, 1063.00, '2025-09-05'),
(14, 16, 1254.00, '2025-09-05'),
(15, 17, 1964.00, '2025-09-05'),
(16, 18, 1167.00, '2025-09-05'),
(17, 19, 1546.00, '2025-09-05'),
(18, 20, 1413.00, '2025-09-05'),
(19, 21, 887.00, '2025-09-05'),
(20, 22, 721.00, '2025-09-05'),
(21, 23, 1685.00, '2025-09-05'),
(22, 24, 1559.00, '2025-09-05'),
(23, 25, 1432.00, '2025-09-05'),
(24, 26, 1508.00, '2025-09-05'),
(25, 27, 1545.00, '2025-09-05'),
(26, 28, 715.00, '2025-09-05'),
(27, 29, 1641.00, '2025-09-05'),
(28, 30, 755.00, '2025-09-05'),
(29, 31, 1024.00, '2025-09-05'),
(30, 32, 1554.00, '2025-09-05'),
(31, 33, 1046.00, '2025-09-05'),
(32, 34, 1902.00, '2025-09-05'),
(33, 35, 1035.00, '2025-09-05'),
(34, 36, 1404.00, '2025-09-05'),
(35, 37, 1688.00, '2025-09-05'),
(36, 38, 1059.00, '2025-09-05'),
(37, 39, 973.00, '2025-09-05'),
(38, 40, 986.00, '2025-09-05'),
(39, 41, 1856.00, '2025-09-05'),
(40, 42, 834.00, '2025-09-05'),
(41, 43, 1326.00, '2025-09-05'),
(42, 44, 1202.00, '2025-09-05'),
(43, 45, 1247.00, '2025-09-05'),
(44, 46, 1703.00, '2025-09-05'),
(45, 47, 1686.00, '2025-09-05'),
(46, 48, 1103.00, '2025-09-05'),
(47, 49, 1210.00, '2025-09-05'),
(48, 50, 918.00, '2025-09-05'),
(49, 51, 895.00, '2025-09-05'),
(50, 52, 1534.00, '2025-09-05'),
(51, 53, 1186.00, '2025-09-05'),
(52, 54, 1205.00, '2025-09-05'),
(53, 55, 1210.00, '2025-09-05'),
(54, 56, 1306.00, '2025-09-05'),
(55, 57, 978.00, '2025-09-05'),
(56, 58, 839.00, '2025-09-05'),
(57, 59, 1674.00, '2025-09-05'),
(58, 60, 1493.00, '2025-09-05'),
(59, 61, 1868.00, '2025-09-05'),
(60, 62, 979.00, '2025-09-05'),
(61, 63, 1938.00, '2025-09-05'),
(62, 64, 704.00, '2025-09-05'),
(63, 65, 1936.00, '2025-09-05'),
(64, 66, 1425.00, '2025-09-05'),
(65, 67, 1126.00, '2025-09-05'),
(66, 68, 1610.00, '2025-09-05'),
(67, 69, 853.00, '2025-09-05'),
(68, 70, 770.00, '2025-09-05'),
(69, 71, 1015.00, '2025-09-05'),
(70, 72, 1773.00, '2025-09-05'),
(71, 73, 1834.00, '2025-09-05'),
(72, 74, 1388.00, '2025-09-05'),
(73, 75, 1993.00, '2025-09-05'),
(74, 76, 1499.00, '2025-09-05'),
(75, 77, 1329.00, '2025-09-05'),
(76, 78, 1861.00, '2025-09-05'),
(77, 79, 1673.00, '2025-09-05'),
(78, 80, 865.00, '2025-09-05'),
(79, 81, 892.00, '2025-09-05'),
(80, 82, 1729.00, '2025-09-05'),
(81, 83, 879.00, '2025-09-05'),
(82, 84, 1637.00, '2025-09-05'),
(83, 85, 1146.00, '2025-09-05'),
(84, 86, 890.00, '2025-09-05'),
(85, 87, 1823.00, '2025-09-05'),
(86, 88, 994.00, '2025-09-05'),
(87, 89, 1122.00, '2025-09-05'),
(88, 90, 775.00, '2025-09-05'),
(89, 91, 1372.00, '2025-09-05'),
(90, 92, 1149.00, '2025-09-05'),
(91, 93, 1064.00, '2025-09-05'),
(92, 94, 1932.00, '2025-09-05'),
(93, 95, 1147.00, '2025-09-05'),
(94, 96, 1959.00, '2025-09-05'),
(95, 97, 820.00, '2025-09-05'),
(96, 98, 1811.00, '2025-09-05'),
(97, 99, 962.00, '2025-09-05'),
(98, 100, 1624.00, '2025-09-05'),
(99, 101, 709.00, '2025-09-05'),
(100, 102, 1366.00, '2025-09-05'),
(101, 103, 1257.00, '2025-09-05'),
(102, 104, 1320.00, '2025-09-05'),
(103, 105, 910.00, '2025-09-05'),
(104, 106, 1336.00, '2025-09-05'),
(105, 107, 1233.00, '2025-09-05'),
(106, 108, 1580.00, '2025-09-05'),
(107, 109, 1995.00, '2025-09-05'),
(108, 110, 1637.00, '2025-09-05'),
(109, 111, 1603.00, '2025-09-05'),
(110, 112, 944.00, '2025-09-05'),
(111, 113, 1942.00, '2025-09-05'),
(112, 114, 1230.00, '2025-09-05'),
(113, 115, 1345.00, '2025-09-05'),
(114, 116, 1642.00, '2025-09-05'),
(115, 117, 1658.00, '2025-09-05'),
(116, 118, 1106.00, '2025-09-05'),
(117, 119, 1997.00, '2025-09-05'),
(118, 120, 919.00, '2025-09-05'),
(119, 121, 1699.00, '2025-09-05'),
(120, 122, 1456.00, '2025-09-05'),
(121, 123, 1843.00, '2025-09-05'),
(122, 124, 1113.00, '2025-09-05'),
(123, 125, 983.00, '2025-09-05'),
(124, 126, 723.00, '2025-09-05'),
(125, 127, 1938.00, '2025-09-05'),
(126, 128, 1746.00, '2025-09-05'),
(127, 129, 1359.00, '2025-09-05'),
(128, 130, 1362.00, '2025-09-05'),
(129, 131, 969.00, '2025-09-05'),
(130, 132, 1171.00, '2025-09-05'),
(131, 133, 1984.00, '2025-09-05'),
(132, 134, 1898.00, '2025-09-05'),
(133, 135, 1395.00, '2025-09-05'),
(134, 136, 1804.00, '2025-09-05'),
(135, 137, 1383.00, '2025-09-05'),
(136, 138, 1119.00, '2025-09-05'),
(137, 139, 1594.00, '2025-09-05'),
(138, 140, 1215.00, '2025-09-05'),
(139, 141, 1111.00, '2025-09-05'),
(140, 142, 1157.00, '2025-09-05'),
(141, 143, 1177.00, '2025-09-05'),
(142, 144, 1289.00, '2025-09-05'),
(143, 145, 1307.00, '2025-09-05'),
(144, 146, 907.00, '2025-09-05'),
(145, 147, 1694.00, '2025-09-05'),
(146, 148, 1413.00, '2025-09-05'),
(147, 149, 936.00, '2025-09-05'),
(148, 150, 1540.00, '2025-09-05'),
(149, 151, 1503.00, '2025-09-05'),
(150, 152, 1843.00, '2025-09-05'),
(151, 153, 922.00, '2025-09-05'),
(152, 154, 750.00, '2025-09-05'),
(153, 155, 1770.00, '2025-09-05'),
(154, 156, 1966.00, '2025-09-05'),
(155, 157, 1337.00, '2025-09-05'),
(156, 158, 801.00, '2025-09-05'),
(157, 159, 1611.00, '2025-09-05'),
(158, 160, 1638.00, '2025-09-05'),
(159, 161, 1837.00, '2025-09-05'),
(160, 162, 1768.00, '2025-09-05'),
(161, 163, 1820.00, '2025-09-05'),
(162, 164, 1447.00, '2025-09-05'),
(163, 165, 1089.00, '2025-09-05'),
(164, 166, 1727.00, '2025-09-05'),
(165, 167, 889.00, '2025-09-05'),
(166, 168, 1870.00, '2025-09-05'),
(167, 169, 975.00, '2025-09-05'),
(168, 170, 1172.00, '2025-09-05'),
(169, 171, 719.00, '2025-09-05'),
(170, 172, 862.00, '2025-09-05'),
(171, 173, 1316.00, '2025-09-05'),
(172, 174, 852.00, '2025-09-05'),
(173, 175, 721.00, '2025-09-05'),
(174, 176, 1205.00, '2025-09-05'),
(175, 177, 1482.00, '2025-09-05'),
(176, 178, 1736.00, '2025-09-05'),
(177, 179, 858.00, '2025-09-05'),
(178, 180, 1824.00, '2025-09-05'),
(179, 181, 1545.00, '2025-09-05'),
(180, 182, 910.00, '2025-09-05'),
(181, 183, 717.00, '2025-09-05'),
(182, 184, 897.00, '2025-09-05'),
(183, 185, 1378.00, '2025-09-05'),
(184, 186, 750.00, '2025-09-05'),
(185, 187, 1917.00, '2025-09-05'),
(186, 188, 1176.00, '2025-09-05'),
(187, 189, 1772.00, '2025-09-05'),
(188, 190, 1245.00, '2025-09-05'),
(189, 191, 1990.00, '2025-09-05'),
(190, 192, 1067.00, '2025-09-05'),
(191, 193, 741.00, '2025-09-05'),
(192, 194, 1043.00, '2025-09-05'),
(193, 195, 809.00, '2025-09-05'),
(194, 196, 822.00, '2025-09-05'),
(195, 197, 975.00, '2025-09-05'),
(196, 198, 1810.00, '2025-09-05'),
(197, 199, 1663.00, '2025-09-05'),
(198, 200, 773.00, '2025-09-05'),
(199, 201, 1188.00, '2025-09-05'),
(200, 202, 1460.00, '2025-09-05'),
(201, 203, 1317.00, '2025-09-05'),
(202, 204, 1926.00, '2025-09-05'),
(203, 205, 743.00, '2025-09-05'),
(204, 206, 1457.00, '2025-09-05'),
(205, 207, 1606.00, '2025-09-05'),
(206, 208, 881.00, '2025-09-05'),
(207, 209, 1170.00, '2025-09-05'),
(208, 210, 1646.00, '2025-09-05'),
(209, 211, 1930.00, '2025-09-05'),
(210, 212, 1709.00, '2025-09-05'),
(211, 213, 890.00, '2025-09-05'),
(212, 214, 1108.00, '2025-09-05'),
(213, 215, 1424.00, '2025-09-05'),
(214, 216, 1193.00, '2025-09-05'),
(215, 217, 1386.00, '2025-09-05'),
(216, 218, 1234.00, '2025-09-05'),
(217, 219, 1212.00, '2025-09-05'),
(218, 220, 1596.00, '2025-09-05'),
(219, 221, 1445.00, '2025-09-05'),
(220, 222, 1288.00, '2025-09-05'),
(221, 223, 1134.00, '2025-09-05'),
(222, 224, 1823.00, '2025-09-05'),
(223, 225, 1024.00, '2025-09-05'),
(224, 226, 1080.00, '2025-09-05'),
(225, 227, 1597.00, '2025-09-05'),
(226, 228, 1323.00, '2025-09-05'),
(227, 229, 1307.00, '2025-09-05'),
(228, 230, 765.00, '2025-09-05'),
(229, 231, 854.00, '2025-09-05'),
(230, 232, 1517.00, '2025-09-05'),
(231, 233, 1379.00, '2025-09-05'),
(232, 234, 1836.00, '2025-09-05'),
(233, 235, 1725.00, '2025-09-05'),
(234, 236, 1501.00, '2025-09-05'),
(235, 237, 1641.00, '2025-09-05'),
(236, 238, 1027.00, '2025-09-05'),
(237, 239, 1233.00, '2025-09-05'),
(238, 240, 1170.00, '2025-09-05'),
(239, 241, 834.00, '2025-09-05'),
(240, 242, 1481.00, '2025-09-05'),
(241, 243, 1784.00, '2025-09-05'),
(242, 244, 1870.00, '2025-09-05'),
(243, 245, 1351.00, '2025-09-05'),
(244, 246, 1100.00, '2025-09-05'),
(245, 247, 1994.00, '2025-09-05'),
(246, 248, 1494.00, '2025-09-05'),
(247, 249, 975.00, '2025-09-05'),
(248, 250, 979.00, '2025-09-05'),
(249, 251, 919.00, '2025-09-05'),
(250, 252, 1043.00, '2025-09-05'),
(251, 253, 1683.00, '2025-09-05'),
(252, 254, 1150.00, '2025-09-05'),
(253, 255, 1423.00, '2025-09-05'),
(254, 256, 1943.00, '2025-09-05'),
(255, 257, 1637.00, '2025-09-05'),
(256, 258, 1956.00, '2025-09-05'),
(257, 259, 1440.00, '2025-09-05'),
(258, 260, 1251.00, '2025-09-05'),
(259, 261, 1333.00, '2025-09-05'),
(260, 262, 758.00, '2025-09-05'),
(261, 263, 937.00, '2025-09-05'),
(262, 264, 953.00, '2025-09-05'),
(263, 265, 1021.00, '2025-09-05'),
(264, 266, 852.00, '2025-09-05'),
(265, 267, 1851.00, '2025-09-05'),
(266, 268, 776.00, '2025-09-05'),
(267, 269, 935.00, '2025-09-05'),
(268, 270, 1001.00, '2025-09-05'),
(269, 271, 778.00, '2025-09-05'),
(270, 272, 1357.00, '2025-09-05'),
(271, 273, 777.00, '2025-09-05'),
(272, 274, 1134.00, '2025-09-05'),
(273, 275, 1583.00, '2025-09-05'),
(274, 276, 875.00, '2025-09-05'),
(275, 277, 998.00, '2025-09-05'),
(276, 278, 1051.00, '2025-09-05'),
(277, 279, 1351.00, '2025-09-05'),
(278, 280, 1098.00, '2025-09-05'),
(279, 281, 828.00, '2025-09-05'),
(280, 282, 1221.00, '2025-09-05'),
(281, 283, 997.00, '2025-09-05'),
(282, 284, 868.00, '2025-09-05'),
(283, 285, 1593.00, '2025-09-05'),
(284, 286, 1760.00, '2025-09-05'),
(285, 287, 1701.00, '2025-09-05'),
(286, 288, 790.00, '2025-09-05'),
(287, 289, 1081.00, '2025-09-05'),
(288, 290, 1478.00, '2025-09-05'),
(289, 291, 786.00, '2025-09-05'),
(290, 292, 1758.00, '2025-09-05'),
(291, 293, 796.00, '2025-09-05'),
(292, 294, 829.00, '2025-09-05'),
(293, 295, 1468.00, '2025-09-05'),
(294, 296, 1123.00, '2025-09-05'),
(295, 297, 1519.00, '2025-09-05'),
(296, 298, 966.00, '2025-09-05'),
(297, 299, 836.00, '2025-09-05'),
(298, 300, 1400.00, '2025-09-05'),
(299, 301, 831.00, '2025-09-05'),
(300, 302, 880.00, '2025-09-05'),
(301, 303, 1890.00, '2025-09-05'),
(302, 304, 1337.00, '2025-09-05'),
(303, 305, 739.00, '2025-09-05'),
(304, 306, 1826.00, '2025-09-05'),
(305, 307, 1477.00, '2025-09-05'),
(306, 308, 1531.00, '2025-09-05'),
(307, 309, 771.00, '2025-09-05'),
(308, 310, 1112.00, '2025-09-05'),
(309, 311, 858.00, '2025-09-05'),
(310, 312, 1353.00, '2025-09-05'),
(311, 313, 756.00, '2025-09-05'),
(312, 314, 979.00, '2025-09-05'),
(313, 315, 1865.00, '2025-09-05'),
(314, 316, 715.00, '2025-09-05'),
(315, 317, 1949.00, '2025-09-05'),
(316, 318, 1421.00, '2025-09-05'),
(317, 319, 1755.00, '2025-09-05'),
(318, 320, 1563.00, '2025-09-05'),
(319, 321, 1611.00, '2025-09-05'),
(320, 322, 1528.00, '2025-09-05'),
(321, 323, 971.00, '2025-09-05'),
(322, 324, 1284.00, '2025-09-05'),
(323, 325, 1428.00, '2025-09-05'),
(324, 326, 1721.00, '2025-09-05'),
(325, 327, 1588.00, '2025-09-05'),
(326, 328, 1322.00, '2025-09-05'),
(327, 329, 751.00, '2025-09-05'),
(328, 330, 1635.00, '2025-09-05'),
(329, 331, 1392.00, '2025-09-05'),
(330, 332, 1663.00, '2025-09-05'),
(331, 333, 1529.00, '2025-09-05'),
(332, 334, 1693.00, '2025-09-05'),
(333, 335, 1669.00, '2025-09-05'),
(334, 336, 1844.00, '2025-09-05'),
(335, 337, 1260.00, '2025-09-05'),
(336, 338, 749.00, '2025-09-05'),
(337, 339, 1183.00, '2025-09-05'),
(338, 340, 1663.00, '2025-09-05'),
(339, 341, 1277.00, '2025-09-05'),
(340, 342, 1181.00, '2025-09-05'),
(341, 343, 1367.00, '2025-09-05'),
(342, 344, 1221.00, '2025-09-05'),
(343, 345, 1638.00, '2025-09-05'),
(344, 346, 1076.00, '2025-09-05'),
(345, 347, 1627.00, '2025-09-05'),
(346, 348, 1713.00, '2025-09-05'),
(347, 349, 824.00, '2025-09-05'),
(348, 350, 1757.00, '2025-09-05'),
(349, 351, 877.00, '2025-09-05'),
(350, 352, 1422.00, '2025-09-05'),
(351, 353, 1023.00, '2025-09-05'),
(352, 354, 890.00, '2025-09-05'),
(353, 355, 1648.00, '2025-09-05'),
(354, 356, 1120.00, '2025-09-05'),
(355, 357, 709.00, '2025-09-05'),
(356, 358, 896.00, '2025-09-05'),
(357, 359, 1607.00, '2025-09-05'),
(358, 360, 955.00, '2025-09-05'),
(359, 361, 1334.00, '2025-09-05'),
(360, 362, 921.00, '2025-09-05'),
(361, 363, 1223.00, '2025-09-05'),
(362, 364, 1938.00, '2025-09-05'),
(363, 365, 945.00, '2025-09-05'),
(364, 366, 1023.00, '2025-09-05'),
(365, 367, 998.00, '2025-09-05'),
(366, 368, 1236.00, '2025-09-05'),
(367, 369, 887.00, '2025-09-05'),
(368, 370, 1758.00, '2025-09-05'),
(369, 371, 1978.00, '2025-09-05'),
(370, 372, 1731.00, '2025-09-05'),
(371, 373, 828.00, '2025-09-05'),
(372, 374, 1631.00, '2025-09-05'),
(373, 375, 1019.00, '2025-09-05'),
(374, 376, 1553.00, '2025-09-05'),
(375, 377, 917.00, '2025-09-05'),
(376, 378, 1945.00, '2025-09-05'),
(377, 379, 930.00, '2025-09-05'),
(378, 380, 1405.00, '2025-09-05'),
(379, 381, 1760.00, '2025-09-05'),
(380, 382, 1102.00, '2025-09-05'),
(381, 383, 1231.00, '2025-09-05'),
(382, 384, 963.00, '2025-09-05'),
(383, 385, 1029.00, '2025-09-05'),
(384, 386, 1211.00, '2025-09-05'),
(385, 387, 1536.00, '2025-09-05'),
(386, 388, 1082.00, '2025-09-05'),
(387, 389, 1272.00, '2025-09-05'),
(388, 390, 1398.00, '2025-09-05'),
(389, 391, 1831.00, '2025-09-05'),
(390, 392, 851.00, '2025-09-05'),
(391, 393, 762.00, '2025-09-05'),
(392, 394, 759.00, '2025-09-05'),
(393, 395, 1997.00, '2025-09-05'),
(394, 396, 1474.00, '2025-09-05'),
(395, 397, 1340.00, '2025-09-05'),
(396, 398, 1707.00, '2025-09-05'),
(397, 399, 1056.00, '2025-09-05'),
(398, 400, 1451.00, '2025-09-05'),
(399, 401, 1135.00, '2025-09-05'),
(400, 402, 1170.00, '2025-09-05'),
(401, 403, 1163.00, '2025-09-05'),
(402, 404, 1304.00, '2025-09-05'),
(403, 405, 1222.00, '2025-09-05'),
(404, 406, 1440.00, '2025-09-05'),
(405, 407, 1242.00, '2025-09-05'),
(406, 408, 1655.00, '2025-09-05'),
(407, 409, 1193.00, '2025-09-05'),
(408, 410, 1534.00, '2025-09-05'),
(409, 411, 1953.00, '2025-09-05'),
(410, 412, 1860.00, '2025-09-05'),
(411, 413, 1020.00, '2025-09-05'),
(412, 414, 810.00, '2025-09-05'),
(413, 415, 832.00, '2025-09-05'),
(414, 416, 946.00, '2025-09-05'),
(415, 417, 1982.00, '2025-09-05'),
(416, 418, 1582.00, '2025-09-05'),
(417, 419, 1348.00, '2025-09-05'),
(418, 420, 1527.00, '2025-09-05'),
(419, 421, 1505.00, '2025-09-05'),
(420, 422, 1533.00, '2025-09-05'),
(421, 423, 1133.00, '2025-09-05'),
(422, 424, 1296.00, '2025-09-05'),
(423, 425, 746.00, '2025-09-05'),
(424, 426, 954.00, '2025-09-05'),
(425, 427, 1448.00, '2025-09-05'),
(426, 428, 708.00, '2025-09-05'),
(427, 429, 1260.00, '2025-09-05'),
(428, 430, 1984.00, '2025-09-05'),
(429, 431, 1753.00, '2025-09-05'),
(430, 432, 1558.00, '2025-09-05'),
(431, 433, 949.00, '2025-09-05'),
(432, 434, 1307.00, '2025-09-05'),
(433, 435, 749.00, '2025-09-05'),
(434, 436, 1045.00, '2025-09-05'),
(435, 437, 1309.00, '2025-09-05'),
(436, 438, 864.00, '2025-09-05'),
(437, 439, 1321.00, '2025-09-05'),
(438, 440, 1310.00, '2025-09-05'),
(439, 441, 1312.00, '2025-09-05'),
(440, 442, 834.00, '2025-09-05'),
(441, 443, 1064.00, '2025-09-05'),
(442, 444, 723.00, '2025-09-05'),
(443, 445, 1798.00, '2025-09-05'),
(444, 446, 1848.00, '2025-09-05'),
(445, 447, 1377.00, '2025-09-05'),
(446, 448, 1074.00, '2025-09-05'),
(447, 449, 1163.00, '2025-09-05'),
(448, 450, 1774.00, '2025-09-05'),
(449, 451, 1444.00, '2025-09-05'),
(450, 452, 1989.00, '2025-09-05'),
(451, 453, 1961.00, '2025-09-05'),
(452, 454, 1572.00, '2025-09-05'),
(453, 455, 923.00, '2025-09-05'),
(454, 456, 1200.00, '2025-09-05'),
(455, 457, 1633.00, '2025-09-05'),
(456, 458, 1019.00, '2025-09-05'),
(457, 459, 1226.00, '2025-09-05'),
(458, 460, 819.00, '2025-09-05'),
(459, 461, 1855.00, '2025-09-05'),
(460, 462, 963.00, '2025-09-05'),
(461, 463, 1313.00, '2025-09-05'),
(462, 464, 1753.00, '2025-09-05'),
(463, 465, 1299.00, '2025-09-05'),
(464, 466, 1973.00, '2025-09-05'),
(465, 467, 1396.00, '2025-09-05'),
(466, 468, 910.00, '2025-09-05'),
(467, 469, 1885.00, '2025-09-05'),
(468, 470, 1303.00, '2025-09-05'),
(469, 471, 794.00, '2025-09-05'),
(470, 472, 750.00, '2025-09-05'),
(471, 473, 1805.00, '2025-09-05'),
(472, 474, 1487.00, '2025-09-05'),
(473, 475, 1000.00, '2025-01-01'),
(474, 475, 1000.00, '2025-02-01');

-- --------------------------------------------------------

--
-- Estrutura para tabela `notas`
--

CREATE TABLE `notas` (
  `tipo` varchar(255) NOT NULL,
  `valor` int(11) NOT NULL,
  `nota` int(11) NOT NULL,
  `recuperacao` enum('Sim','Não') NOT NULL DEFAULT 'Não',
  `nota_rec` int(11) NOT NULL,
  `turma_id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `avaliacao_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `notas`
--

INSERT INTO `notas` (`tipo`, `valor`, `nota`, `recuperacao`, `nota_rec`, `turma_id`, `aluno_id`, `materia_id`, `data`, `avaliacao_id`) VALUES
('Prova', 10, 8, 'Não', 0, 1, 2, 1, '2025-03-14', 12),
('Trabalho', 15, 0, 'Sim', 5, 1, 2, 1, '2025-09-12', 16),
('Prova', 10, 8, 'Não', 0, 1, 3, 1, '2025-03-14', 12),
('Trabalho', 15, 0, 'Sim', 9, 1, 3, 1, '2025-09-12', 16),
('Prova', 10, 1, 'Não', 0, 1, 4, 1, '2025-03-14', 12),
('Trabalho', 15, 7, 'Não', 0, 1, 4, 1, '2025-09-12', 16);

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
(103, 'mensagem', 3, 1, 2, 'fala krysthyan', 0, '2025-08-26 13:38:50', 0),
(104, 'mensagem', 15, 1, 6, 'tudo bem jose?', 0, '2025-08-26 13:40:16', 0),
(105, 'mensagem', 16, 1, 3, 'hrtherhereter', 0, '2025-08-26 15:11:41', 0),
(106, 'mensagem', 16, 1, 3, 'tretrtw', 0, '2025-08-26 15:11:45', 0),
(108, 'mensagem', 3, 1, 2, 'dwqweq', 0, '2025-08-26 15:52:38', 0),
(109, 'mensagem', 3, 1, 2, 'eqwe', 0, '2025-08-26 15:52:42', 0),
(110, 'mensagem', 15, 1, 6, '6636346', 0, '2025-08-26 15:52:57', 0),
(111, 'mensagem', 15, 1, 6, 'retertw', 0, '2025-08-26 15:55:13', 0),
(112, 'mensagem', 16, 1, 3, '23456789', 0, '2025-08-26 16:07:50', 0),
(113, 'mensagem', 15, 1, 6, 'trsyrst', 0, '2025-08-26 16:08:33', 0),
(114, 'mensagem', 16, 1, 3, 'fala marcelo', 0, '2025-08-27 12:07:40', 0),
(115, 'mensagem', 15, 1, 6, 'ola jose', 0, '2025-08-27 12:07:45', 0),
(117, 'mensagem', 15, 1, 6, 'jose', 0, '2025-08-27 12:08:39', 0),
(118, 'mensagem', 15, 1, 6, 'opa', 0, '2025-08-27 13:37:16', 0),
(120, 'mensagem', 20, 1, 4, 'opa', 0, '2025-08-27 14:32:29', 0),
(121, 'mensagem', 3, 1, 2, 'fewfefwr', 0, '2025-08-27 14:40:09', 0);

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
(10, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:36:51', 2, 0),
(11, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:36:51', 3, 0),
(12, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:36:51', 4, 0),
(15, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 2, 0),
(16, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 2, 0),
(17, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 3, 0),
(18, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 3, 0),
(19, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 4, 0),
(20, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:37:40', 4, 0),
(25, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 2, 0),
(26, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 2, 0),
(27, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 3, 0),
(28, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 3, 0),
(29, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 4, 0),
(30, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:44:30', 4, 0),
(34, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 2, 0),
(35, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 2, 0),
(36, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 3, 0),
(37, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 3, 0),
(38, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 4, 0),
(39, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:45:53', 4, 0),
(44, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 2, 0),
(45, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 2, 0),
(46, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 3, 0),
(47, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 3, 0),
(48, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 4, 0),
(49, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:46:32', 4, 0),
(54, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 2, 0),
(55, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 2, 0),
(56, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 3, 0),
(57, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 3, 0),
(58, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 4, 0),
(59, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:31', 4, 0),
(63, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 2, 0),
(64, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 2, 0),
(65, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 3, 0),
(66, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 3, 0),
(67, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 4, 0),
(68, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:47:44', 4, 0),
(73, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 2, 0),
(74, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 2, 0),
(75, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 3, 0),
(76, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 3, 0),
(77, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 4, 0),
(78, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:49:59', 4, 0),
(83, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 2, 0),
(84, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 2, 0),
(85, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 3, 0),
(86, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 3, 0),
(87, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 4, 0),
(88, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:50:09', 4, 0),
(93, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 2, 0),
(94, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 2, 0),
(95, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 3, 0),
(96, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 3, 0),
(97, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 4, 0),
(98, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:52:18', 4, 0),
(103, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 2, 0),
(104, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 2, 0),
(105, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 3, 0),
(106, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 3, 0),
(107, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 4, 0),
(108, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:26', 4, 0),
(113, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 2, 0),
(114, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 2, 0),
(115, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 3, 0),
(116, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 3, 0),
(117, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 4, 0),
(118, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:32', 4, 0),
(123, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 2, 0),
(124, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 2, 0),
(125, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 3, 0),
(126, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 3, 0),
(127, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 4, 0),
(128, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:53:35', 4, 0),
(133, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 2, 0),
(134, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 2, 0),
(135, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 3, 0),
(136, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 3, 0),
(137, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 4, 0),
(138, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:54:49', 4, 0),
(143, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 2, 0),
(144, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 2, 0),
(145, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 3, 0),
(146, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 3, 0),
(147, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 4, 0),
(148, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:05', 4, 0),
(153, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 2, 0),
(154, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 2, 0),
(155, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 3, 0),
(156, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 3, 0),
(157, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 4, 0),
(158, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 09:55:22', 4, 0),
(163, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 2, 0),
(164, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 2, 0),
(165, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 3, 0),
(166, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 3, 0),
(167, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 4, 0),
(168, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:03:41', 4, 0),
(173, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 2, 0),
(174, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 2, 0),
(175, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 3, 0),
(176, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 3, 0),
(177, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 4, 0),
(178, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:10', 4, 0),
(183, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 2, 0),
(184, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 2, 0),
(185, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 3, 0),
(186, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 3, 0),
(187, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 4, 0),
(188, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:04:11', 4, 0),
(193, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 2, 0),
(194, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 2, 0),
(195, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 3, 0),
(196, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 3, 0),
(197, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 4, 0),
(198, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:41:47', 4, 0),
(203, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 2, 0),
(204, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 2, 0),
(205, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 3, 0),
(206, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 3, 0),
(207, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 4, 0),
(208, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:42:10', 4, 0),
(213, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 2, 0),
(214, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 2, 0),
(215, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 3, 0),
(216, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 3, 0),
(217, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 4, 0),
(218, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:51:59', 4, 0),
(223, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 2, 0),
(224, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 2, 0),
(225, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 3, 0),
(226, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 3, 0),
(227, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 4, 0),
(228, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-07-24 10:52:22', 4, 0),
(234, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:32:25', 6, 0),
(235, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:32:32', 6, 0),
(236, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:32:55', 2, 0),
(237, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:33:05', 4, 0),
(238, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:35:19', 2, 0),
(239, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:35:27', 4, 0),
(240, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:36:40', 4, 0),
(241, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:36:49', 6, 0),
(242, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:42:44', 6, 0),
(243, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:49:00', 6, 0),
(244, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:49:03', 6, 0),
(245, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:54:05', 6, 0),
(246, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 14:54:23', 3, 0),
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
(261, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 15:23:44', 2, 0),
(262, 'mensagem', 'Você recebeu uma nova mensagem.', 'Nova mensagem recebida', '2025-08-25 15:23:46', 2, 0),
(263, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-11 12:36:16', 2, 0),
(264, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-11 12:36:16', 2, 0),
(265, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-11 12:36:16', 2, 0),
(266, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-11 12:36:16', 2, 0),
(267, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-11 12:36:16', 3, 0),
(268, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-11 12:36:16', 3, 0),
(269, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-11 12:36:16', 3, 0),
(270, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-11 12:36:16', 3, 0),
(271, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-11 12:36:16', 4, 0),
(272, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-11 12:36:16', 4, 0),
(281, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 09:41:04', 2, 0),
(282, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 09:41:04', 2, 0),
(283, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 09:41:04', 3, 0),
(284, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 09:41:04', 3, 0),
(285, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 09:41:04', 4, 0),
(286, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 09:41:04', 4, 0),
(287, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 09:41:46', 2, 0),
(288, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 09:41:46', 3, 0),
(289, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 09:41:46', 4, 0),
(290, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 09:41:46', 4, 0),
(291, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:04:00', 2, 0),
(292, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:04:00', 3, 0),
(293, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:04:00', 4, 0),
(294, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:04:00', 4, 0),
(295, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:05:03', 2, 0),
(296, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:05:03', 3, 0),
(297, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:05:03', 4, 0),
(298, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:05:03', 4, 0),
(299, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:06:32', 2, 0),
(300, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:06:32', 3, 0),
(301, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:06:32', 4, 0),
(302, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:06:32', 4, 0),
(303, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:06:52', 2, 0),
(304, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:06:52', 3, 0),
(305, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:06:52', 3, 0),
(306, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:06:52', 4, 0),
(307, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:06:52', 4, 0),
(308, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:14:36', 2, 0),
(309, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:14:36', 2, 0),
(310, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:14:36', 3, 0),
(311, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:14:36', 3, 0),
(312, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:14:36', 4, 0),
(313, 'nota_lancada', 'Uma nova nota foi lançada para você.', 'Nota registrada', '2025-09-12 11:14:36', 4, 0);

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
(1, 6, 3500.00, '2025-07-01'),
(2, 476, 1000.00, '2025-09-01');

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

--
-- Despejando dados para a tabela `presencas`
--

INSERT INTO `presencas` (`id`, `turma_id`, `aluno_id`, `materia_id`, `data`, `descricao`, `presenca`, `aula_id`) VALUES
(24, 1, 2, 1, '2025-07-25', 'Aula 1', 0, 5),
(25, 1, 3, 1, '2025-07-25', 'Aula 1', 1, 5),
(26, 1, 4, 1, '2025-07-25', 'Aula 1', 1, 5),
(29, 1, 2, 1, '2025-07-24', 'Aula 2', 1, 6),
(30, 1, 3, 1, '2025-07-24', 'Aula 2', 0, 6),
(31, 1, 4, 1, '2025-07-24', 'Aula 2', 0, 6);

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
  `id_aluno1` int(11) NOT NULL,
  `id_aluno2` int(11) DEFAULT NULL,
  `id_aluno3` int(11) DEFAULT NULL,
  `numero1` varchar(20) NOT NULL,
  `numero2` varchar(20) DEFAULT NULL,
  `endereco` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `grau_parentesco` varchar(50) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `rg` varchar(20) NOT NULL,
  `responsavel_financeiro` enum('Sim','Não') NOT NULL,
  `nacionalidade` enum('Brasileiro','Outro') NOT NULL,
  `nacionalidade_descricao` varchar(60) DEFAULT NULL,
  `estado_civil` enum('Solteiro','Casado','Viúvo') NOT NULL,
  `profissao` varchar(100) NOT NULL,
  `logradouro` varchar(120) NOT NULL,
  `numero_casa` varchar(10) NOT NULL,
  `bairro` varchar(80) NOT NULL,
  `cidade` varchar(80) NOT NULL,
  `cep` varchar(9) NOT NULL,
  `ponto_referencia` varchar(120) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Despejando dados para a tabela `seguidores`
--

INSERT INTO `seguidores` (`seguidor_id`, `seguido_id`, `criado_em`) VALUES
(1, 8, '2025-09-26 17:02:54');

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
(1, 0, 1),
(2, 0, 0),
(3, 0, 0),
(4, 0, 0),
(6, 0, 0),
(8, 1, 0),
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
(25, 0, 0),
(26, 0, 0),
(27, 0, 0),
(28, 0, 0),
(29, 0, 0),
(30, 0, 0),
(31, 0, 0),
(32, 0, 0),
(33, 0, 0),
(34, 0, 0),
(35, 0, 0),
(36, 0, 0),
(37, 0, 0),
(38, 0, 0),
(39, 0, 0),
(40, 0, 0),
(41, 0, 0),
(42, 0, 0),
(43, 0, 0),
(44, 0, 0),
(45, 0, 0),
(46, 0, 0),
(47, 0, 0),
(48, 0, 0),
(49, 0, 0),
(50, 0, 0),
(51, 0, 0),
(52, 0, 0),
(53, 0, 0),
(54, 0, 0),
(55, 0, 0),
(56, 0, 0),
(57, 0, 0),
(58, 0, 0),
(59, 0, 0),
(60, 0, 0),
(61, 0, 0),
(62, 0, 0),
(63, 0, 0),
(64, 0, 0),
(65, 0, 0),
(66, 0, 0),
(67, 0, 0),
(68, 0, 0),
(69, 0, 0),
(70, 0, 0),
(71, 0, 0),
(72, 0, 0),
(73, 0, 0),
(74, 0, 0),
(75, 0, 0),
(76, 0, 0),
(77, 0, 0),
(78, 0, 0),
(79, 0, 0),
(80, 0, 0),
(81, 0, 0),
(82, 0, 0),
(83, 0, 0),
(84, 0, 0),
(85, 0, 0),
(86, 0, 0),
(87, 0, 0),
(88, 0, 0),
(89, 0, 0),
(90, 0, 0),
(91, 0, 0),
(92, 0, 0),
(93, 0, 0),
(94, 0, 0),
(95, 0, 0),
(96, 0, 0),
(97, 0, 0),
(98, 0, 0),
(99, 0, 0),
(100, 0, 0),
(101, 0, 0),
(102, 0, 0),
(103, 0, 0),
(104, 0, 0),
(105, 0, 0),
(106, 0, 0),
(107, 0, 0),
(108, 0, 0),
(109, 0, 0),
(110, 0, 0),
(111, 0, 0),
(112, 0, 0),
(113, 0, 0),
(114, 0, 0),
(115, 0, 0),
(116, 0, 0),
(117, 0, 0),
(118, 0, 0),
(119, 0, 0),
(120, 0, 0),
(121, 0, 0),
(122, 0, 0),
(123, 0, 0),
(124, 0, 0),
(125, 0, 0),
(126, 0, 0),
(127, 0, 0),
(128, 0, 0),
(129, 0, 0),
(130, 0, 0),
(131, 0, 0),
(132, 0, 0),
(133, 0, 0),
(134, 0, 0),
(135, 0, 0),
(136, 0, 0),
(137, 0, 0),
(138, 0, 0),
(139, 0, 0),
(140, 0, 0),
(141, 0, 0),
(142, 0, 0),
(143, 0, 0),
(144, 0, 0),
(145, 0, 0),
(146, 0, 0),
(147, 0, 0),
(148, 0, 0),
(149, 0, 0),
(150, 0, 0),
(151, 0, 0),
(152, 0, 0),
(153, 0, 0),
(154, 0, 0),
(155, 0, 0),
(156, 0, 0),
(157, 0, 0),
(158, 0, 0),
(159, 0, 0),
(160, 0, 0),
(161, 0, 0),
(162, 0, 0),
(163, 0, 0),
(164, 0, 0),
(165, 0, 0),
(166, 0, 0),
(167, 0, 0),
(168, 0, 0),
(169, 0, 0),
(170, 0, 0),
(171, 0, 0),
(172, 0, 0),
(173, 0, 0),
(174, 0, 0),
(175, 0, 0),
(176, 0, 0),
(177, 0, 0),
(178, 0, 0),
(179, 0, 0),
(180, 0, 0),
(181, 0, 0),
(182, 0, 0),
(183, 0, 0),
(184, 0, 0),
(185, 0, 0),
(186, 0, 0),
(187, 0, 0),
(188, 0, 0),
(189, 0, 0),
(190, 0, 0),
(191, 0, 0),
(192, 0, 0),
(193, 0, 0),
(194, 0, 0),
(195, 0, 0),
(196, 0, 0),
(197, 0, 0),
(198, 0, 0),
(199, 0, 0),
(200, 0, 0),
(201, 0, 0),
(202, 0, 0),
(203, 0, 0),
(204, 0, 0),
(205, 0, 0),
(206, 0, 0),
(207, 0, 0),
(208, 0, 0),
(209, 0, 0),
(210, 0, 0),
(211, 0, 0),
(212, 0, 0),
(213, 0, 0),
(214, 0, 0),
(215, 0, 0),
(216, 0, 0),
(217, 0, 0),
(218, 0, 0),
(219, 0, 0),
(220, 0, 0),
(221, 0, 0),
(222, 0, 0),
(223, 0, 0),
(224, 0, 0),
(225, 0, 0),
(226, 0, 0),
(227, 0, 0),
(228, 0, 0),
(229, 0, 0),
(230, 0, 0),
(231, 0, 0),
(232, 0, 0),
(233, 0, 0),
(234, 0, 0),
(235, 0, 0),
(236, 0, 0),
(237, 0, 0),
(238, 0, 0),
(239, 0, 0),
(240, 0, 0),
(241, 0, 0),
(242, 0, 0),
(243, 0, 0),
(244, 0, 0),
(245, 0, 0),
(246, 0, 0),
(247, 0, 0),
(248, 0, 0),
(249, 0, 0),
(250, 0, 0),
(251, 0, 0),
(252, 0, 0),
(253, 0, 0),
(254, 0, 0),
(255, 0, 0),
(256, 0, 0),
(257, 0, 0),
(258, 0, 0),
(259, 0, 0),
(260, 0, 0),
(261, 0, 0),
(262, 0, 0),
(263, 0, 0),
(264, 0, 0),
(265, 0, 0),
(266, 0, 0),
(267, 0, 0),
(268, 0, 0),
(269, 0, 0),
(270, 0, 0),
(271, 0, 0),
(272, 0, 0),
(273, 0, 0),
(274, 0, 0),
(275, 0, 0),
(276, 0, 0),
(277, 0, 0),
(278, 0, 0),
(279, 0, 0),
(280, 0, 0),
(281, 0, 0),
(282, 0, 0),
(283, 0, 0),
(284, 0, 0),
(285, 0, 0),
(286, 0, 0),
(287, 0, 0),
(288, 0, 0),
(289, 0, 0),
(290, 0, 0),
(291, 0, 0),
(292, 0, 0),
(293, 0, 0),
(294, 0, 0),
(295, 0, 0),
(296, 0, 0),
(297, 0, 0),
(298, 0, 0),
(299, 0, 0),
(300, 0, 0),
(301, 0, 0),
(302, 0, 0),
(303, 0, 0),
(304, 0, 0),
(305, 0, 0),
(306, 0, 0),
(307, 0, 0),
(308, 0, 0),
(309, 0, 0),
(310, 0, 0),
(311, 0, 0),
(312, 0, 0),
(313, 0, 0),
(314, 0, 0),
(315, 0, 0),
(316, 0, 0),
(317, 0, 0),
(318, 0, 0),
(319, 0, 0),
(320, 0, 0),
(321, 0, 0),
(322, 0, 0),
(323, 0, 0),
(324, 0, 0),
(325, 0, 0),
(326, 0, 0),
(327, 0, 0),
(328, 0, 0),
(329, 0, 0),
(330, 0, 0),
(331, 0, 0),
(332, 0, 0),
(333, 0, 0),
(334, 0, 0),
(335, 0, 0),
(336, 0, 0),
(337, 0, 0),
(338, 0, 0),
(339, 0, 0),
(340, 0, 0),
(341, 0, 0),
(342, 0, 0),
(343, 0, 0),
(344, 0, 0),
(345, 0, 0),
(346, 0, 0),
(347, 0, 0),
(348, 0, 0),
(349, 0, 0),
(350, 0, 0),
(351, 0, 0),
(352, 0, 0),
(353, 0, 0),
(354, 0, 0),
(355, 0, 0),
(356, 0, 0),
(357, 0, 0),
(358, 0, 0),
(359, 0, 0),
(360, 0, 0),
(361, 0, 0),
(362, 0, 0),
(363, 0, 0),
(364, 0, 0),
(365, 0, 0),
(366, 0, 0),
(367, 0, 0),
(368, 0, 0),
(369, 0, 0),
(370, 0, 0),
(371, 0, 0),
(372, 0, 0),
(373, 0, 0),
(374, 0, 0),
(375, 0, 0),
(376, 0, 0),
(377, 0, 0),
(378, 0, 0),
(379, 0, 0),
(380, 0, 0),
(381, 0, 0),
(382, 0, 0),
(383, 0, 0),
(384, 0, 0),
(385, 0, 0),
(386, 0, 0),
(387, 0, 0),
(388, 0, 0),
(389, 0, 0),
(390, 0, 0),
(391, 0, 0),
(392, 0, 0),
(393, 0, 0),
(394, 0, 0),
(395, 0, 0),
(396, 0, 0),
(397, 0, 0),
(398, 0, 0),
(399, 0, 0),
(400, 0, 0),
(401, 0, 0),
(402, 0, 0),
(403, 0, 0),
(404, 0, 0),
(405, 0, 0),
(406, 0, 0),
(407, 0, 0),
(408, 0, 0),
(409, 0, 0),
(410, 0, 0),
(411, 0, 0),
(412, 0, 0),
(413, 0, 0),
(414, 0, 0),
(415, 0, 0),
(416, 0, 0),
(417, 0, 0),
(418, 0, 0),
(419, 0, 0),
(420, 0, 0),
(421, 0, 0),
(422, 0, 0),
(423, 0, 0),
(424, 0, 0),
(425, 0, 0),
(426, 0, 0),
(427, 0, 0),
(428, 0, 0),
(429, 0, 0),
(430, 0, 0),
(431, 0, 0),
(432, 0, 0),
(433, 0, 0),
(434, 0, 0),
(435, 0, 0),
(436, 0, 0),
(437, 0, 0),
(438, 0, 0),
(439, 0, 0),
(440, 0, 0),
(441, 0, 0),
(442, 0, 0),
(443, 0, 0),
(444, 0, 0),
(445, 0, 0),
(446, 0, 0),
(447, 0, 0),
(448, 0, 0),
(449, 0, 0),
(450, 0, 0),
(451, 0, 0),
(452, 0, 0),
(453, 0, 0),
(454, 0, 0),
(455, 0, 0),
(456, 0, 0),
(457, 0, 0),
(458, 0, 0),
(459, 0, 0),
(460, 0, 0),
(461, 0, 0),
(462, 0, 0),
(463, 0, 0),
(464, 0, 0),
(465, 0, 0),
(466, 0, 0),
(467, 0, 0),
(468, 0, 0),
(469, 0, 0),
(470, 0, 0),
(471, 0, 0),
(472, 0, 0),
(473, 0, 0),
(474, 0, 0),
(475, 0, 0),
(476, 0, 0);

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
  `caixa_id` int(11) DEFAULT NULL,
  `status` text NOT NULL,
  `comprovante_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `transacoes`
--

INSERT INTO `transacoes` (`id`, `descricao`, `id_pessoa`, `valor`, `desconto_percentual`, `valor_com_desconto`, `tipo`, `categoria`, `data_referencia`, `data_pagamento`, `data_vencimento`, `observacao`, `forma_pagamento`, `responsavel`, `caixa_id`, `status`, `comprovante_url`) VALUES
(13, 'Pagamento de Salário - jose', 6, 3500.00, 0.00, 3500.00, 'despesa', 'salarios dos funcionarios', '2025-08-01', NULL, '2025-08-11', NULL, NULL, 'sistema', NULL, 'atrasado', NULL),
(14, 'Pagamento de Salário - jose', 6, 3500.00, 0.00, 3500.00, 'despesa', 'salarios dos funcionarios', '2025-09-01', '2025-09-24', '2025-09-11', '', 'dinheiro', 'sistema', NULL, 'pago', NULL),
(15, 'Mensalidade - Arthur', 475, 1000.00, 10.00, 900.00, 'receita', 'mensalidades', '2025-09-01', NULL, '2025-09-11', NULL, NULL, 'sistema', NULL, 'atrasado', NULL),
(16, 'Casa', 0, 200.00, 0.00, 200.00, 'receita', 'material didático', '2025-09-24', '2025-09-24', '0000-00-00', '', 'pix', 'jose', NULL, 'pago', NULL),
(17, 'Casa', 0, 250.00, 0.00, 250.00, 'despesa', 'manutenção', '2025-09-24', '2025-09-24', '0000-00-00', '', 'pix', 'jose', NULL, 'pago', NULL),
(18, 'Pagamento de Salário - João', 476, 1000.00, 0.00, 1000.00, 'despesa', 'salarios dos funcionarios', '2025-09-01', NULL, '2025-09-11', NULL, NULL, 'sistema', NULL, 'atrasado', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `turmas`
--

CREATE TABLE `turmas` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `ano_letivo` year(4) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `aulas_por_dia` int(11) NOT NULL DEFAULT 5,
  `serie` varchar(50) NOT NULL,
  `turno` enum('Matutino','Vespertino','Noturno') NOT NULL,
  `etapa_ensino` enum('EI','EFAI','EFAF','EM') NOT NULL,
  `qtd_alunos` int(11) NOT NULL DEFAULT 0,
  `professor_responsavel` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `turmas`
--

INSERT INTO `turmas` (`id`, `nome`, `ano_letivo`, `created_at`, `aulas_por_dia`, `serie`, `turno`, `etapa_ensino`, `qtd_alunos`, `professor_responsavel`) VALUES
(1, 'Turma 1', '2025', '2025-07-22 12:48:52', 2, '6º Ano', 'Matutino', 'EFAF', 7, 6);

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
(6, 1, 2),
(7, 1, 3),
(8, 1, 1);

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
  `nome` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `foto_url` varchar(255) DEFAULT NULL,
  `last_seen` timestamp NULL DEFAULT NULL COMMENT 'Registra a última vez que o usuário esteve ativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `login`, `senha`, `email`, `role`, `nome`, `created_at`, `foto_url`, `last_seen`) VALUES
(1, 'admin', '$2a$10$277ebYX8de9naMMcHyLiseq46sehpWUe.cCX7g09aDYFDc9rE65by', 'admin@gmail.com', 'gestor', 'admin', '2025-07-08 18:13:54', NULL, '2025-09-26 18:05:16'),
(2, 'krysthyan', '$2b$10$xEnwpu4Py8.VbvZIpBzjielHVw2qah2cJreS1Z9I1dohygEHHnse2', 'krysthyan@gmail.com', 'aluno', 'Krysthyan', '2025-07-17 13:59:58', '', '2025-09-26 13:22:39'),
(3, 'marcelo', '$2b$10$0GUe.kHSKZSHT3xd0phzSOGG5LQPhYUEc44ssaOac3oDz/t.P3VCK', 'marcelo@gmail.com', 'aluno', 'Marcelo', '2025-07-17 14:01:45', '', NULL),
(4, 'rinaldo', '$2b$10$8gNSZSqJYdoXGzInfmGdwehqQcMNnFnMWkEBOemf6pbqERHSbU7JG', 'junio@gmail.com', 'aluno', 'Rinaldo', '2025-07-17 14:02:30', '', NULL),
(6, 'jose', '$2b$10$r6YVVFnOZOgFHNJ8DhWUQeoIdKU1tAdbqHMszE0pUH34/kcSdXZU2', 'jose@gmail.com', 'professor', 'jose', '2025-07-22 12:48:08', '', '2025-09-25 18:43:07'),
(8, 'MAT1001', '$2b$10$4vb./nXLdWxE2jGHND8yMu9cpCkZ.O45cBL4Ct82lnC4EPbMIKyzy', 'Paulo_Silva32@escola.com.br', 'aluno', 'Paulo Silva', '2025-09-11 19:10:47', NULL, NULL),
(9, 'MAT1002', '$2b$10$Zy02j/CIV7yFwq/qkEKCu.GmEVWMICtUyaonm62j55bN0pTyqgr3.', 'Silvia.Melo97@escola.com.br', 'aluno', 'Sílvia Melo', '2025-09-11 19:10:47', NULL, NULL),
(10, 'MAT1003', '$2b$10$3u13WfWfgPF6v2yIz2Hf9e08pNQCusK.tdLfRlKfBX5SeUqLymYZ6', 'Sr.Calebe11@escola.com.br', 'aluno', 'Sr. Calebe Nogueira', '2025-09-11 19:10:47', NULL, NULL),
(11, 'MAT1004', '$2b$10$TqJShQjttTZG8iS95yqpSe4VPBrp62kPRH8qKZ478ZFLr3hNeS80W', 'Yago.Santos@escola.com.br', 'aluno', 'Yago Santos', '2025-09-11 19:10:47', '/uploads/aluno4.jpg', NULL),
(12, 'MAT1005', '$2b$10$tnMKFzCKuSTp0D7RXW89UOG33KeTw91DqcvpjazeCWfNeZcpf0VyK', 'Lavinia.Oliveira91@escola.com.br', 'aluno', 'Lavínia Oliveira Filho', '2025-09-11 19:10:48', NULL, NULL),
(13, 'MAT1006', '$2b$10$Cei/nMztGOaEoZCNQi.Xq.1j/7BhwTwB0l2mlLhEEOlvAJ8cJHNMe', 'Warley.Moreira@escola.com.br', 'aluno', 'Warley Moreira', '2025-09-11 19:10:48', NULL, NULL),
(14, 'MAT1007', '$2b$10$x8/gr8GMmDtai.GnfZCqHOCDYQM.n/ntduH81Uo2Q7RsKzhUJMN3S', 'Helio_Xavier73@escola.com.br', 'aluno', 'Hélio Xavier', '2025-09-11 19:10:48', NULL, NULL),
(15, 'MAT1008', '$2b$10$.yWCvWv24bOphq7w6ibPFeCYZnsnvMskOqcLe6Ag.jIb.DYdcMjma', 'Cesar_Braga@escola.com.br', 'aluno', 'César Braga', '2025-09-11 19:10:48', '/uploads/aluno8.jpg', NULL),
(16, 'MAT1009', '$2b$10$jd3096nJeyJPaSOfEIxHme2NGDrqAU/5k6C7fDdg93uwS/yV9lUeK', 'Eloa.Oliveira39@escola.com.br', 'aluno', 'Eloá Oliveira', '2025-09-11 19:10:48', NULL, NULL),
(17, 'MAT1010', '$2b$10$/J3evpU4PL1Mae8QXGAwnOQljeuMnhId1/iplOV0WBrtk7SYSeHKC', 'Enzo.Santos21@escola.com.br', 'aluno', 'Enzo Santos Jr.', '2025-09-11 19:10:48', NULL, NULL),
(18, 'MAT1011', '$2b$10$7UHtoTVSbt4SyuLS23b8Wuu.r2sVz/TwA43XMLBeDHvvd3HuaPeLS', 'Arthur.Moreira@escola.com.br', 'aluno', 'Arthur Moreira', '2025-09-11 19:10:48', NULL, NULL),
(19, 'MAT1012', '$2b$10$gqZ2231N5JQRQMqgVlGnkerfCKWg8KDsH/iTp0RMaDm1uCXBOug6y', 'Eduarda_Santos70@escola.com.br', 'aluno', 'Eduarda Santos', '2025-09-11 19:10:49', '/uploads/aluno12.jpg', NULL),
(20, 'MAT1013', '$2b$10$UtNpNyOdDQT6FobbK5hIZeMW97UT/bYsB2v4hSqgME2SrfNsuqvo.', 'Celia_Carvalho@escola.com.br', 'aluno', 'Célia Carvalho', '2025-09-11 19:10:49', NULL, NULL),
(21, 'MAT1014', '$2b$10$xyZSkX6PuX07Ot/aJcG15u.sfbhzotRY9c/VnoHBbooTMff7KM.FW', 'Ana.Laura84@escola.com.br', 'aluno', 'Ana Laura Costa', '2025-09-11 19:10:49', NULL, NULL),
(22, 'MAT1015', '$2b$10$/q/Yf1B.G4yytOODJjCBMuYpKzPJbze7O4C2eJzLzWvg0NJIuxFtW', 'Sra._Vitoria@escola.com.br', 'aluno', 'Sra. Vitória Albuquerque', '2025-09-11 19:10:49', NULL, NULL),
(23, 'MAT1016', '$2b$10$fFykouXdPmryfgB3fj88e.XTNjlkAbXyv9e8ZzDy2AZ6dcpORxGvq', 'Mariana.Saraiva@escola.com.br', 'aluno', 'Mariana Saraiva', '2025-09-11 19:10:49', '/uploads/aluno16.jpg', NULL),
(24, 'MAT1017', '$2b$10$q676NgEdpsRx3QfbfSrfG.OAdKZWSxSGXrfFCEpzRTRjTYPiOHvXO', 'Heitor.Moreira@escola.com.br', 'aluno', 'Heitor Moreira', '2025-09-11 19:10:50', NULL, NULL),
(25, 'MAT1018', '$2b$10$iETStDDbAbt.Va8R5KzS8OghLn7aC9hDCaYJnGkRVUjiQe5lhlXou', 'Laura.Xavier@escola.com.br', 'aluno', 'Laura Xavier', '2025-09-11 19:10:50', NULL, NULL),
(26, 'MAT1019', '$2b$10$k6xARAMVUj2NOOPCJhvlZ.XTJRM/eG3xekPnVopfHurNSgvgG8pNS', 'Marli_Batista@escola.com.br', 'aluno', 'Marli Batista', '2025-09-11 19:10:50', NULL, NULL),
(27, 'MAT1020', '$2b$10$X5op/Ujq7Ej/IFbv73EVFedXtFYB.SUjFwYSabi6qJKXArN.mB0ny', 'Ana.Julia@escola.com.br', 'aluno', 'Ana Júlia Albuquerque', '2025-09-11 19:10:50', '/uploads/aluno20.jpg', NULL),
(28, 'MAT1021', '$2b$10$w0IBjGtRCO8x0rGqDlj3N.KkIoaHboDAKCODvSwIE1sKW0fs7Xoce', 'Heloisa.Xavier86@escola.com.br', 'aluno', 'Heloísa Xavier', '2025-09-11 19:10:50', NULL, NULL),
(29, 'MAT1022', '$2b$10$0GgNzn7hfnOm/.BB5IN1L.HQxHJiUTIHJ/NxAwD1xCgNvkO4NAIqC', 'Alexandre.Melo84@escola.com.br', 'aluno', 'Alexandre Melo Jr.', '2025-09-11 19:10:51', NULL, NULL),
(30, 'MAT1023', '$2b$10$yLFYIMEXrA6B0JtDvReBQOmkWOES7KFZY9msN/KvHtWe/I1rVVR0.', 'Pedro_Macedo72@escola.com.br', 'aluno', 'Pedro Macedo', '2025-09-11 19:10:51', NULL, NULL),
(31, 'MAT1024', '$2b$10$7IxSQC1bGTppCeyJZa12bOXj1x7MtGaqlrzn1c7sFPUzOIfdX13ly', 'Felicia.Silva@escola.com.br', 'aluno', 'Felícia Silva', '2025-09-11 19:10:51', '/uploads/aluno24.jpg', NULL),
(32, 'MAT1025', '$2b$10$N0iVeUn9xGks1okxo4B/aOoes8dXMihlIRsg/Xq1YLtDsyPruBjiq', 'Leonardo_Carvalho33@escola.com.br', 'aluno', 'Leonardo Carvalho', '2025-09-11 19:10:51', NULL, NULL),
(33, 'MAT1026', '$2b$10$XTtGzgMIZ/1sNuYlAE05OeMNeHvAI/LafzZsZt0Ub9FFk3sz0Naji', 'Alice_Moraes77@escola.com.br', 'aluno', 'Alice Moraes', '2025-09-11 19:10:51', NULL, NULL),
(34, 'MAT1027', '$2b$10$y.FYO76sMBkvGVYNVNGtOeGyX1.UtoUqyTldCR6zcd2FcuNq7OH1i', 'Gabriel_Carvalho@escola.com.br', 'aluno', 'Gabriel Carvalho', '2025-09-11 19:10:51', NULL, NULL),
(35, 'MAT1028', '$2b$10$6MPZZYXW8UrR8XhTIj4nyO/ftp5UMrXJI7s5FgHU3FHaYDVSzZ9m2', 'Salvador_Costa@escola.com.br', 'aluno', 'Salvador Costa', '2025-09-11 19:10:52', '/uploads/aluno28.jpg', NULL),
(36, 'MAT1029', '$2b$10$28/Upju/KV1QFd3tV29tpu4pe2TUqv4GSnAcH0JidPowMbIrxoG5q', 'Joao.Costa62@escola.com.br', 'aluno', 'João Costa', '2025-09-11 19:10:52', NULL, NULL),
(37, 'MAT1030', '$2b$10$zJD2Cm4GSJ3rjDyElGbUS.tKTDDMIxg7ag.SYLQyOAKn9B9JlEJlO', 'Maria_Cecilia85@escola.com.br', 'aluno', 'Maria Cecília Martins', '2025-09-11 19:10:52', NULL, NULL),
(38, 'MAT1031', '$2b$10$gJ8aCaFO5KYNO06LDGyKY.0x.tk7j/q9Fhtkogvgk8geOwLtanSJ6', 'Dra.Silvia@escola.com.br', 'aluno', 'Dra. Sílvia Silva', '2025-09-11 19:10:52', NULL, NULL),
(39, 'MAT1032', '$2b$10$r0n2NSpXGuwZquADbsJeFuO5LSJHA7qfPYayv4X.ZjX9EZ04tOSN6', 'Joao.Lucas91@escola.com.br', 'aluno', 'João Lucas Macedo', '2025-09-11 19:10:52', '/uploads/aluno32.jpg', NULL),
(40, 'MAT1033', '$2b$10$3zPs2uLIcP7vcH.Hqn4xH.pcPVSoha/HHUQeXfnriDByTP1xmy3Ea', 'Rafael.Souza@escola.com.br', 'aluno', 'Rafael Souza', '2025-09-11 19:10:52', NULL, NULL),
(41, 'MAT1034', '$2b$10$/2p./r/liqnefIlm9gMU0.v9DkQrQAAwI5/oh8BsyXFcvTaiBAQ/C', 'Antonella.Santos@escola.com.br', 'aluno', 'Antonella Santos', '2025-09-11 19:10:52', NULL, NULL),
(42, 'MAT1035', '$2b$10$1MzC9DAHLSzZQi9HdcjWo.IJZymAJkrQ8LyikPU2HzID6pxZSiASq', 'Gubio.Saraiva96@escola.com.br', 'aluno', 'Gúbio Saraiva', '2025-09-11 19:10:53', NULL, NULL),
(43, 'MAT1036', '$2b$10$CNLrvukqP1CqslCz9Qlxm.97Q83hMKtoOq.pQ0TufBnfiBkmnEHV6', 'Benicio.Melo@escola.com.br', 'aluno', 'Benício Melo', '2025-09-11 19:10:53', '/uploads/aluno36.jpg', NULL),
(44, 'MAT1037', '$2b$10$sUhEPQyIp07P594ch6UwG.sHEawuvhiWymVCl3LlcwE9JuNyhJyx2', 'Ana_Laura@escola.com.br', 'aluno', 'Ana Laura Moreira', '2025-09-11 19:10:53', NULL, NULL),
(45, 'MAT1038', '$2b$10$Qi7eDEcMRmt7Qj7kje64dOH/SHJAnmoyc3SWiWxt.7oDJ8NFA8TyS', 'Cecilia.Franco@escola.com.br', 'aluno', 'Cecília Franco', '2025-09-11 19:10:53', NULL, NULL),
(46, 'MAT1039', '$2b$10$yodthupPH00AoTeMWbnGHOCnRBnQHsN63g5CpkWMpoDJtf085YKxK', 'Isadora.Albuquerque@escola.com.br', 'aluno', 'Isadora Albuquerque Jr.', '2025-09-11 19:10:53', NULL, NULL),
(47, 'MAT1040', '$2b$10$DFl3DvMyFFxQucUwEyearujbdnzeF6IzYehPmCtpnW6niYvnibwhS', 'Lara.Xavier@escola.com.br', 'aluno', 'Lara Xavier', '2025-09-11 19:10:53', '/uploads/aluno40.jpg', NULL),
(48, 'MAT1041', '$2b$10$xv7RMWw7g9Xly0B.AxTZ0.HEcAdWMUTtGyBzw2wzXjYveOy8U2YQS', 'Guilherme_Silva@escola.com.br', 'aluno', 'Guilherme Silva', '2025-09-11 19:10:54', NULL, NULL),
(49, 'MAT1042', '$2b$10$rgwlFwsYWszgmS0gU.2meu5GYeU1C8ihFeIcFksMImLIROUModQ06', 'Isabel.Costa76@escola.com.br', 'aluno', 'Isabel Costa', '2025-09-11 19:10:54', NULL, NULL),
(50, 'MAT1043', '$2b$10$C9/o9IG3Tuwv7w07pIxf2uAx88DgFI3T2r8hyeM25YdwJw9knxCpS', 'Natalia_Batista55@escola.com.br', 'aluno', 'Natália Batista', '2025-09-11 19:10:54', NULL, NULL),
(51, 'MAT1044', '$2b$10$OmDSSaQrEn9Af5cT8RkGku8EbOU1w/vejCeC8OgNM7PIowcQQMTOC', 'Celia_Moreira29@escola.com.br', 'aluno', 'Célia Moreira', '2025-09-11 19:10:54', '/uploads/aluno44.jpg', NULL),
(52, 'MAT1045', '$2b$10$vOsr3KdAnBTkW3uE/H8SoeIeO64gXSMGmUnfS7mwn5T.a8NKc9lp.', 'Celia_Melo@escola.com.br', 'aluno', 'Célia Melo', '2025-09-11 19:10:54', NULL, NULL),
(53, 'MAT1046', '$2b$10$Asfp08FtoMDUNQmppH.BeuNHvlOpEYPSsGAoDVAjBykectY4QQDKW', 'Sr._Marcos0@escola.com.br', 'aluno', 'Sr. Marcos Barros', '2025-09-11 19:10:54', NULL, NULL),
(54, 'MAT1047', '$2b$10$hI4O/Fzj1jXbTGwCOTPz0.b5bzBqhkPxuznIpeIMKtn8mpg8jR99e', 'Leonardo.Albuquerque66@escola.com.br', 'aluno', 'Leonardo Albuquerque', '2025-09-11 19:10:54', NULL, NULL),
(55, 'MAT1048', '$2b$10$zaGIDRbAFHOWEr1LTOV54exXmzm32KfLHkohmkWLpIaFWnJ7wgeMa', 'Enzo_Gabriel59@escola.com.br', 'aluno', 'Enzo Gabriel Carvalho', '2025-09-11 19:10:55', '/uploads/aluno48.jpg', NULL),
(56, 'MAT1049', '$2b$10$icZZ1bQ4/YCHklyD.48t3OAZOtY/FVm3kVr5Et2IXrnUC9PMizAWu', 'Davi_Carvalho84@escola.com.br', 'aluno', 'Davi Carvalho', '2025-09-11 19:10:55', NULL, NULL),
(57, 'MAT1050', '$2b$10$Hu3AYmFPGnLjdXbvcMb3Wux8q4lJbjDCoTj7WqbgeBdMiqqbhT41y', 'Ana.Laura87@escola.com.br', 'aluno', 'Ana Laura Franco', '2025-09-11 19:10:55', NULL, NULL),
(58, 'MAT1051', '$2b$10$HvU3X.O5u3AmagGfWFvite2Go4LwgxmogJ2QO1.nIqrfExiR9X.jW', 'Marcela_Braga85@escola.com.br', 'aluno', 'Marcela Braga', '2025-09-11 19:10:55', NULL, NULL),
(59, 'MAT1052', '$2b$10$xSdm9WvxAUfXyx4qVq7pOuQorWn84P0mn2nTbHI837mVZjurkZLsq', 'Felicia_Albuquerque23@escola.com.br', 'aluno', 'Felícia Albuquerque', '2025-09-11 19:10:55', '/uploads/aluno52.jpg', NULL),
(60, 'MAT1053', '$2b$10$IeOpDrxChLyEhJMn5IHOkehluJg2JfnvX/n2z3irSb3JD1Udg/G.m', 'Mercia.Batista@escola.com.br', 'aluno', 'Mércia Batista', '2025-09-11 19:10:55', NULL, NULL),
(61, 'MAT1054', '$2b$10$n2L5PlCIxAKW1WfvSs7vROCL.jZOM2BrShkLvz0kPXEfI/8E1WovW', 'Calebe.Moraes@escola.com.br', 'aluno', 'Calebe Moraes', '2025-09-11 19:10:56', NULL, NULL),
(62, 'MAT1055', '$2b$10$qx7qnTwC9RcoVhkAn5AEeOxwUCJD4rt7rEbiZFBUZCQdlezPohliy', 'Alicia_Batista@escola.com.br', 'aluno', 'Alícia Batista', '2025-09-11 19:10:56', NULL, NULL),
(63, 'MAT1056', '$2b$10$MSzxhUBhibVjZyLjY6vbLOwXR.UCZuJiZJzhF7jyhPi.V4Itgpiky', 'Cesar.Macedo10@escola.com.br', 'aluno', 'César Macedo', '2025-09-11 19:10:56', '/uploads/aluno56.jpg', NULL),
(64, 'MAT1057', '$2b$10$N8qMfstfVcLLrgE8dCnG.uteqRZoX4kHW.XFnMOZwpqHcG2yBPfLS', 'Yuri_Souza@escola.com.br', 'aluno', 'Yuri Souza Filho', '2025-09-11 19:10:56', NULL, NULL),
(65, 'MAT1058', '$2b$10$j0emnruWAIkPjnNWe5/jOesAGZnHrwecTclnD2nPkBbSllinhu4qC', 'Henrique.Batista60@escola.com.br', 'aluno', 'Henrique Batista', '2025-09-11 19:10:56', NULL, NULL),
(66, 'MAT1059', '$2b$10$vjl2DYmXyzwJlEnvDZ8Y1eW/ERWOxu32uHrOg0ZRK2vbhM9RX8kfm', 'Mariana_Carvalho@escola.com.br', 'aluno', 'Mariana Carvalho Jr.', '2025-09-11 19:10:56', NULL, NULL),
(67, 'MAT1060', '$2b$10$sIwIUT1TmIgl/hDVbyorD.HPdEziIq6fLapgL2rUCBNjkzsVFRR4C', 'Sr.Joao@escola.com.br', 'aluno', 'Sr. João Silva', '2025-09-11 19:10:56', '/uploads/aluno60.jpg', NULL),
(68, 'MAT1061', '$2b$10$vIy182H43gbE2UHjXK.Qg.UAIBIF7AoGBhjBl9ksjPfkb7pm8Zk9W', 'Sr.Vitor@escola.com.br', 'aluno', 'Sr. Vitor Pereira', '2025-09-11 19:10:57', NULL, NULL),
(69, 'MAT1062', '$2b$10$YQ/Gt19XpDk..HfmkAEvyOtyHOV14AfQ3LeITCKOPUy77fkCHv3Xe', 'Marina_Santos@escola.com.br', 'aluno', 'Marina Santos', '2025-09-11 19:10:57', NULL, NULL),
(70, 'MAT1063', '$2b$10$uuL6RJPD4CvWehLNDWKWceZZDfDvUJIoWLGil81WwVdYJGbmWp7sK', 'Isaac.Xavier50@escola.com.br', 'aluno', 'Isaac Xavier', '2025-09-11 19:10:57', NULL, NULL),
(71, 'MAT1064', '$2b$10$dryuODDugys2HQK.i/.6I.IkBEUR3j4qbCBLHdvzW8ZFz2vPLvG4u', 'Joaquim.Nogueira39@escola.com.br', 'aluno', 'Joaquim Nogueira', '2025-09-11 19:10:57', '/uploads/aluno64.jpg', NULL),
(72, 'MAT1065', '$2b$10$VUceJBf2Nm3OYDeq68NevusAo8.iM52ne0DWM3OVIv5qiqdeumVxO', 'Sr.Enzo82@escola.com.br', 'aluno', 'Sr. Enzo Batista', '2025-09-11 19:10:57', NULL, NULL),
(73, 'MAT1066', '$2b$10$Gz.onWVTwIcDBSsnhaNOde4FeH1Y11EznsvjWLte4FecYg/mbt43m', 'Roberto.Saraiva91@escola.com.br', 'aluno', 'Roberto Saraiva', '2025-09-11 19:10:57', NULL, NULL),
(74, 'MAT1067', '$2b$10$WwQMVLZEQ3Q/5Ehkt9S3AueQz.thZ2F1WfNGXnetpUCKD/MMSFrpu', 'Srta.Silvia17@escola.com.br', 'aluno', 'Srta. Sílvia Saraiva', '2025-09-11 19:10:57', NULL, NULL),
(75, 'MAT1068', '$2b$10$SBdiKeS7THFcwUZiDPwGXOpVN60f4DoZervITq5x6.fM.1NrwDjCS', 'Sra.Cecilia@escola.com.br', 'aluno', 'Sra. Cecília Moreira', '2025-09-11 19:10:58', '/uploads/aluno68.jpg', NULL),
(76, 'MAT1069', '$2b$10$JZGJhPicRCNeM8qyZoYz2.088iGAC2VB2nBI751hSEz/LOPE97u4e', 'Meire_Xavier37@escola.com.br', 'aluno', 'Meire Xavier', '2025-09-11 19:10:58', NULL, NULL),
(77, 'MAT1070', '$2b$10$mHt.ZpW/eb4Kz5e1ULcR1u0wEPKmRJ39foZjMbbwqTXR7Vksvlaka', 'Frederico_Souza36@escola.com.br', 'aluno', 'Frederico Souza', '2025-09-11 19:10:58', NULL, NULL),
(78, 'MAT1071', '$2b$10$uSkjMNiy2QoMWUVrTuGSruRQy71rSDKkTmfyPOELYFJNplUmhNftW', 'Maria_Clara98@escola.com.br', 'aluno', 'Maria Clara Souza', '2025-09-11 19:10:58', NULL, NULL),
(79, 'MAT1072', '$2b$10$lwytqmlGbCxkBZ/zt1kOjeDOMwF6nR1aDSGkk0MoAHaRQnAbMb51a', 'Pedro.Carvalho@escola.com.br', 'aluno', 'Pedro Carvalho', '2025-09-11 19:10:58', '/uploads/aluno72.jpg', NULL),
(80, 'MAT1073', '$2b$10$T3U1ZD/Zvw8SijeP5iRbyu1HElOsyjyEVMGbiOTuQDil4/jShNcYW', 'Rebeca_Albuquerque3@escola.com.br', 'aluno', 'Rebeca Albuquerque', '2025-09-11 19:10:58', NULL, NULL),
(81, 'MAT1074', '$2b$10$JkY0AZ.xMlfN7xpK6qNeruHMez1WFHTPxV3ryT2zZUzeqGW6QFsV6', 'Dra.Maria33@escola.com.br', 'aluno', 'Dra. Maria Carvalho', '2025-09-11 19:10:59', NULL, NULL),
(82, 'MAT1075', '$2b$10$9K7bpe69LKsOK0KMdZAj0u8NvdTOtLOPLLJ/TlqvvfTF4WV8xiOca', 'Ana_Laura@escola.com.br', 'aluno', 'Ana Laura Xavier Jr.', '2025-09-11 19:10:59', NULL, NULL),
(83, 'MAT1076', '$2b$10$JXK6dzwSLcoISHObX3Dvruoj.dmh4ce4dm9vg8P5jsD/6PSfVRDlO', 'Maria_Clara@escola.com.br', 'aluno', 'Maria Clara Souza', '2025-09-11 19:10:59', '/uploads/aluno76.jpg', NULL),
(84, 'MAT1077', '$2b$10$.jf8ShyHawr1WFljjJdPYeKS6PUtmP2HXTe8xEIxYau1ABupKRHV2', 'Isabelly_Barros12@escola.com.br', 'aluno', 'Isabelly Barros', '2025-09-11 19:10:59', NULL, NULL),
(85, 'MAT1078', '$2b$10$Fx76OAgxYb82dWUgZ3ykCeEzlpOU22aad0B6lvG4HfhW8lnZJ5G2m', 'Yasmin_Albuquerque0@escola.com.br', 'aluno', 'Yasmin Albuquerque Jr.', '2025-09-11 19:10:59', NULL, NULL),
(86, 'MAT1079', '$2b$10$FSHwlf2m91FrYmf40.hLHe/LGIgtwo1bxMtNx94eAPveQwyEqZXly', 'Benicio.Braga@escola.com.br', 'aluno', 'Benício Braga Neto', '2025-09-11 19:10:59', NULL, NULL),
(87, 'MAT1080', '$2b$10$MwreYn70Wl0o.fGbPiZVm.Mu/8j8uS9PklFBWDhOmDMfzHYOk/jl6', 'Lavinia_Xavier@escola.com.br', 'aluno', 'Lavínia Xavier', '2025-09-11 19:11:00', '/uploads/aluno80.jpg', NULL),
(88, 'MAT1081', '$2b$10$kUuzadenHPLPlDru5TKLI.cvNDeP5HV3hryj3h359fMzMFSgsPvpC', 'Hugo_Pereira@escola.com.br', 'aluno', 'Hugo Pereira Filho', '2025-09-11 19:11:00', NULL, NULL),
(89, 'MAT1082', '$2b$10$8HjZq6gEyRoFnUCzXzNw8u/ObAv1GMvt.UGuwJw.XKfxgmvYYoh9a', 'Dr.Tertuliano81@escola.com.br', 'aluno', 'Dr. Tertuliano Moraes', '2025-09-11 19:11:00', NULL, NULL),
(90, 'MAT1083', '$2b$10$6hT.Zeji1N6.b1S58DufyeR6Rxd.06FRT06be.qyd8E7A1GZxx4Jm', 'Fabiano_Albuquerque12@escola.com.br', 'aluno', 'Fabiano Albuquerque', '2025-09-11 19:11:00', NULL, NULL),
(91, 'MAT1084', '$2b$10$xPANyIr7io7r6SNdzsdb5uPwt1hcL/NzKiOTZLvbv1SA96XlwOwJC', 'Guilherme_Reis@escola.com.br', 'aluno', 'Guilherme Reis', '2025-09-11 19:11:00', '/uploads/aluno84.jpg', NULL),
(92, 'MAT1085', '$2b$10$LyFkMMxhxgidH2T3R93ZTe/ZGcGCiMed1gtxXQoIDsa4LLx5mvYkm', 'Carla_Carvalho@escola.com.br', 'aluno', 'Carla Carvalho', '2025-09-11 19:11:00', NULL, NULL),
(93, 'MAT1086', '$2b$10$5ZCGkd0oCuYLgAfszQ2j7uz/RbCvAHkXlZtHKQCTJRs6fK6bGloCK', 'Sr._Julio@escola.com.br', 'aluno', 'Sr. Júlio Costa', '2025-09-11 19:11:00', NULL, NULL),
(94, 'MAT1087', '$2b$10$JZRnTB5Kk498ZZqxsiondeRL8TyYH2GBwz9X5K5TRSlPrT6fgyNke', 'Celia_Melo@escola.com.br', 'aluno', 'Célia Melo', '2025-09-11 19:11:01', NULL, NULL),
(95, 'MAT1088', '$2b$10$sP4JaUZLj5SnxXKuH5JIie4hucR5QicFt3fnZHLs91NiYn6Kt/xEG', 'Maria_Eduarda64@escola.com.br', 'aluno', 'Maria Eduarda Saraiva', '2025-09-11 19:11:01', '/uploads/aluno88.jpg', NULL),
(96, 'MAT1089', '$2b$10$qfiMIew5lC6ehgU4pYTs4OuUvSVWrJ46Isdh1jRnpKs6XwKPzOoj2', 'Matheus.Moraes39@escola.com.br', 'aluno', 'Matheus Moraes Jr.', '2025-09-11 19:11:01', NULL, NULL),
(97, 'MAT1090', '$2b$10$7bNpUQjdCGpYxkF0gF42I.3FHaKT2yek4iQO4v6Y0FBqSe04e0U3W', 'Anthony.Batista84@escola.com.br', 'aluno', 'Anthony Batista', '2025-09-11 19:11:01', NULL, NULL),
(98, 'MAT1091', '$2b$10$rI0U1sZik7rz6pi9WOkQtO.qr.VG.VprqQC/aPL8DmH4nuALfQud2', 'Sara.Nogueira@escola.com.br', 'aluno', 'Sara Nogueira', '2025-09-11 19:11:01', NULL, NULL),
(99, 'MAT1092', '$2b$10$RLsQxN7KHoD4/NzXc2/uM.cVTnsAvA99DndHeANapOjk.hZ6HElC2', 'Vicente_Barros@escola.com.br', 'aluno', 'Vicente Barros', '2025-09-11 19:11:01', '/uploads/aluno92.jpg', NULL),
(100, 'MAT1093', '$2b$10$mE9QGz7MoSBtPqaK.y9P2eDLmdxdJKTT1sQ.pAhvWfS0QesvnClDC', 'Fabio_Moraes19@escola.com.br', 'aluno', 'Fábio Moraes', '2025-09-11 19:11:01', NULL, NULL),
(101, 'MAT1094', '$2b$10$CuQDMCKZnZA9h2MNvCXFg.SV4LRipvJ2CgGUX0ICGGKl1qxJW3HSK', 'Sophia.Moraes37@escola.com.br', 'aluno', 'Sophia Moraes', '2025-09-11 19:11:02', NULL, NULL),
(102, 'MAT1095', '$2b$10$18YT5VgXDubWiW6WPk1fWO3DvSk/JANDJWO31cuQBFDk.NVUD6Ztu', 'Joaquim_Silva@escola.com.br', 'aluno', 'Joaquim Silva', '2025-09-11 19:11:02', NULL, NULL),
(103, 'MAT1096', '$2b$10$D0kF00XZ3RJuNXNDQtglzumdvJyM645t2a78TKnL5itiG7NCywvNC', 'Sophia.Costa20@escola.com.br', 'aluno', 'Sophia Costa', '2025-09-11 19:11:02', '/uploads/aluno96.jpg', NULL),
(104, 'MAT1097', '$2b$10$LMFppfov2aKrL3.MufeH.Om7HwX8lBiHOfEd6jV4QqXtsDlw9XTQe', 'Davi.Lucca74@escola.com.br', 'aluno', 'Davi Lucca Nogueira', '2025-09-11 19:11:02', NULL, NULL),
(105, 'MAT1098', '$2b$10$NP7/gYNFgCOeOFwwpsUYUuYWuGsULvnconRa7PJOfIHvd4fZFyhwO', 'Clara.Martins59@escola.com.br', 'aluno', 'Clara Martins', '2025-09-11 19:11:02', NULL, NULL),
(106, 'MAT1099', '$2b$10$shO8zBnzhFb2tIVUCG6F7Or9kiJoB9EYMvPV6Tv5l1Vs7BibexyAO', 'Felix.Franco35@escola.com.br', 'aluno', 'Félix Franco Jr.', '2025-09-11 19:11:02', NULL, NULL),
(107, 'MAT1100', '$2b$10$PBh1oZwDkTRv3dWYcUHNVuQ/V5K.iH/mTatlfWfOeZ8x2p9x09axm', 'Rafaela.Batista@escola.com.br', 'aluno', 'Rafaela Batista', '2025-09-11 19:11:03', '/uploads/aluno100.jpg', NULL),
(108, 'MAT1101', '$2b$10$9wCY6piZyf9PVgy5vYRrkeZbvoa9yIjRtPIsSMZpyWE2PBVEfVNJy', 'Julio_Cesar@escola.com.br', 'aluno', 'Júlio César Moreira', '2025-09-11 19:11:03', NULL, NULL),
(109, 'MAT1102', '$2b$10$h6JXPpwoewGheERNrDejbO8VvtHu1D0PqEOAKqdH3T2cj7ar3GQRG', 'Dalila.Nogueira45@escola.com.br', 'aluno', 'Dalila Nogueira', '2025-09-11 19:11:03', NULL, NULL),
(110, 'MAT1103', '$2b$10$qB451hftCOhKsbYARVtaw.uZH8.knySbTGY1xRYWB6UJi.OllscHC', 'Davi.Lucca@escola.com.br', 'aluno', 'Davi Lucca Martins', '2025-09-11 19:11:03', NULL, NULL),
(111, 'MAT1104', '$2b$10$.iAyz.cPxpJs2q7NJf3EjeoLqyXWLJniwKuT4TQ5w3FBKpj4oBj7i', 'Luiza.Santos36@escola.com.br', 'aluno', 'Luiza Santos', '2025-09-11 19:11:03', '/uploads/aluno104.jpg', NULL),
(112, 'MAT1105', '$2b$10$9Zhhz0HCbLUON8UUwAY5uOeI5R2WiFyRZKEyVhi8znrUnzQhqXbAe', 'Janaina_Pereira59@escola.com.br', 'aluno', 'Janaína Pereira', '2025-09-11 19:11:03', NULL, NULL),
(113, 'MAT1106', '$2b$10$0TlM6GPBtq8GIcMgEntpq.hUbdYk6GBL5zxSdr81tUHsWh34LNF.6', 'Alexandre_Franco22@escola.com.br', 'aluno', 'Alexandre Franco Neto', '2025-09-11 19:11:03', NULL, NULL),
(114, 'MAT1107', '$2b$10$Sz3K/qVnW.g4uz/Vkf3zGedHQMUTHBM56FYfbi.1oewvshxLhnPBK', 'Benicio_Albuquerque93@escola.com.br', 'aluno', 'Benício Albuquerque', '2025-09-11 19:11:04', NULL, NULL),
(115, 'MAT1108', '$2b$10$DZA6OJuiQrMyNwj2iQd3WOk6gUxWpZl01YJQ0xDzPNphncKR9kC/a', 'Sr._Calebe48@escola.com.br', 'aluno', 'Sr. Calebe Moreira', '2025-09-11 19:11:04', '/uploads/aluno108.jpg', NULL),
(116, 'MAT1109', '$2b$10$kaMu0UTZyWvCpGdzGzN9j.j3zwy6v0ASS9aj/N9knhG5II/7fewaW', 'Nicolas.Santos@escola.com.br', 'aluno', 'Nicolas Santos Neto', '2025-09-11 19:11:04', NULL, NULL),
(117, 'MAT1110', '$2b$10$XrHWsi.NwsF88UNf0uOGG.1fjj3YtOhukejIzCAZ2DJt8kd6poFau', 'Marcelo_Xavier@escola.com.br', 'aluno', 'Marcelo Xavier', '2025-09-11 19:11:04', NULL, NULL),
(118, 'MAT1111', '$2b$10$fHyx3ozLHGuc1nQLVn7Jd.l5zVuJCYF2lsMKkEUzP8VDcUypTVs/K', 'Isaac_Albuquerque80@escola.com.br', 'aluno', 'Isaac Albuquerque Jr.', '2025-09-11 19:11:04', NULL, NULL),
(119, 'MAT1112', '$2b$10$7aOGWqwbwIf8aO553wCxu.xbw1TvxXe7bhrgVmPIE1r8J6Y8gvuYa', 'Julia.Melo@escola.com.br', 'aluno', 'Júlia Melo', '2025-09-11 19:11:04', '/uploads/aluno112.jpg', NULL),
(120, 'MAT1113', '$2b$10$tytlg4Ugv2RGxCmA9E6Q7OshYz.PnN7hXQMe6CBUfeLupXnnqAu3W', 'Lorenzo_Pereira8@escola.com.br', 'aluno', 'Lorenzo Pereira', '2025-09-11 19:11:04', NULL, NULL),
(121, 'MAT1114', '$2b$10$PLdsWFx4ounkxvcN/vNN0uqVKDcE3yPCoh4w1Zfomu4FYOoYUIw0O', 'Gael_Carvalho@escola.com.br', 'aluno', 'Gael Carvalho', '2025-09-11 19:11:05', NULL, NULL),
(122, 'MAT1115', '$2b$10$ypgqX26VC9/iIqhL65qt3.A2mVPQMzKRyfY/HIdcOptQL8i0Ty9B.', 'Felicia_Macedo@escola.com.br', 'aluno', 'Felícia Macedo', '2025-09-11 19:11:05', NULL, NULL),
(123, 'MAT1116', '$2b$10$rfeFdYRcFmhtRLQ/zOMk.eWMw3AJMfL50D0KZspbUsCGxNlb2J/wG', 'Yango.Albuquerque55@escola.com.br', 'aluno', 'Yango Albuquerque', '2025-09-11 19:11:05', '/uploads/aluno116.jpg', NULL),
(124, 'MAT1117', '$2b$10$VHySV61DnTeCAWYPQCiS9.z7Dl07ntM9.y7Dy0P0GUwYH3DbI.YCi', 'Joana.Albuquerque@escola.com.br', 'aluno', 'Joana Albuquerque', '2025-09-11 19:11:05', NULL, NULL),
(125, 'MAT1118', '$2b$10$MqKis7loMyCBmCIoXI1MpOKow5RnNFijXJMZGdTKSwyRkx0wjZMhK', 'Eduardo.Reis15@escola.com.br', 'aluno', 'Eduardo Reis', '2025-09-11 19:11:05', NULL, NULL),
(126, 'MAT1119', '$2b$10$xvIlhUyXmm7HbHFc0oUAz.jTvQkYfr/VKDzSnb9QcwgUr4XCdT5SS', 'Sr._Breno64@escola.com.br', 'aluno', 'Sr. Breno Macedo', '2025-09-11 19:11:05', NULL, NULL),
(127, 'MAT1120', '$2b$10$unhgi5SjVB3IQIW4xISgzuFfobHQ2tMFHDhr/0JMge13AqcXily9y', 'Fabricia_Melo90@escola.com.br', 'aluno', 'Fabrícia Melo', '2025-09-11 19:11:05', '/uploads/aluno120.jpg', NULL),
(128, 'MAT1121', '$2b$10$nBMhjNHlFAZiE0DoagWYW.BTXcq0Kly3RqZVuGgwyGXaZ2.mlhwlq', 'Yuri.Oliveira@escola.com.br', 'aluno', 'Yuri Oliveira', '2025-09-11 19:11:06', NULL, NULL),
(129, 'MAT1122', '$2b$10$IBIvGvBFAylT41aFmnUkjOrYKat3i8lNosSG1QxF13OAbXsI47RvW', 'Felicia.Macedo53@escola.com.br', 'aluno', 'Felícia Macedo', '2025-09-11 19:11:06', NULL, NULL),
(130, 'MAT1123', '$2b$10$UxBsBpBCPyuNTTP0m6/o.OWGiej4SwCFKlJ.lOA7un7Xl4hSetRy.', 'Breno_Moreira@escola.com.br', 'aluno', 'Breno Moreira', '2025-09-11 19:11:06', NULL, NULL),
(131, 'MAT1124', '$2b$10$IPLQxCeMk7N7BKLWV6VjreWPghEcbq1Tgl8ejAuIMYltnj51LIoG.', 'Igor_Barros92@escola.com.br', 'aluno', 'Ígor Barros', '2025-09-11 19:11:06', '/uploads/aluno124.jpg', NULL),
(132, 'MAT1125', '$2b$10$TtVDRXAZTypC/qojIDU07.GDHh0pjySSaux4UTk0L8yXY0izJeQrK', 'Vitor.Pereira@escola.com.br', 'aluno', 'Vitor Pereira', '2025-09-11 19:11:06', NULL, NULL),
(133, 'MAT1126', '$2b$10$pAUDkYlf5i6S5IsL2SfFLu90aFmiuUlPkhhkJ/kFJsTjI6xHC3IXC', 'Alice.Martins12@escola.com.br', 'aluno', 'Alice Martins', '2025-09-11 19:11:06', NULL, NULL),
(134, 'MAT1127', '$2b$10$cDtF/aoAMnAgBiiUnt2/seD2UAGeqbelPO/KFjkioeMm9vh.g0v0i', 'Morgana_Barros@escola.com.br', 'aluno', 'Morgana Barros', '2025-09-11 19:11:06', NULL, NULL),
(135, 'MAT1128', '$2b$10$axLHjfrUi.azigPFc35ao.QdKm4imeC2r8keYbZ.MfhUsmH0foQoe', 'Eduarda.Carvalho@escola.com.br', 'aluno', 'Eduarda Carvalho', '2025-09-11 19:11:07', '/uploads/aluno128.jpg', NULL),
(136, 'MAT1129', '$2b$10$T9/R6IHzA3Iesdn47eCQAu8otWOeZN0i9EvpMH4Pxb6XFzKM0IE0e', 'Elisio.Macedo99@escola.com.br', 'aluno', 'Elísio Macedo', '2025-09-11 19:11:07', NULL, NULL),
(137, 'MAT1130', '$2b$10$ly0YYvHWB1KL6ufanVHyoe4B2kSDB7FaizW6uFjHcr0ELj6E2olUq', 'Elisio_Albuquerque@escola.com.br', 'aluno', 'Elísio Albuquerque Filho', '2025-09-11 19:11:07', NULL, NULL),
(138, 'MAT1131', '$2b$10$SkvyJpEAcbxXOkO8jXnDE.2vxFTggn5W.D9pak3RJ6ysFXEGzFWFK', 'Dr._Danilo3@escola.com.br', 'aluno', 'Dr. Danilo Moreira', '2025-09-11 19:11:07', NULL, NULL),
(139, 'MAT1132', '$2b$10$Xvg1bc4YBwufbI9Hgs1gIeGJTFAcKBIRSd8I8arCFhYj/3EIwuvam', 'Talita_Saraiva@escola.com.br', 'aluno', 'Talita Saraiva', '2025-09-11 19:11:07', '/uploads/aluno132.jpg', NULL),
(140, 'MAT1133', '$2b$10$/jk0Ix4W29YhvL6EB5DWGeU1DDugEeGi0K1u.SpWHSbYlwzj4JPtS', 'Larissa_Reis@escola.com.br', 'aluno', 'Larissa Reis Neto', '2025-09-11 19:11:07', NULL, NULL),
(141, 'MAT1134', '$2b$10$I9DPhr53MyWUV99pPfLI/OqqSiiYPieOaH9tD/88nprCfdNYejouC', 'Theo_Nogueira@escola.com.br', 'aluno', 'Théo Nogueira', '2025-09-11 19:11:07', NULL, NULL),
(142, 'MAT1135', '$2b$10$.p7eudkpDBb/Z3WDTKwb2.82Bk2S4CJfMU8a.KTOQwdIeMhmK73wK', 'Sarah_Melo@escola.com.br', 'aluno', 'Sarah Melo Filho', '2025-09-11 19:11:08', NULL, NULL),
(143, 'MAT1136', '$2b$10$2OZQqPk3dD4zq4e7gLD47ejLcqdKPOpyqc5ylpguIOp1b3m1K.516', 'Lara.Moreira@escola.com.br', 'aluno', 'Lara Moreira', '2025-09-11 19:11:08', '/uploads/aluno136.jpg', NULL),
(144, 'MAT1137', '$2b$10$z.IchjPV5BaNCV05XzS6PexVCrenitQ.jrePluNl/xntq1u1IPTse', 'Antonio_Franco@escola.com.br', 'aluno', 'Antônio Franco', '2025-09-11 19:11:08', NULL, NULL),
(145, 'MAT1138', '$2b$10$vY/7SakI3ntn3qspcsavY.H0p6T54wKPeXSptzwdjRDFN/H4MLJDa', 'Feliciano.Barros@escola.com.br', 'aluno', 'Feliciano Barros', '2025-09-11 19:11:08', NULL, NULL),
(146, 'MAT1139', '$2b$10$ROdAlm4uS3wVId2HJM5/U.8XRrsyd.Xf9Yn1BCQgNa9h4rcUzjrjS', 'Breno.Saraiva53@escola.com.br', 'aluno', 'Breno Saraiva Filho', '2025-09-11 19:11:08', NULL, NULL),
(147, 'MAT1140', '$2b$10$VZaMrxxwbnn9CgPJr4EJ5OItqSp9QBS62.faDbvUnuxqokkpc1NRO', 'Vitor_Oliveira@escola.com.br', 'aluno', 'Vitor Oliveira', '2025-09-11 19:11:08', '/uploads/aluno140.jpg', NULL),
(148, 'MAT1141', '$2b$10$DWdYofpQ5joVKeCOp8TZ1eupzzpFjsph22T4pXuXZoTHo1kGOfED.', 'Helena.Braga77@escola.com.br', 'aluno', 'Helena Braga', '2025-09-11 19:11:09', NULL, NULL),
(149, 'MAT1142', '$2b$10$2bmlTD8Va8eCe5AymE3vpe0cgCL0Z/08FoDOaLg0BrDb1HZ79Ah3G', 'Warley.Saraiva@escola.com.br', 'aluno', 'Warley Saraiva', '2025-09-11 19:11:09', NULL, NULL),
(150, 'MAT1143', '$2b$10$P23cTMc.hd.fKegbWe8lZuOLotRiaI6xK48YdgQ2wbOuxsPhv6/B2', 'Elisa.Carvalho99@escola.com.br', 'aluno', 'Elisa Carvalho', '2025-09-11 19:11:09', NULL, NULL),
(151, 'MAT1144', '$2b$10$ckoTp6oPh0XEJgrT3lEfZ.GV.RdJHZzvxCy4oCtNKtf5lqn1xQLBe', 'Ana_Luiza@escola.com.br', 'aluno', 'Ana Luiza Santos', '2025-09-11 19:11:09', '/uploads/aluno144.jpg', NULL),
(152, 'MAT1145', '$2b$10$zRoiPm.rScr99tBRTwalr.iBR9Zqg6Fh2peboBpxHCNcu3YMpCW3K', 'Karla_Santos@escola.com.br', 'aluno', 'Karla Santos', '2025-09-11 19:11:09', NULL, NULL),
(153, 'MAT1146', '$2b$10$f0LsOp/7Z5RRCxsFfhD/mOh9K8BOaQPo6e7Tk3GxZuWvpbiwZE4Gi', 'Benicio_Pereira64@escola.com.br', 'aluno', 'Benício Pereira', '2025-09-11 19:11:09', NULL, NULL),
(154, 'MAT1147', '$2b$10$eHTcPRwiRqUayr7AjFiQO.udqJUXsL3CS6DeypopCoi7VpGWlYo9G', 'Esther_Moreira22@escola.com.br', 'aluno', 'Esther Moreira', '2025-09-11 19:11:09', NULL, NULL),
(155, 'MAT1148', '$2b$10$uSFv1jlJNENOnhV4hpc5j.DzxDE49Rx9D5VFzHqrHWuiYcyc6BtTi', 'Enzo.Carvalho60@escola.com.br', 'aluno', 'Enzo Carvalho Filho', '2025-09-11 19:11:10', '/uploads/aluno148.jpg', NULL),
(156, 'MAT1149', '$2b$10$GWnrIxrAQRiNceiwv.q1qONwz8k5IrGu/2zTuEv19rfzrvTF/Liq2', 'Lucca_Nogueira@escola.com.br', 'aluno', 'Lucca Nogueira', '2025-09-11 19:11:10', NULL, NULL),
(157, 'MAT1150', '$2b$10$3dbKWmc.44iGraYerxSJZu35QQ0SnGpVeXE.rpISo9122AA2lJJGi', 'Ana_Luiza88@escola.com.br', 'aluno', 'Ana Luiza Pereira', '2025-09-11 19:11:10', NULL, NULL),
(158, 'MAT1151', '$2b$10$IryehkxB9nV2zqmpnv9O2uCcxl4E5UBjTioNz.KD64KpUkweQeuoi', 'Hugo.Reis45@escola.com.br', 'aluno', 'Hugo Reis', '2025-09-11 19:11:10', NULL, NULL),
(159, 'MAT1152', '$2b$10$j22Q88GUnwG0j19WQVdeIOLzh9FG4387FM/niNHIHKnWYFYRy3/lC', 'Ofelia_Saraiva83@escola.com.br', 'aluno', 'Ofélia Saraiva', '2025-09-11 19:11:10', '/uploads/aluno152.jpg', NULL),
(160, 'MAT1153', '$2b$10$eqDedC5YfKMfLeg9XWdke.SLM4ok.6SF5OrRUz6gBWRTNK10bzghm', 'Noah_Moraes63@escola.com.br', 'aluno', 'Noah Moraes', '2025-09-11 19:11:10', NULL, NULL),
(161, 'MAT1154', '$2b$10$gP/IRj0j1S008cWoHb15VeZAVW4R6I8dlyzN5a7/NrkshmAxhWcKK', 'Davi_Macedo74@escola.com.br', 'aluno', 'Davi Macedo', '2025-09-11 19:11:10', NULL, NULL),
(162, 'MAT1155', '$2b$10$pz3igggBDzL9QtbaadP1rOXlrPrBRGVDw.LDx6h331Wtn3XLKCyCe', 'Carla_Oliveira3@escola.com.br', 'aluno', 'Carla Oliveira', '2025-09-11 19:11:11', NULL, NULL),
(163, 'MAT1156', '$2b$10$VKPryoo1LZQ7MgwKLprBBey/mOWw/CLRNYvgomtwvN4EMYKTOJ..u', 'Liz.Reis24@escola.com.br', 'aluno', 'Liz Reis', '2025-09-11 19:11:11', '/uploads/aluno156.jpg', NULL),
(164, 'MAT1157', '$2b$10$W/U/Z8.QYh1.ImfFRB.Y/eGlQTeLV1uJ6LzKkEjT1p72TKxYo.oMa', 'Alicia_Melo@escola.com.br', 'aluno', 'Alícia Melo', '2025-09-11 19:11:11', NULL, NULL),
(165, 'MAT1158', '$2b$10$AK.vie3P3e2O8XtrYH5gIu6tzG/VOfrZmM8CUQkdcFDVDuc93yZfq', 'Antonella_Batista81@escola.com.br', 'aluno', 'Antonella Batista', '2025-09-11 19:11:11', NULL, NULL),
(166, 'MAT1159', '$2b$10$Eig1HnNjcT3Gpua8V7RFUeSpJ7MDkuS0P7nYNHkwzLqUNl.69WAi.', 'Dr.Henrique@escola.com.br', 'aluno', 'Dr. Henrique Xavier', '2025-09-11 19:11:11', NULL, NULL),
(167, 'MAT1160', '$2b$10$aL/D7UX5VFQlfbII.9fBgOiT.Jp10GIbjdfy75JoYIfCU6lm7XwDy', 'Melissa.Oliveira@escola.com.br', 'aluno', 'Melissa Oliveira', '2025-09-11 19:11:11', '/uploads/aluno160.jpg', NULL),
(168, 'MAT1161', '$2b$10$yom21Ykek51T6dLVPbxQuuEq0kxAU9lAc9ffHcZM.GnEXg1/ghBa6', 'Sr.Igor12@escola.com.br', 'aluno', 'Sr. Ígor Santos', '2025-09-11 19:11:11', NULL, NULL),
(169, 'MAT1162', '$2b$10$3RPUTyDjwW1vG1h9SXsmG.Smjguk8hvZFL2iN00t2JLn9IcehjUzK', 'Joao.Lucas25@escola.com.br', 'aluno', 'João Lucas Albuquerque Jr.', '2025-09-11 19:11:12', NULL, NULL),
(170, 'MAT1163', '$2b$10$RvSIp2YwMROSvplxMQ0LFuXzkwDpTZYlIsNk.06mnndcQJeMJKoWi', 'Pablo.Silva91@escola.com.br', 'aluno', 'Pablo Silva', '2025-09-11 19:11:12', NULL, NULL),
(171, 'MAT1164', '$2b$10$YUv3j17.SHFmXDds0/AnP.gx1WDCxfAUJgUX3AMbu7odZNcwF5N7W', 'Rafael_Silva@escola.com.br', 'aluno', 'Rafael Silva', '2025-09-11 19:11:12', '/uploads/aluno164.jpg', NULL),
(172, 'MAT1165', '$2b$10$l.ulJ/MEr3ovSEBTf30oMe4vNv/.z.ArNQoJJtpe6E9pJIHuOO75u', 'Roberto.Xavier@escola.com.br', 'aluno', 'Roberto Xavier', '2025-09-11 19:11:12', NULL, NULL),
(173, 'MAT1166', '$2b$10$xoW0f32vDZdaXfbQ.PHwGOB0pgnj8zPmtS5jw1WHqSP6AWjrewMiO', 'Karla.Carvalho@escola.com.br', 'aluno', 'Karla Carvalho', '2025-09-11 19:11:12', NULL, NULL),
(174, 'MAT1167', '$2b$10$Lj.pRxd1Ms1judI3iCNhS.0tqUzHO6FAll5S2.Y7RinlbNQtK3LDe', 'Maria_Cecilia93@escola.com.br', 'aluno', 'Maria Cecília Oliveira Filho', '2025-09-11 19:11:12', NULL, NULL),
(175, 'MAT1168', '$2b$10$Mj4I1Q4RB4RTR9TL4Nob.eZI791ftKi8HTJ7irJZXJV7mWXMNf.8m', 'Isabel_Reis@escola.com.br', 'aluno', 'Isabel Reis', '2025-09-11 19:11:12', '/uploads/aluno168.jpg', NULL),
(176, 'MAT1169', '$2b$10$c5sozpQ2g8kVS6QTeyoJKOioGPScXs1ActUzUcIl8AuPCh.Yy0KMe', 'Marli.Saraiva45@escola.com.br', 'aluno', 'Marli Saraiva', '2025-09-11 19:11:13', NULL, NULL),
(177, 'MAT1170', '$2b$10$G0RjCTkVDXf2oRFWMDF.W.5mX6kVBPPMaU8QnrKWt66Hapr4KDQqe', 'Isis_Albuquerque91@escola.com.br', 'aluno', 'Isis Albuquerque', '2025-09-11 19:11:13', NULL, NULL),
(178, 'MAT1171', '$2b$10$eZEKLuQDog6vqQi5GoUzeeJMZ0qWPHTay3jkLTCODZP6Eizb07L0O', 'Celia.Albuquerque22@escola.com.br', 'aluno', 'Célia Albuquerque Jr.', '2025-09-11 19:11:13', NULL, NULL),
(179, 'MAT1172', '$2b$10$nIf/nxxKxZw3fNyV8h1/BuY3sOSB4mqk9Dg/kyUkrNioYWRiEn0BC', 'Helena_Carvalho@escola.com.br', 'aluno', 'Helena Carvalho', '2025-09-11 19:11:13', '/uploads/aluno172.jpg', NULL),
(180, 'MAT1173', '$2b$10$yHwQ/t2J6eFIar1Irk/YUegZsPD3HYCEpkMUx9iuyQixqhHLR8AKW', 'Rebeca.Xavier@escola.com.br', 'aluno', 'Rebeca Xavier', '2025-09-11 19:11:13', NULL, NULL),
(181, 'MAT1174', '$2b$10$3AeOVMZ.9hxrgCcoVCA8QOgtmOdfeOtFXBwExboWSZz0hwhBrsUIK', 'Marcos.Braga@escola.com.br', 'aluno', 'Marcos Braga', '2025-09-11 19:11:13', NULL, NULL),
(182, 'MAT1175', '$2b$10$z79.MYt73rqt68PGFxfcxe5rqZ.lcqDKz/rvaNhesrXBUg1yT2nGy', 'Salvador_Pereira@escola.com.br', 'aluno', 'Salvador Pereira', '2025-09-11 19:11:13', NULL, NULL),
(183, 'MAT1176', '$2b$10$MWBIR7P.cmS2cYVPS6OIju8mg47gjH/cJFb1wX95do.Rm5Rvjbx1S', 'Henrique.Martins@escola.com.br', 'aluno', 'Henrique Martins', '2025-09-11 19:11:14', '/uploads/aluno176.jpg', NULL),
(184, 'MAT1177', '$2b$10$1YYpTWR6yj5D.rNtZ7KM4eVNLgDtsojSbko/4nIserpIV6fxaUjaO', 'Liz_Martins@escola.com.br', 'aluno', 'Liz Martins', '2025-09-11 19:11:14', NULL, NULL),
(185, 'MAT1178', '$2b$10$vTU22vAmjuHe4pgzJ5iZmOyt31KFMPXVdKjvXpr4yO4nAJtidsZm6', 'Sirineu.Costa61@escola.com.br', 'aluno', 'Sirineu Costa', '2025-09-11 19:11:14', NULL, NULL),
(186, 'MAT1179', '$2b$10$tJMiAGMrNk81l7HQ9aSnnulxDbQUT1m.l873nnqDcTbr9vvwnGn7C', 'Sirineu.Barros7@escola.com.br', 'aluno', 'Sirineu Barros', '2025-09-11 19:11:14', NULL, NULL),
(187, 'MAT1180', '$2b$10$wZF6UzCIv6h46VHkhNZn2ePAVhs/x.TW9dKRV6dpxKm7AJSk43CdK', 'Maria.Julia@escola.com.br', 'aluno', 'Maria Júlia Nogueira', '2025-09-11 19:11:14', '/uploads/aluno180.jpg', NULL),
(188, 'MAT1181', '$2b$10$iaTvuHYTo4lAGzxg757NSOmV3UkIJcK11kxJshXHXdNsypW9VK/5O', 'Dr.Paulo@escola.com.br', 'aluno', 'Dr. Paulo Silva', '2025-09-11 19:11:14', NULL, NULL),
(189, 'MAT1182', '$2b$10$Prj80ABStKf/f2M7qp98pOUtSTjTsOJ91yvefQk71JtnlVXlpVQtq', 'Ana_Laura77@escola.com.br', 'aluno', 'Ana Laura Franco Jr.', '2025-09-11 19:11:15', NULL, NULL),
(190, 'MAT1183', '$2b$10$B.dnzJi7DXn0Y0nVrYmUs.yDcmF.f0NmiwYB2XnVV9ARJJbCu29O6', 'Maria_Alice@escola.com.br', 'aluno', 'Maria Alice Martins', '2025-09-11 19:11:15', NULL, NULL),
(191, 'MAT1184', '$2b$10$Ll6Rl2AAPa/1dm0taeObc.YrttsP7hEhgKS0rqvIg5I7AKD/IkuoS', 'Frederico.Costa@escola.com.br', 'aluno', 'Frederico Costa', '2025-09-11 19:11:15', '/uploads/aluno184.jpg', NULL),
(192, 'MAT1185', '$2b$10$4QO2TCtw0t2hETPdXAn.O.M/pbgaVr65umRQHY10zytVVEnsY5ab.', 'Maria_Alice@escola.com.br', 'aluno', 'Maria Alice Xavier', '2025-09-11 19:11:15', NULL, NULL),
(193, 'MAT1186', '$2b$10$RnGiPj2jkr/znxKhN9gfNe/GgJnWL0F7WdC.mBUmtQIhBdmqrNXLe', 'Melissa_Saraiva81@escola.com.br', 'aluno', 'Melissa Saraiva Jr.', '2025-09-11 19:11:15', NULL, NULL),
(194, 'MAT1187', '$2b$10$M/B1bTOwRmzHozXRT2TjzuOHIgBellJ0A6zHvNO8sjtjnut7z4QSS', 'Yago_Oliveira@escola.com.br', 'aluno', 'Yago Oliveira', '2025-09-11 19:11:15', NULL, NULL),
(195, 'MAT1188', '$2b$10$wgxWjILnRqNQ4KjeYfkn6.qtXd6yV7MUhvbCmNuYxamegGI8QMcLK', 'Isis.Costa@escola.com.br', 'aluno', 'Isis Costa', '2025-09-11 19:11:15', '/uploads/aluno188.jpg', NULL),
(196, 'MAT1189', '$2b$10$J2C9w86mxrKBXVHizs5v/OffswlP43KQXmYRfRZd08JKaA0zXlPuC', 'Sr.Enzo@escola.com.br', 'aluno', 'Sr. Enzo Silva', '2025-09-11 19:11:16', NULL, NULL),
(197, 'MAT1190', '$2b$10$13trLZR1Zl/8KJI9x4DvM.ElZH35m85ptBkxGzrhqjwp8JG9SUKP6', 'Hugo.Barros22@escola.com.br', 'aluno', 'Hugo Barros Filho', '2025-09-11 19:11:16', NULL, NULL),
(198, 'MAT1191', '$2b$10$KJaFUuUcNX4JyNs0uH675eUDnTcSsWhTppW4iwUdXjm62CokP08H2', 'Helena_Franco@escola.com.br', 'aluno', 'Helena Franco', '2025-09-11 19:11:16', NULL, NULL),
(199, 'MAT1192', '$2b$10$HmQfaSWucZghxAZGRMvkH.sAGaIKrYgV3QT.lAY5v/hYl2pHm2yCe', 'Fabricio_Macedo@escola.com.br', 'aluno', 'Fabrício Macedo', '2025-09-11 19:11:16', '/uploads/aluno192.jpg', NULL),
(200, 'MAT1193', '$2b$10$ij9H6oNE8Yh9Hzl0FxqL4OooyTb7MNN/NGFmQxMrJU/bG/ByUkRqa', 'Miguel_Batista@escola.com.br', 'aluno', 'Miguel Batista', '2025-09-11 19:11:16', NULL, NULL),
(201, 'MAT1194', '$2b$10$Q1G1wax1j3QyV6dtuRbm2Owpt5ErD8G.JYs9vzNRtFexYPRcr46b6', 'Livia_Albuquerque@escola.com.br', 'aluno', 'Lívia Albuquerque', '2025-09-11 19:11:16', NULL, NULL),
(202, 'MAT1195', '$2b$10$OCatgY2M6QMuj9MWZfa2keBUhCvRwYxMIX6ev7EGGu2WJ93Xp15V6', 'Raul.Santos@escola.com.br', 'aluno', 'Raul Santos', '2025-09-11 19:11:16', NULL, NULL),
(203, 'MAT1196', '$2b$10$h03rrbbJaaLB4vDxKDCYpeAwYt3JS6zBaIMInHjlNKl.mQpKzzFt2', 'Helio_Braga@escola.com.br', 'aluno', 'Hélio Braga', '2025-09-11 19:11:17', '/uploads/aluno196.jpg', NULL),
(204, 'MAT1197', '$2b$10$abkfx0QDWHWB4uASwOp.X.qKuEs0P/vFubNNWjv0Ms4jn8mfAMZqu', 'Gabriel_Carvalho@escola.com.br', 'aluno', 'Gabriel Carvalho Jr.', '2025-09-11 19:11:17', NULL, NULL),
(205, 'MAT1198', '$2b$10$2.3mtjD6Z7bkWE5p3nwgFOZBO8cm0nTHg3R/7bsUQsjy5uI5OGUpS', 'Sr._Enzo@escola.com.br', 'aluno', 'Sr. Enzo Braga', '2025-09-11 19:11:17', NULL, NULL),
(206, 'MAT1199', '$2b$10$2SRZgiTobUcQRzpfnjXAKuZF53thVQruGahp0ygUAzB.Gebcm8Ll6', 'Bruna.Santos14@escola.com.br', 'aluno', 'Bruna Santos', '2025-09-11 19:11:17', NULL, NULL),
(207, 'MAT1200', '$2b$10$iLpMZ3conFjkC/anXj2co.XyP8GXMMQwi3Le4F580he8CiSXTBN5O', 'Srta._Maite@escola.com.br', 'aluno', 'Srta. Maitê Melo', '2025-09-11 19:11:17', '/uploads/aluno200.jpg', NULL),
(208, 'MAT1201', '$2b$10$mgapZ1.U9h5iRRlnFaiewuLJgssJ5UnUJg6gj8rVV1cPE/VZSZqc2', 'Lavinia_Moreira@escola.com.br', 'aluno', 'Lavínia Moreira', '2025-09-11 19:11:17', NULL, NULL),
(209, 'MAT1202', '$2b$10$0qtmzZ.ZD6QCaDuKSv01cuVkC6e2ZNLjDZvr9/CUEiw2GhfkEkX4y', 'Arthur_Martins@escola.com.br', 'aluno', 'Arthur Martins', '2025-09-11 19:11:17', NULL, NULL),
(210, 'MAT1203', '$2b$10$PFY/Yb937WoCahJsb4VdIuTQ6wLGwex1OUYiXHW.V5/BqDMVpw572', 'Vitoria.Silva37@escola.com.br', 'aluno', 'Vitória Silva Filho', '2025-09-11 19:11:18', NULL, NULL),
(211, 'MAT1204', '$2b$10$2sxn9MC.5qhJuW0iQtattux5UruJ3YEHo93ULj8l9Sa9Tvp8/8moG', 'Benjamin.Albuquerque72@escola.com.br', 'aluno', 'Benjamin Albuquerque', '2025-09-11 19:11:18', '/uploads/aluno204.jpg', NULL),
(212, 'MAT1205', '$2b$10$B..0NhQMzgqICcAbLzA8jeQ/0J65kt36Vwz.aKN349X8n64i1p8cy', 'Noah.Macedo@escola.com.br', 'aluno', 'Noah Macedo', '2025-09-11 19:11:18', NULL, NULL),
(213, 'MAT1206', '$2b$10$CRzHkQnMNOL6PlDB.1uDw.1HEB9J/aThN6bu2qa/tuP0dAlYfbrKO', 'Alexandre.Franco55@escola.com.br', 'aluno', 'Alexandre Franco', '2025-09-11 19:11:18', NULL, NULL),
(214, 'MAT1207', '$2b$10$RW3Oa5NNvDc146t8d2NpU.Af9fKVmBt84gSmtj6.z8rgNcHxdqziq', 'Julio.Cesar@escola.com.br', 'aluno', 'Júlio César Melo', '2025-09-11 19:11:18', NULL, NULL),
(215, 'MAT1208', '$2b$10$rGwVZZz9zSw9Gl/rHJ/uFOtm.7TL7Yf4K/mlAQwIOUA4HCP7VzPs.', 'Lavinia_Melo@escola.com.br', 'aluno', 'Lavínia Melo', '2025-09-11 19:11:18', '/uploads/aluno208.jpg', NULL),
(216, 'MAT1209', '$2b$10$tzNuNsP7mvA8Mpy0Ma8aauTh3ru4OhC8dPNphrSAjRaJiHRjBpuoa', 'Julio.Carvalho53@escola.com.br', 'aluno', 'Júlio Carvalho', '2025-09-11 19:11:19', NULL, NULL),
(217, 'MAT1210', '$2b$10$4j.DifZ7WqaT/hWqlhZ5i.NQevgBxIML26H37VQdBwLy4ME8ESxvi', 'Roberto_Melo@escola.com.br', 'aluno', 'Roberto Melo', '2025-09-11 19:11:19', NULL, NULL),
(218, 'MAT1211', '$2b$10$hp8kUDjzs.8RWfSgrLFpeesgEMoRQ6E0Muh8xlfPOhnhTHR/NKjzO', 'Feliciano_Franco@escola.com.br', 'aluno', 'Feliciano Franco Neto', '2025-09-11 19:11:19', NULL, NULL),
(219, 'MAT1212', '$2b$10$UHFPFiC5Ghz9k9V27RrcOuQBr55uRXXQu1HULftD1qXeOMrA/VECK', 'Sarah.Moreira14@escola.com.br', 'aluno', 'Sarah Moreira', '2025-09-11 19:11:19', '/uploads/aluno212.jpg', NULL),
(220, 'MAT1213', '$2b$10$vleRxOdcQKrf55lvcuo8x.Fes.N9L3nu64UA5QgIizyv7NCfaGUkS', 'Maite_Oliveira@escola.com.br', 'aluno', 'Maitê Oliveira', '2025-09-11 19:11:19', NULL, NULL),
(221, 'MAT1214', '$2b$10$6AIQCc574QZLZUwcAzEk.u8Tkhmo6ikFOFofOM.avjGcG8PhUrSPi', 'Fabricio_Nogueira44@escola.com.br', 'aluno', 'Fabrício Nogueira', '2025-09-11 19:11:19', NULL, NULL),
(222, 'MAT1215', '$2b$10$XHcgegXtCPbUFdODcV8Tne8x4vIkK1FYz0ToyZ8J81YxoiB8lQyDC', 'Larissa_Souza@escola.com.br', 'aluno', 'Larissa Souza Jr.', '2025-09-11 19:11:19', NULL, NULL),
(223, 'MAT1216', '$2b$10$fhQKjuKkecF/Ej34OKS7y.UwH/R/EhMWW2awdGzGynn/qNJ8KDla6', 'Leonardo.Santos55@escola.com.br', 'aluno', 'Leonardo Santos', '2025-09-11 19:11:20', '/uploads/aluno216.jpg', NULL),
(224, 'MAT1217', '$2b$10$npCW3s0BU/dHoMqzO5C9WO8tbN/UsgasUhGRVu3XcoZYReYWBfbK.', 'Antonella.Xavier@escola.com.br', 'aluno', 'Antonella Xavier', '2025-09-11 19:11:20', NULL, NULL),
(225, 'MAT1218', '$2b$10$QluNGMR7MCnAVyzif4Lcmei6vMUpe0UirSk2saTO1CraJN38j2FuC', 'Antonio_Batista@escola.com.br', 'aluno', 'Antônio Batista', '2025-09-11 19:11:20', NULL, NULL),
(226, 'MAT1219', '$2b$10$6DImxq1uWAgZU3HXgc2./esQ/A6gqDhUqnMUG1CVNial6fhbl6v9O', 'Yuri.Melo@escola.com.br', 'aluno', 'Yuri Melo', '2025-09-11 19:11:20', NULL, NULL),
(227, 'MAT1220', '$2b$10$f1gf4l0E3NT/G5OmS7StPu/jiSvLqtJyt8D6UHWOWYH9p6Ro29GZu', 'Enzo_Gabriel@escola.com.br', 'aluno', 'Enzo Gabriel Souza', '2025-09-11 19:11:20', '/uploads/aluno220.jpg', NULL),
(228, 'MAT1221', '$2b$10$UYG4H9g3nm8r3P/1UjXXJe21zGBsWox/uP4Hr.EMhOJDR5w9Yj69C', 'Marina.Silva@escola.com.br', 'aluno', 'Marina Silva', '2025-09-11 19:11:20', NULL, NULL),
(229, 'MAT1222', '$2b$10$yJ347mEg.hTV.etthyOaaeWYcaCW5huXsRhHV/NmjNxWMb99WmFES', 'Pedro.Henrique@escola.com.br', 'aluno', 'Pedro Henrique Barros', '2025-09-11 19:11:20', NULL, NULL),
(230, 'MAT1223', '$2b$10$nppCuNSskgxgqx6xKk5aUuI85MDlx8vW0x7Z/WfBZWl3SF2q5yw6y', 'Noah_Moraes69@escola.com.br', 'aluno', 'Noah Moraes', '2025-09-11 19:11:21', NULL, NULL),
(231, 'MAT1224', '$2b$10$qtaELOPBsEMbyWrKUouc.uowhglK4hQZosBuCY1dAyKZNMhUcPOzi', 'Isabela.Silva@escola.com.br', 'aluno', 'Isabela Silva', '2025-09-11 19:11:21', '/uploads/aluno224.jpg', NULL),
(232, 'MAT1225', '$2b$10$nMEc3XI56Rjm9SxpKFyvJOnR.6QYD8Wd6jhjjw8K9ZGlDjXGxRiR6', 'Miguel.Xavier65@escola.com.br', 'aluno', 'Miguel Xavier', '2025-09-11 19:11:21', NULL, NULL),
(233, 'MAT1226', '$2b$10$EOBYn6YHWs4AdXQaa9A6COoTeK1mwogJzast7r9WUWF0Brgv2dyRS', 'Carlos.Franco90@escola.com.br', 'aluno', 'Carlos Franco', '2025-09-11 19:11:21', NULL, NULL),
(234, 'MAT1227', '$2b$10$FuD6K9xgS6MOxM9SYjsMe.v6/ZodaSXXeRhI5o.GpiuAd76kSQC1S', 'Cecilia_Batista@escola.com.br', 'aluno', 'Cecília Batista', '2025-09-11 19:11:21', NULL, NULL),
(235, 'MAT1228', '$2b$10$Ky3GKXRLt5mooKDPFlB.te95eKtEr2x56EQlxwuukhgAMducJnOsO', 'Sra.Marcia@escola.com.br', 'aluno', 'Sra. Márcia Pereira', '2025-09-11 19:11:21', '/uploads/aluno228.jpg', NULL),
(236, 'MAT1229', '$2b$10$ZVUi8o.4HsO18YbFy3/MFeBR3r8MxJEpdh00YP7D4uLSls5uQcgX2', 'Srta._Dalila@escola.com.br', 'aluno', 'Srta. Dalila Albuquerque', '2025-09-11 19:11:21', NULL, NULL),
(237, 'MAT1230', '$2b$10$KnFXKK6kH9MEiBb3A99.DefTwTpWS9fZZM.U22yRsi.OKQui5F4gm', 'Eloa.Reis78@escola.com.br', 'aluno', 'Eloá Reis', '2025-09-11 19:11:22', NULL, NULL),
(238, 'MAT1231', '$2b$10$L6KBOAQe/uAu0cBS6kpDDe6ADc9OiM6leINAsbGeBVmOxGy9fU31u', 'Fabricio.Melo36@escola.com.br', 'aluno', 'Fabrício Melo', '2025-09-11 19:11:22', NULL, NULL),
(239, 'MAT1232', '$2b$10$9Ej8xJnJYPnm/SgwWDoPJuUj01Saw83wlwto5CIOE.aotmWmM38iW', 'Maria_Braga@escola.com.br', 'aluno', 'Maria Braga', '2025-09-11 19:11:22', '/uploads/aluno232.jpg', NULL),
(240, 'MAT1233', '$2b$10$NDUoew9lkeijNwE6BDAMzuaZcvPpKJW/7sbTyy.1XZVy.2AbaxAG2', 'Davi_Lucca8@escola.com.br', 'aluno', 'Davi Lucca Xavier', '2025-09-11 19:11:22', NULL, NULL),
(241, 'MAT1234', '$2b$10$qoewh9geKKrs.8qdtkECOON6S1.gSbwL4azpAVnxDkraTRKHKVoDO', 'Silvia.Carvalho12@escola.com.br', 'aluno', 'Sílvia Carvalho', '2025-09-11 19:11:22', NULL, NULL),
(242, 'MAT1235', '$2b$10$X26/Ozy/XcxHTIuy1yxrs.eTTTw5bKMku2Iy65nbqRzCoGEUvd2hG', 'Maria.Barros@escola.com.br', 'aluno', 'Maria Barros', '2025-09-11 19:11:22', NULL, NULL),
(243, 'MAT1236', '$2b$10$/2zvcNi/iI9zd53Om2Xr9en8lALicRvKhnMgs61xi53VG9TBkDBXG', 'Dr.Caua@escola.com.br', 'aluno', 'Dr. Cauã Braga', '2025-09-11 19:11:23', '/uploads/aluno236.jpg', NULL),
(244, 'MAT1237', '$2b$10$1kV5I.mZMa5oAkn.QOgc7eeQdWUGDzeNPAa0iJKrLuL2qfJDhN0Se', 'Morgana_Pereira@escola.com.br', 'aluno', 'Morgana Pereira', '2025-09-11 19:11:23', NULL, NULL),
(245, 'MAT1238', '$2b$10$4T.uwhZkKnPw/pyu6BgMkuLTAf/gxnf.YDrVguFigCcZV7kQUqhzW', 'Maria.Helena93@escola.com.br', 'aluno', 'Maria Helena Barros Jr.', '2025-09-11 19:11:23', NULL, NULL),
(246, 'MAT1239', '$2b$10$SDnuFt8HDxHqgTloLM2zyeo7ww5jmaM983WbzWrh9pScbY.DIM5ea', 'Davi.Souza@escola.com.br', 'aluno', 'Davi Souza Jr.', '2025-09-11 19:11:23', NULL, NULL),
(247, 'MAT1240', '$2b$10$uyg2VRR1xlR9xWcXV2e9Gu9UOaAAhRvSdQgmL7fxk8q8LKCcuPDhm', 'Maria.Julia28@escola.com.br', 'aluno', 'Maria Júlia Braga', '2025-09-11 19:11:23', '/uploads/aluno240.jpg', NULL),
(248, 'MAT1241', '$2b$10$4tUhFdsCndjZ2TTLHGoZa.nR3vSzleclrZ33h7nqyIOdOuohRDDhi', 'Roberto.Silva@escola.com.br', 'aluno', 'Roberto Silva', '2025-09-11 19:11:23', NULL, NULL),
(249, 'MAT1242', '$2b$10$JYEEoFFeHv7cAUaUrhBOOO6AJPpA6Pu8XiRsDARzoN.9pTIltBCTO', 'Isabela_Franco@escola.com.br', 'aluno', 'Isabela Franco Jr.', '2025-09-11 19:11:23', NULL, NULL),
(250, 'MAT1243', '$2b$10$iwLUzlj2YrH3cjl2VZIadO3Y9ULOUH6725g/GTSF5YXfeYoUT56G.', 'Heitor_Silva28@escola.com.br', 'aluno', 'Heitor Silva', '2025-09-11 19:11:24', NULL, NULL),
(251, 'MAT1244', '$2b$10$B8VJyWLbD6KS5xRM.gMQB./TfbDvm0aSvgklODEVPeiNDMnzhQ9Ry', 'Paulo.Saraiva55@escola.com.br', 'aluno', 'Paulo Saraiva', '2025-09-11 19:11:24', '/uploads/aluno244.jpg', NULL),
(252, 'MAT1245', '$2b$10$ghf.WlN7cXN.r1gtNib5seCvR3dO3O/MmhEZIWLEjGX4zHtKiLhbK', 'Enzo.Barros24@escola.com.br', 'aluno', 'Enzo Barros', '2025-09-11 19:11:24', NULL, NULL),
(253, 'MAT1246', '$2b$10$nWglhPCscjFxTBjsTFMn5uubVK3RcJKjhKI8tz5M4Xk8quDHZ4jkG', 'Anthony_Silva42@escola.com.br', 'aluno', 'Anthony Silva Neto', '2025-09-11 19:11:24', NULL, NULL),
(254, 'MAT1247', '$2b$10$2w08qaak6C2/OHdcHS65RuDqopNQ.QenT0iYosxaeBZ9VqtLvV.ay', 'Emanuelly_Moreira@escola.com.br', 'aluno', 'Emanuelly Moreira', '2025-09-11 19:11:24', NULL, NULL),
(255, 'MAT1248', '$2b$10$eQrWryqhRPVMWDNKoTwM1eSpUnsQoDIjCiqqHXBXCIJcHAKTrEHOy', 'Norberto_Costa@escola.com.br', 'aluno', 'Norberto Costa', '2025-09-11 19:11:24', '/uploads/aluno248.jpg', NULL),
(256, 'MAT1249', '$2b$10$KobiX7DnJfQRWMe.UqYOe.V0nXfGbInwXnUHHj.gMt/K9lINWrGEC', 'Joao.Miguel@escola.com.br', 'aluno', 'João Miguel Xavier', '2025-09-11 19:11:24', NULL, NULL),
(257, 'MAT1250', '$2b$10$6XGi7y/SPQp0lBGSXC1zfe0t8jEVfqWt7N5ML5fAefBJCVKoV5TXq', 'Dr._Deneval81@escola.com.br', 'aluno', 'Dr. Deneval Santos', '2025-09-11 19:11:25', NULL, NULL),
(258, 'MAT1251', '$2b$10$jYUTMCIEcH/KAI4q1b0R8eJyGMnSyKGXUGAyPtvwSxmZzPnVyjM7y', 'Maria.Clara73@escola.com.br', 'aluno', 'Maria Clara Franco', '2025-09-11 19:11:25', NULL, NULL),
(259, 'MAT1252', '$2b$10$nYC/oiBjJtAe9fiaq/Hf9ufng/8aWTbOzvkiqZ0l/85r6CpLy8XEq', 'Melissa.Moreira@escola.com.br', 'aluno', 'Melissa Moreira', '2025-09-11 19:11:25', '/uploads/aluno252.jpg', NULL),
(260, 'MAT1253', '$2b$10$4GQy.Elsb/pe8U8nGO9kcushnXxPgcd6OEkYB/KvmqWgFX.MBA9US', 'Dr._Joao18@escola.com.br', 'aluno', 'Dr. João Moraes', '2025-09-11 19:11:25', NULL, NULL),
(261, 'MAT1254', '$2b$10$xx4VPKAd8u0NxJs3N6EXo.q.hus0/DvPtSuD2VnP/usfcO5hnP85u', 'Marcelo_Braga@escola.com.br', 'aluno', 'Marcelo Braga', '2025-09-11 19:11:25', NULL, NULL),
(262, 'MAT1255', '$2b$10$hQY5aLFVDKJNLPV9rjT87.KhYraCjqqkqdkHvkLRbyN7Gnot2Iiqi', 'Isabella.Souza35@escola.com.br', 'aluno', 'Isabella Souza', '2025-09-11 19:11:25', NULL, NULL),
(263, 'MAT1256', '$2b$10$ySgI6HKDuoPJ5uqLgLugE.ygwrOtJPvE27BIIqXnd13k04mLy4F4m', 'Julia.Santos@escola.com.br', 'aluno', 'Júlia Santos Jr.', '2025-09-11 19:11:25', '/uploads/aluno256.jpg', NULL),
(264, 'MAT1257', '$2b$10$LHpA4lnyx/.SJ3dyiXE0kOwJeO.42Dnd7GGKAIQfd8iTER5XX98WC', 'Laura_Nogueira@escola.com.br', 'aluno', 'Laura Nogueira', '2025-09-11 19:11:26', NULL, NULL),
(265, 'MAT1258', '$2b$10$8ebw9AK0VJBhONIqQfCIRukQk8MU7sLyuRLmPIXgO8.1MxqTRpFTC', 'Joao.Miguel@escola.com.br', 'aluno', 'João Miguel Carvalho', '2025-09-11 19:11:26', NULL, NULL),
(266, 'MAT1259', '$2b$10$lNmroiCECuQbnPBpQxpId.srTU.o6zPBoWH.gUyE.Tc3dzIc7D7UO', 'Cesar.Xavier14@escola.com.br', 'aluno', 'César Xavier', '2025-09-11 19:11:26', NULL, NULL),
(267, 'MAT1260', '$2b$10$HJgs3sJu3ozwSaU0lzp1..Q948fI9U51TZsORm4z/hBMHHvtM5u.e', 'Marcelo.Melo@escola.com.br', 'aluno', 'Marcelo Melo', '2025-09-11 19:11:26', '/uploads/aluno260.jpg', NULL),
(268, 'MAT1261', '$2b$10$eTSjVlaBdSbwu1WbJKkZS.Dz9tySXdbapA72mCeOijZT0vImoy3ey', 'Rafaela_Reis39@escola.com.br', 'aluno', 'Rafaela Reis', '2025-09-11 19:11:26', NULL, NULL),
(269, 'MAT1262', '$2b$10$I9OtzImGrjarXHbzE5YT1.FxU2Y1g3peHBW44zOnY1otUKbz5BIfa', 'Isaac_Melo@escola.com.br', 'aluno', 'Isaac Melo', '2025-09-11 19:11:26', NULL, NULL),
(270, 'MAT1263', '$2b$10$otjGrsboDAjL40YkEO2o8OzVDQFgb/6gLlskWleYkRwacUJblY3Wy', 'Sr.Raul@escola.com.br', 'aluno', 'Sr. Raul Costa', '2025-09-11 19:11:26', NULL, NULL),
(271, 'MAT1264', '$2b$10$u8TYcS3VBJcxXfh4Z04h7uhTJnXn61HS/qEy.Lx7qpR39jzYfrG4C', 'Alicia_Nogueira@escola.com.br', 'aluno', 'Alícia Nogueira', '2025-09-11 19:11:27', '/uploads/aluno264.jpg', NULL),
(272, 'MAT1265', '$2b$10$cpeaz2r/2/buJeSgLNoRE.k/BXKxp790M9dNeCGkJJoNGT3A7bzpe', 'Celia_Silva64@escola.com.br', 'aluno', 'Célia Silva', '2025-09-11 19:11:27', NULL, NULL),
(273, 'MAT1266', '$2b$10$2mjWnMIq1f8ht371XIfR9ODxuayQAag.YrjCZW8tLwFEXbyJ/1iN.', 'Silas.Martins@escola.com.br', 'aluno', 'Silas Martins', '2025-09-11 19:11:27', NULL, NULL),
(274, 'MAT1267', '$2b$10$8jOPe67HEh95vjFQ.Ef8Q.Dv/alWb/3wjt7Mi32Q4sswjP.sumtEi', 'Sophia.Nogueira34@escola.com.br', 'aluno', 'Sophia Nogueira', '2025-09-11 19:11:27', NULL, NULL),
(275, 'MAT1268', '$2b$10$NGA5a1vdQBnmOj0L4UjbOu1UKarJrv6OCXgiT1aS/GgsgpSnZzKii', 'Maria.Luiza@escola.com.br', 'aluno', 'Maria Luiza Souza', '2025-09-11 19:11:27', '/uploads/aluno268.jpg', NULL),
(276, 'MAT1269', '$2b$10$ZORuEVSqdaQge3ULNX0CD.Ogm7JSsZN.t.aRIWDw2VoiaN8fys.ui', 'Antonella_Braga@escola.com.br', 'aluno', 'Antonella Braga', '2025-09-11 19:11:27', NULL, NULL),
(277, 'MAT1270', '$2b$10$xZlraK2anNtexOxdl7FfN.CEL.Vox9b1hPffzGHJlCa9eS/OKNuXW', 'Srta.Julia@escola.com.br', 'aluno', 'Srta. Júlia Saraiva', '2025-09-11 19:11:28', NULL, NULL),
(278, 'MAT1271', '$2b$10$C6S9a/l7Lr9kRzopNjf5bukRvSkeLQO8breDhikq/7yoK9qmanVhu', 'Joao.Pedro@escola.com.br', 'aluno', 'João Pedro Oliveira', '2025-09-11 19:11:28', NULL, NULL),
(279, 'MAT1272', '$2b$10$2goiiUb.LCZEWJVPcZ2ZNefk9ZkZqu1R3aKkt6ZINZF.UWEWkMy/6', 'Guilherme_Moraes62@escola.com.br', 'aluno', 'Guilherme Moraes', '2025-09-11 19:11:28', '/uploads/aluno272.jpg', NULL),
(280, 'MAT1273', '$2b$10$m3oV64D6xaLmCBp8psBWEuINGdRWVWopypmpDjeycQBO9JvUdneZ.', 'Esther_Albuquerque85@escola.com.br', 'aluno', 'Esther Albuquerque', '2025-09-11 19:11:28', NULL, NULL);
INSERT INTO `users` (`id`, `login`, `senha`, `email`, `role`, `nome`, `created_at`, `foto_url`, `last_seen`) VALUES
(281, 'MAT1274', '$2b$10$ebrrXTJBDanIX9wc72huQuw6qxGiG8Mb2dQ08AlMDiR3qT/0UM7LK', 'Felix_Batista71@escola.com.br', 'aluno', 'Félix Batista', '2025-09-11 19:11:28', NULL, NULL),
(282, 'MAT1275', '$2b$10$CyPUQ9Ve6roZoUH1edLzl.XWszvadB9V6wOfXC/hjAX0cFnoAXdz2', 'Maria.Cecilia19@escola.com.br', 'aluno', 'Maria Cecília Batista Filho', '2025-09-11 19:11:28', NULL, NULL),
(283, 'MAT1276', '$2b$10$iwesk0gWVOOWAGcM5Cn7DeCBYmyZ9QI624IIL7toqOnHDth4S11fe', 'Sr.Paulo@escola.com.br', 'aluno', 'Sr. Paulo Pereira', '2025-09-11 19:11:28', '/uploads/aluno276.jpg', NULL),
(284, 'MAT1277', '$2b$10$4OJyQJuK06IUFupcA8OLUON0MeUmUiKRNS.nEnOrDojSPKX6i/1MS', 'Lorenzo.Costa7@escola.com.br', 'aluno', 'Lorenzo Costa', '2025-09-11 19:11:29', NULL, NULL),
(285, 'MAT1278', '$2b$10$rJU.U3R2FYH/j1Y67P.MyuMGoBkcArFTBXS5KlJrcCo77R7szgNC2', 'Maria_Cecilia27@escola.com.br', 'aluno', 'Maria Cecília Moraes Jr.', '2025-09-11 19:11:29', NULL, NULL),
(286, 'MAT1279', '$2b$10$veWS7GXPQ4G/.s73fJ6EM.eKzhfLypdiz2/lZwTwwpd57dDP9sSrq', 'Natalia.Oliveira@escola.com.br', 'aluno', 'Natália Oliveira', '2025-09-11 19:11:29', NULL, NULL),
(287, 'MAT1280', '$2b$10$Fkc0zY6VtDBuR9lCEukzaeAZmv9pCVKESBxzygMorGbob1OjBx4cW', 'Morgana.Silva@escola.com.br', 'aluno', 'Morgana Silva Neto', '2025-09-11 19:11:29', '/uploads/aluno280.jpg', NULL),
(288, 'MAT1281', '$2b$10$BSVgzV4jneoZXocM45OIS.AjC8yAfhrxmjqyY4ULOHySNPuuTTLHW', 'Washington_Reis@escola.com.br', 'aluno', 'Washington Reis', '2025-09-11 19:11:29', NULL, NULL),
(289, 'MAT1282', '$2b$10$jZeK.tcVBpgIPQ9PAFvWpeH127moYMXaf47LObcUoRraPJ1glZTaq', 'Janaina_Xavier38@escola.com.br', 'aluno', 'Janaína Xavier', '2025-09-11 19:11:29', NULL, NULL),
(290, 'MAT1283', '$2b$10$4F4CQ57AyI4Tarnw56M1/uIAowvV.qOErUsFgifh597pDilLN7/Bm', 'Danilo_Costa@escola.com.br', 'aluno', 'Danilo Costa', '2025-09-11 19:11:29', NULL, NULL),
(291, 'MAT1284', '$2b$10$i48lJInnVfAwpLbuZjpDFuq/wzypShfAOx0Ue0lAh7d6A7hsjQvcW', 'Danilo.Martins69@escola.com.br', 'aluno', 'Danilo Martins Jr.', '2025-09-11 19:11:30', '/uploads/aluno284.jpg', NULL),
(292, 'MAT1285', '$2b$10$G/B/SP6dZDbIob7IzA3HjeQq6WG4oOfNZdqbuG5FW.h0wyvptu4z6', 'Gustavo.Moreira@escola.com.br', 'aluno', 'Gustavo Moreira', '2025-09-11 19:11:30', NULL, NULL),
(293, 'MAT1286', '$2b$10$bLuIBHX1fxWnB4L4riaol.jRLpUJMk6BPLcNCc1lm2HfGknvoEAuy', 'Manuela.Nogueira@escola.com.br', 'aluno', 'Manuela Nogueira', '2025-09-11 19:11:30', NULL, NULL),
(294, 'MAT1287', '$2b$10$nc3gY1CzzE1teLy27HNB0..rMpMimtE/PDC0aT.svbhEMZRn5m5hu', 'Gabriel_Santos19@escola.com.br', 'aluno', 'Gabriel Santos', '2025-09-11 19:11:30', NULL, NULL),
(295, 'MAT1288', '$2b$10$ciwN4ZHxv3M.SqmWsydhlOeFYO/rzD7HQWuqEGdaHe1zVF9MKucxy', 'Sarah.Moreira@escola.com.br', 'aluno', 'Sarah Moreira', '2025-09-11 19:11:30', '/uploads/aluno288.jpg', NULL),
(296, 'MAT1289', '$2b$10$rNPEzHTUb0ij9em7cw4Pr.CniYiEjxXy190rmACGtSwZPou.G7YKS', 'Felipe.Franco@escola.com.br', 'aluno', 'Felipe Franco', '2025-09-11 19:11:30', NULL, NULL),
(297, 'MAT1290', '$2b$10$rTC2kIFRHS2Z0VUa.UaifubOUPgHgJdSOAQyzYaDqMRtJTp5pE6Pa', 'Sr._Davi31@escola.com.br', 'aluno', 'Sr. Davi Lucca Santos', '2025-09-11 19:11:30', NULL, NULL),
(298, 'MAT1291', '$2b$10$gn6qgeFXtLA5iiGgxOC//.VYZS5krbL0eRKyi.Ts5x/8hQOMvor/e', 'Sr._Gabriel@escola.com.br', 'aluno', 'Sr. Gabriel Batista', '2025-09-11 19:11:31', NULL, NULL),
(299, 'MAT1292', '$2b$10$/1HMs/Yedw.PKbNDrBkUzuSE1t.bb0JpMMJMTAJmvuwt/kR/CTL/2', 'Davi.Silva@escola.com.br', 'aluno', 'Davi Silva', '2025-09-11 19:11:31', '/uploads/aluno292.jpg', NULL),
(300, 'MAT1293', '$2b$10$0JXdN3LZpFikvC3m8PjKlenZPQGge9HgfG26jv587UHrERUZsiRJi', 'Caua_Macedo87@escola.com.br', 'aluno', 'Cauã Macedo', '2025-09-11 19:11:31', NULL, NULL),
(301, 'MAT1294', '$2b$10$/jBRp0rO3yhvmoazrCDRmuA3qY4wUEvR.qnG4NifjC.f/QZt8Xe1G', 'Maria_Julia@escola.com.br', 'aluno', 'Maria Júlia Melo', '2025-09-11 19:11:31', NULL, NULL),
(302, 'MAT1295', '$2b$10$w8uav4Lyraym60tNeic6y.LgP8XqL6yFNVhZ5bsU7becBCUi4doKm', 'Noah_Pereira63@escola.com.br', 'aluno', 'Noah Pereira', '2025-09-11 19:11:31', NULL, NULL),
(303, 'MAT1296', '$2b$10$3ZrAqgpz8g5dFjdhr63wru2LFKehphcQPWTuUp2dCcuUCYFyp10AG', 'Alessandra.Xavier@escola.com.br', 'aluno', 'Alessandra Xavier', '2025-09-11 19:11:31', '/uploads/aluno296.jpg', NULL),
(304, 'MAT1297', '$2b$10$Log8rUlLB4gT33KxTG4liuSsSjDMFjgR.S2qsq6V9TpzjvH0Tgsu6', 'Pablo_Reis57@escola.com.br', 'aluno', 'Pablo Reis', '2025-09-11 19:11:31', NULL, NULL),
(305, 'MAT1298', '$2b$10$Z7.xpR13UPn0u0WZWzMifuhHeHaFbtHbFcMNvs.jt9IvvNms8u2RG', 'Alessandra.Moreira@escola.com.br', 'aluno', 'Alessandra Moreira', '2025-09-11 19:11:32', NULL, NULL),
(306, 'MAT1299', '$2b$10$eWbf.sUmfErZQupoAgHaDudP/orsLPyQZHwO7bTxZSUKI3x9KrizK', 'Esther_Martins@escola.com.br', 'aluno', 'Esther Martins', '2025-09-11 19:11:32', NULL, NULL),
(307, 'MAT1300', '$2b$10$iUIRzaFYCzdFS5i4WLJudOiwG.WP4gN4u0qDsRrErCuEhD7pz9O0a', 'Warley.Moraes@escola.com.br', 'aluno', 'Warley Moraes', '2025-09-11 19:11:32', '/uploads/aluno300.jpg', NULL),
(308, 'MAT1301', '$2b$10$zjVjZI9kwRW1iSchmbyVxuvlFfC4r/58uXThauVNFuTt8fjkCU/b6', 'Silvia_Franco10@escola.com.br', 'aluno', 'Sílvia Franco', '2025-09-11 19:11:32', NULL, NULL),
(309, 'MAT1302', '$2b$10$cpDVbV8AYOMuq7yO5ubkeuQ1Nks2TyyjIqRwDRQ3VoJ/ey4iQzqPG', 'Eloa.Reis@escola.com.br', 'aluno', 'Eloá Reis', '2025-09-11 19:11:32', NULL, NULL),
(310, 'MAT1303', '$2b$10$MfILoO.Va.P7b1HVdwGAW.fvTJf/e8qZr7YuZXeABh0PZwuMgsesC', 'Isabela_Nogueira99@escola.com.br', 'aluno', 'Isabela Nogueira', '2025-09-11 19:11:32', NULL, NULL),
(311, 'MAT1304', '$2b$10$E9KS84CF7ozYhiWA17WnJOxlCB23kxoZ.AhncSoLi9L8g/ODZYSL2', 'Isabella_Costa51@escola.com.br', 'aluno', 'Isabella Costa Jr.', '2025-09-11 19:11:32', '/uploads/aluno304.jpg', NULL),
(312, 'MAT1305', '$2b$10$6wi2vpGsS9jGIZ13fshVJOdG7X.RNlLmjgg1LPwIzkGmaPK.5tYTC', 'Carla.Nogueira95@escola.com.br', 'aluno', 'Carla Nogueira', '2025-09-11 19:11:33', NULL, NULL),
(313, 'MAT1306', '$2b$10$2.Fq2wPdN3Qjw0/8hhT6Xewo.wJH6n5XTs0VGLmELQHYpcPL2UbwG', 'Breno.Batista@escola.com.br', 'aluno', 'Breno Batista', '2025-09-11 19:11:33', NULL, NULL),
(314, 'MAT1307', '$2b$10$ktZfhMfhkmdhQe4jhCTVhuyeSaXGIVuqY98LVPhQ.Orf1aqZwEpx.', 'Paulo.Oliveira@escola.com.br', 'aluno', 'Paulo Oliveira', '2025-09-11 19:11:33', NULL, NULL),
(315, 'MAT1308', '$2b$10$GP7TSuj820M3oonNyqC.zONqEo2Q3jIptadJC.XYe4JYYNcSIDmn2', 'Morgana.Reis@escola.com.br', 'aluno', 'Morgana Reis', '2025-09-11 19:11:33', '/uploads/aluno308.jpg', NULL),
(316, 'MAT1309', '$2b$10$Ab6OU/UJr3NwuLCh90x7euVX0HJPAyP2sDsGSifsaPvsQcCpdm5IC', 'Elisa_Barros@escola.com.br', 'aluno', 'Elisa Barros', '2025-09-11 19:11:33', NULL, NULL),
(317, 'MAT1310', '$2b$10$jzEDKWyaVf5FIBTY1NHzPeU2vZC0G3xZH6tCukGcCf.LnNxluoe7W', 'Sr._Davi31@escola.com.br', 'aluno', 'Sr. Davi Lucca Oliveira', '2025-09-11 19:11:33', NULL, NULL),
(318, 'MAT1311', '$2b$10$aljb1Lhubndqd7GMAzf0k.k0XIxR895mlEX.kF.zV1mD2cF17yfra', 'Danilo.Franco98@escola.com.br', 'aluno', 'Danilo Franco Neto', '2025-09-11 19:11:33', NULL, NULL),
(319, 'MAT1312', '$2b$10$JOIWv8OuPud0Q3D30suuVODFQkhvEilrMx.P/ycEUu1Ea6Ql7Nr26', 'Leonardo.Costa@escola.com.br', 'aluno', 'Leonardo Costa', '2025-09-11 19:11:34', '/uploads/aluno312.jpg', NULL),
(320, 'MAT1313', '$2b$10$mRvuX/QvYR8Ns5j5X/sjnORAG5JcqoaaUG3Gem9FrkD2w1IN84JJK', 'Suelen.Moraes16@escola.com.br', 'aluno', 'Suélen Moraes', '2025-09-11 19:11:34', NULL, NULL),
(321, 'MAT1314', '$2b$10$AETZ6zM9XjInqymSp4QN2umpfd35ZFQBv2soyy2WKaW85S.TBm3..', 'Frederico.Melo77@escola.com.br', 'aluno', 'Frederico Melo', '2025-09-11 19:11:34', NULL, NULL),
(322, 'MAT1315', '$2b$10$OSbYPko/R5OgJ10ei5QmYOHIG.BHTdVOJroWSis3BF98AQmKr7AaC', 'Ana_Clara@escola.com.br', 'aluno', 'Ana Clara Oliveira', '2025-09-11 19:11:34', NULL, NULL),
(323, 'MAT1316', '$2b$10$IBl7rNhC5d6BRppQYJkQMuyPKnpnPfXKIBqnH/7zpkQRMEndcOXh2', 'Carla.Saraiva@escola.com.br', 'aluno', 'Carla Saraiva', '2025-09-11 19:11:34', '/uploads/aluno316.jpg', NULL),
(324, 'MAT1317', '$2b$10$geonAu.bu56dhXUfn/6bg.60eGwX91D9CoH44am9KD3KTxw9j9ODS', 'Raul.Oliveira@escola.com.br', 'aluno', 'Raul Oliveira', '2025-09-11 19:11:34', NULL, NULL),
(325, 'MAT1318', '$2b$10$XIWPq.oIQZp/P9sgt7ACGewG7F4gGd4gyj0DfiSkTQ51xToInxOWm', 'Maria.Alice@escola.com.br', 'aluno', 'Maria Alice Barros', '2025-09-11 19:11:34', NULL, NULL),
(326, 'MAT1319', '$2b$10$W7eCIxhjl5baY394/QX4zeZCbrAbEVrh0lpxGOZUSGltDt1UHetjC', 'Vicente_Barros@escola.com.br', 'aluno', 'Vicente Barros', '2025-09-11 19:11:35', NULL, NULL),
(327, 'MAT1320', '$2b$10$XmrvLOWaGKizH53ekoreOO1zTZisE1y0NDPtGuusnma8RIE3MoJ9i', 'Dra.Bruna71@escola.com.br', 'aluno', 'Dra. Bruna Reis', '2025-09-11 19:11:35', '/uploads/aluno320.jpg', NULL),
(328, 'MAT1321', '$2b$10$nF8rm25IMQ9Mt2C5xk2hTepj/UW3i053N.l9uKftr4vIrHUEjuf2O', 'Henrique.Franco@escola.com.br', 'aluno', 'Henrique Franco', '2025-09-11 19:11:35', NULL, NULL),
(329, 'MAT1322', '$2b$10$azg7fJYtBx7j8i9.0EZSa./cAYgK.5Iroh3MjnvkBkjdWBLrUO7ru', 'Pedro_Xavier15@escola.com.br', 'aluno', 'Pedro Xavier', '2025-09-11 19:11:35', NULL, NULL),
(330, 'MAT1323', '$2b$10$STzW1eDkXTpX7BPrRdi.8On7l4fvrmuFlB077DWiYZIxBVxfy9NCm', 'Esther_Moreira@escola.com.br', 'aluno', 'Esther Moreira', '2025-09-11 19:11:35', NULL, NULL),
(331, 'MAT1324', '$2b$10$kjNAbjAY8SHMji7jHVlPlu1B8n87ZBBFfKy7MzF3jpt8TEmzHdPvC', 'Alessandra.Franco@escola.com.br', 'aluno', 'Alessandra Franco', '2025-09-11 19:11:35', '/uploads/aluno324.jpg', NULL),
(332, 'MAT1325', '$2b$10$AQnRk6y.lYsoHOcmF0N5N.d1WRtuMWCR1z4XDf5zAdaw.Jw3Nb5DC', 'Caua_Costa68@escola.com.br', 'aluno', 'Cauã Costa', '2025-09-11 19:11:35', NULL, NULL),
(333, 'MAT1326', '$2b$10$vBUrPs08xN2SCUW1DLQkEe2TuAfZxBfGjscoJ7zhcT0UTiM5ihXhi', 'Aline_Souza@escola.com.br', 'aluno', 'Aline Souza', '2025-09-11 19:11:36', NULL, NULL),
(334, 'MAT1327', '$2b$10$krqWVXb1k467UXaMJ4GNlecoU7TlQ0mwTv8/rLzJx8a0Ffk1JFEwW', 'Isaac_Melo6@escola.com.br', 'aluno', 'Isaac Melo', '2025-09-11 19:11:36', NULL, NULL),
(335, 'MAT1328', '$2b$10$mN3GizVQbN4IsYo3NAD8auX2vDFgMqaTbal94.kNuuS6ZvExigCL6', 'Joaquim_Batista17@escola.com.br', 'aluno', 'Joaquim Batista', '2025-09-11 19:11:36', '/uploads/aluno328.jpg', NULL),
(336, 'MAT1329', '$2b$10$DYwJJYvBsngKccWxbT1Zd.6hV3bFPhxKjJXJxpGaCrH1VxzQN6ASi', 'Silas.Nogueira@escola.com.br', 'aluno', 'Silas Nogueira', '2025-09-11 19:11:36', NULL, NULL),
(337, 'MAT1330', '$2b$10$8QXj.FSE/5c5/25NkWBlwOQsZuaKep3EpRrPnYkKPoSLenBnGfuwK', 'Talita_Xavier@escola.com.br', 'aluno', 'Talita Xavier', '2025-09-11 19:11:36', NULL, NULL),
(338, 'MAT1331', '$2b$10$YTv34x1RgbTjBIu6E2RMO.bANG93X1jkbXFSvY2rgDozZcn8uPUzG', 'Theo_Franco@escola.com.br', 'aluno', 'Théo Franco', '2025-09-11 19:11:36', NULL, NULL),
(339, 'MAT1332', '$2b$10$rBUUBg/Vla5YaPIu4O2wXOC2Ot2MP7jv3xqmXFZYlbC3NMx0t56da', 'Marli.Melo56@escola.com.br', 'aluno', 'Marli Melo', '2025-09-11 19:11:37', '/uploads/aluno332.jpg', NULL),
(340, 'MAT1333', '$2b$10$ftxdoQn/hLMHTspbqCxtBuRof7.ds2h1DLAIQ9q1BMNHZNyPxO8iu', 'Yango.Macedo68@escola.com.br', 'aluno', 'Yango Macedo', '2025-09-11 19:11:37', NULL, NULL),
(341, 'MAT1334', '$2b$10$rNw6H4PWuBmMYCQ0HaJpSOmbkHEPgaxlWQiveuin7Kl..uC73jztq', 'Antonella.Costa82@escola.com.br', 'aluno', 'Antonella Costa', '2025-09-11 19:11:37', NULL, NULL),
(342, 'MAT1335', '$2b$10$xeteOdDBABWpOw8DWXQHqebPcEDhv60e0KsPtDb2WLuhwCxtTl0Dq', 'Felipe_Saraiva@escola.com.br', 'aluno', 'Felipe Saraiva', '2025-09-11 19:11:37', NULL, NULL),
(343, 'MAT1336', '$2b$10$2zGJCXA/UIAxsC3kMUw4I.Q8IRnleDm9ccDXWMJbgCDG3jgVEL8bu', 'Salvador_Moraes17@escola.com.br', 'aluno', 'Salvador Moraes', '2025-09-11 19:11:37', '/uploads/aluno336.jpg', NULL),
(344, 'MAT1337', '$2b$10$0e67v8DN4wMlrjdH2Dtw3uLi6zibunT.6zFFB8WzslftjVkdluyQ2', 'Heloisa_Martins69@escola.com.br', 'aluno', 'Heloísa Martins', '2025-09-11 19:11:37', NULL, NULL),
(345, 'MAT1338', '$2b$10$cXeAhv9OKH4b/przClEjhuweR5aK5kJr9xL88nHxDWyX7ai/2Bktu', 'Warley_Melo62@escola.com.br', 'aluno', 'Warley Melo', '2025-09-11 19:11:37', NULL, NULL),
(346, 'MAT1339', '$2b$10$OXOjVuhtZeXm0o7H7QNytuktbXOHqfK33nt5NLwcycR3WsDEjTRY2', 'Yango_Nogueira@escola.com.br', 'aluno', 'Yango Nogueira', '2025-09-11 19:11:38', NULL, NULL),
(347, 'MAT1340', '$2b$10$7i1zHbrDRYk.yvK/VumwFukOyhYd6hL4KH6iwQF5ZKw2GTqsdvO4q', 'Srta.Marcia28@escola.com.br', 'aluno', 'Srta. Márcia Moraes', '2025-09-11 19:11:38', '/uploads/aluno340.jpg', NULL),
(348, 'MAT1341', '$2b$10$ObHiQWHnoPA1oU6qX1X/G.jEF8HlkN0HEutyx2BMTN6r2iOpoR1fy', 'Luiza_Carvalho83@escola.com.br', 'aluno', 'Luiza Carvalho', '2025-09-11 19:11:38', NULL, NULL),
(349, 'MAT1342', '$2b$10$tn6jMiCkyFrZvDJKthbNMuPiWi/BK7UP7UlU/mSpX563DiydAzjyu', 'Nataniel_Xavier@escola.com.br', 'aluno', 'Nataniel Xavier', '2025-09-11 19:11:38', NULL, NULL),
(350, 'MAT1343', '$2b$10$UtIG3g4TY5yV/HIDSPLVzO6jF9c4yqS6/UAmjMo4ZA/U6/dsSWiue', 'Silvia.Melo@escola.com.br', 'aluno', 'Sílvia Melo', '2025-09-11 19:11:38', NULL, NULL),
(351, 'MAT1344', '$2b$10$Bv6rBMNOkvZWZiwQTvZxSuw.1ODpPBE8pN7rZc9k1L6t8bCUmI1ra', 'Washington_Martins@escola.com.br', 'aluno', 'Washington Martins', '2025-09-11 19:11:38', '/uploads/aluno344.jpg', NULL),
(352, 'MAT1345', '$2b$10$AYm6JICTKTBD9cQCf8sTyutWM36l3aiSxTG/i74mXnb97IgIOlYjO', 'Felicia_Souza@escola.com.br', 'aluno', 'Felícia Souza', '2025-09-11 19:11:38', NULL, NULL),
(353, 'MAT1346', '$2b$10$0Z9wLPMttSeCoeDk6e3R2uuAM8Jq3JFQfXFsPDo5DiKBSzQqNe8W6', 'Dr.Eduardo@escola.com.br', 'aluno', 'Dr. Eduardo Albuquerque', '2025-09-11 19:11:39', NULL, NULL),
(354, 'MAT1347', '$2b$10$JO4FZGlFc.KNNwNKFbGz2.q57X6nasYVFQhC/XjMA5TGFsaF6r5CK', 'Rebeca.Moraes11@escola.com.br', 'aluno', 'Rebeca Moraes', '2025-09-11 19:11:39', NULL, NULL),
(355, 'MAT1348', '$2b$10$CEs/0IXn8t9YfsBeSkhh/O6YdTsclGkjWFydWBB8oozSG8Tf96JRW', 'Maria_Cecilia@escola.com.br', 'aluno', 'Maria Cecília Albuquerque', '2025-09-11 19:11:39', '/uploads/aluno348.jpg', NULL),
(356, 'MAT1349', '$2b$10$yq1n9JS3qZdP/FDnWtTD6ekv3qgnAUcG9Sp84gFug6gTndz1cRZgS', 'Isabela_Batista@escola.com.br', 'aluno', 'Isabela Batista Filho', '2025-09-11 19:11:39', NULL, NULL),
(357, 'MAT1350', '$2b$10$N4TN//jQNjXjVSk9qGSZS.DNwJojqOYblx4mOcctWDwDHvQiPE.uC', 'Davi.Lucca@escola.com.br', 'aluno', 'Davi Lucca Franco', '2025-09-11 19:11:39', NULL, NULL),
(358, 'MAT1351', '$2b$10$RHMskpRmooAF/Nhi8RM0BedfcNXzULbG68GfMkdHZycQFskK7Nzry', 'Pedro_Henrique@escola.com.br', 'aluno', 'Pedro Henrique Braga', '2025-09-11 19:11:39', NULL, NULL),
(359, 'MAT1352', '$2b$10$8Y7NJF.zzNb30rzfAbt8fO7xIWzqtK9J1KtUPPGMIu./N3fDpQk.u', 'Paulo.Macedo@escola.com.br', 'aluno', 'Paulo Macedo', '2025-09-11 19:11:39', '/uploads/aluno352.jpg', NULL),
(360, 'MAT1353', '$2b$10$r0DVDW3wI0N70.Df1eBireFC89IHuhI2r7FRiq.4tgK55QDVy35ya', 'Marli.Moraes60@escola.com.br', 'aluno', 'Marli Moraes', '2025-09-11 19:11:40', NULL, NULL),
(361, 'MAT1354', '$2b$10$BGX.tGZwO6FLcDP9I.4ts.ZsvGAPKKoeHaMK0JOne3IoNESF/GEzq', 'Ladislau_Oliveira@escola.com.br', 'aluno', 'Ladislau Oliveira', '2025-09-11 19:11:40', NULL, NULL),
(362, 'MAT1355', '$2b$10$I0Rqr54VHbbPNVfJsCCY.OfTa6WSoZDP93Pm6SNzunSjcRi8xcQw2', 'Bryan_Reis@escola.com.br', 'aluno', 'Bryan Reis', '2025-09-11 19:11:40', NULL, NULL),
(363, 'MAT1356', '$2b$10$iCxlC0BQVefWMCbioOQkqOe2qJeauiOL4pjpfPOK0ncGOrcnLWIoC', 'Bernardo.Costa@escola.com.br', 'aluno', 'Bernardo Costa', '2025-09-11 19:11:40', '/uploads/aluno356.jpg', NULL),
(364, 'MAT1357', '$2b$10$.Oli05YSD.O0/rXKTrEXretQNVey5S551iD6MwNQx2LiP.SPVweFu', 'Esther_Macedo@escola.com.br', 'aluno', 'Esther Macedo', '2025-09-11 19:11:40', NULL, NULL),
(365, 'MAT1358', '$2b$10$UhvP0eh6DFqG/C3YzHkwDeBFJvAE1VkaCylSXqHAcNAqlXtcl.vGq', 'Igor_Franco@escola.com.br', 'aluno', 'Ígor Franco', '2025-09-11 19:11:40', NULL, NULL),
(366, 'MAT1359', '$2b$10$zijvPBBkmyaJHRxS7ZX/9.tNTp7t1qdiwBCKuFkG.Z4nhKBWEUx8C', 'Isadora.Silva@escola.com.br', 'aluno', 'Isadora Silva', '2025-09-11 19:11:41', NULL, NULL),
(367, 'MAT1360', '$2b$10$cgrRk6.p5WlQUYZfgWzbauF3weXhEh1LdxtRJVulF7aV7KwwoCoo.', 'Igor.Moreira91@escola.com.br', 'aluno', 'Ígor Moreira', '2025-09-11 19:11:41', '/uploads/aluno360.jpg', NULL),
(368, 'MAT1361', '$2b$10$VMhQUuKQZl/QQQ7wT4loHO.XXfEb0BXumtWAjq0pHXSZ6Fopbwaoa', 'Isabelly_Reis@escola.com.br', 'aluno', 'Isabelly Reis Jr.', '2025-09-11 19:11:41', NULL, NULL),
(369, 'MAT1362', '$2b$10$jZbpdDwPlgmVMrUeq9JC..ZB01t7Uk/PSbyWaquc.Ge.Jd8r4mOMa', 'Sr._Felipe13@escola.com.br', 'aluno', 'Sr. Felipe Barros', '2025-09-11 19:11:41', NULL, NULL),
(370, 'MAT1363', '$2b$10$0dzmk/1BQG1FRtVQDFYkKeXHKfVuhT8e07iUX16BoqpBYVNPAvw3W', 'Norberto.Martins56@escola.com.br', 'aluno', 'Norberto Martins', '2025-09-11 19:11:41', NULL, NULL),
(371, 'MAT1364', '$2b$10$/ZXFVBpzPBIJvryNZSHS9eblGZyg6jBVdYa1AvB9jAnDHQI8EwnPW', 'Valentina_Braga43@escola.com.br', 'aluno', 'Valentina Braga', '2025-09-11 19:11:41', '/uploads/aluno364.jpg', NULL),
(372, 'MAT1365', '$2b$10$mF1EL2uy8gpSmkzxJu0aRusk/I3FbigJS35EfC.hs3rIMV4dU9hza', 'Margarida.Moraes@escola.com.br', 'aluno', 'Margarida Moraes', '2025-09-11 19:11:41', NULL, NULL),
(373, 'MAT1366', '$2b$10$nQbeFqCZUuQu9jwc9QQREeia1dqCHrSl8HF.MvIwzTJvIJELvgzkW', 'Alessandro_Batista61@escola.com.br', 'aluno', 'Alessandro Batista', '2025-09-11 19:11:42', NULL, NULL),
(374, 'MAT1367', '$2b$10$6I8bpuBV73tDk30nvv/zEO2p7IImXfgYu2FMwP1HcVHUx0daQGcfG', 'Daniel.Carvalho31@escola.com.br', 'aluno', 'Daniel Carvalho', '2025-09-11 19:11:42', NULL, NULL),
(375, 'MAT1368', '$2b$10$WcEKwCAgGStZzUeOXPKyWuawQq7sSnf.DpmpUsTnliGmfquYM4XIi', 'Lucas.Melo@escola.com.br', 'aluno', 'Lucas Melo Jr.', '2025-09-11 19:11:42', '/uploads/aluno368.jpg', NULL),
(376, 'MAT1369', '$2b$10$TYXvb6V2kkpXO0S7Un1mnO5.jl3Xc0SXOdCtA/rKpMoIcYWimK6Xa', 'Sr._Cesar@escola.com.br', 'aluno', 'Sr. César Moraes', '2025-09-11 19:11:42', NULL, NULL),
(377, 'MAT1370', '$2b$10$9kVqgRgwfCQwY59qo7ZjTO9JzoVC.WrMwdqWdDDoZ5DQ20x0M2T8.', 'Lara.Carvalho43@escola.com.br', 'aluno', 'Lara Carvalho', '2025-09-11 19:11:42', NULL, NULL),
(378, 'MAT1371', '$2b$10$j13LOLl.K2Fwbo.uVhf2huOdVzQmfbQEQUuKYkNoRvHOIQ0QJh20q', 'Fabricio.Martins27@escola.com.br', 'aluno', 'Fabrício Martins', '2025-09-11 19:11:42', NULL, NULL),
(379, 'MAT1372', '$2b$10$MGSYWNVKAXP8yIhkcl3IXezjKWv/G.Zimj7fo2xO0dWgrX1jF1s4a', 'Srta.Isabela69@escola.com.br', 'aluno', 'Srta. Isabela Reis', '2025-09-11 19:11:42', '/uploads/aluno372.jpg', NULL),
(380, 'MAT1373', '$2b$10$Iz4pqXBo7FrBdS459O6tO.vxVarahBsYsq6l6wEOZtClsny6LAkdy', 'Gabriel.Moraes@escola.com.br', 'aluno', 'Gabriel Moraes', '2025-09-11 19:11:43', NULL, NULL),
(381, 'MAT1374', '$2b$10$FvxY0Uu0Ug879.TdJe9b3OUhUUNEgGceO3F9Z88XAAMgN6XQU86aa', 'Lorena.Melo@escola.com.br', 'aluno', 'Lorena Melo', '2025-09-11 19:11:43', NULL, NULL),
(382, 'MAT1375', '$2b$10$HvFyb2nfZFCyl5g1KOneX.oSGzDaQa0ktwIRcFmLThlMCKVmQ4o9i', 'Fabio_Saraiva@escola.com.br', 'aluno', 'Fábio Saraiva', '2025-09-11 19:11:43', NULL, NULL),
(383, 'MAT1376', '$2b$10$56M5y65Ww3inuB99osS0XOnAqWNnZn9pkOoFE2L5S54S1cgbSagtm', 'Ana.Luiza@escola.com.br', 'aluno', 'Ana Luiza Braga', '2025-09-11 19:11:43', '/uploads/aluno376.jpg', NULL),
(384, 'MAT1377', '$2b$10$5FO.Gqv05itZVRbUbvRRDu9QJAn/toaVXSpQbW3X0aFU1HsFuV5Ny', 'Marli_Nogueira@escola.com.br', 'aluno', 'Marli Nogueira', '2025-09-11 19:11:43', NULL, NULL),
(385, 'MAT1378', '$2b$10$xnniYYnT45Zezs5RThxNxOiC4zQ6XQsOJ/LCAgjgxzYbvzpuZnLOe', 'Maite_Barros@escola.com.br', 'aluno', 'Maitê Barros', '2025-09-11 19:11:43', NULL, NULL),
(386, 'MAT1379', '$2b$10$80fdlZfkY8IxEw91qB.OBeDdlJPMAtbjrn4AVoYSkWZqLEBAA7glW', 'Victor.Melo@escola.com.br', 'aluno', 'Víctor Melo', '2025-09-11 19:11:43', NULL, NULL),
(387, 'MAT1380', '$2b$10$To4oTXojodiRbKnG3jot4OaP5eTFxvBWVNtfvDSKQnUZ4Ea/n7fCq', 'Theo.Moreira@escola.com.br', 'aluno', 'Théo Moreira', '2025-09-11 19:11:44', '/uploads/aluno380.jpg', NULL),
(388, 'MAT1381', '$2b$10$wxIkjgpBQSBNSPkfY8t9w.OD0zIH6uAQTcvRzq3YLKcA/ka2AhSPK', 'Dra._Lavinia32@escola.com.br', 'aluno', 'Dra. Lavínia Barros', '2025-09-11 19:11:44', NULL, NULL),
(389, 'MAT1382', '$2b$10$wAulV50TjnZwzxImP3C2leeLiIDL0uRAcETlj01LB0bRSv2bPuyJK', 'Manuela.Souza@escola.com.br', 'aluno', 'Manuela Souza', '2025-09-11 19:11:44', NULL, NULL),
(390, 'MAT1383', '$2b$10$sb61X6w3Uf/Ppu5sFIol6uFxOkRiLO/Wjl2m.qUTNul1/ZdU/5mKC', 'Elisa.Barros@escola.com.br', 'aluno', 'Elisa Barros', '2025-09-11 19:11:44', NULL, NULL),
(391, 'MAT1384', '$2b$10$n8wot8foygOD1KII0EqqNuzIKyE7ORkzii.DPEsyqHnOq0ot.zjUa', 'Felix_Saraiva94@escola.com.br', 'aluno', 'Félix Saraiva', '2025-09-11 19:11:44', '/uploads/aluno384.jpg', NULL),
(392, 'MAT1385', '$2b$10$EuLGNX0wLzxNEfTJcnTIY.evJmMq84hKoAX0qnUlPS3Y0.msYjaVO', 'Celia_Albuquerque58@escola.com.br', 'aluno', 'Célia Albuquerque', '2025-09-11 19:11:44', NULL, NULL),
(393, 'MAT1386', '$2b$10$lny6lHBqmXWlws4aQiUOkOsfqOdts2qw5ofx8x.JUcPd567zWwAv6', 'Silas_Costa@escola.com.br', 'aluno', 'Silas Costa Jr.', '2025-09-11 19:11:44', NULL, NULL),
(394, 'MAT1387', '$2b$10$nh0qdheWkn6.oN44MyrZOuLp2jQLy3FTdDnWfSprRyI/UCk5./Sqq', 'Rebeca.Nogueira@escola.com.br', 'aluno', 'Rebeca Nogueira', '2025-09-11 19:11:45', NULL, NULL),
(395, 'MAT1388', '$2b$10$AhPhor82R1/6IUxZ1F7K0uUVt9OqpVRk.G9mPnkyWcjvwzXS5K2S.', 'Isis_Barros@escola.com.br', 'aluno', 'Isis Barros', '2025-09-11 19:11:45', '/uploads/aluno388.jpg', NULL),
(396, 'MAT1389', '$2b$10$0D6cQp1XGizLlwziZJu1ju.SpAVVuC5gna.QthzHz82NGwx5ZKUc.', 'Fabiano.Franco@escola.com.br', 'aluno', 'Fabiano Franco', '2025-09-11 19:11:45', NULL, NULL),
(397, 'MAT1390', '$2b$10$.WO/K.1QePlHz//ewKSAl.H1Xv6rRZJHIPunDbHclxDzka15E5L4m', 'Alice_Santos94@escola.com.br', 'aluno', 'Alice Santos', '2025-09-11 19:11:45', NULL, NULL),
(398, 'MAT1391', '$2b$10$ytnBnWvD2LkQILITNfV0NuvySqUdMtjp4bYcwmscuwXMYnT0fptsu', 'Eduarda.Albuquerque@escola.com.br', 'aluno', 'Eduarda Albuquerque', '2025-09-11 19:11:45', NULL, NULL),
(399, 'MAT1392', '$2b$10$Y0NEV9SIfdmlmOjoJYNEIOPj4q41ZKZrTCt2qKjbhTZ5vO.pgqFsm', 'Antonio.Macedo88@escola.com.br', 'aluno', 'Antônio Macedo', '2025-09-11 19:11:45', '/uploads/aluno392.jpg', NULL),
(400, 'MAT1393', '$2b$10$LPsahOdLT2CC4APa.6GoFuIOoNO9beYL/GdKItx4pBIobQMEPWE3S', 'Fabio_Costa36@escola.com.br', 'aluno', 'Fábio Costa', '2025-09-11 19:11:45', NULL, NULL),
(401, 'MAT1394', '$2b$10$lRRFAT3g23Y2RPNGZkhuyeznDm7W.AXLGTxe.hfQRdPA/jGGTbu2u', 'Paulo_Martins@escola.com.br', 'aluno', 'Paulo Martins', '2025-09-11 19:11:46', NULL, NULL),
(402, 'MAT1395', '$2b$10$py/efR2FsJhW74CnMqw0eOU/mpvSgmPHfLg6bjmOdSbmgIloFejyW', 'Fabiano_Saraiva@escola.com.br', 'aluno', 'Fabiano Saraiva', '2025-09-11 19:11:46', NULL, NULL),
(403, 'MAT1396', '$2b$10$A.lTbKKccundnmGobH/ppuJQN0EAwf9psJXh0c4LkIZlMD0ZwNDPK', 'Joana.Saraiva41@escola.com.br', 'aluno', 'Joana Saraiva', '2025-09-11 19:11:46', '/uploads/aluno396.jpg', NULL),
(404, 'MAT1397', '$2b$10$avyKT1Ts3BWmYCuA3XcNl.HtfltKu4825p6ZKYyo/KcI8iVUqD7.e', 'Dra.Sophia@escola.com.br', 'aluno', 'Dra. Sophia Santos', '2025-09-11 19:11:46', NULL, NULL),
(405, 'MAT1398', '$2b$10$0lXM9RRRV6Ic/9DKz8tGPe9VEezWtRzcdonbkG38MBlFu9lpC3ki.', 'Norberto.Pereira39@escola.com.br', 'aluno', 'Norberto Pereira', '2025-09-11 19:11:46', NULL, NULL),
(406, 'MAT1399', '$2b$10$hoH.oB0g/t.AkGizIVOCU.vPi3z9SlKuoIXT6wuHWzFvJFvn/8rUe', 'Lavinia.Costa@escola.com.br', 'aluno', 'Lavínia Costa', '2025-09-11 19:11:46', NULL, NULL),
(407, 'MAT1400', '$2b$10$lKDiwbPXvKXNvAG9Zz.ev.ieskxHTj4.GWQoakdAfquk3QAg431.q', 'Suelen.Moreira@escola.com.br', 'aluno', 'Suélen Moreira', '2025-09-11 19:11:46', '/uploads/aluno400.jpg', NULL),
(408, 'MAT1401', '$2b$10$LKEi4daoGFrbnq4udhCPQOXzlxLbu6ApETqdD/FrynchkDOI921c6', 'Fabricia_Costa66@escola.com.br', 'aluno', 'Fabrícia Costa', '2025-09-11 19:11:47', NULL, NULL),
(409, 'MAT1402', '$2b$10$n/DfHtoW.GKSbPTOUDhgK.0p.wVWWJrRdnvcpEtRPihexGQAdixBW', 'Morgana.Albuquerque12@escola.com.br', 'aluno', 'Morgana Albuquerque Neto', '2025-09-11 19:11:47', NULL, NULL),
(410, 'MAT1403', '$2b$10$yOQfmUWXS1Zh/9dQq47d4ODLgeWyQ4/RhtcJvXK7a/Jq15HlmYR8y', 'Nataniel.Macedo@escola.com.br', 'aluno', 'Nataniel Macedo', '2025-09-11 19:11:47', NULL, NULL),
(411, 'MAT1404', '$2b$10$vQGUAksYHRpbPt4lqyJGIuYaBIPB0v6z4swC5YbMSh1yNoFROPPLa', 'Joao.Lucas@escola.com.br', 'aluno', 'João Lucas Costa Filho', '2025-09-11 19:11:47', '/uploads/aluno404.jpg', NULL),
(412, 'MAT1405', '$2b$10$8m2GVb1IPnKkdZq7A0CDF.QPtDGT6o3.bZkeqQwcJfQn2xC5nBnWW', 'Ana_Luiza@escola.com.br', 'aluno', 'Ana Luiza Pereira', '2025-09-11 19:11:47', NULL, NULL),
(413, 'MAT1406', '$2b$10$6B2JQP75Cjg2Q/HXOk6R8OMJPXJ9Jmgf0yB4zXr4oz9wDiaW4Sqry', 'Isis.Melo@escola.com.br', 'aluno', 'Isis Melo', '2025-09-11 19:11:47', NULL, NULL),
(414, 'MAT1407', '$2b$10$t41TQ6Hmi5jw7wld9qCOauCY9S3qbXStju1JRjexYAdi7gAOYqWs.', 'Sr.Rafael@escola.com.br', 'aluno', 'Sr. Rafael Reis', '2025-09-11 19:11:48', NULL, NULL),
(415, 'MAT1408', '$2b$10$6izMDlNZMbLHpnon7eWLu.C95mMFYozuz9S.tVVWpp9cxCE2EA1kO', 'Lorenzo_Melo@escola.com.br', 'aluno', 'Lorenzo Melo', '2025-09-11 19:11:48', '/uploads/aluno408.jpg', NULL),
(416, 'MAT1409', '$2b$10$Es0czoZmdNpKayiu.6qzxOPtdNo5txweLC1t84rJj7kbw0UgLEL02', 'Bryan.Carvalho77@escola.com.br', 'aluno', 'Bryan Carvalho', '2025-09-11 19:11:48', NULL, NULL),
(417, 'MAT1410', '$2b$10$tV4z5/gHblFLL82tAHYfgOuno.2n96WagXXKCsad6/y4o5QE908I.', 'Giovanna_Barros0@escola.com.br', 'aluno', 'Giovanna Barros', '2025-09-11 19:11:48', NULL, NULL),
(418, 'MAT1411', '$2b$10$UlMwB4oJX1E0Yo8qgjGHWOfEmDMetaPWPTaWN2FA6o4Lh5oV403KG', 'Marli_Macedo26@escola.com.br', 'aluno', 'Marli Macedo', '2025-09-11 19:11:48', NULL, NULL),
(419, 'MAT1412', '$2b$10$5flLCByvA5SPZMMc5BzSjelX6g0eh26JqTf.DB6kzY3VjFx8xB6vy', 'Ana.Clara@escola.com.br', 'aluno', 'Ana Clara Costa', '2025-09-11 19:11:48', '/uploads/aluno412.jpg', NULL),
(420, 'MAT1413', '$2b$10$MLbPgIDyv5rucQmbCn4heebOGP4v0K6me5OI6fJ4vrBfKjH21/Uqy', 'Davi.Barros85@escola.com.br', 'aluno', 'Davi Barros', '2025-09-11 19:11:48', NULL, NULL),
(421, 'MAT1414', '$2b$10$yaVtaiN/ttNpctpfKD6QYuepN4Qv9O9uWLYxb2N7RKb82RnZJNKX.', 'Carla.Albuquerque28@escola.com.br', 'aluno', 'Carla Albuquerque', '2025-09-11 19:11:49', NULL, NULL),
(422, 'MAT1415', '$2b$10$nTh2D0U0BOyehhYYHeJQJO.BT/a4HPya6l1MpaGWHANKSxn5Lk0Ue', 'Natalia_Costa@escola.com.br', 'aluno', 'Natália Costa', '2025-09-11 19:11:49', NULL, NULL),
(423, 'MAT1416', '$2b$10$sFPf8rq1CFC.cYmcB9crye4Oqrtzi5uVGaHPQT.zHIoFS2iZ4IFUO', 'Deneval_Souza83@escola.com.br', 'aluno', 'Deneval Souza', '2025-09-11 19:11:49', '/uploads/aluno416.jpg', NULL),
(424, 'MAT1417', '$2b$10$v11IgmWIHUzpjcVnX8qPWux5YV7umUjmRkq//l4VBzGSNN/JYHCcy', 'Lucca.Reis@escola.com.br', 'aluno', 'Lucca Reis', '2025-09-11 19:11:49', NULL, NULL),
(425, 'MAT1418', '$2b$10$/0eRDhem9DSXZ9z/vsi4seXwENxtjPHTmIkjJ9pKD2GOcKd6sfXIy', 'Talita.Oliveira26@escola.com.br', 'aluno', 'Talita Oliveira', '2025-09-11 19:11:49', NULL, NULL),
(426, 'MAT1419', '$2b$10$MzCv0kgCc6Y09RrWhc7ot.DoDySoMJPO5luh2d0v05qo049FdXMq2', 'Esther_Oliveira@escola.com.br', 'aluno', 'Esther Oliveira Jr.', '2025-09-11 19:11:49', NULL, NULL),
(427, 'MAT1420', '$2b$10$Wikglhg1xVVbugZW7kCnqeZB7nRh/VbvtkjEbsXyOSvt2Inh/0cpq', 'Marcia.Costa76@escola.com.br', 'aluno', 'Márcia Costa', '2025-09-11 19:11:49', '/uploads/aluno420.jpg', NULL),
(428, 'MAT1421', '$2b$10$NBPg1SJkgOKLWqd4LvvKV.dxkpzx6gUZZNdP7y6G5osRbAO5uy3MW', 'Esther.Carvalho@escola.com.br', 'aluno', 'Esther Carvalho', '2025-09-11 19:11:50', NULL, NULL),
(429, 'MAT1422', '$2b$10$CmFqHujLW9PtQomZ.RSzcOZWqENh6aZck7wzKlCZcbemMaxFtfCOi', 'Maria.Alice40@escola.com.br', 'aluno', 'Maria Alice Reis', '2025-09-11 19:11:50', NULL, NULL),
(430, 'MAT1423', '$2b$10$sB4zQTjoFQc/HCZXTOLfLO3bv8wY8MTpSq6mUOyPBaKiXW/FqahSe', 'Emanuel_Martins@escola.com.br', 'aluno', 'Emanuel Martins', '2025-09-11 19:11:50', NULL, NULL),
(431, 'MAT1424', '$2b$10$BWu1AdhYyvSRiEGrVTteVOj1xa78zjOnNPjIL7PFEVGo7NJyVh/Ze', 'Ana_Clara70@escola.com.br', 'aluno', 'Ana Clara Reis', '2025-09-11 19:11:50', '/uploads/aluno424.jpg', NULL),
(432, 'MAT1425', '$2b$10$X1b3b02nNclFzc7D67v2aurjnoFcxXakCoOIvbcS/g1Kq5Y/nuM2.', 'Marcia.Macedo@escola.com.br', 'aluno', 'Márcia Macedo', '2025-09-11 19:11:50', NULL, NULL),
(433, 'MAT1426', '$2b$10$AC81rTMI9zQy8U3iK8vUK./2dlz7t04NTI7nk3kL8EhLepm4bIwKa', 'Joao.Pedro@escola.com.br', 'aluno', 'João Pedro Xavier', '2025-09-11 19:11:50', NULL, NULL),
(434, 'MAT1427', '$2b$10$iXG6LVirlZVrR.Qm42rSuu9x7YFgKJkdrA0e50ZVxrdWeU4YQ42w6', 'Alessandra.Santos12@escola.com.br', 'aluno', 'Alessandra Santos', '2025-09-11 19:11:50', NULL, NULL),
(435, 'MAT1428', '$2b$10$EFdVSFO2gfWWG18z.BhZjuz6BvRp9Aguc0IXHyQL/RkwXerwmOory', 'Maite_Batista29@escola.com.br', 'aluno', 'Maitê Batista', '2025-09-11 19:11:51', '/uploads/aluno428.jpg', NULL),
(436, 'MAT1429', '$2b$10$AdBjR8OiF8ZXa9exwDdQ9OfhZ52XXcGHxCPc0P19q7DdMUxDWKvPW', 'Maria.Helena44@escola.com.br', 'aluno', 'Maria Helena Oliveira Jr.', '2025-09-11 19:11:51', NULL, NULL),
(437, 'MAT1430', '$2b$10$DM5m9NQIMpSoNT3IexR.7OqYtrz.523IiInTUfhvpjKG9LX50C2fq', 'Mercia.Oliveira34@escola.com.br', 'aluno', 'Mércia Oliveira Neto', '2025-09-11 19:11:51', NULL, NULL),
(438, 'MAT1431', '$2b$10$MwKPvj2.M7L7hnR3WSxizOerSBxl.9bxxr2qGQTXkDP61IebHx9v.', 'Srta.Morgana@escola.com.br', 'aluno', 'Srta. Morgana Melo', '2025-09-11 19:11:51', NULL, NULL),
(439, 'MAT1432', '$2b$10$HIog7mbSo8GMuWKSJcTWTOvk4kqcFq6RNEZgVeg/axF.ZKOGJQYeG', 'Helio.Barros13@escola.com.br', 'aluno', 'Hélio Barros', '2025-09-11 19:11:51', '/uploads/aluno432.jpg', NULL),
(440, 'MAT1433', '$2b$10$WWZRTHj/btgEHQgBbO51sOZtudfv4ztXcLwxfXiZa8JZ8Bd3BNId.', 'Felicia_Souza75@escola.com.br', 'aluno', 'Felícia Souza', '2025-09-11 19:11:51', NULL, NULL),
(441, 'MAT1434', '$2b$10$uiw6lIQlyctZ.CqpsGywaOPzcQaV9rIutYPMz77fmUx4HfWhjlOIG', 'Vitor.Moraes92@escola.com.br', 'aluno', 'Vitor Moraes', '2025-09-11 19:11:52', NULL, NULL),
(442, 'MAT1435', '$2b$10$3a8eT4Gofu3ta0fpiNYuvu6od.F8bE0AhBTeEqonSzl7NAQovQjbC', 'Maria_Luiza43@escola.com.br', 'aluno', 'Maria Luiza Batista', '2025-09-11 19:11:52', NULL, NULL),
(443, 'MAT1436', '$2b$10$8Qa2EdVUriXfKYS8J7sBjuCwz7OKiGxkZCdU6DOYSM9q3WnmksFke', 'Alessandra.Moreira@escola.com.br', 'aluno', 'Alessandra Moreira', '2025-09-11 19:11:52', '/uploads/aluno436.jpg', NULL),
(444, 'MAT1437', '$2b$10$gjzvTEE.rG.zUTUj1USM8.yywFoBzS2i3Bp1OMAKI3vrhARjjHr1K', 'Margarida_Nogueira@escola.com.br', 'aluno', 'Margarida Nogueira', '2025-09-11 19:11:52', NULL, NULL),
(445, 'MAT1438', '$2b$10$RxS7NzGxeAOMQrc/P7TgROt7lkgVUTdQCo6RskYKhBVJKzSFJg3yu', 'Emanuelly.Moreira@escola.com.br', 'aluno', 'Emanuelly Moreira', '2025-09-11 19:11:52', NULL, NULL),
(446, 'MAT1439', '$2b$10$Y4hw/zEFA/ayrf/.701KJOskMhmLBTSwWAy1FyTq.LWp1hYHWekEW', 'Silvia.Macedo@escola.com.br', 'aluno', 'Sílvia Macedo', '2025-09-11 19:11:52', NULL, NULL),
(447, 'MAT1440', '$2b$10$2jhpLSf65HK6t1rFtYsfqOFKW1HJgv.PgGx.tF.zqp3SqaBFTuNzK', 'Vicente_Reis@escola.com.br', 'aluno', 'Vicente Reis Neto', '2025-09-11 19:11:52', '/uploads/aluno440.jpg', NULL),
(448, 'MAT1441', '$2b$10$XqX2VntLYD75VyErmxRa1ey8WzeZgZnbOTdVuRVZoS.TvVdDREYt6', 'Dr.Isaac72@escola.com.br', 'aluno', 'Dr. Isaac Batista', '2025-09-11 19:11:53', NULL, NULL),
(449, 'MAT1442', '$2b$10$JQSlgJjpAmSPUEBuq7Spi.LsaxoIkjYvU83Mx9WzVyrRgKr6ncZwu', 'Emanuel_Barros65@escola.com.br', 'aluno', 'Emanuel Barros', '2025-09-11 19:11:53', NULL, NULL),
(450, 'MAT1443', '$2b$10$INb.FBE5lQDru/L7iOQdoO8ZUgityFwEWC8zLIfA37KOoMLNqKsPC', 'Matheus.Pereira70@escola.com.br', 'aluno', 'Matheus Pereira', '2025-09-11 19:11:53', NULL, NULL),
(451, 'MAT1444', '$2b$10$fV2QN/dw5d.dcR4AlImCQe36D8VD/ZZeel7pF4aSycVaz7sJrfJSS', 'Nataniel.Pereira96@escola.com.br', 'aluno', 'Nataniel Pereira', '2025-09-11 19:11:53', '/uploads/aluno444.jpg', NULL),
(452, 'MAT1445', '$2b$10$AeelocNy0RnQgA2KGYlq1./ahxP7oLmVCfEkJUtYIWeeJSgXRoj1i', 'Silvia.Moraes78@escola.com.br', 'aluno', 'Sílvia Moraes', '2025-09-11 19:11:53', NULL, NULL),
(453, 'MAT1446', '$2b$10$Gy00uhS36bvlztSwpN.Qbe/2TjPyK2dodiSCxN7fQ8xuxtbJ1B3wO', 'Marcos_Oliveira96@escola.com.br', 'aluno', 'Marcos Oliveira', '2025-09-11 19:11:53', NULL, NULL),
(454, 'MAT1447', '$2b$10$IehmwI5WCJFSDzERmSI9juzHCzeG2mbz8vqEbjPl2qWI1xV9NLz.e', 'Giovanna_Melo@escola.com.br', 'aluno', 'Giovanna Melo', '2025-09-11 19:11:53', NULL, NULL),
(455, 'MAT1448', '$2b$10$4ZTQ9OUKa2OuzrflWpOFXeCkpAy/AtaGbMUKcQsDj8J126NdYTDZi', 'Samuel_Moreira@escola.com.br', 'aluno', 'Samuel Moreira', '2025-09-11 19:11:54', '/uploads/aluno448.jpg', NULL),
(456, 'MAT1449', '$2b$10$WFP5pNzIUo9VnbpQGMV4GeMYjFyXBgWc.O3GK1XnsoY3XgKv4vxB.', 'Fabio.Nogueira@escola.com.br', 'aluno', 'Fábio Nogueira', '2025-09-11 19:11:54', NULL, NULL),
(457, 'MAT1450', '$2b$10$KMKnBo0VDMmirzYFCAWyOumASn/BNSgYAcMsac/tZXxiJAsbX2AF.', 'Nataniel_Martins86@escola.com.br', 'aluno', 'Nataniel Martins', '2025-09-11 19:11:54', NULL, NULL),
(458, 'MAT1451', '$2b$10$Qgi38tRCgfuKecmy2PeXouFB.A5CpvAr7MtSPb3wtfd6oCFId4MsS', 'Lorena_Macedo@escola.com.br', 'aluno', 'Lorena Macedo Jr.', '2025-09-11 19:11:54', NULL, NULL),
(459, 'MAT1452', '$2b$10$9eSJfIZ.K7wTNloZcOLjuukJfV4/Ox/DzQJhGJMibjaCvIBZoGHSW', 'Elisa_Franco@escola.com.br', 'aluno', 'Elisa Franco Neto', '2025-09-11 19:11:54', '/uploads/aluno452.jpg', NULL),
(460, 'MAT1453', '$2b$10$zLNHy2OeyrVkp0Fb26G.6O6fZZdLFSOL6M5cXHsPySQ12YU20VMKq', 'Mariana.Barros@escola.com.br', 'aluno', 'Mariana Barros', '2025-09-11 19:11:54', NULL, NULL),
(461, 'MAT1454', '$2b$10$QhfnLtCcNS.ZyBX8ywsIq.yK.B0uIhkEOD141xnkTF8AM5b0tiIb6', 'Liz_Carvalho@escola.com.br', 'aluno', 'Liz Carvalho', '2025-09-11 19:11:54', NULL, NULL),
(462, 'MAT1455', '$2b$10$YVLDnqPoq81/2pWk0PZlKeP3Dtsae.EE40v/6hLiN38JpNzoaFFJ.', 'Emanuelly.Moreira@escola.com.br', 'aluno', 'Emanuelly Moreira', '2025-09-11 19:11:55', NULL, NULL),
(463, 'MAT1456', '$2b$10$aZvxM6OoxqBx6BDY5CngAOuuDl4y/0V5Ci1XfoeVi4iO91RSHCChO', 'Isabela_Moreira@escola.com.br', 'aluno', 'Isabela Moreira Jr.', '2025-09-11 19:11:55', '/uploads/aluno456.jpg', NULL),
(464, 'MAT1457', '$2b$10$P..qTlxCX0Dut8TimcLpP.IFsEscVmzan7Vqfs7ytyvdL0uHYruEm', 'Enzo.Gabriel@escola.com.br', 'aluno', 'Enzo Gabriel Moreira', '2025-09-11 19:11:55', NULL, NULL),
(465, 'MAT1458', '$2b$10$ErJMLrVC.eTU94G74Tw/L.Tx59svHYaR0qBdsHmV0HXHGlx6KS32y', 'Maria.Julia@escola.com.br', 'aluno', 'Maria Júlia Santos', '2025-09-11 19:11:55', NULL, NULL),
(466, 'MAT1459', '$2b$10$lbKadbnmFHfbZfbzIwpiBu9xqvzXFbkKQkQG/pAAemCL11qW0HGRq', 'Gubio_Moreira17@escola.com.br', 'aluno', 'Gúbio Moreira', '2025-09-11 19:11:55', NULL, NULL),
(467, 'MAT1460', '$2b$10$Uwc3/zG7OBgtl5x/SjdROutE7R0tV2us9BxaCf28f0PvwYmQi8mva', 'Bernardo.Barros34@escola.com.br', 'aluno', 'Bernardo Barros Filho', '2025-09-11 19:11:55', '/uploads/aluno460.jpg', NULL),
(468, 'MAT1461', '$2b$10$KmadvH1YKxUbBXHqG6H5GO.NZUp6TPz.kZ.RZE/sZl2JBc3sJSJjS', 'Srta._Celia95@escola.com.br', 'aluno', 'Srta. Célia Silva', '2025-09-11 19:11:56', NULL, NULL),
(469, 'MAT1462', '$2b$10$cdOWcuUxWS65sJTtark04ejpNeAgGUcfEMbbWQKpbONYXSrhbnLFG', 'Suelen.Oliveira21@escola.com.br', 'aluno', 'Suélen Oliveira', '2025-09-11 19:11:56', NULL, NULL),
(470, 'MAT1463', '$2b$10$NgRbtqxe0uRkB6VAFyDT3udGIrQjAlHCoU9iZAQ26i/2J4OTh6fzW', 'Salvador.Nogueira@escola.com.br', 'aluno', 'Salvador Nogueira', '2025-09-11 19:11:56', NULL, NULL),
(471, 'MAT1464', '$2b$10$Fptd0CLyEjgQkP2hoYrqaeAMdpgCvqMR7c0EY0NPxbhXqmuvXTrye', 'Julia_Costa@escola.com.br', 'aluno', 'Júlia Costa', '2025-09-11 19:11:56', '/uploads/aluno464.jpg', NULL),
(472, 'MAT1465', '$2b$10$hUMaIN66zHZEpz5PV9Dja.s/h7IWq3Y0Kv3vE676uJFlaHkasKcBq', 'Rebeca_Macedo53@escola.com.br', 'aluno', 'Rebeca Macedo Neto', '2025-09-11 19:11:56', NULL, NULL),
(473, 'MAT1466', '$2b$10$Th7G7ZwHfRl1nFoJ6DoBW.3zT77w0QIZNAIKPRALGf09RPDs4jVVG', 'Danilo_Oliveira60@escola.com.br', 'aluno', 'Danilo Oliveira', '2025-09-11 19:11:56', NULL, NULL),
(474, 'MAT1467', '$2b$10$t0XvWYNZmXAe5xrggq4KmOX/Z4sGpAf17/y6wq97z.Ad5.7FUcO/q', 'Manuela_Albuquerque@escola.com.br', 'aluno', 'Manuela Albuquerque', '2025-09-11 19:11:56', NULL, NULL),
(475, 'arthur', '$2b$10$0qHovQuglgCI43Vymuqk0uHdHHdt/iH9ddVHcc4E5iji4Vu05oqM2', 'arthur@gmail.com', 'aluno', 'Arthur', '2025-09-18 16:57:50', '', '2025-09-25 13:21:54'),
(476, 'joao', '$2b$10$LY56BTX8Pod9N0h3CPoRUO58LaieAkydiOHkN6yQHbIWqcX0BjRtS', 'Joao@gmail.com', 'professor', 'João', '2025-09-25 18:28:16', '', '2025-09-25 18:42:29');

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

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `alunos`
--
ALTER TABLE `alunos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `alunos_turmas`
--
ALTER TABLE `alunos_turmas`
  ADD PRIMARY KEY (`id`),
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
-- Índices de tabela `caixas_destino`
--
ALTER TABLE `caixas_destino`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_caixas_destino_nome` (`nome`),
  ADD UNIQUE KEY `uq_caixas_nome` (`nome`),
  ADD KEY `idx_caixas_ativo` (`ativo`);

--
-- Índices de tabela `caixa_movimentos`
--
ALTER TABLE `caixa_movimentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_caixa_id` (`caixa_id`),
  ADD KEY `idx_mov_caixa_data` (`caixa_id`,`data`);

--
-- Índices de tabela `calendario_gestor`
--
ALTER TABLE `calendario_gestor`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `calendario_letivo`
--
ALTER TABLE `calendario_letivo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `calendario_letivo_ibfk_1` (`escola_id`);

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
-- Índices de tabela `descontos`
--
ALTER TABLE `descontos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluno_id` (`aluno_id`);

--
-- Índices de tabela `disponibilidade`
--
ALTER TABLE `disponibilidade`
  ADD PRIMARY KEY (`id`),
  ADD KEY `professor_id` (`professor_id`);

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
  ADD PRIMARY KEY (`aluno_id`,`avaliacao_id`),
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
  ADD UNIQUE KEY `uniq_responsaveis_rg` (`rg`);

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_transacoes_caixa` (`caixa_id`);

--
-- Índices de tabela `turmas`
--
ALTER TABLE `turmas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `professor_responsavel` (`professor_responsavel`);

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
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `alunos_turmas`
--
ALTER TABLE `alunos_turmas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `avaliacoes`
--
ALTER TABLE `avaliacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `caixas_destino`
--
ALTER TABLE `caixas_destino`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `caixa_movimentos`
--
ALTER TABLE `caixa_movimentos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `calendario_gestor`
--
ALTER TABLE `calendario_gestor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `calendario_letivo`
--
ALTER TABLE `calendario_letivo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `conversas`
--
ALTER TABLE `conversas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de tabela `descontos`
--
ALTER TABLE `descontos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT de tabela `disponibilidade`
--
ALTER TABLE `disponibilidade`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `envios`
--
ALTER TABLE `envios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `escolas`
--
ALTER TABLE `escolas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `eventos_calendario`
--
ALTER TABLE `eventos_calendario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `eventos_roles`
--
ALTER TABLE `eventos_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de tabela `eventos_usuarios`
--
ALTER TABLE `eventos_usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `exercicios`
--
ALTER TABLE `exercicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `exercicios_alunos`
--
ALTER TABLE `exercicios_alunos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `exercicios_questoes`
--
ALTER TABLE `exercicios_questoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=258;

--
-- AUTO_INCREMENT de tabela `materiais`
--
ALTER TABLE `materiais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `materias`
--
ALTER TABLE `materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `materias_materiais`
--
ALTER TABLE `materias_materiais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `mensagens`
--
ALTER TABLE `mensagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=124;

--
-- AUTO_INCREMENT de tabela `mensalidades`
--
ALTER TABLE `mensalidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=475;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=124;

--
-- AUTO_INCREMENT de tabela `notificacoes_eventos`
--
ALTER TABLE `notificacoes_eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=314;

--
-- AUTO_INCREMENT de tabela `pagamentos_funcionarios`
--
ALTER TABLE `pagamentos_funcionarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `presencas`
--
ALTER TABLE `presencas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de tabela `professores_materias`
--
ALTER TABLE `professores_materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `professores_turmas`
--
ALTER TABLE `professores_turmas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `transacoes`
--
ALTER TABLE `transacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de tabela `turmas`
--
ALTER TABLE `turmas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `turmas_materias`
--
ALTER TABLE `turmas_materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=477;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `alunos`
--
ALTER TABLE `alunos`
  ADD CONSTRAINT `fk_aluno_user_cascade_final` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `alunos_turmas`
--
ALTER TABLE `alunos_turmas`
  ADD CONSTRAINT `fk_alunos_turmas_aluno_cascade` FOREIGN KEY (`aluno_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_alunos_turmas_turma_cascade` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cascade_alunos_turmas_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `anuncios`
--
ALTER TABLE `anuncios`
  ADD CONSTRAINT `fk_anuncios_autor_cascade` FOREIGN KEY (`autor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `anuncios_lidos`
--
ALTER TABLE `anuncios_lidos`
  ADD CONSTRAINT `anuncios_lidos_ibfk_2` FOREIGN KEY (`anuncio_id`) REFERENCES `anuncios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_anuncios_lidos_user_cascade` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `aulas`
--
ALTER TABLE `aulas`
  ADD CONSTRAINT `fk_aulas_calendario_gestor` FOREIGN KEY (`calendario_id`) REFERENCES `calendario_gestor` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aulas_materia` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`),
  ADD CONSTRAINT `fk_aulas_turma_cascade` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cascade_aulas_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `avaliacoes`
--
ALTER TABLE `avaliacoes`
  ADD CONSTRAINT `fk_avaliacoes_calendario` FOREIGN KEY (`calendario_id`) REFERENCES `calendario_gestor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_avaliacoes_materias` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_avaliacoes_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cascade_avaliacoes_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `caixa_movimentos`
--
ALTER TABLE `caixa_movimentos`
  ADD CONSTRAINT `fk_caixa_movimentos_caixa` FOREIGN KEY (`caixa_id`) REFERENCES `caixas_destino` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `calendario_letivo`
--
ALTER TABLE `calendario_letivo`
  ADD CONSTRAINT `calendario_letivo_ibfk_1` FOREIGN KEY (`escola_id`) REFERENCES `escolas` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_conversas_user1_cascade_final` FOREIGN KEY (`usuario1_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_conversas_user2_cascade_final` FOREIGN KEY (`usuario2_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `descontos`
--
ALTER TABLE `descontos`
  ADD CONSTRAINT `descontos_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `disponibilidade`
--
ALTER TABLE `disponibilidade`
  ADD CONSTRAINT `fk_disponibilidade_professor_cascade` FOREIGN KEY (`professor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `envios`
--
ALTER TABLE `envios`
  ADD CONSTRAINT `fk_envios_usuario_cascade` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `fk_eventos_usuarios_user_cascade` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `fk_cascade_exercicios_alunos_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
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
  ADD CONSTRAINT `fk_funcionario_user_cascade_final` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `fk_notas_aluno_id_cascade` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notas_avaliacao_id_cascade` FOREIGN KEY (`avaliacao_id`) REFERENCES `avaliacoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notas_materia_id_cascade` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notas_turma_id_cascade` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD CONSTRAINT `fk_notificacoes_conversa` FOREIGN KEY (`conversa_id`) REFERENCES `conversas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notificacoes_destinatario_cascade` FOREIGN KEY (`destinatario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notificacoes_remetente_cascade` FOREIGN KEY (`remetente_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `notificacoes_eventos`
--
ALTER TABLE `notificacoes_eventos`
  ADD CONSTRAINT `fk_notificacoes_eventos_user_cascade` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `fk_posts_users_cascade` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `presencas`
--
ALTER TABLE `presencas`
  ADD CONSTRAINT `fk_cascade_presenca_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_presenca_aluno_cascade_corrigida` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_presenca_materia` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`),
  ADD CONSTRAINT `fk_presenca_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`),
  ADD CONSTRAINT `fk_presencas_aula_cascade_corrigida` FOREIGN KEY (`aula_id`) REFERENCES `aulas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `professores_materias`
--
ALTER TABLE `professores_materias`
  ADD CONSTRAINT `fk_professores_materias_prof_cascade` FOREIGN KEY (`professor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `professores_materias_ibfk_2` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `professores_turmas`
--
ALTER TABLE `professores_turmas`
  ADD CONSTRAINT `fk_cascade_professores_turmas_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_prof_turmas_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `seguidores`
--
ALTER TABLE `seguidores`
  ADD CONSTRAINT `fk_seguidores_seguido_cascade` FOREIGN KEY (`seguido_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_seguidores_seguidor_cascade` FOREIGN KEY (`seguidor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `fk_status_digitando_dest_cascade` FOREIGN KEY (`destinatario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_status_digitando_user_cascade` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `status_digitando_ibfk_1` FOREIGN KEY (`conversa_id`) REFERENCES `conversas` (`id`);

--
-- Restrições para tabelas `turmas_materias`
--
ALTER TABLE `turmas_materias`
  ADD CONSTRAINT `fk_cascade_turmas_materias_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_turmas_materias_on_delete_cascade` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
