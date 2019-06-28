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
?>