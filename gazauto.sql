-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Май 08 2018 г., 15:39
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
  `state` varchar(128) DEFAULT NULL,
  `info` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `fields`
--

INSERT INTO `fields` (`id`, `tableId`, `i`, `name_column`, `type`, `value`, `state`, `info`) VALUES
(37, 66, 5, 'Номер', 'value', 'sdfgфывафывафывафыва', NULL, NULL),
(38, 66, 5, 'Название', 'value', 'sfdg', NULL, NULL),
(39, 66, 5, 'Модель', 'value', 'sdfgфывафыва', NULL, NULL),
(87, 66, 5, 'Тест 1', 'value', 'ыфвафывафыавфываф', NULL, NULL),
(88, 66, 5, 'Тест 2', 'value', 'фывафывафывафыв', NULL, NULL),
(89, 66, 5, 'Тест 3', 'value', 'фывафыва', NULL, NULL),
(90, 66, 5, 'Тест 4', 'value', 'фывафывафыва', NULL, NULL),
(232, 66, 6, 'Номер', 'value', '', NULL, NULL),
(233, 66, 6, 'Название', 'value', '1', NULL, NULL),
(234, 66, 6, 'Модель', 'value', '', NULL, NULL),
(235, 66, 6, 'Тест 1', 'value', '', NULL, NULL),
(236, 66, 6, 'Тест 2', 'value', '', NULL, NULL),
(237, 66, 6, 'Тест 3', 'value', '', NULL, NULL),
(238, 66, 6, 'Тест 4', 'value', '', NULL, NULL),
(239, 66, 6, 'Тест 5', 'value', '', NULL, NULL),
(240, 66, 7, 'Номер', 'value', '', NULL, NULL),
(241, 66, 7, 'Название', 'value', '1', NULL, NULL),
(242, 66, 7, 'Модель', 'value', '', NULL, NULL),
(243, 66, 7, 'Тест 1', 'value', '', NULL, NULL),
(244, 66, 7, 'Тест 2', 'value', 'фыва', NULL, NULL),
(245, 66, 7, 'Тест 3', 'value', '', NULL, NULL),
(246, 66, 7, 'Тест 4', 'value', '', NULL, NULL),
(247, 66, 7, 'Тест 5', 'value', '', NULL, NULL),
(248, 66, 8, 'Номер', 'value', '', NULL, NULL),
(249, 66, 8, 'Название', 'value', '1', NULL, NULL),
(250, 66, 8, 'Модель', 'value', 'фыва', NULL, NULL),
(251, 66, 8, 'Тест 1', 'value', 'фыва', NULL, NULL),
(252, 66, 8, 'Тест 2', 'value', '', NULL, NULL),
(253, 66, 8, 'Тест 3', 'value', '', NULL, NULL),
(254, 66, 8, 'Тест 4', 'value', 'фыва', NULL, NULL),
(255, 66, 8, 'Тест 5', 'value', '', NULL, NULL),
(256, 66, 9, 'Номер', 'value', '', NULL, NULL),
(257, 66, 9, 'Название', 'value', '1', NULL, NULL),
(258, 66, 9, 'Модель', 'value', '', NULL, NULL),
(259, 66, 9, 'Тест 1', 'value', '', NULL, NULL),
(260, 66, 9, 'Тест 2', 'value', '', NULL, NULL),
(261, 66, 9, 'Тест 3', 'value', '', NULL, NULL),
(262, 66, 9, 'Тест 4', 'value', '', NULL, NULL),
(263, 66, 9, 'Тест 5', 'value', '', NULL, NULL),
(264, 66, 10, 'Номер', 'value', '', NULL, NULL),
(265, 66, 10, 'Название', 'value', '1', NULL, NULL),
(266, 66, 10, 'Модель', 'value', '', NULL, NULL),
(267, 66, 10, 'Тест 1', 'value', '', NULL, NULL),
(268, 66, 10, 'Тест 2', 'value', 'афыва', NULL, NULL),
(269, 66, 10, 'Тест 3', 'value', 'фыва', NULL, NULL),
(270, 66, 10, 'Тест 4', 'value', 'фыва', NULL, NULL),
(271, 66, 10, 'Тест 5', 'value', '', NULL, NULL),
(272, 66, 11, 'Номер', 'value', '', NULL, NULL),
(273, 66, 11, 'Название', 'value', 'й', NULL, NULL),
(274, 66, 11, 'Модель', 'value', '', NULL, NULL),
(275, 66, 11, 'Тест 1', 'value', 'йфыа', NULL, NULL),
(276, 66, 11, 'Тест 2', 'value', '', NULL, NULL),
(277, 66, 11, 'Тест 3', 'value', 'фыва', NULL, NULL),
(278, 66, 11, 'Тест 4', 'value', 'фыва', NULL, NULL),
(279, 66, 11, 'Тест 5', 'value', '', NULL, NULL),
(280, 66, 12, 'Номер', 'value', '', NULL, NULL),
(281, 66, 12, 'Название', 'value', '', NULL, NULL),
(282, 66, 12, 'Модель', 'value', 'фыва', NULL, NULL),
(283, 66, 12, 'Тест 1', 'value', '', NULL, NULL),
(284, 66, 12, 'Тест 2', 'value', '', NULL, NULL),
(285, 66, 12, 'Тест 3', 'value', 'фыав', NULL, NULL),
(286, 66, 12, 'Тест 4', 'value', 'фыва', NULL, NULL),
(287, 66, 12, 'Тест 5', 'value', '', NULL, NULL),
(288, 66, 13, 'Номер', 'value', '', NULL, NULL),
(289, 66, 13, 'Название', 'value', '', NULL, NULL),
(290, 66, 13, 'Модель', 'value', 'йцу', NULL, NULL),
(291, 66, 13, 'Тест 1', 'value', '', NULL, NULL),
(292, 66, 13, 'Тест 2', 'value', 'фыва', NULL, NULL),
(293, 66, 13, 'Тест 3', 'value', '', NULL, NULL),
(294, 66, 13, 'Тест 4', 'value', '', NULL, NULL),
(295, 66, 13, 'Тест 5', 'value', '', NULL, NULL),
(296, 66, 14, 'Номер', 'value', '', NULL, NULL),
(297, 66, 14, 'Название', 'value', 'уцй', NULL, NULL),
(298, 66, 14, 'Модель', 'value', '', NULL, NULL),
(299, 66, 14, 'Тест 1', 'value', '', NULL, NULL),
(300, 66, 14, 'Тест 2', 'value', '', NULL, NULL),
(301, 66, 14, 'Тест 3', 'value', '', NULL, NULL),
(302, 66, 14, 'Тест 4', 'value', '', NULL, NULL),
(303, 66, 14, 'Тест 5', 'value', '', NULL, NULL),
(376, 66, 0, 'Номер', 'head', NULL, NULL, NULL),
(377, 66, 1, 'Название', 'head', NULL, NULL, NULL),
(378, 66, 2, 'Модель', 'head', NULL, NULL, NULL),
(379, 66, 3, 'Тест 2', 'head', NULL, NULL, NULL),
(380, 66, 4, 'Тест 1', 'head', NULL, NULL, NULL),
(381, 66, 5, 'Тест 3', 'head', NULL, NULL, NULL),
(382, 66, 6, 'Тест 4', 'head', NULL, NULL, NULL),
(383, 66, 7, 'Тест 5', 'head', NULL, NULL, NULL),
(384, 66, 15, 'Номер', 'value', '', NULL, NULL),
(385, 66, 15, 'Название', 'value', '', NULL, NULL),
(386, 66, 15, 'Модель', 'value', '', NULL, NULL),
(387, 66, 15, 'Тест 2', 'value', '', NULL, NULL),
(388, 66, 15, 'Тест 1', 'value', '', NULL, NULL),
(389, 66, 15, 'Тест 3', 'value', '', NULL, NULL),
(390, 66, 15, 'Тест 4', 'value', '', NULL, NULL),
(391, 66, 15, 'Тест 5', 'value', '', NULL, NULL),
(392, 66, 16, 'Номер', 'value', '', NULL, NULL),
(393, 66, 16, 'Название', 'value', '', NULL, NULL),
(394, 66, 16, 'Модель', 'value', '', NULL, NULL),
(395, 66, 16, 'Тест 2', 'value', '', NULL, NULL),
(396, 66, 16, 'Тест 1', 'value', '', NULL, NULL),
(397, 66, 16, 'Тест 3', 'value', '', NULL, NULL),
(398, 66, 16, 'Тест 4', 'value', '', NULL, NULL),
(399, 66, 16, 'Тест 5', 'value', '', NULL, NULL);

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
(2, 'array', '[{\"value\":\"ывап\"},{\"value\":\"ыва\"}]'),
(3, 'value', 'фыафыва');

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
('test', 'Инженер', '2018-04-20 13:59:03');

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
(29, 66, 'user', 'test', 1),
(70, 32, 'role', 'Инженер', 9),
(71, 32, 'user', 'test', 1),
(88, 93, 'user', 'test', 1),
(93, 96, 'role', 'Инженер', 1);

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
('GJ3COg64AOP', 'admin', '176d8c6582c7d758e1253ddd345ec60f', '2018-05-08 15:31:54'),
('G1ke048Pjp4', 'test', 'c1b4b4743ccb6a3a91aa0c4251654d93', '2018-05-08 15:31:55');

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
(66, 'table', 0, 'Основная таблица', 30, 0, ''),
(96, 'value', 2, 'Тест', 30, 0, ''),
(97, 'value', 3, 'еуые', 30, 0, ''),
(98, 'folder', 0, 'Новая папка', 30, 0, ''),
(99, 'table', 0, 'Новая таблица', 98, 0, ''),
(100, 'folder', 0, 'Файлы', 0, 5, '');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `fields`
--
ALTER TABLE `fields`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=403;

--
-- AUTO_INCREMENT для таблицы `my_values`
--
ALTER TABLE `my_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `rights`
--
ALTER TABLE `rights`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT для таблицы `structures`
--
ALTER TABLE `structures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
