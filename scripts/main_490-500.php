<?php
    switch($nQuery)
    {
        case 490: // Создать пустой класс
            $idParent = (int)$param[0];
            if(($myRight->get($idParent) & 8) != 8) return; // Права на изменение
            $idElement = (int)$param[1];
            query("INSERT INTO classes (id, structure) VALUES(%i, %s)", [ $idElement, "" ]);
            break;
        case 491: // Запрос класса
            $idElement = (int)$param[0];
            // Не можем проверять, потому что класс требуется и в объектах
            //if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
            $out = [];
            if($result = query("SELECT structure FROM classes WHERE id = %i", $param))
                $out = $result->fetch_assoc();
            $out["name"] = selectOne("SELECT name FROM structures WHERE id = %i", $param);
            $out["readonly"] = ($myRight->get($idElement) & 8) != 8;
            // Поиск всех таблиц, которые находятся в той же дирректории
            /* $idParent = selectOne("SELECT parent FROM structures WHERE id = %i", $param);
            $out["lib"] = [];
            getElementFromStructureByType($out["lib"], "table", $idParent); */
            echo json_encode($out);
            break;
        case 492: // Обновление структуры класса
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            query("UPDATE classes SET structure = %s WHERE id = %i", [ $param[1], $idElement ]);
            break;
        case 493: // Создание структуры на основе класса(должно удалять предыдущую структуру)
            $parent = (int)$param[2];
            if(($myRight->get($parent) & 8) != 8) return; // Права на изменение
            $structure = json_decode($param[0]);
            $saveTree = json_decode($param[1]);
            $bindId = (int)$param[3];
            $new = $param[4] == "false" ? false : true;
            $removeItems = $param[5];
            require_once("myStructures.php");
            require_once("copyAndRemove.php");
            require_once("myTable.php");
            $myStructures = new MyStructures($myRight, $myLog);
            $tableIdByLevel = [];
            $lastRowByLevel = [];
            $myTable = new MyTable(-1, $myLog); // Общий класс для работы с таблицами
            function getItemById(&$saveTree, $id)
            {
                for($i = 0, $c = count($saveTree); $i < $c; $i++)
                    if($saveTree[$i]->id == $id) return $saveTree[$i];
            }

            // TODO Добавить права
            // Удаление из структуры
            $copyAndRemove = new CopyAndRemove(null, null, null, $myLog);
            for($i = 0, $c = count($removeItems); $i < $c; $i++)
            {
                $out = [ $removeItems[$i] ];
                getRemoveElementbyStructure($out, $removeItems[$i]);
                for($j = 0, $c = count($out); $j < $c; $j++)
                {
                    if(($myRight->get($out[$j]) & 8) != 8) continue; // Права на изменение
                    $copyAndRemove->remove($out[$j]);
                }
            }
            // Создание структуры
            for($i = 0, $c = count($structure); $i < $c; $i++)
            {
                if($i == 0)
                {
                    if(property_exists($structure[$i], "globalId")) 
                    {
                        $tableIdByLevel[$structure[$i]->level] = $structure[$i]->globalId;
                        continue;
                    }
                    $tableIdByLevel[$structure[$i]->level] = $myStructures->create(["folder", null, $structure[$i]->name, $parent, 0, ""], false);
                    // tableIdByLevel - Содержится id последнего элемента на уровне в цикле
                    query("UPDATE structures SET bindId = %i, class = 1 WHERE id = %i", [ $bindId, $tableIdByLevel[$structure[$i]->level] ]);
                    getItemById($saveTree, $structure[$i]->id)->globalId = $tableIdByLevel[$structure[$i]->level];
                }
                else
                {
                    /* if(!array_key_exists($structure[$i]->level, $tableIdByLevel)) // Дает возможность объеденять таблицы в строки (Плата-Модуль-Канал)
                    { */
                    if(property_exists($structure[$i], "globalId")) 
                        $tableIdByLevel[$structure[$i]->level] = $structure[$i]->globalId;
                    else
                    {
                        $structures = new CopyAndRemove($structure[$i]->templateId, $tableIdByLevel[$structure[$i]->level - 1], "inherit", $myLog);
                        $tableIdByLevel[$structure[$i]->level] = $structures->copy($structure[$i]->name, 1);
                        $tree = getItemById($saveTree, $structure[$i]->id);
                        $tree->globalId = $tableIdByLevel[$structure[$i]->level];
                    }
                    continue; // Дает возможность объеденять таблицы в строки (Плата-Модуль-Канал)
                    // Добавить ссылку в родительскую таблицу
                    if($structure[$i]->level - 1 > 0) // Начинается со второго уровня
                    {
                        $idColumn = $myStructures->getLastColumnByTable($tableIdByLevel[$structure[$i]->level - 1]);
                        $idRow = $lastRowByLevel[$structure[$i]->level - 1];
                        $tree->rowId = $idRow; // Нужно сохранять для удаления

                        $myTable->idTable = $tableIdByLevel[$structure[$i]->level - 1];
                        $myTable->setCellByLink(
                            $tableIdByLevel[$structure[$i]->level], 
                            selectOne("SELECT id FROM fields WHERE idColumn = %i AND i = %i", [(int)$idColumn, (int)$idRow])
                        );
                    }
                    /* } */
                    if($structure[$i]->last) continue; // Последний не добавляем
                    if(property_exists($structure[$i], "rowId")) 
                    {
                        $lastRowByLevel[$structure[$i]->level] = $structure[$i]->rowId;
                        continue;
                    }
                    $myTable->idTable = $tableIdByLevel[$structure[$i]->level]; // Последний созданный элемент
                    $row = $myTable->addRow(-1, -1, false);
                    $lastRowByLevel[$structure[$i]->level] = (int)$row["__ID__"];
                }
            }
            if($new) query("INSERT INTO classes_object (id, structure) VALUES(%i, %s)", [ $tableIdByLevel[0], json_encode($saveTree) ]);
            else query("UPDATE classes_object SET structure = %s WHERE id = %i", [ json_encode($saveTree), $tableIdByLevel[0] ]);
            break;
        case 494: // Загрузка структуры по folderId
            $out = [ "structure" => [] ];
            $folderId = (int)$param[0];
            if(($myRight->get($folderId) & 1) != 1) return; // Права на просмотр
            if($result = query("SELECT structure FROM classes_object WHERE id = %i", $param))
            {
                $out["structure"] = json_decode($result->fetch_assoc()["structure"]);
                foreach($out["structure"] as $value)
                {
                    $value->name = selectOne("SELECT name FROM structures WHERE id = %i", [ $value->globalId ]);
                    $value->state = selectOne("SELECT state FROM structures WHERE id = %i", [ $value->globalId ]);
                    $value->edited = ($myRight->get($value->globalId) & 8) == 8;
                }
            }
            echo json_encode($out);
            break;
        case 495: // резерв
            /* $idTable = (int)$param[0];
            if(($myRight->get($idTable) & 1) != 1) return; // Права на просмотр
            request("SELECT id, value FROM fields WHERE tableId = %i AND type = 'head'", [ $idTable ]); */
            break;
        case 496: // резерв
            break;
        case 497: // Загрузить имена по id списком
            $listId = $param[0];
            $outList = [];
            for($i = 1, $c = count($listId); $i < $c; $i++)
            {
                $outList[$listId[$i]["templateId"]] = selectOne("SELECT name FROM structures WHERE id = %i", [ $listId[$i]["templateId"] ]);
            }
            echo json_encode($outList);
            break;
    }
?>