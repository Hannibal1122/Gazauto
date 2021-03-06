<?php
    require_once("myStructures.php");
    $myStructures = new MyStructures($myRight, $myLog);
    switch($nQuery)
    {
        case 100: // Создать элемент структуры 
            if(($myRight->get($param[3]) & 8) != 8) return; // Права на изменение
            if($param[0] == "filter") if(($myRight->get($param[3]) & 32) != 32) return; // Права на создание фильтра
            $myStructures->create($param);
            break;
        case 108: // Установка filterId для tlist
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            $objectId = query("SELECT objectId FROM structures WHERE id = %i", [ $idElement ])->fetch_assoc()["objectId"];
            query("UPDATE my_values SET filterId = %i WHERE id = %i", [ $param[1], $objectId ]);
            break;
        case 109: // Загрузка всех удаленных элементов
            $out = ["folder" => []];
            $query = "SELECT id, objectType, objectId, name, parent, priority, info, bindId, state, icon FROM structures WHERE trash = 1";
            if($login == "admin") $query .= " ORDER by parent, priority";
            else $query .= " AND id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                    AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0)) ORDER by parent, priority";
            if($result = query($query, $login == "admin" ? [ ] : [ $login, $role, $login ]))
                while ($row = $result->fetch_assoc()) 
                    $out["folder"][] = getObjectFromStructures($row);
            echo json_encode($out);
            break;
        case 110: // Загрузка структуры // Права на просмотр
            $idParent = (int)$param[0];
            $out = ["folder" => [], "path" => [], "stickers" => []];
            $filterStr = "";
            $filter = selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [ $login, "filter_global" ]);
            if(!is_null($filter) && $filter != "") 
            {
                $filter = json_decode($filter);
                require_once("myFilter.php");
                $filterClass = new MyFilter();
                $filterStr = $filterClass->getFilterStrByFolder($filter->id, $idParent);
                if($filterStr != "") $filterStr = " AND ($filterStr)";
            };
            $listId = "";
            $query = "SELECT id, objectType, objectId, name, parent, priority, info, bindId, state, icon, classId FROM structures WHERE parent = %i AND trash = 0 $filterStr";
            if($login == "admin") $query .= " ORDER by parent, priority";
            else $query .= " AND
                id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                    AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0)) ORDER by parent, priority";

            require_once("myFile.php");
            $myFile = new MyFile();
            if($result = query($query, $login == "admin" ? [ $idParent ] : [ $idParent, $login, $role, $login ]))
                while ($row = $result->fetch_assoc())
                {
                    $elem = getObjectFromStructures($row);
                    if($elem["objectType"] == "file" && $elem["fileType"] == "img") $myFile->setField($elem, $elem["id"]);
                    $out["folder"][] = $elem;
                    $listId .= ($listId == "" ? "" : ",").$row["id"];
                }
            if($listId != "")
                if($result = query("SELECT * FROM stickers WHERE objectId IN ($listId) AND type != 'cell' AND trash = 0", []))
                    while ($row = $result->fetch_assoc())
                        $out["stickers"][] = $row;
            getFullPath($out["path"], $param[0]);
            echo json_encode($out);
            $myLog->add("structure", "open", $idParent);
            break;
        case 111: // Получение родителя
            $typeElement = $param[0];
            $idElement = (int)$param[1];
            $result;
            switch($typeElement)
            {
                case "role":
                case "user":
                case "folder":
                case "table":
                case "file":
                case "event":
                case "plan":
                case "class":
                case "filter":
                case "label":
                    $result = query("SELECT parent FROM structures WHERE id = %i", [$idElement]);
                    break;
                case "tlist":
                    $result = query("SELECT parent, id FROM structures WHERE objectType = %s AND objectId = %i", [$typeElement, $idElement]);
                    break;
                case "cell":
                    $result = query("SELECT tableId FROM fields WHERE id = %i ", [$idElement]);
                    break;
            }
            if($result) echo json_encode($result->fetch_assoc());
            break;
        case 112: // Удаление элемента структуры // Права на изменение
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            query("UPDATE structures SET trash = 1 WHERE id = %i", [$idElement]);
            $myLog->add("structure", "remove", $idElement);
            break;
        case 113: // Загрузка структуры без выпрямления
            $out = [];
            $operand = [];
            $filterStr ="";
            $filter = selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [ $login, "filter_global" ]);
            if(!is_null($filter) && $filter != "") 
            {
                $filter = json_decode($filter);
                require_once("myFilter.php");
                $filterClass = new MyFilter();
                $filter = $filterClass->getFilterStrByGlobal($filter->id);
                if($filter["str"] != "") $filterStr = " AND (".$filter["str"].")";
                $operand = $filter["operand"];
            };
            $query = "SELECT id, objectType, objectId, name, parent, state, bindId, classId FROM structures WHERE trash = 0 $filterStr";
            if($login != "admin") $query .= " AND
                id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                    AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0))";
            if($login != "admin") $operand += [$login, $role, $login ];
            searchChildren($query, $operand, !is_null($param) ? $param[0] : 0, $out);
            echo json_encode($out);
            break;
        case 114: // Копирование элемента
            $idElement = (int)$param[0]; // id Элемента 
            $idParentFrom = -1; // id папки из которой копируем
            $idParentTo = (int)$param[1]; // id папки в которую копируем
            $typeOperation = $param[2]; // тип операции
            $newName = $param[3];
            $loadKey = $param[4];

            // Проверка на ошибки
            $out = [$idElement]; 
            $errors = [];
            getRemoveElementbyStructure($out, $idElement);
            for($i = 0, $c = count($out); $i < $c; $i++)
            {
                $elementData = query("SELECT parent, class FROM structures WHERE id = %i", [ $out[$i] ])->fetch_assoc();
                if($i == 0) $idParentFrom = (int)$elementData["parent"];
                if($typeOperation == "cut" && (int)$elementData["class"] == 1) $errors[] = "ERROR_CLASS"; // Ограничение для вырезания в структурах созданных конструктором
                if($out[$i] == $idParentTo) $errors[] = "ERROR_IN_ITSELF"; //Проверка на добавление папки саму в себя
            }

            require_once("copyAndRemove.php");
            require_once("myLoading.php");
            $myLoading = new MyLoading($loadKey); // Создаем ключ для отслеживания операции
            if(count($errors) > 0) 
            {
                echo json_encode($errors);
                $myLoading->removeKey(); // Удаляем загрузочный ключ
                return;
            }

            if(($myRight->get($idParentTo) & 8) != 8) continue; // Права на изменение
            if($typeOperation == "copy" || $typeOperation == "inherit") // Копирование или Наследование
            {
                if($typeOperation == "copy" && ($myRight->get($idElement) & 2) != 2) continue; // Права на копирование
                if($typeOperation == "inherit" && ($myRight->get($idElement) & 4) != 4) continue; // Права на наследование
                
                $structures = new CopyAndRemove($idElement, $idParentTo, $typeOperation, $myLog, $myLoading);
                $structures->copy($newName);
                $myLog->add("structure", "copy", $idElement);
            }
            if($typeOperation == "cut") // Вырезать(изменение)
            {
                if(($myRight->get($idElement) & 8) != 8) continue; // Права на изменение
                query("UPDATE structures SET parent = %i WHERE id = %i", [$idParentTo, $idElement]);
                $myLog->add("structure", "cut", $idElement);
            }

            // Надо пересчитать статусы у папок
            require_once("myTable.php");
            $myTable = new MyTable(-1, null);
            $myTable->calculateStateForFolder($idParentFrom);
            $myTable->calculateStateForFolder($idParentTo);
            
            $myLoading->removeKey(); // Удаляем загрузочный ключ
            break;
        case 115: // Запрос приоритета и иконок
            if(($myRight->get($param[0]) & 1) != 1) continue; // Права на просмотр
            request("SELECT priority, icon FROM structures WHERE id = %i", $param);
            break;
        case 116: // Изменение приоритета и иконок
            if(($myRight->get($param[1]) & 8) != 8) continue; // Права на изменение
            query("UPDATE structures SET priority = %i, icon = %i WHERE id = %i", $param);
            break;
        case 117: // Загрузка файлов на сервер
            require_once("myFile.php");
            $myFile = new MyFile();
            echo $myFile->loadFile(20, ['gif', 'jpeg', 'png', 'jpg', 'xls', 'xlsx', 'doc', 'docx', 'avi', 'mp4']);
            break;
        case 118: // Удаление файлов из временной папки
            unlink("../tmp/".$param[0]); 
            break;
        case 119: // Загрузка файла с клиента
            $idElement = (int)$param[0];
            $fileName = $param[1];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение

            require_once("myFile.php");
            $myFile = new MyFile();
            $myFile->createFile($idElement, $fileName);
            break;
        case 120: // Изменение имени объекта
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            query("UPDATE structures SET name = %s WHERE id = %i", [ $param[1], $idElement ]);
            // Если это папка, таблица или файл ищем во всех ячейках
            if($result = query("SELECT id FROM fields WHERE (linkType = 'folder' OR linkType = 'table' OR linkType = 'file') AND linkId = %i", [ $idElement ]))
                while ($row = $result->fetch_assoc())
                {
                    query("UPDATE fields SET value = %s WHERE id = %i", [ $param[1], $row["id"] ]);
                    updateCellByLink($row["id"], $param[1]);
                }
            $myLog->add("structure", "rename", $idElement);
            break;
        case 121: // Запрос файла с правами
            $idElement = (int)$param;
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            $fileName = scandir("../files/$idElement", 1)[0];
            $fileType = getFileType($fileName);
            
            $fileBaseNameForDownload = "";
            if($result = query("SELECT name FROM structures WHERE id = %i", [ $idElement ])) 
                $fileBaseNameForDownload = $result->fetch_array(MYSQLI_NUM)[0];

            $fileType2 = getFileType($fileBaseNameForDownload);
            if($fileType2 != $fileType) // Если тип в имени равен реальному, то оставляем как есть
                $fileBaseNameForDownload .= ".$fileType";
            
            $filePathForDownload = "../files/$idElement/$fileName";
            require_once("getFile.php");
            $myLog->add("file", "download", $idElement);
            break;
        case 122: // Запрос информации об элементе структуры
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
            request("SELECT info FROM structures WHERE id = %i", [ $idElement ]);
            break;
        case 123: // Выставление информации в структуре
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) return; // Права на изменение
            query("UPDATE structures SET info = %s WHERE id = %i", [ $param[1], $idElement ]);
            break;
        case 124: // Поиск в структуре элементов
            $out = ["folder" => []];
            $type = "%$param[1]%";
            if($param[0][0] == "#")
            {
                $search = str_replace("#", "", $param[0]);
                $query = "SELECT id, objectType, objectId, name, parent, priority, info, bindId, state, icon FROM structures WHERE trash = 0 AND hashtag = %s AND objectType LIKE %s";
            }
            else
            {
                $search = "%$param[0]%";
                $query = "SELECT id, objectType, objectId, name, parent, priority, info, bindId, state, icon FROM structures WHERE trash = 0 AND name LIKE %s AND objectType LIKE %s";
            }
            if($login == "admin") $query .= " ORDER by parent, priority";
            else $query .= " AND id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                    AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0)) ORDER by parent, priority";
            if($result = query($query, $login == "admin" ? [ $search, $type ] : [ $search, $type, $login, $role, $login ]))
                while ($row = $result->fetch_assoc()) 
                    $out["folder"][] = getObjectFromStructures($row);
            echo json_encode($out);
            break;
        case 125: // Получить список объектов которые ссылаются и на которые ссылается запрошенный объект
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
            $fromInherit = []; // откуда наследуется
            $whoInherit = []; // кто наследует
            $whoRefer = []; // кто ссылается
            $useClass = [ "id" => null, "name" => "" ];
            if($result = query("SELECT id, objectType, name FROM structures WHERE trash = 0 AND id IN (SELECT bindId FROM structures WHERE id = %i)", [ $idElement ]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) $fromInherit[] = $row;
            if($result = query("SELECT id, objectType, name FROM structures WHERE trash = 0 AND bindId = %i", [ $idElement ]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) $whoInherit[] = $row;

            $linkType = selectOne("SELECT objectType FROM structures WHERE id = %i", [ $idElement ]);
            $useClass["id"] = selectOne("SELECT classId FROM structures WHERE id = %i", [ $idElement ]);
            if(!is_null($useClass["id"]))
                $useClass["name"] = selectOne("SELECT name FROM structures WHERE id = %i", [ $useClass["id"] ]);
            $linkId = $idElement;
            $query = "SELECT id, tableId FROM fields WHERE type = 'link' AND linkId = %i AND linkType = %s";
            $queryArray = [ $idElement ];
            if($linkType == "event") $query = "SELECT id, tableId FROM fields WHERE eventId = %i";
            else if($linkType == "class") $query = "SELECT id FROM structures WHERE classId = %i";
            else
            {
                if($linkType == "value" || $linkType == "tlist") $linkId = (int)selectOne("SELECT objectId FROM structures WHERE id = %i", [ $idElement ]);
                $queryArray = [ $linkId, $linkType ];
            }
            if($result = query($query, $queryArray))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $tableId = $linkType == "class" ? (int)$row[0] : (int)$row[1];
                    if(!array_key_exists($tableId, $whoRefer))
                    {
                        $trash = selectOne("SELECT trash FROM structures WHERE id = %i", [ $tableId ]);
                        if((int)$trash == 1) continue;
                        $whoRefer[$tableId] = ["fields" => [], "name" => selectOne("SELECT name FROM structures WHERE id = %i", [ $tableId ])];
                    }
                    if($linkType != "class") $whoRefer[$tableId]["fields"][] = (int)$row[0];
                }
            echo json_encode([
                "fromInherit" => $fromInherit, 
                "whoInherit" => $whoInherit, 
                "whoRefer" => $whoRefer, 
                "useClass" => $useClass
            ]);
            break;
        case 126: // Получение имени элемента структуры
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
            echo selectOne("SELECT name FROM structures WHERE id = %i", [ $idElement ]);
            break;
        case 127: // Запрос информации об элементе структуры для приложения справка
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
            if($result = query("SELECT objectType, info, state, name, bindId FROM structures WHERE id = %i", [ $idElement ]))
                echo json_encode( $result->fetch_assoc());
            break;
        case 128: // Импорт таблицы на сервер
            require_once("myFile.php");
            $myFile = new MyFile();
            echo $myFile->loadFile(10, ['xls','xlsx']);
            break;
        case 129: // Получить тип элемента на который ссылается ярлык
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
            $out = [];
            if($result = query("SELECT id, objectType, objectId, name, parent, priority, info, bindId, state, icon FROM structures WHERE id = %i", [ $idElement ]))
                while ($row = $result->fetch_assoc()) 
                    $out = getObjectFromStructures($row);
            echo json_encode($out);
            break;
        case 130: // Полное удаление Объекта из проекта, без ограничений
            require_once("copyAndRemove.php");
            $idElement = (int)$param[0];
            $structures = new CopyAndRemove(null, null, null, $myLog);
            $out = [ $idElement ];
            getRemoveElementbyStructure($out, $idElement);
            for($i = 0, $c = count($out); $i < $c; $i++)
            {
                if(($myRight->get($out[$i]) & 8) != 8) continue; // Права на изменение
                $structures->remove($out[$i]);
            }
            echo json_encode($out);
            break;
        case 131: // Подсчитывает сколько элементов используют данный объект
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 1) != 1) continue; // Права на просмотр
            echo $myStructures->getWhereUsed($idElement);
            break;
        case 132: // Отключение пользователя
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) continue; // Права на изменение
            $username = selectOne("SELECT name FROM structures WHERE id = %i", [ $idElement ]);
            query("UPDATE signin SET checkkey = '', login = '' WHERE login = %s", [$username]);
            $myLog->add("user", "logout", $username);
            break;
        case 133: // Запросить таблицу свойств
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 1) != 1) continue; // Права на просмотр
            $data = query("SELECT objectType, priority, icon, user_property, hashtag, objectId FROM structures WHERE id = %i", [ $idElement ])->fetch_assoc();
            $tableProperty = [
                "timeCreate" => selectOne("SELECT date FROM main_log WHERE type = 'structure' AND value = %s AND operation = 'create' LIMIT 1", [ $idElement ]),
                /* "timeUpdate" => selectOne("SELECT date FROM main_log WHERE type = %s AND value = %s AND operation = 'update' LIMIT 1", [ $type, $idElement ]), */
                "hashtag" => $data["hashtag"],
                "userProperty" => $data["user_property"],
                "priority" => (int)$data["priority"],
                "icon" => (int)$data["icon"],
                "idTable" => $data["objectType"] == "tlist" ? selectOne("SELECT tableId FROM my_values WHERE id = %i", [(int)$data["objectId"]]) : -1,
                "idFilter" => $data["objectType"] == "tlist" ? selectOne("SELECT filterId FROM my_values WHERE id = %i", [(int)$data["objectId"]]) : -1,
            ];
            echo json_encode($tableProperty);
            break;
        case 134: // Сохранить пользовательскую таблицу свойств
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) continue; // Права на изменение
            query("UPDATE structures SET user_property = %s WHERE id = %i", [$param[1], $idElement]);
            break;
        case 135: // Обновить хэштег
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 8) != 8) continue; // Права на изменение
            query("UPDATE structures SET hashtag = %s WHERE id = %i", [$param[1], $idElement]);
            break;
        case 136: // Сравнение двух таблиц
            $idTable1 = (int)$param[0];
            $idTable2 = (int)$param[1];
            if(($myRight->get($idTable1) & 1) != 1) continue; // Права на просмотр
            if(($myRight->get($idTable2) & 1) != 1) continue; // Права на просмотр
            require_once("myTable.php");
            $myTable1 = new MyTable($idTable1, $myLog);
            $myTable2 = new MyTable($idTable2, $myLog);

            $headTable1 = [];
            $dataTable1 = [];
            $headTable2 = [];
            $dataTable2 = [];
            $myTable1->getDataFromTable($dataTable1, 0, 0, $headTable1, 0);
            $myTable2->getDataFromTable($dataTable2, 0, 0, $headTable2, 0);
            $countRowData1 = count($dataTable1);
            $countRowData2 = count($dataTable2);
            $countRow = $countRowData1 <= $countRowData2 ? $countRowData1 : $countRowData2;
            $headEquality = false;
            if(count($headTable1) == count($headTable2)) // Проверка заголовка
            {
                for($i = 0, $c = count($headTable1); $i < $c; $i++)
                {
                    for($j = 0, $c2 = count($headTable1[$i]); $j < $c2; $j++)
                        if($headTable1[$i][$j]["value"] != $headTable2[$i][$j]["value"]) break;
                    if($j != $c2) break;
                }
                $headEquality = $i == count($headTable1);
            }
            $inequality = [];
            if($headEquality)
            {
                for($i = 0; $i < $countRow; $i++)
                    foreach($dataTable1[$i] as $key => $value)
                        if($dataTable1[$i][$key]["value"] != $dataTable2[$i][$key]["value"]) $inequality[] = [ "A" => $dataTable1[$i][$key], "B" => $dataTable2[$i][$key] ];
            }
            echo json_encode([$headEquality, $inequality]);
            break;
        case 137: // Добавить заметку
            $objectId = (int)$param[0];
            $name = $param[1];
            $type = $param[2];
            $data = $param[3];
            query("INSERT INTO stickers (objectId, name, type, data, login, trash) VALUES(%i, %s, %s, %s, %s, 0)", [ $objectId, $name, $type, $data, $login ]);
            break;
        case 138: // Отправить заметку в архив
            $stickerId = (int)$param[0];
            query("UPDATE stickers SET trash = 1 WHERE id = %i", [ $stickerId ]);
            break;
        case 139: // Создать таблицу из файла
            $idObject = (int)$param[0];
            $loadKey = $param[1];
            if(($myRight->get($idObject) & 1) != 1) continue; // Права на просмотр
            $parent = selectOne("SELECT parent FROM structures WHERE id = %i", [ $idObject ]);
            $name = selectOne("SELECT name FROM structures WHERE id = %i", [ $idObject ]);

            require_once("myStructures.php");
            require_once("myTable.php");
            require_once("myLoading.php");
            require_once dirname(__FILE__) . '/PHPExcel.php';

            $fileName = scandir("../files/$idObject", 1)[0];
            $fileType = getFileType($fileName);

            if($fileType == "xlsx") $format = "Excel2007";
            if($fileType == "xls") $format = "Excel5";

            $objReader = PHPExcel_IOFactory::createReader($format);
            $objReader->setReadDataOnly(false);
            $objPHPExcel = $objReader->load("../files/$idObject/$fileName");
            $fileData = $objPHPExcel->getActiveSheet()->toArray();

            $myLoading = new MyLoading($loadKey);
            $myStructures = new MyStructures($myRight, $myLog);
            $idTable = $myStructures->create(["table", null, $name, $parent, 0, ""], false);
            $myTable = new MyTable($idTable, $myLog); // Общий класс для работы с таблицами

            $data = [];
            $lastColumn = [];
            for($j = 0, $c = count($fileData[0]); $j < $c; $j++) // Заголовок
            {
                if($fileData[0][$j] == "") { $lastColumn = $j; break; }
                $data[] = (object)["value" => $fileData[0][$j], "i" => $j];
            }
            $myTable->setAndRemoveHeader($data, []);
            $c = count($fileData);
            $myLoading->start($c);
            $myLoading->update();
            for($i = 1; $i < $c; $i++)
            {
                $row = $myTable->addRow(-1, -1, false);
                $idRow = $row["__ID__"];
                $j = 0;
                foreach($row as $idColumn => $value)
                    if($idColumn != "__ID__")
                    {
                        if($j == $lastColumn) break;
                        $color = substr($objPHPExcel->getActiveSheet()->getStyle(getExcelColumn($j).($i + 1))->getFill()->getStartColor()->getARGB(), 2);
                        query("UPDATE fields SET value = %s WHERE idColumn = %i AND i = %i", [ $fileData[$i][$j++], $idColumn, $idRow ]);
                        if($color != "000000")
                            query("UPDATE fields SET color = %s WHERE idColumn = %i AND i = %i", [ "#$color", $idColumn, $idRow ]);
                    }
                $myLoading->update();
            }
            $myLoading->removeKey();
            break;
        case 140: // Создает в настройках уникальную запись для проверки загрузки в процентах
            require_once("myLoading.php");
            $myLoading = new MyLoading("");
            echo $myLoading->getKey();
            break;
        case 141: // Получить статус загрузки процесса
            require_once("myLoading.php");
            $myLoading = new MyLoading($param[0]);
            echo $myLoading->getState();
            break;
        case 142: // Предпросмотр таблиц
            $idObject = (int)$param[0];
            if(($myRight->get($idObject) & 1) != 1) continue; // Права на просмотр
            require_once dirname(__FILE__) . '/PHPExcel.php';
            $parent = selectOne("SELECT parent FROM structures WHERE id = %i", [ $idObject ]);

            $fileName = scandir("../files/$idObject", 1)[0];
            $fileType = getFileType($fileName);

            if($fileType == "xlsx") $format = "Excel2007";
            if($fileType == "xls") $format = "Excel5";

            $objReader = PHPExcel_IOFactory::createReader($format);
            $objReader->setReadDataOnly(false);
            $objPHPExcel = $objReader->load("../files/$idObject/$fileName");
            $loadedSheetNames = $objPHPExcel->getSheetNames();
            $outArray = [];

            foreach($loadedSheetNames as $sheetIndex => $loadedSheetName) 
                $outArray[$sheetIndex] = [
                    "name" => $loadedSheetName,
                    "data" => getListFromExcel($sheetIndex)
                ];
            echo json_encode($outArray);
            break;
        case 143: // Получить полный путь к файлу
            $idElement = (int)$param[0];
            if(($myRight->get($idElement) & 1) != 1) return; // Права на просмотр
            $fileBaseNameForDownload = scandir("../files/$idElement", 1)[0];
            echo "$idElement/$fileBaseNameForDownload";
            break;
    }
    function searchChildren($queryStr, $operand, $parent, &$out) // Формирование древовидной структуры
    {
        global $myRight;
        if($result = query($queryStr." AND parent = $parent ORDER by priority", $operand))
            while ($row = $result->fetch_assoc()) 
                if(($myRight->get($row["id"], true) & 1) == 1)
                {
                    $i = count($out);
                    $out[$i] = [
                        "id" => $row["id"], 
                        "objectType" => $row["objectType"], 
                        "objectId" => $row["objectId"], 
                        "name" => $row["name"], 
                        "state" => $row["state"],
                        "parent" => $row["parent"],
                        "classId" => $row["classId"],
                        "bindId" => $row["bindId"],
                        "childrens" => []
                    ];
                    searchChildren($queryStr, $operand, (int)$row["id"], $out[$i]["childrens"]);
                }
    }
    function getListFromExcel($sheetIndex)
    {
        global $objPHPExcel;
        $fileData = $objPHPExcel->getSheet($sheetIndex)->toArray();
        $outArray = [];
        $c = count($fileData);
        $c2 = count($fileData[0]);
        $outArray[0] = [];
        $outArray[0][0] = [ "value" => "", "color" => "#e6e6e6" ];
        for($j = 0; $j < $c2; $j++)
            $outArray[0][$j + 1] = [ "value" => getExcelColumn($j), "color" => "#e6e6e6" ];
        for($i = 0; $i < $c; $i++)
        {
            $outArray[$i + 1] = [];
            $outArray[$i + 1][0] = [ "value" => $i + 1, "color" => "#e6e6e6" ];
            for($j = 0; $j < $c2; $j++)
            {
                $color = substr($objPHPExcel->getSheet($sheetIndex)->getStyle(getExcelColumn($j).($i + 1))->getFill()->getStartColor()->getARGB(), 2);
                $outArray[$i + 1][$j + 1] = [
                    "value" => $fileData[$i][$j],
                    "color" => $color != "000000" ? "#$color" : null
                ];
            }
        }
        return $outArray;
    }
?>