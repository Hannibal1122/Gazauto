-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Май 30 2018 г., 15:58
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
(772, 102, 1, 'Первое поле', 'value', '123sdfsdf12asdasd', NULL, NULL, 20, NULL),
(773, 102, 2, 'Первое поле', 'link', '1', 2, 'value', 10, NULL),
(774, 66, 0, 'Номер', 'head', NULL, NULL, NULL, 0, NULL),
(775, 66, 1, 'Название', 'head', NULL, NULL, NULL, 0, NULL),
(776, 66, 2, 'Модель', 'head', NULL, NULL, NULL, 0, NULL),
(777, 66, 3, 'тест', 'head', NULL, NULL, NULL, 0, NULL),
(792, 66, 2, 'Номер', 'link', '2', 2, 'value', 100, NULL),
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
(806, 66, 6, 'Название', 'link', '0', 126, 'table', 0, NULL),
(807, 66, 6, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(808, 66, 6, 'тест', 'value', '', NULL, NULL, 0, NULL),
(889, 66, 7, 'Номер', 'link', '1', 2, 'value', 0, NULL),
(890, 66, 7, 'Название', 'link', '0', 102, 'table', 0, NULL),
(891, 66, 7, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(892, 66, 7, 'тест', 'value', '', NULL, NULL, 0, NULL),
(893, 66, 8, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(894, 66, 8, 'Название', 'value', 'Новое значение', NULL, NULL, 0, NULL),
(895, 66, 8, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(896, 66, 8, 'тест', 'value', '', NULL, NULL, 0, NULL),
(897, 66, 9, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(898, 66, 9, 'Название', 'value', '10000', NULL, NULL, 40, NULL),
(899, 66, 9, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(900, 66, 9, 'тест', 'value', '', NULL, NULL, 0, NULL),
(901, 66, 10, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(902, 66, 10, 'Название', 'link', '0', 2, 'value', 0, NULL),
(903, 66, 10, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(904, 66, 10, 'тест', 'value', '', NULL, NULL, 0, NULL),
(905, 66, 11, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(906, 66, 11, 'Название', 'value', 'дратути 1', NULL, NULL, 20, NULL),
(907, 66, 11, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(908, 66, 11, 'тест', 'value', '', NULL, NULL, 0, NULL),
(909, 66, 12, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(910, 66, 12, 'Название', 'value', '10', NULL, NULL, 20, NULL),
(911, 66, 12, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(912, 66, 12, 'тест', 'value', '', NULL, NULL, 0, NULL),
(913, 66, 13, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(914, 66, 13, 'Название', 'value', 'Новое значение', NULL, NULL, 0, NULL),
(915, 66, 13, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(916, 66, 13, 'тест', 'value', '', NULL, NULL, 0, NULL),
(917, 66, 14, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(918, 66, 14, 'Название', 'link', '0', 3, 'value', 40, NULL),
(919, 66, 14, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(920, 66, 14, 'тест', 'value', '', NULL, NULL, 0, NULL),
(921, 66, 15, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(922, 66, 15, 'Название', 'link', '1', 2, 'value', 0, NULL),
(923, 66, 15, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(924, 66, 15, 'тест', 'value', '', NULL, NULL, 0, NULL),
(925, 66, 16, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(926, 66, 16, 'Название', 'link', '', 976, 'cell', 0, NULL),
(927, 66, 16, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(928, 66, 16, 'тест', 'value', '', NULL, NULL, 0, NULL),
(929, 66, 17, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(930, 66, 17, 'Название', 'value', '', NULL, NULL, 50, NULL),
(931, 66, 17, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(932, 66, 17, 'тест', 'value', '', NULL, NULL, 0, NULL),
(933, 66, 18, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(934, 66, 18, 'Название', 'value', '123456456', NULL, NULL, 60, NULL),
(935, 66, 18, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(936, 66, 18, 'тест', 'value', '', NULL, NULL, 0, NULL),
(937, 66, 19, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(938, 66, 19, 'Название', 'value', '', NULL, NULL, 0, NULL),
(939, 66, 19, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(940, 66, 19, 'тест', 'value', '', NULL, NULL, 0, NULL),
(941, 66, 20, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(942, 66, 20, 'Название', 'value', '321', NULL, NULL, 0, NULL),
(943, 66, 20, 'Модель', 'value', '', NULL, NULL, 0, NULL),
(944, 66, 20, 'тест', 'value', '', NULL, NULL, 0, NULL),
(945, 66, 21, 'Номер', 'link', '0', 2, 'value', 0, NULL),
(946, 66, 21, 'Название', 'value', '123', NULL, NULL, 0, NULL),
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
(968, 126, 1, 'Таблицы', 'link', '0', 66, 'table', 0, NULL),
(969, 126, 1, 'Ячейки', 'value', '', NULL, NULL, 100, NULL),
(970, 126, 1, 'Файлы', 'link', '0', 116, 'file', 0, NULL),
(971, 102, 4, 'Первое поле', 'link', '', 934, 'cell', 0, NULL),
(975, 103, 0, 'тест', 'head', NULL, NULL, NULL, 0, NULL),
(976, 103, 1, 'тест', 'value', '123', NULL, NULL, 0, NULL),
(977, 126, 2, 'Таблицы', 'value', '124315341', NULL, NULL, 0, NULL),
(978, 126, 2, 'Ячейки', 'value', '12431534', NULL, NULL, 50, NULL),
(979, 126, 2, 'Файлы', 'value', '', NULL, NULL, 0, NULL),
(980, 126, 3, 'Таблицы', 'value', '12431534qwe', NULL, NULL, 20, NULL),
(981, 126, 3, 'Ячейки', 'value', '', NULL, NULL, 0, NULL),
(982, 126, 3, 'Файлы', 'value', '', NULL, NULL, 0, NULL),
(983, 126, 4, 'Таблицы', 'value', '12431534123123asdasd', NULL, NULL, 30, NULL),
(984, 126, 4, 'Ячейки', 'value', 'asdasd', NULL, NULL, 0, NULL),
(985, 126, 4, 'Файлы', 'value', '', NULL, NULL, 0, NULL);

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
(1, 'table', 'open', '66', '2018-05-30 16:23:41', '2018-05-30 16:24:36', 'admin'),
(2, 'table', 'open', '126', '2018-05-30 16:23:56', '2018-05-30 16:24:36', 'admin'),
(3, 'table', 'open', '66', '2018-05-30 16:24:38', '2018-05-30 16:26:27', 'admin'),
(4, 'table', 'open', '126', '2018-05-30 16:24:49', '2018-05-30 16:25:31', 'admin'),
(5, 'table', 'update', '126', '2018-05-30 16:25:31', NULL, 'admin'),
(6, 'table', 'open', '126', '2018-05-30 16:25:31', '2018-05-30 16:26:48', 'admin'),
(7, 'table', 'updateState', '126', '2018-05-30 16:25:44', NULL, 'admin'),
(8, 'table', 'updateState', '126', '2018-05-30 16:25:47', NULL, 'admin'),
(9, 'structure', 'open', '30', '2018-05-30 16:26:19', NULL, 'admin'),
(10, 'table', 'open', '102', '2018-05-30 16:26:20', '2018-05-30 16:28:34', 'admin'),
(11, 'table', 'updateState', '102', '2018-05-30 16:26:27', NULL, 'admin'),
(12, 'table', 'open', '66', '2018-05-30 16:26:27', '2018-05-30 16:26:28', 'admin'),
(13, 'table', 'open', '66', '2018-05-30 16:26:29', '2018-05-30 16:26:43', 'admin'),
(14, 'table', 'updateState', '102', '2018-05-30 16:26:42', NULL, 'admin'),
(15, 'table', 'open', '66', '2018-05-30 16:26:43', '2018-05-30 16:26:54', 'admin'),
(16, 'table', 'open', '126', '2018-05-30 16:26:49', '2018-05-30 16:28:34', 'admin'),
(17, 'table', 'open', '66', '2018-05-30 16:26:54', '2018-05-30 16:27:02', 'admin'),
(18, 'table', 'updateState', '102', '2018-05-30 16:27:02', NULL, 'admin'),
(19, 'table', 'open', '66', '2018-05-30 16:27:02', '2018-05-30 16:27:03', 'admin'),
(20, 'table', 'open', '66', '2018-05-30 16:27:03', '2018-05-30 16:28:34', 'admin'),
(21, 'table', 'open', '66', '2018-05-30 16:28:35', NULL, 'admin'),
(22, 'table', 'open', '66', '2018-05-30 16:28:36', NULL, 'admin'),
(23, 'table', 'open', '66', '2018-05-30 16:28:37', NULL, 'admin'),
(24, 'table', 'open', '66', '2018-05-30 16:28:38', NULL, 'admin'),
(25, 'table', 'open', '66', '2018-05-30 16:28:39', NULL, 'admin'),
(26, 'table', 'open', '66', '2018-05-30 16:28:40', NULL, 'admin'),
(27, 'table', 'open', '66', '2018-05-30 16:28:41', NULL, 'admin'),
(28, 'table', 'open', '66', '2018-05-30 16:28:42', NULL, 'admin'),
(29, 'table', 'open', '66', '2018-05-30 16:28:44', NULL, 'admin'),
(30, 'table', 'open', '66', '2018-05-30 16:28:45', NULL, 'admin'),
(31, 'table', 'open', '66', '2018-05-30 16:28:46', NULL, 'admin'),
(32, 'table', 'open', '66', '2018-05-30 16:28:47', NULL, 'admin'),
(33, 'table', 'open', '66', '2018-05-30 16:28:48', NULL, 'admin'),
(34, 'table', 'open', '66', '2018-05-30 16:28:49', NULL, 'admin'),
(35, 'table', 'open', '66', '2018-05-30 16:28:50', NULL, 'admin'),
(36, 'table', 'open', '66', '2018-05-30 16:28:51', NULL, 'admin'),
(37, 'table', 'open', '66', '2018-05-30 16:28:52', NULL, 'admin'),
(38, 'table', 'open', '66', '2018-05-30 16:28:53', NULL, 'admin'),
(39, 'table', 'open', '66', '2018-05-30 16:28:54', NULL, 'admin'),
(40, 'table', 'open', '66', '2018-05-30 16:28:55', NULL, 'admin'),
(41, 'table', 'open', '66', '2018-05-30 16:28:56', NULL, 'admin'),
(42, 'table', 'open', '66', '2018-05-30 16:28:57', NULL, 'admin'),
(43, 'table', 'open', '66', '2018-05-30 16:28:58', NULL, 'admin'),
(44, 'table', 'open', '66', '2018-05-30 16:29:00', NULL, 'admin'),
(45, 'table', 'open', '66', '2018-05-30 16:29:01', NULL, 'admin'),
(46, 'table', 'open', '66', '2018-05-30 16:29:02', NULL, 'admin'),
(47, 'table', 'open', '66', '2018-05-30 16:29:03', NULL, 'admin'),
(48, 'table', 'open', '66', '2018-05-30 16:29:04', NULL, 'admin'),
(49, 'table', 'open', '66', '2018-05-30 16:29:05', NULL, 'admin'),
(50, 'table', 'open', '66', '2018-05-30 16:29:06', NULL, 'admin'),
(51, 'table', 'open', '66', '2018-05-30 16:29:07', NULL, 'admin'),
(52, 'table', 'open', '66', '2018-05-30 16:29:08', NULL, 'admin'),
(53, 'table', 'open', '66', '2018-05-30 16:29:09', NULL, 'admin'),
(54, 'table', 'open', '66', '2018-05-30 16:29:10', NULL, 'admin'),
(55, 'table', 'open', '66', '2018-05-30 16:29:11', NULL, 'admin'),
(56, 'table', 'open', '66', '2018-05-30 16:29:12', NULL, 'admin'),
(57, 'table', 'open', '66', '2018-05-30 16:29:13', NULL, 'admin'),
(58, 'table', 'open', '66', '2018-05-30 16:29:14', NULL, 'admin'),
(59, 'table', 'open', '66', '2018-05-30 16:29:15', NULL, 'admin'),
(60, 'table', 'open', '66', '2018-05-30 16:29:16', NULL, 'admin'),
(61, 'table', 'open', '66', '2018-05-30 16:29:17', NULL, 'admin'),
(62, 'table', 'open', '66', '2018-05-30 16:29:18', NULL, 'admin'),
(63, 'table', 'open', '66', '2018-05-30 16:29:20', NULL, 'admin'),
(64, 'table', 'open', '66', '2018-05-30 16:29:21', NULL, 'admin'),
(65, 'table', 'open', '66', '2018-05-30 16:29:22', NULL, 'admin'),
(66, 'table', 'open', '66', '2018-05-30 16:29:23', NULL, 'admin'),
(67, 'table', 'open', '66', '2018-05-30 16:29:24', NULL, 'admin'),
(68, 'table', 'open', '66', '2018-05-30 16:29:25', NULL, 'admin'),
(69, 'table', 'open', '66', '2018-05-30 16:29:26', NULL, 'admin'),
(70, 'table', 'open', '66', '2018-05-30 16:29:27', NULL, 'admin'),
(71, 'table', 'open', '66', '2018-05-30 16:29:28', NULL, 'admin'),
(72, 'table', 'open', '66', '2018-05-30 16:29:29', NULL, 'admin'),
(73, 'table', 'open', '66', '2018-05-30 16:29:30', NULL, 'admin'),
(74, 'table', 'open', '66', '2018-05-30 16:29:31', NULL, 'admin'),
(75, 'table', 'open', '66', '2018-05-30 16:29:32', NULL, 'admin'),
(76, 'table', 'open', '66', '2018-05-30 16:29:33', NULL, 'admin'),
(77, 'table', 'open', '66', '2018-05-30 16:29:34', NULL, 'admin'),
(78, 'table', 'open', '66', '2018-05-30 16:29:35', NULL, 'admin'),
(79, 'table', 'open', '66', '2018-05-30 16:29:36', NULL, 'admin'),
(80, 'table', 'open', '66', '2018-05-30 16:29:37', NULL, 'admin'),
(81, 'table', 'open', '66', '2018-05-30 16:29:38', NULL, 'admin'),
(82, 'table', 'open', '66', '2018-05-30 16:29:39', NULL, 'admin'),
(83, 'table', 'open', '66', '2018-05-30 16:29:40', NULL, 'admin'),
(84, 'table', 'open', '66', '2018-05-30 16:29:41', NULL, 'admin'),
(85, 'table', 'open', '66', '2018-05-30 16:29:43', NULL, 'admin'),
(86, 'table', 'open', '66', '2018-05-30 16:29:44', NULL, 'admin'),
(87, 'table', 'open', '66', '2018-05-30 16:29:45', NULL, 'admin'),
(88, 'table', 'open', '66', '2018-05-30 16:29:46', NULL, 'admin'),
(89, 'table', 'open', '66', '2018-05-30 16:29:47', NULL, 'admin'),
(90, 'table', 'open', '66', '2018-05-30 16:29:48', NULL, 'admin'),
(91, 'table', 'open', '66', '2018-05-30 16:29:49', NULL, 'admin'),
(92, 'table', 'open', '66', '2018-05-30 16:29:50', NULL, 'admin'),
(93, 'table', 'open', '66', '2018-05-30 16:29:51', NULL, 'admin'),
(94, 'table', 'open', '66', '2018-05-30 16:29:52', NULL, 'admin'),
(95, 'table', 'open', '66', '2018-05-30 16:29:53', NULL, 'admin'),
(96, 'table', 'open', '66', '2018-05-30 16:29:54', NULL, 'admin'),
(97, 'table', 'open', '66', '2018-05-30 16:29:55', NULL, 'admin'),
(98, 'table', 'open', '66', '2018-05-30 16:29:56', NULL, 'admin'),
(99, 'table', 'open', '66', '2018-05-30 16:29:57', NULL, 'admin'),
(100, 'table', 'open', '66', '2018-05-30 16:29:58', NULL, 'admin'),
(101, 'table', 'open', '66', '2018-05-30 16:29:59', NULL, 'admin'),
(102, 'table', 'open', '66', '2018-05-30 16:30:00', NULL, 'admin'),
(103, 'table', 'open', '66', '2018-05-30 16:30:02', NULL, 'admin'),
(104, 'table', 'open', '66', '2018-05-30 16:30:03', NULL, 'admin'),
(105, 'table', 'open', '66', '2018-05-30 16:30:04', NULL, 'admin'),
(106, 'table', 'open', '66', '2018-05-30 16:30:05', NULL, 'admin'),
(107, 'table', 'open', '66', '2018-05-30 16:30:06', NULL, 'admin'),
(108, 'table', 'open', '66', '2018-05-30 16:30:07', NULL, 'admin'),
(109, 'table', 'open', '66', '2018-05-30 16:30:08', NULL, 'admin'),
(110, 'table', 'open', '66', '2018-05-30 16:30:09', NULL, 'admin'),
(111, 'table', 'open', '66', '2018-05-30 16:30:10', NULL, 'admin'),
(112, 'table', 'open', '66', '2018-05-30 16:30:11', NULL, 'admin'),
(113, 'table', 'open', '66', '2018-05-30 16:30:12', NULL, 'admin'),
(114, 'table', 'open', '66', '2018-05-30 16:30:13', NULL, 'admin'),
(115, 'table', 'open', '66', '2018-05-30 16:30:14', NULL, 'admin'),
(116, 'table', 'open', '66', '2018-05-30 16:30:15', NULL, 'admin'),
(117, 'table', 'open', '66', '2018-05-30 16:30:17', NULL, 'admin'),
(118, 'table', 'open', '66', '2018-05-30 16:30:18', NULL, 'admin'),
(119, 'table', 'open', '66', '2018-05-30 16:30:19', NULL, 'admin'),
(120, 'table', 'open', '66', '2018-05-30 16:30:20', NULL, 'admin'),
(121, 'table', 'open', '66', '2018-05-30 16:30:21', NULL, 'admin'),
(122, 'table', 'open', '66', '2018-05-30 16:30:23', NULL, 'admin'),
(123, 'table', 'open', '66', '2018-05-30 16:30:24', NULL, 'admin'),
(124, 'table', 'open', '66', '2018-05-30 16:30:25', NULL, 'admin'),
(125, 'table', 'open', '66', '2018-05-30 16:30:26', NULL, 'admin'),
(126, 'table', 'open', '66', '2018-05-30 16:30:27', NULL, 'admin'),
(127, 'table', 'open', '66', '2018-05-30 16:30:28', NULL, 'admin'),
(128, 'table', 'open', '66', '2018-05-30 16:30:29', NULL, 'admin'),
(129, 'table', 'open', '66', '2018-05-30 16:30:30', NULL, 'admin'),
(130, 'table', 'open', '66', '2018-05-30 16:30:31', NULL, 'admin'),
(131, 'table', 'open', '66', '2018-05-30 16:30:32', NULL, 'admin'),
(132, 'table', 'open', '66', '2018-05-30 16:30:33', NULL, 'admin'),
(133, 'table', 'open', '66', '2018-05-30 16:30:34', NULL, 'admin'),
(134, 'table', 'open', '66', '2018-05-30 16:30:35', NULL, 'admin'),
(135, 'table', 'open', '66', '2018-05-30 16:30:36', NULL, 'admin'),
(136, 'table', 'open', '66', '2018-05-30 16:30:37', NULL, 'admin'),
(137, 'table', 'open', '66', '2018-05-30 16:30:38', NULL, 'admin'),
(138, 'table', 'open', '66', '2018-05-30 16:30:39', NULL, 'admin'),
(139, 'table', 'open', '66', '2018-05-30 16:30:40', NULL, 'admin'),
(140, 'table', 'open', '66', '2018-05-30 16:30:41', NULL, 'admin'),
(141, 'table', 'open', '66', '2018-05-30 16:30:42', NULL, 'admin'),
(142, 'table', 'open', '66', '2018-05-30 16:30:43', NULL, 'admin'),
(143, 'table', 'open', '66', '2018-05-30 16:30:44', NULL, 'admin'),
(144, 'table', 'open', '66', '2018-05-30 16:30:46', NULL, 'admin'),
(145, 'table', 'open', '66', '2018-05-30 16:30:47', NULL, 'admin'),
(146, 'table', 'open', '66', '2018-05-30 16:30:48', NULL, 'admin'),
(147, 'table', 'open', '66', '2018-05-30 16:30:49', NULL, 'admin'),
(148, 'table', 'open', '66', '2018-05-30 16:30:50', NULL, 'admin'),
(149, 'table', 'open', '66', '2018-05-30 16:30:51', NULL, 'admin'),
(150, 'table', 'open', '66', '2018-05-30 16:30:52', NULL, 'admin'),
(151, 'table', 'open', '66', '2018-05-30 16:30:53', NULL, 'admin'),
(152, 'table', 'open', '66', '2018-05-30 16:30:54', NULL, 'admin'),
(153, 'table', 'open', '66', '2018-05-30 16:30:55', NULL, 'admin'),
(154, 'table', 'open', '66', '2018-05-30 16:30:56', NULL, 'admin'),
(155, 'table', 'open', '66', '2018-05-30 16:30:57', NULL, 'admin'),
(156, 'table', 'open', '66', '2018-05-30 16:30:58', NULL, 'admin'),
(157, 'table', 'open', '66', '2018-05-30 16:30:59', NULL, 'admin'),
(158, 'table', 'open', '66', '2018-05-30 16:31:00', NULL, 'admin'),
(159, 'table', 'open', '66', '2018-05-30 16:31:01', NULL, 'admin'),
(160, 'table', 'open', '66', '2018-05-30 16:31:02', NULL, 'admin'),
(161, 'table', 'open', '66', '2018-05-30 16:31:03', NULL, 'admin'),
(162, 'table', 'open', '66', '2018-05-30 16:31:04', NULL, 'admin'),
(163, 'table', 'open', '66', '2018-05-30 16:31:05', NULL, 'admin'),
(164, 'table', 'open', '66', '2018-05-30 16:31:06', NULL, 'admin'),
(165, 'table', 'open', '66', '2018-05-30 16:31:07', NULL, 'admin'),
(166, 'table', 'open', '66', '2018-05-30 16:31:08', NULL, 'admin'),
(167, 'table', 'open', '66', '2018-05-30 16:31:10', NULL, 'admin'),
(168, 'table', 'open', '66', '2018-05-30 16:31:11', NULL, 'admin'),
(169, 'table', 'open', '66', '2018-05-30 16:31:12', NULL, 'admin'),
(170, 'table', 'open', '66', '2018-05-30 16:31:13', NULL, 'admin'),
(171, 'table', 'open', '66', '2018-05-30 16:31:14', NULL, 'admin'),
(172, 'table', 'open', '66', '2018-05-30 16:31:15', NULL, 'admin'),
(173, 'table', 'open', '66', '2018-05-30 16:31:16', NULL, 'admin'),
(174, 'table', 'open', '66', '2018-05-30 16:31:17', NULL, 'admin'),
(175, 'table', 'open', '66', '2018-05-30 16:31:18', NULL, 'admin'),
(176, 'table', 'open', '66', '2018-05-30 16:31:19', NULL, 'admin'),
(177, 'table', 'open', '66', '2018-05-30 16:31:20', NULL, 'admin'),
(178, 'table', 'open', '66', '2018-05-30 16:31:21', NULL, 'admin'),
(179, 'table', 'open', '66', '2018-05-30 16:31:22', NULL, 'admin'),
(180, 'table', 'open', '66', '2018-05-30 16:31:41', '2018-05-30 16:31:52', 'admin'),
(181, 'table', 'open', '66', '2018-05-30 16:31:54', '2018-05-30 16:31:57', 'admin'),
(182, 'table', 'open', '66', '2018-05-30 16:31:59', '2018-05-30 16:32:17', 'admin'),
(183, 'table', 'open', '126', '2018-05-30 16:32:02', '2018-05-30 16:32:22', 'admin'),
(184, 'table', 'updateState', '126', '2018-05-30 16:32:05', NULL, 'admin'),
(185, 'table', 'updateState', '126', '2018-05-30 16:32:09', NULL, 'admin'),
(186, 'table', 'open', '102', '2018-05-30 16:32:12', '2018-05-30 16:33:40', 'admin'),
(187, 'table', 'updateState', '102', '2018-05-30 16:32:16', NULL, 'admin'),
(188, 'table', 'open', '66', '2018-05-30 16:32:17', '2018-05-30 16:32:33', 'admin'),
(189, 'table', 'open', '126', '2018-05-30 16:32:22', '2018-05-30 16:33:41', 'admin'),
(190, 'table', 'open', '66', '2018-05-30 16:32:34', '2018-05-30 16:33:41', 'admin'),
(191, 'table', 'open', '66', '2018-05-30 16:33:42', '2018-05-30 16:34:38', 'admin'),
(192, 'table', 'open', '66', '2018-05-30 16:34:39', '2018-05-30 16:34:55', 'admin'),
(193, 'table', 'open', '126', '2018-05-30 16:34:41', '2018-05-30 16:34:55', 'admin'),
(194, 'table', 'open', '102', '2018-05-30 16:34:48', '2018-05-30 16:35:47', 'admin'),
(195, 'table', 'updateState', '102', '2018-05-30 16:34:54', NULL, 'admin'),
(196, 'table', 'open', '66', '2018-05-30 16:34:55', '2018-05-30 16:35:04', 'admin'),
(197, 'table', 'open', '126', '2018-05-30 16:34:55', '2018-05-30 16:35:06', 'admin'),
(198, 'table', 'open', '66', '2018-05-30 16:35:05', '2018-05-30 16:37:53', 'admin'),
(199, 'table', 'open', '126', '2018-05-30 16:35:07', '2018-05-30 16:37:53', 'admin'),
(200, 'table', 'updateState', '66', '2018-05-30 16:35:47', NULL, 'admin'),
(201, 'table', 'update', '66', '2018-05-30 16:35:47', NULL, 'admin'),
(202, 'table', 'open', '102', '2018-05-30 16:35:47', '2018-05-30 16:35:48', 'admin'),
(203, 'table', 'open', '102', '2018-05-30 16:35:48', '2018-05-30 16:35:58', 'admin'),
(204, 'table', 'open', '102', '2018-05-30 16:35:59', '2018-05-30 16:36:05', 'admin'),
(205, 'table', 'updateState', '66', '2018-05-30 16:36:05', NULL, 'admin'),
(206, 'table', 'open', '102', '2018-05-30 16:36:05', '2018-05-30 16:36:06', 'admin'),
(207, 'table', 'open', '102', '2018-05-30 16:36:06', '2018-05-30 16:36:11', 'admin'),
(208, 'table', 'updateState', '66', '2018-05-30 16:36:11', NULL, 'admin'),
(209, 'table', 'open', '102', '2018-05-30 16:36:11', '2018-05-30 16:36:13', 'admin'),
(210, 'table', 'open', '102', '2018-05-30 16:36:13', '2018-05-30 16:37:53', 'admin'),
(211, 'table', 'open', '66', '2018-05-30 16:37:55', '2018-05-30 16:38:52', 'admin'),
(212, 'table', 'open', '66', '2018-05-30 16:38:53', '2018-05-30 16:38:55', 'admin'),
(213, 'table', 'open', '66', '2018-05-30 16:38:57', '2018-05-30 16:39:46', 'admin'),
(214, 'table', 'open', '126', '2018-05-30 16:39:03', '2018-05-30 16:39:46', 'admin'),
(215, 'table', 'open', '102', '2018-05-30 16:39:08', '2018-05-30 16:39:19', 'admin'),
(216, 'table', 'updateState', '66', '2018-05-30 16:39:19', NULL, 'admin'),
(217, 'table', 'open', '102', '2018-05-30 16:39:20', '2018-05-30 16:39:46', 'admin'),
(218, 'table', 'open', '66', '2018-05-30 16:39:48', '2018-05-30 16:40:44', 'admin'),
(219, 'table', 'open', '102', '2018-05-30 16:39:49', '2018-05-30 16:39:56', 'admin'),
(220, 'table', 'updateState', '66', '2018-05-30 16:39:55', NULL, 'admin'),
(221, 'table', 'open', '102', '2018-05-30 16:39:56', '2018-05-30 16:40:04', 'admin'),
(222, 'table', 'updateState', '66', '2018-05-30 16:40:04', NULL, 'admin'),
(223, 'table', 'open', '102', '2018-05-30 16:40:05', '2018-05-30 16:40:15', 'admin'),
(224, 'table', 'update', '66', '2018-05-30 16:40:15', NULL, 'admin'),
(225, 'table', 'open', '102', '2018-05-30 16:40:15', '2018-05-30 16:40:16', 'admin'),
(226, 'table', 'open', '102', '2018-05-30 16:40:16', '2018-05-30 16:40:44', 'admin'),
(227, 'table', 'open', '66', '2018-05-30 16:40:45', '2018-05-30 16:42:38', 'admin'),
(228, 'table', 'open', '66', '2018-05-30 16:42:40', '2018-05-30 16:43:08', 'admin'),
(229, 'table', 'open', '66', '2018-05-30 16:43:10', '2018-05-30 16:44:12', 'admin'),
(230, 'table', 'open', '102', '2018-05-30 16:43:22', '2018-05-30 16:43:30', 'admin'),
(231, 'table', 'updateState', '66', '2018-05-30 16:43:29', NULL, 'admin'),
(232, 'table', 'open', '102', '2018-05-30 16:43:30', '2018-05-30 16:43:56', 'admin'),
(233, 'table', 'updateState', '66', '2018-05-30 16:43:56', NULL, 'admin'),
(234, 'table', 'open', '102', '2018-05-30 16:43:56', '2018-05-30 16:43:57', 'admin'),
(235, 'table', 'open', '102', '2018-05-30 16:43:56', '2018-05-30 16:43:57', 'admin'),
(236, 'table', 'open', '102', '2018-05-30 16:43:56', '2018-05-30 16:43:57', 'admin'),
(237, 'table', 'open', '102', '2018-05-30 16:43:56', '2018-05-30 16:43:57', 'admin'),
(238, 'table', 'open', '102', '2018-05-30 16:43:56', '2018-05-30 16:43:57', 'admin'),
(239, 'table', 'open', '102', '2018-05-30 16:43:56', '2018-05-30 16:43:57', 'admin'),
(240, 'table', 'open', '102', '2018-05-30 16:43:56', '2018-05-30 16:43:57', 'admin'),
(241, 'table', 'open', '102', '2018-05-30 16:43:56', '2018-05-30 16:43:57', 'admin'),
(242, 'table', 'open', '102', '2018-05-30 16:43:56', '2018-05-30 16:43:57', 'admin'),
(243, 'table', 'open', '102', '2018-05-30 16:43:56', '2018-05-30 16:43:57', 'admin'),
(244, 'table', 'open', '102', '2018-05-30 16:43:56', '2018-05-30 16:43:57', 'admin'),
(245, 'table', 'open', '102', '2018-05-30 16:43:57', '2018-05-30 16:44:12', 'admin'),
(246, 'table', 'open', '66', '2018-05-30 16:44:14', '2018-05-30 16:49:26', 'admin'),
(247, 'table', 'open', '102', '2018-05-30 16:44:19', '2018-05-30 16:44:29', 'admin'),
(248, 'table', 'updateState', '66', '2018-05-30 16:44:24', NULL, 'admin'),
(249, 'table', 'open', '102', '2018-05-30 16:44:29', '2018-05-30 16:45:00', 'admin'),
(250, 'table', 'updateState', '66', '2018-05-30 16:44:52', NULL, 'admin'),
(251, 'table', 'open', '102', '2018-05-30 16:45:00', '2018-05-30 16:47:00', 'admin'),
(252, 'table', 'updateState', '66', '2018-05-30 16:46:52', NULL, 'admin'),
(253, 'table', 'open', '102', '2018-05-30 16:47:00', '2018-05-30 16:47:10', 'admin'),
(254, 'table', 'updateState', '66', '2018-05-30 16:47:10', NULL, 'admin'),
(255, 'table', 'open', '102', '2018-05-30 16:47:10', '2018-05-30 16:47:10', 'admin'),
(256, 'table', 'open', '102', '2018-05-30 16:47:10', '2018-05-30 16:47:10', 'admin'),
(257, 'table', 'open', '102', '2018-05-30 16:47:10', '2018-05-30 16:47:10', 'admin'),
(258, 'table', 'open', '102', '2018-05-30 16:47:10', '2018-05-30 16:47:10', 'admin'),
(259, 'table', 'open', '102', '2018-05-30 16:47:11', '2018-05-30 16:47:21', 'admin'),
(260, 'table', 'updateState', '66', '2018-05-30 16:47:18', NULL, 'admin'),
(261, 'table', 'open', '102', '2018-05-30 16:47:21', '2018-05-30 16:47:31', 'admin'),
(262, 'table', 'updateState', '66', '2018-05-30 16:47:26', NULL, 'admin'),
(263, 'table', 'open', '102', '2018-05-30 16:47:31', '2018-05-30 16:47:41', 'admin'),
(264, 'table', 'updateState', '66', '2018-05-30 16:47:35', NULL, 'admin'),
(265, 'table', 'updateState', '66', '2018-05-30 16:47:38', NULL, 'admin'),
(266, 'table', 'open', '102', '2018-05-30 16:47:41', '2018-05-30 16:48:01', 'admin'),
(267, 'table', 'updateState', '66', '2018-05-30 16:47:45', NULL, 'admin'),
(268, 'table', 'open', '102', '2018-05-30 16:48:01', '2018-05-30 16:49:11', 'admin'),
(269, 'table', 'updateState', '66', '2018-05-30 16:49:02', NULL, 'admin'),
(270, 'table', 'update', '66', '2018-05-30 16:49:05', NULL, 'admin'),
(271, 'table', 'update', '66', '2018-05-30 16:49:08', NULL, 'admin'),
(272, 'table', 'open', '102', '2018-05-30 16:49:11', '2018-05-30 16:53:42', 'admin'),
(273, 'structure', 'open', '30', '2018-05-30 16:49:20', NULL, 'admin'),
(274, 'table', 'update', '102', '2018-05-30 16:49:25', NULL, 'admin'),
(275, 'table', 'open', '66', '2018-05-30 16:49:26', '2018-05-30 16:55:07', 'admin'),
(276, 'table', 'open', '126', '2018-05-30 16:50:14', '2018-05-30 16:51:24', 'admin'),
(277, 'table', 'updateState', '126', '2018-05-30 16:51:13', NULL, 'admin'),
(278, 'table', 'update', '126', '2018-05-30 16:51:26', NULL, 'admin'),
(279, 'table', 'open', '126', '2018-05-30 16:51:31', '2018-05-30 16:52:51', 'admin'),
(280, 'table', 'open', '126', '2018-05-30 16:53:01', NULL, 'admin'),
(281, 'table', 'updateState', '66', '2018-05-30 16:53:35', NULL, 'admin'),
(282, 'table', 'open', '126', '2018-05-30 16:53:41', '2018-05-30 16:54:01', 'admin'),
(283, 'table', 'open', '102', '2018-05-30 16:53:43', '2018-05-30 16:54:03', 'admin'),
(284, 'table', 'updateState', '66', '2018-05-30 16:53:56', NULL, 'admin'),
(285, 'table', 'open', '126', '2018-05-30 16:54:01', '2018-05-30 16:55:11', 'admin'),
(286, 'table', 'open', '102', '2018-05-30 16:54:03', '2018-05-30 16:55:13', 'admin'),
(287, 'table', 'open', '66', '2018-05-30 16:55:16', '2018-05-30 16:55:37', 'admin'),
(288, 'table', 'open', '66', '2018-05-30 16:55:45', '2018-05-30 16:55:55', 'admin'),
(289, 'table', 'open', '126', '2018-05-30 16:55:48', '2018-05-30 16:55:58', 'admin'),
(290, 'table', 'open', '66', '2018-05-30 16:56:04', '2018-05-30 16:56:14', 'admin'),
(291, 'table', 'open', '66', '2018-05-30 16:56:17', NULL, 'admin'),
(292, 'table', 'open', '126', '2018-05-30 16:56:20', '2018-05-30 16:56:30', 'admin'),
(293, 'table', 'updateState', '66', '2018-05-30 16:56:26', NULL, 'admin'),
(294, 'table', 'open', '126', '2018-05-30 16:56:30', '2018-05-30 16:56:40', 'admin'),
(295, 'table', 'updateState', '66', '2018-05-30 16:56:38', NULL, 'admin'),
(296, 'table', 'updateState', '66', '2018-05-30 16:56:39', NULL, 'admin'),
(297, 'table', 'open', '126', '2018-05-30 16:56:40', '2018-05-30 16:56:50', 'admin'),
(298, 'table', 'updateState', '66', '2018-05-30 16:56:42', NULL, 'admin'),
(299, 'table', 'open', '126', '2018-05-30 16:56:50', '2018-05-30 16:57:30', 'admin'),
(300, 'table', 'open', '66', '2018-05-30 16:57:38', '2018-05-30 16:58:29', 'admin');

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
(3, 'value', 'О привет 1'),
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
('G8wLo0P7NOT', 'fuck', '77621457c91ade91b700d67b7d4ecc92', '0000-00-00 00:00:00'),
('GkvI7h7HSh1', 'test', '570b6285b48710d6100a16c2b1513caa', '0000-00-00 00:00:00');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=986;

--
-- AUTO_INCREMENT для таблицы `main_log`
--
ALTER TABLE `main_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=301;

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
