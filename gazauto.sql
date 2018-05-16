-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Май 16 2018 г., 16:48
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
(695, 66, 2, 'Название', 'link', '0', 2, 'value', NULL, NULL, NULL),
(696, 66, 2, 'Модель', 'link', '0', 3, 'value', NULL, NULL, NULL),
(700, 66, 3, 'Модель', 'link', '0', 66, 'table', NULL, NULL, NULL),
(763, 102, 0, 'Первое поле', 'head', NULL, NULL, NULL, NULL, NULL, NULL),
(772, 102, 1, 'Первое поле', 'link', '', 695, 'cell', NULL, NULL, NULL),
(773, 102, 2, 'Первое поле', 'link', '1', 2, 'value', NULL, NULL, NULL),
(774, 66, 0, 'Номер', 'head', NULL, NULL, NULL, NULL, NULL, NULL),
(775, 66, 1, 'Название', 'head', NULL, NULL, NULL, NULL, NULL, NULL),
(776, 66, 2, 'Модель', 'head', NULL, NULL, NULL, NULL, NULL, NULL),
(777, 66, 3, 'тест', 'head', NULL, NULL, NULL, NULL, NULL, NULL),
(792, 66, 2, 'Номер', 'value', 'йцу', NULL, NULL, NULL, NULL, NULL),
(793, 66, 3, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(794, 66, 3, 'Название', 'link', '', 695, 'cell', NULL, NULL, NULL),
(795, 66, 2, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(796, 66, 3, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(797, 66, 4, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(798, 66, 4, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(799, 66, 4, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(800, 66, 4, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(801, 66, 5, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(802, 66, 5, 'Название', 'link', '0', 2, 'value', NULL, NULL, NULL),
(803, 66, 5, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(804, 66, 5, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(805, 66, 6, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(806, 66, 6, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(807, 66, 6, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(808, 66, 6, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(809, 66, 7, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(810, 66, 7, 'Название', 'link', '2', 2, 'value', NULL, NULL, NULL),
(811, 66, 7, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(812, 66, 7, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(813, 66, 8, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(814, 66, 8, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(815, 66, 8, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(816, 66, 8, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL),
(817, 66, 9, 'Номер', 'value', '', NULL, NULL, NULL, NULL, NULL),
(818, 66, 9, 'Название', 'value', '', NULL, NULL, NULL, NULL, NULL),
(819, 66, 9, 'Модель', 'value', '', NULL, NULL, NULL, NULL, NULL),
(820, 66, 9, 'тест', 'value', '', NULL, NULL, NULL, NULL, NULL);

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
(4, 'value', 'FUCK oFF');

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
(70, 32, 'role', 'Инженер', 9),
(71, 32, 'user', 'test', 1),
(88, 93, 'user', 'test', 1),
(94, 102, 'user', 'test', 1),
(95, 66, 'user', 'test', 1),
(96, 103, 'user', 'test', 1),
(97, 98, 'user', 'test', 1);

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
('GJ3COg64AOP', 'admin', '3df1bf4e5a12833ec1301273a985c8cd', '2018-05-16 16:43:48'),
('G1ke048Pjp4', 'test', 'c1b4b4743ccb6a3a91aa0c4251654d93', '2018-05-14 10:46:08'),
('GCitgV4Vlu8', 'test', 'f2e1abe761c6a51889c361fba8192802', '2018-05-16 16:43:43');

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
(103, 'table', 0, 'Новая таблица 2', 98, 0, '');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `fields`
--
ALTER TABLE `fields`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=821;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT для таблицы `structures`
--
ALTER TABLE `structures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
