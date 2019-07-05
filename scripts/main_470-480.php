<?php
    require_once("myFilter.php");
    $idFilter = (int)$param[0];
    $myFilter = new MyFilter();
    $idFilterStructure = (int)$myFilter->getStructureId($idFilter);
    switch($nQuery)
    {
        case 470: // Создать фильтр
            $idParent = (int)$param[0];
            if(($myRight->get($idParent) & 8) != 8) return; // Права на изменение
            echo json_encode([ $myFilter->create($param[1], $param[2]) ]);
            break;
        case 471: // Обновить фильтр
            if(($myRight->get($idFilterStructure) & 8) != 8) return; // Права на изменение
            $myFilter->update($idFilter, $param[1], $param[2]);
            break;
        case 472: // Запрос значения фильтра
            if(($myRight->get($idFilterStructure) & 1) != 1) return; // Права на просмотр
            $myFilter->get($idFilter);
            break;
        case 473:
            if(($myRight->get($idFilterStructure) & 1) != 1) return; // Права на просмотр
            echo $myFilter->getFilterStr($idFilter);
            break;
        case 474: // Обновить / создать настройки фильтра для таблицы
            $idTable = (int)$param[1];
            $q = $myFilter->getUserFilter($login, $idTable);
            if($q == "") query("INSERT INTO user_settings (login, id, type, value) VALUES(%s, %i, %s, %s)", [$login, $idTable, 'filter', $idFilter]);
            else query("UPDATE user_settings SET value = %s WHERE login = %s AND id = %i AND type = %s", [$idFilter, $login, $idTable, 'filter']);
            break;
    }
?>