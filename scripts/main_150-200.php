<?php
    if($login != "admin" && $nQuery != 150 && $nQuery != 151) return;
    switch($nQuery)
    {
        case 150: // Запрос списка пользователей
            request("SELECT login, role FROM registration", []);
            break;
        case 151: // Запрос списка ролей
            request("SELECT role FROM roles", []);
            break;
        case 152: // Добавление пользователя 
            if(($myRight->get($param[3]) & 8) != 8) return; // Права на изменение структуры
            if(require_once("registration.php"))
            {
                query("INSERT INTO structures (objectType, objectId, name, parent) VALUES('user', NULL, %s, %i)", [$param[0], $param[3]]);
                $myLog->add("user", "create", json_encode([$param[0], $param[1]]));
            }
            break;
        case 153: // Добавление роли
            if(($myRight->get($param[1]) & 8) != 8) return; // Права на изменение структуры
            query("DELETE FROM roles WHERE role = %s", [$param[0]]); // Проверка на повторяющиеся значения
            query("INSERT INTO roles (role) VALUES(%s)", [$param[0]]);
            query("INSERT INTO structures (objectType, objectId, name, parent) VALUES('role', NULL, %s, %i)", [$param[0], $param[1]]);
            break;
        case 154: // Изменение пользователя
            query("UPDATE registration SET role = %s WHERE login = %s", [$param[1], $param[0]]);
            $myLog->add("user", "update", json_encode([$param[0], $param[1]]));
            if($param[2] != "")
            {
                $sult = unique_md5();
                $hash = myhash($param[2], $sult);
                query("UPDATE password SET hash = %s WHERE login = %s", [$hash, $param[0]]);
                query("UPDATE signin SET checkkey = '' WHERE login = %s", [$param[0]]);
            }
            break;
        case 155: // Изменение роли
            query("DELETE FROM roles WHERE role = %s", [$param[1]]); // старое
            query("INSERT INTO roles (role) VALUES(%s)", [$param[0]]); // новое
            query("UPDATE registration SET role = %s WHERE role = %s", $param); //Обновить все логины
            query("UPDATE rights SET login = %s WHERE login = %s AND type = 'role'", $param); //Обновить все права
            query("UPDATE structures SET name = %s WHERE name = %s AND objectType = 'role'", $param); //Обновить структуру
            break;
        case 156: // Удаление пользователя
            if($param[0] == "admin") break;
            query("DELETE FROM registration WHERE login = %s", $param);
            query("DELETE FROM password WHERE login = %s", $param);
            query("DELETE FROM structures WHERE objectType = 'user' AND name = %s", $param);
            $myLog->add("user", "remove", json_encode($param));
            break;
        case 157: // Удаление роли
            query("DELETE FROM roles WHERE role = %s", $param);
            query("DELETE FROM structures WHERE objectType = 'role' AND name = %s", $param);
            break;
    }
?>