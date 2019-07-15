<?php
    class MyLoading
    {
        function __construct($loadKey)
        {
            $this->percent = 0;
            $this->step = 0;
            $this->loadKey = $loadKey;
        }
        function getKey()
        {
            global $login;
            $loadKey = unique_md5();
            query("INSERT INTO user_settings (login, id, type, value) VALUES(%s, %i, %s, %s)", [$login, -1, $loadKey, "0"]);
            $this->loadKey = $loadKey;
            return $loadKey;
        }
        function getState()
        {
            global $login;
            $loadValue = selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [$login, $this->loadKey]);
            echo is_null($loadValue) ? "END" : $loadValue;
        }
        function removeKey()
        {
            global $login;
            query("DELETE FROM user_settings WHERE login = %s AND type = %s", [ $login, $this->loadKey ]);
        }
        function start($count)
        {
            $this->step = 100 / $count;
            $this->percent = 0;
        }
        function update()
        {
            global $login;
            $this->percent += $this->step;
            query("UPDATE user_settings SET value = %s WHERE login = %s AND type = %s", [$this->percent, $login, $this->loadKey]);
        }
    }
?>