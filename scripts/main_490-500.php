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
                for($j = 0, $c2 = count($out); $j < $c2; $j++)
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
                    $structures = new CopyAndRemove($structure[$i]->templateId, $parent, "inherit", $myLog);
                    $tableIdByLevel[$structure[$i]->level] = $structures->copy($structure[$i]->name, 1);
                    query("UPDATE structures SET classId = %i WHERE id = %i", [ $bindId, $tableIdByLevel[$structure[$i]->level] ]);
                    $tree = getItemById($saveTree, $structure[$i]->id);
                    $tree->globalId = $tableIdByLevel[$structure[$i]->level];
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
            // Конвертация экономии места, они выставятся при загрузке
            for($i = 0, $c = count($saveTree); $i < $c; $i++)
            {
                unset($saveTree[$i]->name);
                unset($saveTree[$i]->state);
                unset($saveTree[$i]->edited);
                $saveTree[$i]->tId = $saveTree[$i]->templateId;
                $saveTree[$i]->tPId = $saveTree[$i]->templateParentId;
                $saveTree[$i]->tTId = $saveTree[$i]->templateTreeId;
                unset($saveTree[$i]->templateId);
                unset($saveTree[$i]->templateParentId);
                unset($saveTree[$i]->templateTreeId);
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
                if(is_null($out["structure"])) break;
                foreach($out["structure"] as $value)
                {
                    $value->name = selectOne("SELECT name FROM structures WHERE id = %i", [ $value->globalId ]);
                    $value->state = selectOne("SELECT state FROM structures WHERE id = %i", [ $value->globalId ]);
                    $value->edited = ($myRight->get($value->globalId) & 8) == 8;

                    if(property_exists($value, "tId")) $value->templateId = $value->tId; // Для поддержки старых версий
                    if(property_exists($value, "tPId")) $value->templateParentId = $value->tPId;
                    if(property_exists($value, "tTId")) $value->templateTreeId = $value->tTId;
                    unset($value->tId);
                    unset($value->tPId);
                    unset($value->tTId);
                }
            }
            echo json_encode($out);
            break;
        case 495: // Вырезать элемент
            $idElement = (int)$param[0];
            $idParentTo = (int)$param[1];
            if(($myRight->get($idElement) & 8) != 8) continue; // Права на изменение
            if(($myRight->get($idParentTo) & 8) != 8) continue; // Права на изменение

            // Проверка на ошибки
            $out = [$idElement]; 
            $errors = [];
            getRemoveElementbyStructure($out, $idElement);
            for($i = 0, $c = count($out); $i < $c; $i++)
            {
                $elementData = query("SELECT parent FROM structures WHERE id = %i", [ $out[$i] ])->fetch_assoc();
                if($out[$i] == $idParentTo) $errors[] = "ERROR_IN_ITSELF"; //Проверка на добавление папки саму в себя
            }
            if(count($errors) > 0) 
            {
                echo json_encode($errors);
                return;
            }
            query("UPDATE structures SET parent = %i WHERE id = %i", [$idParentTo, $idElement]);
            $myLog->add("structure", "cut", $idElement);
            break;
        case 496: // Сохранение новой структуры
            $folderId = (int)$param[0];
            if(($myRight->get($folderId) & 8) != 8) return; // Права на изменение
            $saveTree = $param[1];
            query("UPDATE classes_object SET structure = %s WHERE id = %i", [ $saveTree, $folderId ]);
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