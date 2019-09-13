<?php
    class MyField
    {
        function __construct()
        {
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
            if($value = query("SELECT value FROM fields WHERE id = %i", [ $field["linkId"] ]))
            {
                $valueData = $value->fetch_assoc();
                $field["type"] = "cell";
                $field["value"] = $valueData["value"];
            }
        }
    }
?>