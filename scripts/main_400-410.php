<?php
    require_once("myTable.php"); // $myTable класс для работы с таблицей
    $idElement = (int)$param[0];
    switch($nQuery)
    {
        case 400: // Создание план-графика
            $idTable = (int)$param[0];
            if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
            $month = (int)$param[1];
            $year = (int)$param[2];
            $monthName = [
                1 => "январь", 
                2 => "февраль", 
                3 => "март", 
                4 => "апрель", 
                5 => "май", 
                6 => "июнь",
                7 => "июль",
                8 => "август",
                9 => "сентябрь",
                10 => "октябрь",
                11 => "ноябрь",
                12 => "декабрь"
            ];
            $number = cal_days_in_month(CAL_GREGORIAN, $month, $year);
            /* // Должен быть update имени
            $name = selectOne("SELECT name FROM structures WHERE id = %i", [ $idTable ]);
            query("UPDATE structures SET name = %s WHERE id = %i", [ $name." ($month.$year)", $idTable ]); */
            $tableProperty = [];
            $tableProperty[] = [ "name" => "месяц", "value" => $monthName[$month], "type" => "block" ];
            $tableProperty[] = [ "name" => "год", "value" => $year, "type" => "block" ];
            query("UPDATE structures SET user_property = %s WHERE id = %i", [ json_encode($tableProperty), $idTable ]);
            // Создание заголовка
            $myTable = new MyTable($idTable, $myLog);
            $data = [];
            $data[] = (object)["value" => "ФИО", "i" => 0];
            for($i = 1; $i <= $number; $i++)
                $data[] = (object)["value" => $i, "i" => $i];
            $myTable->setAndRemoveHeader($data, []);
            break;
        case 401: // резерв
            break;
        case 402: // Изменение данных, поддержка интервального изменения одинаковым значением
            $data = json_decode($param[0]);
            require_once("myTable.php"); // $myTable класс для работы с таблицей
            for($i = 0, $c = count($data); $i < $c; $i++)
            {
                $idField = (int)$data[$i]->id;
                $idTable = selectOne("SELECT tableId FROM fields WHERE id = %i", [ $idField ]);
                if(($myRight->get($idTable) & 8) != 8) return; // Права на изменение
                $myTable = new MyTable($idTable, $myLog);
                $myTable->setCell($data[$i], false);
                if(!is_null($data[$i]->color)) query("UPDATE fields SET color = %s WHERE id = %i", [ $data[$i]->color, $idField ]);
            }
            break;
    }
?>