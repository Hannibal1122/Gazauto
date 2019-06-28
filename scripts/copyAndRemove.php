<?php
    class CopyAndRemove
    {
        function __construct($idElement, $idParent, $typeOperation, $myLog)
        {
            $this->idElement = $idElement;
            $this->idParent = $idParent;
            $this->typeOperation = $typeOperation;
            $this->myLog = $myLog;
        }
        function copy($newName, $class = 0) // Скопировать элемент структуры, по типам
        {
            global $login, $mysqli;
            $idElement = $this->idElement;
            $idParent = $this->idParent;
            $elem = [];
            if($result = query("SELECT objectType, objectId, name, parent, priority, info, bindId FROM structures WHERE id = %i", [$idElement]))
                $elem = $result->fetch_array(MYSQLI_NUM);
            if($this->typeOperation == "inherit" && $elem[6] != null) return; // Нельзя наследовать от наследуемой
            if($newName != "") $elem[2] = $newName;
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
            if($class == 1) query("UPDATE structures SET class = 1 WHERE id = %i", [ $idNewElement ]);
            return $idNewElement;
        }
        function copyTable($idNewElement) // Скопировать таблицу
        {
            require_once("myTable.php");
            $myTable = new MyTable($idNewElement, $this->myLog);
            $myTable->copy($this->idElement, $this->typeOperation == "inherit");
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
            if($this->typeOperation == "inherit") query("UPDATE structures SET bindId = %i WHERE id = %i", [ $idElement, $idNewElement ]);
            if($result = query("SELECT id FROM structures WHERE parent = %i", [$idElement]))
                while($row = $result->fetch_array(MYSQLI_NUM))
                {
                    $structures = new Structures((int)$row[0], $idNewElement, $typeOperation);
                    $structures->copy("");
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
            $type = $element[0];
            switch($type)
            {
                case "role": query("DELETE FROM roles WHERE role = %s", [ $element[1] ]); break;
                case "user": 
                    if($element[1] == "admin") return;
                    query("DELETE FROM registration WHERE login = %s", [ $element[1] ]);
                    query("DELETE FROM password WHERE login = %s", [ $element[1] ]);
                    $this->myLog->add("user", "remove", json_encode([ $element[1] ]));
                    break;
                case "folder": break;
                case "plan":
                case "table":
                    require_once("myTable.php");
                    $myTable = new MyTable($idElement, $this->myLog);
                    $myTable->remove();
                    $this->myLog->add($type, "remove", $idElement);
                    break;
                case "file":
                    unlink("../files/$idElement/".scandir("../files/$idElement")[2]); 
                    rmdir("../files/$idElement"); 
                    break;
                case "value":
                    query("DELETE FROM my_values WHERE id = %i", [ (int)$element[2] ]);
                    query("DELETE FROM my_list WHERE value_id = %i", [ (int)$element[2] ]);
                    break;
                case "event":
                    query("DELETE FROM events WHERE id = %i", [ (int)$idElement ]);
                    break;
                case "class":
                    query("DELETE FROM classes WHERE id = %i", [ (int)$idElement ]);
                    break;
                case "tlist":
                    query("DELETE FROM my_values WHERE id = %i", [ (int)$element[2] ]);
                    break;
                case "filter":
                    query("DELETE FROM filter WHERE id = %i", [ (int)$element[2] ]);
                    break;
            }
            query("DELETE FROM structures WHERE id = %i", [ (int)$idElement ]);
            query("DELETE FROM rights WHERE objectId = %i", [ (int)$idElement ]);
            $this->myLog->add("structure", "remove", $idElement);
        }
    }
?>