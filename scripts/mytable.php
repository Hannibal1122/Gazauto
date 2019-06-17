<?php
    class MyTable
    {
        function __construct($idTable, $myLog)
        {
            $this->idTable = (int)$idTable;
            $this->myLog = $myLog;
        }
        function getTable($tableRight, $filters, $filterSelected, $filterStr, $filterColumn) // Запрос таблицы
        {
            $idTable = $this->idTable; 
            $nameTable = "";
            $stateTable = 0;
            $objectType = "";
            $head = [];
            $data = [];
            $enableLines = "";
            $bindId;
            if($result = query("SELECT name, bindId, state, objectType FROM structures WHERE id = %i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                { 
                    $nameTable = $row[0]; 
                    $bindId = $row[1]; 
                    $stateTable = (int)$row[2]; 
                    $objectType = $row[3]; 
                }
            if($result = query("SELECT i, id, value, eventId, dataType FROM fields WHERE tableId = %i AND type = 'head' $filterColumn[0] ORDER by i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM))
                {
                    if($row[4]) $row[4] = selectOne("SELECT type FROM my_values WHERE id = %i", [(int)$row[4]]);
                    $head[] = $row;
                }
            /* Применить фильтр и узнать набор строк которые надо включить */
            /* Должны найти первый доступный фильтр */
            if($filterStr != "")
                if($result = query("SELECT DISTINCT i FROM fields WHERE tableId = %i AND type != 'head' AND ($filterStr)", [$idTable]))
                    while ($row = $result->fetch_array(MYSQLI_NUM)) 
                    {
                        if($enableLines != "") $enableLines .= ",";
                        $enableLines .= $row[0];
                    }
            /* Подготавливаем массив со строками без данных */
            if($result = query("SELECT i, next FROM fields LEFT JOIN line_ids ON line_ids.id = fields.i WHERE tableId = %i AND type != 'head'", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM))
                    $data[(int)$row[0]]["__NEXT__"] = $row[1]; 
            $queryStr = "SELECT i, idColumn, value, type, linkId, linkType, fields.id, state, eventId FROM fields WHERE tableId = %i AND type != 'head' $filterColumn[1] ";
            if($enableLines != "") $queryStr .= "AND i IN ($enableLines)";
            /* else if($filterStr == "") $queryStr .= "AND i IN (-1)"; */ // Если это оставить, то фильтр по умолчанию все скрывает
            if($result = query($queryStr, [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $field = [ "id" => (int)$row[6], "value" => $row[2], "state" => $row[7], "eventId" => $row[8] ];
                    if($row[3] == "link")
                    {
                        $field["linkId"] = (int)$row[4];
                        switch($row[5])
                        {
                            case "tlist":
                                if($value = query("SELECT value, type, tableId FROM my_values WHERE id = %i", [ $field["linkId"] ]))
                                {
                                    $field["type"] = $row[5];
                                    $valueData = $value->fetch_array(MYSQLI_NUM);
                                    if($valueData[1] == "tlist") $field["listValue"] = (int)$field["value"] == (int)$valueData[0] ? "" : getTableListValueByKey((int)$field["value"], (int)$valueData[2]);
                                    else $field["value"] = $valueData[0];
                                }
                                break;
                            case "file":
                            case "table":
                                $field["type"] = $row[5];
                                if($value = query("SELECT name FROM structures WHERE id = %i", [ $field["linkId"] ]))
                                    $field["value"] = $value->fetch_array(MYSQLI_NUM)[0];
                                if($row[5] == "table") $field["tableId"] = $field["linkId"];
                                break;
                            case "cell":
                                $value = getCellLink($field["linkId"], true);
                                $field["type"] = "cell";
                                $field["value"] = $value["value"];
                                $field["tableId"] = $value["tableId"];
                                break;
                        }
                    }
                    $data[(int)$row[0]][$row[1]] = $field;
                }
                /* Сортировка */
                $l = count((array)$data);
                $outData = [];
                $outData2 = [];
                $tableIds = [];
                foreach($data as $key => $value) if($data[$key]["__NEXT__"] == null) break; //Находим null
                for($i = $l - 1; $i >= 0; $i--) // Тут сортировка по next
                {
                    $outData[$i] = $data[$key];
                    $outData[$i]["__ID__"] = $key;
                    foreach($data[$key] as $_key => $_value)
                        if($_key != "__NEXT__" && array_key_exists("tableId", $data[$key][$_key]) && $data[$key][$_key]["tableId"] != $idTable) 
                            $tableIds[$data[$key][$_key]["tableId"]] = $data[$key][$_key]["tableId"];
                    $key = $this->getNextI($data, $key);
                }
                for($i = 0, $l = count($outData); $i < $l; $i++) // Проверяем на пустые строки
                    if(count($outData[$i]) > 2) $outData2[] = $outData[$i];
            echo json_encode([
                "head" => $head, 
                "data" => $outData2, 
                "tableIds" => $tableIds, 
                "name" => $nameTable, 
                "right" => $tableRight,
                "idLogTableOpen" => $this->myLog->add("table", "open", $idTable), 
                "changeHead" => $filterColumn[0] == "" && is_null($bindId) && $objectType != "plan", // Если столбцы скрыты фильтром ИЛИ таблица наследуется ИЛИ это редактор плана, то нельзя менять
                "state" => $stateTable,
                "filters" => $filters,
                "filter" => $filterSelected
            ]);
        }
        function setAndRemoveHeader($data, $changes) // Добавить/Удалить заголовок
        {
            global $mysqli;
            $idTable = $this->idTable;
            $count = count($data);
            //Проверка на дубликаты
            for ($i = 0; $i < $count; $i++) 
                for ($k = $i + 1; $k < $count; $k++) 
                    if ($data[$i]->value == $data[$k]->value) 
                    {
                        echo "ERROR_DUBLICATE";
                        return;
                    }
            $bindTables = []; // Поиск всех наследников
            if($result = query("SELECT id FROM structures WHERE bindId = %i", [ $idTable ]))
                while($row = $result->fetch_assoc()) 
                    $bindTables[] = $row["id"];
            for($i = 0; $i < $count; $i++)
            {
                $idColumn = -1;
                if(isset($data[$i]->id))
                    $idColumn = (int)$data[$i]->id;
                if($idColumn == -1)
                {
                    $idColumn = $this->addNewHead($idTable, $data[$i]->value, false);
                    for($j = 0, $c = count($bindTables); $j < $c; $j++)
                        $this->addNewHead($bindTables[$j], $data[$i]->value, $idColumn);
                }
                else
                    if(isset($data[$i]->oldValue)) // Изменить имя у столбца
                    {
                        query("UPDATE fields SET value = %s WHERE id = %i", [ $data[$i]->oldValue, $idColumn ]);
                        query("UPDATE fields SET value = %s WHERE bindId = %i", [ $data[$i]->oldValue, $idColumn ]);
                    }
                // Изменить порядок
                query("UPDATE fields SET i = %i WHERE id = %i", [ $i, $idColumn ]);
                query("UPDATE fields SET i = %i WHERE bindId = %i", [ $i, $idColumn ]);
                // Если это новый столбец, то создать по всем строкам
                // удаление ячеек и заголовка
            }
            for($i = 0, $c = count($changes); $i < $c; $i++)
            {
                query("DELETE FROM fields WHERE id = %i OR idColumn = %i", [ $changes[$i], $changes[$i] ]);
                if($result = query("SELECT id FROM fields WHERE bindId =  %i", [ (int)$changes[$i] ]))
                    while($row = $result->fetch_assoc()) 
                        query("DELETE FROM fields WHERE id = %i OR idColumn = %i", [ (int)$row["id"], (int)$row["id"] ]);
            }
            $this->myLog->add("table", "update", $idTable);
        }
        function addNewHead($idTable, $headName, $link)
        {
            global $mysqli;
            query("INSERT INTO fields (tableId, value, type, bindId) VALUES(%i, %s, %s, %s) ", [ $idTable, $headName, "head", $link ? $link : NULL ]);
            $idColumn = $mysqli->insert_id;
            if($result = query("SELECT DISTINCT i FROM fields WHERE tableId = %i AND type != 'head'", [ $idTable ]))
                while($row = $result->fetch_array(MYSQLI_NUM))
                    query("INSERT INTO fields (tableId, i, idColumn, type, value) VALUES(%i, %i, %s, %s, %s) ", [ $idTable, $row[0], $idColumn, "value", "" ]);
            return $idColumn;
        }
        function setCell($data, $echo, $event = true) // Изменить ячейки в таблице
        {
            $idTable = $this->idTable; 
            $value = $data->value;
            $idField = (int)$data->id;
            $typeField = is_object($value) ? "tlist" : "value";

            // TODO Добавить механизм сохранения значения
            $oldValue = query("SELECT * FROM fields WHERE id = %i", [ $idField ])->fetch_assoc();
            if($typeField == "value")
                query("UPDATE fields SET value = %s, linkId = NULL, linkType = NULL, type = 'value' WHERE tableId = %i AND id = %i", [ 
                    $value, 
                    $idTable, // для подстраховки
                    $idField
                ]);
            if($typeField == "tlist")
                query("UPDATE fields SET value = %s, linkId = %i, linkType = %s, type = 'link' WHERE tableId = %i AND id = %i", [ 
                    $value->value, 
                    $value->linkId, 
                    $value->type, 
                    $idTable, // для подстраховки
                    $idField
                ]);
            if($event) $this->checkEvent($idField);
            if($echo) 
            {
                echo json_encode([ "id" => $idField, "value" => $value ]);
                $this->myLog->add("field", "update", $idField, $oldValue);
            }
            else $this->myLog->add("field", "script", $idField, $oldValue);
        }
        function checkEvent($idField) // Нужно вызывать при изменении ячейки, проверяет наличие событий
        {
            $idEvent = (int)selectOne("SELECT eventId FROM fields WHERE id = %i", [ $idField ]);
            $idEventColumn = (int)selectOne("SELECT eventId FROM fields WHERE id = (SELECT idColumn FROM fields WHERE id = %i)", [ $idField ]);
            require_once("FASM.php"); // класс для работы с событиями
            $fasm = new FASM();
            if(!is_null($idEvent)) // Если событие на ячейке
            {
                $typeAndCode = query("SELECT type, code FROM events WHERE id = %i AND type = 'value'", [ $idEvent ])->fetch_array(MYSQLI_NUM);
                if($typeAndCode) $fasm->start($typeAndCode[1], $idField);
            }
            if(!is_null($idEventColumn)) // Если событие на столбце
            {
                $idLine = (int)selectOne("SELECT i FROM fields WHERE id = %i", [ $idField ]);
                $typeAndCode = query("SELECT type, code FROM events WHERE id = %i AND type = 'value'", [ $idEventColumn ])->fetch_array(MYSQLI_NUM);
                if($typeAndCode) $fasm->start($typeAndCode[1], $idField, $idLine);
            }
        }
        function setCellByLink($idObject, $idField) // Добавление элемента из левого меню в таблицу по ссылке
        {
            $idTable = $this->idTable; 
            if((int)$idTable == (int)$idObject) { echo "ERROR"; return; }
            if($result = query("SELECT name, objectType, objectId, state FROM structures WHERE id = %i", [ $idObject ]))
            {
                $row = $result->fetch_array(MYSQLI_NUM);
                $linkType = $row[1];
                $fieldState = 0;
                if($linkType == "tlist" && $value = query("SELECT id, value, type, tableId FROM my_values WHERE id = %i", [ (int)$row[2] ]))
                {
                    $valueData = $value->fetch_array(MYSQLI_NUM);
                    $fieldValue = $valueData[1];
                }
                else 
                {
                    $fieldValue = $row[0];
                    if($linkType == "table") 
                    {
                        $fieldState = (int)$row[3];
                        $this->calculateStateForTable($idTable);
                    }
                }
                $linkId = $linkType != "value" && $linkType != "tlist" ? $idObject : (int)$valueData[0];
                
                query("UPDATE fields SET value = %s, linkId = %i, linkType = %s, type = 'link', state = %i WHERE tableId = %i AND id = %i", [ $fieldValue, $linkId, $linkType, $fieldState, $idTable, $idField ]);
                echo json_encode([ 
                    "id" => $idField, 
                    "linkId" => $linkId, 
                    "type" => $linkType, 
                    "value" => $fieldValue, 
                    "listValue" => $linkType == "tlist" ? "" : NULL,
                    "state" => $fieldState 
                ]);
            }
            $this->myLog->add("field", "update", $idField);
        }
        function setCellByValue($idObject, $idField, $key) // Добавление элемента из левого меню в таблицу по значению
        {
            $idTable = $this->idTable; 
            if($result = query("SELECT objectType, objectId FROM structures WHERE id = %i", [ $idObject ]))
            {
                $row = $result->fetch_array(MYSQLI_NUM);
                switch($row[0])
                {
                    case "value":
                        if($value = query("SELECT value, type FROM my_values WHERE id = %i", [ (int)$row[1] ]))
                        {
                            $valueData = $value->fetch_array(MYSQLI_NUM);
                            if($valueData[1] == "array") $fieldValue = getListValueByKey((int)$row[1], $key);
                            else $fieldValue = $valueData[0];
                            query("UPDATE fields SET value = %s, type = 'value', linkId = NULL, linkType = NULL WHERE tableId = %i AND id = %i", [ $fieldValue, $idTable, $idField]);
                            echo json_encode([ "id" => $idField, "value" => $fieldValue ]);
                        }
                        break;
                }
            }
            $this->myLog->add("field", "update", $idField);
        }
        function addRow($idPrevRow, $prevOrNext, $echo) // Добавить строку в таблицу
        {
            global $mysqli;
            $idTable = $this->idTable; 
            query("INSERT INTO line_ids (next) VALUES(NULL)", []);
            $idRow = $mysqli->insert_id; // Новая строка
            $out = ["__ID__" => $idRow];
            if($idPrevRow != -1) 
            {
                if($prevOrNext == 1)
                {
                    $oldNext = selectOne("SELECT next FROM line_ids WHERE id = %i", [ $idPrevRow ]);
                    query("UPDATE line_ids SET next = %i WHERE id = %i", [$idRow, $idPrevRow]);
                    query("UPDATE line_ids SET next = %i WHERE id = %i", [$oldNext, $idRow]);
                }
                else if($prevOrNext == -1)
                {
                    $oldId = selectOne("SELECT id FROM line_ids WHERE next = %i", [ $idPrevRow ]);
                    query("UPDATE line_ids SET next = %i WHERE id = %i", [$idPrevRow, $idRow]);
                    if($oldId) query("UPDATE line_ids SET next = %i WHERE id = %i", [$idRow, $oldId]);
                }
            }
            else // Получить последний id 
            {
                $lastId = selectOne("SELECT id FROM line_ids WHERE id IN (SELECT i FROM fields WHERE tableId = %i AND type != 'head') AND next IS NULL", [$idTable]);
                if($lastId)
                    query("UPDATE line_ids SET next = %i WHERE id = %i", [$idRow, $lastId]);
            }
            if($result = query("SELECT id, value, dataType FROM fields WHERE tableId = %i AND type = 'head'", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    if($row[2])
                        query("INSERT INTO fields (tableId, i, idColumn, type, value, linkId, linkType) VALUES(%i, %i, %i, %s, '', %i, %s) ", [ 
                            $idTable, 
                            $idRow, 
                            (int)$row[0], 
                            (int)$row[2] > 3 ? 'link' : 'value', // Стандартные типы
                            (int)$row[2],
                            (int)$row[2] > 3 ? 'tlist' : NULL
                        ]);
                    else query("INSERT INTO fields (tableId, i, idColumn, type, value) VALUES(%i, %i, %i, 'value', '') ", [ $idTable, $idRow, (int)$row[0] ]);
                    $out[$row[0]] = ["id" => $mysqli->insert_id, "value" => ""];
                    $this->checkEvent($mysqli->insert_id); // Проверяем наличие события на заголовке
                }
            if($echo)
            {
                echo json_encode($out);
                $this->myLog->add("table", "update", $idTable);
            }
            else return $out;
        }
        function cutRow($idRow1, $idRow2, $prevOrNext) // Добавить строку в таблицу
        {
            global $mysqli;
            $idTable = $this->idTable; 
            $oldPrev1 = selectOne("SELECT id FROM line_ids WHERE next = %i", [ $idRow1 ]);
            $oldNext1 = selectOne("SELECT next FROM line_ids WHERE id = %i", [ $idRow1 ]);
            query("UPDATE line_ids SET next = %i WHERE id = %i", [ $oldNext1, $oldPrev1 ]);
            if($prevOrNext == -1)
            {
                $oldPrev2 = selectOne("SELECT id FROM line_ids WHERE next = %i", [ $idRow2 ]);
                query("UPDATE line_ids SET next = %i WHERE id = %i", [ $idRow1, $oldPrev2 ]);
                query("UPDATE line_ids SET next = %i WHERE id = %i", [ $idRow2, $idRow1 ]);
            }
            else
            {
                $oldNext2 = selectOne("SELECT next FROM line_ids WHERE id = %i", [ $idRow2 ]);
                query("UPDATE line_ids SET next = %i WHERE id = %i", [ $idRow1, $idRow2 ]);
                query("UPDATE line_ids SET next = %i WHERE id = %i", [ $oldNext2, $idRow1 ]);
            }

            $this->myLog->add("table", "update", $idTable);
        }
        function removeRow($idRow) // Удалить строку из таблицы
        {
            $idTable = $this->idTable; 
            $idNext =  -1;
            if($result = query("SELECT next FROM line_ids WHERE id = %i", [$idRow])) $idNext = $result->fetch_array(MYSQLI_NUM)[0];
            $idPrevRow = -1;
            if($result = query("SELECT id FROM line_ids WHERE next = %i", [$idRow])) $idPrevRow = $result->fetch_array(MYSQLI_NUM)[0];
            if($idNext == -1) query("UPDATE line_ids SET next = NULL WHERE id = %i", [$idPrevRow]); 
            else query("UPDATE line_ids SET next = %s WHERE id = %i", [$idNext, $idPrevRow]); 
            query("DELETE FROM line_ids WHERE id = %i", [ $idRow ]);
            query("DELETE FROM fields WHERE tableId = %i AND i = %i AND type != 'head'", [ $idTable, $idRow ]);
            $this->calculateStateForTable($idTable);
            $this->myLog->add("table", "update", $idTable);
        }
        function copyCell($idCellTo, $idTableTo, $idCellFrom, $idTableFrom, $operation, $typePaste, $echo) // Копировать ячейку
        {
            if($result = query("SELECT type, value, linkId, linkType, state FROM fields WHERE id = %i", [$idCellFrom])) 
                $valueData = $result->fetch_array(MYSQLI_NUM);
            if($operation == "copy") 
            {
                $out = ["id" => $idCellTo];
                $out["state"] = $valueData[4];
                if($typePaste == "cell")
                {
                    $value = getCellLink($idCellFrom, true);
                    if($value["linkType"] == "table") if((int)$value["tableId"] == (int)$idTableTo) { echo "ERROR"; return; }
                    $out["value"] = $value["value"];
                    $out["type"] = $typePaste;
                    $out["linkId"] = $idCellFrom;
                    query("UPDATE fields SET value = %s, linkId = %i, linkType = %s, type = 'link', state = %i WHERE id = %i", [ $value["value"], $idCellFrom, "cell", $valueData[4], $idCellTo ]);
                }
                else
                {
                    if($valueData[3] == "tlist")
                    {
                        $out["type"] = $valueData[3];
                        $out["linkId"] = (int)$valueData[2];
                        if($value = query("SELECT value, type, tableId FROM my_values WHERE id = %i", [ $out["linkId"] ]))
                        {
                            $_valueData = $value->fetch_array(MYSQLI_NUM);
                            $out["value"] = $valueData[1];
                            if($_valueData[1] == "tlist") $out["listValue"] = getTableListValueByKey((int)$out["value"], (int)$_valueData[2]);
                            else $out["value"] = $_valueData[0];

                        }
                    }
                    else
                    {
                        $value = getCellLink($idCellFrom, true);
                        $out["value"] = $value["value"];
                        if($valueData[3] == "cell") $out["linkId"] = $idCellFrom;
                        if($valueData[3] == "cell" || $valueData[3] == "file" || $valueData[3] == "table") $out["type"] = $valueData[3];
                        if($valueData[3] == "table") if((int)$value["tableId"] == (int)$idTableTo) { echo "ERROR"; return; } // Нельзя вставить ссылку в таблицу на себя
                    }
                    query("UPDATE fields SET type=%s, value=%s, linkId=%i, linkType=%s, state=%i WHERE id = %i", [ 
                        $valueData[0], $valueData[1], $valueData[2], $valueData[3], $valueData[4], $idCellTo ]);
                }
                if($echo) 
                {
                    echo json_encode($out);
                    $this->myLog->add("field", "update", $idCellTo); 
                }
                else $this->myLog->add("field", "script", $idCellTo); 
            }
            if($operation == "cut") 
            {
                if($valueData[3] == "table")
                    if((int)getCellLink($idCellFrom, true)["tableId"] == (int)$idTableTo) { echo "ERROR"; return; } // Нельзя вставить ссылку в таблицу на себя

                query("UPDATE fields SET type=%s, value=%s, linkId=%i, linkType=%s, state=%i WHERE id = %i", [ 
                    $valueData[0], $valueData[1], $valueData[2], $valueData[3], $valueData[4], $idCellTo ]);
                query("UPDATE fields SET type='value', value='', linkId=NULL, linkType=NULL, state=0 WHERE id = %i", [ $idCellFrom ]);
                if($echo)
                {
                    echo json_encode([ "idTableFrom" => $idTableFrom ]);
                    $this->myLog->add("field", "update", $idCellFrom); // изменение таблицы из которой вырезали
                }
                $this->calculateStateForTable($idTableFrom);
            }
            $this->calculateStateForTable($idTableTo);
        }
        function copy($idTableFrom, $link) // Копировать таблицу
        {
            global $mysqli;
            $idTable = $this->idTable;
            $idNewRow = -1;
            $newIdColumn = [];
            if($result = query("SELECT id, i, value, linkId, linkType, dataType, eventId FROM fields WHERE tableId = %i AND type = 'head'", [ $idTableFrom ])) // Копирование заголовка
                while ($row = $result->fetch_assoc())
                {
                    query("INSERT INTO fields (tableId, i, value, type, linkId, linkType, bindId, dataType, eventId) VALUES(%i, %i, %s, 'head', %i, %i, %i, %i, %i) ", [ 
                        $idTable, 
                        $row["i"], 
                        $row["value"], 
                        $row["linkId"], 
                        $row["linkType"], 
                        $link ? $row["id"] : NULL, 
                        $row["dataType"], 
                        $row["eventId"]
                    ]);
                    $newIdColumn[$row["id"]] = $mysqli->insert_id;
                }
        
            $data = [];
            if($result = query("SELECT i, fields.id, idColumn, next FROM fields LEFT JOIN line_ids ON line_ids.id = fields.i WHERE tableId = %i AND type != 'head'", [$idTableFrom]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $idColumn = $newIdColumn[$row[2]];
                    $data[(int)$row[0]][$idColumn] = (int)$row[1];
                    $data[(int)$row[0]]["__NEXT__"] = $row[3];
                }
            $l = count((array)$data); //Сортировка
            $outData = [];
            foreach($data as $key => $value) if($data[$key]["__NEXT__"] == null) break; //Находим null
            for($i = $l - 1; $i >= 0; $i--) // Тут сортировка по next
            {
                $outData[$i] = $data[$key];
                $outData[$i]["__ID__"] = $key;
                $key = $this->getNextI($data, $key);
            }
            for($i = 0; $i < $l; $i++)
            {
                $newRow = $this->addRow($idNewRow, 1, false);
                $idNewRow = $newRow["__ID__"];
                foreach($outData[$i] as $key => $value)
                    if($key != "__ID__" && $key != "__NEXT__")
                        $this->copyCell($newRow[$key]["id"], $idTable, $value, $idTableFrom, "copy", "value", false);
            }
            if($link) query("UPDATE structures SET bindId = %i WHERE id = %i", [ $idTableFrom, $idTable ]);
        }
        function setStateForField($idTable, $idField, $state) // Выставить статус у ячейки
        {
            query("UPDATE fields SET state = %i WHERE id = %i AND tableId = %i", [ (int)$state, (int)$idField, (int)$idTable ]);
            $this->myLog->add("field", "state", $idField);
            if($result = query("SELECT tableId, id FROM fields WHERE type = 'link' AND linkId = %i AND linkType = 'cell'", [ (int)$idField ]))
                while ($row = $result->fetch_array(MYSQLI_NUM))
                    $this->setStateForField($row[0], $row[1], $state);
            $idEvent = (int)selectOne("SELECT eventId FROM fields WHERE id = %i", [ (int)$idField ]);
            if(!is_null($idEvent))
            {
                $typeAndCode = query("SELECT type, code FROM events WHERE id = %i", [ $idEvent ])->fetch_array(MYSQLI_NUM);
                if($typeAndCode[0] == "state")
                {
                    require_once("FASM.php"); // класс для работы с событиями
                    $fasm = new FASM();
                    $fasm->start($typeAndCode[1], (int)$idField);
                }
            }
            $this->calculateStateForTable($idTable);
        }
        function calculateStateForTable($idTable) // Посчитать статус у таблицы
        {
            $state = 0;
            $parent = -1;
            if($result = query("SELECT avg(state) FROM fields WHERE tableId = %i AND type != 'head' AND state > 0", [ (int)$idTable ]))
                $state = (int)$result->fetch_array(MYSQLI_NUM)[0];
            query("UPDATE structures SET state = %i WHERE id = %i", [ $state, (int)$idTable ]);
            $this->myLog->add("table", "state", $idTable);
            if($result = query("SELECT tableId, id FROM fields WHERE type = 'link' AND linkId = %i AND linkType = 'table'", [ (int)$idTable ]))
                while ($row = $result->fetch_array(MYSQLI_NUM))
                    $this->setStateForField($row[0], $row[1], $state);
            if($result = query("SELECT parent FROM structures WHERE id = %i", [ (int)$idTable ])) $parent = (int)$result->fetch_array(MYSQLI_NUM)[0];
            $this->calculateStateForFolder($parent);
        }
        function calculateStateForFolder($parent) // Посчитать статус папки
        {
            $state = 0;
            if($result = query("SELECT avg(state) FROM structures WHERE parent = %i AND state > 0", [ $parent ]))
                $state = (int)$result->fetch_array(MYSQLI_NUM)[0];
            query("UPDATE structures SET state = %i WHERE id = %i", [ $state, $parent ]);
            if($result = query("SELECT parent FROM structures WHERE id = %i", [ $parent ]))
                while ($row = $result->fetch_array(MYSQLI_NUM))
                    $this->calculateStateForFolder((int)$row[0]);
        }
        function remove() // Удаление таблицы
        {
            $idTable = $this->idTable;
            if($result = query("SELECT DISTINCT i FROM fields WHERE tableId = %i AND type != 'head'", [ $idTable ]))
                while($row = $result->fetch_array(MYSQLI_NUM)) query("DELETE FROM line_ids WHERE id = %i", [ $row[0] ]);
            query("DELETE FROM fields WHERE tableId = %i", [ $idTable ]);
            query("UPDATE structures SET bindId = NULL WHERE bindId = %i AND objectType = 'table'", [ $idTable ]);
        }
        function getArrayTable() // Получить таблицу в виде массива
        {
            $myField = new MyField();
            $idTable = $this->idTable;
            $data = [];
            $outData = [[]]; // на выходе
            $headMap = [];
            if($result = query("SELECT name FROM structures WHERE id = %i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) $nameTable = $row[0];
            if($result = query("SELECT i, value, id FROM fields WHERE tableId = %i AND type = 'head' ORDER by i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $headMap[$row[2]] = $row[0];
                    $outData[0][(int)$row[0]] = [ "type" => "head", "value" => $row[1], "id" => (int)$row[2] ];
                }
            if($result = query("SELECT i, idColumn, value, type, linkId, linkType, fields.id, state, next FROM fields LEFT JOIN line_ids ON line_ids.id = fields.i WHERE tableId = %i AND type != 'head'", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $field = [ "id" => (int)$row[6], "value" => $row[2], "state" => $row[7], "tableId" => $idTable ];
                    if($row[3] == "link")
                    {
                        $field["linkId"] = (int)$row[4];
                        switch($row[5])
                        {
                            case "tlist": 
                            case "value": $myField->getValue($field); break;
                            case "file": $myField->getFile($field, $row[5]); break;
                            case "table": $myField->getTable($field, $row[5]); break;
                            case "cell": $myField->getCell($field); break;
                        }
                    }
                    $data[(int)$row[0]][(int)$headMap[$row[1]]] = $field;
                    $data[(int)$row[0]]["__NEXT__"] = $row[8];
                }
            $l = count($data);
            foreach($data as $key => $value) if(array_key_exists("__NEXT__", $value) && $value["__NEXT__"] == null) break; //Находим null
            for($i = $l - 1; $i >= 0; $i--) // Тут сортировка по next
            {
                $outData[$i + 1] = $data[$key];
                unset($outData[$i + 1]["__NEXT__"]);
                $key = $this->getNextI($data, $key);
            }
            $myArray = new MyArray($outData);
            for($i = 1; $i < count($myArray->myArray); $i++)
                for($j = 0; $j < count($myArray->myArray[$i]); $j++)
                {
                    if(!array_key_exists($j, $myArray->myArray[$i])) $myArray->myArray[$i][$j] = null;
                    if(!is_null($myArray->myArray[$i][$j]) && array_key_exists("type", $myArray->myArray[$i][$j]) && $myArray->myArray[$i][$j]["type"] == "table")
                    {
                        $myTable = new MyTable((int)$myArray->myArray[$i][$j]["linkId"], $this->myLog);
                        $myArray->insertArrayInField($i, $j, $myTable->getArrayTable());
                    }
                }
            return $myArray->myArray;
        }
        function getNextI($object, $next) { foreach($object as $key => $value) if($value["__NEXT__"] == $next) return $key; }
        function export()
        {
            require_once("WorkWithExcel.php");
            require_once("myField.php");
            $data = $this->getArrayTable();
            $out = [];
            $metaData = [];
            $i = 0;
            for($i = 0, $h = count($data); $i < $h; $i++)
            {
                $out[$i] = [];
                $metaData[$i] = [];
                for($j = 0, $c = count($data[$i]); $j < $c; $j++) 
                {
                    $out[$i][$j] = $data[$i][$j];
                    if(!is_null($data[$i][$j]))
                    {
                        $type = array_key_exists("type", $data[$i][$j]) ? $data[$i][$j]["type"] : "";
                        $out[$i][$j]["type"] = $type;
                        $metaData[$i][$j] = [ "id" => $data[$i][$j]["id"], "type" => $type ];
                        if(array_key_exists("tableId", $data[$i][$j])) $metaData[$i][$j]["tableId"]= $data[$i][$j]["tableId"];
                    }
                }
            }
            $excel = new WorkWithExcel();
            $excel->export($out, $metaData);
        }
        function import($name)
        {
            require_once("WorkWithExcel.php");
            $excel = new WorkWithExcel();
            $excel->import($name, $this);
        }
    }
?>