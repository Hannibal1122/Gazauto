-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Май 29 2018 г., 16:26
-- Версия сервера: 10.1.28-MariaDB
-- Версия PHP: 7.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `gazauto`
--

-- --------------------------------------------------------

--
-- Структура таблицы `fields`
--

CREATE TABLE `fields` (
  `id` int(11) NOT NULL,
  `tableId` int(11) NOT NULL,
  `i` int(11) NOT NULL,
  `name_column` varchar(32) NOT NULL,
  `type` varchar(12) NOT NULL,
  `value` varchar(128) DEFAULT NULL,
  `linkId` int(11) DEFAULT NULL,
  `linkType` varchar(12) DEFAULT NULL,
  `state` int(11) DEFAULT '0',
  `info` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `fields`
--

INSERT INTO `fields` (`id`, `tableId`, `i`, `name_column`, `type`, `value`, `linkId`, `linkType`, `state`, `info`) VALUES
(695, 66, 2, 'Название', 'value', '', NULL, NULL, 0, NULL),
(696, 66, 2, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(700, 66, 3, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(763, 102, 0, 'Первое поле', 'head', NULL, NULL, NULL, 0, NULL),
(772, 102, 1, 'Первое поле', 'value', '123sdfsdf1232', NULL, NULL, 50, NULL),
(773, 102, 2, 'Первое поле', 'link', '0', 2, 'value', 10, NULL),
(774, 66, 0, 'Номер', 'head', NULL, NULL, NULL, 0, NULL),
(775, 66, 1, 'Название', 'head', NULL, NULL, NULL, 0, NULL),
(776, 66, 2, 'Модель', 'head', NULL, NULL, NULL, 0, NULL),
(777, 66, 3, 'тест', 'head', NULL, NULL, NULL, 0, NULL),
(792, 66, 2, 'Номер', 'link', '1', 2, 'value', 0, NULL),
(793, 66, 3, 'Номер', 'link', '2', 2, 'value', 0, NULL),
(794, 66, 3, 'Название', 'link', '0', 2, 'value', 0, NULL),
(795, 66, 2, 'тест', 'value', '', NULL, NULL, 0, NULL),
(796, 66, 3, 'тест', 'value', '', NULL, NULL, 0, NULL),
(797, 66, 4, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(798, 66, 4, 'Название', 'link', '', 772, 'cell', 0, NULL),
(799, 66, 4, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(800, 66, 4, 'тест', 'value', '', NULL, NULL, 0, NULL),
(801, 66, 5, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(802, 66, 5, 'Название', 'link', '', 798, 'cell', 0, NULL),
(803, 66, 5, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(804, 66, 5, 'тест', 'value', '', NULL, NULL, 0, NULL),
(805, 66, 6, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(806, 66, 6, 'Название', 'value', '', NULL, NULL, 0, NULL),
(807, 66, 6, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(808, 66, 6, 'тест', 'value', '', NULL, NULL, 0, NULL),
(889, 66, 7, 'Номер', 'link', '1', 2, 'value', 0, NULL),
(890, 66, 7, 'Название', 'value', '', NULL, NULL, 0, NULL),
(891, 66, 7, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(892, 66, 7, 'тест', 'value', '', NULL, NULL, 0, NULL),
(893, 66, 8, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(894, 66, 8, 'Название', 'value', 'Новое значение', NULL, NULL, 0, NULL),
(895, 66, 8, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(896, 66, 8, 'тест', 'value', '', NULL, NULL, 0, NULL),
(897, 66, 9, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(898, 66, 9, 'Название', 'link', '0', 4, 'value', 0, NULL),
(899, 66, 9, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(900, 66, 9, 'тест', 'value', '', NULL, NULL, 0, NULL),
(901, 66, 10, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(902, 66, 10, 'Название', 'link', '0', 2, 'value', 0, NULL),
(903, 66, 10, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(904, 66, 10, 'тест', 'value', '', NULL, NULL, 0, NULL),
(905, 66, 11, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(906, 66, 11, 'Название', 'value', 'дратути', NULL, NULL, 0, NULL),
(907, 66, 11, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(908, 66, 11, 'тест', 'value', '', NULL, NULL, 0, NULL),
(909, 66, 12, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(910, 66, 12, 'Название', 'value', '10', NULL, NULL, 0, NULL),
(911, 66, 12, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(912, 66, 12, 'тест', 'value', '', NULL, NULL, 0, NULL),
(913, 66, 13, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(914, 66, 13, 'Название', 'value', 'Новое значение', NULL, NULL, 0, NULL),
(915, 66, 13, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(916, 66, 13, 'тест', 'value', '', NULL, NULL, 0, NULL),
(917, 66, 14, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(918, 66, 14, 'Название', 'link', '0', 3, 'value', 0, NULL),
(919, 66, 14, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(920, 66, 14, 'тест', 'value', '', NULL, NULL, 0, NULL),
(921, 66, 15, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(922, 66, 15, 'Название', 'link', '1', 2, 'value', 0, NULL),
(923, 66, 15, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(924, 66, 15, 'тест', 'value', '', NULL, NULL, 0, NULL),
(925, 66, 16, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(926, 66, 16, 'Название', 'value', '', NULL, NULL, 0, NULL),
(927, 66, 16, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(928, 66, 16, 'тест', 'value', '', NULL, NULL, 0, NULL),
(929, 66, 17, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(930, 66, 17, 'Название', 'value', '', NULL, NULL, 0, NULL),
(931, 66, 17, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(932, 66, 17, 'тест', 'value', '', NULL, NULL, 0, NULL),
(933, 66, 18, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(934, 66, 18, 'Название', 'value', '', NULL, NULL, 0, NULL),
(935, 66, 18, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(936, 66, 18, 'тест', 'value', '', NULL, NULL, 0, NULL),
(937, 66, 19, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(938, 66, 19, 'Название', 'value', '', NULL, NULL, 0, NULL),
(939, 66, 19, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(940, 66, 19, 'тест', 'value', '', NULL, NULL, 0, NULL),
(941, 66, 20, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(942, 66, 20, 'Название', 'value', '', NULL, NULL, 0, NULL),
(943, 66, 20, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(944, 66, 20, 'тест', 'value', '', NULL, NULL, 0, NULL),
(945, 66, 21, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(946, 66, 21, 'Название', 'value', '', NULL, NULL, 0, NULL),
(947, 66, 21, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(948, 66, 21, 'тест', 'value', '', NULL, NULL, 0, NULL),
(949, 102, 3, 'Первое поле', 'value', 'дратути', NULL, NULL, 20, NULL),
(953, 4, 0, 'Фамилия', 'head', NULL, NULL, NULL, 0, NULL),
(954, 4, 1, 'Имя', 'head', NULL, NULL, NULL, 0, NULL),
(955, 4, 2, 'Отчество', 'head', NULL, NULL, NULL, 0, NULL),
(956, 4, 3, 'Логин', 'head', NULL, NULL, NULL, 0, NULL),
(957, 4, 1, 'Фамилия', 'value', 'Рученькин', NULL, NULL, 0, NULL),
(958, 4, 1, 'Имя', 'value', 'Михаил', NULL, NULL, 0, NULL),
(959, 4, 1, 'Отчество', 'value', 'Андреевич', NULL, NULL, 0, NULL),
(960, 4, 1, 'Логин', 'value', 'admin', NULL, NULL, 0, NULL),
(961, 4, 2, 'Фамилия', 'value', 'Тестов', NULL, NULL, 0, NULL),
(962, 4, 2, 'Имя', 'value', 'Тест', NULL, NULL, 0, NULL),
(963, 4, 2, 'Отчество', 'value', 'Тестович', NULL, NULL, 0, NULL),
(964, 4, 2, 'Логин', 'value', '', NULL, NULL, 0, NULL),
(965, 126, 0, 'Таблицы', 'head', NULL, NULL, NULL, 0, NULL),
(966, 126, 1, 'Ячейки', 'head', NULL, NULL, NULL, 0, NULL),
(967, 126, 2, 'Файлы', 'head', NULL, NULL, NULL, 0, NULL),
(968, 126, 1, 'Таблицы', 'link', '', 890, 'cell', 0, NULL),
(969, 126, 1, 'Ячейки', 'value', '', NULL, NULL, 0, NULL),
(970, 126, 1, 'Файлы', 'link', '0', 116, 'file', 0, NULL),
(971, 102, 4, 'Первое поле', 'value', '', NULL, NULL, 0, NULL),
(975, 103, 0, 'тест', 'head', NULL, NULL, NULL, 0, NULL),
(976, 103, 1, 'тест', 'link', '0', 102, 'table', 0, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `main_log`
--

CREATE TABLE `main_log` (
  `id` int(11) NOT NULL,
  `type` varchar(12) NOT NULL,
  `operation` varchar(32) NOT NULL,
  `value` varchar(256) NOT NULL,
  `date` datetime NOT NULL,
  `dateUpdate` datetime DEFAULT NULL,
  `login` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `main_log`
--

INSERT INTO `main_log` (`id`, `type`, `operation`, `value`, `date`, `dateUpdate`, `login`) VALUES
(1, 'table', 'open', '66', '2018-05-29 16:29:09', '2018-05-29 16:29:20', 'admin'),
(2, 'table', 'open', '66', '2018-05-29 16:29:26', '2018-05-29 16:33:49', 'admin'),
(3, 'table', 'open', '102', '2018-05-29 16:29:34', '2018-05-29 16:29:44', 'admin'),
(4, 'table', 'updateState', '102', '2018-05-29 16:29:45', NULL, 'admin'),
(5, 'table', 'open', '102', '2018-05-29 16:29:51', '2018-05-29 16:29:51', 'admin'),
(6, 'table', 'open', '102', '2018-05-29 16:29:53', '2018-05-29 16:30:45', 'admin'),
(7, 'table', 'update', '66', '2018-05-29 16:30:42', NULL, 'admin'),
(8, 'table', 'open', '102', '2018-05-29 16:30:49', '2018-05-29 16:31:20', 'admin'),
(9, 'structure', 'open', '100', '2018-05-29 16:30:59', NULL, 'admin'),
(10, 'structure', 'open', '1', '2018-05-29 16:31:00', NULL, 'admin'),
(11, 'structure', 'open', '33', '2018-05-29 16:31:01', NULL, 'admin'),
(12, 'structure', 'open', '32', '2018-05-29 16:31:02', NULL, 'admin'),
(13, 'structure', 'open', '30', '2018-05-29 16:31:02', NULL, 'admin'),
(14, 'table', 'open', '66', '2018-05-29 16:33:56', '2018-05-29 16:34:16', 'admin'),
(15, 'structure', 'open', '0', '2018-05-29 16:34:01', NULL, 'admin'),
(16, 'table', 'open', '66', '2018-05-29 16:34:24', '2018-05-29 16:34:54', 'admin'),
(17, 'table', 'open', '66', '2018-05-29 16:34:58', '2018-05-29 16:35:19', 'admin'),
(18, 'structure', 'open', '0', '2018-05-29 16:35:00', NULL, 'admin'),
(19, 'table', 'open', '66', '2018-05-29 16:35:30', '2018-05-29 16:35:50', 'admin'),
(20, 'structure', 'open', '0', '2018-05-29 16:35:32', NULL, 'admin'),
(21, 'table', 'open', '66', '2018-05-29 16:36:01', '2018-05-29 16:36:42', 'admin'),
(22, 'structure', 'open', '0', '2018-05-29 16:36:03', NULL, 'admin'),
(23, 'table', 'open', '66', '2018-05-29 16:36:46', '2018-05-29 16:37:47', 'admin'),
(24, 'structure', 'open', '0', '2018-05-29 16:36:53', NULL, 'admin'),
(25, 'structure', 'open', '0', '2018-05-29 16:37:10', NULL, 'admin'),
(26, 'structure', 'open', '0', '2018-05-29 16:37:11', NULL, 'admin'),
(27, 'table', 'open', '126', '2018-05-29 16:37:28', '2018-05-29 16:37:28', 'admin'),
(28, 'structure', 'open', '30', '2018-05-29 16:37:31', NULL, 'admin'),
(29, 'table', 'open', '102', '2018-05-29 16:37:33', '2018-05-29 16:37:34', 'admin'),
(30, 'table', 'open', '102', '2018-05-29 16:37:41', '2018-05-29 16:37:41', 'admin'),
(31, 'table', 'open', '66', '2018-05-29 16:37:51', '2018-05-29 16:38:42', 'admin'),
(32, 'table', 'open', '66', '2018-05-29 16:38:47', '2018-05-29 16:38:47', 'admin'),
(33, 'table', 'open', '66', '2018-05-29 16:38:56', '2018-05-29 16:39:17', 'admin'),
(34, 'table', 'open', '102', '2018-05-29 16:39:00', '2018-05-29 16:39:10', 'admin'),
(35, 'table', 'open', '66', '2018-05-29 16:39:18', '2018-05-29 16:46:17', 'admin'),
(36, 'table', 'open', '102', '2018-05-29 16:39:20', '2018-05-29 16:39:20', 'admin'),
(37, 'table', 'open', '102', '2018-05-29 16:39:28', '2018-05-29 16:46:15', 'admin'),
(38, 'table', 'open', '66', '2018-05-29 16:47:33', '2018-05-29 16:47:33', 'admin'),
(39, 'table', 'open', '66', '2018-05-29 16:49:04', '2018-05-29 16:52:05', 'admin'),
(40, 'table', 'open', '66', '2018-05-29 16:52:10', '2018-05-29 16:52:31', 'admin'),
(41, 'table', 'open', '66', '2018-05-29 16:52:34', '2018-05-29 16:52:34', 'admin'),
(42, 'table', 'open', '66', '2018-05-29 16:52:38', '2018-05-29 16:52:39', 'admin'),
(43, 'table', 'open', '66', '2018-05-29 16:52:44', '2018-05-29 16:52:45', 'admin'),
(44, 'table', 'open', '66', '2018-05-29 16:52:53', '2018-05-29 16:54:41', 'admin'),
(45, 'table', 'open', '66', '2018-05-29 16:57:16', '2018-05-29 16:57:36', 'admin'),
(46, 'table', 'open', '66', '2018-05-29 16:57:40', '2018-05-29 16:58:10', 'admin'),
(47, 'table', 'open', '66', '2018-05-29 16:58:19', '2018-05-29 16:58:19', 'admin'),
(48, 'table', 'open', '66', '2018-05-29 16:58:26', '2018-05-29 16:58:57', 'admin'),
(49, 'table', 'open', '66', '2018-05-29 16:59:03', '2018-05-29 16:59:14', 'admin'),
(50, 'table', 'open', '66', '2018-05-29 16:59:15', '2018-05-29 16:59:36', 'admin'),
(51, 'table', 'open', '66', '2018-05-29 16:59:44', '2018-05-29 16:59:54', 'admin'),
(52, 'table', 'open', '66', '2018-05-29 16:59:57', '2018-05-29 17:00:49', 'admin'),
(53, 'structure', 'open', '0', '2018-05-29 17:00:02', NULL, 'admin'),
(54, 'structure', 'open', '30', '2018-05-29 17:00:05', NULL, 'admin'),
(55, 'structure', 'add', '127', '2018-05-29 17:00:09', NULL, 'admin'),
(56, 'structure', 'open', '30', '2018-05-29 17:00:09', NULL, 'admin'),
(57, 'table', 'open', '66', '2018-05-29 17:00:56', '2018-05-29 17:03:18', 'admin'),
(58, 'structure', 'open', '0', '2018-05-29 17:01:01', NULL, 'admin'),
(59, 'structure', 'open', '30', '2018-05-29 17:01:03', NULL, 'admin'),
(60, 'structure', 'remove', '127', '2018-05-29 17:01:07', NULL, 'admin'),
(61, 'table', 'remove', '127', '2018-05-29 17:01:07', NULL, 'admin'),
(62, 'structure', 'open', '30', '2018-05-29 17:01:07', NULL, 'admin'),
(63, 'table', 'open', '66', '2018-05-29 17:03:21', '2018-05-29 17:07:10', 'admin'),
(64, 'structure', 'open', '0', '2018-05-29 17:06:44', NULL, 'admin'),
(65, 'structure', 'open', '30', '2018-05-29 17:06:45', NULL, 'admin'),
(66, 'structure', 'add', '128', '2018-05-29 17:06:49', NULL, 'admin'),
(67, 'structure', 'open', '30', '2018-05-29 17:06:49', NULL, 'admin'),
(68, 'table', 'open', '66', '2018-05-29 17:07:15', '2018-05-29 17:07:16', 'admin'),
(69, 'table', 'open', '66', '2018-05-29 17:07:27', '2018-05-29 17:08:07', 'admin'),
(70, 'structure', 'open', '0', '2018-05-29 17:07:29', NULL, 'admin'),
(71, 'structure', 'open', '30', '2018-05-29 17:07:31', NULL, 'admin'),
(72, 'structure', 'remove', '128', '2018-05-29 17:07:35', NULL, 'admin'),
(73, 'table', 'remove', '128', '2018-05-29 17:07:35', NULL, 'admin'),
(74, 'structure', 'open', '30', '2018-05-29 17:07:35', NULL, 'admin'),
(75, 'structure', 'add', '129', '2018-05-29 17:07:46', NULL, 'admin'),
(76, 'structure', 'open', '30', '2018-05-29 17:07:46', NULL, 'admin'),
(77, 'structure', 'add', '130', '2018-05-29 17:07:50', NULL, 'admin'),
(78, 'structure', 'open', '30', '2018-05-29 17:07:50', NULL, 'admin'),
(79, 'structure', 'open', '30', '2018-05-29 17:08:01', NULL, 'admin'),
(80, 'structure', 'remove', '129', '2018-05-29 17:08:03', NULL, 'admin'),
(81, 'table', 'remove', '129', '2018-05-29 17:08:03', NULL, 'admin'),
(82, 'structure', 'open', '30', '2018-05-29 17:08:03', NULL, 'admin'),
(83, 'table', 'open', '66', '2018-05-29 17:08:14', '2018-05-29 17:09:44', 'admin'),
(84, 'structure', 'open', '0', '2018-05-29 17:08:38', NULL, 'admin'),
(85, 'table', 'open', '66', '2018-05-29 17:09:51', '2018-05-29 17:10:21', 'admin'),
(86, 'structure', 'open', '0', '2018-05-29 17:09:51', NULL, 'admin'),
(87, 'table', 'open', '66', '2018-05-29 17:10:25', '2018-05-29 17:11:16', 'admin'),
(88, 'structure', 'open', '0', '2018-05-29 17:10:27', NULL, 'admin'),
(89, 'table', 'open', '66', '2018-05-29 17:11:18', '2018-05-29 17:11:49', 'admin'),
(90, 'structure', 'open', '0', '2018-05-29 17:11:21', NULL, 'admin'),
(91, 'table', 'open', '66', '2018-05-29 17:11:55', '2018-05-29 17:11:56', 'admin'),
(92, 'table', 'open', '66', '2018-05-29 17:11:59', '2018-05-29 17:13:20', 'admin'),
(93, 'structure', 'open', '0', '2018-05-29 17:12:31', NULL, 'admin'),
(94, 'table', 'open', '66', '2018-05-29 17:13:21', '2018-05-29 17:14:22', 'admin'),
(95, 'structure', 'open', '0', '2018-05-29 17:13:23', NULL, 'admin'),
(96, 'table', 'open', '66', '2018-05-29 17:14:33', '2018-05-29 17:15:03', 'admin'),
(97, 'table', 'open', '66', '2018-05-29 17:15:13', '2018-05-29 17:15:13', 'admin'),
(98, 'table', 'open', '66', '2018-05-29 17:15:22', '2018-05-29 17:15:32', 'admin'),
(99, 'table', 'open', '66', '2018-05-29 17:15:35', '2018-05-29 17:16:05', 'admin'),
(100, 'structure', 'open', '0', '2018-05-29 17:15:36', NULL, 'admin'),
(101, 'table', 'open', '66', '2018-05-29 17:16:15', '2018-05-29 17:19:40', 'admin'),
(102, 'structure', 'open', '0', '2018-05-29 17:16:16', NULL, 'admin'),
(104, 'structure', 'open', '0', '2018-05-29 17:16:58', NULL, 'admin'),
(105, 'structure', 'open', '2', '2018-05-29 17:17:01', NULL, 'admin'),
(107, 'structure', 'open', '2', '2018-05-29 17:17:07', NULL, 'admin'),
(111, 'structure', 'open', '2', '2018-05-29 17:17:54', NULL, 'admin'),
(112, 'structure', 'open', '3', '2018-05-29 17:18:38', NULL, 'admin'),
(113, 'table', 'open', '66', '2018-05-29 17:19:44', '2018-05-29 17:20:14', 'admin'),
(114, 'structure', 'open', '0', '2018-05-29 17:19:46', NULL, 'admin'),
(115, 'table', 'open', '66', '2018-05-29 17:24:59', '2018-05-29 17:26:05', 'admin');

-- --------------------------------------------------------

--
-- Структура таблицы `my_list`
--

CREATE TABLE `my_list` (
  `id` int(11) NOT NULL,
  `value_id` int(11) NOT NULL,
  `my_key` varchar(128) NOT NULL,
  `value` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `my_list`
--

INSERT INTO `my_list` (`id`, `value_id`, `my_key`, `value`) VALUES
(11, 2, '0', 'Новое значение'),
(12, 2, '1', 'Запасное значение'),
(13, 2, '2', 'Нужное значение');

-- --------------------------------------------------------

--
-- Структура таблицы `my_values`
--

CREATE TABLE `my_values` (
  `id` int(11) NOT NULL,
  `type` varchar(12) NOT NULL,
  `value` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `my_values`
--

INSERT INTO `my_values` (`id`, `type`, `value`) VALUES
(2, 'array', ''),
(3, 'value', 'О привет'),
(4, 'value', '10');

-- --------------------------------------------------------

--
-- Структура таблицы `password`
--

CREATE TABLE `password` (
  `login` varchar(32) NOT NULL,
  `hash` varchar(128) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `password`
--

INSERT INTO `password` (`login`, `hash`) VALUES
('admin', '$2a$10$644bb3233e1ff251b4b4eumdZjoiZjWjFLyol.Ad7uUoNWlWCpz.u'),
('test2', '$2a$10$f0554db900bd99b886844OdyZRm8Pj8VdtBrP2yN9X6UMZw9uYGyK'),
('test', '$2a$10$7d0d371b1145ea31ce80fuwFQ49WWns6aJoxy0LvtqvOFMH2cZ7d6');

-- --------------------------------------------------------

--
-- Структура таблицы `registration`
--

CREATE TABLE `registration` (
  `login` varchar(32) NOT NULL,
  `role` varchar(32) DEFAULT NULL,
  `dater` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `registration`
--

INSERT INTO `registration` (`login`, `role`, `dater`) VALUES
('admin', 'Администратор', '2017-12-25 15:57:01'),
('test', 'Инженер', '2018-04-20 13:59:03'),
('test2', 'Администратор', '2018-05-22 16:25:53');

-- --------------------------------------------------------

--
-- Структура таблицы `rights`
--

CREATE TABLE `rights` (
  `id` int(11) NOT NULL,
  `objectId` int(11) NOT NULL,
  `type` varchar(10) NOT NULL,
  `login` varchar(64) NOT NULL,
  `rights` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `rights`
--

INSERT INTO `rights` (`id`, `objectId`, `type`, `login`, `rights`) VALUES
(105, 126, 'role', 'Инженер', 9),
(107, 66, 'role', 'Инженер', 1),
(108, 103, 'role', 'Инженер', 1),
(109, 30, 'role', 'Инженер', 1),
(110, 32, 'role', 'Инженер', 1),
(111, 98, 'role', 'Инженер', 1),
(113, 102, 'role', 'Инженер', 1),
(114, 101, 'role', 'Инженер', 15);

-- --------------------------------------------------------

--
-- Структура таблицы `roles`
--

CREATE TABLE `roles` (
  `role` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `roles`
--

INSERT INTO `roles` (`role`) VALUES
('Администратор'),
('Инженер'),
('Менеджер');

-- --------------------------------------------------------

--
-- Структура таблицы `signin`
--

CREATE TABLE `signin` (
  `id` varchar(32) NOT NULL,
  `login` varchar(32) NOT NULL,
  `checkkey` varchar(32) NOT NULL,
  `date` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `signin`
--

INSERT INTO `signin` (`id`, `login`, `checkkey`, `date`) VALUES
('G6uhkRxY834', 'test', 'b07f41e73c3f7f9bf11693998491efeb', '2018-04-25 15:52:27'),
('GJ3COg64AOP', 'admin', 'cc55d2dd747f82971f01eee7b4230d2c', '0000-00-00 00:00:00'),
('G1ke048Pjp4', 'test', 'c1b4b4743ccb6a3a91aa0c4251654d93', '2018-05-14 10:46:08'),
('GCitgV4Vlu8', 'test', '24a73c4db8ac88ae619bc4ba7d4caf61', '2018-05-23 10:04:55'),
('G0SJ63RJfse', 'test', '0f95513eeaba5dbf8069ce0c071f9769', '2018-05-23 10:31:37'),
('GgL626bOULb', 'test', 'de2efc6383c1538c02282dfc7ffcea0d', '2018-05-23 10:47:39'),
('GlXmAD3aVo4', 'test', '9c091969d438996edbf1d899f09ef925', '0000-00-00 00:00:00'),
('GjUMr2I4r38', 'admin', 'c19d07a63d3575339f2fea8915324841', '0000-00-00 00:00:00'),
('G1OjDA4Wr6Q', 'test', 'ab40f16eec263645ef89773be4d474e4', '0000-00-00 00:00:00'),
('GU8iEb3VvSz', 'test', 'dd37fc6f39b514b8d297174b8f4e1d52', '0000-00-00 00:00:00'),
('G73MhS1F4y1', 'test', '2154c8d8005f35661d0d0b1471a7578d', '0000-00-00 00:00:00'),
('G07gL0aA6AE', 'test', '5445d8965d65c3fe935fad0b4c71a708', '0000-00-00 00:00:00'),
('G4Ja7Ae1D05', 'test', '7480ab845435615bdaba14b9dcbd9550', '0000-00-00 00:00:00'),
('G8wLo0P7NOT', 'fuck', '77621457c91ade91b700d67b7d4ecc92', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Структура таблицы `structures`
--

CREATE TABLE `structures` (
  `id` int(11) NOT NULL,
  `objectType` varchar(10) NOT NULL,
  `objectId` int(11) DEFAULT NULL,
  `name` varchar(64) DEFAULT NULL,
  `parent` int(11) NOT NULL,
  `priority` int(11) DEFAULT '0',
  `info` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `structures`
--

INSERT INTO `structures` (`id`, `objectType`, `objectId`, `name`, `parent`, `priority`, `info`) VALUES
(1, 'folder', 0, 'Администрирование', 0, 3, 'Привет'),
(2, 'folder', 0, 'Пользователи', 1, 0, ''),
(3, 'folder', 0, 'Роли', 1, 0, ''),
(4, 'table', 0, 'Пользователи', 1, 0, ''),
(30, 'folder', 0, 'База знаний', 0, 0, ''),
(32, 'folder', 0, 'Проекты', 0, 1, ''),
(33, 'folder', 0, 'Шаблоны', 0, 2, ''),
(66, 'table', 0, 'Новая таблица', 98, 0, ''),
(96, 'value', 2, 'Тест', 30, 0, ''),
(97, 'value', 3, 'еуые', 30, 0, ''),
(98, 'folder', 0, 'Новая папка', 30, 0, ''),
(100, 'folder', 0, 'Файлы', 0, 5, ''),
(101, 'value', 4, 'Новое', 30, 0, ''),
(102, 'table', 0, 'Таблица для тестирования копирования', 30, 0, ''),
(103, 'table', 0, 'Новая таблица 2', 98, 0, ''),
(116, 'file', 0, 'evil-plan-baby.jpg', 100, 0, ''),
(119, 'file', 0, 'Структура.xlsx', 100, 0, ''),
(126, 'table', 0, 'Задача 1', 32, 0, '');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `fields`
--
ALTER TABLE `fields`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `main_log`
--
ALTER TABLE `main_log`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `my_list`
--
ALTER TABLE `my_list`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `my_values`
--
ALTER TABLE `my_values`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `password`
--
ALTER TABLE `password`
  ADD PRIMARY KEY (`login`);

--
-- Индексы таблицы `registration`
--
ALTER TABLE `registration`
  ADD PRIMARY KEY (`login`);

--
-- Индексы таблицы `rights`
--
ALTER TABLE `rights`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role`);

--
-- Индексы таблицы `signin`
--
ALTER TABLE `signin`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `structures`
--
ALTER TABLE `structures`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `fields`
--
ALTER TABLE `fields`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=977;

--
-- AUTO_INCREMENT для таблицы `main_log`
--
ALTER TABLE `main_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT для таблицы `my_list`
--
ALTER TABLE `my_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT для таблицы `my_values`
--
ALTER TABLE `my_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `rights`
--
ALTER TABLE `rights`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT для таблицы `structures`
--
ALTER TABLE `structures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
