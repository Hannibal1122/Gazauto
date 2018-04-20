<?php
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
            query("INSERT INTO registration VALUES(%s, %s, %i, %s, %s)", ["admin", "mwork92@gmail.com", "1", "@DATE@", "admin"]);
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
                $rights = -1;
                $login = $paramL;
                if($result = query("SELECT checkkey FROM signin WHERE id = %s AND login = %s", [$paramI, $paramL]))
                    while ($row = $result->fetch_array(MYSQLI_NUM)) $checkKey = $row[0];
                if ($checkKey != "" && $checkKey == $paramC) 
                {
                    if($result = query("SELECT rights FROM roles WHERE id IN (SELECT role FROM registration WHERE login = %s)", [$paramL]))
                        while ($row = $result->fetch_array(MYSQLI_NUM)) $rights = (int)$row[0];
                    echo json_encode([$rights]);
                }
                else echo json_encode([$rights]); 
                break;
            case 7: // Очищает логин и ключ при выходе пользователя с сайта
                echo $paramC;
                query("UPDATE signin SET checkkey = '', login = '' WHERE id = %s", [$paramC]);
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
            /* if($result = query("SELECT rights FROM roles WHERE id IN (SELECT role FROM registration WHERE login = %s)", [$paramL]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) $rights = (int)$row[0];
            $out_rights = recodeRights($rights, 8); */
            if($nQuery >= 40 && $nQuery < 50)
                switch($nQuery)
                {
                    case 41: // Запрос списка пользователей
                        request("SELECT login FROM registration", []);
                        break;
                    case 45:
                        break;
                }
            if($nQuery >= 100 && $nQuery < 150) // Работа со структурой
                switch($nQuery)
                {
                    case 100: // Создать элемент структуры
                        query("INSERT INTO structures (objectType, objectId, name, parent, priority, info) VALUES(%s, %i, %s, %i, %i, %s)", $param);
                        break;
                    case 110: // Загрузка структуры
                        $out = [];
                        $outStraighten = [];
                        if($login == "admin") $query = "SELECT id, objectType, objectId, name, parent, priority, info FROM structures ORDER by parent, priority";
                        else $query = "SELECT id, objectType, objectId, name, parent, priority, info FROM structures WHERE 
                            id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                                AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0)) ORDER by parent, priority";
                        //else $query = "SELECT id, objectType, objectId, name, parent, priority, info FROM structures WHERE id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1) ORDER by parent, priority";
                        if($result = query($query, $login == "admin" ? [] : [$login, $role, $login]))
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
                        if($login == "admin") getUsersAndRoles($out);
                        $c = count($out);
                        for($i = 0; $i < $c; $i++)
                            straighten($outStraighten, $out[$i], -1);
                        
                        echo json_encode($outStraighten);
                        break;
                    case 111: // Загрузка структуры без выпрямления
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
                        break;
                    case 112: // Удаление элемента структуры
                        getRemoveElementbyStructure($out, $param[0]);

                        $out = (int)$param[0];
                        getRemoveElementbyStructure($out, (int)$param[0]);
                        query("DELETE FROM structures WHERE id IN ($out)", []);
                        echo "Удалены элементы: $out";
                        break;
                }
            if($nQuery >= 150 && $nQuery < 200) // Работа с Пользователями
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
            if($nQuery >= 200 && $nQuery < 250) // Работа с правами
                switch($nQuery)
                {
                    case 200: // Добавить права
                        $id = (int)$param[0];
                        $objectType = $param[1];
                        $rights = json_decode($param[2]);
                        $c = count($rights);
                        query("DELETE FROM rights WHERE objectType = %s AND objectId = %i", [ $objectType, $id]);
                        for($i = 0; $i < $c; $i++)
                        {
                            $login = $rights[$i] -> login;
                            $type = $rights[$i] -> type;
                            $_rights = (int)($rights[$i] -> rights);
                            $_param = [ $objectType, $id, $type, $login, $_rights ];
                            query("INSERT INTO rights (objectType, objectId, type, login, rights) VALUES(%s, %i, %s, %s, %i) ", $_param);
                        }
                        break;
                    case 201: // Запросить права
                        $out = [];
                        if($result = query("SELECT type, login, rights FROM rights WHERE objectId = %i AND objectType = %s", $param))
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
                        $rights = 0;
                        $use_login = false;
                        if($result = query("SELECT type, rights FROM rights WHERE objectId = %i AND objectType = %s AND (login = %s OR login = %s)", [$param[0], $param[1], $login, $role]))
                            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                            {
                                if(!$use_login) $rights = (int)$row[1];
                                if($row[0] == "user") $use_login = true;
                            }
                        echo json_encode([$rights]);
                        break;
                }
        }
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
    function straighten(&$out, $data, $parent) // из объекта получаем одномерный массив со всеми полями дерева
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
    }
    function getRemoveElementbyStructure(&$out, $parent) // По id собирает все элементы для удаления
    {
        if($result = query("SELECT id FROM structures WHERE parent = %i", [$parent]))
            while ($row = $result->fetch_array(MYSQLI_NUM)) 
            {
                $out .= ",".(int)$row[0];
                getRemoveElementbyStructure($out, $row[0]);
            }
    }
    function getUsersAndRoles(&$out)
    {
        $users = [];
        $roles = [];
        $i = 4;
        if($result = query("SELECT login FROM registration", []))
            while ($row = $result->fetch_array(MYSQLI_NUM)) 
            {
                $users[] = ["id" => "a$i", 
                "objectType" => "user",
                "objectId" => "",
                "name" => $row[0],
                "childrens" => []];
                $i++;
            }
        if($result = query("SELECT role FROM roles", []))
            while ($row = $result->fetch_array(MYSQLI_NUM)) 
            {
                $roles[] = ["id" => "a$i", 
                "objectType" => "role",
                "objectId" => "",
                "name" => $row[0],
                "childrens" => []];
                $i++;
            }
        $elem = [];
        $elem["id"] = "a1";
        $elem["objectType"] = "folder";
        $elem["objectId"] = "";
        $elem["name"] = "Администрирование";
        $elem["childrens"] = 
        [
            ["id" => "a2", 
            "objectType" => "folder",
            "objectId" => "",
            "name" => "Пользователи",
            "childrens" => $users],
            ["id" => "a3", 
            "objectType" => "folder",
            "objectId" => "",
            "name" => "Роли",
            "childrens" => $roles]
        ];
        $out[] = $elem;
    }
?>				