<?php
    switch($nQuery)
    {
        case 410: // Создание события
            $idParent = (int)$param[0];
            if(($myRight->get($idParent) & 8) != 8) return; // Права на изменение
            $idElement = (int)$param[1];
            if($param[2] == "date")
            {
                $param[4] = getNextDateForEvent($param[3])->format("Y-m-d H:i:s");
                query("INSERT INTO events (id, type, param, date, code) VALUES(%i, %s, %s, %s, 'end')", [ $idElement, $param[2], $param[3], $param[4] ]);
            }
            else query("INSERT INTO events (id, type, param, code) VALUES(%i, %s, %s, 'end')", [ $idElement, $param[2], $param[3] ]);
            break;
        case 411: // Загрузить событие
            if(count($param) == 0) return;
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
            $out = [];
            if($result = query("SELECT type, param, date, code, ready FROM events WHERE id = %i", $param))
                $out = $result->fetch_array(MYSQLI_NUM);
            $out[] = selectOne("SELECT name FROM structures WHERE id = %i", $param);
            $out[] = ($myRight->get($idElement) & 8) != 8; // 6 - readonly
            echo json_encode($out);
            break;
        case 412: // Обновить событие
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            query("UPDATE events SET code = %s WHERE id = %i", [$param[1], $idElement]);
            break;
        case 413: // Выполнить код по id
            /* require_once("FASM.php"); // класс для работы с событиями
            $fasm = new FASM();
            $fasm->start(selectOne("SELECT code FROM events WHERE id = %i", $param)); */
            break;
        case 414: // резерв
            break;
        case 415: // Завершить событие досрочно
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            query("UPDATE events SET ready = 1 WHERE id = %i", [ $idElement ]);
            break;
        case 416: // Восстановить событие
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            query("UPDATE events SET ready = 0 WHERE id = %i", [ $idElement ]);
            break;
    }
?>