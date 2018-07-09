-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Июл 09 2018 г., 16:33
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
(1674, 4, 0, 'Фамилия', 'head', NULL, NULL, NULL, 0, NULL),
(1676, 4, 1, 'Имя', 'head', NULL, NULL, NULL, 0, NULL),
(1678, 4, 2, 'Отчество', 'head', NULL, NULL, NULL, 0, NULL),
(1680, 4, 3, 'Логин', 'head', NULL, NULL, NULL, 0, NULL),
(2073, 144, 0, 'первый', 'head', NULL, NULL, NULL, 0, NULL),
(2074, 144, 1, 'второй', 'head', NULL, NULL, NULL, 0, NULL),
(2083, 144, 194, 'первый', 'value', 'Нов', NULL, NULL, 80, NULL),
(2084, 144, 194, 'второй', 'value', 'sdf', NULL, NULL, 0, NULL),
(2273, 144, 257, 'первый', 'value', 'Новsd', NULL, NULL, 20, NULL),
(2274, 144, 257, 'второй', 'value', '', NULL, NULL, 0, NULL),
(2275, 144, 258, 'первый', 'value', '', NULL, NULL, 0, NULL),
(2276, 144, 258, 'второй', 'value', '', NULL, NULL, 50, NULL),
(2281, 170, 0, 'Название', 'head', NULL, NULL, NULL, 0, NULL),
(2282, 170, 261, 'Название', 'value', 'Если таблица наследуется то появляется значок', NULL, NULL, 100, NULL),
(2283, 170, 262, 'Название', 'value', 'Фильтры по типу в поиске проводника', NULL, NULL, 100, NULL),
(2284, 170, 263, 'Название', 'value', 'Продумать связь таблиц по ячейкам (карта) добавить тип значения один параметр в одной таблице, другой в другой(типа select)', NULL, NULL, 10, NULL),
(2285, 170, 264, 'Название', 'value', 'Блокирование ячеек относится к 3 пункту', NULL, NULL, 10, NULL),
(2286, 170, 265, 'Название', 'value', 'Добавить в структуру связь поле, не понятно', NULL, NULL, 10, NULL),
(2287, 170, 266, 'Название', 'value', 'При вводе нового значения задается вопрос добавить ли значение в список и если прав нету то запрос администратору, это если знач', NULL, NULL, 10, NULL),
(2288, 170, 267, 'Название', 'value', 'По одной ячейке заполнять остальные, это должно решаться через select классов', NULL, NULL, 10, NULL),
(2289, 170, 268, 'Название', 'value', 'Тип значения список таблиц при выборе получается должно создаваться наследование(список классов)', NULL, NULL, 10, NULL),
(2290, 170, 269, 'Название', 'value', 'Из столбцов таблицы формировать тип список, при добавлении таблицы в ячейку можно вставить как список из столбца. Можно реализов', NULL, NULL, 10, NULL),
(2291, 170, 270, 'Название', 'value', 'Механизм составления результирующей таблицы, указываем уникальные столбцы и столбцы которые войдут, нужно вспомнить', NULL, NULL, 10, NULL),
(2292, 170, 271, 'Название', 'value', 'Экспорт в огромную таблицу таблицу с подгрузкой связей', NULL, NULL, 100, NULL),
(2293, 170, 272, 'Название', 'value', 'импорт', NULL, NULL, 10, NULL),
(2294, 170, 273, 'Название', 'value', 'бэкап', NULL, NULL, 10, NULL),
(2295, 170, 274, 'Название', 'value', 'сравнение проектов или таблиц, отдельное приложение. Вероятно, только при импорте', NULL, NULL, 10, NULL),
(2296, 170, 275, 'Название', 'value', 'слияние проектов или таблиц, тоже относится к ипорту', NULL, NULL, 10, NULL),
(2297, 170, 276, 'Название', 'value', 'наследование папок', NULL, NULL, 10, NULL),
(2298, 170, 277, 'Название', 'value', 'на папке разрешения создание типов?', NULL, NULL, 10, NULL),
(2299, 170, 278, 'Название', 'value', 'Создание ярлыков', NULL, NULL, 10, NULL),
(2300, 170, 279, 'Название', 'value', 'Права на ячейку', NULL, NULL, 10, NULL),
(2301, 170, 280, 'Название', 'value', 'копирование папок', NULL, NULL, 100, NULL),
(2302, 171, 0, 'Раздел', 'head', NULL, NULL, NULL, 0, NULL),
(2303, 171, 1, 'Подраздел', 'head', NULL, NULL, NULL, 0, NULL),
(2304, 171, 2, 'Описание', 'head', NULL, NULL, NULL, 0, NULL),
(2305, 171, 281, 'Раздел', 'value', 'Интерфейс', NULL, NULL, 0, NULL),
(2306, 171, 281, 'Подраздел', 'value', 'Графический дизайн', NULL, NULL, 0, NULL),
(2307, 171, 281, 'Описание', 'value', 'Шрифт, цвета, иконки', NULL, NULL, 0, NULL),
(2308, 171, 282, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2309, 171, 282, 'Подраздел', 'value', 'Работа вкладок', NULL, NULL, 0, NULL),
(2310, 171, 282, 'Описание', 'value', 'При запуске нескольких приложений, вверху появляются вкладки', NULL, NULL, 0, NULL),
(2311, 171, 283, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2312, 171, 283, 'Подраздел', 'value', 'Работа левого меню', NULL, NULL, 0, NULL),
(2313, 171, 283, 'Описание', 'value', 'В левом меню отображаются корневые разделы системы, а так же отдельные приложения', NULL, NULL, 0, NULL),
(2314, 171, 284, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2315, 171, 284, 'Подраздел', 'value', 'Работа приложений', NULL, NULL, 0, NULL),
(2316, 171, 284, 'Описание', 'value', 'Из левого меню можно запустить приложения, такие как Проводник, Справка, Сравнение таблиц, Просмотр связей. А так же кликнув по ', NULL, NULL, 0, NULL),
(2317, 171, 285, 'Раздел', 'value', 'Модальные окна Проводник', NULL, NULL, 0, NULL),
(2318, 171, 285, 'Подраздел', 'value', 'Создать объект', NULL, NULL, 0, NULL),
(2319, 171, 285, 'Описание', 'value', 'Создает объект таких типов как Папка, Таблица, Событие, Файл, Значение, Пользователь, Роль', NULL, NULL, 0, NULL),
(2320, 171, 286, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2321, 171, 286, 'Подраздел', 'value', 'Добавить права', NULL, NULL, 0, NULL),
(2322, 171, 286, 'Описание', 'value', 'На каждый объект системы, кроме Пользователя и роли, можно установить права на видимость, изменение, копирование, наследование', NULL, NULL, 0, NULL),
(2323, 171, 287, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2324, 171, 287, 'Подраздел', 'value', 'Добавить справку', NULL, NULL, 0, NULL),
(2325, 171, 287, 'Описание', 'value', 'На каждый объект системы, кроме Пользователя и роли, можно добавить описание', NULL, NULL, 0, NULL),
(2326, 171, 288, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2327, 171, 288, 'Подраздел', 'value', 'Удалить', NULL, NULL, 0, NULL),
(2328, 171, 288, 'Описание', 'value', 'При вызове команды удалить появляется модальное окно с подтверждением', NULL, NULL, 0, NULL),
(2329, 171, 289, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2330, 171, 289, 'Подраздел', 'value', 'Вставка', NULL, NULL, 0, NULL),
(2331, 171, 289, 'Описание', 'value', 'При вставке объектов типа Папка или Таблица появляется окно с выбором типа копирования(обычное или наследование)', NULL, NULL, 0, NULL),
(2332, 171, 290, 'Раздел', 'value', 'Приложение \'Проводник\'', NULL, NULL, 0, NULL),
(2333, 171, 290, 'Подраздел', 'value', 'Создание объектов', NULL, NULL, 0, NULL),
(2334, 171, 290, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(2335, 171, 291, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2336, 171, 291, 'Подраздел', 'value', 'Создание пользователей', NULL, NULL, 0, NULL),
(2337, 171, 291, 'Описание', 'value', 'Появляется модальное окно с полями Логин, Роль, Пароль. Логин и пароль обязательны для заполнения', NULL, NULL, 0, NULL),
(2338, 171, 292, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2339, 171, 292, 'Подраздел', 'value', 'Создание ролей', NULL, NULL, 0, NULL),
(2340, 171, 292, 'Описание', 'value', 'Окно с одним полем Название(обязательно для заполнения)', NULL, NULL, 0, NULL),
(2341, 171, 293, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2342, 171, 293, 'Подраздел', 'value', 'Создание таблиц', NULL, NULL, 0, NULL),
(2343, 171, 293, 'Описание', 'value', 'Окно с одним полем Название(обязательно для заполнения)', NULL, NULL, 0, NULL),
(2344, 171, 294, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2345, 171, 294, 'Подраздел', 'value', 'Создание значений /  списков', NULL, NULL, 0, NULL),
(2346, 171, 294, 'Описание', 'value', 'Окно с полями Название(обязательно для заполнения), Тип и значение. Это может быть значением или списком', NULL, NULL, 0, NULL),
(2347, 171, 295, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2348, 171, 295, 'Подраздел', 'value', 'Создание(загрузка) файлов', NULL, NULL, 0, NULL),
(2349, 171, 295, 'Описание', 'value', 'Окно с полем загрузки файла из ОС пользователя', NULL, NULL, 0, NULL),
(2350, 171, 296, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2351, 171, 296, 'Подраздел', 'value', 'Создание событий', NULL, NULL, 0, NULL),
(2352, 171, 296, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(2353, 171, 297, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2354, 171, 297, 'Подраздел', 'value', 'Назначение прав', NULL, NULL, 0, NULL),
(2355, 171, 297, 'Описание', 'value', 'В этом окне можно назначить на объект права для пользователей и ролей', NULL, NULL, 0, NULL),
(2356, 171, 298, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2357, 171, 298, 'Подраздел', 'value', 'Копирование', NULL, NULL, 0, NULL),
(2358, 171, 298, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(2359, 171, 299, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2360, 171, 299, 'Подраздел', 'value', 'Наследование таблиц', NULL, NULL, 0, NULL),
(2361, 171, 299, 'Описание', 'value', 'При наследование таблицы редактирование столбцов становится возможным только в главной таблице(изменение в ней приводит к измене', NULL, NULL, 0, NULL),
(2362, 171, 300, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2363, 171, 300, 'Подраздел', 'value', 'Наследование папок', NULL, NULL, 0, NULL),
(2364, 171, 300, 'Описание', 'value', 'При наследование папки удаление таблиц и подпапок становится невозможным. Изменение можно вводить только в главной папке', NULL, NULL, 0, NULL),
(2365, 171, 301, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2366, 171, 301, 'Подраздел', 'value', 'Выставление приоритета у объекта', NULL, NULL, 0, NULL),
(2367, 171, 301, 'Описание', 'value', 'Приоритет отвечает за последовательность отображения объектов в разделе', NULL, NULL, 0, NULL),
(2368, 171, 302, 'Раздел', 'value', 'Приложение \'Редактор таблицы\'', NULL, NULL, 0, NULL),
(2369, 171, 302, 'Подраздел', 'value', 'Настройка заголовка', NULL, NULL, 0, NULL),
(2370, 171, 302, 'Описание', 'value', 'Добавление/изменение/удаление столбцов таблицы', NULL, NULL, 0, NULL),
(2371, 171, 303, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2372, 171, 303, 'Подраздел', 'value', 'Создание строки', NULL, NULL, 0, NULL),
(2373, 171, 303, 'Описание', 'value', 'Добавляет в таблицу пустую строку', NULL, NULL, 0, NULL),
(2374, 171, 304, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2375, 171, 304, 'Подраздел', 'value', 'Вставка ссылок на ячеек', NULL, NULL, 0, NULL),
(2376, 171, 304, 'Описание', 'value', 'При вставке появляется окно с возможностью выбора вставки по значению или по ссылке(любое изменение в главной таблице влечет изм', NULL, NULL, 0, NULL),
(2377, 171, 305, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2378, 171, 305, 'Подраздел', 'value', 'Копирование', NULL, NULL, 0, NULL),
(2379, 171, 305, 'Описание', 'value', 'При активной ячейке, ее можно скопировать для последующей вставки в эту или любую другую таблицу', NULL, NULL, 0, NULL),
(2380, 171, 306, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2381, 171, 306, 'Подраздел', 'value', 'Вставка ссылок на объекты', NULL, NULL, 0, NULL),
(2382, 171, 306, 'Описание', 'value', 'Из левого меню можно путем перетаскивания добавить ссылки на объекты в таблицу. Значение, Таблица, Файл, Событие', NULL, NULL, 0, NULL),
(2383, 171, 307, 'Раздел', 'value', 'База данных', NULL, NULL, 0, NULL),
(2384, 171, 307, 'Подраздел', 'value', 'Архитектура', NULL, NULL, 0, NULL),
(2385, 171, 307, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(2386, 171, 308, 'Раздел', 'value', 'Экспорт', NULL, NULL, 0, NULL),
(2387, 171, 308, 'Подраздел', 'value', 'Таблиц с подгрузкой всех ссылок(xlsx, xml)', NULL, NULL, 0, NULL),
(2388, 171, 308, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(2389, 171, 309, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2390, 171, 309, 'Подраздел', 'value', 'Резервное копирование', NULL, NULL, 0, NULL),
(2391, 171, 309, 'Описание', 'value', 'Возможность создать резервную копию и восстановление на нее', NULL, NULL, 0, NULL),
(2392, 171, 310, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2393, 171, 310, 'Подраздел', 'value', 'Проекта из формата xml', NULL, NULL, 0, NULL),
(2394, 171, 310, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(2395, 171, 311, 'Раздел', 'value', 'Импорт', NULL, NULL, 0, NULL),
(2396, 171, 311, 'Подраздел', 'value', 'Таблиц с просмотром изменений из формата xlsx, xml', NULL, NULL, 0, NULL),
(2397, 171, 311, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(2398, 171, 312, 'Раздел', 'value', '', NULL, NULL, 0, NULL),
(2399, 171, 312, 'Подраздел', 'value', 'Проекта в формат xml', NULL, NULL, 0, NULL),
(2400, 171, 312, 'Описание', 'link', '0', 11, 'value', 0, NULL),
(2401, 171, 313, 'Раздел', 'value', 'Приложение \"Справка\"', NULL, NULL, 0, NULL),
(2402, 171, 313, 'Подраздел', 'value', '', NULL, NULL, 0, NULL),
(2403, 171, 313, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(2404, 171, 314, 'Раздел', 'value', 'Приложение \"Просмотр связей\"', NULL, NULL, 0, NULL),
(2405, 171, 314, 'Подраздел', 'value', '', NULL, NULL, 0, NULL),
(2406, 171, 314, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(2407, 171, 315, 'Раздел', 'value', 'Приложение \"Сравнение таблиц\"', NULL, NULL, 0, NULL),
(2408, 171, 315, 'Подраздел', 'value', '', NULL, NULL, 0, NULL),
(2409, 171, 315, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(2410, 171, 316, 'Раздел', 'value', 'Приложение \'Редактор событий\'', NULL, NULL, 0, NULL),
(2411, 171, 316, 'Подраздел', 'value', '', NULL, NULL, 0, NULL),
(2412, 171, 316, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3565, 170, 835, 'Название', 'value', 'Папку нельзя скопировать/вырезать в себя', NULL, NULL, 100, NULL),
(3566, 170, 836, 'Название', 'value', 'Нельзя наследовать от наследуемой, если bindId != NULL', NULL, NULL, 100, NULL),
(3567, 170, 837, 'Название', 'value', 'Нельзя добавлять ссылку в таблицу на себя', NULL, NULL, 100, NULL),
(3568, 170, 838, 'Название', 'value', 'В таблице добавить модальное окно со вставкой строки в любое место', NULL, NULL, 100, NULL),
(3569, 170, 839, 'Название', 'value', 'Отладить левое меню, для автоматического обновления', NULL, NULL, 10, NULL),
(3574, 170, 840, 'Название', 'value', 'Нельзя удалить элементы структуры с id до 5', NULL, NULL, 100, NULL),
(3575, 170, 841, 'Название', 'value', 'Добавить возможность изменить имя папки', NULL, NULL, 100, NULL),
(3576, 222, 0, 'Название', 'head', NULL, NULL, NULL, 0, NULL),
(3577, 222, 1, 'Описание', 'head', NULL, NULL, NULL, 0, NULL),
(3578, 222, 2, 'Дополнительно', 'head', NULL, NULL, NULL, 0, NULL),
(3579, 222, 842, 'Название', 'value', 'Это первая строка теста', NULL, NULL, 0, NULL),
(3580, 222, 842, 'Описание', 'value', 'в следующей ячейке значение ускорения', NULL, NULL, 0, NULL),
(3581, 222, 842, 'Дополнительно', 'link', '0', 11, 'value', 0, NULL),
(3582, 222, 843, 'Название', 'value', 'Это вторая строка', NULL, NULL, 0, NULL),
(3583, 222, 843, 'Описание', 'value', 'тут должна вставиться таблица', NULL, NULL, 0, NULL),
(3584, 222, 843, 'Дополнительно', 'link', '0', 170, 'table', 45, NULL),
(3585, 222, 844, 'Название', 'value', 'Это завершающая строка', NULL, NULL, 0, NULL),
(3586, 222, 844, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3587, 222, 844, 'Дополнительно', 'value', 'конец', NULL, NULL, 0, NULL),
(3601, 222, 849, 'Название', 'value', '', NULL, NULL, 0, NULL),
(3602, 222, 849, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3603, 222, 849, 'Дополнительно', 'link', '0', 171, 'table', 0, NULL),
(3631, 224, 0, '1', 'head', NULL, NULL, NULL, 0, NULL),
(3632, 224, 1, '2', 'head', NULL, NULL, NULL, 0, NULL),
(3633, 224, 2, '3', 'head', NULL, NULL, NULL, 0, NULL),
(3634, 224, 859, '1', 'value', '12', NULL, NULL, 0, NULL),
(3635, 224, 859, '2', 'value', '', NULL, NULL, 0, NULL),
(3636, 224, 859, '3', 'value', '1', NULL, NULL, 0, NULL),
(3637, 224, 860, '1', 'value', '', NULL, NULL, 0, NULL),
(3638, 224, 860, '2', 'value', '123', NULL, NULL, 0, NULL),
(3639, 224, 860, '3', 'value', '5', NULL, NULL, 0, NULL),
(3640, 224, 861, '1', 'value', '', NULL, NULL, 0, NULL),
(3641, 224, 861, '2', 'value', '1123', NULL, NULL, 0, NULL),
(3642, 224, 861, '3', 'value', '3', NULL, NULL, 0, NULL),
(3643, 224, 862, '1', 'value', '', NULL, NULL, 0, NULL),
(3644, 224, 862, '2', 'value', '', NULL, NULL, 0, NULL),
(3645, 224, 862, '3', 'value', '2', NULL, NULL, 0, NULL),
(3646, 224, 863, '1', 'value', '', NULL, NULL, 0, NULL),
(3647, 224, 863, '2', 'value', '', NULL, NULL, 0, NULL),
(3648, 224, 863, '3', 'value', '4', NULL, NULL, 0, NULL),
(3649, 222, 864, 'Название', 'value', '', NULL, NULL, 0, NULL),
(3650, 222, 864, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3651, 222, 864, 'Дополнительно', 'value', '', NULL, NULL, 0, NULL),
(3652, 222, 865, 'Название', 'value', '', NULL, NULL, 0, NULL),
(3653, 222, 865, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3654, 222, 865, 'Дополнительно', 'value', '', NULL, NULL, 0, NULL),
(3658, 222, 867, 'Название', 'value', '', NULL, NULL, 0, NULL),
(3659, 222, 867, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3660, 222, 867, 'Дополнительно', 'value', '', NULL, NULL, 0, NULL),
(3661, 222, 868, 'Название', 'value', '', NULL, NULL, 0, NULL),
(3662, 222, 868, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3663, 222, 868, 'Дополнительно', 'value', '', NULL, NULL, 0, NULL),
(3664, 222, 869, 'Название', 'value', '', NULL, NULL, 0, NULL),
(3665, 222, 869, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3666, 222, 869, 'Дополнительно', 'value', '', NULL, NULL, 0, NULL),
(3667, 222, 870, 'Название', 'value', '', NULL, NULL, 0, NULL),
(3668, 222, 870, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3669, 222, 870, 'Дополнительно', 'value', '', NULL, NULL, 0, NULL),
(3670, 222, 871, 'Название', 'value', '', NULL, NULL, 0, NULL),
(3671, 222, 871, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3672, 222, 871, 'Дополнительно', 'value', '', NULL, NULL, 0, NULL),
(3673, 222, 872, 'Название', 'value', '', NULL, NULL, 0, NULL),
(3674, 222, 872, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3675, 222, 872, 'Дополнительно', 'value', '', NULL, NULL, 0, NULL),
(3676, 222, 873, 'Название', 'value', '', NULL, NULL, 0, NULL),
(3677, 222, 873, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3678, 222, 873, 'Дополнительно', 'value', '', NULL, NULL, 0, NULL),
(3679, 222, 874, 'Название', 'value', '', NULL, NULL, 0, NULL),
(3680, 222, 874, 'Описание', 'value', '', NULL, NULL, 0, NULL),
(3681, 222, 874, 'Дополнительно', 'value', '', NULL, NULL, 0, NULL),
(3708, 170, 884, 'Название', 'value', 'Добавить показ связей в проводнике, справа появляется таблица и там ссылки на элементы', NULL, NULL, 10, NULL),
(3799, 170, 913, 'Название', 'value', 'Добавить поиск в проводник', NULL, NULL, 100, NULL),
(3818, 170, 919, 'Название', 'value', 'Если копируем наследуемую таблицу то связь должна оставаться', NULL, NULL, 100, NULL),
(3820, 170, 921, 'Название', 'value', 'Добавить в модальное окно кнопку удалить', NULL, NULL, 100, NULL),
(3967, 170, 964, 'Название', 'value', 'Добавить в пункт меню проводника показать связи', NULL, NULL, 10, NULL),
(3968, 170, 965, 'Название', 'value', 'Добавить в проводник открывающееся справа меню с просмотром связей', NULL, NULL, 10, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `line_ids`
--

CREATE TABLE `line_ids` (
  `id` int(11) NOT NULL,
  `next` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `line_ids`
--

INSERT INTO `line_ids` (`id`, `next`) VALUES
(194, 257),
(257, 258),
(258, NULL),
(261, 262),
(262, 263),
(263, 264),
(264, 265),
(265, 266),
(266, 267),
(267, 268),
(268, 269),
(269, 270),
(270, 271),
(271, 272),
(272, 273),
(273, 274),
(274, 275),
(275, 276),
(276, 277),
(277, 278),
(278, 279),
(279, 280),
(280, 835),
(281, 282),
(282, 283),
(283, 284),
(284, 285),
(285, 286),
(286, 287),
(287, 288),
(288, 289),
(289, 290),
(290, 291),
(291, 292),
(292, 293),
(293, 294),
(294, 295),
(295, 296),
(296, 297),
(297, 298),
(298, 299),
(299, 300),
(300, 301),
(301, 302),
(302, 303),
(303, 305),
(304, 306),
(305, 304),
(306, 307),
(307, 309),
(308, 310),
(309, 308),
(310, 311),
(311, 312),
(312, 313),
(313, 314),
(314, 315),
(315, 316),
(316, NULL),
(835, 836),
(836, 837),
(837, 919),
(838, 839),
(839, 840),
(840, 884),
(841, 913),
(842, 870),
(843, 871),
(844, 849),
(849, 864),
(859, 862),
(860, NULL),
(861, 863),
(862, 861),
(863, 860),
(864, 865),
(865, 872),
(867, 869),
(868, 867),
(869, 842),
(870, 843),
(871, 844),
(872, 873),
(873, 874),
(874, 0),
(884, 964),
(913, 921),
(919, 838),
(921, NULL),
(964, 965),
(965, 841);

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
(11, 'value', '9.8');

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
('test', '$2a$10$b8786b2a269b9a7145e47e6z56o9RJOdcbfLIyJva/O7Wgi5SqiW2');

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
('test', '', '2018-07-06 11:06:39');

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
(110, 32, 'role', 'Инженер', 1),
(118, 4, 'user', 'test', 9),
(119, 98, 'user', 'test', 9),
(120, 30, 'user', 'test', 1),
(122, 224, 'user', 'test', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `roles`
--

CREATE TABLE `roles` (
  `role` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
('GJ3COg64AOP', 'admin', '8ca63214c8f174a027c3434a1f44ed2e', '2018-07-09 17:30:36'),
('G1ke048Pjp4', 'test', 'c1b4b4743ccb6a3a91aa0c4251654d93', '2018-05-14 10:46:08'),
('GCitgV4Vlu8', 'test', '24a73c4db8ac88ae619bc4ba7d4caf61', '2018-05-23 10:04:55'),
('G0SJ63RJfse', 'test', '0f95513eeaba5dbf8069ce0c071f9769', '2018-05-23 10:31:37'),
('GgL626bOULb', 'test', 'de2efc6383c1538c02282dfc7ffcea0d', '2018-05-23 10:47:39'),
('GlXmAD3aVo4', 'test', '9c091969d438996edbf1d899f09ef925', '0000-00-00 00:00:00'),
('GjUMr2I4r38', '', '', '2018-07-09 17:25:10'),
('G1OjDA4Wr6Q', 'test', 'ab40f16eec263645ef89773be4d474e4', '0000-00-00 00:00:00'),
('GU8iEb3VvSz', 'test', 'dd37fc6f39b514b8d297174b8f4e1d52', '0000-00-00 00:00:00'),
('G73MhS1F4y1', 'test', '2154c8d8005f35661d0d0b1471a7578d', '0000-00-00 00:00:00'),
('G07gL0aA6AE', 'test', '5445d8965d65c3fe935fad0b4c71a708', '0000-00-00 00:00:00'),
('G4Ja7Ae1D05', 'test', '7480ab845435615bdaba14b9dcbd9550', '0000-00-00 00:00:00'),
('G8wLo0P7NOT', 'fuck', '77621457c91ade91b700d67b7d4ecc92', '0000-00-00 00:00:00'),
('GkvI7h7HSh1', 'test', '570b6285b48710d6100a16c2b1513caa', '0000-00-00 00:00:00'),
('Gws3YJ51wav', 'test', '302e61079e88203f2ec55307ce735092', '2018-06-25 09:30:21'),
('G4gtJeGkFcV', '', '', '2018-07-02 10:24:09'),
('G0oFpsDncPH', 'test', 'c25053986695983bf3975c534a1a3b9c', '2018-07-06 11:06:46'),
('G8541I4a184', 'test', 'e7423922b573aaf9a99c1e4e736af6ad', '2018-07-09 17:30:40');

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
  `info` varchar(512) DEFAULT NULL,
  `bindId` int(11) DEFAULT NULL,
  `state` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `structures`
--

INSERT INTO `structures` (`id`, `objectType`, `objectId`, `name`, `parent`, `priority`, `info`, `bindId`, `state`) VALUES
(1, 'folder', 0, 'Администрирование', 0, 3, 'Привет', NULL, 0),
(2, 'folder', 0, 'Пользователи', 1, 0, '', NULL, 0),
(3, 'folder', 0, 'Роли', 1, 0, '', NULL, 0),
(4, 'table', 0, 'Пользователи', 1, 0, '', NULL, 0),
(30, 'folder', 0, 'База знаний', 0, 0, '', NULL, 46),
(32, 'folder', 0, 'Проекты', 0, 1, '', NULL, 0),
(33, 'folder', 0, 'Шаблоны', 0, 2, '', NULL, 0),
(98, 'folder', 0, 'Основная папка', 30, 0, '', NULL, 46),
(100, 'folder', 0, 'Файлы', 0, 5, '', NULL, 0),
(116, 'file', 0, 'evil-plan-baby.jpg', 100, 0, '', NULL, 0),
(119, 'file', 0, 'Структура.xlsx', 100, 0, '', NULL, 0),
(131, 'user', NULL, 'admin', 2, 1, NULL, NULL, 0),
(144, 'table', 0, 'Новая таблица', 98, 0, '', NULL, 50),
(170, 'table', 0, 'Задачи', 98, 0, '', NULL, 45),
(171, 'table', 0, 'Спецификация', 98, 0, '', NULL, 0),
(221, 'value', 11, 'Ускорение свободного падения', 98, 0, '', NULL, 0),
(222, 'table', 0, 'Для тестирования экспорта', 98, 0, '', NULL, 45),
(224, 'table', 0, 'Новая таблица 2', 98, 0, '', NULL, 0),
(229, 'user', NULL, 'test', 2, 0, NULL, NULL, 0);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `fields`
--
ALTER TABLE `fields`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `line_ids`
--
ALTER TABLE `line_ids`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3969;

--
-- AUTO_INCREMENT для таблицы `line_ids`
--
ALTER TABLE `line_ids`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=966;

--
-- AUTO_INCREMENT для таблицы `main_log`
--
ALTER TABLE `main_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `my_list`
--
ALTER TABLE `my_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT для таблицы `my_values`
--
ALTER TABLE `my_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT для таблицы `rights`
--
ALTER TABLE `rights`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT для таблицы `structures`
--
ALTER TABLE `structures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=248;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
