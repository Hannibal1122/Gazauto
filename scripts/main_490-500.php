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
            echo json_encode($out);
            break;
        case 492: // Обновление структуры класса
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            query("UPDATE classes SET structure = %s WHERE id = %i", [ $param[1], $idElement ]);
            break;
        
        case 493: // Создание элемента в объекте класса
            $parent = (int)$param[0];
            $classId = (int)$param[1];
            $name = $param[2];
            $type = $param[3];
            if(($myRight->get($classId) & 1) != 1) return; // Права на просмотр
            if(($myRight->get($parent) & 8) != 8) return; // Права на изменение
            if(array_key_exists(4, $param))
            {
                $bindId = $param[4];
                $treeId = $param[5];
            }
            else
            {
                $structure = json_decode(selectOne("SELECT structure FROM classes WHERE id = %i", [ $classId ]));
                $bindId = $structure[0]->templateId;
                $treeId = $structure[0]->id;
            }
            require_once("copyAndRemove.php");
            $copyAndRemove = new CopyAndRemove(null, null, null, $myLog);
            $structures = new CopyAndRemove($bindId, $parent, "inherit", $myLog);
            $new_id = $structures->copy($name, 1);
            if($type == "class") query("UPDATE structures SET classId = %i WHERE id = %i", [ $classId, $new_id ]);
            query("INSERT INTO classes_bind (class_id, tree_id, structure_id) VALUES(%i, %i, %i)", [ $classId, $treeId, $new_id ]);
            echo $new_id;
            break;
        case 494: // Загрузка связей шаблона и таблиц
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
            $out = [];
            $list = [ $idElement ];
            getRemoveElementbyStructure($list, $idElement);
            for($i = 0, $c = count($list); $i < $c; $i++)
                if($result = query("SELECT class_id, tree_id, demand_id FROM classes_bind WHERE structure_id = %i", [ $list[$i] ]))
                    while ($row = $result->fetch_assoc()) 
                        $out[$list[$i]] = [
                            "classId" => $row["class_id"], // id класса
                            "treeId" => $row["tree_id"], // id внутри класса
                            "demandId" => $row["demand_id"], // id ячейки с требованием
                            "edited" => ($myRight->get($list[$i]) & 8) == 8
                        ];
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
        case 496: // Установка связи требования и элемента проекта
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            query("UPDATE classes_bind SET demand_id = %i WHERE structure_id = %i", [ $param[1], $idElement ]);
            break;
        case 497: // резерв
            break;
        case 498: // Запрос класса с подклассами
            $classId = (int)$param[0];
            $idElement = (int)$param[0];
            $out = [ "structures" => [] ];
            if($result = query("SELECT structure FROM classes WHERE id = %i", [ $classId ]))
            {
                $structure = json_decode($result->fetch_assoc()["structure"]);
                $out["structures"][$classId] = $structure;
                loadAllClass($out["structures"], $structure);
            }
            $out["name"] = selectOne("SELECT name FROM structures WHERE id = %i", $param);
            $out["readonly"] = ($myRight->get($idElement) & 8) != 8;
            // Поиск всех таблиц, которые находятся в той же дирректории
            echo json_encode($out);
            break;
    }
    function loadAllClass(&$out, $structure)
    {
        for($i = 0; $i < count($structure); $i++)
            if(property_exists($structure[$i], "templateType") && $structure[$i]->templateType == "class") 
            {
                $classId = $structure[$i]->templateId;
                $out[$classId] = json_decode(selectOne("SELECT structure FROM classes WHERE id = %i", [ $classId ]));
                loadAllClass($out, $out[$classId]);
            }
    }
?>