<?php
    class MyLog
    {
        function __construct($login)
        {
            $this->login = $login;
        }
        function add($type, $operation, $value, $oldValue = NULL)
        {
            global $mysqli;
            $old_value = $oldValue ? json_encode($oldValue) : NULL;
            query("INSERT INTO main_log (type, operation, value, date, dateUpdate, login, oldValue) VALUES(%s, %s, %s, NOW(), NOW(), %s, %s)", [ $type, $operation, $value, $this->login, $old_value ]);
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