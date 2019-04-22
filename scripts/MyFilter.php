<?php
    class MyFilter
    {
        function __construct()
        {
            
        }
        function create($value)
        {
            global $mysqli;
            query("INSERT INTO filter (value) VALUES(%s)", [ $value ]);
            return $mysqli->insert_id;
        }
        function get($idFilter)
        {
            request("SELECT value FROM filter WHERE id = %i", [ $idFilter ]);
        }
        function update($idFilter, $value)
        {
            query("UPDATE filter SET value = %s WHERE id = %i", [$value, $idFilter]);
        }
    }
?>