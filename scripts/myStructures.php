<?php
    class MyStructures
    {
        function __construct($myRight, $myLog)
        {
            $this->myRight = $myRight;
            $this->myLog = $myLog;
        }
        function create($param)
        {
            // 0 - objectType
            // 1 - objectId
            // 2 - name
            // 3 - parent
            // 4 - priority
            // 5 - info
            
            global $mysqli, $login;
            query("INSERT INTO structures (objectType, objectId, name, parent, priority, info) VALUES(%s, %i, %s, %i, %i, %s)", $param);
            $idElement = $mysqli->insert_id;
            
            if($login != "admin") $this->myRight->create($idElement, "user", $login, 255);
            if($param[0] == "folder" || $param[0] == "table") // Проверка на то что объект наследуется
            {
                require_once("myObject.php");
                $myObject = new MyObject($idElement);
                $myObject->checkAdd();
                if($param[0] == "table") // Если таблица создаем фильтр по умолчанию с правами пользователя
                {
                    require_once("myFilter.php");
                    $myFilter = new MyFilter($idFilter);
                    $this->create([ "filter", $myFilter->create(""), "default filter", $idElement, 0, "" ]);
                }
            }
            echo json_encode(["Index", $idElement]);
            $this->myLog->add("structure", "add", $idElement);
        }
    }
?>