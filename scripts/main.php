<?php
    /* $start = microtime(true); */
    /* , round(microtime(true) - $start, 4) */
    /* ini_set('error_reporting', E_ALL);
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1); */

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
    /**********************************
    UPDATE `fields` SET `dataType` = `linkId` WHERE `linkType` = "tlist";
    UPDATE `fields` SET `linkId` = NULL WHERE `linkType` = "tlist";
    **********************************/

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
    /* if($nQuery == -2)
    {
        if($result = query("SELECT id, tableId, name_column FROM fields WHERE type = 'head'", []))
            while ($row = $result->fetch_array(MYSQLI_NUM))
            {
                query("UPDATE fields SET name_column = %i WHERE tableId = %i AND name_column = %s AND type != 'head'", [$row[0], $row[1], $row[2]]);
                query("UPDATE fields SET value = %s, name_column = NULL WHERE id = %i", [$row[2], $row[0]]);
                echo $row[0]." ".$row[1]." ".$row[2]."<br>";
            }
    } */
    
    /* Все картинки переводятся в thumbs */
    /* if($nQuery == -3)
    {
        require_once("myFile.php");
        $myFile = new MyFile();
        $dir = scandir("../files/", 1);
        for($i = 0; $i < count($dir) - 2; $i++){
            $name = scandir("../files/".$dir[$i], 1)[0];
            $myFile->createFile((int)$dir[$i], $name);
        }
    } */

    //file_get_contents
    /* Запросы не требующие логин */
    if($nQuery < 40)
        switch($nQuery)
        {
            case 0: // Запрос версии
                /* include("./version/versions.php"); */
                $project = [];	
                $project['main'] = "0.9.85";/* getVersion(		$_main["name"], 		$_main["data"]); */
                $project['php'] = "0.9.92";/* getVersion(		$_php["name"], 			$_php["data"]); */
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
                $myLog->add("user", "login", $paramL);
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
                require_once("main_100-150.php");
            }
            if($nQuery >= 150 && $nQuery < 200) // Работа с Пользователями // Только admin
            {
                require_once("main_150-200.php");
            }
            if($nQuery >= 200 && $nQuery < 250) // Работа с правами 
            {
                require_once("main_200-250.php");
            }
            if($nQuery >= 250 && $nQuery < 300) // Работа с таблицой 
            {
                require_once("main_250-300.php");
            }
            if($nQuery >= 300 && $nQuery < 350) // Работа со значениями 
            {
                require_once("main_300-350.php");
            }
            if($nQuery >= 350 && $nQuery < 400) // Работа с логом
            {
                require_once("main_350-400.php");
            }
            if($nQuery >= 400 && $nQuery < 410) // Работа с План-графиком
            {
                require_once("main_400-410.php");
            }
            if($nQuery >= 410 && $nQuery < 450) // Работа с событиями
            {
                require_once("main_410-450.php");
            }
            if($nQuery >= 450 && $nQuery < 470) // Работа с настройками пользователя
            {
                require_once("main_450-470.php");
            }
            if($nQuery >= 470 && $nQuery < 480) // Работа с фильтрами
            {
                require_once("main_470-480.php");
            }
            if($nQuery >= 480 && $nQuery < 490) // Работа с журналом У него фиксированный id = 5
            {
                require_once("main_480-490.php");
            }
            if($nQuery >= 490 && $nQuery < 500) // Работа с конструктором классов
            {
                require_once("main_490-500.php");
            }
        }
        /* else query("UPDATE signin SET checkkey = '', login = '' WHERE id = %s", [$paramI]); // Если пользователь послал не тот id  */
    }
    $mysqli->close();
    function getObjectFromStructures($row)
    {
        $elem = [];
        foreach($row as $key => $value)
            $elem[$key] = $row[$key];

        // Заполнение отображаемых иконок
        $icon = (int)$row["icon"];
        $state = ($icon & 1) == 1;
        $count = ($icon & 2) == 2;
        $elem["state"] = $state ? $row["state"] : null;
        $elem["count"] = $count ? selectOne("SELECT COUNT(*) FROM structures WHERE parent = %i", [ $elem["id"] ]) : null;
        if($elem["objectType"] == "file")
        {
            if (!file_exists("../files/".$elem["id"])) 
            {
                $elem["fileType"] = "unknown";
                return $elem;
            }
            $fileName = scandir("../files/".$elem["id"], 1)[0];
            $type = getFileType($fileName);
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
                case 'mp4':
                case 'avi':
                    $elem["fileType"] = "video";
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
    function getTableListValues($tableId, $idColumn, $filterId, $variables) // Получить список значений из таблицы, только value
    {
        $out = [];
        $filterStr = "";
        if($filterId)
        {
            require_once("myFilter.php");
            $myFilter = new MyFilter();
            $filterStr = $myFilter->getFilterStr(selectOne("SELECT objectId FROM structures WHERE id = %i", [ $filterId ]), $variables);
            if($filterStr != "") $filterStr = "AND ($filterStr)";
        }
        if($result = query("SELECT DISTINCT id, value FROM fields WHERE idColumn = %i AND tableId = %i AND type != 'head' AND value != '' $filterStr", [ $idColumn, $tableId ]))
            while ($row = $result->fetch_assoc()) 
                $out[] = [ "id" => $row["id"], "value" => $row["value"]];
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
    function getCellLink($linkId, $first) // Проверка на тип ссылки (чтобы таблицу в таблицу нельзя было вставить)
    {
        global $countCycle;
        if($first) $countCycle = 0;
        if(++$countCycle > 50) return Null; // ограничение на зацикливание

        if($result = query("SELECT type, linkId, linkType FROM fields WHERE id = %i", [ (int)$linkId ]))
        {
            $row = $result->fetch_assoc();
            if($row["linkType"] == "cell") return getCellLink($row["linkId"], false);
            else
            {
                $out = [ "tableId" => -1 ];
                if($row["type"] == "link")
                {
                    if($row["linkType"] == "table")
                        $out["tableId"] = (int)$row["linkId"];
                }
                return $out;
            }
        }
    }
    function updateCellByLink($idField, $newValue) // Обновляет все зависимые ячейки
    {
        if($result = query("SELECT id, linkId FROM fields WHERE linkId = %i", [ (int)$idField ]))
            while ($row = $result->fetch_assoc())
            {
                query("UPDATE fields SET value = %s WHERE id = %i", [ $newValue, $row["id"] ]);
                if(!is_null($row["linkId"])) updateCellByLink($row["id"], $newValue);
            }
    }
?>