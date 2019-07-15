<?php
    $queryWhoNeedClass = [ 250, 251, 252, 255, 257, 258, 259, 260, 261, 266, 267, 269, 270, 275 ]; // набор запросов, которые требуют классов
    $idTable = (int)$param[0];
    if(array_search($nQuery, $queryWhoNeedClass) !== false) 
    {
        require_once("myTable.php"); // $myTable класс для работы с таблицей
        $myTable = new MyTable($idTable, $myLog);
    }
    switch($nQuery)
    {
        case 250: // Запрос таблицы
            $right = $myRight->get($idTable);
            if(($right & 1) != 1) return; // Права на просмотр
            $tableRight = [
                "change" => ($right & 8) == 8,
                "cut" => ($right & 2) == 2 && ($right & 8) == 8,
                "copy" => ($right & 2) == 2
            ];
            /* Доступные фильтры*/
            require_once("myFilter.php");
            $myFilter = new MyFilter();
            $allFilters = $myFilter->getAllFilters($idTable);
            if(array_key_exists(1, $param) && $allFilters["filterStr"] == "" && (int)$param[1] == 1) 
            {
                if(selectOne("SELECT count(DISTINCT i) FROM fields WHERE tableId = %i AND type != 'head'", [$idTable]) > 300)
                {
                    echo json_encode([
                        "error" => "MORE_300",
                        "filters" => $allFilters["filters"],
                        "filter" => $allFilters["filterSelected"]
                    ]);
                    return;
                }
            }
            $myTable->getTable(
                $tableRight, 
                $allFilters["filters"], 
                $allFilters["filterSelected"], 
                $allFilters["filterStr"],
                $allFilters["filterColumn"]
            );
            /* request("SELECT * FROM fields WHERE tableId = %i", [$idTable]); */
            break;
        case 251: // Добавить/Удалить заголовок
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            if(!is_null(selectOne("SELECT bindId FROM structures WHERE id = %i", [ $idTable ]))) return; // Если таблица наследуется
            $data = json_decode($param[1]);
            $changes = array_key_exists(2, $param) ? $param[2] : [];
            $myTable->setAndRemoveHeader($data, $changes);
            break;
        case 252: // Изменить значение ячейки в таблице
            $data = json_decode($param[1]);
            $idField = (int)$data->id;
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]); // Проверка прав должна идти от ячейки
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            $myTable->setCell($data, true);
            break;
        case 253: // Запрос списка колонок
            if(($myRight->get($idTable) & 1) != 1) return; // Права на просмотр
            $head = [];
            if(selectOne("SELECT objectType FROM structures WHERE id = %i", [ $idTable ]) == "table")
            {
                if($result = query("SELECT id, value FROM fields WHERE tableId = %i AND type = 'head' ORDER by i", [$idTable]))
                    while ($row = $result->fetch_array(MYSQLI_NUM)) $head[] = $row;
            }
            else $head = [[1, "Имя"], [2, "Тип"], [3, "Хэштег"]];
            echo json_encode($head);
            break;
        case 254: // резерв
            break;
        case 255: // Добавление элемента из левого меню в таблицу по ссылке
            $idObject = (int)$param[1];
            $idField = (int)$param[2];
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            if(($myRight->get($idObject) & 4) != 4) return; // Права на наследование
            $myTable->setCellByLink($idObject, $idField);
            break;
        case 256: // резерв
            break;
        case 257: // Добавить строку в таблицу
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            $idPrevRow = (int)$param[1]; // либо id предыдущей строки, либо -1
            $prevOrNext = (int)$param[2]; // -1 добавить строку выше, 1 добавить строку ниже
            $myTable->addRow($idPrevRow, $prevOrNext, true);
            break;
        case 258: // Удалить строку из таблицы
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            if(selectOne("SELECT class FROM structures WHERE id = %i", [ $idTable ]) == 1) return; // Ограничение для удаления в таблицах созданных конструктором
            $idRow = (int)$param[1];
            $myTable->removeRow($idRow);
            break;
        case 259: // Копировать ячейку
            $idCellTo = (int)$param[0];
            $idCellFrom = (int)$param[1];
            $operation = $param[2];
            $typePaste = $param[3];
            if($idCellTo == $idCellFrom) return; // нельзя скопировать в ту же ячейку
            if($result = query("SELECT tableId FROM fields WHERE id = %i", [$idCellTo])) $idTableTo = (int)($result->fetch_array(MYSQLI_NUM)[0]);
            if($result = query("SELECT tableId FROM fields WHERE id = %i", [$idCellFrom])) $idTableFrom = (int)($result->fetch_array(MYSQLI_NUM)[0]);
            if(($myRight->get($idTableTo) & 8) != 8) return; // Права на изменение
            if($operation == "copy" && ($myRight->get($idTableFrom) & 4) != 4) return; // Права на наследование
            if($operation == "cut" && ($myRight->get($idTableFrom) & 8) != 8) return; // Права на изменение
            $myTable->copyCell($idCellTo, $idTableTo, $idCellFrom, $idTableFrom, $operation, $typePaste, true);
            break;
        case 260: // Выставить статус
            $idField = (int)$param[1];
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            $myTable->setStateForField($idTable, $idField, $param[2]);
            break;
        case 261: // Экспорт таблицы в excel с подгрузкой всех данных 
            if(($myRight->get($idTable) & 1) != 1) return; // Права на просмотр
            $myTable->export();
            break;
        case 262: // Добавление события из левого меню на ячейку
            $eventId = (int)$param[1];
            $idField = (int)$param[2];
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            $type = selectOne("SELECT type FROM events WHERE id = %i", [ $eventId ]);
            if($type != "date") 
                query("UPDATE fields SET eventId = %i WHERE id = %i OR bindId = %i", [$eventId, $idField, $idField]);
            else echo json_encode(false);
            $myLog->add("field", "event", $idField);
            break;
        case 263: // Удаление события с ячейки
            $idField = (int)$param[1];
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            query("UPDATE fields SET eventId = NULL WHERE id = %i OR bindId = %i", [ $idField, $idField ]);
            $myLog->add("field", "revent", $idField);
            break;
        case 264: // Назначить тип столбцу
            $idField = (int)$param[1]; // id ячейки
            $idValue = (int)$param[2]; // id из структуры
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            $idTlist = selectOne("SELECT id FROM my_values WHERE id = (SELECT objectId FROM structures WHERE id = %i)", [ $idValue ]); // id из my_values
            query("UPDATE fields SET dataType = %i WHERE id = %i AND type = 'head' AND tableId = %i", [ $idTlist, $idField, $idTable ]);
            query("UPDATE fields SET type = 'link', linkId = %i, linkType = 'tlist', value = '' WHERE idColumn = %i AND tableId = %i", [ $idTlist, $idField, $idTable ]);
            // Выставление типа у всех наследников, чтобы не затирать возможные данные обновления ячеек не происходит
            query("UPDATE fields SET dataType = %i WHERE bindId = %i AND type = 'head'", [ $idTlist, $idField ]);
            break;
        case 265: // Сбросить тип столбца
            $idField = (int)$param[1];
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            query("UPDATE fields SET dataType = NULL WHERE id = %i AND type = 'head' AND tableId = %i", [ $idField, $idTable ]);
            query("UPDATE fields SET dataType = NULL WHERE bindId = %i AND type = 'head'", [ $idField ]);
            break;
        case 266: // Импорт файла
            $nameFile = $param[1];
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            $myTable->import("../tmp/$nameFile");
            break;
        case 267: // Обновление ячейки по id для импорта
            $data = json_decode($param[0]);
            foreach($data as $idTable => $value)
            {
                $myTable = new MyTable($idTable, $myLog);
                if(($myRight->get($idTable) & 8) != 8) continue; // Права на изменение
                for($i = 0, $c = count($value); $i < $c; $i++) $myTable->setCell($value[$i], true);
            }
            break;
        case 268: // Назначить примитивный тип столбцу
            $idField = (int)$param[1]; // id ячейки
            $idValue = $param[2]; // имя из структуры
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            $idType = selectOne("SELECT id FROM my_values WHERE type = %s", [ $idValue ]);
            query("UPDATE fields SET dataType = %i WHERE id = %i AND type = 'head' AND tableId = %i", [ $idType, $idField, $idTable ]);
            query("UPDATE fields SET type = 'value', linkId = NULL, linkType = NULL WHERE idColumn = %i AND tableId = %i", [ $idField, $idTable ]);
            query("UPDATE fields SET dataType = %i WHERE bindId = %i AND type = 'head'", [ $idType, $idField ]);
            break;
        case 269: // Поменять местами строку
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            $idRow1 = (int)$param[1]; // id строки которую надо вырезать
            $idRow2 = (int)$param[2]; // id строки после которой надо вставить
            $prevOrNext = (int)$param[3]; // -1 добавить строку выше, 1 добавить строку ниже
            $myTable->cutRow($idRow1, $idRow2, $prevOrNext);
            break;
        case 270: // Скопировать строку и вставить после
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            $idRowFrom = (int)$param[1]; // id строки которую надо копировать
            $idRowTo = (int)$param[2]; // id строки после которой надо вставить
            $prevOrNext = (int)$param[3]; // -1 добавить строку выше, 1 добавить строку ниже
            $myTable->copyRow($idRowFrom, $idRowTo, $prevOrNext);
            break;
        case 271: // Выставить цвет у ячейки
            $idField = (int)$param[0]; // id ячейки
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
            if(($myRight->get($idTable) & 8) != 8) continue; // Права на изменение
            query("UPDATE fields SET color = %s WHERE id = %i", [ $param[1] === "NULL" ? null : $param[1], $idField ]);
            break;
        case 272: // Запрос пользовательскй таблицы свойств
            $idField = (int)$param[0]; // id ячейки
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
            if(($myRight->get($idTable) & 1) != 1) continue; // Права на просмотр
            $tableProperty = [
                "userProperty" => selectOne("SELECT user_property FROM fields WHERE id = %i", [ $idField ])
            ];
            echo json_encode($tableProperty);
            break;
        case 273: // Изменить пользовательскую таблицу свойств
            $idField = (int)$param[0]; // id ячейки
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
            if(($myRight->get($idTable) & 8) != 8) continue; // Права на изменение
            query("UPDATE fields SET user_property = %s WHERE id = %i", [ $param[1], $idField ]);
            break;
        case 274: // Получить список элементов, которые ссылаются на ячейку
            $idField = (int)$param[0]; // id ячейки
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
            if(($myRight->get($idTable) & 1) != 1) continue; // Права на просмотр
            $tableProperty = [
                "link" => null,
                "event" => null,
                "whoRefer" => []
            ];
            if($result = query("SELECT id FROM fields WHERE linkType = 'cell' AND linkId = %i", [ $idField ]))
                while($row = $result->fetch_assoc())
                    $tableProperty["whoRefer"][] = $row["id"];
            echo json_encode($tableProperty);
            break;
        case 275: // Добавить в таблицу строку с новым значением для списка и сделать пометку для администратора
            $linkId = (int)$param[0];
            $value = $param[1];
            $idColumn = selectOne("SELECT value FROM my_values WHERE id = %i", [ $linkId ]);
            $idTable = selectOne("SELECT tableId FROM my_values WHERE id = %i", [ $linkId ]);
            $myTable = new MyTable($idTable, $myLog);
            $row = $myTable->addRow(-1, -1, false);
            $idRow = $row["__ID__"];
            query("UPDATE fields SET value = %s WHERE i = %i AND idColumn = %i", [ $value, $idRow, $idColumn ]);
            query("INSERT INTO user_settings (login, id, type, value) VALUES(%s, %i, 'add_user_row', %s)", [ $login, $idTable, $idRow ]);
            echo selectOne("SELECT id FROM fields WHERE i = %i AND idColumn = %i", [ $idRow, $idColumn ]);
            break;
        case 276: // Принять строку, которая была добавлена пользователем без прав
            $idRow = (int)$param[0];
            $idTable = selectOne("SELECT tableId FROM fields WHERE i = %i", [ $idRow ]);
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            query("DELETE FROM user_settings WHERE login = %s AND type = 'add_user_row' AND value = %s", [ $login, $idRow ]);
            break;
    }
?>