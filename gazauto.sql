-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Май 14 2018 г., 16:36
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
(538, 66, 1, 'Номер', 'value', '', NULL, NULL),
(539, 66, 1, 'Название', 'link', '{\"id\":3,\"type\":\"value\"}', NULL, NULL),
(540, 66, 1, 'Модель', 'value', 'ghj', NULL, NULL),
(541, 66, 1, 'Тест 2', 'value', 'О привет', NULL, NULL),
(542, 66, 1, 'Тест 1', 'link', '{\"value\":0,\"id\":2,\"type\":\"value\"}', NULL, NULL),
(543, 66, 1, 'Тест 3', 'link', '{\"id\":66,\"type\":\"table\"}', NULL, NULL),
(544, 66, 1, 'Тест 4', 'value', '', NULL, NULL),
(634, 66, 0, 'Номер', 'head', NULL, NULL, NULL),
(635, 66, 1, 'Название', 'head', NULL, NULL, NULL),
(636, 66, 2, 'Модель', 'head', NULL, NULL, NULL),
(637, 66, 3, 'Тест 2', 'head', NULL, NULL, NULL),
(638, 66, 4, 'Тест 1', 'head', NULL, NULL, NULL),
(639, 66, 5, 'Тест 3', 'head', NULL, NULL, NULL),
(640, 66, 6, 'Тест 4', 'head', NULL, NULL, NULL),
(641, 66, 7, 'Тест 5', 'head', NULL, NULL, NULL),
(642, 66, 8, 'Тест 6', 'head', NULL, NULL, NULL),
(643, 66, 1, 'Тест 5', 'value', '', NULL, NULL),
(644, 66, 1, 'Тест 6', 'value', 'Новое значение', NULL, NULL);

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
(2, 'array', '[\"Новое значение\",\"Запасное значение\",\"Нужное значение\"]'),
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
('GJ3COg64AOP', 'admin', '176d8c6582c7d758e1253ddd345ec60f', '2018-05-14 16:27:35'),
('G1ke048Pjp4', 'test', 'c1b4b4743ccb6a3a91aa0c4251654d93', '2018-05-14 10:46:08');

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
(100, 'folder', 0, 'Файлы', 0, 5, ''),
(101, 'value', 4, 'Новое', 30, 0, '');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=654;

--
-- AUTO_INCREMENT для таблицы `my_values`
--
ALTER TABLE `my_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `rights`
--
ALTER TABLE `rights`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT для таблицы `structures`
--
ALTER TABLE `structures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
