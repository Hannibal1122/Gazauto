<?php
    $idElement = (int)$param[0];
    switch($nQuery)
    {
        case 480: // Отображение последних 100 сообщений
            if(($myRight->get($idElement) & 1) != 1) continue; // Права на просмотр
            $out = [];
            $i = 0;
            if($result = query("SELECT id, date, login, type, operation, value FROM main_log ORDER by date DESC LIMIT 100", []))
                while ($row = $result->fetch_assoc())
                {
                    $out[$i] = $row;
                    if($out[$i]["type"] == "table" || $out[$i]["type"] == "structure") $out[$i]["name"] = selectOne("SELECT name FROM structures WHERE id = %i", [ (int)$out[$i]["value"] ]);
                    $i++;
                }
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