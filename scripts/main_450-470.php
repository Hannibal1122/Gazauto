<?php
    switch($nQuery)
    {
        case 450: // Установить уникальное свойство в настройках
            $value = selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [ $login, $param[0] ]);
            if(is_null($value)) query("INSERT INTO user_settings (login, id, type, value) VALUES(%s, %i, %s, %s)", [$login, -1, $param[0], $param[1]]);
            else query("UPDATE user_settings SET value = %s WHERE login = %s AND type = %s", [ $param[1], $login, $param[0] ]);
            break;
        case 451: // Запросить значение свойства
            echo selectOne("SELECT value FROM user_settings WHERE login = %s AND type = %s", [ $login, $param[0] ]);
            break;
    }
?>