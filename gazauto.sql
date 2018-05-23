-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Май 23 2018 г., 09:52
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
  `stateId` int(11) DEFAULT NULL,
  `stateValue` int(11) DEFAULT NULL,
  `info` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `fields`
--

INSERT INTO `fields` (`id`, `tableId`, `i`, `name_column`, `type`, `value`, `linkId`, `linkType`, `stateId`, `stateValue`, `info`) VALUES
(695, 66, 2, 'Название', 'link', '1', 2, 'value', NULL, NULL, NULL),
(696, 66, 2, 'Модель', 'link', '0', 3, 'value', NULL, NULL, NULL),
(700, 66, 3, 'Модель', 'link', '0', 66, 'table', NULL, NULL, NULL),
(763, 102, 0, 'Первое поле', 'head', NULL, NULL, NULL, NULL, NULL, NULL),
(772, 102, 1, 'Первое поле', 'value', '123sdfsdf', NULL, NULL, NULL, NULL, NULL),
(773, 102, 2, 'Первое поле', 'link', '1', 2, 'value', NULL, NULL, NULL),
(774, 66, 0, 'Номер', 'head', NULL, NULL, NULL, NULL, NULL, NULL),
(775, 66, 1, 'Название', 'head', NULL, NULL, NULL, NULL, NULL, NULL),
(776, 66, 2, 'Модель', 'head', NULL, NULL, NULL, NULL, NULL, NULL),
(777, 66, 3, 'тест', 'head', NULL, NULL, NULL, NULL, NULL, NULL),
(792, 66, 2, 'Номер', 'value', '123werwer', NULL, NULL, NULL, NULL, NULL),
(793, 66, 3, 'Номер', 'link', '0', 102, 'table', NULL, NULL, NULL),
(794, 66, 3, 'Название', 'link', '', 695, 'cell', NULL, NULL, NULL),
(795, 66, 2, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(796, 66, 3, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(797, 66, 4, 'Номер', 'link', '0', 102, 'table', NULL, NULL, NULL),
(798, 66, 4, 'Название', 'value', 'sdfwerwe', NULL, NULL, NULL, NULL, NULL),
(799, 66, 4, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(800, 66, 4, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(801, 66, 5, 'Номер', 'link', '0', 102, 'table', NULL, NULL, NULL),
(802, 66, 5, 'Название', 'link', '0', 2, 'value', NULL, NULL, NULL),
(803, 66, 5, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(804, 66, 5, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(805, 66, 6, 'Номер', 'link', '0', 102, 'table', NULL, NULL, NULL),
(806, 66, 6, 'Название', 'value', 'sdfsdf', NULL, NULL, NULL, NULL, NULL),
(807, 66, 6, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(808, 66, 6, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(809, 66, 7, 'Номер', 'link', '0', 102, 'table', NULL, NULL, NULL),
(810, 66, 7, 'Название', 'link', '2', 2, 'value', NULL, NULL, NULL),
(811, 66, 7, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(812, 66, 7, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(813, 66, 8, 'Номер', 'link', '0', 102, 'table', NULL, NULL, NULL),
(814, 66, 8, 'Название', 'value', 'dfgdfg', NULL, NULL, NULL, NULL, NULL),
(815, 66, 8, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(816, 66, 8, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(817, 66, 9, 'Номер', 'link', '0', 102, 'table', NULL, NULL, NULL),
(818, 66, 9, 'Название', 'link', '0', 119, 'file', NULL, NULL, NULL),
(819, 66, 9, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(820, 66, 9, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(821, 66, 10, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(822, 66, 10, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(823, 66, 10, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(824, 66, 10, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(825, 66, 11, 'Номер', 'value', 'sdf', NULL, NULL, NULL, NULL, NULL),
(826, 66, 11, 'Название', 'value', 'sdf', NULL, NULL, NULL, NULL, NULL),
(827, 66, 11, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(828, 66, 11, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(829, 66, 12, 'Номер', 'value', 'sfd', NULL, NULL, NULL, NULL, NULL),
(830, 66, 12, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(831, 66, 12, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(832, 66, 12, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(833, 66, 13, 'Номер', 'value', 'sdf', NULL, NULL, NULL, NULL, NULL),
(834, 66, 13, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(835, 66, 13, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(836, 66, 13, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(837, 66, 14, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(838, 66, 14, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(839, 66, 14, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(840, 66, 14, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(841, 66, 15, 'Номер', 'value', 'sdfsdf', NULL, NULL, NULL, NULL, NULL),
(842, 66, 15, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(843, 66, 15, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(844, 66, 15, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(845, 66, 16, 'Номер', 'value', 'sdf', NULL, NULL, NULL, NULL, NULL),
(846, 66, 16, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(847, 66, 16, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(848, 66, 16, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(849, 66, 17, 'Номер', 'value', 'sdf', NULL, NULL, NULL, NULL, NULL),
(850, 66, 17, 'Название', 'value', 'sdf', NULL, NULL, NULL, NULL, NULL),
(851, 66, 17, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(852, 66, 17, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(853, 66, 18, 'Номер', 'value', 'sdf', NULL, NULL, NULL, NULL, NULL),
(854, 66, 18, 'Название', 'value', 'sdfsdfsdf', NULL, NULL, NULL, NULL, NULL),
(855, 66, 18, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(856, 66, 18, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(857, 66, 19, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(858, 66, 19, 'Название', 'value', 'sdf', NULL, NULL, NULL, NULL, NULL),
(859, 66, 19, 'Модель', 'value', 'sdfsdfsdf', NULL, NULL, NULL, NULL, NULL),
(860, 66, 19, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(861, 66, 20, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(862, 66, 20, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(863, 66, 20, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(864, 66, 20, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(865, 66, 21, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(866, 66, 21, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(867, 66, 21, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(868, 66, 21, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(869, 66, 22, 'Номер', 'value', '123', NULL, NULL, NULL, NULL, NULL),
(870, 66, 22, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(871, 66, 22, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(872, 66, 22, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(873, 66, 23, 'Номер', 'link', '', 772, 'cell', NULL, NULL, NULL),
(874, 66, 23, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(875, 66, 23, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(876, 66, 23, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(877, 66, 24, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(878, 66, 24, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(879, 66, 24, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(880, 66, 24, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(881, 66, 25, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(882, 66, 25, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(883, 66, 25, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(884, 66, 25, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(885, 66, 26, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(886, 66, 26, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(887, 66, 26, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(888, 66, 26, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL);

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
  `login` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `main_log`
--

INSERT INTO `main_log` (`id`, `type`, `operation`, `value`, `date`, `login`) VALUES
(1, 'user', 'enter', '', '2018-05-22 16:05:40', 'admin'),
(2, 'table', 'open', '102', '2018-05-22 16:17:49', 'admin'),
(3, 'structure', 'open', '0', '2018-05-22 16:18:01', 'admin'),
(4, 'structure', 'open', '100', '2018-05-22 16:18:06', 'admin'),
(5, 'file', 'download', '119', '2018-05-22 16:18:11', 'admin'),
(6, 'structure', 'open', '1', '2018-05-22 16:18:48', 'admin'),
(7, 'structure', 'open', '2', '2018-05-22 16:18:50', 'admin'),
(8, 'user', 'add', '[\"test2\",\"\\u0410\\u0434\\u043c\\u0438\\u043d\\u0438\\u0441\\u0442\\u0440\\u0430\\u0442\\u043e\\u0440\"]', '2018-05-22 16:19:04', 'test2'),
(9, 'structure', 'open', '2', '2018-05-22 16:19:04', 'admin'),
(10, 'user', 'update', '[\"test2\",\"\\u0418\\u043d\\u0436\\u0435\\u043d\\u0435\\u0440\"]', '2018-05-22 16:19:21', 'admin'),
(11, 'structure', 'open', '2', '2018-05-22 16:19:21', 'admin'),
(12, 'structure', 'open', '0', '2018-05-22 16:20:04', 'admin'),
(13, 'structure', 'open', '100', '2018-05-22 16:20:05', 'admin'),
(14, 'structure', 'add', '120', '2018-05-22 16:20:10', 'admin'),
(15, 'structure', 'open', '100', '2018-05-22 16:20:10', 'admin'),
(16, 'structure', 'add', '121', '2018-05-22 16:20:59', 'admin'),
(17, 'structure', 'open', '100', '2018-05-22 16:20:59', 'admin'),
(18, 'structure', 'add', '122', '2018-05-22 16:21:03', 'admin'),
(19, 'structure', 'open', '100', '2018-05-22 16:21:03', 'admin'),
(20, 'structure', 'add', '123', '2018-05-22 16:21:28', 'admin'),
(21, 'structure', 'open', '100', '2018-05-22 16:21:28', 'admin'),
(22, 'structure', 'open', '100', '2018-05-22 16:21:30', 'admin'),
(23, 'structure', 'open', '1', '2018-05-22 16:23:54', 'admin'),
(24, 'structure', 'open', '2', '2018-05-22 16:23:55', 'admin'),
(25, 'structure', 'open', '2', '2018-05-22 16:23:58', 'admin'),
(26, 'user', 'add', '[\"test2\",\"\\u0410\\u0434\\u043c\\u0438\\u043d\\u0438\\u0441\\u0442\\u0440\\u0430\\u0442\\u043e\\u0440\"]', '2018-05-22 16:24:41', 'admin'),
(27, 'structure', 'open', '2', '2018-05-22 16:24:41', 'admin'),
(28, 'structure', 'open', '2', '2018-05-22 16:24:56', 'admin'),
(29, 'user', 'add', '[\"test2\",\"\\u0410\\u0434\\u043c\\u0438\\u043d\\u0438\\u0441\\u0442\\u0440\\u0430\\u0442\\u043e\\u0440\"]', '2018-05-22 16:25:53', 'admin'),
(30, 'structure', 'open', '2', '2018-05-22 16:25:53', 'admin'),
(31, 'table', 'open', '66', '2018-05-22 16:28:27', 'admin'),
(32, 'table', 'update', '66', '2018-05-22 16:28:39', 'admin'),
(33, 'table', 'open', '66', '2018-05-22 16:33:06', 'admin'),
(34, 'table', 'open', '66', '2018-05-22 16:33:07', 'test'),
(35, 'table', 'open', '66', '2018-05-22 16:40:05', 'admin'),
(36, 'table', 'open', '66', '2018-05-22 16:40:08', 'test'),
(37, 'table', 'open', '66', '2018-05-22 16:41:22', 'admin'),
(38, 'table', 'open', '66', '2018-05-22 16:41:22', 'test'),
(39, 'table', 'open', '66', '2018-05-22 16:41:31', 'admin'),
(40, 'table', 'open', '66', '2018-05-22 16:41:32', 'test'),
(41, 'table', 'open', '66', '2018-05-22 16:43:52', 'admin'),
(42, 'table', 'open', '66', '2018-05-22 16:43:52', 'test'),
(43, 'table', 'open', '66', '2018-05-22 16:44:10', 'admin'),
(44, 'table', 'open', '66', '2018-05-22 16:44:11', 'test'),
(45, 'table', 'open', '66', '2018-05-22 16:44:17', 'admin'),
(46, 'table', 'open', '66', '2018-05-22 16:44:18', 'test'),
(47, 'table', 'open', '66', '2018-05-22 16:45:49', 'admin'),
(48, 'table', 'open', '66', '2018-05-22 16:45:50', 'test'),
(49, 'table', 'open', '66', '2018-05-22 16:46:06', 'admin'),
(50, 'table', 'open', '66', '2018-05-22 16:46:07', 'test'),
(51, 'structure', 'open', '0', '2018-05-22 16:46:58', 'admin'),
(52, 'structure', 'open', '30', '2018-05-22 16:47:01', 'admin'),
(53, 'right', 'add', '[102,\"user\",\"test\",9]', '2018-05-22 16:47:12', 'test'),
(54, 'structure', 'open', '30', '2018-05-22 16:47:12', 'admin'),
(55, 'table', 'open', '66', '2018-05-22 16:47:15', 'test'),
(56, 'table', 'open', '66', '2018-05-22 16:47:21', 'test'),
(57, 'table', 'open', '66', '2018-05-22 16:47:24', 'test'),
(58, 'table', 'open', '102', '2018-05-22 16:47:28', 'test'),
(59, 'table', 'open', '66', '2018-05-22 16:47:35', 'admin'),
(60, 'structure', 'open', '98', '2018-05-22 16:47:41', 'admin'),
(61, 'right', 'add', '[66,\"user\",\"test\",9]', '2018-05-22 16:47:47', 'test'),
(62, 'structure', 'open', '98', '2018-05-22 16:47:47', 'admin'),
(63, 'table', 'open', '66', '2018-05-22 16:47:51', 'test'),
(64, 'table', 'update', '66', '2018-05-22 16:47:56', 'test'),
(65, 'table', 'open', '66', '2018-05-22 16:49:17', 'admin'),
(66, 'table', 'open', '66', '2018-05-22 16:49:17', 'test'),
(67, 'table', 'open', '66', '2018-05-23 09:38:36', 'admin'),
(68, 'table', 'update', '66', '2018-05-23 09:39:45', 'test'),
(69, 'table', 'open', '66', '2018-05-23 09:39:53', 'admin'),
(70, 'table', 'open', '66', '2018-05-23 09:41:31', 'admin'),
(71, 'table', 'open', '66', '2018-05-23 09:41:34', 'test'),
(72, 'table', 'open', '66', '2018-05-23 09:41:37', 'admin'),
(73, 'table', 'open', '66', '2018-05-23 09:41:38', 'test'),
(74, 'table', 'open', '66', '2018-05-23 09:41:47', 'admin'),
(75, 'table', 'open', '66', '2018-05-23 09:41:48', 'test'),
(76, 'table', 'open', '66', '2018-05-23 09:42:04', 'admin'),
(77, 'table', 'open', '66', '2018-05-23 09:42:05', 'test'),
(78, 'table', 'open', '66', '2018-05-23 09:43:36', 'admin'),
(79, 'table', 'open', '66', '2018-05-23 09:43:37', 'test'),
(80, 'table', 'update', '66', '2018-05-23 09:44:12', 'test'),
(81, 'table', 'update', '66', '2018-05-23 09:44:20', 'test'),
(82, 'table', 'open', '66', '2018-05-23 09:44:23', 'admin'),
(83, 'table', 'update', '66', '2018-05-23 09:44:26', 'admin'),
(84, 'table', 'open', '66', '2018-05-23 09:44:30', 'test'),
(85, 'table', 'open', '66', '2018-05-23 09:46:00', 'admin'),
(86, 'table', 'open', '66', '2018-05-23 09:46:00', 'test'),
(87, 'table', 'open', '66', '2018-05-23 09:47:28', 'test'),
(88, 'table', 'open', '66', '2018-05-23 09:47:29', 'admin'),
(89, 'table', 'update', '66', '2018-05-23 09:47:36', 'admin'),
(90, 'table', 'open', '66', '2018-05-23 09:47:37', 'test'),
(91, 'table', 'update', '66', '2018-05-23 09:47:37', 'admin'),
(92, 'table', 'update', '66', '2018-05-23 09:47:37', 'admin'),
(93, 'table', 'update', '66', '2018-05-23 09:47:38', 'admin'),
(94, 'table', 'update', '66', '2018-05-23 09:47:38', 'admin'),
(95, 'table', 'update', '66', '2018-05-23 09:47:38', 'admin'),
(96, 'table', 'update', '66', '2018-05-23 09:47:38', 'admin'),
(97, 'table', 'update', '66', '2018-05-23 09:47:38', 'admin'),
(98, 'table', 'update', '66', '2018-05-23 09:47:39', 'admin'),
(99, 'table', 'update', '66', '2018-05-23 09:47:39', 'admin'),
(100, 'table', 'open', '66', '2018-05-23 09:47:39', 'test'),
(101, 'table', 'update', '66', '2018-05-23 09:47:39', 'admin'),
(102, 'table', 'update', '66', '2018-05-23 09:47:39', 'admin'),
(103, 'table', 'update', '66', '2018-05-23 09:47:39', 'admin'),
(104, 'table', 'update', '66', '2018-05-23 09:47:40', 'admin'),
(105, 'table', 'update', '66', '2018-05-23 09:47:40', 'admin'),
(106, 'table', 'update', '66', '2018-05-23 09:47:40', 'admin'),
(107, 'table', 'update', '66', '2018-05-23 09:47:40', 'admin'),
(108, 'table', 'open', '66', '2018-05-23 09:47:41', 'test'),
(109, 'table', 'update', '66', '2018-05-23 09:47:54', 'admin'),
(110, 'table', 'open', '66', '2018-05-23 09:47:56', 'test'),
(111, 'table', 'update', '66', '2018-05-23 09:47:56', 'admin'),
(112, 'table', 'update', '66', '2018-05-23 09:47:58', 'admin'),
(113, 'table', 'open', '66', '2018-05-23 09:47:58', 'test'),
(114, 'table', 'update', '66', '2018-05-23 09:48:00', 'admin'),
(115, 'table', 'open', '66', '2018-05-23 09:48:00', 'test'),
(116, 'table', 'update', '66', '2018-05-23 09:48:02', 'admin'),
(117, 'table', 'open', '66', '2018-05-23 09:48:03', 'test'),
(118, 'table', 'update', '66', '2018-05-23 09:48:04', 'admin'),
(119, 'table', 'open', '66', '2018-05-23 09:48:05', 'test'),
(120, 'table', 'update', '66', '2018-05-23 09:48:09', 'admin'),
(121, 'table', 'open', '66', '2018-05-23 09:48:09', 'test'),
(122, 'table', 'open', '66', '2018-05-23 09:48:12', 'test'),
(123, 'table', 'update', '66', '2018-05-23 09:48:14', 'admin'),
(124, 'table', 'open', '66', '2018-05-23 09:48:16', 'test'),
(125, 'table', 'update', '66', '2018-05-23 09:49:15', 'admin'),
(126, 'table', 'open', '66', '2018-05-23 09:49:16', 'test'),
(127, 'table', 'update', '66', '2018-05-23 09:49:16', 'admin'),
(128, 'table', 'update', '66', '2018-05-23 09:49:18', 'admin'),
(129, 'table', 'open', '66', '2018-05-23 09:49:18', 'test'),
(130, 'table', 'open', '66', '2018-05-23 09:49:20', 'test'),
(131, 'table', 'update', '66', '2018-05-23 09:49:29', 'admin'),
(132, 'table', 'open', '66', '2018-05-23 09:49:39', 'test'),
(133, 'structure', 'open', '100', '2018-05-23 09:49:47', 'test'),
(134, 'structure', 'open', '30', '2018-05-23 09:49:52', 'test'),
(135, 'table', 'open', '102', '2018-05-23 09:50:40', 'admin'),
(136, 'table', 'open', '66', '2018-05-23 09:51:00', 'admin'),
(137, 'table', 'open', '66', '2018-05-23 09:51:43', 'admin'),
(138, 'table', 'update', '102', '2018-05-23 09:51:50', 'admin'),
(139, 'table', 'open', '66', '2018-05-23 09:51:55', 'admin');

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
(4, 'value', 'FUCK oFF'),
(5, 'value', '');

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
('test', '$2a$10$2724eef3ab8d9290e364cuhdQdaRUuHp0sj5Ql6UA0wleUeeEzeIu');

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
(27, 30, 'user', 'test', 1),
(70, 32, 'role', 'Инженер', 9),
(71, 32, 'user', 'test', 1),
(88, 93, 'user', 'test', 1),
(96, 103, 'user', 'test', 1),
(97, 98, 'user', 'test', 1),
(98, 102, 'user', 'test', 9),
(99, 66, 'user', 'test', 9);

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
('GJ3COg64AOP', 'admin', 'cc55d2dd747f82971f01eee7b4230d2c', '2018-05-23 09:47:29'),
('G1ke048Pjp4', 'test', 'c1b4b4743ccb6a3a91aa0c4251654d93', '2018-05-14 10:46:08'),
('GCitgV4Vlu8', 'test', 'f2e1abe761c6a51889c361fba8192802', '2018-05-23 09:47:28');

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
(1, 'folder', 0, 'Администрирование', 0, 3, ''),
(2, 'folder', 0, 'Пользователи', 1, 0, ''),
(3, 'folder', 0, 'Роли', 1, 0, ''),
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
(120, 'folder', 0, 'Новая папка', 100, 0, ''),
(121, 'value', 5, 'test', 100, 0, ''),
(122, 'table', 0, 'Новая таблица', 100, 0, ''),
(123, 'file', 0, 'ЧТЗ На ПО СКУ20180305(Николенко).docx', 100, 0, '');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=889;

--
-- AUTO_INCREMENT для таблицы `main_log`
--
ALTER TABLE `main_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=140;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT для таблицы `structures`
--
ALTER TABLE `structures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=124;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
