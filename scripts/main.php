<?php
    /* $start = microtime(true); */
    /* , round(microtime(true) - $start, 4) */
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
                        if($login == "admin") $query = "SELECT id, objectType, objectId, name, parent, priority, info FROM structures WHERE parent = %i ORDER by parent, priority";
                        else $query = "SELECT id, objectType, objectId, name, parent, priority, info FROM structures WHERE parent = %i AND
                            id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                                AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0)) ORDER by parent, priority";
                        if($result = query($query, $login == "admin" ? [ $idParent ] : [ $idParent, $login, $role, $login ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                $elem = [];
                                $elem["id"] = $row[0];
                                $elem["objectType"] = $row[1];
                                $elem["objectId"] = $row[2];
                                $elem["name"] = $row[3];
                                $elem["parent"] = $row[4];
                                $elem["priority"] = $row[5];
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
                                $out["folder"][] = $elem;
                            }
                        /* if($param[0] == 2) getUsersOrRoles($out["folder"], "users");
                        if($param[0] == 3) getUsersOrRoles($out["folder"], "roles"); */
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
                        /* getRemoveElementbyStructure($out, $param[0]); */
                        $out = [(int)$param[0]];
                        getRemoveElementbyStructure($out, (int)$param[0]);
                        $c = count($out);
                        for($i = 0; $i < $c; $i++)
                        {
                            if((getRights($out[$i]) & 8) != 8) continue; // Права на изменение
                            query("DELETE FROM structures WHERE id = %i", [ $out[$i] ]);
                            query("DELETE FROM rights WHERE objectId = %i", [ $out[$i] ]);
                            addLog("structure", "remove", $out[$i]);
                        }
                        echo json_encode($out);
                        break;
                    case 113: // Загрузка структуры без выпрямления
                        $out = [];
                        if($result = query("SELECT id, objectType, objectId, name, parent, priority, info FROM structures ORDER by parent, priority", []))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                $elem = [];
                                $elem["id"] = $row[0];
                                $elem["objectType"] = $row[1];
                                $elem["objectId"] = $row[2];
                                $elem["name"] = $row[3];
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
                        $type = $param[2]; // тип операции
                        if((getRights($idParent) & 8) != 8) continue; // Права на изменение
                        switch($type)
                        {
                            case "copy": 
                                if((getRights($idElement) & 2) != 2) continue; // Права на копирование
                                $elem = [];
                                if($result = query("SELECT objectType, objectId, name, parent, priority, info FROM structures WHERE id = %i", [$idElement]))
                                    $elem = $result->fetch_array(MYSQLI_NUM);
                                $elem[3] = $idParent;// parent
                                query("INSERT INTO structures (objectType, objectId, name, parent, priority, info) VALUES(%s, %i, %s, %i, %i, %s)", $elem);
                                $idNewElement = $mysqli->insert_id;
                                if($login != "admin")
                                    query("INSERT INTO rights (objectId, type, login, rights) VALUES(%s, %i, %s, %s, %i) ", [ $idNewElement, "user", $login, 255 ]);
                                switch($elem[0])
                                {
                                    case "value":
                                        $value = [];
                                        if($result = query("SELECT type, value FROM my_values WHERE id = %i", [ (int)$elem[1] ]))
                                            $value = $result->fetch_array(MYSQLI_NUM);
                                        query("INSERT INTO my_values (type, value) VALUES(%s, %s)", [ $value[0], $value[1] ]);
                                        $idValue = $mysqli->insert_id;
                                        query("UPDATE structures SET objectId = %i WHERE id = %i", [$idValue, $idNewElement]);
                                        break;
                                    case "file":
                                        if (!file_exists("../files/$idNewElement")) mkdir("../files/$idNewElement", 0700);
                                        copy("../files/$idElement/".$elem[2], "../files/$idNewElement/".$elem[2]);
                                        break;
                                }
                                break; // Копировать
                            case "cut": 
                                if((getRights($idElement) & 8) != 8) continue; // Права на изменение
                                query("UPDATE structures SET parent = %i WHERE id = %i", [$idParent, $idElement]);
                                break; // Вырезать(изменение)
                            case "struct": 
                                if((getRights($idElement) & 2) != 2) continue; // Права на копирование
                                break; // Копировать
                            case "inherit": 
                                if((getRights($idElement) & 4) != 4) continue; // Права на наследование
                                break; // Наследование
                        }
                        print_r($param);
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
                    case 120: // Удаление файла
                        $idElement = (int)$param[0];
                        if((getRights($idElement) & 8) != 8) return; // Права на изменение
                        unlink("../files/$idElement/".scandir("../files/$idElement")[2]); 
                        rmdir("../files/$idElement"); 
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
                        if((getRights($idElement) & 1) != 1) return; // Права на изменение
                        request("SELECT info FROM structures WHERE id = %i", [ $idElement ]);
                        break;
                    case 123: // выставление информации в структуре
                        $idElement = (int)$param[0];
                        if((getRights($idElement) & 8) != 8) return; // Права на изменение
                        query("UPDATE structures SET info = %s WHERE id = %i", [ $param[1], $idElement ]);
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
                switch($nQuery)
                {
                    case 250: // Запрос таблицы
                        $idTable = (int)$param[0];
                        if((getRights($idTable) & 1) != 1) return; // Права на просмотр
                        $nameTable = "";
                        $timeOpen = "";
                        $head = [];
                        $data = [];
                        if($result = query("SELECT name, NOW() FROM structures WHERE id = %i", [$idTable]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) { $nameTable = $row[0]; $timeOpen = $row[1]; }
                        if($result = query("SELECT i, name_column FROM fields WHERE tableId = %i AND type = 'head' ORDER by i", [$idTable]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                                $head[] = $row;
                        if($result = query("SELECT i, name_column, value, type, linkId, linkType, fields.id, state, next FROM fields LEFT JOIN line_ids ON line_ids.id = fields.i WHERE tableId = %i AND type != 'head'", [$idTable]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                $field = [ "id" => (int)$row[6], "value" => $row[2], "state" => $row[7] ];
                                if($row[3] == "link")
                                {
                                    $field["linkId"] = (int)$row[4];
                                    switch($row[5])
                                    {
                                        case "value":
                                            if($value = query("SELECT value, type FROM my_values WHERE id = %i", [ $field["linkId"] ]))
                                            {
                                                $field["type"] = "value";
                                                $valueData = $value->fetch_array(MYSQLI_NUM);
                                                if($valueData[1] == "array") $field["listValue"] = getListValueByKey($field["linkId"], $field["value"]);
                                                else $field["value"] = $valueData[0];
                                            }
                                            break;
                                        case "file":
                                        case "table":
                                            $field["type"] = $row[5];
                                            if($value = query("SELECT name FROM structures WHERE id = %i", [ $field["linkId"] ]))
                                                $field["value"] = $value->fetch_array(MYSQLI_NUM)[0];
                                            if($row[5] == "table") 
                                            {
                                                $field["state"] = getStatusForTable($field["linkId"], true);
                                                $field["tableId"] = $field["linkId"];
                                            }
                                            break;
                                        case "cell":
                                            $value = getCellLink($field["linkId"], true);
                                            $field["type"] = "cell";
                                            $field["value"] = $value["value"];
                                            $field["state"] = $value["state"];
                                            $field["tableId"] = $value["tableId"];
                                            break;
                                    }
                                }
                                $data[(int)$row[0]][$row[1]] = $field;
                                $data[(int)$row[0]]["__NEXT__"] = $row[8];
                            }
                        echo json_encode(["head" => $head, "data" => $data, "name" => $nameTable, "change" => (getRights($idTable) & 8) == 8, "time" => $timeOpen]);
                        addLog("table", "open", $idTable);
                        /* request("SELECT * FROM fields WHERE tableId = %i", [$idTable]); */
                        break;
                    case 251: // Добавить/Удалить заголовок
                        $idTable = (int)$param[0];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        $data = json_decode($param[1]);
                        $changes = $param[2];
                        $head = [];
                        if($result = query("SELECT name_column FROM fields WHERE tableId = %i AND type = 'head'", [$idTable]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) $head[$row[0]] = "";
                        for($i = 0, $c = count($data); $i < $c; $i++)
                        {
                            $name_column = $data[$i]->value;
                            if(isset($data[$i]->oldValue)) // Изменить имя поле у всех ячеек
                                query("UPDATE fields SET name_column = %s WHERE name_column = %s AND tableId = %i", [ $name_column, $data[$i]->oldValue, $idTable ]);
                            if(!array_key_exists($name_column, $head)) // Если это новый столбец, то создать по всем строкам
                            {
                                if($result = query("SELECT DISTINCT i FROM fields WHERE tableId = %i AND type = 'value'", [ $idTable ]))
                                    while($row = $result->fetch_array(MYSQLI_NUM))
                                        query("INSERT INTO fields (tableId, i, name_column, type, value) VALUES(%i, %i, %s, %s, %s) ", [ $idTable, $row[0], $name_column, "value", "" ]);
                                query("INSERT INTO fields (tableId, i, name_column, type) VALUES(%i, %i, %s, %s) ", [ $idTable, $data[$i]->i, $name_column, "head" ]);
                            }
                            query("UPDATE fields SET i = %i WHERE name_column = %s AND tableId = %i AND type = 'head'", [ $i, $name_column, $idTable ]);
                        }
                        for($i = 0, $c = count($changes); $i < $c; $i++) // удаление ячеек и заголовка
                            query("DELETE FROM fields WHERE tableId = %i AND name_column = %s", [ $idTable, $param[2][$i] ]);
                        addLog("table", "update", $idTable);
                        break;
                    case 252: // Изменить ячейки в таблице
                        $idTable = (int)$param[0];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        $data = json_decode($param[1]);
                        $value = $data->value;
                        $idField = $data->id;

                        $typeField = is_object($value) ? "link" : "value";
                        if($typeField == "value")
                            query("UPDATE fields SET value = %s, linkId = NULL, linkType = NULL, type = 'value', state = 0 WHERE tableId = %i AND id = %i", [ 
                                $value, 
                                $idTable, // для подстраховки
                                $idField
                            ]);
                        if($typeField == "link")
                            query("UPDATE fields SET value = %s, linkId = %i, linkType = %s, type = 'link' WHERE tableId = %i AND id = %i", [ 
                                $value->value, 
                                $value->linkId, 
                                $value->type, 
                                $idTable, // для подстраховки
                                $idField
                            ]);

                        echo json_encode([ "id" => $idField, "value" => $value ]);
                        addLog("table", "update", $idTable);
                        break;
                    case 253: // Изменить имя таблицы
                        $idTable = (int)$param[0];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        query("UPDATE structures SET name = %s WHERE id = %i", [ $param[1], $param[0] ]);
                        addLog("table", "update", $idTable);
                        break;
                    case 254: // Удаление таблицы
                        $idTable = (int)$param[0];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        query("DELETE FROM fields WHERE tableId = %i", [ $idTable ]);
                        addLog("table", "remove", $idTable);
                        break;
                    case 255: // Добавление элемента из левого меню в таблицу по ссылке
                        $idTable = (int)$param[0];
                        $idObject = (int)$param[1];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        if((getRights($idObject) & 4) != 4) return; // Права на наследование
                        if($result = query("SELECT name, objectType, objectId FROM structures WHERE id = %i", [ $idObject ]))
                        {
                            $row = $result->fetch_array(MYSQLI_NUM);
                            $idFields = (int)$param[2];
                            $linkType = $row[1];
                            $fieldList = null;
                            $fieldState = 0;
                            if($linkType == "value" && $value = query("SELECT id, value, type FROM my_values WHERE id = %i", [ (int)$row[2] ]))
                            {
                                $valueData = $value->fetch_array(MYSQLI_NUM);
                                $fieldValue = $valueData[2] == "array" ? 0 : $valueData[1];
                                if($valueData[2] == "array") $fieldList = getListValueByKey((int)$row[2], $fieldValue);
                            }
                            else 
                            {
                                $fieldValue = $row[0];
                                if($linkType == "table")
                                    $fieldState = getStatusForTable($idObject, true);
                            }
                            $linkId = $linkType != "value" ? $idObject : (int)$valueData[0];
                            
                            query("UPDATE fields SET value = %s, linkId = %i, linkType = %s, type = 'link' WHERE tableId = %i AND id = %i", [ 0, $linkId, $linkType, $idTable, $idFields ]);
                            echo json_encode([ "id" => $idFields, "linkId" => $linkId, "type" => $linkType, "value" => $fieldValue, "state" => $fieldState, "listValue" => $fieldList ]);
                        }
                        addLog("table", "update", $idTable);
                        break;
                    case 256: // Добавление элемента из левого меню в таблицу по значению
                        $idTable = (int)$param[0];
                        $idObject = (int)$param[1];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        if((getRights($idObject) & 1) != 1) return; // Права на просмотр
                        if($result = query("SELECT objectType, objectId FROM structures WHERE id = %i", [ $idObject ]))
                        {
                            $row = $result->fetch_array(MYSQLI_NUM);
                            $idFields = (int)$param[2];
                            switch($row[0])
                            {
                                case "value":
                                    if($value = query("SELECT value, type FROM my_values WHERE id = %i", [ (int)$row[1] ]))
                                    {
                                        $valueData = $value->fetch_array(MYSQLI_NUM);
                                        if($valueData[1] == "array") $fieldValue = getListValueByKey((int)$row[1], (int)$param[4]);
                                        else $fieldValue = $valueData[0];
                                        query("UPDATE fields SET value = %s, type = 'value', linkId = NULL, linkType = NULL WHERE tableId = %i AND id = %i", [ $fieldValue, $idTable, $idFields]);
                                        echo json_encode([ "id" => $idFields, "value" => $fieldValue ]);
                                    }
                                    break;
                            }
                        }
                        addLog("table", "update", $idTable);
                        break;
                    case 257: // Добавить строку в таблицу
                        $idTable = (int)$param[0];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        $idPrevRow = (int)$param[1]; // id предыдущей строки
                        $oldNext = "NULL";
                        
                        if($idPrevRow != -1) query("INSERT INTO line_ids(next) SELECT next FROM line_ids WHERE id = %i", [$idPrevRow]);
                        else query("INSERT INTO line_ids (next) VALUES(NULL)", []);
                        
                        $idRow = $mysqli->insert_id;
                        $out = ["__ID__" => $idRow];
                        if($idPrevRow != -1) query("UPDATE line_ids SET next = %i WHERE id = %i", [$idRow, $idPrevRow]); 
                        if($result = query("SELECT name_column FROM fields WHERE tableId = %i AND type = 'head'", [$idTable]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                query("INSERT INTO fields (tableId, i, name_column, type, value) VALUES(%i, %i, %s, %s, %s) ", [ $idTable, $idRow, $row[0], "value", "" ]);
                                $out[$row[0]] = ["id" => $mysqli->insert_id, "value" => ""];
                            }
                        echo json_encode($out);
                        addLog("table", "update", $idTable);
                        break;
                    case 258: // Удалить строку из таблицы
                        $idTable = (int)$param[0];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        $idRow = (int)$param[1];
                        $idNext =  -1;
                        if($result = query("SELECT next FROM line_ids WHERE id = %i", [$idRow])) $idNext = $result->fetch_array(MYSQLI_NUM)[0];
                        $idPrevRow = -1;
                        if($result = query("SELECT id FROM line_ids WHERE next = %i", [$idRow])) $idPrevRow = $result->fetch_array(MYSQLI_NUM)[0];
                        if($idNext == -1) query("UPDATE line_ids SET next = NULL WHERE id = %i", [$idPrevRow]); 
                        else query("UPDATE line_ids SET next = %s WHERE id = %i", [$idNext, $idPrevRow]); 
                        query("DELETE FROM line_ids WHERE id = %i", [ $idRow ]);
                        query("DELETE FROM fields WHERE tableId = %i AND i = %i AND type != 'head'", [ $idTable, $idRow ]);
                        addLog("table", "update", $idTable);
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
                        if($operation == "copy") 
                        {
                            $value = getCellLink($idCellFrom, true);
                            if($typePaste == "cell") query("UPDATE fields SET value = %s, linkId = %i, linkType = %s, type = 'link', state = 0 WHERE id = %i", [ "", $idCellFrom, "cell", $idCellTo ]);
                            else query("UPDATE fields SET value = %s, linkId = NULL, linkType = NULL, type = 'value', state = 0 WHERE id = %i", [ $value["value"], $idCellTo ]);
                            echo json_encode([ 
                                "id" => $idCellTo, 
                                "value" => $value["value"], 
                                "state" => $value["state"], 
                                "type" => $typePaste == "cell" ? $typePaste : null, 
                                "linkId" => $typePaste == "cell" ? $idCellFrom : null ]);
                            addLog("table", "update", $idTableTo); // изменение основной таблицы
                        }
                        if($operation == "cut") 
                        {
                            if($result = query("SELECT type, value, linkId, linkType, state, info FROM fields WHERE id = %i", [$idCellFrom])) 
                            {
                                $valueData = $result->fetch_array(MYSQLI_NUM);
                                query("UPDATE fields SET type=%s, value=%s, linkId=%i, linkType=%s, state=%i, info=%s WHERE id = %i", [ 
                                    $valueData[0], $valueData[1], $valueData[2], $valueData[3], $valueData[4], $valueData[5], $idCellTo ]);
                                query("UPDATE fields SET type='value', value='', linkId=NULL, linkType=NULL, state=0, info=NULL WHERE id = %i", [ $idCellFrom ]);
                                echo json_encode([ "idTableFrom" => $idTableFrom ]);
                                addLog("table", "update", $idTableFrom); // изменение таблицы из которой вырезали
                            }
                        }
                        break;
                    case 260: //Выставить статус
                        $idTable = (int)$param[0];
                        $idField = (int)$param[1];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        query("UPDATE fields SET state = %i WHERE id = %s AND tableId = %i", [ (int)$param[2], $idField, $idTable ]);
                        addLog("table", "updateState", $idTable);
                        break;
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
                    case 302: // Удалить значение
                        $idElement = (int)$param[0];
                        if((getRights($idElement) & 8) != 8) return; // Права на изменение
                        $idValue = -1;
                        if($result = query("SELECT objectId FROM structures WHERE id = %i", [ $idElement ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) $idValue = (int)$row[0];
                        if($nQuery == 301) 
                        {
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
                        }
                        else 
                        {
                            query("DELETE FROM my_values WHERE id = %i", [ $idValue ]);
                            query("DELETE FROM structures WHERE id = %i", [ $idElement ]);
                            query("DELETE FROM my_list WHERE value_id = %i", [ $idValue ]);
                        }
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
    function getUsersOrRoles(&$out, $type)
    {
        if($type == "users")
        {
            if($result = query("SELECT login FROM registration", []))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $user = ["id" => 0, 
                    "objectType" => "user",
                    "objectId" => "",
                    "name" => $row[0]];
                    $out[] = $user;
                }
        }
        if($type == "roles")
        {
            if($result = query("SELECT role FROM roles", []))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $role = ["id" => 0, 
                    "objectType" => "role",
                    "objectId" => "",
                    "name" => $row[0]];
                    $out[] = $role;
                }
        }
    }
    $countCycle = 0; // необходимо обнулять для правильной работы
    function getCellLink($linkId, $first)
    {
        if($first) $countCycle = 0;
        global $countCycle;
        if(++$countCycle > 50) return Null; // ограничение на зацикливание
        if($result = query("SELECT value, type, linkId, linkType, id, state, tableId FROM fields WHERE id = %i", [ (int)$linkId ]))
        {
            $row = $result->fetch_array(MYSQLI_NUM);
            if($row[3] == "cell") return getCellLink($row[2], false);
            else
            {
                $out = ["value" => $row[0], "state" => (int)$row[5], "tableId" => (int)$row[6]];
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
                        $out["state"] = getStatusForTable((int)$row[2], true);
                        $out["tableId"] = (int)$row[2];
                    }
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
    function getStatusForTable($idTable, $first)
    {
        if($first) $countCycle = 0;
        global $countCycle;
        if(++$countCycle > 50) return Null; // ограничение на зацикливание
        $state = [];
        if($result = query("SELECT i, name_column, value, type, linkId, linkType, id, state FROM fields WHERE tableId = %i AND type != 'head'", [$idTable]))
        while ($row = $result->fetch_array(MYSQLI_NUM)) 
        {
            if($row[3] == "link")
            {
                $field["linkId"] = (int)$row[4];
                switch($row[5])
                {
                    case "value":
                        $state[] = (int)$row[7];
                        break;
                    case "table":
                        $state[] = getStatusForTable($field["linkId"], false);
                        break;
                    case "cell":
                        $value = getCellLink($field["linkId"], true);
                        $state[] = $value["state"];
                        break;
                }
            }
            else $state[] = (int)$row[7];
        }
        $k = 0;
        $sum = 0;
        for($i = 0, $c = count($state); $i < $c; $i++)
            if($state[$i] > 0) 
            {
                $k++; 
                $sum += $state[$i];
            }
        return $k > 0 ? floor($sum / $k) : 0;
    }
?>