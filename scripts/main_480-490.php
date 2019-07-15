<?php
    $idElement = (int)$param[0];
    function appendToFilterStrByLog(&$filterStr, $subStr)
    {
        if($filterStr == "") $filterStr .= "WHERE ";
        else $filterStr .= " AND ";
        return $filterStr .= $subStr;
    }
    function getFilterStrByLog($event_log_types, $event_log_event_types)
    {
        $filterStr = "";
        foreach($event_log_types as $key => $value)
            switch($key)
            {
                case "value":
                    if($value != "") appendToFilterStrByLog($filterStr, "value LIKE '%$value%'");
                    break;
                case "login":
                    if($value != "") appendToFilterStrByLog($filterStr, "login LIKE '%$value%'");
                    break;
                default: 
                    if(!$value) appendToFilterStrByLog($filterStr, "type != '$key'");
                    break;
            }
        foreach($event_log_event_types as $key => $value)
            if(!$value) appendToFilterStrByLog($filterStr, "operation != '$key'");
        return $filterStr;
    }
    switch($nQuery)
    {
        case 480: // Отображение последних 100 сообщений
            if(($myRight->get($idElement) & 1) != 1) continue; // Права на просмотр
            $out = [
                "data" => [],
                "event_log_event_types" => selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [ $login, "event_log_event_types" ]),
                "event_log_types" => selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [ $login, "event_log_types" ])
            ];
            $out["event_log_event_types"] = $out["event_log_event_types"] != "" ? json_decode($out["event_log_event_types"]) : []; 
            $out["event_log_types"] = $out["event_log_types"] != "" ? json_decode($out["event_log_types"]) : []; 
            $data = [];
            $filterStr = getFilterStrByLog($out["event_log_types"], $out["event_log_event_types"]);
            $i = 0;
            if($result = query("SELECT id, date, login, type, operation, value FROM main_log $filterStr ORDER by date DESC LIMIT 100", []))
                while ($row = $result->fetch_assoc())
                {
                    $data[$i] = $row;
                    if($data[$i]["type"] == "table" || $data[$i]["type"] == "structure") $data[$i]["name"] = selectOne("SELECT name FROM structures WHERE id = %i", [ (int)$data[$i]["value"] ]);
                    $i++;
                }
            $out["data"] = $data;
            echo json_encode($out);
            break;
        case 481: // Запрос сообщений по дате
            if(($myRight->get($idElement) & 1) != 1) continue; // Права на просмотр
            $beginDate = $param[1];
            $endDate = $param[2]; 
            $out = [];
            $event_log_event_types = selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [ $login, "event_log_event_types" ]);
            $event_log_types = selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [ $login, "event_log_types" ]);
            $event_log_event_types = $event_log_event_types != "" ? json_decode($event_log_event_types) : []; 
            $event_log_types = $event_log_types != "" ? json_decode($event_log_types) : [];
            $filterStr = getFilterStrByLog($event_log_types, $event_log_event_types);
            if($filterStr == "") $filterStr = "WHERE date >= %s AND date <= %s";
            else $filterStr .= " AND date >= %s AND date <= %s";
            $i = 0;
            if((int)selectOne("SELECT count(*) FROM main_log $filterStr ORDER by date", [ $beginDate, $endDate ]) > 1000) 
            {
                echo "MORE_1000";
                return;
            }
            if($result = query("SELECT id, date, login, type, operation, value FROM main_log $filterStr ORDER by date", [ $beginDate, $endDate ]))
                while ($row = $result->fetch_assoc())
                {
                    $out[$i] = $row;
                    if($out[$i]["type"] == "table" || $out[$i]["type"] == "structure") $out[$i]["name"] = selectOne("SELECT name FROM structures WHERE id = %i", [ (int)$out[$i]["value"] ]);
                    $i++;
                }
            echo json_encode($out);
            /* echo "SELECT date, login, type, operation, value FROM main_log WHERE date >= %s AND date <= %s ORDER by date\n";
            echo $beginDate."\n";
            echo $endDate."\n"; */
            break;
        case 482: // Запросить измененное значение
            if(($myRight->get($idElement) & 1) != 1) continue; // Права на просмотр
            $idLog = (int)$param[1];
            echo selectOne("SELECT oldValue FROM main_log WHERE id = %i", [ $idLog ]);
            break;
        case 483: // Вернуть значение
            if(($myRight->get($idElement) & 8) != 8) continue; // Права на изменение
            break;
    }
?>