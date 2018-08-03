<?php
    class MyField
    {
        function __construct()
        {
        }
        function getValue(&$field)
        {
            if($value = query("SELECT value, type, tableId FROM my_values WHERE id = %i", [ $field["linkId"] ]))
            {
                $valueData = $value->fetch_array(MYSQLI_NUM);
                $field["type"] = $valueData[1];
                if($valueData[1] == "array") $field["value"] = getListValueByKey($field["linkId"], $field["value"]);
                else if($valueData[1] == "tlist") $field["value"] = getTableListValueByKey((int)$field["value"], (int)$valueData[2]);
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
            $r = count($array[0]) - 1;
            $d = count($array) - 1;
            if($r > 0) $this->shiftRight($j, $r);
            if($d > 0) $this->shiftDown($i, $d);
            for($_i = 0, $h = count($array); $_i < $h; $_i++)
            {
                if(!isset($mainArray[$i + $_i])) 
                {
                    $mainArray[$i + $_i] = [];
                    for($_j2 = 0, $w2 = count($mainArray[0]); $_j2 < $w2; $_j2++) $mainArray[$i + $_i][$_j2] = null;
                }
                for($_j = 0, $w = count($array[$_i]); $_j < $w; $_j++)
                    $mainArray[$i + $_i][$j + $_j] = $array[$_i][$_j];
            }
        }
        function shiftRight($j, $l) // l - количество сдвигов
        {
            $mainArray = &$this->myArray;
            $n = $j + 1;
            $k = $j + $l + 1;
            for($_j = $n; $_j < $k; $_j++) if(isset($mainArray[0][$_j]) && !is_null($mainArray[0][$_j])) break; // Проверка на уже имеющийся сдвиг
            if($_j == $k) return;
            else { $l = $k - $_j; $j = $_j - 1; };
            $w = count($mainArray[0]);
            $error = $w - $l + 1; // Если таблица в которую вставляем меньше
            if($error < 0) $error = 0;
            for($_j = $w - 1 + $error; $_j > $j; $_j--)
                for($_i = 0, $h = count($mainArray); $_i < $h; $_i++)
                {
                    if($_j <= $w - 1)
                    {
                        $mainArray[$_i][$_j + $l] = $mainArray[$_i][$_j];
                        $mainArray[$_i][$_j] = null;
                    }
                    else $mainArray[$_i][$_j] = null;
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