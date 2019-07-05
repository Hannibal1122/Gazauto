<?php
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
?>