<?php
    class MyStructures
    {
        function __construct($myRight, $myLog)
        {
            $this->myRight = $myRight;
            $this->myLog = $myLog;
        }
        function create($param, $out = true)
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
                    $myFilter = new MyFilter();
                    $this->create([ "filter", $myFilter->create("", ""), "default filter", $idElement, 0, "" ]);
                }
            }
            if($param[0] == "plan") // План можно открывать как таблицу, но нельзя наследовать
            {
                require_once("myFilter.php");
                $myFilter = new MyFilter();
                $this->create([ "filter", $myFilter->create("", ""), "default filter", $idElement, 0, "" ], false);
            }
            if($out) echo json_encode(["Index", $idElement]);
            $this->myLog->add("structure", "create", $idElement);
        }
        function getWhereUsed($idElement)
        {
            $count = 0;
            $type = selectOne("SELECT objectType FROM structures WHERE id = %i", [ $idElement ]);
            switch($type)
            {
                case "table":
                case "file":
                    $count = (int)selectOne("SELECT count(*) FROM fields WHERE linkId = %i AND linkType = %s", [ $idElement, $type ]);
                    break;
                case "tlist":
                    $count = (int)selectOne("SELECT count(*) FROM fields WHERE linkId = (SELECT objectId FROM structures WHERE id = %i) AND linkType = %s", [ $idElement, $type ]);
                    break;
                case "event":
                    $count = (int)selectOne("SELECT count(*) FROM fields WHERE eventId = %i", [ $idElement ]);
                    break;
            }
            return $count;
        }
    }
?>