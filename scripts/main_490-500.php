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
            $idParent = selectOne("SELECT parent FROM structures WHERE id = %i", $param);
            /* $out["lib"] = [];
            getElementFromStructureByType($out["lib"], "table", $idParent); */
            echo json_encode($out);
            break;
        case 492: // Обновление структуры класса
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            query("UPDATE classes SET structure = %s WHERE id = %i", [ $param[1], $idElement ]);
            break;
        case 493: // Создание структуры на основе класса(должно удалять предыдущую структуру)
            $parent = (int)$param[3];
            if(($myRight->get($parent) & 8) != 8) return; // Права на изменение
            $structure = json_decode($param[0]);
            $template = json_decode($param[1]);
            $libraryId = (int)$param[2]; // Таблица с описаниями
            $bindId = (int)$param[4];
            $templateMap = [];
            for($i = 0, $c = count($template); $i < $c; $i++)
                $templateMap[$template[$i]->templateId] = $template[$i];
            require_once("myStructures.php");
            require_once("copyAndRemove.php");
            require_once("myTable.php");
            $myStructures = new MyStructures($myRight, $myLog);
            $tableIdByLevel = [];
            $lastRowByLevel = [];
            $myTable = new MyTable(-1, $myLog); // Общий класс для работы с таблицами
            for($i = 0, $c = count($structure); $i < $c; $i++)
            {
                if($i == 0)
                {
                    $tableIdByLevel[$structure[$i]->level] = $myStructures->create(["folder", NULL, $structure[0]->name, $parent, 0, ""], false);
                    query("UPDATE structures SET bindId = %i, class = 1 WHERE id = %i", [ $bindId, $tableIdByLevel[$structure[$i]->level] ]);
                }
                else
                {
                    if(!array_key_exists($structure[$i]->level, $tableIdByLevel))
                    {
                        $structures = new CopyAndRemove($structure[$i]->templateId, $tableIdByLevel[$structure[$i]->level - 1], "inherit", $myLog);
                        $tableIdByLevel[$structure[$i]->level] = $structures->copy($structure[$i]->name, 1);
                        // Добавить ссылку в родительскую таблицу
                        if($structure[$i]->level - 1 > 0)
                        {
                            $idColumn = $myStructures->getLastColumnByTable($tableIdByLevel[$structure[$i]->level - 1]);
                            $idRow = $lastRowByLevel[$structure[$i]->level - 1];
                            $myTable->idTable = $tableIdByLevel[$structure[$i]->level - 1];
                            $myTable->setCellByLink(
                                $tableIdByLevel[$structure[$i]->level], 
                                selectOne("SELECT id FROM fields WHERE idColumn = %i AND i = %i", [(int)$idColumn, (int)$idRow])
                            );
                        }
                    }
                    if($structure[$i]->last) continue;
                    $myTable->idTable = $tableIdByLevel[$structure[$i]->level]; // Последний созданный элемент
                    $row = $myTable->addRow(-1, -1, false);
                    $lastRowByLevel[$structure[$i]->level] = (int)$row["__ID__"];
                    $templateColumn = $templateMap[$structure[$i]->templateId]->templateColumn;
                    $idRowFromLibrary = (int)selectOne("SELECT i FROM fields WHERE id = %i", [$structure[$i]->fieldId]);
                    unset($tableIdByLevel[$structure[$i]->level + 1]);
                    for($j = 0, $c2 = count($templateColumn); $j < $c2; $j++) // Автозаполнение
                    {
                        if(property_exists($templateColumn[$j], "selectId"))
                        {
                            $idColumn = selectOne("SELECT id FROM fields WHERE tableId = %i AND bindId = %i", [$myTable->idTable, (int)$templateColumn[$j]->id]);
                            $idCellTo = selectOne("SELECT id FROM fields WHERE idColumn = %i AND i = %i", [$idColumn, $lastRowByLevel[$structure[$i]->level]]);
                            $idTableTo = $myTable->idTable;
                            $idCellFrom = selectOne("SELECT id FROM fields WHERE idColumn = %i AND i = %i", [(int)$templateColumn[$j]->selectId, $idRowFromLibrary]);
                            $idTableFrom = $libraryId;
                            $myTable->copyCell($idCellTo, $idTableTo, $idCellFrom, $idTableFrom, "copy", "cell", false);
                        }
                    }
                }
            }
            break;
        case 494: // Загрузка структуры по folderId
            $folderId = (int)$param[0];
            if(($myRight->get($folderId) & 1) != 1) return; // Права на просмотр
            break;
        case 495: // Загрузить колонки таблицы 
            $idTable = (int)$param[0];
            if(($myRight->get($idTable) & 1) != 1) return; // Права на просмотр
            request("SELECT id, value FROM fields WHERE tableId = %i AND type = 'head'", [ $idTable ]);
            break;
        case 496: // Загрузить значение типа 
            $idColumn = (int)$param[0];
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idColumn ]);
            if(($myRight->get($idTable) & 1) != 1) return; // Права на просмотр
            if($result = query("SELECT DISTINCT value FROM fields WHERE idColumn = %i AND value != ''", [ $idColumn ]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                    $out[] = $row[0];
            echo json_encode($out);
            break;
        case 497: // Загрузить библиотеку
            $idColumnName = (int)$param[0];
            $idColumnType = (int)$param[1];
            $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idColumnName ]);
            if(($myRight->get($idTable) & 1) != 1) return; // Права на просмотр
            $out = [];
            $out[$idColumnName] = [];
            $out[$idColumnType] = [];
            $i = 0;
            if($result = query("SELECT id, value, idColumn FROM fields WHERE (idColumn = %i OR idColumn = %i)", [ $idColumnName, $idColumnType ]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                    $out[$row[2]][] = [ "id" => $row[0], "name" => $row[1]];
            echo json_encode($out);
            break;
    }
?>