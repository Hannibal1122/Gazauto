<?php
    switch($nQuery)
    {
        // /,"a12354fasda","a12355fasda","a12356fasda","a12357fasda","a12358fasda","a
        case 300: // резерв
            break;
        case 301: // резерв
            break;
        case 302: // резерв
            break;
        case 303: // резерв
            break;
        case 304: // Загрузить список
            $idValue = (int)$param[0]; // Добавить проверку наоборот
            if($result = query("SELECT value, tableId, filterId FROM my_values WHERE id = %i", [ $idValue ]))
            {
                $row = $result->fetch_array(MYSQLI_NUM);
                echo json_encode(getTableListValues((int)$row[1], (int)$row[0], (int)$row[2]));
            }
            /* if($result = query("SELECT objectId FROM structures WHERE id = %i", [ $idElement ]))
            while ($row = $result->fetch_array(MYSQLI_NUM)) $idValue = (int)$row[0]; */
            break;
        case 305: // Добавить значение нового типа список из таблицы
            $idElement = (int)$param[0]; // id из структуры
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            $type = $param[1];
            $value = $param[2];
            $tableId = $param[3];
            query("INSERT INTO my_values (type, value, tableId) VALUES(%s, %s, %i)", [ $type, $value, $tableId ]);
            $idValue = $mysqli->insert_id;
            query("UPDATE structures SET objectId = %i WHERE id = %i", [$idValue, $idElement]);
            break;
        case 306: // Изменить значение нового типа список из таблицы
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            $idValue = (int)selectOne("SELECT objectId FROM structures WHERE id = %i", [ $idElement ]);
            $value = $param[1];
            query("UPDATE my_values SET value = %s WHERE id = %i", [ $value, $idValue ]);
            break;
        case 307: // Загрузить данные для нового типа список из таблицы
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            $idValue = (int)selectOne("SELECT objectId FROM structures WHERE id = %i", [ $idElement ]);
            if($result = query("SELECT id, type, value, tableId FROM my_values WHERE id = %i", [ $idValue ]))
                echo json_encode($result->fetch_array(MYSQLI_NUM));
            break;
    }
?>