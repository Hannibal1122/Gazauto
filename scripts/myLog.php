<?php
    class MyLog
    {
        function __construct($login)
        {
            $this->login = $login;
        }
        function add($type, $operation, $value)
        {
            global $mysqli;
            query("INSERT INTO main_log (type, operation, value, date, dateUpdate, login) VALUES(%s, %s, %s, NOW(), NOW(), %s)", [ $type, $operation, $value, $this->login ]);
            return $mysqli->insert_id;
        }
        function remove()
        {

        }
        function update()
        {
        }
    }
?>