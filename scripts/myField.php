<?php
    class MyField
    {
        function __construct()
        {
        }
        function getValue(&$field)
        {
            if($value = query("SELECT value, type FROM my_values WHERE id = %i", [ $field["linkId"] ]))
            {
                $field["type"] = "value";
                $valueData = $value->fetch_array(MYSQLI_NUM);
                if($valueData[1] == "array") $field["listValue"] = getListValueByKey($field["linkId"], $field["value"]);
                else $field["value"] = $valueData[0];
            }
        }
        function getTable(&$field, $type)
        {
            $field["type"] = $type;
            if($value = query("SELECT name FROM structures WHERE id = %i", [ $field["linkId"] ]))
                $field["value"] = $value->fetch_array(MYSQLI_NUM)[0];
            if($type == "table") $field["tableId"] = $field["linkId"];
        }
        function getFile(&$field, $type)
        {
            $field["type"] = $type;
            if($value = query("SELECT name FROM structures WHERE id = %i", [ $field["linkId"] ]))
                $field["value"] = $value->fetch_array(MYSQLI_NUM)[0];
        }
        function getCell(&$field)
        {
            $value = getCellLink($field["linkId"], true);
            $field["type"] = "cell";
            $field["value"] = $value["value"];
            $field["tableId"] = $value["tableId"];
        }
        /* function getTable() // Запрос таблицы
        {
            $idTable = $this->idTable; 
            $nameTable = "";
            $timeOpen = "";
            $head = [];
            $data = [];
            if($result = query("SELECT name, NOW(), bindId FROM structures WHERE id = %i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) { $nameTable = $row[0]; $timeOpen = $row[1]; $bindId = $row[2]; }
            if($result = query("SELECT i, name_column FROM fields WHERE tableId = %i AND type = 'head' ORDER by i", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                    $head[] = $row;
            if($result = query("SELECT i, name_column, value, type, linkId, linkType, fields.id, state, next FROM fields LEFT JOIN line_ids ON line_ids.id = fields.i WHERE tableId = %i AND type != 'head'", [$idTable]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $field = [ "id" => (int)$row[6], "value" => $row[2], "state" => $row[7] ];
                    if($row[3] == "link")
                    {
                        $field["linkId"] = (int)$row[4];
                        switch($row[5])
                        {
                            case "value":
                                
                                break;
                            case "file":
                            case "table":
                                
                                break;
                            case "cell":
                                
                                break;
                        }
                    }
                    $data[(int)$row[0]][$row[1]] = $field;
                    $data[(int)$row[0]]["__NEXT__"] = $row[8];
                }
            echo json_encode(["head" => $head, "data" => $data, "name" => $nameTable, "change" => (getRights($idTable) & 8) == 8, "time" => $timeOpen, "changeHead" => $bindId]);
            addLog("table", "open", $idTable);
        } */
    }
    class MyArray
    {
        function __construct($array)
        {
            $this->myArray = $array;
        }
        function insertArrayInField($i, $j, $array)
        {
            $mainArray = &$this->myArray;
            $this->shiftRight($j, count($array[0]) - 1);
            $this->shiftDown($i, count($array) - 1);
            for($_i = 0, $h = count($array); $_i < $h; $_i++)
                for($_j = 0, $w = count($array[$_i]); $_j < $w; $_j++)
                {
                    if(!isset($mainArray[$i + $_i])) 
                    {
                        $mainArray[$i + $_i] = [];
                        for($_j2 = 0, $w2 = count($mainArray[0]); $_j2 < $w2; $_j2++) $mainArray[$i + $_i][$_j2] = null;
                    }
                    $mainArray[$i + $_i][$j + $_j] = $array[$_i][$_j];
                }
        }
        function shiftRight($j, $l) // l - количество сдвигов
        {
            $mainArray = &$this->myArray;
            $n = $j + 1;
            $k = $j + $l + 1;
            for($_j = $n; $_j < $k; $_j++) if(isset($mainArray[0][$_j]) && !is_null($mainArray[0][$_j])) break;
            if($_j == $k) return;
            else { $l = $k - $_j; $j = $_j - 1; }
            for($_j = count($mainArray[0]) - 1; $_j > $j; $_j--)
                for($_i = 0, $h = count($mainArray); $_i < $h; $_i++)
                {
                    $mainArray[$_i][$_j + $l] = $mainArray[$_i][$_j];
                    $mainArray[$_i][$_j] = null;
                }
        }
        function shiftDown($i, $l)
        {
            $mainArray = &$this->myArray;
            for($_i = count($mainArray) - 1; $_i > $i; $_i--)
                for($_j = 0, $w = count($mainArray[0]); $_j < $w; $_j++)
                {
                    if(!isset($mainArray[$_i + $l])) $mainArray[$_i + $l] = [];
                    $mainArray[$_i + $l][$_j] = $mainArray[$_i][$_j];
                    $mainArray[$_i][$_j] = null;
                }
        }
    }
?>