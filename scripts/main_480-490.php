<?php
    $idElement = (int)$param[0];
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
            $filterStr = "";
            /* foreach($key as $out["event_log_types"])
            {
                print_r($key);
            } */
            $i = 0;
            if($result = query("SELECT id, date, login, type, operation, value FROM main_log ORDER by date DESC LIMIT 100", []))
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
            $i = 0;
            if($result = query("SELECT id, date, login, type, operation, value FROM main_log WHERE date >= %s AND date <= %s ORDER by date", [ $beginDate, $endDate ]))
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