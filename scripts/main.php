<?php
    /* $start = microtime(true); */
    /* , round(microtime(true) - $start, 4) */

    /* error_reporting(0); */
    header('Access-Control-Allow-Origin: *');
    include("config.php");
	include("query.php");
    include("functions.php");
    $excelNumber = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    $countExcelNumber = count($excelNumber);
	$param = null;
	$a = null;
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
            
    $mysqli = new mysqli('localhost', $username, $password, $dbName);
    if (mysqli_connect_errno()) { echo("Не могу создать соединение"); exit(); }
    $mysqli->set_charset("utf8");
    if($nQuery == -1) // Установка
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
    //file_get_contents
    if($nQuery < 40)
        switch($nQuery)
        {
            case 0: // Запрос версии
                /* include("./version/versions.php"); */
                $project = [];	
                $project['main'] = "0.8.65";/* getVersion(		$_main["name"], 		$_main["data"]); */
                $project['php'] = "0.9.65";/* getVersion(		$_php["name"], 			$_php["data"]); */
                echo json_encode($project);
                break;
            case 1: // Возвращает информацию о текущем пользователе
                request("SELECT * FROM signin WHERE id = %s", [$paramI]);
                break;
            case 2: // Фиксирует вход на сайт нового пользователя
                query("INSERT INTO signin VALUES(%s, %s, %s, NOW())", $param);
                break;
            case 3: // Обновление времени нахождения пользователя на сайте
                query("UPDATE signin SET date = NOW() WHERE id = %s", $param);
                break;
            case 4: // вход
                require_once("enter.php");
                addLog("user", "enter", "");
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
        }
    if($nQuery >= 40) // Требуется логин
    {
        $checkKey = "";
        $rights = -1;
        $out_rights = [];
        $login = $paramL;
        $role = "";
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
                switch($nQuery)
                {
                    case 100: // Создать элемент структуры 
                        if((getRights($param[3]) & 8) != 8) return; // Права на изменение
                        query("INSERT INTO structures (objectType, objectId, name, parent, priority, info) VALUES(%s, %i, %s, %i, %i, %s)", $param);
                        $idElement = $mysqli->insert_id;
                        if($login != "admin")
                        {
                            $right = [ $idElement , "user", $login, 255 ];
                            query("INSERT INTO rights (objectId, type, login, rights) VALUES(%s, %i, %s, %s, %i) ", $right);
                            addLog("right", "add", json_encode($right));
                        }
                        echo json_encode(["Index", $idElement]);
                        addLog("structure", "add", $idElement);
                        break;
                    case 110: // Загрузка структуры // Права на просмотр
                        $out = ["folder" => [], "path" => []];
                        $idParent = (int)$param[0];
                        if($login == "admin") $query = "SELECT id, objectType, objectId, name, parent, priority, info, bindId, state FROM structures WHERE parent = %i ORDER by parent, priority";
                        else $query = "SELECT id, objectType, objectId, name, parent, priority, info, bindId, state FROM structures WHERE parent = %i AND
                            id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                                AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0)) ORDER by parent, priority";
                        if($result = query($query, $login == "admin" ? [ $idParent ] : [ $idParent, $login, $role, $login ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                                $out["folder"][] = getObjectFromStructures($row);
                        getFullPath($out["path"], $param[0]);
                        echo json_encode($out);
                        addLog("structure", "open", $idParent);
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
                                request("SELECT parent FROM structures WHERE id = %i", [$idElement]);
                                break;
                            case "value":
                                request("SELECT parent, id FROM structures WHERE objectType = 'value' AND objectId = %i ", [$idElement]);
                                break;
                            case "cell":
                                request("SELECT tableId FROM fields WHERE id = %i ", [$idElement]);
                                break;
                        }
                        break;
                    case 112: // Удаление элемента структуры // Права на изменение
                        require_once("myTable.php"); // $myTable класс для работы с таблицей и структурой
                        $structures = new Structures(null, null, null);
                        $out = [(int)$param[0]];
                        getRemoveElementbyStructure($out, (int)$param[0]);
                        for($i = 0, $c = count($out); $i < $c; $i++)
                        {
                            if((getRights($out[$i]) & 8) != 8) continue; // Права на изменение
                            $structures->remove($out[$i]);
                        }
                        /* echo json_encode($out); */
                        break;
                    case 113: // Загрузка структуры без выпрямления
                        $out = [];
                        if($result = query("SELECT id, objectType, objectId, name, parent, priority, info, state FROM structures ORDER by parent, priority", []))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                $elem = [];
                                $elem["id"] = $row[0];
                                $elem["objectType"] = $row[1];
                                $elem["objectId"] = $row[2];
                                $elem["name"] = $row[3];
                                $elem["state"] = $row[7];
                                $elem["childrens"] = [];
                                if((getRights($row[0]) & 1) == 1)
                                    if($row[4] == 0) $out[] = $elem;
                                    else searchParent($out, $row[4], $elem);
                            }
                        echo json_encode($out);
                        break;
                    case 114: // Копирование элемента
                        $idElement = (int)$param[0]; // id Элемента 
                        $idParent = (int)$param[1]; // id папки в которую копируем
                        
                        $out = [$idElement]; //Проверка на добавление папки саму в себя
                        getRemoveElementbyStructure($out, $idElement);
                        for($i = 0, $c = count($out); $i < $c; $i++) 
                            if($out[$i] == $idParent) { echo "ERROR"; return; }

                        require_once("myTable.php"); // $myTable класс для работы с таблицей и структурой
                        $type = $param[2]; // тип операции
                        if((getRights($idParent) & 8) != 8) continue; // Права на изменение
                        if($type == "copy" || $type == "inherit") // Копирование или Наследование
                        {
                            if($type == "copy" && (getRights($idElement) & 2) != 2) continue; // Права на копирование
                            if($type == "inherit" && (getRights($idElement) & 4) != 4) continue; // Права на наследование
                            
                            $structures = new Structures($idElement, $idParent, $type);
                            $structures->copy();
                        }
                        if($type == "cut") // Вырезать(изменение)
                        {
                            if((getRights($idElement) & 8) != 8) continue; // Права на изменение
                            query("UPDATE structures SET parent = %i WHERE id = %i", [$idParent, $idElement]);
                        }
                            /* case "struct": 
                                if((getRights($idElement) & 2) != 2) continue; // Права на копирование
                                break; // Копировать
                            case "inherit": 
                                if((getRights($idElement) & 4) != 4) continue; // Права на наследование
                                break;  */
                        /* print_r($param); */
                        break;
                    case 115: // Запрос приоритета
                        if((getRights($param[0]) & 1) != 1) continue; // Права на просмотр
                        request("SELECT priority FROM structures WHERE id = %i", $param);
                        break;
                    case 116: // Изменение приоритета
                        if((getRights($param[1]) & 8) != 8) continue; // Права на просмотр
                        query("UPDATE structures SET priority = %i WHERE id = %i", $param);
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
                        if((getRights($idElement) & 8) != 8) return; // Права на изменение
                        if (!file_exists("../files/$idElement")) mkdir("../files/$idElement", 0700);
                        rename("../tmp/$file", "../files/$idElement/$file"); 
                        break;
                    case 120: // Изменение имени объекта
                        $idElement = (int)$param[0];
                        if((getRights($idElement) & 8) != 8) return; // Права на изменение
                        query("UPDATE structures SET name = %s WHERE id = %i", [ $param[1], $idElement ]);
                        addLog(selectOne("SELECT objectType FROM structures WHERE id = %i", [ $idElement ]), "update", $idElement);
                        break;
                    case 121: // Запрос файла с правами
                        $idElement = (int)$param;
                        if((getRights($idElement) & 8) != 8) return; // Права на изменение
                        $name = "";
                        if($result = query("SELECT name FROM structures WHERE id = %i", [ $idElement ])) 
                            $name = $result->fetch_array(MYSQLI_NUM)[0];
                        $filePathForDownload = "../files/$idElement/$name";
                        require_once("getFile.php");
                        addLog("file", "download", $idElement);
                        break;
                    case 122: // запрос информации об элементе структуры
                        $idElement = (int)$param[0];
                        if((getRights($idElement) & 1) != 1) return; // Права на просмотр
                        request("SELECT info FROM structures WHERE id = %i", [ $idElement ]);
                        break;
                    case 123: // выставление информации в структуре
                        $idElement = (int)$param[0];
                        if((getRights($idElement) & 8) != 8) return; // Права на изменение
                        query("UPDATE structures SET info = %s WHERE id = %i", [ $param[1], $idElement ]);
                        break;
                    case 124: // Поиск в структуре элементов
                        $out = ["folder" => []];
                        $search = $param[0];
                        $type = $param[1];
                        if($login == "admin") $query = "SELECT id, objectType, objectId, name, parent, priority, info, bindId, state FROM structures WHERE name LIKE %s AND objectType LIKE %s ORDER by parent, priority";
                        else $query = "SELECT id, objectType, objectId, name, parent, priority, info, bindId, state FROM structures WHERE name LIKE %s AND objectType LIKE %s AND
                            id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                                AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0)) ORDER by parent, priority";
                        if($result = query($query, $login == "admin" ? [ $search, $type ] : [ $search, $type, $login, $role, $login ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                                $out["folder"][] = getObjectFromStructures($row);
                        echo json_encode($out);
                        break;
                    case 125: // Получить список объектов которые ссылаются и на которые ссылается запрошенный объект
                        $idElement = (int)$param[0];
                        if((getRights($idElement) & 1) != 1) return; // Права на просмотр
                        $fromInherit = [];
                        $whoInherit = [];
                        $whoRefes = [];
                        if($result = query("SELECT id, objectType, name FROM structures WHERE id IN (SELECT bindId FROM structures WHERE id = %i)", [ $idElement ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) $fromInherit[] = $row;
                        if($result = query("SELECT id, objectType, name FROM structures WHERE bindId = %i", [ $idElement ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) $whoInherit[] = $row;

                        $linkType = selectOne("SELECT objectType FROM structures WHERE id = %i", [ $idElement ]);
                        $linkId = $idElement;
                        if($linkType == "value") $linkId = (int)selectOne("SELECT objectId FROM structures WHERE id = %i", [ $idElement ]);
                        if($result = query("SELECT id, tableId FROM fields WHERE type = 'link' AND linkId = %i AND linkType = %s", [ $linkId, $linkType ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                $tableId = (int)$row[1];
                                if(!array_key_exists($tableId, $whoRefes))
                                    $whoRefes[$tableId] = ["fields" => [], "name" => selectOne("SELECT name FROM structures WHERE id = %i", [ $tableId ])];
                                $whoRefes[$tableId]["fields"][] = (int)$row[0];
                            }
                        echo json_encode(["fromInherit" => $fromInherit, "whoInherit" => $whoInherit, "whoRefes" => $whoRefes]);
                        break;
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
                        if((getRights($param[3]) & 8) != 8) return; // Права на изменение структуры
                        if(require_once("registration.php"))
                        {
                            query("INSERT INTO structures (objectType, objectId, name, parent) VALUES('user', NULL, %s, %i)", [$param[0], $param[3]]);
                            addLog("user", "add", json_encode([$param[0], $param[1]]));
                        }
                        break;
                    case 153: // Добавление роли
                        if((getRights($param[1]) & 8) != 8) return; // Права на изменение структуры
                        query("DELETE FROM roles WHERE role = %s", [$param[0]]); // Проверка на повторяющиеся значения
                        query("INSERT INTO roles (role) VALUES(%s)", [$param[0]]);
                        query("INSERT INTO structures (objectType, objectId, name, parent) VALUES('role', NULL, %s, %i)", [$param[0], $param[1]]);
                        break;
                    case 154: // Изменение пользователя
                        query("UPDATE registration SET role = %s WHERE login = %s", [$param[1], $param[0]]);
                        addLog("user", "update", json_encode([$param[0], $param[1]]));
                        if($param[2] != "")
                        {
                            $sult = unique_md5();
                            $hash = myhash($param[2], $sult);
                            query("UPDATE password SET hash = %s WHERE login = %s", [$hash, $param[0]]);
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
                        addLog("user", "remove", json_encode($param));
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
                        if((getRights((int)$param[0]) & 8) != 8) return; // Права на изменение
                        $id = (int)$param[0];
                        $rights = json_decode($param[1]);
                        $c = count($rights);
                        query("DELETE FROM rights WHERE objectId = %i", [ $id ]);
                        for($i = 0; $i < $c; $i++)
                        {
                            $login = $rights[$i]->login;
                            $type = $rights[$i]->type;
                            $_rights = (int)($rights[$i]->rights);
                            $_param = [ $id, $type, $login, $_rights ];
                            query("INSERT INTO rights (objectId, type, login, rights) VALUES(%i, %s, %s, %i) ", $_param);
                            addLog("right", "add", json_encode($_param));
                        }
                        break;
                    case 201: // Запросить права
                        if((getRights((int)$param[0]) & 1) != 1) return; // Права на просмотр

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
                    case 202: // Запросить права по логину
                        echo json_encode([$paramL == "admin" ? 255 : getRights( $param[0] )]);
                        break;
                }
            if($nQuery >= 250 && $nQuery < 300) // Работа с таблицой 
            {
                require_once("myTable.php"); // $myTable класс для работы с таблицей
                $idTable = (int)$param[0];
                $myTable = new MyTable($idTable);
                switch($nQuery)
                {
                    case 250: // Запрос таблицы
                        if((getRights($idTable) & 1) != 1) return; // Права на просмотр
                        $myTable->getTable();
                        /* request("SELECT * FROM fields WHERE tableId = %i", [$idTable]); */
                        break;
                    case 251: // Добавить/Удалить заголовок
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        if($result = query("SELECT bindId FROM structures WHERE id = %i", [ $idTable ]))
                            if(!is_null($result->fetch_array(MYSQLI_NUM)[0])) return;
                        $data = json_decode($param[1]);
                        $changes = $param[2];
                        $myTable->setAndRemoveHeader($data, $changes);
                        break;
                    case 252: // Изменить ячейки в таблице
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        $data = json_decode($param[1]);
                        $myTable->setCell($data);
                        break;
                    case 253: // резерв
                        break;
                    case 254: // резерв
                        break;
                    case 255: // Добавление элемента из левого меню в таблицу по ссылке
                        $idObject = (int)$param[1];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        if((getRights($idObject) & 4) != 4) return; // Права на наследование
                        $idFields = (int)$param[2];
                        $myTable->setCellByLink($idObject, $idFields);
                        break;
                    case 256: // Добавление элемента из левого меню в таблицу по значению
                        $idObject = (int)$param[1];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        if((getRights($idObject) & 1) != 1) return; // Права на просмотр
                        $idFields = (int)$param[2];
                        $key = (int)$param[4];
                        $myTable->setCellByValue($idObject, $idFields, $key);
                        break;
                    case 257: // Добавить строку в таблицу
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        $idPrevRow = (int)$param[1]; // id предыдущей строки
                        $idNextRow = (int)$param[2]; // id следующей строки
                        $myTable->addRow($idPrevRow, $idNextRow, true);
                        break;
                    case 258: // Удалить строку из таблицы
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
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
                        if((getRights($idTableTo) & 8) != 8) return; // Права на изменение
                        if($operation == "copy" && (getRights($idTableFrom) & 4) != 4) return; // Права на наследование
                        if($operation == "cut" && (getRights($idTableFrom) & 8) != 8) return; // Права на изменение
                        $myTable->copyCell($idCellTo, $idTableTo, $idCellFrom, $idTableFrom, $operation, $typePaste, true);
                        break;
                    case 260: // Выставить статус
                        $idField = (int)$param[1];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        $myTable->setStateForField($idTable, $idField, $param[2]);
                        break;
                    case 261: // Экспорт таблицы в excel с подгрузкой всех данных 
                        $myTable->export();
                        break;
                }
            }
            if($nQuery >= 300 && $nQuery < 350) // Работа со значениями 
                switch($nQuery)
                {
                    // /,"a12354fasda","a12355fasda","a12356fasda","a12357fasda","a12358fasda","a
                    case 300: // Добавить значение
                        $idElement = (int)$param[0]; // id из структуры
                        if((getRights($idElement) & 8) != 8) return; // Права на изменение
                        $type = $param[1];
                        $value = $param[2];
                        query("INSERT INTO my_values (type, value) VALUES(%s, %s)", [ $type, $type == "array" ? "" : $value ]);
                        $idValue = $mysqli->insert_id;
                        if($type == "array")
                        {
                            $c = count($value);
                            for($i = 0; $i < $c; $i++)
                                query("INSERT INTO my_list (value_id, my_key, value) VALUES(%i, %s, %s)", [ $idValue, $i, $value[$i] ]);
                        }
                        query("UPDATE structures SET objectId = %i WHERE id = %i", [$idValue, $idElement]);
                        /* request("SELECT * FROM fields WHERE tableId = %i", [$idTable]); */
                        break;
                    case 301: // Изменить значение 
                        $idElement = (int)$param[0];
                        if((getRights($idElement) & 8) != 8) return; // Права на изменение
                        $idValue = (int)query("SELECT objectId FROM structures WHERE id = %i", [ $idElement ])->fetch_array(MYSQLI_NUM)[0];
                        $type = $param[1];
                        $value = $param[2];
                        query("UPDATE my_values SET value = %s WHERE id = %i", [$type == "array" ? "" : $value, $idValue]);
                        if($type == "array")
                        {
                            query("DELETE FROM my_list WHERE value_id = %i", [ $idValue ]);
                            $c = count($value);
                            for($i = 0; $i < $c; $i++)
                                query("INSERT INTO my_list (value_id, my_key, value) VALUES(%i, %s, %s)", [ $idValue, $i, $value[$i] ]);
                        }
                        break;
                    case 302: // резерв
                        break;
                    case 303: // Загрузить значение
                        $idElement = (int)$param[0];
                        if((getRights($idElement) & 1) != 1) return; // Права на просмотр
                        $idValue = -1;
                        if($result = query("SELECT objectId FROM structures WHERE id = %i", [ $idElement ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) $idValue = (int)$row[0];
                        if($result = query("SELECT id, type, value FROM my_values WHERE id = %i", [ $idValue ]))
                        {
                            $row = $result->fetch_array(MYSQLI_NUM);
                            $type = $row[1];
                            $value = $row[2];
                            if($type == "array") $value = getListValues($idValue);
                            echo json_encode([$row[0], $type, $value]);
                        }
                        break;
                    case 304: // Загрузить список
                        $idValue = (int)$param[0]; // Добавить проверку наоборот
                        /* if($result = query("SELECT objectId FROM structures WHERE id = %i", [ $idElement ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) $idValue = (int)$row[0]; */
                        echo json_encode(getListValues($idValue));
                        break;
                }
            if($nQuery >= 350 && $nQuery < 400) // Работа с логом
                switch($nQuery)
                {
                    case 350: // Резерв
                        break;
                    case 351: // Проверка необходимости синхронизации
                        $idTable = (int)$param[0];
                        $idFollowTable = array_key_exists(2, $param) ? $param[2] : [];
                        $update = false;
                        query("UPDATE main_log SET dateUpdate = NOW() WHERE type = 'table' AND operation = 'open' AND login = %s AND value = %i AND date = %s", [$login, $idTable, $param[1]]);
                        if($result = query("SELECT date FROM main_log WHERE type = 'table' AND (operation = 'update' OR operation = 'updateState') AND login != %s AND value = %i AND date >= %s LIMIT 1", [ $login, $idTable, $param[1] ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) $update = true;
                        if(!$update)
                            if($result = query("SELECT DISTINCT value FROM main_log WHERE type = 'table' AND (operation = 'update' OR operation = 'updateState') AND date >= %s", [ $param[1] ]))
                                while ($row = $result->fetch_array(MYSQLI_NUM))
                                    if(array_key_exists($row[0], $idFollowTable)) { $update = true; break; }
                        echo json_encode([$update]);
                        break; 
                    case 352: // Получить список пользователей работающих с таблицей
                        $idTable = (int)$param[0];
                        $logins = [];
                        if($result = query("SELECT login FROM main_log WHERE type = 'table' AND value = %s AND dateUpdate >= DATE_SUB(NOW(), INTERVAL 2 MINUTE)", [ $idTable ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                                $logins[$row[0]] = "";
                        echo json_encode($logins);
                        break; 
                    case 353: // Запрос текущего времени
                        request("SELECT NOW()", []);
                        break; 
                    case 354: // Проверка необходимости синхронизации структуры
                        $update = false;
                        $time = $param[0];
                        if($result = query("SELECT NOW() FROM main_log WHERE type = 'structure' AND operation != 'open' AND date >= %s LIMIT 1", [ $time ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                $update = true;
                                $time = $row[0];
                            }
                        echo json_encode([$update, $time]);
                        break; 
                }
            if($nQuery >= 400 && $nQuery < 450) // Работа с задачами
                switch($nQuery)
                {
                    case 400: // Запрос списка пользователей с именами
                        // Получаем список логинов
                        $logins = [];
                        $fields = [];
                        if($result = query("SELECT login FROM registration", []))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                                $logins[$row[0]] = ["name" => "", "familiya" => "", "patronymic" => ""];
                        if($result = query("SELECT i, name_column, value FROM fields WHERE tableId = 4 AND type != 'head'", []))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                if(!array_key_exists($row[0], $fields)) $fields[$row[0]] = [];
                                $fields[$row[0]][$row[1]] = $row[2];
                            }
                        foreach($fields as $field)
                        {
                            $login = $field["Логин"];
                            if($login != "")
                            {
                                $logins[$login]["name"] = $field["Имя"];
                                $logins[$login]["familiya"] = $field["Фамилия"];
                                $logins[$login]["patronymic"] = $field["Отчество"];
                            }
                        }
                        echo json_encode($logins);
                        break;
                }
        }
        /* else query("UPDATE signin SET checkkey = '', login = '' WHERE id = %s", [$paramI]); // Если пользователь послал не тот id  */
    }
    $mysqli->close();
    function getObjectFromStructures($row)
    {
        $elem = [];
        $elem["id"] = $row[0];
        $elem["objectType"] = $row[1];
        $elem["objectId"] = $row[2];
        $elem["name"] = $row[3];
        $elem["parent"] = $row[4];
        $elem["priority"] = $row[5];
        $elem["bindId"] = $row[7];
        $elem["state"] = $row[8];
        if($row[1] == "file")
        {
            $end = strripos($row[3], "."); 
            $type = substr($row[3], $end + 1);
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
    function request($_query, $param) // Отправка запроса и получение от вета в формате JSON
    {
        global $mysqli;
        $Result = [];
        if($result = query($_query, $param))
        {
            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                $Result[] = $row;
            echo json_encode($Result);
        }
        else if ($result == 0) echo json_encode(["Index", $mysqli->insert_id]);
        else echo json_encode(["Error", $mysqli->error]);
    }
    function selectOne($_query, $param) // Запрос одного значения
    {
        return query($_query, $param)->fetch_array(MYSQLI_NUM)[0];
    }
    function getRights($objectId)
    {
        global $login, $role;
        if($login == "admin") return 255;
        $rights = 0;
        $use_login = false;
        if($result = query("SELECT type, rights FROM rights WHERE objectId = %i AND (login = %s OR login = %s)", [$objectId, $login, $role]))
            while ($row = $result->fetch_array(MYSQLI_NUM)) 
            {
                if(!$use_login) $rights = (int)$row[1];
                if($row[0] == "user") $use_login = true;
            }
        return $rights;
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
    function getListValues($id) // Получить список значений
    {
        $out = [];
        if($result = query("SELECT my_key, value FROM my_list WHERE value_id = %i", [ $id ]))
            while ($row = $result->fetch_array(MYSQLI_NUM)) $out[$row[0]] = $row[1];
        return $out;
    }
    function getListValueByKey($id, $key) // Получить значение из списка
    {
        if($result = query("SELECT value FROM my_list WHERE value_id = %i AND my_key = %s", [ $id, $key ]))
        {
            $row = $result->fetch_array(MYSQLI_NUM);
            return $row[0];
        }
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
    $countCycle = 0; // необходимо обнулять для правильной работы
    function getCellLink($linkId, $first)
    {
        if($first) $countCycle = 0;
        global $countCycle;
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
                    if($row[3] == "value")
                        if($value = query("SELECT value, type FROM my_values WHERE id = %i", [ (int)$row[2] ]))
                        {
                            $valueData = $value->fetch_array(MYSQLI_NUM);
                            if($valueData[1] == "array") $out["value"] = getListValueByKey((int)$row[2], (int)$row[0]);
                            else $out["value"] = $valueData[0];
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
    function addLog($type, $operation, $value)
    {
        global $login;
        query("INSERT INTO main_log (type, operation, value, date, dateUpdate, login) VALUES(%s, %s, %s, NOW(), NOW(), %s)", [ $type, $operation, $value, $login ]);
    }
?>