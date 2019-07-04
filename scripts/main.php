<?php
    /* $start = microtime(true); */
    /* , round(microtime(true) - $start, 4) */
    /* error_reporting(0); */

    header('Access-Control-Allow-Origin: *');
    include("config.php");
	include("query.php");
    include("functions.php");
	$param = null;
    $Result = "";
    $paramL = $paramC = $paramI = null;
	if (array_key_exists('nquery', $_GET) || array_key_exists('nquery', $_POST))
	{
		if (array_key_exists('nquery', $_GET))
		{
			$nQuery = $_GET['nquery'];
			if(array_key_exists('param', $_GET))
				$param = $_GET['param'];
			if(array_key_exists('paramL', $_GET))
				$paramL = $_GET['paramL']; 
			if(array_key_exists('paramC', $_GET))
				$paramC = $_GET['paramC']; 
			if(array_key_exists('paramI', $_GET))
				$paramI = $_GET['paramI'];
		}
		if (array_key_exists('nquery', $_POST))
		{
			$nQuery = $_POST['nquery'];
			if(array_key_exists('param', $_POST))
				$param = $_POST['param'];
			if(array_key_exists('paramL', $_POST))
				$paramL = $_POST['paramL']; 
			if(array_key_exists('paramC', $_POST))
				$paramC = $_POST['paramC']; 
			if(array_key_exists('paramI', $_POST))
				$paramI = $_POST['paramI']; 
        }
    }
    /* Работа с БД */
    $mysqli = new mysqli('localhost', $username, $password, $dbName);
    if (mysqli_connect_errno()) { echo("None connection"); exit(); }
    $mysqli->set_charset("utf8");
    /* Установка */
    if($nQuery == -1)
    {
        $checkTable = false;
        $checkLogin = false;
        if($result = query("SHOW TABLES LIKE 'registration'", []))
            while ($row = $result->fetch_array(MYSQLI_NUM)) $checkTable = true;
        if(!$checkTable) 
        { 
            $sql = file_get_contents("../gazprom_auto.sql");
            $mysqli->multi_query($sql);
        }
        if($result = query("SELECT login FROM registration WHERE login = 'admin'", []))
            while ($row = $result->fetch_array(MYSQLI_NUM)) $checkLogin = true;
        if(!$checkLogin) 
        { 
            query("INSERT INTO registration VALUES(%s, %s, NOW())", ["admin", ""]);
            query("INSERT INTO password VALUES(%s, %s)", ["admin", "$2a$10$644bb3233e1ff251b4b4eumdZjoiZjWjFLyol.Ad7uUoNWlWCpz.u"]);
        }
        exit();
    }
    /* Переход со старой версии таблиц */
    if($nQuery == -2)
    {
        if($result = query("SELECT id, tableId, name_column FROM fields WHERE type = 'head'", []))
            while ($row = $result->fetch_array(MYSQLI_NUM))
            {
                query("UPDATE fields SET name_column = %i WHERE tableId = %i AND name_column = %s AND type != 'head'", [$row[0], $row[1], $row[2]]);
                query("UPDATE fields SET value = %s, name_column = NULL WHERE id = %i", [$row[2], $row[0]]);
                echo $row[0]." ".$row[1]." ".$row[2]."<br>";
            }
    }
    //file_get_contents
    /* Запросы не требующие логин */
    if($nQuery < 40)
        switch($nQuery)
        {
            case 0: // Запрос версии
                /* include("./version/versions.php"); */
                $project = [];	
                $project['main'] = "0.9.75";/* getVersion(		$_main["name"], 		$_main["data"]); */
                $project['php'] = "0.9.91";/* getVersion(		$_php["name"], 			$_php["data"]); */
                echo json_encode($project);
                break;
            case 1: // Возвращает информацию о текущем пользователе
                $request = selectOne("SELECT login FROM signin WHERE id = %s", [$paramI]);
                if($request == "") query("INSERT INTO signin VALUES(%s, %s, %s, NOW())", [$paramI, '', '']); // Фиксирует вход на сайт нового пользователя
                else query("UPDATE signin SET date = NOW() WHERE id = %s", [$paramI]); // Обновление времени нахождения пользователя на сайте
                break;
            case 2: // резерв
                break;
            case 3: // резерв
                break;
            case 4: // вход
                require_once("enter.php");
                require_once("myLog.php");
                $myLog = new MyLog($paramL);
                $myLog->add("user", "enter", $paramL);
                break;
            case 5: // выход
                break;
            case 6: // автовход
                $checkKey = "";
                $login = $paramL;
                if($result = query("SELECT checkkey FROM signin WHERE id = %s AND login = %s", [$paramI, $paramL]))
                    while ($row = $result->fetch_array(MYSQLI_NUM)) $checkKey = $row[0];
                if ($checkKey != "" && $checkKey == $paramC) echo json_encode([1]);
                else echo json_encode([-1]); 
                break;
            case 7: // Очищает логин и ключ при выходе пользователя с сайта
                query("UPDATE signin SET checkkey = '', login = '' WHERE id = %s", [$paramI]);
                break;
            case 8: // резерв 
                break;
            case 9: // Проверка правильности введенного логина
                $login = $paramL;
                $array = [];
                $j = 0;
                if($result = query("SELECT login FROM registration", []))
                    while ($row = $result->fetch_array(MYSQLI_NUM))
                        for ($i = 0;  $i < count($row); $i++)
                        {
                            $array[$j] = $row[$i];
                            $j++;
                        }
                echo checkL($array, $login);
                break;
            case 10: // Проверка на целостность структуры
                if($result = query("SELECT parent FROM structures", []))
                    while ($row = $result->fetch_array(MYSQLI_NUM))
                        if($row[0])
                        {
                            $error = true;
                            if($result2 = query("SELECT name FROM structures WHERE id = %i", [ (int)$row[0] ]))
                                while ($row2 = $result2->fetch_array(MYSQLI_NUM)) $error = false;
                            if($error) echo $row[0]."\n";
                        }
                break;
        }
    /* Запросы требующие логин */
    if($nQuery >= 40)
    {
        $checkKey = "";
        $rights = -1;
        $out_rights = [];
        $login = $paramL;
        $role = "";
        /* Работа с логом */
        require_once("myLog.php");
        $myLog = new MyLog($login);
        /* Работа с правами */
        require_once("myRight.php");
        $myRight = new MyRight($myLog);

        if($result = query("SELECT checkkey FROM signin WHERE id = %s AND login = %s", [$paramI, $paramL]))
            while ($row = $result->fetch_array(MYSQLI_NUM)) $checkKey = $row[0];
        if ($checkKey != "" && $checkKey == $paramC) 
        {
            if($result = query("SELECT role FROM registration WHERE login = %s", [$paramL]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) $role = $row[0];
            if($nQuery >= 40 && $nQuery < 100)
                switch($nQuery)
                {
                }
            if($nQuery >= 100 && $nQuery < 150) // Работа со структурой
            {
                require_once("myStructures.php");
                $myStructures = new MyStructures($myRight, $myLog);
                switch($nQuery)
                {
                    case 100: // Создать элемент структуры 
                        if(($myRight->get($param[3]) & 8) != 8) return; // Права на изменение
                        if($param[0] == "filter") if(($myRight->get($param[3]) & 32) != 32) return; // Права на создание фильтра
                        $myStructures->create($param);
                        break;
                    case 110: // Загрузка структуры // Права на просмотр
                        $idParent = (int)$param[0];
                        $out = ["folder" => [], "path" => [], "stickers" => []];
                        $filterStr = "";
                        $filter = selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [ $login, "filter_global" ]);
                        if(!is_null($filter) && $filter != "") 
                        {
                            $filter = json_decode($filter);
                            require_once("myFilter.php");
                            $filterClass = new MyFilter();
                            $filterStr = $filterClass->getFilterStrByFolder($filter->id, $idParent);
                            if($filterStr != "") $filterStr = " AND ($filterStr)";
                        };
                        $listId = "";
                        $query = "SELECT id, objectType, objectId, name, parent, priority, info, bindId, state, icon FROM structures WHERE parent = %i AND trash = 0 $filterStr";
                        if($login == "admin") $query .= " ORDER by parent, priority";
                        else $query .= " AND
                            id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                                AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0)) ORDER by parent, priority";
                        if($result = query($query, $login == "admin" ? [ $idParent ] : [ $idParent, $login, $role, $login ]))
                            while ($row = $result->fetch_assoc())
                            {
                                $out["folder"][] = getObjectFromStructures($row);
                                $listId .= ($listId == "" ? "" : ",").$row["id"];
                            }
                        if($listId != "")
                            if($result = query("SELECT * FROM stickers WHERE objectId IN ($listId) AND type != 'cell' AND trash = 0", []))
                                while ($row = $result->fetch_assoc())
                                    $out["stickers"][] = $row;
                        getFullPath($out["path"], $param[0]);
                        echo json_encode($out);
                        $myLog->add("structure", "open", $idParent);
                        break;
                    case 111: // Получение родителя
                        $typeElement = $param[0];
                        $idElement = (int)$param[1];
                        switch($typeElement)
                        {
                            case "role":
                            case "user":
                            case "folder":
                            case "table":
                            case "file":
                            case "event":
                            case "plan":
                            case "class":
                            case "filter":
                                request("SELECT parent FROM structures WHERE id = %i", [$idElement]);
                                break;
                            case "tlist":
                                request("SELECT parent, id FROM structures WHERE objectType = %s AND objectId = %i ", [$typeElement, $idElement]);
                                break;
                            case "cell":
                                request("SELECT tableId FROM fields WHERE id = %i ", [$idElement]);
                                break;
                        }
                        break;
                    case 130: // Удаление элемента структуры // Права на изменение
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
                        if(selectOne("SELECT objectType FROM structures WHERE id = %i", [ $idElement ]) == "table" 
                            && selectOne("SELECT class FROM structures WHERE id = %i", [ $idElement ]) == 1) return; // Ограничение для удаления в таблицах созданных конструктором
                        query("UPDATE structures SET trash = 1 WHERE id = %i", [$idElement]);
                        $myLog->add("structure", "remove", $idElement);
                        break;
                    case 113: // Загрузка структуры без выпрямления
                        $out = [];
                        $operand = [];
                        $filterStr ="";
                        $filter = selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [ $login, "filter_global" ]);
                        if(!is_null($filter) && $filter != "") 
                        {
                            $filter = json_decode($filter);
                            require_once("myFilter.php");
                            $filterClass = new MyFilter();
                            $filter = $filterClass->getFilterStrByGlobal($filter->id);
                            if($filter["str"] != "") $filterStr = " AND (".$filter["str"].")";
                            $operand = $filter["operand"];
                        };
                        $query = "SELECT id, objectType, objectId, name, parent, priority, info, state FROM structures WHERE trash = 0 $filterStr";
                        if($login == "admin") $query .= " ORDER by parent, priority";
                        else $query .= " AND
                            id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                                AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0)) ORDER by parent, priority";
                        if($login != "admin")  $operand += [$login, $role, $login ];
                        if($result = query($query, $operand))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                $elem = [];
                                $elem["id"] = $row[0];
                                $elem["objectType"] = $row[1];
                                $elem["objectId"] = $row[2];
                                $elem["name"] = $row[3];
                                $elem["state"] = $row[7];
                                $elem["childrens"] = [];
                                if(($myRight->get($row[0], true) & 1) == 1)
                                    if($row[4] == 0) $out[] = $elem;
                                    else searchParent($out, $row[4], $elem);
                            }
                        echo json_encode($out);
                        break;
                    case 114: // Копирование элемента
                        $idElement = (int)$param[0]; // id Элемента 
                        $idParent = (int)$param[1]; // id папки в которую копируем
                        $newName = $param[3];
                        $out = [$idElement]; //Проверка на добавление папки саму в себя
                        getRemoveElementbyStructure($out, $idElement);
                        for($i = 0, $c = count($out); $i < $c; $i++) 
                            if($out[$i] == $idParent) { echo "ERROR"; return; }
                        
                        if(selectOne("SELECT objectType FROM structures WHERE id = %i", [ $idElement ]) == "table" 
                            && selectOne("SELECT class FROM structures WHERE id = %i", [ $idElement ]) == 1) return; // Ограничение для копирования/вырезания в таблицах созданных конструктором

                        require_once("copyAndRemove.php");
                        $type = $param[2]; // тип операции
                        if(($myRight->get($idParent) & 8) != 8) continue; // Права на изменение
                        if($type == "copy" || $type == "inherit") // Копирование или Наследование
                        {
                            if($type == "copy" && ($myRight->get($idElement) & 2) != 2) continue; // Права на копирование
                            if($type == "inherit" && ($myRight->get($idElement) & 4) != 4) continue; // Права на наследование
                            
                            $structures = new CopyAndRemove($idElement, $idParent, $type, $myLog);
                            $structures->copy($newName);
                            $myLog->add("structure", "copy", $idParent);
                        }
                        if($type == "cut") // Вырезать(изменение)
                        {
                            if(($myRight->get($idElement) & 8) != 8) continue; // Права на изменение
                            query("UPDATE structures SET parent = %i WHERE id = %i", [$idParent, $idElement]);
                            $myLog->add("structure", "cut", $idParent);
                        }
                        break;
                    case 115: // Запрос приоритета и иконок
                        if(($myRight->get($param[0]) & 1) != 1) continue; // Права на просмотр
                        request("SELECT priority, icon FROM structures WHERE id = %i", $param);
                        break;
                    case 116: // Изменение приоритета и иконок
                        if(($myRight->get($param[1]) & 8) != 8) continue; // Права на изменение
                        query("UPDATE structures SET priority = %i, icon = %i WHERE id = %i", $param);
                        break;
                    case 117: // Загрузка файлов на сервер
                        echo loadFile(10, ['gif','jpeg','png','jpg','xls','xlsx','doc','docx']);
                        break;
                    case 118: // Удаление файлов из временной папки
                        unlink("../tmp/".$param[0]); 
                        break;
                    case 119: // Загрузка файла с клиента
                        $idElement = (int)$param[0];
                        $file = $param[1];
                        if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
                        if (!file_exists("../files/$idElement")) mkdir("../files/$idElement", 0700);
                        rename("../tmp/$file", "../files/$idElement/$file"); 
                        break;
                    case 120: // Изменение имени объекта
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
                        query("UPDATE structures SET name = %s WHERE id = %i", [ $param[1], $idElement ]);
                        $myLog->add(selectOne("SELECT objectType FROM structures WHERE id = %i", [ $idElement ]), "update", $idElement);
                        break;
                    case 121: // Запрос файла с правами
                        $idElement = (int)$param;
                        if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
                        $name = "";
                        if($result = query("SELECT name FROM structures WHERE id = %i", [ $idElement ])) 
                            $name = $result->fetch_array(MYSQLI_NUM)[0];
                        $filePathForDownload = "../files/$idElement/$name";
                        require_once("getFile.php");
                        $myLog->add("file", "download", $idElement);
                        break;
                    case 122: // запрос информации об элементе структуры
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
                        request("SELECT info FROM structures WHERE id = %i", [ $idElement ]);
                        break;
                    case 123: // выставление информации в структуре
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
                        query("UPDATE structures SET info = %s WHERE id = %i", [ $param[1], $idElement ]);
                        break;
                    case 124: // Поиск в структуре элементов
                        $out = ["folder" => []];
                        $type = "%$param[1]%";
                        if($param[0][0] == "#")
                        {
                            $search = str_replace("#", "", $param[0]);
                            $query = "SELECT id, objectType, objectId, name, parent, priority, info, bindId, state, icon FROM structures WHERE hashtag = %s AND objectType LIKE %s";
                        }
                        else
                        {
                            $search = "%$param[0]%";
                            $query = "SELECT id, objectType, objectId, name, parent, priority, info, bindId, state, icon FROM structures WHERE name LIKE %s AND objectType LIKE %s";
                        }
                        if($login == "admin") $query .= " ORDER by parent, priority";
                        else $query .= " AND id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                                AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0)) ORDER by parent, priority";
                        if($result = query($query, $login == "admin" ? [ $search, $type ] : [ $search, $type, $login, $role, $login ]))
                            while ($row = $result->fetch_assoc()) 
                                $out["folder"][] = getObjectFromStructures($row);
                        echo json_encode($out);
                        break;
                    case 125: // Получить список объектов которые ссылаются и на которые ссылается запрошенный объект
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
                        $fromInherit = []; // откуда наследуется
                        $whoInherit = [];
                        $whoRefer = [];
                        if($result = query("SELECT id, objectType, name FROM structures WHERE id IN (SELECT bindId FROM structures WHERE id = %i)", [ $idElement ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) $fromInherit[] = $row;
                        if($result = query("SELECT id, objectType, name FROM structures WHERE bindId = %i", [ $idElement ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) $whoInherit[] = $row;

                        $linkType = selectOne("SELECT objectType FROM structures WHERE id = %i", [ $idElement ]);
                        $linkId = $idElement;
                        $query = "SELECT id, tableId FROM fields WHERE type = 'link' AND linkId = %i AND linkType = %s";
                        $queryArray = [ $idElement ];
                        if($linkType == "event") $query = "SELECT id, tableId FROM fields WHERE eventId = %i";
                        else
                        {
                            if($linkType == "value" || $linkType == "tlist") $linkId = (int)selectOne("SELECT objectId FROM structures WHERE id = %i", [ $idElement ]);
                            $queryArray = [ $linkId, $linkType ];
                        }
                        if($result = query($query, $queryArray))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                $tableId = (int)$row[1];
                                if(!array_key_exists($tableId, $whoRefer))
                                    $whoRefer[$tableId] = ["fields" => [], "name" => selectOne("SELECT name FROM structures WHERE id = %i", [ $tableId ])];
                                $whoRefer[$tableId]["fields"][] = (int)$row[0];
                            }
                        echo json_encode(["fromInherit" => $fromInherit, "whoInherit" => $whoInherit, "whoRefer" => $whoRefer]);
                        break;
                    case 126: // Получение имени элемента структуры
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
                        echo selectOne("SELECT name FROM structures WHERE id = %i", [ $idElement ]);
                        break;
                    case 127: // запрос информации об элементе структуры для приложения справка
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
                        request("SELECT objectType, info, state, name FROM structures WHERE id = %i", [ $idElement ]);
                        break;
                    case 128: // Импорт таблицы на сервер
                        echo loadFile(10, ['xls','xlsx']);
                        break;
                    case 129: // Получить тип элемента на который ссылается ярлык
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
                        $out = [];
                        if($result = query("SELECT id, objectType, objectId, name, parent, priority, info, bindId, state, icon FROM structures WHERE id = %i", [ $idElement ]))
                            while ($row = $result->fetch_assoc()) 
                                $out = getObjectFromStructures($row);
                        echo json_encode($out);
                        break;
                    case 112: // Полное удаление Объекта из проекта
                        require_once("copyAndRemove.php");
                        $idElement = (int)$param[0];
                        $structures = new CopyAndRemove(null, null, null, $myLog);
                        $out = [ $idElement ];
                        if(selectOne("SELECT objectType FROM structures WHERE id = %i", [ $idElement ]) == "table" 
                            && selectOne("SELECT class FROM structures WHERE id = %i", [ $idElement ]) == 1) return; // Ограничение для удаления в таблицах созданных конструктором
                        getRemoveElementbyStructure($out, $idElement);
                        for($i = 0, $c = count($out); $i < $c; $i++)
                        {
                            if(($myRight->get($out[$i]) & 8) != 8) continue; // Права на изменение
                            $structures->remove($out[$i]);
                        }
                        echo json_encode($out);
                        break;
                    case 131: // Подсчитывает сколько элементов используют данный объект
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 1) != 1) continue; // Права на просмотр
                        echo $myStructures->getWhereUsed($idElement);
                        break;
                    case 132: // Отключение пользователя
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 8) != 8) continue; // Права на изменение
                        $username = selectOne("SELECT name FROM structures WHERE id = %i", [ $idElement ]);
                        query("UPDATE signin SET checkkey = '', login = '' WHERE login = %s", [$username]);
                        $myLog->add("user", "logout", $username);
                        break;
                    case 133: // Запросить таблицу свойств
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 1) != 1) continue; // Права на просмотр
                        $data = query("SELECT objectType, priority, icon, user_property, hashtag FROM structures WHERE id = %i", [ $idElement ])->fetch_assoc();
                        $tableProperty = [
                            "timeCreate" => selectOne("SELECT date FROM main_log WHERE type = 'structure' AND value = %s AND operation = 'create' LIMIT 1", [ $idElement ]),
                            /* "timeUpdate" => selectOne("SELECT date FROM main_log WHERE type = %s AND value = %s AND operation = 'update' LIMIT 1", [ $type, $idElement ]), */
                            "hashtag" => $data["hashtag"],
                            "userProperty" => $data["user_property"],
                            "priority" => (int)$data["priority"],
                            "icon" => (int)$data["icon"]
                        ];
                        echo json_encode($tableProperty);
                        break;
                    case 134: // Сохранить пользовательскую таблицу свойств
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 8) != 8) continue; // Права на изменение
                        query("UPDATE structures SET user_property = %s WHERE id = %i", [$param[1], $idElement]);
                        break;
                    case 135: // Обновить хэштег
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 8) != 8) continue; // Права на изменение
                        query("UPDATE structures SET hashtag = %s WHERE id = %i", [$param[1], $idElement]);
                        break;
                    case 136: // Сравнение двух таблиц
                        $idTable1 = (int)$param[0];
                        $idTable2 = (int)$param[1];
                        if(($myRight->get($idTable1) & 1) != 1) continue; // Права на просмотр
                        if(($myRight->get($idTable2) & 1) != 1) continue; // Права на просмотр
                        require_once("myTable.php");
                        $myTable1 = new MyTable($idTable1, $myLog);
                        $myTable2 = new MyTable($idTable2, $myLog);

                        $headTable1 = [];
                        $dataTable1 = [];
                        $headTable2 = [];
                        $dataTable2 = [];
                        $myTable1->getDataFromTable($dataTable1, 0, 0, $headTable1, 0);
                        $myTable2->getDataFromTable($dataTable2, 0, 0, $headTable2, 0);
                        $countRowData1 = count($dataTable1);
                        $countRowData2 = count($dataTable2);
                        $countRow = $countRowData1 <= $countRowData2 ? $countRowData1 : $countRowData2;
                        $headEquality = false;
                        if(count($headTable1) == count($headTable2)) // Проверка заголовка
                        {
                            for($i = 0, $c = count($headTable1); $i < $c; $i++)
                            {
                                for($j = 0, $c2 = count($headTable1[$i]); $j < $c2; $j++)
                                    if($headTable1[$i][$j]["value"] != $headTable2[$i][$j]["value"]) break;
                                if($j != $c2) break;
                            }
                            $headEquality = $i == count($headTable1);
                        }
                        $inequality = [];
                        if($headEquality)
                        {
                            for($i = 0; $i < $countRow; $i++)
                                foreach($dataTable1[$i] as $key => $value)
                                    if($dataTable1[$i][$key]["value"] != $dataTable2[$i][$key]["value"]) $inequality[] = [ "A" => $dataTable1[$i][$key], "B" => $dataTable2[$i][$key] ];
                        }
                        echo json_encode([$headEquality, $inequality]);
                        break;
                    case 137: // Добавить заметку
                        $objectId = (int)$param[0];
                        $name = $param[1];
                        $type = $param[2];
                        $data = $param[3];
                        query("INSERT INTO stickers (objectId, name, type, data, login, trash) VALUES(%i, %s, %s, %s, %s, 0)", [ $objectId, $name, $type, $data, $login ]);
                        break;
                    case 138: // Отправить заметку в архив
                        $stickerId = (int)$param[0];
                        query("UPDATE stickers SET trash = 1 WHERE id = %i", [ $stickerId ]);
                        break;
                    case 139: // Создать таблицу из файла
                        $idObject = (int)$param[0];
                        $loadKey = $param[1];
                        if(($myRight->get($idObject) & 1) != 1) continue; // Права на просмотр
                        $parent = selectOne("SELECT parent FROM structures WHERE id = %i", [ $idObject ]);
                        $name = selectOne("SELECT name FROM structures WHERE id = %i", [ $idObject ]);

                        require_once dirname(__FILE__) . '/PHPExcel.php';
                        $objReader = PHPExcel_IOFactory::createReader('Excel2007');
                        $objReader->setReadDataOnly(true);
                        $objPHPExcel = $objReader->load("../files/$param[0]/$name");
                        $fileData = $objPHPExcel->getActiveSheet()->toArray();

                        require_once("myStructures.php");
                        require_once("myTable.php");
                        $myStructures = new MyStructures($myRight, $myLog);
                        $idTable = $myStructures->create(["table", NULL, $name, $parent, 0, ""], false);
                        $myTable = new MyTable($idTable, $myLog); // Общий класс для работы с таблицами

                        $data = [];
                        for($j = 0, $c = count($fileData[0]); $j < $c; $j++)
                            $data[] = (object)["value" => $fileData[0][$j], "i" => $j];
                        $myTable->setAndRemoveHeader($data, []);
                        $c = count($fileData);
                        $p = 100 / $c;
                        $percent = $p;
                        for($i = 1; $i < $c; $i++)
                        {
                            $row = $myTable->addRow(-1, -1, false);
                            $idRow = $row["__ID__"];
                            $j = 0;
                            foreach($row as $idColumn => $value)
                                if($idColumn != "__ID__")
                                    query("UPDATE fields SET value = %s WHERE idColumn = %i AND i = %i", [ $fileData[$i][$j++], $idColumn, $idRow ]);
                            $percent += $p;
                            query("UPDATE user_settings SET value = %s WHERE login = %s AND type = %s", [$percent, $login, $loadKey]);
                        }
                        query("DELETE FROM user_settings WHERE login = %s AND type = %s", [ $login, $loadKey ]);
                        break;
                    case 140: // Создает в настройках уникальную запись для проверки загрузки в процентах
                        $loadKey = unique_md5();
                        query("INSERT INTO user_settings (login, id, type, value) VALUES(%s, %i, %s, %s)", [$login, -1, $loadKey, "0"]);
                        echo $loadKey;
                        break;
                    case 141: // Получить статус загрузки процесса
                        $loadKey = $param[0];
                        $loadValue = selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [$login, $loadKey]);
                        echo is_null($loadValue) ? "END" : $loadValue;
                        break;
                }
            }
            if($nQuery >= 150 && $nQuery < 200) // Работа с Пользователями // Только admin
            {
                if($login != "admin" && $nQuery != 150 && $nQuery != 151) return;
                switch($nQuery)
                {
                    case 150: // Запрос списка пользователей
                        request("SELECT login, role FROM registration", []);
                        break;
                    case 151: // Запрос списка ролей
                        request("SELECT role FROM roles", []);
                        break;
                    case 152: // Добавление пользователя 
                        if(($myRight->get($param[3]) & 8) != 8) return; // Права на изменение структуры
                        if(require_once("registration.php"))
                        {
                            query("INSERT INTO structures (objectType, objectId, name, parent) VALUES('user', NULL, %s, %i)", [$param[0], $param[3]]);
                            $myLog->add("user", "create", json_encode([$param[0], $param[1]]));
                        }
                        break;
                    case 153: // Добавление роли
                        if(($myRight->get($param[1]) & 8) != 8) return; // Права на изменение структуры
                        query("DELETE FROM roles WHERE role = %s", [$param[0]]); // Проверка на повторяющиеся значения
                        query("INSERT INTO roles (role) VALUES(%s)", [$param[0]]);
                        query("INSERT INTO structures (objectType, objectId, name, parent) VALUES('role', NULL, %s, %i)", [$param[0], $param[1]]);
                        break;
                    case 154: // Изменение пользователя
                        query("UPDATE registration SET role = %s WHERE login = %s", [$param[1], $param[0]]);
                        $myLog->add("user", "update", json_encode([$param[0], $param[1]]));
                        if($param[2] != "")
                        {
                            $sult = unique_md5();
                            $hash = myhash($param[2], $sult);
                            query("UPDATE password SET hash = %s WHERE login = %s", [$hash, $param[0]]);
                            query("UPDATE signin SET checkkey = '' WHERE login = %s", [$param[0]]);
                        }
                        break;
                    case 155: // Изменение роли
                        query("DELETE FROM roles WHERE role = %s", [$param[1]]); // старое
                        query("INSERT INTO roles (role) VALUES(%s)", [$param[0]]); // новое
                        query("UPDATE registration SET role = %s WHERE role = %s", $param); //Обновить все логины
                        query("UPDATE rights SET login = %s WHERE login = %s AND type = 'role'", $param); //Обновить все права
                        query("UPDATE structures SET name = %s WHERE name = %s AND objectType = 'role'", $param); //Обновить структуру
                        break;
                    case 156: // Удаление пользователя
                        if($param[0] == "admin") break;
                        query("DELETE FROM registration WHERE login = %s", $param);
                        query("DELETE FROM password WHERE login = %s", $param);
                        query("DELETE FROM structures WHERE objectType = 'user' AND name = %s", $param);
                        $myLog->add("user", "remove", json_encode($param));
                        break;
                    case 157: // Удаление роли
                        query("DELETE FROM roles WHERE role = %s", $param);
                        query("DELETE FROM structures WHERE objectType = 'role' AND name = %s", $param);
                        break;
                }
            }
            if($nQuery >= 200 && $nQuery < 250) // Работа с правами 
                switch($nQuery)
                {
                    case 200: // Добавить права
                        if(($myRight->get((int)$param[0]) & 16) != 16) return; // Права на изменение
                        $id = (int)$param[0];
                        $elements = [ $id ];
                        if($param[2] == "true") getRemoveElementbyStructure($elements, $id);
                        for($j = 0, $countElements = count($elements); $j < $countElements; $j++)
                        {
                            $id = $elements[$j];
                            $myRight->remove($id);
                            $rights = json_decode($param[1]);
                            for($i = 0, $c = count($rights); $i < $c; $i++)
                            {
                                $login = $rights[$i]->login;
                                $type = $rights[$i]->type;
                                $_rights = (int)($rights[$i]->rights);
                                $myRight->create($id, $type, $login, $_rights);
                            }
                        }
                        break;
                    case 201: // Запросить права
                        if(($myRight->get((int)$param[0]) & 16) != 16) return; // Права на просмотр
                        $out = [];
                        if($result = query("SELECT type, login, rights FROM rights WHERE objectId = %i", $param))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                $elem = [];
                                $elem["type"] = $row[0];
                                $elem["login"] = $row[1];
                                $elem["rights"] = (int)$row[2];
                                $out[] = $elem;
                            }
                        echo json_encode($out);
                        break;
                    case 202: // Запросить права по логину, связи
                        echo json_encode([$paramL == "admin" ? 255 : $myRight->get( (int)$param[0] ),
                            selectOne("SELECT bindId FROM structures WHERE id = %i", [ (int)$param[0] ]), 
                            selectOne("SELECT class FROM structures WHERE id = %i", [ (int)$param[0] ])]);
                        break;
                }
            if($nQuery >= 250 && $nQuery < 300) // Работа с таблицой 
            {
                $queryWhoNeedClass = [ 250, 251, 252, 255, 257, 258, 259, 260, 261, 266, 267, 269, 270, 275 ]; // набор запросов, которые требуют классов
                $idTable = (int)$param[0];
                if(array_search($nQuery, $queryWhoNeedClass) !== false) 
                {
                    require_once("myTable.php"); // $myTable класс для работы с таблицей
                    $myTable = new MyTable($idTable, $myLog);
                }
                switch($nQuery)
                {
                    case 250: // Запрос таблицы
                        $right = $myRight->get($idTable);
                        if(($right & 1) != 1) return; // Права на просмотр
                        $tableRight = [
                            "change" => ($right & 8) == 8,
                            "cut" => ($right & 2) == 2 && ($right & 8) == 8,
                            "copy" => ($right & 2) == 2
                        ];
                        /* Доступные фильтры*/
                        require_once("myFilter.php");
                        $myFilter = new MyFilter();
                        $allFilters = $myFilter->getAllFilters($idTable);
                        if(array_key_exists(1, $param) && $allFilters["filterStr"] == "" && (int)$param[1] == 1) 
                        {
                            if(selectOne("SELECT count(DISTINCT i) FROM fields WHERE tableId = %i AND type != 'head'", [$idTable]) > 300)
                            {
                                echo json_encode([
                                    "error" => "MORE_300",
                                    "filters" => $allFilters["filters"],
                                    "filter" => $allFilters["filterSelected"]
                                ]);
                                return;
                            }
                        }
                        $myTable->getTable(
                            $tableRight, 
                            $allFilters["filters"], 
                            $allFilters["filterSelected"], 
                            $allFilters["filterStr"],
                            $allFilters["filterColumn"]
                        );
                        /* request("SELECT * FROM fields WHERE tableId = %i", [$idTable]); */
                        break;
                    case 251: // Добавить/Удалить заголовок
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        if(!is_null(selectOne("SELECT bindId FROM structures WHERE id = %i", [ $idTable ]))) return; // Если таблица наследуется
                        $data = json_decode($param[1]);
                        $changes = array_key_exists(2, $param) ? $param[2] : [];
                        $myTable->setAndRemoveHeader($data, $changes);
                        break;
                    case 252: // Изменить значение ячейки в таблице
                        $data = json_decode($param[1]);
                        $idField = (int)$data->id;
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]); // Проверка прав должна идти от ячейки
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        $myTable->setCell($data, true);
                        break;
                    case 253: // Запрос списка колонок
                        if(($myRight->get($idTable) & 1) != 1) return; // Права на просмотр
                        $head = [];
                        if(selectOne("SELECT objectType FROM structures WHERE id = %i", [ $idTable ]) == "table")
                        {
                            if($result = query("SELECT id, value FROM fields WHERE tableId = %i AND type = 'head' ORDER by i", [$idTable]))
                                while ($row = $result->fetch_array(MYSQLI_NUM)) $head[] = $row;
                        }
                        else $head = [[1, "Имя"], [2, "Тип"], [3, "Хэштег"]];
                        echo json_encode($head);
                        break;
                    case 254: // резерв
                        break;
                    case 255: // Добавление элемента из левого меню в таблицу по ссылке
                        $idObject = (int)$param[1];
                        $idField = (int)$param[2];
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        if(($myRight->get($idObject) & 4) != 4) return; // Права на наследование
                        $myTable->setCellByLink($idObject, $idField);
                        break;
                    case 256: // резерв
                        break;
                    case 257: // Добавить строку в таблицу
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        $idPrevRow = (int)$param[1]; // либо id предыдущей строки, либо -1
                        $prevOrNext = (int)$param[2]; // -1 добавить строку выше, 1 добавить строку ниже
                        $myTable->addRow($idPrevRow, $prevOrNext, true);
                        break;
                    case 258: // Удалить строку из таблицы
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        if(selectOne("SELECT class FROM structures WHERE id = %i", [ $idTable ]) == 1) return; // Ограничение для удаления в таблицах созданных конструктором
                        $idRow = (int)$param[1];
                        $myTable->removeRow($idRow);
                        break;
                    case 259: // Копировать ячейку
                        $idCellTo = (int)$param[0];
                        $idCellFrom = (int)$param[1];
                        $operation = $param[2];
                        $typePaste = $param[3];
                        if($idCellTo == $idCellFrom) return; // нельзя скопировать в ту же ячейку
                        if($result = query("SELECT tableId FROM fields WHERE id = %i", [$idCellTo])) $idTableTo = (int)($result->fetch_array(MYSQLI_NUM)[0]);
                        if($result = query("SELECT tableId FROM fields WHERE id = %i", [$idCellFrom])) $idTableFrom = (int)($result->fetch_array(MYSQLI_NUM)[0]);
                        if(($myRight->get($idTableTo) & 8) != 8) return; // Права на изменение
                        if($operation == "copy" && ($myRight->get($idTableFrom) & 4) != 4) return; // Права на наследование
                        if($operation == "cut" && ($myRight->get($idTableFrom) & 8) != 8) return; // Права на изменение
                        $myTable->copyCell($idCellTo, $idTableTo, $idCellFrom, $idTableFrom, $operation, $typePaste, true);
                        break;
                    case 260: // Выставить статус
                        $idField = (int)$param[1];
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        $myTable->setStateForField($idTable, $idField, $param[2]);
                        break;
                    case 261: // Экспорт таблицы в excel с подгрузкой всех данных 
                        if(($myRight->get($idTable) & 1) != 1) return; // Права на просмотр
                        $myTable->export();
                        break;
                    case 262: // Добавление события из левого меню на ячейку
                        $eventId = (int)$param[1];
                        $idField = (int)$param[2];
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        $type = selectOne("SELECT type FROM events WHERE id = %i", [ $eventId ]);
                        if($type != "date") 
                            query("UPDATE fields SET eventId = %i WHERE id = %i OR bindId = %i", [$eventId, $idField, $idField]);
                        else echo json_encode(false);
                        $myLog->add("field", "event", $idField);
                        break;
                    case 263: // Удаление события с ячейки
                        $idField = (int)$param[1];
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        query("UPDATE fields SET eventId = NULL WHERE id = %i OR bindId = %i", [ $idField, $idField ]);
                        $myLog->add("field", "revent", $idField);
                        break;
                    case 264: // Назначить тип столбцу
                        $idField = (int)$param[1]; // id ячейки
                        $idValue = (int)$param[2]; // id из структуры
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        $idTlist = selectOne("SELECT id FROM my_values WHERE id = (SELECT objectId FROM structures WHERE id = %i)", [ $idValue ]); // id из my_values
                        query("UPDATE fields SET dataType = %i WHERE id = %i AND type = 'head' AND tableId = %i", [ $idTlist, $idField, $idTable ]);
                        query("UPDATE fields SET type = 'link', linkId = %i, linkType = 'tlist', value = '' WHERE idColumn = %i AND tableId = %i", [ $idTlist, $idField, $idTable ]);
                        // Выставление типа у всех наследников, чтобы не затирать возможные данные обновления ячеек не происходит
                        query("UPDATE fields SET dataType = %i WHERE bindId = %i AND type = 'head'", [ $idTlist, $idField ]);
                        break;
                    case 265: // Сбросить тип столбца
                        $idField = (int)$param[1];
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        query("UPDATE fields SET dataType = NULL WHERE id = %i AND type = 'head' AND tableId = %i", [ $idField, $idTable ]);
                        query("UPDATE fields SET dataType = NULL WHERE bindId = %i AND type = 'head'", [ $idField ]);
                        break;
                    case 266: // Импорт файла
                        $nameFile = $param[1];
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        $myTable->import("../tmp/$nameFile");
                        break;
                    case 267: // Обновление ячейки по id для импорта
                        $data = json_decode($param[0]);
                        foreach($data as $idTable => $value)
                        {
                            $myTable = new MyTable($idTable, $myLog);
                            if(($myRight->get($idTable) & 8) != 8) continue; // Права на изменение
                            for($i = 0, $c = count($value); $i < $c; $i++) $myTable->setCell($value[$i], true);
                        }
                        break;
                    case 268: // Назначить примитивный тип столбцу
                        $idField = (int)$param[1]; // id ячейки
                        $idValue = $param[2]; // имя из структуры
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        $idType = selectOne("SELECT id FROM my_values WHERE type = %s", [ $idValue ]);
                        query("UPDATE fields SET dataType = %i WHERE id = %i AND type = 'head' AND tableId = %i", [ $idType, $idField, $idTable ]);
                        query("UPDATE fields SET type = 'value', linkId = NULL, linkType = NULL WHERE idColumn = %i AND tableId = %i", [ $idField, $idTable ]);
                        query("UPDATE fields SET dataType = %i WHERE bindId = %i AND type = 'head'", [ $idType, $idField ]);
                        break;
                    case 269: // Поменять местами строку
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        $idRow1 = (int)$param[1]; // id строки которую надо вырезать
                        $idRow2 = (int)$param[2]; // id строки после которой надо вставить
                        $prevOrNext = (int)$param[3]; // -1 добавить строку выше, 1 добавить строку ниже
                        $myTable->cutRow($idRow1, $idRow2, $prevOrNext);
                        break;
                    case 270: // Скопировать строку и вставить после
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        $idRowFrom = (int)$param[1]; // id строки которую надо копировать
                        $idRowTo = (int)$param[2]; // id строки после которой надо вставить
                        $prevOrNext = (int)$param[3]; // -1 добавить строку выше, 1 добавить строку ниже
                        $myTable->copyRow($idRowFrom, $idRowTo, $prevOrNext);
                        break;
                    case 271: // Выставить цвет у ячейки
                        $idField = (int)$param[0]; // id ячейки
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                        if(($myRight->get($idTable) & 8) != 8) continue; // Права на изменение
                        query("UPDATE fields SET color = %s WHERE id = %i", [ $param[1] === "NULL" ? null : $param[1], $idField ]);
                        break;
                    case 272: // Запрос пользовательскй таблицы свойств
                        $idField = (int)$param[0]; // id ячейки
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                        if(($myRight->get($idTable) & 1) != 1) continue; // Права на просмотр
                        $tableProperty = [
                            "userProperty" => selectOne("SELECT user_property FROM fields WHERE id = %i", [ $idField ])
                        ];
                        echo json_encode($tableProperty);
                        break;
                    case 273: // Изменить пользовательскую таблицу свойств
                        $idField = (int)$param[0]; // id ячейки
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                        if(($myRight->get($idTable) & 8) != 8) continue; // Права на изменение
                        query("UPDATE fields SET user_property = %s WHERE id = %i", [ $param[1], $idField ]);
                        break;
                    case 274: // Получить список элементов, которые ссылаются на ячейку
                        $idField = (int)$param[0]; // id ячейки
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                        if(($myRight->get($idTable) & 1) != 1) continue; // Права на просмотр
                        $tableProperty = [
                            "link" => null,
                            "event" => null,
                            "whoRefer" => []
                        ];
                        if($result = query("SELECT id FROM fields WHERE linkType = 'cell' AND linkId = %i", [ $idField ]))
                            while($row = $result->fetch_assoc())
                                $tableProperty["whoRefer"][] = $row["id"];
                        echo json_encode($tableProperty);
                        break;
                }
            }
            if($nQuery >= 300 && $nQuery < 350) // Работа со значениями 
                switch($nQuery)
                {
                    // /,"a12354fasda","a12355fasda","a12356fasda","a12357fasda","a12358fasda","a
                    case 300: // резерв
                        break;
                    case 301: // резерв
                        break;
                    case 302: // резерв
                        break;
                    case 303: // резерв
                        break;
                    case 304: // Загрузить список
                        $idValue = (int)$param[0]; // Добавить проверку наоборот
                        if($result = query("SELECT value, tableId, filterId FROM my_values WHERE id = %i", [ $idValue ]))
                        {
                            $row = $result->fetch_array(MYSQLI_NUM);
                            echo json_encode(getTableListValues((int)$row[1], (int)$row[0], (int)$row[2]));
                        }
                        /* if($result = query("SELECT objectId FROM structures WHERE id = %i", [ $idElement ]))
                        while ($row = $result->fetch_array(MYSQLI_NUM)) $idValue = (int)$row[0]; */
                        break;
                    case 305: // Добавить значение нового типа список из таблицы
                        $idElement = (int)$param[0]; // id из структуры
                        if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
                        $type = $param[1];
                        $value = $param[2];
                        $tableId = $param[3];
                        query("INSERT INTO my_values (type, value, tableId) VALUES(%s, %s, %i)", [ $type, $value, $tableId ]);
                        $idValue = $mysqli->insert_id;
                        query("UPDATE structures SET objectId = %i WHERE id = %i", [$idValue, $idElement]);
                        break;
                    case 306: // Изменить значение нового типа список из таблицы
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
                        $idValue = (int)selectOne("SELECT objectId FROM structures WHERE id = %i", [ $idElement ]);
                        $value = $param[1];
                        query("UPDATE my_values SET value = %s WHERE id = %i", [ $value, $idValue ]);
                        break;
                    case 307: // Загрузить данные для нового типа список из таблицы
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
                        $idValue = (int)selectOne("SELECT objectId FROM structures WHERE id = %i", [ $idElement ]);
                        if($result = query("SELECT id, type, value, tableId FROM my_values WHERE id = %i", [ $idValue ]))
                            echo json_encode($result->fetch_array(MYSQLI_NUM));
                        break;
                }
            if($nQuery >= 350 && $nQuery < 400) // Работа с логом
                switch($nQuery)
                {
                    case 350: // резерв
                        break;
                    case 351: // резерв
                        break; 
                    case 352: // резерв
                        break; 
                    case 353: // Запрос текущего времени
                        request("SELECT NOW()", []);
                        break; 
                    case 354: // Проверка необходимости синхронизации структуры и таблиц
                        $updateStructure = false;
                        $time = $param[0];
                        $tables = [];
                        $NOW = selectOne("SELECT NOW()", []);
                        if($result = query("SELECT id FROM main_log WHERE type = 'structure' AND operation != 'open' AND date >= %s LIMIT 1", [ $time ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) {
                                $updateStructure = true;
                                $time = $NOW;
                            }
                        if(array_key_exists(1, $param))
                        {
                            for($i = 0, $l = count($param[1]); $i < $l; $i++)
                            {
                                $idTable = (int)$param[1][$i]["id"];
                                $idFollowTable = array_key_exists("tableIds", $param[1][$i]) ? $param[1][$i]["tableIds"] : [];
                                $idLogTableOpen = (int)$param[1][$i]["idLogTableOpen"];
                                $update = false;
                                query("UPDATE main_log SET dateUpdate = NOW() WHERE id = %i", [ $idLogTableOpen ]);
                                if($result = query("SELECT date FROM main_log WHERE type = 'table' AND (((operation = 'update' OR operation = 'state') AND login != %s) OR operation = 'script') AND value = %i AND date >= %s LIMIT 1", [ $login, $idTable, $time ]))
                                    while ($row = $result->fetch_array(MYSQLI_NUM)) 
                                    {
                                        $update = true;
                                        $time = $NOW;
                                    }
                                if(!$update)
                                    if($result = query("SELECT DISTINCT value FROM main_log WHERE type = 'table' AND (operation = 'update' OR operation = 'state') AND date >= %s", [ $time ]))
                                        while ($row = $result->fetch_array(MYSQLI_NUM))
                                            if(array_key_exists($row[0], $idFollowTable)) 
                                            {
                                                $update = true; 
                                                $time = $NOW;
                                                break; 
                                            }
                                $logins = [];
                                if($result = query("SELECT login FROM main_log WHERE type = 'table' AND value = %s AND operation = 'open' AND dateUpdate >= DATE_SUB(NOW(), INTERVAL 0.5 MINUTE)", [ $idTable ]))
                                    while ($row = $result->fetch_array(MYSQLI_NUM)) 
                                        $logins[$row[0]] = "";
                            
                                $tables[$idTable] = [ "update" => $update, "logins" => $logins ];
                            }
                        }
                        echo json_encode([ "structure" => $updateStructure, "table" => $tables, "time" => $time ]);
                        break; 
                }
            if($nQuery >= 400 && $nQuery < 410) // Работа с План-графиком
            {
                require_once("myTable.php"); // $myTable класс для работы с таблицей
                $idElement = (int)$param[0];
                switch($nQuery)
                {
                    case 400: // Создание план-графика
                        $idTable = (int)$param[0];
                        if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                        $month = (int)$param[1];
                        $year = (int)$param[2];
                        $monthName = [
                            1 => "январь", 
                            2 => "февраль", 
                            3 => "март", 
                            4 => "апрель", 
                            5 => "май", 
                            6 => "июнь",
                            7 => "июль",
                            8 => "август",
                            9 => "сентябрь",
                            10 => "октябрь",
                            11 => "ноябрь",
                            12 => "декабрь"
                        ];
                        $number = cal_days_in_month(CAL_GREGORIAN, $month, $year);
                        /* // Должен быть update имени
                        $name = selectOne("SELECT name FROM structures WHERE id = %i", [ $idTable ]);
                        query("UPDATE structures SET name = %s WHERE id = %i", [ $name." ($month.$year)", $idTable ]); */
                        $tableProperty = [];
                        $tableProperty[] = [ "name" => "месяц", "value" => $monthName[$month], "type" => "block" ];
                        $tableProperty[] = [ "name" => "год", "value" => $year, "type" => "block" ];
                        query("UPDATE structures SET user_property = %s WHERE id = %i", [ json_encode($tableProperty), $idTable ]);
                        // Создание заголовка
                        $myTable = new MyTable($idTable, $myLog);
                        $data = [];
                        $data[] = (object)["value" => "ФИО", "i" => 0];
                        for($i = 1; $i <= $number; $i++)
                            $data[] = (object)["value" => $i, "i" => $i];
                        $myTable->setAndRemoveHeader($data, []);
                        break;
                    case 401: // резерв
                        break;
                    case 402: // Изменение данных, поддержка интервального изменения одинаковым значением
                        $data = json_decode($param[0]);
                        require_once("myTable.php"); // $myTable класс для работы с таблицей
                        for($i = 0, $c = count($data); $i < $c; $i++)
                        {
                            $idField = (int)$data[$i]->id;
                            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                            $myTable = new MyTable($idTable, $myLog);
                            $myTable->setCell($data[$i], false);
                            if(!is_null($data[$i]->color)) query("UPDATE fields SET color = %s WHERE id = %i", [ $data[$i]->color, $idField ]);
                        }
                        break;
                }
            }
            if($nQuery >= 410 && $nQuery < 450) // Работа с событиями
                switch($nQuery)
                {
                    case 410: // Создание события
                        $idParent = (int)$param[0];
                        if(($myRight->get($idParent) & 8) != 8) return; // Права на изменение
                        $idElement = (int)$param[1];
                        if($param[2] == "date")
                        {
                            $param[4] = getNextDateForEvent($param[3])->format("Y-m-d H:i:s");
                            query("INSERT INTO events (id, type, param, date, code) VALUES(%i, %s, %s, %s, 'end')", [ $idElement, $param[2], $param[3], $param[4] ]);
                        }
                        else query("INSERT INTO events (id, type, param, code) VALUES(%i, %s, %s, 'end')", [ $idElement, $param[2], $param[3] ]);
                        break;
                    case 411: // Загрузить событие
                        if(count($param) == 0) return;
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
                        $out = [];
                        if($result = query("SELECT type, param, date, code, ready FROM events WHERE id = %i", $param))
                            $out = $result->fetch_array(MYSQLI_NUM);
                        $out[] = selectOne("SELECT name FROM structures WHERE id = %i", $param);
                        $out[] = ($myRight->get($idElement) & 8) != 8; // 6 - readonly
                        echo json_encode($out);
                        break;
                    case 412: // Обновить событие
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
                        query("UPDATE events SET code = %s WHERE id = %i", [$param[1], $idElement]);
                        break;
                    case 413: // Выполнить код по id
                        /* require_once("FASM.php"); // класс для работы с событиями
                        $fasm = new FASM();
                        $fasm->start(selectOne("SELECT code FROM events WHERE id = %i", $param)); */
                        break;
                    case 414: // резерв
                        break;
                    case 415: // Завершить событие досрочно
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
                        query("UPDATE events SET ready = 1 WHERE id = %i", [ $idElement ]);
                        break;
                    case 416: // Восстановить событие
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
                        query("UPDATE events SET ready = 0 WHERE id = %i", [ $idElement ]);
                        break;
                }
            if($nQuery >= 450 && $nQuery < 470) // Работа с настройками пользователя
            {
                switch($nQuery)
                {
                    case 450: // Установить уникальное свойство в настройках
                        $value = selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [ $login, $param[0] ]);
                        if(is_null($value)) query("INSERT INTO user_settings (login, id, type, value) VALUES(%s, %i, %s, %s)", [$login, -1, $param[0], $param[1]]);
                        else query("UPDATE user_settings SET value = %s WHERE login = %s AND type = %s", [ $param[1], $login, $param[0] ]);
                        break;
                    case 451: // Запросить значение свойства
                        echo selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [ $login, $param[0] ]);
                        break;
                }
            }
            if($nQuery >= 470 && $nQuery < 480) // Работа с фильтрами
            {
                require_once("myFilter.php");
                $idFilter = (int)$param[0];
                $myFilter = new MyFilter();
                $idFilterStructure = (int)$myFilter->getStructureId($idFilter);
                switch($nQuery)
                {
                    case 470: // Создать фильтр
                        $idParent = (int)$param[0];
                        if(($myRight->get($idParent) & 8) != 8) return; // Права на изменение
                        echo json_encode([ $myFilter->create($param[1], $param[2]) ]);
                        break;
                    case 471: // Обновить фильтр
                        if(($myRight->get($idFilterStructure) & 8) != 8) return; // Права на изменение
                        $myFilter->update($idFilter, $param[1], $param[2]);
                        break;
                    case 472: // Запрос значения фильтра
                        if(($myRight->get($idFilterStructure) & 1) != 1) return; // Права на просмотр
                        $myFilter->get($idFilter);
                        break;
                    case 473:
                        if(($myRight->get($idFilterStructure) & 1) != 1) return; // Права на просмотр
                        echo $myFilter->getFilterStr($idFilter);
                        break;
                    case 474: // Обновить / создать настройки фильтра для таблицы
                        $idTable = (int)$param[1];
                        $q = $myFilter->getUserFilter($login, $idTable);
                        if($q == "") query("INSERT INTO user_settings (login, id, type, value) VALUES(%s, %i, %s, %s)", [$login, $idTable, 'filter', $idFilter]);
                        else query("UPDATE user_settings SET value = %s WHERE login = %s AND id = %i AND type = %s", [$idFilter, $login, $idTable, 'filter']);
                        break;
                }
            }
            if($nQuery >= 480 && $nQuery < 490) // Работа с журналом У него фиксированный id = 5
            {
                $idElement = (int)$param[0];
                switch($nQuery)
                {
                    case 480: // Отображение последних 100 сообщений
                        if(($myRight->get($idElement) & 1) != 1) continue; // Права на просмотр
                        request("SELECT date, login, type, operation, value FROM main_log ORDER by date DESC LIMIT 100", [ ]);
                        break;
                    case 481: // Запрос сообщений по дате
                        if(($myRight->get($idElement) & 1) != 1) continue; // Права на просмотр
                        $beginDate = $param[1];
                        $endDate = $param[2]; 
                        request("SELECT date, login, type, operation, value FROM main_log WHERE date >= %s AND date <= %s ORDER by date", [ $beginDate, $endDate ]);
                        /* echo "SELECT date, login, type, operation, value FROM main_log WHERE date >= %s AND date <= %s ORDER by date\n";
                        echo $beginDate."\n";
                        echo $endDate."\n"; */
                        break;
                }
            }
            if($nQuery >= 490 && $nQuery < 500) // Работа с конструктором классов
            {
                switch($nQuery)
                {
                    case 490: // Создать пустой класс
                        $idParent = (int)$param[0];
                        if(($myRight->get($idParent) & 8) != 8) return; // Права на изменение
                        $idElement = (int)$param[1];
                        query("INSERT INTO classes (id, structure) VALUES(%i, %s)", [ $idElement, "" ]);
                        break;
                    case 491: // Запрос класса
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
                        $out = [];
                        if($result = query("SELECT structure FROM classes WHERE id = %i", $param))
                            $out = $result->fetch_assoc();
                        $out["name"] = selectOne("SELECT name FROM structures WHERE id = %i", $param);
                        $out["readonly"] = ($myRight->get($idElement) & 8) != 8;
                        // Поиск всех таблиц, которые находятся в той же дирректории
                        $idParent = selectOne("SELECT parent FROM structures WHERE id = %i", $param);
                        /* $out["lib"] = [];
                        getElementFromStructureByType($out["lib"], "table", $idParent); */
                        echo json_encode($out);
                        break;
                    case 492: // Обновление структуры класса
                        $idElement = (int)$param[0];
                        if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
                        query("UPDATE classes SET structure = %s WHERE id = %i", [ $param[1], $idElement ]);
                        break;
                    case 493: // Создание структуры на основе класса(должно удалять предыдущую структуру)
                        $parent = (int)$param[3];
                        if(($myRight->get($parent) & 8) != 8) return; // Права на изменение
                        $structure = json_decode($param[0]);
                        $template = json_decode($param[1]);
                        $libraryId = (int)$param[2]; // Таблица с описаниями
                        $bindId = (int)$param[4];
                        $templateMap = [];
                        for($i = 0, $c = count($template); $i < $c; $i++)
                            $templateMap[$template[$i]->templateId] = $template[$i];
                        require_once("myStructures.php");
                        require_once("copyAndRemove.php");
                        require_once("myTable.php");
                        $myStructures = new MyStructures($myRight, $myLog);
                        $tableIdByLevel = [];
                        $lastRowByLevel = [];
                        $myTable = new MyTable(-1, $myLog); // Общий класс для работы с таблицами
                        for($i = 0, $c = count($structure); $i < $c; $i++)
                        {
                            if($i == 0)
                            {
                                $tableIdByLevel[$structure[$i]->level] = $myStructures->create(["folder", NULL, $structure[0]->name, $parent, 0, ""], false);
                                query("UPDATE structures SET bindId = %i, class = 1 WHERE id = %i", [ $bindId, $tableIdByLevel[$structure[$i]->level] ]);
                            }
                            else
                            {
                                if(!array_key_exists($structure[$i]->level, $tableIdByLevel))
                                {
                                    $structures = new CopyAndRemove($structure[$i]->templateId, $tableIdByLevel[$structure[$i]->level - 1], "inherit", $myLog);
                                    $tableIdByLevel[$structure[$i]->level] = $structures->copy($structure[$i]->name, 1);
                                    // Добавить ссылку в родительскую таблицу
                                    if($structure[$i]->level - 1 > 0)
                                    {
                                        $idColumn = $myStructures->getLastColumnByTable($tableIdByLevel[$structure[$i]->level - 1]);
                                        $idRow = $lastRowByLevel[$structure[$i]->level - 1];
                                        $myTable->idTable = $tableIdByLevel[$structure[$i]->level - 1];
                                        $myTable->setCellByLink(
                                            $tableIdByLevel[$structure[$i]->level], 
                                            selectOne("SELECT id FROM fields WHERE idColumn = %i AND i = %i", [(int)$idColumn, (int)$idRow])
                                        );
                                    }
                                }
                                $myTable->idTable = $tableIdByLevel[$structure[$i]->level];
                                $row = $myTable->addRow(-1, -1, false);
                                $lastRowByLevel[$structure[$i]->level] = (int)$row["__ID__"];
                                $templateColumn = $templateMap[$structure[$i]->templateId]->templateColumn;
                                $idRowFromLibrary = (int)selectOne("SELECT i FROM fields WHERE id = %i", [$structure[$i]->fieldId]);
                                unset($tableIdByLevel[$structure[$i]->level + 1]);
                                for($j = 0, $c2 = count($templateColumn); $j < $c2; $j++)
                                {
                                    if(property_exists($templateColumn[$j], "selectId"))
                                    {
                                        $idColumn = selectOne("SELECT id FROM fields WHERE tableId = %i AND bindId = %i", [$myTable->idTable, (int)$templateColumn[$j]->id]);
                                        $idCellTo = selectOne("SELECT id FROM fields WHERE idColumn = %i AND i = %i", [$idColumn, $lastRowByLevel[$structure[$i]->level]]);
                                        $idTableTo = $myTable->idTable;
                                        $idCellFrom = selectOne("SELECT id FROM fields WHERE idColumn = %i AND i = %i", [(int)$templateColumn[$j]->selectId, $idRowFromLibrary]);
                                        $idTableFrom = $libraryId;
                                        $myTable->copyCell($idCellTo, $idTableTo, $idCellFrom, $idTableFrom, "copy", "cell", false);
                                    }
                                }
                            }
                        }
                        break;
                    case 494: // Загрузка структуры по folderId
                        $folderId = (int)$param[0];
                        if(($myRight->get($folderId) & 1) != 1) return; // Права на просмотр
                        break;
                    case 495: // Загрузить колонки таблицы 
                        $idTable = (int)$param[0];
                        if(($myRight->get($idTable) & 1) != 1) return; // Права на просмотр
                        request("SELECT id, value FROM fields WHERE tableId = %i AND type = 'head'", [ $idTable ]);
                        break;
                    case 496: // Загрузить значение типа 
                        $idColumn = (int)$param[0];
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idColumn ]);
                        if(($myRight->get($idTable) & 1) != 1) return; // Права на просмотр
                        if($result = query("SELECT DISTINCT value FROM fields WHERE idColumn = %i AND value != ''", [ $idColumn ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                                $out[] = $row[0];
                        echo json_encode($out);
                        break;
                    case 497: // Загрузить библиотеку
                        $idColumnName = (int)$param[0];
                        $idColumnType = (int)$param[1];
                        $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idColumnName ]);
                        if(($myRight->get($idTable) & 1) != 1) return; // Права на просмотр
                        $out = [];
                        $out[$idColumnName] = [];
                        $out[$idColumnType] = [];
                        $i = 0;
                        if($result = query("SELECT id, value, idColumn FROM fields WHERE (idColumn = %i OR idColumn = %i)", [ $idColumnName, $idColumnType ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                                $out[$row[2]][] = [ "id" => $row[0], "name" => $row[1]];
                        echo json_encode($out);
                        break;
                }
            }
        }
        /* else query("UPDATE signin SET checkkey = '', login = '' WHERE id = %s", [$paramI]); // Если пользователь послал не тот id  */
    }
    $mysqli->close();
    function getObjectFromStructures($row)
    {
        $elem = [];
        $elem["id"] = $row["id"];
        $elem["objectType"] = $row["objectType"];
        $elem["objectId"] = $row["objectId"];
        $elem["name"] = $row["name"];
        $elem["parent"] = $row["parent"];
        $elem["priority"] = $row["priority"];
        $elem["bindId"] = $row["bindId"];

        // Заполнение отображаемых иконок
        $icon = (int)$row["icon"];
        $state = ($icon & 1) == 1;
        $count = ($icon & 2) == 2;
        $elem["state"] = $state ? $row["state"] : NULL;
        $elem["count"] = $count ? selectOne("SELECT COUNT(*) FROM structures WHERE parent = %i", [ $elem["id"] ]) : NULL;
        if($elem["objectType"] == "file")
        {
            $end = strripos($elem["name"], "."); 
            $type = substr($elem["name"], $end + 1);
            switch($type)
            {
                case 'gif':
                case 'jpeg':
                case 'png':
                case 'jpg':
                    $elem["fileType"] = "img";
                    break;
                case 'xls':
                case 'xlsx':
                    $elem["fileType"] = "xls";
                    break;
                case 'doc':
                case 'docx':
                    $elem["fileType"] = "doc";
                    break;
            }
        }
        return $elem;
    }
    function getFullPath(&$out, $parent)
    {
        if($result = query("SELECT name, parent FROM structures WHERE id = %i",[$parent]))
            while ($row = $result->fetch_array(MYSQLI_NUM)) 
            {
                $out[] = ["id" => (int)$parent, "name" => $row[0]];
                if($row[1] != 0) getFullPath($out, $row[1]);
            }
    }
    function searchParent(&$out, $parent, $elem) // Формирование древовидной структуры
    {
        $c = count($out);
        for($i = 0; $i < $c; $i++)
            if($out[$i]["id"] == $parent) { $out[$i]["childrens"][] = $elem; return true;};
        if($i == $c)
            for($i = 0; $i < $c; $i++)
                if(searchParent($out[$i]["childrens"], $parent, $elem)) return true;
        return false;
    }
    function getTableListValues($tableId, $idColumn, $filterId) // Получить список значений из таблицы, только value
    {
        $out = [];
        $filterStr = "";
        if($filterId)
        {
            require_once("myFilter.php");
            $myFilter = new MyFilter();
            $filterStr = $myFilter->getFilterStr(selectOne("SELECT objectId FROM structures WHERE id = %i", [ $filterId ]));
            if($filterStr != "") $filterStr = "AND ($filterStr)";
        }
        if($result = query("SELECT id, value FROM fields WHERE idColumn = %i AND tableId = %i AND type = 'value' AND value != '' $filterStr", [ $idColumn, $tableId ]))
            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                $out[] = [ "id" => $row[0], "value" => $row[1]];
        return $out;
    }
    function getTableListValueByKey($id, $tableId) // Получить значение из списка таблицы
    {
        return selectOne("SELECT value FROM fields WHERE id = %i AND tableId = %i", [ $id, $tableId ]);
    }
    function getRemoveElementbyStructure(&$out, $parent) // По id собирает все элементы для удаления
    {
        if($result = query("SELECT id FROM structures WHERE parent = %i", [$parent]))
            while ($row = $result->fetch_array(MYSQLI_NUM)) 
            {
                $out[] = (int)$row[0];
                getRemoveElementbyStructure($out, (int)$row[0]);
            }
    }
    function getElementFromStructureByType(&$out, $type, $parent) // По типу собирает все id и имена элементов
    {
        if($result = query("SELECT id, name, objectType FROM structures WHERE parent = %i", [$parent]))
            while ($row = $result->fetch_assoc()) 
            {
                if($row["objectType"] == $type) $out[] = $row;
                getElementFromStructureByType($out, $type, (int)$row["id"]);
            }
    }
    $countCycle = 0; // необходимо обнулять для правильной работы
    function getCellLink($linkId, $first)
    {
        global $countCycle;
        if($first) $countCycle = 0;
        if(++$countCycle > 50) return Null; // ограничение на зацикливание
        if($result = query("SELECT value, type, linkId, linkType, id, tableId FROM fields WHERE id = %i", [ (int)$linkId ]))
        {
            $row = $result->fetch_array(MYSQLI_NUM);
            if($row[3] == "cell") return getCellLink($row[2], false);
            else
            {
                $out = ["value" => $row[0], "tableId" => (int)$row[5], "linkType" => null];
                /* if($row[1] == "value") return ["value" => $row[0], "state" => $row[5]]; */
                if($row[1] == "link")
                {
                    if($row[3] == "tlist")
                        if($value = query("SELECT value, type, tableId FROM my_values WHERE id = %i", [ (int)$row[2] ]))
                        {
                            $valueData = $value->fetch_array(MYSQLI_NUM);
                            $out["value"] = getTableListValueByKey((int)$out["value"], (int)$valueData[2]);
                        }
                    if($row[3] == "table")
                    {
                        if($value = query("SELECT name FROM structures WHERE id = %i", [ (int)$row[2] ]))
                            $out["value"] = $value->fetch_array(MYSQLI_NUM)[0];
                        $out["tableId"] = (int)$row[2];
                    }
                    $out["linkType"] = $row[3];
                }
                return $out;
            }
        }
    }
?>