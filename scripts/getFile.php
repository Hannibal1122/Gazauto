<?php // скачка файла с проверкой прав
    /* header('Access-Control-Allow-Origin: *'); */
    /* $file = "../files/116/evil-plan-baby.jpg"; */
   /*  $file = "./config.php";   */

    $fsize = filesize($filePathForDownload);

    Header("HTTP/1.1 200 OK");
    Header("Connection: close");
    Header("Content-Type: application/octet-stream");
    Header("Accept-Ranges: bytes");
    Header("Content-Disposition: Attachment; filename=".$name);
    Header("Content-Length: ".$fsize);

    // Открыть файл для чтения и отдавать его частями
    $f = fopen($filePathForDownload, 'r');
    while (!feof($f)) 
    {
        if (connection_aborted()) // Если соединение оборвано, то остановить скрипт
        {
            fclose($f);
            break;
        }
        echo fread($f, 10000);
        usleep(400000); // Пазуа в 0.4 секунду. Скорость отдачи 40000 байт/сек
    }
    fclose($f);
?>				