<?php
    class MyTable
    {
        function __construct($idTable)
        {
            $this->idTable = $idTable;
        }
        function getTable() // Запрос таблицы
        {
            $idTable = $this->idTable; 
            $nameTable = "";
            $timeOpen = "";
            $stateTable = 0;
            $head = [];
            $data = [];
            if($result = query("SELECT name, NOW(), bindId, state FROM structures WHERE id = %i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) { $nameTable = $row[0]; $timeOpen = $row[1]; $bindId = $row[2]; $stateTable = (int)$row[3]; }
            if($result = query("SELECT i, name_column FROM fields WHERE tableId = %i AND type = 'head' ORDER by i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                    $head[] = $row;
            if($result = query("SELECT i, name_column, value, type, linkId, linkType, fields.id, state, next, eventId FROM fields LEFT JOIN line_ids ON line_ids.id = fields.i WHERE tableId = %i AND type != 'head'", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $field = [ "id" => (int)$row[6], "value" => $row[2], "state" => $row[7], "eventId" => $row[9] ];
                    if($row[3] == "link")
                    {
                        $field["linkId"] = (int)$row[4];
                        switch($row[5])
                        {
                            case "value":
                                if($value = query("SELECT value, type FROM my_values WHERE id = %i", [ $field["linkId"] ]))
                                {
                                    $field["type"] = "value";
                                    $valueData = $value->fetch_array(MYSQLI_NUM);
                                    if($valueData[1] == "array") $field["listValue"] = getListValueByKey($field["linkId"], $field["value"]);
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
                    $data[(int)$row[0]]["__NEXT__"] = $row[8];
                }
            echo json_encode(["head" => $head, "data" => $data, "name" => $nameTable, "change" => (getRights($idTable) & 8) == 8, "time" => $timeOpen, "changeHead" => $bindId, "state" => $stateTable]);
            addLog("table", "open", $idTable);
        }
        function setAndRemoveHeader($data, $changes) // Добавить/Удалить заголовок
        {
            $idTable = $this->idTable;  /*  */
            $head = [];
            if($result = query("SELECT name_column FROM fields WHERE tableId = %i AND type = 'head'", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) $head[$row[0]] = "";
            for($i = 0, $c = count($data); $i < $c; $i++)
            {
                $name_column = $data[$i]->value;
                if(isset($data[$i]->oldValue)) // Изменить имя поле у всех ячеек
                    query("UPDATE fields SET name_column = %s WHERE name_column = %s AND (tableId = %i OR tableId IN (SELECT id FROM structures WHERE bindId = %i))", [ $name_column, $data[$i]->oldValue, $idTable, $idTable ]);
                else
                if(!array_key_exists($name_column, $head)) // Если это новый столбец, то создать по всем строкам
                {
                    if($resultMain = query("SELECT id FROM structures WHERE id = %i OR id IN (SELECT id FROM structures WHERE bindId = %i)", [ $idTable, $idTable ]))
                        while($rowMain = $resultMain->fetch_array(MYSQLI_NUM))
                        {
                            $idTableMain = $rowMain[0];
                            if($result = query("SELECT DISTINCT i FROM fields WHERE tableId = %i AND type != 'head'", [ $idTableMain ]))
                                while($row = $result->fetch_array(MYSQLI_NUM))
                                    query("INSERT INTO fields (tableId, i, name_column, type, value) VALUES(%i, %i, %s, %s, %s) ", [ $idTableMain, $row[0], $name_column, "value", "" ]);
                            query("INSERT INTO fields (tableId, i, name_column, type) VALUES(%i, %i, %s, %s) ", [ $idTableMain, $data[$i]->i, $name_column, "head" ]);
                        }
                }
                query("UPDATE fields SET i = %i WHERE name_column = %s AND (tableId = %i OR tableId IN (SELECT id FROM structures WHERE bindId = %i)) AND type = 'head'", [ $i, $name_column, $idTable, $idTable ]);
            }
            for($i = 0, $c = count($changes); $i < $c; $i++) // удаление ячеек и заголовка
                query("DELETE FROM fields WHERE (tableId = %i OR tableId IN (SELECT id FROM structures WHERE bindId = %i)) AND name_column = %s", [ $idTable, $idTable, $changes[$i] ]);
            addLog("table", "update", $idTable);
        }
        function setCell($data, $echo) // Изменить ячейки в таблице
        {
            $idTable = $this->idTable; 
            $value = $data->value;
            $idField = $data->id;

            $typeField = is_object($value) ? "link" : "value";
            if($typeField == "value")
                query("UPDATE fields SET value = %s, linkId = NULL, linkType = NULL, type = 'value', state = 0 WHERE tableId = %i AND id = %i", [ 
                    $value, 
                    $idTable, // для подстраховки
                    $idField
                ]);
            if($typeField == "link")
                query("UPDATE fields SET value = %s, linkId = %i, linkType = %s, type = 'link' WHERE tableId = %i AND id = %i", [ 
                    $value->value, 
                    $value->linkId, 
                    $value->type, 
                    $idTable, // для подстраховки
                    $idField
                ]);
            $idEvent = selectOne("SELECT eventId FROM fields WHERE id = %i", [ $idField ]);
            if(!is_null($idEvent))
            {
                require_once("FASM.php"); // класс для работы с событиями
                $fasm = new FASM();
                $fasm->start(selectOne("SELECT code FROM events WHERE id = %i", [ (int)$idEvent ]));
            }
            if($echo) echo json_encode([ "id" => $idField, "value" => $value ]);
            $this->calculateStateForTable($idTable);
            addLog("table", "update", $idTable);
        }
        function setCellByLink($idObject, $idFields) // Добавление элемента из левого меню в таблицу по ссылке
        {
            $idTable = $this->idTable; 
            if((int)$idTable == (int)$idObject) { echo "ERROR"; return; }
            if($result = query("SELECT name, objectType, objectId, state FROM structures WHERE id = %i", [ $idObject ]))
            {
                $row = $result->fetch_array(MYSQLI_NUM);
                $linkType = $row[1];
                $fieldList = null;
                $fieldState = 0;
                if($linkType == "value" && $value = query("SELECT id, value, type FROM my_values WHERE id = %i", [ (int)$row[2] ]))
                {
                    $valueData = $value->fetch_array(MYSQLI_NUM);
                    $fieldValue = $valueData[2] == "array" ? 0 : $valueData[1];
                    if($valueData[2] == "array") $fieldList = getListValueByKey((int)$row[2], $fieldValue);
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
                $linkId = $linkType != "value" ? $idObject : (int)$valueData[0];
                
                query("UPDATE fields SET value = %s, linkId = %i, linkType = %s, type = 'link', state = %i WHERE tableId = %i AND id = %i", [ 0, $linkId, $linkType, $fieldState, $idTable, $idFields ]);
                echo json_encode([ "id" => $idFields, "linkId" => $linkId, "type" => $linkType, "value" => $fieldValue, "state" => $fieldState, "listValue" => $fieldList ]);
            }
            addLog("table", "update", $idTable);
        }
        function setCellByValue($idObject, $idFields, $key) // Добавление элемента из левого меню в таблицу по значению
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
                            query("UPDATE fields SET value = %s, type = 'value', linkId = NULL, linkType = NULL WHERE tableId = %i AND id = %i", [ $fieldValue, $idTable, $idFields]);
                            echo json_encode([ "id" => $idFields, "value" => $fieldValue ]);
                        }
                        break;
                }
            }
            addLog("table", "update", $idTable);
        }
        function addRow($idPrevRow, $idNextRow, $echo) // Добавить строку в таблицу
        {
            global $mysqli;
            $idTable = $this->idTable; 
            $oldNext = "NULL";
            
            if($idPrevRow != -1) query("INSERT INTO line_ids(next) SELECT next FROM line_ids WHERE id = %i", [$idPrevRow]);
            else query("INSERT INTO line_ids (next) VALUES(NULL)", []);
            
            $idRow = $mysqli->insert_id;
            $out = ["__ID__" => $idRow];
            if($idPrevRow != -1) query("UPDATE line_ids SET next = %i WHERE id = %i", [$idRow, $idPrevRow]); 
            if($idNextRow != -1) query("UPDATE line_ids SET next = %i WHERE id = %i", [$idNextRow, $idRow]); 
            if($result = query("SELECT name_column FROM fields WHERE tableId = %i AND type = 'head'", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    query("INSERT INTO fields (tableId, i, name_column, type, value) VALUES(%i, %i, %s, %s, %s) ", [ $idTable, $idRow, $row[0], "value", "" ]);
                    $out[$row[0]] = ["id" => $mysqli->insert_id, "value" => ""];
                }
            if($echo)
            {
                echo json_encode($out);
                addLog("table", "update", $idTable);
            }
            else return $out;
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
            addLog("table", "update", $idTable);
        }
        function copyCell($idCellTo, $idTableTo, $idCellFrom, $idTableFrom, $operation, $typePaste, $echo) // Копировать ячейку
        {
            if($result = query("SELECT type, value, linkId, linkType, state, info FROM fields WHERE id = %i", [$idCellFrom])) 
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
                    query("UPDATE fields SET value = %s, linkId = %i, linkType = %s, type = 'link', state = %i WHERE id = %i", [ "", $idCellFrom, "cell", $valueData[4], $idCellTo ]);
                }
                else
                {
                    if($valueData[3] == "value")
                    {
                        $out["type"] = $valueData[3];
                        $out["linkId"] = (int)$valueData[2];
                        if($value = query("SELECT value, type FROM my_values WHERE id = %i", [ $out["linkId"] ]))
                        {
                            $_valueData = $value->fetch_array(MYSQLI_NUM);
                            $out["value"] = $_valueData[1] == "array" ? 0 : $_valueData[0];
                            if($_valueData[1] == "array") $out["listValue"] = getListValueByKey($out["linkId"], $out["value"]);
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
                    
                    query("UPDATE fields SET type=%s, value=%s, linkId=%i, linkType=%s, state=%i, info=%s WHERE id = %i", [ 
                        $valueData[0], $valueData[1], $valueData[2], $valueData[3], $valueData[4], $valueData[5], $idCellTo ]);
                }
                if($echo) echo json_encode($out);
                addLog("table", "update", $idTableTo); // изменение основной таблицы
            }
            if($operation == "cut") 
            {
                if($valueData[3] == "table")
                    if((int)getCellLink($idCellFrom, true)["tableId"] == (int)$idTableTo) { echo "ERROR"; return; } // Нельзя вставить ссылку в таблицу на себя

                query("UPDATE fields SET type=%s, value=%s, linkId=%i, linkType=%s, state=%i, info=%s WHERE id = %i", [ 
                    $valueData[0], $valueData[1], $valueData[2], $valueData[3], $valueData[4], $valueData[5], $idCellTo ]);
                query("UPDATE fields SET type='value', value='', linkId=NULL, linkType=NULL, state=0, info=NULL WHERE id = %i", [ $idCellFrom ]);
                if($echo)
                {
                    echo json_encode([ "idTableFrom" => $idTableFrom ]);
                    addLog("table", "update", $idTableFrom); // изменение таблицы из которой вырезали
                }
                $this->calculateStateForTable($idTableFrom);
            }
            $this->calculateStateForTable($idTableTo);
        }
        function copyTable($idTableFrom, $link) // Копировать таблицу
        {
            global $mysqli;
            $idTable = $this->idTable;
            $idNewRow = -1;
            $addI = [];
            if($result = query("SELECT i, name_column FROM fields WHERE tableId = %i AND type = 'head'", [ $idTableFrom ])) // Копирование заголовка
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                    query("INSERT INTO fields (tableId, i, name_column, type) VALUES(%i, %i, %s, 'head') ", [ $idTable, $row[0], $row[1] ]);
            if($result = query("SELECT i, id, name_column FROM fields WHERE tableId = %i AND type != 'head' ORDER BY i", [ $idTableFrom ]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    if(!in_array($row[0], $addI))
                    {
                        $newRow = $this->addRow($idNewRow, -1, false);
                        $idNewRow = $newRow["__ID__"];
                        $addI[] = $row[0];
                    }
                    $this->copyCell($newRow[$row[2]]["id"], $idTable, $row[1], $idTableFrom, "copy", "value", false);
                }
            if($link) query("UPDATE structures SET bindId = %i WHERE id = %i", [ $idTableFrom, $idTable ]);
        }
        function setStateForField($idTable, $idField, $state) // Выставить статус у ячейки
        {
            query("UPDATE fields SET state = %i WHERE id = %i AND tableId = %i", [ (int)$state, (int)$idField, (int)$idTable ]);
            if($result = query("SELECT tableId, id FROM fields WHERE type = 'link' AND linkId = %i AND linkType = 'cell'", [ (int)$idField ]))
                while ($row = $result->fetch_array(MYSQLI_NUM))
                    $this->setStateForField($row[0], $row[1], $state);
            $this->calculateStateForTable($idTable);
        }
        function calculateStateForTable($idTable) // Посчитать статус у таблицы
        {
            $state = 0;
            $parent = -1;
            if($result = query("SELECT avg(state) FROM fields WHERE tableId = %i AND type != 'head' AND state > 0", [ (int)$idTable ]))
                $state = (int)$result->fetch_array(MYSQLI_NUM)[0];
            query("UPDATE structures SET state = %i WHERE id = %i", [ $state, (int)$idTable ]);
            addLog("table", "updateState", $idTable);
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
            if($result = query("SELECT i, name_column FROM fields WHERE tableId = %i AND type = 'head' ORDER by i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $headMap[$row[1]] = $row[0];
                    $outData[0][(int)$row[0]] = $row[1];
                }
            if($result = query("SELECT i, name_column, value, type, linkId, linkType, fields.id, state, next FROM fields LEFT JOIN line_ids ON line_ids.id = fields.i WHERE tableId = %i AND type != 'head'", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $field = [ "id" => (int)$row[6], "value" => $row[2], "state" => $row[7] ];
                    if($row[3] == "link")
                    {
                        $field["linkId"] = (int)$row[4];
                        switch($row[5])
                        {
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
                $outData[$i] = $data[$key];
                unset($outData[$i]["__NEXT__"]);
                $key = $this->getNextI($data, $key);
            }
            $myArray = new MyArray($outData);
            for($i = 0; $i < count($myArray->myArray); $i++)
                for($j = 0; $j < count($myArray->myArray[$i]); $j++)
                    if(!is_null($myArray->myArray[$i][$j]) && array_key_exists("type", $myArray->myArray[$i][$j]) && $myArray->myArray[$i][$j]["type"] == "table")
                    {
                        $myTable = new MyTable((int)$myArray->myArray[$i][$j]["linkId"]);
                        $myArray->insertArrayInField($i, $j, $myTable->getArrayTable());
                    }
            return $myArray->myArray;
        }
        function getNextI($object, $next) { foreach($object as $key => $value) if($value["__NEXT__"] == $next) return $key; }
        function export()
        {
            require_once("exportToExcel.php");
            require_once("myField.php");
            $data = $this->getArrayTable();
            $out = [];
            $i = 0;
            for($i = 0, $w = count($data); $i < $w; $i++)
            {
                $out[$i] = [];
                for($j = 0, $c = count($data[$i]); $j < $c; $j++) $out[$i][$j] = $data[$i][$j];
            }
            $excel = new ExportToExcel();
            $excel->export($out);
        }
    }
    class Structures
    {
        function __construct($idElement, $idParent, $typeOperation)
        {
            $this->idElement = $idElement;
            $this->idParent = $idParent;
            $this->typeOperation = $typeOperation;
        }
        function copy() // Скопировать элемент структуры, по типам
        {
            global $login, $mysqli;
            $idElement = $this->idElement;
            $idParent = $this->idParent;
            $elem = [];
            if($result = query("SELECT objectType, objectId, name, parent, priority, info, bindId FROM structures WHERE id = %i", [$idElement]))
                $elem = $result->fetch_array(MYSQLI_NUM);
            if($this->typeOperation == "inherit" && $elem[6] != null) return; // Нельзя наследовать от наследуемой
            $elem[3] = $idParent;// parent
            query("INSERT INTO structures (objectType, objectId, name, parent, priority, info, bindId) VALUES(%s, %i, %s, %i, %i, %s, %i)", $elem);
            $idNewElement = $mysqli->insert_id;
            if($login != "admin")
                query("INSERT INTO rights (objectId, type, login, rights) VALUES(%s, %i, %s, %s, %i) ", [ $idNewElement, "user", $login, 255 ]);
            switch($elem[0])
            {
                case "table": $this->copyTable($idNewElement); break;
                case "file": $this->copyFile($idNewElement, $elem[2]); break;
                case "value": $this->copyValue($idNewElement, $elem[1]); break;
                case "folder": $this->copyFolder($idNewElement); break;
                case "event": $this->copyEvent($idNewElement); break;
            }    
        }
        function copyTable($idNewElement) // Скопировать таблицу
        {
            $idElement = $this->idElement;
            $myTable = new MyTable($idNewElement);
            $myTable->copyTable($idElement, $this->typeOperation == "inherit");
        }
        function copyFile($idNewElement, $name) // Скопировать файл
        {
            $idElement = $this->idElement;
            if (!file_exists("../files/$idNewElement")) mkdir("../files/$idNewElement", 0700);
            copy("../files/$idElement/".$name, "../files/$idNewElement/".$name);
        }
        function copyValue($idNewElement, $objectId) // Скопировать значение
        {
            global $mysqli;
            $value = [];
            if($result = query("SELECT type, value FROM my_values WHERE id = %i", [ (int)$objectId ]))
                $value = $result->fetch_array(MYSQLI_NUM);
            query("INSERT INTO my_values (type, value) VALUES(%s, %s)", [ $value[0], $value[1] ]);
            $idValue = $mysqli->insert_id;
            query("UPDATE structures SET objectId = %i WHERE id = %i", [$idValue, $idNewElement]);
        }
        function copyFolder($idNewElement) // Скопировать папку
        {
            $idElement = $this->idElement;
            $typeOperation = $this->typeOperation;
            if($result = query("SELECT id FROM structures WHERE parent = %i", [$idElement]))
                while($row = $result->fetch_array(MYSQLI_NUM))
                {
                    $structures = new Structures((int)$row[0], $idNewElement, $typeOperation);
                    $structures->copy();
                }
        }
        function copyEvent($idNewElement) // Скопировать событие
        {
            $idElement = $this->idElement;
            $typeOperation = $this->typeOperation;
            if($result = query("SELECT type, param, date, code FROM events WHERE id = %i", [ $idElement ]))
                while($row = $result->fetch_array(MYSQLI_NUM))
                    query("INSERT INTO events (id, type, param, date, code) VALUES(%i, %s, %s, %s, %s)", [ (int)$idNewElement, $row[0], $row[1], $row[2], $row[3] ]);
        }
        function remove($idElement) // Удалить элемент структуры, по типам
        {
            $element = query("SELECT objectType, name, objectId FROM structures WHERE id = %i", [ $idElement ])->fetch_array(MYSQLI_NUM);
            if($idElement < 6) return;
            switch($element[0])
            {
                case "role": query("DELETE FROM roles WHERE role = %s", [ $element[1] ]); break;
                case "user": 
                    if($element[1] == "admin") return;
                    query("DELETE FROM registration WHERE login = %s", [ $element[1] ]);
                    query("DELETE FROM password WHERE login = %s", [ $element[1] ]);
                    addLog("user", "remove", json_encode([ $element[1] ]));
                    break;
                case "folder": break;
                case "table":
                    $myTable = new MyTable($idElement);
                    $myTable->remove();
                    addLog("table", "remove", $idElement);
                    break;
                case "file":
                    unlink("../files/$idElement/".scandir("../files/$idElement")[2]); 
                    rmdir("../files/$idElement"); 
                    break;
                case "value":
                    query("DELETE FROM my_values WHERE id = %i", [ (int)$element[2] ]);
                    query("DELETE FROM structures WHERE id = %i", [ $idElement ]);
                    query("DELETE FROM my_list WHERE value_id = %i", [ (int)$element[2] ]);
                    break;
                case "event":
                    query("DELETE FROM events WHERE id = %i", [ (int)$idElement ]);
                    break;
            }
            query("DELETE FROM structures WHERE id = %i", [ (int)$idElement ]);
            query("DELETE FROM rights WHERE objectId = %i", [ (int)$idElement ]);
            addLog("structure", "remove", $idElement);
        }
    }
?>