<?php
    $idElement = (int)$param[0];
    switch($nQuery)
    {
        case 480: // Отображение последних 100 сообщений
            if(($myRight->get($idElement) & 1) != 1) continue; // Права на просмотр
            request("SELECT date, login, type, operation, value FROM main_log ORDER by date DESC LIMIT 100", [ ]);
            break;
        case 481: // Запрос сообщений по дате
            if(($myRight->get($idElement) & 1) != 1) continue; // Права на просмотр
            $beginDate = $param[1];
            $endDate = $param[2]; 
            request("SELECT date, login, type, operation, value FROM main_log WHERE date >= %s AND date <= %s ORDER by date", [ $beginDate, $endDate ]);
            /* echo "SELECT date, login, type, operation, value FROM main_log WHERE date >= %s AND date <= %s ORDER by date\n";
            echo $beginDate."\n";
            echo $endDate."\n"; */
            break;
    }
?>