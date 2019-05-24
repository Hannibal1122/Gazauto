<?php
    include("config.php");
    include("query.php");
    $mysqli = new mysqli('localhost', $username, $password, $dbName);
    if (mysqli_connect_errno()) { echo("None connection"); exit(); }
    $mysqli->set_charset("utf8");

    /* Работа с логом */
    require_once("myLog.php");
    $myLog = new MyLog("system");
    if($result = query("SELECT id, param, date, code FROM events WHERE ready = 0 AND type = 'date' AND date <= NOW()", []))
        while ($row = $result->fetch_array(MYSQLI_NUM)) 
        {
            require_once("FASM.php"); // класс для работы с событиями
            $fasm = new FASM();
            $fasm->start($row[3], -1);
            $nextDateTime = getNextDateForEvent($row[1])->format("Y-m-d H:i:s");
            if($nextDateTime == $row[2]) query("UPDATE events SET ready = 1 WHERE id = %i", [(int)$row[0]]);
            else query("UPDATE events SET date = %s WHERE id = %i", [$nextDateTime, (int)$row[0]]);
        }
?>