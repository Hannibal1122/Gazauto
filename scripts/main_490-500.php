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
            if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
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
            for($i = 0, $c = count($structure); $i < $c; $i++)
            {
                if($i == 0)
                {
                    $tableIdByLevel[$structure[$i]->level] = $myStructures->create(["folder", NULL, $structure[$i]->name, $parent, 0, ""], false);
                    query("UPDATE structures SET bindId = %i, class = 1 WHERE id = %i", [ $bindId, $tableIdByLevel[$structure[$i]->level] ]);
                    getItemById($saveTree, $structure[$i]->id)->globalId = $tableIdByLevel[$structure[$i]->level];
                }
                else
                {
                    if(!array_key_exists($structure[$i]->level, $tableIdByLevel))
                    {
                        $structures = new CopyAndRemove($structure[$i]->templateId, $tableIdByLevel[$structure[$i]->level - 1], "inherit", $myLog);
                        $tableIdByLevel[$structure[$i]->level] = $structures->copy($structure[$i]->name, 1);
                        $tree = getItemById($saveTree, $structure[$i]->id);
                        $tree->globalId = $tableIdByLevel[$structure[$i]->level];
                        // Добавить ссылку в родительскую таблицу
                        if($structure[$i]->level - 1 > 0)
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
                    }
                    /* if($structure[$i]->last) continue; */
                    $myTable->idTable = $tableIdByLevel[$structure[$i]->level]; // Последний созданный элемент
                    $row = $myTable->addRow(-1, -1, false);
                    $lastRowByLevel[$structure[$i]->level] = (int)$row["__ID__"];
                }
            }
            if($new) query("INSERT INTO classes_object (id, structure) VALUES(%i, %s)", [ $tableIdByLevel[0], json_encode($saveTree) ]);
            break;
        case 494: // Загрузка структуры по folderId
            $out = [];
            $folderId = (int)$param[0];
            if(($myRight->get($folderId) & 1) != 1) return; // Права на просмотр
            if($result = query("SELECT structure FROM classes_object WHERE id = %i", $param))
                $out = $result->fetch_assoc();
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