<?php
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

    $year = explode("T", date("c"));
    $time = explode("+", $year[1]);
    $current_time = $year[0]." ".$time[0];
            
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
            query("INSERT INTO registration VALUES(%s, %s, %s)", ["admin", "", "@DATE@"]);
            query("INSERT INTO password VALUES(%s, %s)", ["admin", "$2a$10$644bb3233e1ff251b4b4eumdZjoiZjWjFLyol.Ad7uUoNWlWCpz.u"]);
        }
        exit();
    }
    //file_get_contents
    if($nQuery < 40)
        switch($nQuery)
        {
            case 0: // Запрос версии
                include("./version/versions.php");
                $project = [];	
                $project['main'] = getVersion(		$_main["name"], 		$_main["data"]);
                $project['php'] = getVersion(		$_php["name"], 			$_php["data"]);
                echo json_encode($project);
                break;
            case 1: // Возвращает информацию о текущем пользователе
                request("SELECT * FROM signin WHERE id = %s", [$paramI]);
                break;
            case 2: // Фиксирует вход на сайт нового пользователя
                query("INSERT INTO signin VALUES(%s, %s, %s, %s)", $param);
                break;
            case 3: // Обновление времени нахождения пользователя на сайте
                query("UPDATE signin SET date = %s WHERE id = %s", $param);
                break;
            case 4: // вход
                require_once("enter.php");
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
                        if($login != "admin")
                            query("INSERT INTO rights (objectId, type, login, rights) VALUES(%s, %i, %s, %s, %i) ", [ $mysqli->insert_id, "user", $login, 255 ]);
                        break;
                    case 110: // Загрузка структуры // Права на просмотр
                        $out = ["folder" => [], "path" => []];
                        if($login == "admin") $query = "SELECT id, objectType, objectId, name, parent, priority, info FROM structures WHERE parent = %i ORDER by parent, priority";
                        else $query = "SELECT id, objectType, objectId, name, parent, priority, info FROM structures WHERE parent = %i AND
                            id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                                AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0)) ORDER by parent, priority";
                        if($result = query($query, $login == "admin" ? [ $param[0] ] : [ $param[0], $login, $role, $login ]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                $elem = [];
                                $elem["id"] = $row[0];
                                $elem["objectType"] = $row[1];
                                $elem["objectId"] = $row[2];
                                $elem["name"] = $row[3];
                                $elem["parent"] = $row[4];
                                $elem["priority"] = $row[5];
                                $out["folder"][] = $elem;
                            }
                        if($param[0] == 93) getUsersOrRoles($out["folder"], "users");
                        if($param[0] == 94) getUsersOrRoles($out["folder"], "roles");
                        getFullPath($out["path"], $param[0]);
                        echo json_encode($out);
                        break;
                    case 111: // Получение родителя
                        request("SELECT parent FROM structures WHERE id = %i ORDER by parent, priority", $param);
                        break;
                    /* case 111: // Загрузка структуры без выпрямления
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
                                if($row[4] == 0) $out[] = $elem;
                                else searchParent($out, $row[4], $elem);
                            }
                        echo json_encode($out);
                        break; */
                    case 112: // Удаление элемента структуры // Права на изменение
                        /* getRemoveElementbyStructure($out, $param[0]); */
                        $out = [(int)$param[0]];
                        getRemoveElementbyStructure($out, (int)$param[0]);
                        $c = count($out);
                        for($i = 0; $i < $c; $i++)
                        {
                            if((getRights($out[$i][0]) & 8) != 8) continue; // Права на изменение
                            query("DELETE FROM structures WHERE id = %i", [ $out[$i][0] ]);
                            query("DELETE FROM rights WHERE objectId = %i", [ $out[$i][0] ]);
                        }
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
                        require_once("registration.php");
                        break;
                    case 153: // Добавление роли
                        request("INSERT INTO roles (role) VALUES(%s)", $param);
                        break;
                    case 154: // Изменение пользователя
                        request("UPDATE registration SET role = %s WHERE login = %s", [$param[1], $param[0]]);
                        if($param[2] != "")
                        {
                            $sult = unique_md5();
                            $hash = myhash($param[2], $sult);
                            query("UPDATE password SET hash = %s WHERE login = %s", [$hash, $param[0]]);
                        }
                        break;
                    case 155: // Изменение роли
                        request("DELETE FROM roles WHERE role = %s", [$param[1]]); // старое
                        request("INSERT INTO roles (role) VALUES(%s)", [$param[0]]); // новое
                        request("UPDATE registration SET role = %s WHERE role = %s", $param); //Обновить все логины
                        request("UPDATE rights SET login = %s WHERE login = %s AND type = 'role'", $param); //Обновить все права
                        break;
                    case 156: // Удаление пользователя
                        if($param[0] == "admin") break;
                        request("DELETE FROM registration WHERE login = %s", $param);
                        request("DELETE FROM password WHERE login = %s", $param);
                        break;
                    case 157: // Удаление роли
                        request("DELETE FROM roles WHERE role = %s", $param);
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
                            $login = $rights[$i] -> login;
                            $type = $rights[$i] -> type;
                            $_rights = (int)($rights[$i] -> rights);
                            $_param = [ $id, $type, $login, $_rights ];
                            query("INSERT INTO rights (objectId, type, login, rights) VALUES(%i, %s, %s, %i) ", $_param);
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
                        $head = [];
                        $data = [];
                        if($result = query("SELECT i, name_column FROM fields WHERE tableId = %i AND type = 'head'", [$idTable]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                                $head[] = $row;
                        if($result = query("SELECT i, name_column, value FROM fields WHERE tableId = %i AND type = 'value'", [$idTable]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                                $data[(int)$row[0]][$row[1]] = $row[2];
                        echo json_encode(["head" => $head, "data" => $data]);
                        /* request("SELECT * FROM fields WHERE tableId = %i", [$idTable]); */
                        break;
                    case 251: // Добавить/Удалить заголовок
                        $idTable = (int)$param[0];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        $data = json_decode($param[1]);
                        query("DELETE FROM fields WHERE tableId = %i AND type = 'head'", [ $idTable ]);
                        $c = count($data);
                        for($i = 0; $i < $c; $i++)
                        {
                            if(isset($data -> oldValue))
                                query("UPDATE fields SET name_column = %s WHERE name_column = %s AND tableId = %i", [ $data -> oldValue, $data[$i] -> value, $idTable ]);
                            query("INSERT INTO fields (tableId, i, name_column, type) VALUES(%i, %i, %s, %s) ", [ $idTable, $data[$i] -> i, $data[$i] -> value, "head" ]);
                        }
                        print_r($data);
                        break;
                    case 252: // Добавить ячейки в таблицу
                        $idTable = (int)$param[0];
                        if((getRights($idTable) & 8) != 8) return; // Права на изменение
                        $data = json_decode($param[1]);
                        $c = count($data);
                        for($i = 0; $i < $c; $i++)
                        {
                            $type = $data[$i] -> __type__;
                            foreach ($data[$i] as $key => $_value)
                                if($key != "__ID__" && $key != "__type__")
                                {
                                    $name_column = $key;
                                    $value = $_value;
                                    switch($type)
                                    {
                                        case "insert":
                                            query("INSERT INTO fields (tableId, i, name_column, type, value) VALUES(%i, %i, %s, %s, %s) ", [ $idTable, $data[$i] -> __ID__, $name_column, "value", $value ]);
                                            break;
                                        case "update":
                                            query("UPDATE fields SET value = %s WHERE tableId = %i AND i = %i AND name_column = %s AND type = %s", [ $value, $idTable, $data[$i] -> __ID__, $name_column, "value" ]);
                                            break;
                                        case "remove":
                                            query("DELETE FROM fields WHERE tableId = %i AND i = %i AND name_column = %s AND type = %s AND value = %s", [ $idTable, $data[$i] -> __ID__, $name_column, "value", $value ]);
                                            break;
                                    }
                                }
                        }
                        print_r($data);
                        break;
                    case 253: // Изменить имя поле у всех ячеек
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
    /* function searchParent(&$out, $parent, $elem) // Формирование древовидной структуры
    {
        $c = count($out);
        for($i = 0; $i < $c; $i++)
            if($out[$i]["id"] == $parent) { $out[$i]["childrens"][] = $elem; return true;};
        if($i == $c)
            for($i = 0; $i < $c; $i++)
                if(searchParent($out[$i]["childrens"], $parent, $elem)) return true;
        return false;
    } */
    /* function straighten(&$out, $data, $parent) // из объекта получаем одномерный массив со всеми полями дерева
    {
        $childrens = $data["childrens"];
        $j = count($out);
        $out[$j] = [];
        $out[$j]["id"] = $data["id"];
        $out[$j]["n"] = $data["name"];
        $out[$j]["ot"] = $data["objectType"];
        $out[$j]["p"] = $parent;
        if(count($childrens) != 0)
            for($j = 0; $j < count($childrens); $j++)
                straighten($out, $childrens[$j], $data["id"]);
    } */
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
?>				