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
            $bindId = null;
            $listStickersId = "";
            if($result = query("SELECT name, bindId, state, objectType FROM structures WHERE id = %i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                { 
                    $nameTable = $row[0]; 
                    $bindId = $row[1]; 
                    $stateTable = (int)$row[2]; 
                    $objectType = $row[3]; 
                }
            if($result = query("SELECT i, id, value, eventId, dataType, user_property, variable FROM fields WHERE tableId = %i AND type = 'head' $filterColumn[0] ORDER by i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM))
                {
                    if($row[4]) $row[4] = selectOne("SELECT type FROM my_values WHERE id = %i", [(int)$row[4]]);
                    if($row[5])
                    {
                        $userProperty = json_decode($row[5]);
                        $width = NULL;
                        for($i = 0, $c = count($userProperty); $i < $c; $i++) // Ширина столбца
                            if($userProperty[$i]->name == "width")
                            {
                                $width = (int)$userProperty[$i]->value;
                                break;
                            }
                        $row[5] = $width;
                    }
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
            $queryStr = "SELECT i, idColumn, value, type, linkId, linkType, fields.id, state, eventId, color, dataType FROM fields WHERE tableId = %i AND type != 'head' $filterColumn[1] ";
            if($enableLines != "") $queryStr .= "AND i IN ($enableLines)";
            /* else if($filterStr == "") $queryStr .= "AND i IN (-1)"; */ // Если это оставить, то фильтр по умолчанию все скрывает
            else if($filterSelected == -1 || $filterStr == 'i IN (-1)') $queryStr .= "AND i IN (-1)";
            if($result = query($queryStr, [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $field = [ "id" => (int)$row[6], "value" => $row[2], "state" => $row[7], "eventId" => $row[8], "color" => $row[9], "dataType" => $row[10] ];
                    if($row[3] == "link")
                    {
                        $field["linkId"] = (int)$row[4];
                        switch($row[5])
                        {
                            case "tlist":
                                $field["type"] = $row[5];
                                break;
                            case "file":
                            case "table":
                            case "folder":
                                $field["type"] = $row[5];
                                if($row[5] == "table") $field["tableId"] = $field["linkId"];
                                break;
                            case "cell":
                                $field["type"] = "cell";
                                break;
                        }
                    }
                    if(!is_null(selectOne("SELECT id FROM stickers WHERE type = 'cell' AND trash = 0 AND objectId = %i", [ $field["id"] ])))
                        $listStickersId .= ($listStickersId == "" ? "" : ",").$field["id"];
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
            $stickers = []; // заметки
            if($listStickersId != "")
                if($result = query("SELECT * FROM stickers WHERE objectId IN ($listStickersId) AND type = 'cell' AND trash = 0", []))
                    while ($row = $result->fetch_assoc())
                        $stickers[] = $row;
            $userRowList = []; // Список строк, которые были добавлены пользователем из ячейки
            if($result = query("SELECT login, value FROM user_settings WHERE id = %s AND type = 'add_user_row'", [$idTable]))
                while ($row = $result->fetch_assoc())
                    $userRowList[$row["value"]] = $row["login"];
            echo json_encode([
                "head" => $head, 
                "data" => $outData2, 
                "tableIds" => $tableIds, 
                "name" => $nameTable, 
                "right" => $tableRight,
                "idLogTableOpen" => $this->myLog->add("table", "open", $idTable), 
                "changeHead" => $filterColumn[0] == "" && is_null($bindId) && $objectType != "plan", // Если столбцы скрыты фильтром ИЛИ таблица наследуется ИЛИ это редактор плана, то нельзя менять
                "state" => $stateTable,
                "filters" => $filters, // Список фильтров
                "filter" => $filterSelected,
                "stickers" => $stickers,
                "filterColumn" => $filterColumn,
                "userRowList" => $userRowList,
                "filterMain" => $filterStr == "",
                "enableLines" => $enableLines
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
            $newValue = $value;

            $oldValue = query("SELECT * FROM fields WHERE id = %i", [ $idField ])->fetch_assoc();
            if($typeField == "value")
                query("UPDATE fields SET value = %s, linkId = NULL, linkType = NULL, type = 'value' WHERE tableId = %i AND id = %i", [ 
                    $value, 
                    $idTable, // для подстраховки
                    $idField
                ]);
            if($typeField == "tlist")
            {
                query("UPDATE fields SET value = %s, linkId = %i, linkType = %s, type = 'link' WHERE tableId = %i AND id = %i", [ 
                    $value->value, 
                    $value->linkId, 
                    $value->type, 
                    $idTable, // для подстраховки
                    $idField
                ]);
                $newValue = $value->value;
            }
            updateCellByLink($idField, $newValue); // Выставляет новое значение у всех ячеек, которые ссылаются на текущую
            if($event) $this->checkEvent($idField);
            if($echo) 
            {
                echo json_encode([ "id" => $idField, "value" => $value ]);
                $this->myLog->add("field", "update", $idField, $oldValue); // Добавлен механизм сохранения значения
                $this->myLog->add("table", "update", $idTable);
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
                $row = $result->fetch_assoc();
                $linkType = $row["objectType"];
                $fieldState = 0;
                $dataType = null;
                if($linkType == "tlist")
                {
                    $fieldValue = "";
                    $dataType = (int)$row["objectId"]; // objectId
                }
                else 
                {
                    $fieldValue = $row["name"];
                    if($linkType == "table") 
                        $fieldState = (int)$row["state"];
                }
                $linkId = $linkType == "tlist" ? null : $idObject;
                $oldValue = query("SELECT * FROM fields WHERE id = %i", [ $idField ])->fetch_assoc();
                query("UPDATE fields SET value = %s, linkId = %i, linkType = %s, type = 'link', dataType = %i, state = %i WHERE tableId = %i AND id = %i", [ $fieldValue, $linkId, $linkType, $dataType, $fieldState, $idTable, $idField ]);
                echo json_encode([ 
                    "id" => $idField, 
                    "linkId" => $linkId, 
                    "type" => $linkType, 
                    "dataType" => $dataType,
                    "value" => $fieldValue, 
                    "state" => $fieldState 
                ]);
                $this->calculateStateForTable($idTable);
                $this->myLog->add("field", "update", $idField, $oldValue);
                $this->myLog->add("table", "update", $idTable);
            }
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
            if($result = query("SELECT id, value, dataType FROM fields WHERE tableId = %i AND type = 'head' ORDER by i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    if(!is_null($row[2]))
                        query("INSERT INTO fields (tableId, i, idColumn, type, value, dataType, linkType) VALUES(%i, %i, %i, %s, '', %i, %s) ", [ 
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
        function copyRow($idRowFrom, $idRowTo, $prevOrNext)
        {
            global $mysqli;
            $idTable = $this->idTable; 
            $dataRow = []; // Данные копируемой строки
            if($result = query("SELECT id, idColumn FROM fields WHERE i = %i", [ $idRowFrom ]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                    $dataRow[(int)$row[1]] = (int)$row[0];
            $newRow = $this->addRow($idRowTo, $prevOrNext, false);
            foreach($dataRow as $idColumn => $id)
                $this->copyCell($newRow[$idColumn]["id"], $idTable, $id, $idTable, "copy", "value", false);
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
            if((int)getCellLink($idCellFrom, true)["tableId"] == (int)$idTableTo) { echo "ERROR"; return; } // Нельзя вставить ссылку в таблицу на себя

            if($result = query("SELECT type, value, linkId, linkType, dataType, state FROM fields WHERE id = %i", [$idCellFrom])) 
                $valueData = $result->fetch_assoc();
            $oldValue = query("SELECT * FROM fields WHERE id = %i", [ $idCellTo ])->fetch_assoc();
            $oldValueFrom = query("SELECT * FROM fields WHERE id = %i", [ $idCellFrom ])->fetch_assoc();
            if($operation == "copy") 
            {
                $out = ["id" => $idCellTo];
                $out["state"] = $valueData["state"];
                $out["value"] = $valueData["value"];
                if($typePaste == "cell") // По ссылке
                {
                    $out["type"] = $typePaste;
                    $out["linkId"] = $idCellFrom;
                    query("UPDATE fields SET value = %s, linkId = %i, linkType = %s, type = 'link', state = %i WHERE id = %i", [ $out["value"], $idCellFrom, "cell", $out["state"], $idCellTo ]);
                    updateCellByLink($idCellTo, $out["value"]); // Выставляет новое значение у всех ячеек, которые ссылаются на текущую
                }
                else // По значению
                {
                    $out["type"] = $valueData["linkType"];
                    $out["linkId"] = (int)$valueData["linkId"];
                    if($valueData["linkType"] == "tlist")
                        $out["dataType"] = (int)$valueData["dataType"];
                    query("UPDATE fields SET type = %s, value = %s, linkId = %i, linkType = %s, dataType = %i, state = %i WHERE id = %i", [ 
                        $valueData["type"], $valueData["value"], $valueData["linkId"], $valueData["linkType"], $valueData["dataType"], $valueData["state"], $idCellTo ]);
                }
                if($echo) 
                {
                    echo json_encode($out);
                    $this->myLog->add("field", "update", $idCellTo, $oldValue); 
                }
                else $this->myLog->add("field", "script", $idCellTo, $oldValue); 
            }
            if($operation == "cut") 
            {
                /* if($valueData[3] == "table")
                    if((int)getCellLink($idCellFrom, true)["tableId"] == (int)$idTableTo) { echo "ERROR"; return; } // Нельзя вставить ссылку в таблицу на себя */

                query("UPDATE fields SET type = %s, value = %s, linkId = %i, linkType = %s, dataType = %i, state = %i WHERE id = %i", [ 
                    $valueData["type"], $valueData["value"], $valueData["linkId"], $valueData["linkType"], $valueData["dataType"], $valueData["state"], $idCellTo ]);
                query("UPDATE fields SET type = 'value', value = '', linkId = NULL, linkType = NULL, dataType = NULL, state = 0 WHERE id = %i", [ $idCellFrom ]);
                if($echo)
                {
                    echo json_encode([ "idTableFrom" => $idTableFrom ]);
                    $this->myLog->add("field", "update", $idCellTo, $oldValue); 
                    $this->myLog->add("field", "update", $idCellFrom, $oldValueFrom); // изменение таблицы из которой вырезали
                }
                $this->calculateStateForTable($idTableFrom);
            }
            $this->calculateStateForTable($idTableTo);
        }
        function copy($idTableFrom, $link) // Копировать таблицу
        {
            // Добавить проверку на наследование от наследуемой проверять bindId таблицы
            global $mysqli, $myLoading;
            $idTable = $this->idTable;
            $idNewRow = -1;
            $newIdColumn = [];
            if($result = query("SELECT id, i, value, linkId, linkType, dataType, eventId, variable FROM fields WHERE tableId = %i AND type = 'head'", [ $idTableFrom ])) // Копирование заголовка
                while ($row = $result->fetch_assoc())
                {
                    query("INSERT INTO fields (tableId, i, value, type, linkId, linkType, bindId, dataType, eventId, variable) VALUES(%i, %i, %s, 'head', %i, %i, %i, %i, %i, %s) ", [ 
                        $idTable, 
                        $row["i"], 
                        $row["value"], 
                        $row["linkId"], 
                        $row["linkType"], 
                        $link ? $row["id"] : NULL, 
                        $row["dataType"], 
                        $row["eventId"], 
                        $row["variable"]
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
            $load_update = true;
            if(isset($myLoading)) $myLoading->start($l);
            else $load_update = false;
            for($i = 0; $i < $l; $i++)
            {
                $newRow = $this->addRow($idNewRow, 1, false);
                $idNewRow = $newRow["__ID__"];
                foreach($outData[$i] as $key => $value)
                    if($key != "__ID__" && $key != "__NEXT__")
                        $this->copyCell($newRow[$key]["id"], $idTable, $value, $idTableFrom, "copy", "value", false);
                if($load_update) $myLoading->update();
            }
            if($link) query("UPDATE structures SET bindId = %i WHERE id = %i", [ $idTableFrom, $idTable ]);
        }
        function setStateForField($idTable, $idField, $state, $script = false) // Выставить статус у ячейки
        {
            query("UPDATE fields SET state = %i WHERE id = %i AND tableId = %i", [ (int)$state, (int)$idField, (int)$idTable ]);
            $this->myLog->add("field", "state", $idField);
            if($result = query("SELECT tableId, id FROM fields WHERE type = 'link' AND linkId = %i AND linkType = 'cell'", [ (int)$idField ]))
                while ($row = $result->fetch_array(MYSQLI_NUM))
                    $this->setStateForField($row[0], $row[1], $state);
            $idEvent = (int)selectOne("SELECT eventId FROM fields WHERE id = %i", [ (int)$idField ]);
            if(!is_null($idEvent) && !$script)
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
            if($result = query("SELECT avg(state) FROM fields WHERE tableId = %i AND type != 'head' AND state > 0", [ (int)$idTable ]))
                $state = (int)$result->fetch_array(MYSQLI_NUM)[0];
            query("UPDATE structures SET state = %i WHERE id = %i", [ $state, (int)$idTable ]);
            $this->myLog->add("table", "state", $idTable);
            if($result = query("SELECT tableId, id FROM fields WHERE type = 'link' AND linkId = %i AND linkType = 'table'", [ (int)$idTable ]))
                while ($row = $result->fetch_array(MYSQLI_NUM))
                    $this->setStateForField($row[0], $row[1], $state);
            $parentId = (int)selectOne("SELECT parent FROM structures WHERE id = %i", [ (int)$idTable ]);
            $objectType = selectOne("SELECT objectType FROM structures WHERE id = %i", [ $parentId ]);
            if($objectType == "folder") $this->calculateStateForFolder($parentId);
        }
        function calculateStateForFolder($parentId) // Посчитать статус папки
        {
            $state = 0;
            if($result = query("SELECT avg(state) FROM structures WHERE parent = %i AND state > 0", [ $parentId ]))
                $state = (int)$result->fetch_array(MYSQLI_NUM)[0];
            query("UPDATE structures SET state = %i WHERE id = %i", [ $state, $parentId ]);
            if($result = query("SELECT parent FROM structures WHERE id = %i", [ $parentId ]))
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
        function getHeadFromTable($filterColumn)
        {
            $idTable = $this->idTable;
            $outData = []; // на выходе
            if($result = query("SELECT i, value, id FROM fields WHERE tableId = %i AND type = 'head' $filterColumn[0] ORDER by i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                    $outData[/* (int)$row[0] */] = [ "type" => "head", "value" => $row[1], "id" => (int)$row[2] ];
            return $outData;
        }
        function getDataFromTable(&$dataLevelFail, $globalI, $globalJ, &$headLevelFail, $level) // Получить таблицу в виде массива, если в последней строке присутсвуют ссылки на таблицы, они раскрываются
        {
            require_once("myField.php");
            $myField = new MyField();
            $idTable = $this->idTable;
            $data = [];
            $outData = [[]]; // на выходе
            $headMap = [];

            require_once("myFilter.php");
            $myFilter = new MyFilter();
            $allFilters = $myFilter->getAllFilters($idTable);
            $filterStr = $allFilters["filterStr"];
            $filterColumn = $allFilters["filterColumn"];
            $filterSelected = $allFilters["filterSelected"];
            $enableLines = "";

            $headLevelFail[$level] = $this->getHeadFromTable($filterColumn);
            $i = 0; // Нельзя доверять нумерации в хаголовке, потому что столбцы могут быть скрыты
            if($result = query("SELECT i, value, id FROM fields WHERE tableId = %i AND type = 'head' $filterColumn[0] ORDER by i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                    $headMap[$row[2]] = $i++/* $row[0] */;
            /* Применить фильтр и узнать набор строк которые надо включить */
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
            $queryStr = "SELECT i, idColumn, value, type, linkId, linkType, fields.id, state FROM fields WHERE tableId = %i AND type != 'head' $filterColumn[1] ";
            if($enableLines != "") $queryStr .= "AND i IN ($enableLines)";
            else if($filterSelected == -1) $queryStr .= "AND i IN (-1)";

            if($result = query($queryStr, [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $field = [ "id" => (int)$row[6], "value" => $row[2], "state" => $row[7], "tableId" => $idTable ];
                    if($row[3] == "link")
                    {
                        $field["linkId"] = (int)$row[4];
                        switch($row[5])
                        {
                            case "folder": $myField->getFile($field, $row[5]); break;
                            case "file": $myField->getFile($field, $row[5]); break;
                            case "table": $myField->getTable($field, $row[5]); break;
                            case "tlist": 
                            case "cell": $myField->getCell($field); break;
                        }
                    }
                    $data[(int)$row[0]][(int)$headMap[$row[1]]] = $field;
                }
            $l = count($data);
            foreach($data as $key => $value) if(array_key_exists("__NEXT__", $value) && $value["__NEXT__"] == null) break; //Находим null
            for($i = $l - 1; $i >= 0; $i--) // Тут сортировка по next
            {
                // Так как столбцы могут отсутствовать, позицию надо высчитывать самостоятельно
                $outData[$i + 0] = [];
                foreach($data[$key] as $_key => $value) // Тут сортировка по next
                    if($_key !== "__NEXT__")
                        $outData[$i + 0][$_key] = $value;
                $key = $this->getNextI($data, $key);
            }
            $myTable = new MyTable(-1, $this->myLog);
            for($i = 0; $i < count($outData); $i++)
                for($j = 0; $j < count($outData[$i]); $j++)
                {
                    $dataLevelFail[$globalI + $i][$globalJ + $j] = $outData[$i][$j];
                    if($j == count($outData[$i]) - 1)
                        if(!is_null($outData[$i][$j]) && array_key_exists("type", $outData[$i][$j]) && $outData[$i][$j]["type"] == "table")
                        {
                            $myTable->idTable = (int)$outData[$i][$j]["linkId"];
                            $globalI = $myTable->getDataFromTable($dataLevelFail, $globalI + $i, $globalJ + $j, $headLevelFail, $level + 1);
                        }
                }
            return $globalI + $i - 1;
        }
        function getNextI($object, $next) { foreach($object as $key => $value) if($value["__NEXT__"] == $next) return $key; }
        function export()
        {
            require_once("WorkWithExcel.php");
            $headLevelFail = [];
            $data = [];
            $this->getDataFromTable($data, 0, 0, $headLevelFail, 0);
            $upHead = [];
            $head = [];
            $j = 0;
            $k = 0;
            $countHead = count($headLevelFail);
            if($countHead == 1) // Если один заголовок
                array_unshift($data, $headLevelFail[0]);
            else // Если сводная таблица
            {
                for($i = 0; $i < $countHead; $i++)
                {
                    for($j = 0, $c = count($headLevelFail[$i]); $j < $c; $j++)
                    {
                        if($j == 0 && !array_key_exists($k, $upHead) || $j > 0) $upHead[$k] = null;
                        if($j == $c - 1 && $i < $countHead - 1) $upHead[$k] = $headLevelFail[$i][$j];
                        $head[$k++] = $headLevelFail[$i][$j];
                    }
                    $k--;
                }
                array_unshift($data, $head);
                array_unshift($data, $upHead);
            }
            $out = [];
            $metaData = [];
            $i = 0;
            $lengthRow = count($data);
            $lengthColumn = count($data[0]);
            for($i = 0; $i < $lengthRow; $i++)
            {
                $out[$i] = [];
                $metaData[$i] = [];
                for($j = 0; $j < $lengthColumn; $j++) 
                {
                    if(!array_key_exists($j, $data[$i])) $data[$i][$j] = null;
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